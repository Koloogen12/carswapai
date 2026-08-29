#!/usr/bin/env bash
# Свой блок в ОБЩЕМ Caddyfile. Только дописывает в конец, никогда не
# перезаписывает файл: в нём живут домены соседних продуктов вместе с их TLS.
set -euo pipefail
CF=/opt/caddy/Caddyfile
DOMAIN=${DOMAIN:-yoomp.io}

cp "$CF" "$CF.bak.$(date +%s)"

if ! grep -q "^${DOMAIN} {" "$CF" 2>/dev/null; then
  cat >> "$CF" <<BLOCK

${DOMAIN}, www.${DOMAIN} {
    encode zstd gzip
    # Приложение одно: Next.js отдаёт и страницы, и серверные действия, и
    # вебхуки каналов. Отдельного api-сервиса у продукта нет, поэтому
    # handle-блоков тоже нет — весь домен уходит в один контейнер.
    #
    # Имя контейнера полное, а не имя сервиса: compose вешает алиас, равный
    # имени сервиса, на КАЖДУЮ сеть. Два продукта с сервисом «app» дали бы в
    # edge один алиас на два контейнера, и Caddy раскидывал бы запросы между
    # чужими продуктами по кругу.
    reverse_proxy yoomp-app-1:3000
}
BLOCK
  echo "блок ${DOMAIN} добавлен"
else
  echo "блок ${DOMAIN} уже есть — не трогаю"
fi

# Проверка ДО перечитывания: ошибку видно раньше, чем она уедет в рабочий
# процесс. reload битый конфиг отвергает и оставляет работать прежний —
# в отличие от docker restart, который положил бы все домены сервера разом.
docker exec caddy-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker exec caddy-caddy-1 caddy reload  --config /etc/caddy/Caddyfile
echo "Caddy перечитал конфиг"
