/**
 * Общая обвязка для сетевых адаптеров: секреты из окружения, HTTP с таймаутом,
 * приведение отказа к DeliveryResult.
 *
 * Правило про секреты одно и без исключений: ключ живёт в переменной
 * окружения, в коде и в репозитории его нет. Здесь же — единственное место,
 * где отсутствие ключа превращается в внятную ошибку, а не в 401 из шлюза
 * через три недели после установки.
 *
 * Переменные окружения этот модуль сам не объявляет: их объявляют адаптеры,
 * каждый в шапке своего файла.
 */

import { timingSafeEqual } from 'node:crypto';
import type { DeliveryResult } from '../channel';

/** Обязательная переменная окружения. Пусто и «не задана» — одно и то же. */
export function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(
      `Не задана переменная окружения ${name}. ` +
      `Секреты каналов берутся только из окружения — в коде их нет и не будет.`,
    );
  }
  return v.trim();
}

/** Необязательная переменная: null вместо исключения. */
export function optional(name: string): string | null {
  const v = process.env[name];
  return v && v.trim() !== '' ? v.trim() : null;
}

export type HttpResult = { ok: boolean; status: number; body: unknown; text: string };

/**
 * HTTP c таймаутом. Шлюз, который «думает» минуту, не должен держать
 * обработчик: менеджер получит отказ и увидит его, а не будет ждать.
 */
export async function http(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<HttpResult> {
  const { timeoutMs = 15_000, ...rest } = init;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...rest, signal: ac.signal });
    const text = await res.text();
    let body: unknown = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    return { ok: res.ok, status: res.status, body, text };
  } finally {
    clearTimeout(timer);
  }
}

/** Ошибка отправки — это `failed` с текстом, а не исключение наружу. */
export function failed(error: string): DeliveryResult {
  return { state: 'failed', error };
}

export function describe(r: HttpResult): string {
  const snippet = r.text.length > 300 ? r.text.slice(0, 300) + '…' : r.text;
  return `HTTP ${r.status}${snippet ? ': ' + snippet : ''}`;
}

/** Строковое поле из неизвестного JSON без приведения всего тела к типу. */
export function str(source: unknown, ...path: string[]): string | undefined {
  let cur: unknown = source;
  for (const key of path) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return typeof cur === 'string' ? cur
    : typeof cur === 'number' ? String(cur)
    : undefined;
}

export function arr(source: unknown, key: string): unknown[] {
  if (typeof source !== 'object' || source === null) return [];
  const v = (source as Record<string, unknown>)[key];
  return Array.isArray(v) ? v : [];
}

export function bool(source: unknown, key: string): boolean {
  if (typeof source !== 'object' || source === null) return false;
  return (source as Record<string, unknown>)[key] === true;
}

/**
 * Общий секрет в заголовке. Это не подпись тела, но отсекает вызовы чужого
 * адреса. Только заголовок и никогда query-строка: в строке запроса секрет
 * оседает в логах прокси и в истории браузера.
 *
 * Если переменная не задана — проверка выключена. Это допустимо на локальной
 * разработке и недопустимо снаружи; поэтому причина возвращается даже при ok.
 */
export function sharedSecret(
  envName: string,
  headers: Headers,
  headerName = 'x-webhook-secret',
): { ok: boolean; reason?: string } {
  const expected = optional(envName);
  if (!expected) {
    return { ok: true, reason: `${envName} не задана: подлинность вебхука не проверяется` };
  }
  return same(headers.get(headerName) ?? '', expected)
    ? { ok: true }
    : { ok: false, reason: `неверный или отсутствующий заголовок ${headerName}` };
}

/**
 * Тот же секрет, но в заголовке Authorization: Bearer. Так проверяется
 * Wazzup: своей подписи тела у него нет, и единственное, что он предлагает, —
 * подставить наш же ключ в этот заголовок.
 */
export function bearerSecret(envName: string, headers: Headers): { ok: boolean; reason?: string } {
  const expected = optional(envName);
  if (!expected) {
    return { ok: true, reason: `${envName} не задана: подлинность вебхука не проверяется` };
  }
  const raw = headers.get('authorization') ?? '';
  const got = /^bearer\s+/i.test(raw) ? raw.replace(/^bearer\s+/i, '') : '';
  return same(got, expected)
    ? { ok: true }
    : { ok: false, reason: 'неверный или отсутствующий Authorization: Bearer' };
}

/** Сравнение за постоянное время: длина секрета не должна утекать по таймингу. */
function same(got: string, want: string): boolean {
  const a = Buffer.from(got, 'utf8');
  const b = Buffer.from(want, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
