'use server';
/**
 * Подключение каналов точки.
 *
 * ЧЕТВЁРТЫЙ ШАГ ЗАПУСКА. Точка платит → получает доступ → заводит
 * сотрудников → подключает аккаунты соцсетей → начинает работу. Четвёртого
 * шага не существовало: каналы жили только в посевных данных. Без него в
 * продукт не приходит ни одного обращения, то есть запускать у клиента
 * нечего.
 *
 * ЧТО ЗДЕСЬ ВАЖНО И ПОЧЕМУ ИМЕННО ТАК:
 *
 *   · КЛЮЧИ ШЛЮЗОВ В ФОРМУ НЕ ВВОДЯТСЯ. У действий подключения нет и не
 *     может быть параметра под секрет: ключи берутся из переменных окружения
 *     (src/lib/adapters/impl/transport.ts), а в базу кладётся только внешний
 *     идентификатор канала — GUID канала у Wazzup, номер аккаунта продавца
 *     у Авито. Это не секрет: он и так приходит в каждом вебхуке. Форма,
 *     принимающая ключ, рано или поздно кладёт его в базу, в журнал и в
 *     резервную копию; поэтому её здесь нет вовсе, а не «нет пока».
 *
 *   · ВОЗМОЖНОСТИ КАНАЛА БЕРУТСЯ У АДАПТЕРА. capabilities() уже знает, что
 *     WhatsApp Business API не пишет первым, а личный номер пишет, и что
 *     Авито не принимает ссылки. Переписать это в интерфейсе руками значит
 *     завести второй источник правды, который разойдётся с первым и соврёт
 *     менеджеру. Ни одно ограничение ниже не написано словами — все читаются
 *     из capabilities().
 *
 *   · СОСТОЯНИЕ СВЯЗИ СПРАШИВАЕТСЯ У ШЛЮЗА И ЗАПОМИНАЕТСЯ. health() ходит
 *     в сеть, поэтому дёргать его на каждой отрисовке нельзя: экран запуска
 *     точки не должен зависеть от того, отвечает ли сейчас Wazzup. Спросили
 *     при подключении и по кнопке «Проверить связь» — записали результат
 *     вместе с подсказкой, что чинить, и отметкой времени.
 *
 *   · ПОДКЛЮЧАЕТ И ОТКЛЮЧАЕТ ТОЛЬКО ВЛАДЕЛЕЦ, и проверка стоит на сервере
 *     (requireOwner) и в базе (ограничительные политики из миграции 018).
 *     Спрятанная кнопка не закрывает ничего: запрос мимо интерфейса её
 *     не видит.
 */
import { revalidatePath } from 'next/cache';
import { withTenant, type Claims } from './db';
import { requireOwner, requireUser } from './session';
import { PROVIDER_SLUGS, plugFor } from './adapters/impl/registry';
import { createWazzupAdapter, type WazzupTransport } from './adapters/impl/wazzup';
import { createAvitoAdapter } from './adapters/impl/avito';
import type { ChannelAdapter, ChannelCapabilities, ChannelKind } from './adapters/channel';

/** Состояние привязки. Отдельное «нужна повторная привязка» — не украшение:
 *  точка меняет номер WhatsApp чаще, чем кажется, и «отвалился» лечится
 *  иначе, чем «отключили сами». */
export type ChannelStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export type ChannelView = {
  id: string;
  kind: ChannelKind;
  provider: string;
  /** Сегмент вебхука из реестра. null — провайдера в реестре нет. */
  slug: string | null;
  externalId: string;
  transport: WazzupTransport | null;
  status: ChannelStatus;
  lastError: string | null;
  fixHint: string | null;
  checkedAt: string | null;
  /** Из capabilities() адаптера. null — адаптера для провайдера нет. */
  caps: ChannelCapabilities | null;
  title: string;
  badge: string;
  badgeBg: string;
  /** Имена переменных окружения, где лежат ключи. Только имена. */
  envNames: string[];
  /** Все ли они заданы. Значения наружу не отдаются никогда. */
  envReady: boolean;
};

/** Что владелец может подключить. Собирается из реестра провайдеров. */
export type ChannelOffer = {
  slug: string;
  kind: ChannelKind;
  transport: WazzupTransport | null;
  title: string;
  badge: string;
  badgeBg: string;
  /** Что человек вводит: идентификатор канала, а не ключ. */
  idLabel: string;
  idExample: string;
  /** Сколько шагов и где их делать — из макета: «два шага · около двух минут». */
  note: string;
  caps: ChannelCapabilities;
  envNames: string[];
  envReady: boolean;
  webhookPath: string;
};

