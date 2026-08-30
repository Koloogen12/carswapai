#!/usr/bin/env bash
# YOOMP · снятие копии базы и хранилища. Свой скрипт для своего продукта.
#
# ПОЧЕМУ ОТДЕЛЬНО ОТ ОБЩЕГО. Общий /opt/backups/dump-all.sh ищет базы
# фильтром `docker ps --filter ancestor=postgres`. Docker сверяет ссылку на
# образ ЦЕЛИКОМ, а `postgres` без тега означает `postgres:latest`. На машине
# работают postgres:16 и pgvector/pgvector:pg16, поэтому фильтр не совпадает
# ни с одним контейнером, и общий бэкап не снял ни одной базы ни разу — ни
# нашей, ни соседских. Правку общего скрипта решает владелец сервера: тихо
# менять чужой бэкап нельзя.
#
# Здесь берётся ровно своё: база yoomp и том с кадрами и рендерами.
# Ничего за пределами /opt/stacks/yoomp и /opt/backups/yoomp не трогается.
set -euo pipefail

DEST=/opt/backups/yoomp
KEEP_DAYS=${KEEP_DAYS:-14}
STAMP=$(date +%Y%m%d-%H%M%S)
DIR="$DEST/$STAMP"
install -d -m 700 "$DIR"

# База. pg_dumpall, а не pg_dump: роли carswap_owner и carswap_app живут в
# кластере, и база без них не поднимется на чистой машине.
docker exec yoomp-db-1 pg_dumpall -U postgres \
  | zstd -q -19 -o "$DIR/yoomp-db.sql.zst"

# Хранилище: кадры клиентов и готовые рендеры. Без него база ссылается на
# файлы, которых нет, и каждая примерка показывает пустоту.
docker run --rm \
  -v yoomp_storage:/data:ro -v "$DIR":/out \
  alpine:3 sh -c 'tar -C /data -cf - . | gzip -9 > /out/yoomp-storage.tar.gz'

# Пустой дамп — это не копия, а провалившийся pg_dumpall. Такой файл уезжает
# в хранилище и выглядит как настоящий, поэтому проверяем размер сразу.
SIZE=$(stat -c%s "$DIR/yoomp-db.sql.zst")
if [ "$SIZE" -lt 4096 ]; then
  echo "ПРОВАЛ: дамп базы $SIZE байт — это не копия" >&2
  exit 1
fi

find "$DEST" -maxdepth 1 -type d -name '20*' -mtime "+$KEEP_DAYS" -exec rm -rf {} +

echo "$STAMP · база $(numfmt --to=iec "$SIZE"), хранилище $(du -h "$DIR/yoomp-storage.tar.gz" | cut -f1)"
