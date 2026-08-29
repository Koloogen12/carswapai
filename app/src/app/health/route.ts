/**
 * Проба живости для Caddy и для проверки после выкатки.
 *
 * Отвечает 200, пока приложение отвечает вообще. Недоступность базы
 * возвращается ПОЛЕМ, а не кодом ошибки: иначе оркестратор начнёт
 * перезапускать исправное приложение по кругу, пока чинят Postgres, и
 * вместо честной ошибки на экране пользователь увидит пустоту.
 *
 * Никаких данных наружу: только «отвечаю» и «вижу базу». Счётчики точек,
 * клиентов и примерок — это уже разведка чужого бизнеса по открытому URL.
 */
import { NextResponse } from 'next/server';
import { sys } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let db = false;
  try {
    await sys('select 1');
    db = true;
  } catch {
    db = false;
  }
  return NextResponse.json({ ok: true, db }, { status: 200 });
}