export type ChannelsScreen = {
  channels: ChannelView[];
  offers: ChannelOffer[];
  /** Подключать и отключать может только владелец. Кнопки от остальных
   *  не прячутся — им объясняют; отказ всё равно даёт сервер. */
  canManage: boolean;
  connected: number;
  total: number;
};

export type ActionResult = { ok: true; note?: string } | { ok: false; error: string };

/* ── Словарь каналов ─────────────────────────────────────────────────────
 * Здесь только то, что нельзя вывести из кода: как канал называется
 * по-русски, каким кружком он нарисован в макете и как называется поле,
 * которое человек вводит. Всё остальное — возможности, провайдер, адрес
 * вебхука — берётся из реестра и адаптеров.
 */
type Sort = {
  slug: string; kind: ChannelKind; transport: WazzupTransport | null;
  title: string; badge: string; badgeBg: string;
  idLabel: string; idExample: string; note: string; envNames: string[];
};

const SORTS: readonly Sort[] = [
  {
    slug: 'wazzup', kind: 'whatsapp', transport: 'business_api',
    title: 'WhatsApp Business', badge: 'WA', badgeBg: '#25455B',
    idLabel: 'Идентификатор канала в кабинете Wazzup',
    idExample: '4f8a1c2e-9b31-4d77-a0c5-2e6f1b0a7d34',
    note: 'через шлюз, авторизация на нашей стороне',
    envNames: ['WAZZUP_API_KEY'],
  },
  {
    slug: 'wazzup', kind: 'whatsapp', transport: 'personal',
    title: 'WhatsApp · личный номер', badge: 'WA', badgeBg: '#25455B',
    idLabel: 'Идентификатор канала в кабинете Wazzup',
    idExample: '4f8a1c2e-9b31-4d77-a0c5-2e6f1b0a7d34',
    note: 'через шлюз, привязка по QR-коду',
    envNames: ['WAZZUP_API_KEY'],
  },
  {
    slug: 'wazzup', kind: 'telegram', transport: 'bot',
    title: 'Telegram · бот точки', badge: 'TG', badgeBg: '#3A6B8F',
    idLabel: 'Идентификатор канала в кабинете Wazzup',
    idExample: '7c21b0de-4a55-4f19-9c8e-11d3aa7b6e02',
    note: 'два шага · около двух минут, без третьих лиц',
    envNames: ['WAZZUP_API_KEY'],
  },
  {
    slug: 'wazzup', kind: 'telegram', transport: 'personal',
    title: 'Telegram · личный аккаунт', badge: 'TG', badgeBg: '#3A6B8F',
    idLabel: 'Идентификатор канала в кабинете Wazzup',
    idExample: '7c21b0de-4a55-4f19-9c8e-11d3aa7b6e02',
    note: 'два шага · около двух минут, без третьих лиц',
    envNames: ['WAZZUP_API_KEY'],
  },
  {
    slug: 'avito', kind: 'avito', transport: null,
    title: 'Avito', badge: 'AV', badgeBg: '#7A6A3F',
    idLabel: 'Идентификатор аккаунта продавца',
    idExample: '9042121',
    note: 'нужен доступ к Messenger API · включается в настройках Avito',
    envNames: ['AVITO_CLIENT_ID', 'AVITO_CLIENT_SECRET'],
  },
];

/** Канал вне реестра (посевной MAX через i2crm): показать честно, не соврав. */
const UNKNOWN: Pick<Sort, 'title' | 'badge' | 'badgeBg'> = {
  title: 'Канал вне реестра', badge: '··', badgeBg: '#9A9A9A',
};

const RU_KIND: Record<string, string> = {
  whatsapp: 'WhatsApp', telegram: 'Telegram', avito: 'Avito',
  max: 'MAX', web: 'Гараж',
};

/**
 * Адаптер для строки канала. Единственное место, где строка базы
 * превращается в объект с capabilities() и health(). Провайдер вне реестра
 * адаптера не получает — и тогда экран честно пишет, что возможности
 * неизвестны, вместо того чтобы выдумать их.
 */
function adapterFor(
  provider: string, kind: ChannelKind, externalId: string,
  transport: WazzupTransport | null,
): ChannelAdapter | null {
  if (provider === 'wazzup' && (kind === 'whatsapp' || kind === 'telegram')) {
    return createWazzupAdapter({
      kind, channelId: externalId,
      // Транспорт хранится в базе с миграции 018. Пусто у старых строк —
      // берём самый осторожный: «писать первым нельзя».
      transport: transport ?? (kind === 'whatsapp' ? 'business_api' : 'bot'),
    });
  }
  if (provider === 'avito_direct' && kind === 'avito') {
    return createAvitoAdapter({ userId: externalId });
  }
  return null;
}

