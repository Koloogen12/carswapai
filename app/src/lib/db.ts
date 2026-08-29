import { Pool, type PoolClient } from 'pg';

/**
 * Подключение к Postgres.
 *
 * Каждый запрос идёт под ролью арендатора с выставленными претензиями:
 * изоляция точек держится RLS в базе, а не фильтром `where point_id = ...`
 * в коде приложения. Забыть фильтр можно, забыть RLS — нет.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ??
    'postgresql://postgres@/carswap?host=/tmp/cswdev&port=55432',
  max: 10,
});

export type Claims = {
  point_id?: string;
  network_id?: string;
  app_role: 'manager' | 'master' | 'owner' | 'network_admin' | 'anon'
          | 'client' | 'garage';
  user_id?: string;
  /** Ключ претензии держателя подписанной ссылки на сделку (роль `client`). */
  configuration_id?: string;
  /** Ключ претензии анонима в гараже-примерочной (роль `garage`). */
  session_id?: string;
};

/**
 * Публичная ссылка ведёт в никуда: конфигурации или точки с таким
 * идентификатором нет. Отдельный тип, чтобы страница показала 404,
 * а настоящая ошибка базы не была принята за «ссылка устарела».
 */
export class LinkNotFound extends Error {
  constructor(what: string) {
    super(`Ссылка не ведёт ни к чему: ${what}`);
    this.name = 'LinkNotFound';
  }
}

export async function withTenant<T>(claims: Claims, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('begin');
    await c.query('select set_config($1,$2,true)', ['request.jwt.claims', JSON.stringify(claims)]);
    await c.query('set local role app_tenant');
    const r = await fn(c);
    await c.query('commit');
    return r;
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/**
 * Клиент по подписанной ссылке. Он не сотрудник точки: под этой претензией
 * видна и изменяема ровно одна сделка — та, чей неперебираемый идентификатор
 * он открыл из мессенджера. Ни переписка, ни прайс, ни чужие наряды той же
 * точки под ней не видны, это держат ограничительные политики из миграции 006.
 *
 * Точку узнаём единственным разрешённым способом — узкой функцией-резолвером,
 * которая по идентификатору конфигурации отдаёт только её точку и ничего
 * больше. Вызывать её обязательно внутри транзакции: претензия ставится
 * транзакционно, иначе она осталась бы на соединении из пула.
 */
export async function withClient<T>(
  configId: string,
  fn: (c: PoolClient) => Promise<T>,
): Promise<T> {
  return withPublicLink(
    'select app.point_of_configuration($1) as point_id',
    configId,
    p => ({ app_role: 'client', point_id: p, configuration_id: configId }),
    `конфигурация ${configId}`,
    fn,
  );
}

/**
 * Аноним в гараже-примерочной. Конфигурации у него ещё нет и по построению
 * быть не может (Г-1: ноль полей до первой примерки), поэтому ключом
 * претензии служит не она, а точка по публичному слагу плюс анонимная
 * сессия — тот же субъект, что и в `consents.session_id`.
 */
export async function withGarage<T>(
  slug: string,
  fn: (c: PoolClient) => Promise<T>,
  sessionId?: string,
): Promise<T> {
  return withPublicLink(
    'select app.point_of_slug($1) as point_id',
    slug,
    p => ({ app_role: 'garage', point_id: p, session_id: sessionId }),
    `точка со слагом ${slug}`,
    fn,
  );
}

/** Строка канала, какой её видит приём вебхука. */
export type ResolvedChannel = {
  channel_id: string;
  point_id: string;
  network_id: string;
  kind: string;
  status: string;
};

/**
 * Приём вебхука. Арендатор здесь неизвестен по построению: снаружи приходят
 * только провайдер и внешний идентификатор канала, а точка живёт как раз в
 * той строке, которую надо прочитать.
 *
 * Раньше это шло через `sys()` без претензии. На боевой роли такой запрос
 * молча возвращал ноль строк — не исключение, а пустоту, — и весь входящий
 * поток уходил в `unrouted`. Тихо, без единой записи в журнале.
 *
 * Теперь точку отдаёт узкий резолвер `app.point_of_channel` (миграция 009).
 * Он раскрывает точку только по внешнему идентификатору, который у
 * вызывающего и так есть — он пришёл в вебхуке, — и потому не выдаёт ничего
 * сверх уже известного.
 *
 * Возвращает `null`, если канала нет: это законный исход (чужой или
 * отключённый канал), а не ошибка, и обрабатывать его надо как `unrouted`.
 */
export async function withChannel<T>(
  provider: string,
  externalId: string,
  kind: string,
  fn: (c: PoolClient, ch: ResolvedChannel) => Promise<T>,
): Promise<T | null> {
  const c = await pool.connect();
  try {
    await c.query('begin');
    const r = await c.query<ResolvedChannel>(
      'select * from app.point_of_channel($1,$2,$3)', [provider, externalId, kind]);
    const ch = r.rows[0];
    if (!ch) { await c.query('rollback'); return null; }
    await c.query('select set_config($1,$2,true)', ['request.jwt.claims',
      JSON.stringify({ app_role: 'manager', point_id: ch.point_id,
                       network_id: ch.network_id } satisfies Claims)]);
    await c.query('set local role app_tenant');
    const out = await fn(c, ch);
    await c.query('commit');
    return out;
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    await c.query("reset role; select set_config('request.jwt.claims','',false)")
      .catch(() => {});
    c.release();
  }
}

async function withPublicLink<T>(
  resolver: string,
  key: string,
  claimsOf: (pointId: string) => Claims,
  what: string,
  fn: (c: PoolClient) => Promise<T>,
): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('begin');
    const r = await c.query<{ point_id: string | null }>(resolver, [key]);
    const pointId = r.rows[0]?.point_id ?? null;
    if (!pointId) throw new LinkNotFound(what);
    await c.query('select set_config($1,$2,true)',
      ['request.jwt.claims', JSON.stringify(claimsOf(pointId))]);
    await c.query('set local role app_tenant');
    const out = await fn(c);
    await c.query('commit');
    return out;
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    // Претензия и роль транзакционные и снимаются коммитом, но соединение
    // уходит обратно в общий пул — снимаем их явно, чтобы следующий
    // арендатор ни при каком раскладе не унаследовал чужой контекст.
    await c.query("reset role; select set_config('request.jwt.claims','',false)")
      .catch(() => {});
    c.release();
  }
}

