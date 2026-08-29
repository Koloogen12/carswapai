import 'server-only';
/**
 * Сотрудники точки: завести, пригласить, отозвать.
 *
 * ЗАЧЕМ. Экран сотрудников был картинкой: «Добавить сотрудника», «Отправить
 * приглашение» и «Отозвать» — просто текст без единого поля и без единой
 * кнопки. Основатель описывает запуск у клиента так: точка платит, получает
 * доступ, заводит сотрудников, подключает каналы. Второй шаг не работал, то
 * есть продукт нельзя было запустить вообще.
 *
 * ГДЕ ЖИВУТ ПРАВА. Здесь стоит requireOwner(), но настоящая проверка не тут:
 * ограничительные политики миграции 016 не дают менеджеру ни завести
 * сотрудника, ни отозвать доступ, а владельцу — завести человека в чужую
 * точку. Проверка в коде нужна, чтобы показать человеку понятный отказ;
 * запрос мимо приложения её не увидит, и потому она не может быть
 * единственной.
 *
 * ЧТО ТАКОЕ ПРИГЛАШЕНИЕ. Человек заводится сразу — владелец должен видеть его
 * в списке и уметь отозвать доступ ещё до того, как тот перешёл по ссылке.
 * Приглашение это первый вход без пароля: одноразовая ссылка со сроком
 * (инвариант миграции 004). На экране обещано «Мастеру достаточно QR у поста:
 * откроет камерой, пароль не нужен» — значит секрет это сама ссылка, и ровно
 * поэтому она обязана быть одноразовой и срочной.
 */
import { createHash, randomBytes } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { requireOwner, Forbidden } from './session';
import { sys, withTenant } from './db';
import { normalizePhone } from './auth';

/**
 * Имя куки сессии. Повторено из auth.ts намеренно и с сожалением: там оно
 * приватная константа, а вход по приглашению обязан открыть ту же самую
 * сессию, что и вход по коду. Значение обязано совпадать с COOKIE в auth.ts.
 */
const COOKIE = 'csw_s';
const SESSION_DAYS = 30;

/** Сколько живёт приглашение. Неделя: за неё выходят из отпуска и смены. */
const INVITE_DAYS = 7;

export type StaffRole = 'manager' | 'master';

export type AddStaffResult =
  | { ok: true; code: string; link: string; qr: string[] }
  | { ok: false; error: string };

/**
 * Завести сотрудника и выписать ему приглашение.
 *
 * Роль ограничена менеджером и мастером: второго владельца точке из этого
 * экрана не заводят, а админа сети — тем более. Это не про интерфейс, а про
 * то, что владелец не должен уметь раздать себе подобных.
 */
export async function addStaff(input: {
  name: string; role: StaffRole; phone: string;
}): Promise<AddStaffResult> {
  let who;
  try {
    who = await requireOwner();
  } catch (e) {
    if (e instanceof Forbidden) return { ok: false, error: e.message };
    throw e;
  }

  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  if (name.length < 2) return { ok: false, error: 'Как зовут сотрудника?' };
  if (input.role !== 'manager' && input.role !== 'master') {
    return { ok: false, error: 'Роль — менеджер или мастер' };
  }
  if (phone.length !== 11) return { ok: false, error: 'Похоже, в номере опечатка' };

  const code = inviteCode();
  try {
    await withTenant(who, async c => {
      // Телефон хранится в том же виде, что и у остальных сотрудников:
      // с плюсом. Сравнение при входе идёт по нормализованному виду (015),
      // поэтому написание значения роли не играет.
      const u = await c.query<{ id: string }>(
        `insert into users (point_id, network_id, role, name, phone)
         values ($1,$2,$3,$4,$5) returning id`,
        [who.point_id, who.network_id, input.role, name, '+' + phone]);

      await c.query(
        `insert into invites (point_id, network_id, code, role, expires_at, user_id)
         values ($1,$2,$3,$4, now() + ($5 || ' days')::interval, $6)`,
        [who.point_id, who.network_id, code, input.role, String(INVITE_DAYS),
         u.rows[0].id]);
    });
  } catch (e) {
    const msg = (e as { code?: string; message: string });
    // 42501 — отказ политики. Он тут не «ошибка сервера», а ровно тот случай,
    // ради которого политика и написана: чужая точка или не владелец.
    if (msg.code === '42501') {
      return { ok: false, error: 'Сотрудников заводит владелец точки, и только в свою точку' };
    }
    if (msg.code === '23505') {
      return { ok: false, error: 'Не удалось выписать ссылку, попробуйте ещё раз' };
    }
    return { ok: false, error: msg.message };
  }

  const link = inviteLink(code);
  return { ok: true, code, link, qr: qrRows(link) };
}