/** Заданы ли переменные. Наружу уходит только «да/нет», никогда значение. */
function envReadyOf(names: readonly string[]): boolean {
  return names.every(n => (process.env[n] ?? '').trim() !== '');
}

function sortFor(kind: string, transport: string | null): Sort | null {
  return SORTS.find(s => s.kind === kind && s.transport === (transport ?? null))
    ?? SORTS.find(s => s.kind === kind)
    ?? null;
}

/* ── Чтение ──────────────────────────────────────────────────────────────── */

type Row = {
  id: string; kind: ChannelKind; provider: string; external_id: string;
  transport: WazzupTransport | null; status: string;
  last_error: string | null; fix_hint: string | null; checked_at: Date | null;
};

/**
 * Экран целиком: подключённые каналы и то, что можно подключить.
 *
 * Читать может любой сотрудник точки — менеджеру важно видеть, чего канал
 * не умеет, ДО того как он попробует. Менять — только владелец, и это
 * отдельная проверка в каждом действии.
 */
export async function channelsScreen(claims?: Claims): Promise<ChannelsScreen> {
  const who = claims ?? await requireUser();
  const rows = await withTenant(who, async c => {
    const r = await c.query<Row>(`
      select id, kind::text as kind, provider, external_id, transport, status,
             last_error, fix_hint, checked_at
        from channels
       order by case status when 'connected' then 0 else 1 end, kind`);
    return r.rows;
  });

  const channels: ChannelView[] = rows.map(r => {
    const sort = sortFor(r.kind, r.transport);
    const plug = PROVIDER_SLUGS.map(s => plugFor(s)).find(p => p?.dbProvider === r.provider);
    const adapter = adapterFor(r.provider, r.kind, r.external_id, r.transport);
    const envNames = sort?.envNames ?? [];
    return {
      id: r.id, kind: r.kind, provider: r.provider, slug: plug?.slug ?? null,
      externalId: r.external_id, transport: r.transport,
      status: (r.status as ChannelStatus) ?? 'pending',
      lastError: r.last_error, fixHint: r.fix_hint,
      checkedAt: r.checked_at ? r.checked_at.toISOString() : null,
      caps: adapter?.capabilities() ?? null,
      title: sort?.title ?? `${RU_KIND[r.kind] ?? r.kind} · ${UNKNOWN.title.toLowerCase()}`,
      badge: sort?.badge ?? UNKNOWN.badge,
      badgeBg: sort?.badgeBg ?? UNKNOWN.badgeBg,
      envNames, envReady: envNames.length > 0 && envReadyOf(envNames),
    };
  });

  // Предложение показывается, даже когда такой канал уже есть: точка держит
  // два номера WhatsApp чаще, чем кажется. Ограничение на дубликат — одно,
  // и оно в базе: один внешний идентификатор живёт ровно в одной точке.
  const offers: ChannelOffer[] = SORTS
    .filter(s => PROVIDER_SLUGS.includes(s.slug))
    .map(s => {
      // Идентификатор здесь подставной и никуда не уходит: возможности
      // зависят от вида канала и транспорта, а не от того, какой именно
      // аккаунт привязан. Спрашивать их до подключения — единственный
      // способ показать «первым писать нельзя» вовремя.
      const adapter = adapterFor(plugFor(s.slug)!.dbProvider, s.kind, 'предпросмотр', s.transport);
      return {
        slug: s.slug, kind: s.kind, transport: s.transport, title: s.title,
        badge: s.badge, badgeBg: s.badgeBg, idLabel: s.idLabel,
        idExample: s.idExample, note: s.note,
        // Возможности видны ДО подключения: менеджер узнаёт про запрет
        // писать первым от нас, а не от молчащего клиента.
        caps: adapter!.capabilities(),
        envNames: s.envNames, envReady: envReadyOf(s.envNames),
        webhookPath: `/api/webhooks/${s.slug}`,
      };
    });

  return {
    channels, offers,
    canManage: who.app_role === 'owner' || who.app_role === 'network_admin',
    connected: channels.filter(c => c.status === 'connected').length,
    total: channels.length,
  };
}

/* ── Действия. Все — только владелец, и это проверяется на сервере ───────── */

/**
 * Подключить канал.
 *
 * Принимает вид канала, транспорт и ВНЕШНИЙ ИДЕНТИФИКАТОР — и ничего больше.
 * Параметра под ключ у этой функции нет по построению: ключи живут в
 * окружении. Сразу после записи спрашиваем шлюз и сохраняем ответ вместе
 * с подсказкой, что чинить, — иначе «подключено» означало бы всего лишь
 * «строка добавилась».
 */
