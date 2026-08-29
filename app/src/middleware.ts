/**
 * Страж входа.
 *
 * До него любой, знающий адрес, попадал в инбокс точки: личность бралась из
 * константы в коде. Проверено вживую — телефон, которого нет в базе, и
 * произвольный код открывали клиентов, их телефоны, переписку и выручку.
 *
 * ЧТО ЗДЕСЬ ЕСТЬ И ЧЕГО НЕТ. Здесь только вопрос «есть ли сессия»: сама
 * проверка сессии ходит в базу, а middleware в Next работает на границе и к
 * базе не ходит. Значит настоящая проверка живёт на странице
 * (`requireUser()`), а это — быстрый отсев, чтобы посторонний не долетал до
 * серверного кода вовсе.
 *
 * Публичные пути перечислены ЯВНО и списком разрешённого, а не запрещённого:
 * при добавлении нового экрана он по умолчанию закрыт, а не открыт. Обратный
 * порядок однажды откроет то, о чём забыли.
 */
import { NextResponse, type NextRequest } from 'next/server';

/** Открыто без входа — по смыслу, а не по недосмотру. */
const PUBLIC = [
  '/',                 // лендинг
  '/login',            // сам вход
  '/join',             // регистрация точки по приглашению сети
  '/g',                // гараж-примерочная: Г-1, ноль полей до первой примерки
  '/c',                // ссылка клиента: он не сотрудник и входа не имеет
  '/doc',              // печатные формы по подписанной ссылке
  '/api/webhooks',     // шлюзы каналов: их проверяет собственный секрет
];

const ASSETS = /^\/(_next|favicon|renders|fonts|images|.*\.(?:png|jpe?g|svg|ico|css|js|woff2?))/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (ASSETS.test(pathname)) return NextResponse.next();

  const open = PUBLIC.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (open) return NextResponse.next();

  if (req.cookies.get('csw_s')?.value) return NextResponse.next();

  // Куда шёл — запоминаем: после входа человек должен оказаться там, а не на
  // главной. Иначе менеджер, открывший ссылку на диалог, потеряет её.
  const to = req.nextUrl.clone();
  to.pathname = '/login';
  to.search = `?next=${encodeURIComponent(pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(to);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