/**
 * Отозвать или вернуть доступ.
 *
 * Отдельной правки сессий не делается и не нужно: app.session_claims читает
 * users.active при КАЖДОМ запросе (миграция 014), поэтому отзыв закрывает и
 * уже открытые сессии — сразу, а не после их истечения. Это и есть «один
 * клик», обещанный на экране.
 */
export async function setStaffActive(userId: string, active: boolean):
    Promise<{ ok: true } | { ok: false; error: string }> {
  let who;
  try {
    who = await requireOwner();
  } catch (e) {
    if (e instanceof Forbidden) return { ok: false, error: e.message };
    throw e;
  }
  if (userId === who.user_id) {
    return { ok: false, error: 'Себе доступ не отзывают: точка останется без владельца' };
  }
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return { ok: false, error: 'Неизвестный сотрудник' };

  return withTenant(who, async c => {
    const r = await c.query(
      `update users set active = $2 where id = $1 and point_id = $3`,
      [userId, active, who.point_id]);
    // Ноль строк это не «ничего не поменялось»: политика не показала строку
    // на изменение. Отвечать «готово» в этом случае — врать человеку.
    if (r.rowCount === 0) {
      return { ok: false as const, error: 'Этого сотрудника изменить нельзя' };
    }
    return { ok: true as const };
  });
}

/** Живые приглашения точки: кому выписаны и до какого числа. */
export async function pendingInvites(): Promise<Record<string, string>> {
  const who = await requireOwner();
  return withTenant(who, async c => {
    const { rows } = await c.query<{ user_id: string; code: string }>(
      `select user_id, code from invites
        where point_id = $1 and used_at is null and expires_at > now()
          and user_id is not null`,
      [who.point_id]);
    const out: Record<string, string> = {};
    for (const r of rows) out[r.user_id] = r.code;
    return out;
  });
}

// ─────────────────────────────────────────────────────────────
// Сторона приглашённого: экран /join
// ─────────────────────────────────────────────────────────────

export type InvitePreview = {
  kind: 'staff' | 'point';
  role: string;
  pointName: string | null;
  networkName: string | null;
  personName: string | null;
  expiresAt: string;
  state: 'ok' | 'used' | 'expired';
};

/**
 * Что за приглашение. Читается функцией с узкой претензией: политика видит
 * ровно одну строку — ту, чей неперебираемый код предъявлен. Тот же приём,
 * что у ссылки клиента: держатель кода не узнаёт ничего сверх того, что у
 * него уже есть.
 */
export async function invitePreview(code: string): Promise<InvitePreview | null> {
  if (!validCode(code)) return null;
  const rows = await sys<{
    kind: string; invite_role: string; point_name: string | null;
    network_name: string | null; person_name: string | null;
    expires_at: string; state: string;
  }>('select * from app.invite_preview($1)', [code]);
  const r = rows[0];
  if (!r) return null;
  return {
    kind: r.kind === 'point' ? 'point' : 'staff',
    role: r.invite_role,
    pointName: r.point_name,
    networkName: r.network_name,
    personName: r.person_name,
    expiresAt: r.expires_at,
    state: r.state as InvitePreview['state'],
  };
}

/**
 * Вход сотрудника по ссылке.
 *
 * Кода из SMS здесь нет по построению: секрет — сама ссылка. Поэтому она
 * гасится ДО выдачи сессии, и второй переход не даёт ничего.
 */
export async function redeemStaffInvite(code: string):
    Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validCode(code)) return { ok: false, error: 'Ссылка не похожа на приглашение' };
  let sid: string | null;
  try {
    const rows = await sys<{ sid: string | null }>(
      'select app.redeem_staff_invite($1) as sid', [code]);
    sid = rows[0]?.sid ?? null;
  } catch {
    // Одноразовость, срок и отзыв доступа приходят исключением из базы.
    // Разбирать их порознь наружу незачем: человеку нужна новая ссылка.
    return { ok: false, error: 'Ссылка уже использована или устарела. Попросите новую' };
  }
  if (!sid) return { ok: false, error: 'Ссылка не ведёт ни к какому приглашению' };
  setSession(sid);
  return { ok: true };
}