export async function connectChannel(
  slug: string, kind: string, transport: string | null, externalId: string,
): Promise<ActionResult> {
  const who = await guardOwner();
  if ('error' in who) return who;

  const plug = plugFor(slug);
  if (!plug) return bad(`Провайдер «${slug}» не заведён в реестре`);

  const sort = SORTS.find(s =>
    s.slug === slug && s.kind === kind && s.transport === (transport ?? null));
  if (!sort) return bad('Такого канала в списке нет');

  const id = cleanExternalId(externalId);
  if (!id) {
    return bad(
      'Идентификатор канала выглядит неправильно. Это GUID канала из кабинета ' +
      'шлюза или номер аккаунта продавца — не ключ доступа: ключи берутся ' +
      'из окружения и в форму не вводятся.');
  }

  const adapter = adapterFor(plug.dbProvider, sort.kind, id, sort.transport)!;
  const caps = adapter.capabilities();

  try {
    const channelId = await withTenant(who.claims, async c => {
      const r = await c.query<{ id: string }>(`
        insert into channels (point_id, kind, provider, external_id, transport,
                              can_send_images, can_initiate, status)
        values ($1,$2::channel_kind,$3,$4,$5,$6,$7,'pending')
        returning id`,
        // can_send_images и can_initiate — из capabilities(), а не из формы
        // и не из головы. Разошедшийся флаг хуже отсутствующего.
        [who.claims.point_id, sort.kind, plug.dbProvider, id, sort.transport,
         caps.images, caps.initiate]);
      return r.rows[0].id;
    });

    const note = await probe(who.claims, channelId, adapter);
    revalidatePath('/channels');
    return { ok: true, note };
  } catch (e) {
    return bad(explain(e));
  }
}

/**
 * Повторная привязка. Отдельное действие, а не «отключить и подключить»:
 * это ТА ЖЕ строка канала с новым идентификатором, поэтому вся переписка
 * остаётся в своих тредах. Новая строка увела бы историю клиента.
 */
export async function rebindChannel(id: string, externalId: string): Promise<ActionResult> {
  const who = await guardOwner();
  if ('error' in who) return who;

  const next = cleanExternalId(externalId);
  if (!next) return bad('Новый идентификатор канала выглядит неправильно');

  try {
    const row = await withTenant(who.claims, async c => {
      const r = await c.query<Row>(`
        update channels
           set external_id = $2, status = 'pending',
               last_error = null, fix_hint = null, checked_at = null
         where id = $1
        returning id, kind::text as kind, provider, external_id, transport, status,
                  last_error, fix_hint, checked_at`, [id, next]);
      return r.rows[0] ?? null;
    });
    if (!row) return bad(await whyNoRows(who.claims, id));

    const adapter = adapterFor(row.provider, row.kind, row.external_id, row.transport);
    const note = adapter ? await probe(who.claims, id, adapter) : undefined;
    revalidatePath('/channels');
    return { ok: true, note };
  } catch (e) {
    return bad(explain(e));
  }
}

/**
 * Проверить связь. Отдельная кнопка, потому что health() ходит в сеть:
 * дёргать его на каждой отрисовке значит поставить экран запуска точки
 * в зависимость от того, отвечает ли сейчас шлюз.
 */
export async function recheckChannel(id: string): Promise<ActionResult> {
  const who = await guardOwner();
  if ('error' in who) return who;

  try {
    const row = await withTenant(who.claims, async c => {
      const r = await c.query<Row>(`
        select id, kind::text as kind, provider, external_id, transport, status,
               last_error, fix_hint, checked_at
          from channels where id = $1`, [id]);
      return r.rows[0] ?? null;
    });
    if (!row) return bad('Канал не найден в этой точке');

    const adapter = adapterFor(row.provider, row.kind, row.external_id, row.transport);
    if (!adapter) {
      return bad(
        `Провайдера «${row.provider}» нет в реестре адаптеров — проверить связь нечем. ` +
        'Такой канал подключён вручную и живёт вне продукта.');
    }
    const note = await probe(who.claims, id, adapter);
    revalidatePath('/channels');
    return { ok: true, note };
  } catch (e) {
    return bad(explain(e));
  }
}

/**
 * Отключить канал.
 *
 * СМЕНА СОСТОЯНИЯ, А НЕ УДАЛЕНИЕ СТРОКИ. Диалоги ссылаются на канал; удалив
 * его, точка потеряла бы инбокс за компанию с каналом. Отключение — это
 * «сюда больше не пишем», а не «стереть переписку», и второго действия
 * в продукте нет.
 */
