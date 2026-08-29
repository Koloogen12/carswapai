/* Девять плёнок примерочной. Порядок совпадает с массивом FILMS из
 * design/design/landing.dc.html и с файлами wrap-01…09 в /public/renders.
 *
 * ВНИМАНИЕ: это демо-данные лендинга. В продукте прайс, наличие и цены
 * приходят от точки, а не отсюда. Нулевой элемент — исходный кузов
 * «как приехал», у него нет ни артикула, ни цены.
 */
export type Film = {
  img: string;
  name: string;
  short: string;
  sku: string;
  finish: string;
  price: string;
  cur: string;
  stock: string;
  hex: string;
};

export const FILMS: Film[] = [
  { img: '/renders/wrap-01-silver.jpg', name: 'Заводской серебристый', short: 'Как приехал', sku: 'фото клиента', finish: 'до оклейки', price: '—', cur: '', stock: 'ваш кузов', hex: '#B9BDC0' },
  { img: '/renders/wrap-02-satin-black.jpg', name: 'Сатин чёрный оникс', short: 'Чёрный оникс', sku: 'KPMF K75403', finish: 'сатин', price: '286 400', cur: '₽', stock: 'есть на складе', hex: '#191A1C' },
  { img: '/renders/wrap-06-anthracite.jpg', name: 'Матовый антрацит', short: 'Антрацит', sku: 'Oracal 970-070', finish: 'мат', price: '241 900', cur: '₽', stock: 'есть на складе', hex: '#43464A' },
  { img: '/renders/wrap-03-olive.jpg', name: 'Матовый хаки', short: 'Хаки', sku: 'Avery SW-900 682', finish: 'мат', price: '254 700', cur: '₽', stock: 'есть на складе', hex: '#6E6E4C' },
  { img: '/renders/wrap-04-lagoon.jpg', name: 'Сатин лагуна', short: 'Лагуна', sku: 'KPMF K75427', finish: 'сатин', price: '268 300', cur: '₽', stock: 'есть на складе', hex: '#1F6C80' },
  { img: '/renders/wrap-05-burgundy.jpg', name: 'Глянец бордо', short: 'Бордо', sku: 'Hexis HX20 375', finish: 'глянец', price: '259 100', cur: '₽', stock: 'есть на складе', hex: '#5E1622' },
  { img: '/renders/wrap-07-copper.jpg', name: 'Сатин медь', short: 'Медь', sku: 'Avery SW-900 810', finish: 'сатин-металлик', price: '297 500', cur: '₽', stock: '2 рулона', hex: '#B47C58' },
  { img: '/renders/wrap-08-acid.jpg', name: 'Глянец кислотный лайм', short: 'Кислотный лайм', sku: 'Oracal 970-616', finish: 'глянец', price: '243 800', cur: '₽', stock: 'под заказ', hex: '#CFE83A' },
  { img: '/renders/wrap-09-pearl.jpg', name: 'Сатин перламутр', short: 'Перламутр', sku: 'KPMF K75401', finish: 'сатин-перл', price: '274 900', cur: '₽', stock: 'есть на складе', hex: '#E7E3DA' },
];

/* Стартовое состояние примерочной — «Сатин лагуна», как в хендоффе. */
export const FILM_START = 4;

/* Два внешних флага страницы (в хендоффе — пропсы прототипа).
 *
 * showPilotBadge — плашка «Три точки-пилота уже в работе» в герое.
 *   Выключена: пилотов пока нет. Включить, когда появятся, — не раньше.
 * posterOnly — выключает видео героя и оставляет постер. Нужен для медленных
 *   сетей, печати и PDF-экспорта; сюда же уходит prefers-reduced-motion. */
export const showPilotBadge: boolean = false;
export const posterOnly: boolean = false;