/**
 * Регистрация точки по приглашению сети.
 *
 * С-1 · без кода сети точка не заводится, и это условие управляющей компании
 * закрыто в базе, а не формой: функция app.redeem_network_invite гасит
 * приглашение в той же транзакции, в которой создаёт точку. Второй переход по
 * той же ссылке не оставляет ни точки, ни половины точки.
 */
export async function redeemNetworkInvite(input: {
  code: string; phone: string; sms: string;
  pointName: string; address: string; ownerName: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!validCode(input.code)) return { ok: false, error: 'Ссылка не похожа на приглашение' };
  const name = input.pointName.trim();
  const owner = input.ownerName.trim();
  if (name.length < 2) return { ok: false, error: 'Как называется точка?' };
  if (owner.length < 2) return { ok: false, error: 'Как вас зовут?' };
  if (normalizePhone(input.phone).length !== 11) {
    return { ok: false, error: 'Похоже, в номере опечатка' };
  }

  let sid: string | null;
  try {
    const rows = await sys<{ sid: string | null }>(
      `select app.redeem_network_invite($1,$2,$3,$4,$5,$6) as sid`,
      [input.code, input.phone, authCodeHash(input.phone, input.sms.trim()),
       name, input.address.trim(), owner]);
    sid = rows[0]?.sid ?? null;
  } catch {
    return { ok: false, error: 'Приглашение уже использовано или устарело' };
  }
  // Причину не детализируем ровно по той же причине, что и на входе: разница
  // между «код не тот» и «кода нет» — это способ перебирать чужие телефоны.
  if (!sid) return { ok: false, error: 'Код не подошёл или устарел' };
  setSession(sid);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
// Мелочи, на которых всё держится
// ─────────────────────────────────────────────────────────────

function setSession(sid: string): void {
  cookies().set(COOKIE, sid, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Хеш кода из SMS.
 *
 * ПОВТОРЕНО ИЗ auth.ts И ОБЯЗАНО С НИМ СОВПАДАТЬ. Там это приватная функция,
 * а регистрация точки не может пройти через verifyCode(): тот ищет
 * сотрудника, а сотрудник как раз и создаётся этим вызовом. Разъедутся —
 * никто не зарегистрирует точку, и ошибка будет выглядеть как «код не
 * подошёл».
 */
function authCodeHash(phone: string, code: string): string {
  const salt = process.env.AUTH_CODE_SALT ?? '';
  if (!salt && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_CODE_SALT не задан: без соли хеш кода бесполезен');
  }
  return createHash('sha256').update(`${salt}:${normalizePhone(phone)}:${code}`).digest('hex');
}

/**
 * Код приглашения. 80 бит из криптографического источника: он и есть пароль,
 * которого в продукте нет, поэтому перебирать его должно быть бессмысленно.
 * Алфавит без похожих знаков — код диктуют по телефону и переписывают с
 * экрана.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function inviteCode(): string {
  // Шестнадцать знаков алфавита по пять бит — 80 бит. Байт делится на 32
  // нацело, поэтому остаток по модулю не перекашивает распределение.
  const b = randomBytes(16);
  let out = '';
  for (let i = 0; i < b.length; i++) out += ALPHABET[b[i] % 32];
  return out.replace(/(.{4})(?=.)/g, '$1-');
}

function validCode(code: string): boolean {
  return /^[0-9A-Z-]{4,64}$/.test(code);
}

/**
 * Адрес приглашения. Берётся из запроса, а не из настройки: у разработки это
 * localhost:3000, у точки — её домен, и зашитое значение выдало бы мастеру
 * ссылку, которая у него не откроется.
 */
export function inviteLink(code: string): string {
  const h = headers();
  const origin = process.env.PUBLIC_ORIGIN
    ?? `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host') ?? 'localhost:3000'}`;
  return `${origin}/join?i=${encodeURIComponent(code)}`;
}

// ─────────────────────────────────────────────────────────────
// QR
// ─────────────────────────────────────────────────────────────
/**
 * На экране написано: «Мастеру достаточно QR у поста: откроет камерой».
 * Значит код обязан сканироваться. В макете на этом месте нарисован узор,
 * похожий на QR, — если оставить узор, надпись станет неправдой, а мастер у
 * поста будет водить камерой по картинке.
 *
 * Зависимости брать неоткуда: в продукте четыре пакета, и добавлять пятый
 * ради ста строк — плохой размен. Поэтому кодировщик здесь: байтовый режим,
 * уровень коррекции M, версии 1–10. Ссылки укладываются в версию 4–5.
 *
 * Правильность проверена сверкой матриц с эталонной реализацией: см.
 * заметку в отчёте. Ошибка в такой таблице не «косметика» — код просто не
 * читается, и заметить это можно только камерой.
 */

/** Число блоков и байт коррекции на блок, уровень M, версии 1..10. */
const EC_M: Array<{ blocks: number; ec: number; total: number }> = [
  { blocks: 1, ec: 10, total: 26 },   // v1
  { blocks: 1, ec: 16, total: 44 },
  { blocks: 1, ec: 26, total: 70 },
  { blocks: 2, ec: 18, total: 100 },
  { blocks: 2, ec: 24, total: 134 },
  { blocks: 4, ec: 16, total: 172 },
  { blocks: 4, ec: 18, total: 196 },
  { blocks: 4, ec: 22, total: 242 },
  { blocks: 5, ec: 22, total: 292 },
  { blocks: 5, ec: 26, total: 346 },  // v10
];

/** Центры совмещающих узоров по версиям (2..10). */
const ALIGN: number[][] = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

/**
 * Матрица QR строками из '0' и '1' — в таком виде её рисует экран.
 *
 * Пустой список означает «кода не будет»: ссылка длиннее версии 10. Кидать
 * исключение нельзя — сотрудник к этому моменту уже заведён, а приглашение
 * выписано, и падение действия оставило бы владельца без ссылки при живой
 * записи в базе. Экран в этом случае покажет саму ссылку, она работает.
 */
export function qrRows(text: string): string[] {
  try {
    return qrMatrix(text).map(row => row.map(v => (v ? '1' : '0')).join(''));
  } catch {
    return [];
  }
}

function qrMatrix(text: string): boolean[][] {
  const data = new TextEncoder().encode(text);

  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const spec = EC_M[v - 1];
    const capacity = spec.total - spec.blocks * spec.ec;
    const countBits = v < 10 ? 8 : 16;
    if (4 + countBits + data.length * 8 <= capacity * 8) { version = v; break; }
  }
  if (!version) throw new Error('Ссылка не помещается в QR версии 10');

  const spec = EC_M[version - 1];
  const dataWords = spec.total - spec.blocks * spec.ec;
  const countBits = version < 10 ? 8 : 16;

  // ── Битовый поток: режим, длина, данные, заполнитель ──
  const bits: number[] = [];
  const push = (value: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };
  push(0b0100, 4);
  push(data.length, countBits);
  for (const b of data) push(b, 8);
  for (let i = 0; i < 4 && bits.length < dataWords * 8; i++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const words: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    words.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  }
  for (let i = 0; words.length < dataWords; i++) words.push(i % 2 ? 0x11 : 0xec);

  // ── Разбиение на блоки и коррекция ──
  const short = Math.floor(dataWords / spec.blocks);
  const longs = dataWords % spec.blocks;               // блоков на байт длиннее
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let at = 0;
  for (let b = 0; b < spec.blocks; b++) {
    const len = short + (b >= spec.blocks - longs ? 1 : 0);
    const block = words.slice(at, at + len);
    at += len;
    dataBlocks.push(block);
    ecBlocks.push(reedSolomon(block, spec.ec));
  }

  // Чередование: сначала по байту из каждого блока данных, потом коррекция.
  const stream: number[] = [];
  for (let i = 0; i < short + (longs ? 1 : 0); i++) {
    for (const b of dataBlocks) if (i < b.length) stream.push(b[i]);
  }
  for (let i = 0; i < spec.ec; i++) for (const b of ecBlocks) stream.push(b[i]);

  // ── Каркас ──
  const size = 17 + 4 * version;
  const grid: (boolean | null)[][] =
    Array.from({ length: size }, () => Array<boolean | null>(size).fill(null));
  const set = (r: number, c: number, v: boolean) => { grid[r][c] = v; };

  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) {
      const r1 = r0 + r, c1 = c0 + c;
      if (r1 < 0 || c1 < 0 || r1 >= size || c1 >= size) continue;
      const on = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                 (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                 (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      set(r1, c1, on);
    }
  };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }

  const alignCenters = ALIGN[version - 1];
  const alignLast = alignCenters.length ? alignCenters[alignCenters.length - 1] : 0;

  // Пропускаются РОВНО три пересечения с поисковыми узорами, а не «всё, что
  // уже занято». Разница видна с версии 7, где появляется средний ряд
  // совмещающих узоров: он ложится поверх линии синхронизации и совпадает с
  // ней модуль в модуль, а проверка «занято» выбрасывала его целиком — и вся
  // левая половина кода уезжала на пять модулей.
  for (const r of alignCenters) for (const c of alignCenters) {
    if ((r === 6 && c === 6) || (r === 6 && c === alignLast) ||
        (r === alignLast && c === 6)) continue;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
      set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }
  }

  set(size - 8, 8, true);                              // всегда тёмный модуль

  // Места под сведения о формате и версии заняты заранее, иначе данные
  // легли бы поверх них.
  const reserved: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    if (grid[8][i] === null) reserved.push([8, i]);
    if (grid[i][8] === null) reserved.push([i, 8]);
  }
  for (let i = 0; i < 8; i++) {
    if (grid[8][size - 1 - i] === null) reserved.push([8, size - 1 - i]);
    if (grid[size - 1 - i][8] === null) reserved.push([size - 1 - i, 8]);
  }
  for (const [r, c] of reserved) grid[r][c] = false;
  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      grid[size - 11 + c][r] = false;
      grid[r][size - 11 + c] = false;
    }
  }

  // ── Данные змейкой снизу справа ──
  let bit = 0;
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;                              // столбец синхронизации
    for (let i = 0; i < size; i++) {
      const row = up ? size - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (grid[row][c] !== null) continue;
        const byte = stream[bit >> 3] ?? 0;
        grid[row][c] = ((byte >> (7 - (bit & 7))) & 1) === 1;
        bit++;
      }
    }
    up = !up;
  }

  // ── Маска: перебираем восемь, берём наименее штрафную ──
  const base = grid.map(row => row.map(v => v === true));
  const fixed = fixedMask(size, version);
  let best: boolean[][] | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const m = base.map((row, r) => row.map((v, c) =>
      fixed[r][c] ? v : v !== maskAt(mask, r, c)));
    writeFormat(m, mask, size);
    if (version >= 7) writeVersion(m, version, size);
    const s = penalty(m);
    if (s < bestScore) { bestScore = s; best = m; }
  }
  return best!;
}