export async function disconnectChannel(id: string): Promise<ActionResult> {
  const who = await guardOwner();
  if ('error' in who) return who;

  try {
    const n = await withTenant(who.claims, async c => {
      const r = await c.query(`
        update channels
           set status = 'disconnected',
               last_error = 'Отключён владельцем точки',
               fix_hint = 'Включить обратно можно здесь же, переписка сохранена',
               checked_at = now()
         where id = $1`, [id]);
      return r.rowCount ?? 0;
    });
    // Ноль строк — это НЕ ошибка базы: RLS на update не бросает исключение,
    // она просто не показывает строку. Отличить «нельзя» от «нет такого»
    // может только отдельный вопрос, и без него человек получил бы
    // неправильный совет ровно в тот момент, когда он ему нужен.
    if (n === 0) return bad(await whyNoRows(who.claims, id));
    revalidatePath('/channels');
    return { ok: true, note: 'Канал отключён. Диалоги остались в инбоксе точки.' };
  } catch (e) {
    return bad(explain(e));
  }
}

/* ── Внутреннее ──────────────────────────────────────────────────────────── */

const DENIED =
  'Подключать и отключать каналы может только владелец точки. ' +
  'Проверка стоит в базе, а не в интерфейсе.';

/**
 * Спросить шлюз и записать ответ.
 *
 * Записывается и причина, и подсказка. «Не работает» без причины — это ровно
 * тот случай, ради которого точка звонит в управляющую компанию, а обещано
 * обратное: любой тупик решается внутри продукта.
 */
async function probe(claims: Claims, id: string, adapter: ChannelAdapter): Promise<string> {
  let state: { connected: boolean; reason?: string; fixHint?: string };
  try {
    state = await adapter.health();
  } catch (e) {
    state = { connected: false, reason: e instanceof Error ? e.message : String(e) };
  }
  await withTenant(claims, c => c.query(`
    update channels
       set status = $2, last_error = $3, fix_hint = $4, checked_at = now(),
           can_send_images = $5, can_initiate = $6
     where id = $1`,
    [id, state.connected ? 'connected' : 'error',
     state.reason ?? null, state.fixHint ?? null,
     adapter.capabilities().images, adapter.capabilities().initiate]));

  return state.connected
    ? 'Связь есть: шлюз отвечает и канал в рабочем состоянии.'
    : [state.reason, state.fixHint].filter(Boolean).join(' · ');
}

/** Владелец или админ сети. Проверка на сервере — до всякого запроса. */
async function guardOwner(): Promise<{ claims: Claims } | { ok: false; error: string }> {
  try {
    return { claims: await requireOwner() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : DENIED };
  }
}

function bad(error: string): ActionResult {
  return { ok: false, error };
}

/**
 * Почему изменение не задело ни одной строки. Чтение каналов открыто всем
 * сотрудникам точки, а запись — только владельцу; значит если строка видна,
 * но не поменялась, дело в правах, а если не видна — канала нет в этой точке.
 */
async function whyNoRows(claims: Claims, id: string): Promise<string> {
  const seen = await withTenant(claims, async c => {
    const r = await c.query('select 1 from channels where id = $1', [id]);
    return (r.rowCount ?? 0) > 0;
  });
  return seen ? DENIED : 'Канала с таким номером в этой точке нет';
}

/**
 * Внешний идентификатор канала: GUID у Wazzup, номер аккаунта у Авито.
 * Коридор нарочно узкий — не ради валидации, а чтобы промахнуться и вставить
 * сюда ключ доступа было нельзя: ключи длиннее и содержат символы, которых
 * здесь нет.
 */
function cleanExternalId(raw: string): string | null {
  const v = (raw ?? '').trim();
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{2,63}$/.test(v) ? v : null;
}

/** Отказ базы — человеку, а не кодом SQLSTATE. */
function explain(e: unknown): string {
  const err = e as { code?: string; constraint?: string; message?: string };
  if (err?.code === '23505') {
    return err.constraint === 'channels_provider_external'
      ? 'Этот канал уже подключён к другой точке. Один аккаунт шлюза принадлежит ' +
        'одной точке — иначе обращения поехали бы в чужой инбокс.'
      : 'Такой канал у точки уже подключён.';
  }
  if (err?.code === '42501') return DENIED;
  if (err?.code === '23514' && err.constraint === 'channels_credentials_ref_is_env_name') {
    return 'В базу можно записать только имя переменной окружения, а не сам ключ.';
  }
  return err?.message ?? 'Не удалось выполнить действие';
}
