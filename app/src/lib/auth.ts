import 'server-only';
/**
 * Вход по одноразовому коду и сессии.
 *
 * ПОЧЕМУ НЕ ПАРОЛЬ. Решение продукта, оно же написано на экране входа:
 * «пароля в продукте нет». У точки с тремя сотрудниками пароль живёт на
 * стикере под клавиатурой, а телефон уже известен и уже проверен, когда
 * управляющая компания выдавала доступ после оплаты.
 *
 * ЧТО ЗДЕСЬ СДЕЛАНО ПРОТИВ ПЕРЕБОРА И ПОДДЕЛКИ:
 *   · код хранится хешем — утечка таблицы не даёт войти;
 *   · пять попыток, потом код мёртв: четырёхзначный перебирается за секунды;
 *   · код одноразовый и живёт десять минут;
 *   · в куке только идентификатор сессии. Роль и точка читаются из базы при
 *     каждом запросе, поэтому подделка куки не делает никого владельцем, а
 *     отзыв доступа уволенному действует немедленно, а не после сессии;
 *   · ответ при неудаче ОДИН и тот же, есть такой телефон или нет: по разнице
 *     в ответах перебирают базу сотрудников.
 */
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { sys, type Claims } from './db';
import { BRAND } from './domain';

const COOKIE = 'csw_s';

/**
 * Соль берётся из окружения. Без неё хеш кода — это хеш четырёх цифр, то есть
 * десять тысяч вариантов, которые перебираются мгновенно по утёкшей таблице.
 */
function codeHash(email: string, code: string): string {
  const salt = process.env.AUTH_CODE_SALT ?? '';
  if (!salt && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_CODE_SALT не задан: без соли хеш кода бесполезен');
  }
  return createHash('sha256').update(`${salt}:${normalizeEmail(email)}:${code}`).digest('hex');
}

/**
 * Та же нормализация, что и в базе (app.normalize_email): регистр и пробелы.
 * Хеш кода считается от неё, поэтому «Ivan@Mail.ru» и «ivan@mail.ru» — один
 * человек и при выдаче, и при проверке.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Достаточная для входа проверка формы: что-то@что-то.что-то. Строже — не наше дело. */
export function looksLikeEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

const CODE_TTL_HINT = 'Код действует десять минут';
const STAND_HINT = 'Это стенд: введите код стенда, его выдаёт тот, кто вас сюда пригласил';

type CodeRequest =
  | { ok: true; hint: string; devCode?: string }
  | { ok: false; error: string };

/**
 * Выдать код входа на почту.
 *
 * Ответ не различает «письмо ушло» и «такого адреса нет»: иначе форма входа
 * превращается в проверялку «работает ли у вас такой-то человек».
 */
export async function requestCode(rawEmail: string): Promise<CodeRequest> {
  const email = normalizeEmail(rawEmail);
  if (!looksLikeEmail(email)) {
    return { ok: false, error: 'Похоже, в адресе опечатка' };
  }

  // Код выдаётся ОДИН раз: значение решается до выдачи.
  const stand = process.env.AUTH_STAND_CODE;
  const mailer = !!process.env.RESEND_API_KEY;
  const standMode = process.env.NODE_ENV === 'production' && !mailer && !!stand;
  if (standMode && stand!.length < 8) {
    console.error('[вход] AUTH_STAND_CODE короче 8 знаков — отказ, подобрать такой можно');
    return { ok: false, error: 'Вход на стенде настроен неверно' };
  }
  const code = standMode ? stand! : String(randomInt(1000, 10000));
  await sys('select app.issue_auth_code($1, $2)', [email, codeHash(email, code)]);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[вход] код для ${email}: ${code}`);
    return { ok: true, hint: CODE_TTL_HINT, devCode: code };
  }
  // Код стенда: на экран не выводится никогда — адреса демо-точки лежат в
  // открытом репозитории. Без переменной и без почтового провайдера вход
  // честно падает, а не открывается всем.
  if (standMode) return { ok: true, hint: STAND_HINT };

  const sent = await sendMail(email, `Код входа ${BRAND}: ${code}`,
    `Ваш код входа в ${BRAND}: ${code}\n\nКод действует десять минут. ` +
    `Если вы не запрашивали вход — просто не обращайте внимания на это письмо.`);
  if (!sent) return { ok: false, error: 'Не удалось отправить письмо. Попробуйте ещё раз' };
  return { ok: true, hint: CODE_TTL_HINT };
}

/**
 * Письмо через Resend.
 *
 * Отправитель — MAIL_FROM, и домен в нём обязан быть подтверждён в Resend
 * записями DNS. Без подтверждения Resend отдаёт письма только на адрес
 * владельца аккаунта — снаружи это выглядит как «код не приходит».
 * Ключ и отправитель — только из окружения; в репозитории их нет.
 */
async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? `${BRAND} <login@yoomp.io>`;
  if (!key) {
    console.error('RESEND_API_KEY не задан — письмо не отправлено');
    return false;
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      // Тело ответа — в журнал: в нём Resend называет причину словами
      // («домен не подтверждён», «адрес отклонён»), и без неё отладка слепая.
      console.error(`Resend ответил ${r.status}: ${(await r.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Resend недоступен:', (e as Error).message);
    return false;
  }
}

export async function verifyCode(rawEmail: string, code: string):
    Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizeEmail(rawEmail);
  const rows = await sys<{ redeem_auth_code: string | null }>(
    'select app.redeem_auth_code($1, $2, $3, null) as redeem_auth_code',
    [email, codeHash(email, code.trim()), null]);
  const sid = rows[0]?.redeem_auth_code ?? null;
  if (!sid) return { ok: false, error: 'Код не подошёл или устарел' };

  cookies().set(COOKIE, sid, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === 'production',
  });
  return { ok: true };
}

/** Претензии по идентификатору сессии. Читаются из базы, не из куки. */
export async function sessionClaims(token: string): Promise<Claims | null> {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const rows = await sys<{ user_id: string; point_id: string | null;
                           network_id: string; app_role: string }>(
    'select * from app.session_claims($1)', [token]);
  const r = rows[0];
  if (!r) return null;
  return {
    app_role: r.app_role,
    point_id: r.point_id ?? undefined,
    network_id: r.network_id,
    user_id: r.user_id,
  } as Claims;
}

export async function signOut(): Promise<void> {
  const token = cookies().get(COOKIE)?.value;
  if (token && /^[0-9a-f-]{36}$/i.test(token)) {
    // Через функцию: прямого доступа к таблице сессий у приложения нет.
    await sys('select app.revoke_session($1)', [token]);
  }
  cookies().delete(COOKIE);
}