/** Модули, которых маска не касается: узоры, формат, версия. */
function fixedMask(size: number, version: number): boolean[][] {
  const f = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  const mark = (r: number, c: number) => {
    if (r >= 0 && c >= 0 && r < size && c < size) f[r][c] = true;
  };
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++) mark(r0 + r, c0 + c);
  };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 0; i < size; i++) { mark(6, i); mark(i, 6); }
  const centers = ALIGN[version - 1];
  const last = centers.length ? centers[centers.length - 1] : 0;
  for (const r of centers) for (const c of centers) {
    // Тот же список исключений, что и при рисовании. Разъедутся — маска
    // ляжет на узор или обойдёт данные, и код перестанет читаться.
    if ((r === 6 && c === 6) || (r === 6 && c === last) ||
        (r === last && c === 6)) continue;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) mark(r + dr, c + dc);
  }
  for (let i = 0; i <= 8; i++) { mark(8, i); mark(i, 8); }
  for (let i = 0; i < 8; i++) { mark(8, size - 1 - i); mark(size - 1 - i, 8); }
  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      mark(size - 11 + c, r); mark(r, size - 11 + c);
    }
  }
  return f;
}

function maskAt(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0: return (r + c) % 2 === 0;
    case 1: return r % 2 === 0;
    case 2: return c % 3 === 0;
    case 3: return (r + c) % 3 === 0;
    case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    default: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
  }
}