/* rls-free:begin — сверяется с pg_tables.rowsecurity тестом db/tests/client-link.sql */
/**
 * Таблицы, на которых НЕТ row level security: общий каталог, справочники
 * и служебный журнал вебхуков. Только их и разрешено трогать через `sys()`.
 *
 * Список обязан совпадать с `pg_tables.rowsecurity = false` в схеме public.
 * Сверку делает прогон `db/tests/client-link.sql` — он читает этот массив
 * прямо отсюда, поэтому список не может тихо протухнуть на следующей миграции.
 */
export const RLS_FREE_TABLES = [
  // Коды входа и сессии стоят вне RLS по построению: они нужны ДО того, как
  // арендатор известен, и политике не на что опереться. Закрыты они жёстче —
  // правами: `revoke all` в миграции 014 не даёт приложению читать их вовсе,
  // ни запросом, ни через sys(). Единственный путь — функции app.*.
  // В этом списке они значатся, чтобы сверка с базой сходилась, но обращение
  // к ним всё равно упрётся в отсутствие привилегий.
  'auth_codes',
  'sessions',
  'catalog_items',
  'network_prices',
  'networks',
  'typical_renders',
  'vehicle_models',
  'vehicle_zone_metrage',
  'webhook_events',
  'zones',
] as const;
/* rls-free:end */

const RLS_FREE = new Set<string>(RLS_FREE_TABLES);

/** Слова, которые синтаксически стоят на месте таблицы, но таблицей не являются. */
const NOT_A_TABLE = new Set(['lateral', 'only', 'select', 'values', 'unnest', 'generate_series']);

/** `from`/`join`/`into`/`update` + имя. Скобка вплотную после имени в
 *  `from`/`join` означает вызов функции (`from unnest(...)`), а не таблицу;
 *  в `insert into t (...)` скобка после имени — это список колонок, и там
 *  такое отсечение как раз пропустило бы запись в таблицу под RLS. */
// Схема `app` — это НАШИ функции, а не таблицы: `from app.session_claims($1)`
// не обращение к таблице `app`. Прежняя версия видела здесь имя `app` и
// роняла вход. Поэтому схема разбирается явно: `public.` отбрасывается как
// подразумеваемая, `app.` целиком пропускается как вызов функции.
const TABLE_REF =
  /\b(from|join|into|update)\s+(?:only\s+)?(?:(public|app)\s*\.\s*)?"?([a-z_][a-z0-9_$]*)"?(\()?/gi;

/**
 * `sys()` больше не грабли.
 *
 * Раньше через него ходили и в таблицы под RLS. Без претензии такие запросы
 * на боевой ролевой модели возвращают ноль строк и меняют ноль строк — молча.
 * Именно так был сломан весь клиентский путь. Теперь попытка отлавливается
 * здесь и падает громко.
 */
function assertRlsFree(sql: string): void {
  const bare = sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/'(?:[^']|'')*'/g, "''");
  const guarded = new Set<string>();
  for (const m of bare.matchAll(TABLE_REF)) {
    const kw = m[1].toLowerCase();
    const schema = (m[2] ?? '').toLowerCase();
    const name = m[3].toLowerCase();
    if (schema === 'app') continue;                    // вызов нашей функции
    if (m[4] === '(' && (kw === 'from' || kw === 'join')) continue;
    if (NOT_A_TABLE.has(name) || RLS_FREE.has(name)) continue;
    guarded.add(name);
  }
  if (guarded.size) {
    throw new Error(
      `sys() не ходит в таблицы под RLS: ${[...guarded].sort().join(', ')}. ` +
      'Без претензии арендатора такой запрос на боевой роли молча вернёт ноль строк. ' +
      'Возьмите withTenant() для сотрудника, withClient() для ссылки клиента ' +
      'или withGarage() для гаража-примерочной.',
    );
  }
}

/** Запросы вне арендатора: каталог, справочники, служебное. */
export async function sys<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  assertRlsFree(sql);
  const r = await pool.query(sql, params);
  return r.rows as T[];
}
