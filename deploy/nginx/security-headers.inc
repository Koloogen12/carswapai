# Заголовки безопасности. Вынесены в отдельный файл не для красоты:
# nginx НЕ наследует add_header из server в location, где есть свой
# add_header. Забыть подключить — значит тихо отдать часть путей без CSP,
# и заметить это только по факту утечки.
#
# Content-Security-Policy без единого внешнего источника — проверяемое
# исполнение обещания «внешних CDN в продукте нет»: шрифты Onest, рендеры
# и скрипты отдаются со своего контура. Появится в разметке чужой домен —
# страница сломается здесь, а не тихо уведёт трафик клиентов наружу.
#
# 'unsafe-inline' оставлен намеренно: App Router стримит разметку
# инлайновыми script- и style-блоками. Сузить до nonce можно только
# вместе с правкой приложения.

add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "same-origin" always;
add_header X-Frame-Options "DENY" always;