/**
 * Сведения о формате: уровень M (00) и номер маски, BCH(15,5), записанные
 * дважды — у левого верхнего и по разу у двух других поисковых узоров.
 *
 * Раскладка расписана поэтапно и не «симметрично»: обе копии лежат в строке 8
 * и столбце 8, и на глаз кажется, что их можно писать транспонированно. Так и
 * было сделано сначала — матрица отличалась от эталонной ровно на восемь
 * модулей, узор выглядел безупречно, и не читался ни один сканер.
 */
function writeFormat(m: boolean[][], mask: number, size: number): void {
  const v = (0b00 << 3) | mask;
  let d = v << 10;
  for (let i = 4; i >= 0; i--) if (d & (1 << (i + 10))) d ^= 0b10100110111 << i;
  const bits = ((v << 10) | d) ^ 0b101010000010010;
  for (let i = 0; i < 15; i++) {
    const on = ((bits >> i) & 1) === 1;
    // Столбец 8: младшие биты сверху, старшие — под левым нижним узором.
    if (i < 6) m[i][8] = on;
    else if (i < 8) m[i + 1][8] = on;
    else m[size - 15 + i][8] = on;
    // Строка 8: младшие биты справа, старшие — слева от верхнего узора.
    if (i < 8) m[8][size - 1 - i] = on;
    else if (i === 8) m[8][7] = on;
    else m[8][14 - i] = on;
  }
  m[size - 8][8] = true;                                // тёмный модуль
}

