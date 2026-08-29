import 'server-only';
/**
 * Кто сейчас работает. Единственная дверь к личности пользователя.
 *
 * ЗАЧЕМ ОТДЕЛЬНЫЙ МОДУЛЬ. До этого каждый экран импортировал константу
 * MANAGER из data.ts — с комментарием «в проде придут из сессии». Сессии не
 * было, и проверено вживую: телефон, которого нет в базе, и произвольный код
 * открывали инбокс точки со всеми клиентами, телефонами и перепиской.
 *
 * Пока личность живёт константой в двадцати файлах, починить это нельзя —
 * правка задевает всё сразу. Поэтому здесь одна функция, и все экраны
 * спрашивают только её.
 *
 * ЧТО ОНА ГАРАНТИРУЕТ:
 *   · претензии берутся из подписанной сессии, а не из кода;
 *   · нет сессии — нет претензий, и вызывающий обязан отправить на вход;
 *   · роль и точка приходят из БАЗЫ по идентификатору пользователя, а не из
 *     куки: подделав куку, нельзя стать владельцем чужой точки.
 */
import { cache } from 'react';
import { cookies } from 'next/headers';
import type { Claims } from './db';
import { sessionClaims } from './auth';

/**
 * Претензии текущего пользователя или null, если он не вошёл.
 *
 * Экран, получивший null, обязан отправить на /login. Возвращать «гостя» с
 * какими-нибудь правами нельзя: именно так и появляются дыры, где посторонний
 * оказывается менеджером.
 */
/**
 * Ответ запоминается НА ВРЕМЯ ОДНОГО ЗАПРОСА.
 *
 * Без этого каждая страница спрашивала сессию по нескольку раз — шапка,
 * инбокс, бюджет, — и каждый вопрос открывал своё соединение с базой. Пул
 * кончался, и страницы начинали отдавать 500 с «sorry, too many clients».
 * Причём под нагрузкой, а не в разработке, что нашлось бы уже у клиента.
 *
 * cache() из React живёт ровно один запрос: следующий посетитель получит
 * свою проверку, а не чужую сессию из памяти.
 */
export const currentUser = cache(async (): Promise<Claims | null> => {
  const token = cookies().get('csw_s')?.value;
  if (!token) return null;
  return sessionClaims(token);
});

/**
 * То же, но для экранов, которые без пользователя не имеют смысла.
 * Бросает — вызывающий ловит и делает redirect('/login').
 */
export async function requireUser(): Promise<Claims> {
  const u = await currentUser();
  if (!u) throw new NotAuthenticated();
  return u;
}

export class NotAuthenticated extends Error {
  constructor() {
    super('Требуется вход');
    this.name = 'NotAuthenticated';
  }
}

/** Владелец точки или выше. Прайс, счета, сотрудники и отключения — только он. */
export async function requireOwner(): Promise<Claims> {
  const u = await requireUser();
  if (u.app_role !== 'owner' && u.app_role !== 'network_admin') {
    throw new Forbidden('Это может только владелец точки');
  }
  return u;
}

/**
 * Претензии для запроса к базе: явные, если переданы, иначе из сессии.
 *
 * Нужна ровно потому, что раньше все функции слоя данных имели вид
 * `claims = MANAGER` — и подставляли константу, если вызывающий ничего не
 * дал. Это и было дырой: любой запрос выполнялся от имени зашитого менеджера.
 * Теперь умолчания нет: нет сессии — нет запроса.
 */
export async function claimsFor(explicit?: Claims): Promise<Claims> {
  return explicit ?? requireUser();
}

export class Forbidden extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'Forbidden';
  }
}

/**
 * Кто и где — для шапки экрана.
 *
 * До этого имя, роль и название точки были вписаны в разметку каждой
 * страницы: «Ирина Ковалёва · Менеджер · JETCAR Мытищи». Владелец, войдя под
 * своим телефоном, видел в шапке чужое имя и чужую роль — и, что хуже,
 * поверил бы, что вошёл не он.
 */
export const whoAmI = cache(async (): Promise<{ user: string; role: string; point: string }> => {
  const { withTenant } = await import('./db');
  const who = await requireUser();
  return withTenant(who, async c => {
    const r = await c.query<{ name: string; role: string; point: string }>(
      `select u.name, u.role::text as role, coalesce(p.name, n.name) as point
         from users u
         left join points p on p.id = u.point_id
         join networks n on n.id = u.network_id
        where u.id = $1`, [who.user_id]);
    const row = r.rows[0];
    const RU: Record<string, string> = {
      manager: 'Менеджер', master: 'Мастер',
      owner: 'Владелец', network_admin: 'Сеть',
    };
    return {
      user: row?.name ?? '—',
      role: RU[row?.role ?? ''] ?? row?.role ?? '—',
      point: row?.point ?? '—',
    };
  });
});
