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
  app_role: 'manager' | 'master' | 'owner' | 'network_admin' | 'anon';
  user_id?: string;
};

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

/** Запросы вне арендатора: каталог, справочники, служебное. */
export async function sys<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const r = await pool.query(sql, params);
  return r.rows as T[];
}