/** Сведения о версии для 7 и старше: 6 бит номера и 12 бит BCH. */
function writeVersion(m: boolean[][], version: number, size: number): void {
  let d = version << 12;
  for (let i = 5; i >= 0; i--) if (d & (1 << (i + 12))) d ^= 0b1111100100101 << i;
  const bits = (version << 12) | d;
  for (let i = 0; i < 18; i++) {
    const on = ((bits >> i) & 1) === 1;
    const r = Math.floor(i / 3), c = i % 3;
    m[size - 11 + c][r] = on;
    m[r][size - 11 + c] = on;
  }
}

/** Четыре штрафа стандарта: полосы, квадраты, ложные поисковые, перекос. */
function penalty(m: boolean[][]): number {
  const n = m.length;
  let score = 0;

  const line = (get: (i: number, j: number) => boolean) => {
    for (let i = 0; i < n; i++) {
      let run = 1;
      for (let j = 1; j < n; j++) {
        if (get(i, j) === get(i, j - 1)) run++;
        else { if (run >= 5) score += run - 2; run = 1; }
      }
      if (run >= 5) score += run - 2;
    }
  };
  line((i, j) => m[i][j]);
  line((i, j) => m[j][i]);

  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
    const v = m[r][c];
    if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
  }

  const PAT = [true, false, true, true, true, false, true, false, false, false, false];
  const RPAT = [false, false, false, false, true, false, true, true, true, false, true];
  const hit = (get: (k: number) => boolean, start: number) => {
    let a = true, b = true;
    for (let k = 0; k < 11; k++) {
      const v = get(start + k);
      if (v !== PAT[k]) a = false;
      if (v !== RPAT[k]) b = false;
    }
    return a || b;
  };
  for (let i = 0; i < n; i++) for (let j = 0; j + 11 <= n; j++) {
    if (hit(k => m[i][k], j)) score += 40;
    if (hit(k => m[k][i], j)) score += 40;
  }

  let dark = 0;
  for (const row of m) for (const v of row) if (v) dark++;
  const pct = (dark * 100) / (n * n);
  score += Math.floor(Math.abs(pct - 50) / 5) * 10;
  return score;
}

// ── Рид—Соломон над GF(256), примитивный многочлен 0x11d ──
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x; LOG[x] = i;
    x <<= 1; if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();

function mul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
}

function reedSolomon(data: number[], ecLen: number): number[] {
  let gen = [1];
  for (let i = 0; i < ecLen; i++) {
    const next = new Array<number>(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j];
      next[j + 1] ^= mul(gen[j], EXP[i]);
    }
    gen = next;
  }
  const rem = new Array<number>(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.shift(); rem.push(0);
    if (factor !== 0) {
      for (let j = 0; j < ecLen; j++) rem[j] ^= mul(gen[j + 1], factor);
    }
  }
  return rem;
}
