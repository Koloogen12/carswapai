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
const CODE_TTL_HINT = '10 минут';
const STAND_HINT = 'Это стенд: введите код стенда, его выдаёт тот, кто вас сюда пригласил';

/**
 * Соль берётся из окружения. Без неё хеш кода — это хеш четырёх цифр, то есть
 * десять тысяч вариантов, которые перебираются мгновенно по утёкшей таблице.
 */
function codeHash(phone: string, code: string): string {
  const salt = process.env.AUTH_CODE_SALT ?? '';
  if (!salt && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_CODE_SALT не задан: без соли хеш кода бесполезен');
  }
  return createHash('sha256').update(`${salt}:${normalizePhone(phone)}:${code}`).digest('hex');
}

/** Один и тот же номер приходит как +7…, 8…, с пробелами и скобками. */
export function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('8')) return '7' + d.slice(1);
  if (d.length === 10) return '7' + d;
  return d;
}

export type CodeRequest =
  | { ok: true; hint: string; devCode?: string }
  | { ok: false; error: string };

/**
 * Выдать код.
 *
 * Отвечаем одинаково, есть такой телефон в системе или нет. Иначе форма входа
 * превращается в проверялку «работает ли у вас такой-то человек».
 */
export async function requestCode(rawPhone: string): Promise<CodeRequest> {
  const phone = normalizePhone(rawPhone);
  if (phone.length !== 11) {
    return { ok: false, error: 'Похоже, в номере опечатка' };
  }
  // Код выдаётся ОДИН раз. Раньше случайный код выдавался всегда, а следом —
  // ещё и код стенда: две строки с одной секундой создания, и проверка брала
  // «последнюю» наугад. Значение решается до выдачи, выдача одна.
  const stand = process.env.AUTH_STAND_CODE;
  const gateway = process.env.SMS_GATEWAY_URL && process.env.SMS_GATEWAY_KEY;
  const standMode = process.env.NODE_ENV === 'production' && !gateway && !!stand;
  if (standMode && stand!.length < 8) {
    console.error('[вход] AUTH_STAND_CODE короче 8 знаков — отказ, подобрать такой можно');
    return { ok: false, error: 'Вход на стенде настроен неверно' };
  }
  const code = standMode ? stand! : String(randomInt(1000, 10000));
  await sys('select app.issue_auth_code($1, $2)', [phone, codeHash(phone, code)]);

  // Доставка. Провайдера SMS в контуре пока нет — и это честно названо:
  // в разработке код печатается в журнал, в бою отправка обязана быть
  // настроена, иначе войти не сможет никто.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[вход] код для +${phone}: ${code}`);
    return { ok: true, hint: CODE_TTL_HINT, devCode: code };
  }

  // Код стенда: на экран не выводится никогда — телефоны демо-точки лежат в
  // открытом репозитории, и показ кода означал бы вход для любого, кто их
  // прочитал. Код знает тот, кто держит секреты сервера. На боевом контуре
  // переменной быть не должно; без неё и без провайдера вход честно падает.
  if (standMode) return { ok: true, hint: STAND_HINT };

  const sent = await sendSms(phone, `Код входа ${BRAND}: ${code}`);
  if (!sent) return { ok: false, error: 'Не удалось отправить код. Попробуйте ещё раз' };
  return { ok: true, hint: CODE_TTL_HINT };
}

async function sendSms(phone: string, text: string): Promise<boolean> {
  const url = process.env.SMS_GATEWAY_URL;
  const key = process.env.SMS_GATEWAY_KEY;
  if (!url || !key) {
    console.error('SMS_GATEWAY_URL или SMS_GATEWAY_KEY не заданы — код не отправлен');
    return false;
  }
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ phone: `+${phone}`, text }),
      signal: AbortSignal.timeout(10_000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Проверить код и открыть сессию.
 *
 * Причину неудачи наружу не детализируем: «нет такого телефона», «код
 * протух» и «код неверный» снаружи выглядят одинаково.
 */
export async function verifyCode(rawPhone: string, code: string):
    Promise<{ ok: true } | { ok: false; error: string }> {
  const phone = normalizePhone(rawPhone);
  const rows = await sys<{ redeem_auth_code: string | null }>(
    'select app.redeem_auth_code($1, $2, $3, null) as redeem_auth_code',
    [phone, codeHash(phone, code.trim()), null]);
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
