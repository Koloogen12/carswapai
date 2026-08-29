#!/usr/bin/env bash
# CarSwap AI · резервная копия контура.
#
# Копируются ДВЕ вещи, и обе обязательны:
#
#   1. база Postgres    — подтверждения клиентов, конфигурации, наряды,
#                         согласия на обработку, аудит-лог;
#   2. том с фото       — исходные снимки машин и рендеры, на которые
#                         ссылаются storage_path в базе.
#
# Копия только базы бесполезна: карточка без картинок не показывает, что
# именно клиент подтвердил. Копия только хранилища бесполезна тоже: файл
# без записи в базе — это просто jpg без владельца, точки и срока хранения.
# Поэтому обе снимаются одним запуском и одной меткой времени.
#
# Почему это не рутина, а защита от переклейки — deploy/README.md,
# раздел «Резервные копии».
#
# Запуск на сервере из каталога deploy:
#   ./backup.sh                снять копию
#   ./backup.sh --check ФАЙЛ   проверить читаемость снятого дампа
#
# В cron: 0 3 * * * cd /srv/carswap/deploy && ./backup.sh >> /var/log/carswap-backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f .env ]; then set -a; . ./.env; set +a; fi

BACKUP_DIR="${BACKUP_DIR:-/var/backups/carswap}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
DB_NAME="${POSTGRES_DB:-carswap}"
DB_USER="${POSTGRES_SUPERUSER:-postgres}"
# Имя тома задано в docker-compose.yml явно. Переопределяется
# переменной только для прогона на тестовом контуре.
STORAGE_VOLUME="${STORAGE_VOLUME:-carswap_storage}"
STAMP="$(date +%Y%m%d-%H%M%S)"

compose() { docker compose "$@"; }

# ── проверка ранее снятого дампа ──────────────────────────────────────────
if [ "${1:-}" = "--check" ]; then
  DUMP="${2:?укажите файл дампа: ./backup.sh --check /var/backups/carswap/db-....dump}"
  echo "проверяю $DUMP"
  # pg_restore -l читает оглавление, не восстанавливая: битый или обрезанный
  # дамп здесь и вскроется. Копия, которую никто не пробовал прочитать, —
  # это не копия, а надежда.
  TOC=$(docker run --rm -v "$(cd "$(dirname "$DUMP")" && pwd)":/b:ro postgres:16-bookworm \
        pg_restore -l "/b/$(basename "$DUMP")")
  echo "оглавление читается, объектов: $(printf '%s\n' "$TOC" | grep -c '^[0-9]')"
  exit 0
fi

# ── куда пишем ────────────────────────────────────────────────────────────
# Копии не должны лежать внутри репозитория: в них персональные данные,
# им нечего делать рядом с git.
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
case "$BACKUP_DIR" in
  "$SCRIPT_DIR"|"$SCRIPT_DIR"/*|"$REPO_ROOT"|"$REPO_ROOT"/*)
    echo "backup.sh: BACKUP_DIR внутри каталога проекта — так копии с ПД" >&2
    echo "  однажды уедут в git. Задайте путь вне репозитория." >&2
    exit 1 ;;
esac

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

DB_FILE="$BACKUP_DIR/db-$STAMP.dump"
ST_FILE="$BACKUP_DIR/storage-$STAMP.tar.gz"
SUMS="$BACKUP_DIR/sha256-$STAMP.txt"

echo "── резервная копия $STAMP"

# ── база ──────────────────────────────────────────────────────────────────
# pg_dump выполняется ВНУТРИ контейнера базы: версия клиента гарантированно
# совпадает с версией сервера. Формат custom (-Fc) — восстанавливается
# выборочно и параллельно, в отличие от простого SQL.
# --no-owner и --no-privileges не ставим намеренно: роли и гранты — часть
# защиты (§13), и копия обязана уметь восстановить их вместе с данными.
if ! compose ps --status running --services 2>/dev/null | grep -qx db; then
  echo "backup.sh: контейнер db не запущен" >&2
  exit 1
fi

echo "  дамп базы $DB_NAME"
compose exec -T -e PGPASSWORD="${POSTGRES_SUPERUSER_PASSWORD:?не задан POSTGRES_SUPERUSER_PASSWORD}" \
  db pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc --compress=6 > "$DB_FILE"

# Пустой или подозрительно маленький дамп — это провал, а не копия.
DB_BYTES=$(wc -c < "$DB_FILE" | tr -d ' ')
if [ "$DB_BYTES" -lt 10240 ]; then
  echo "backup.sh: дамп базы всего $DB_BYTES байт — это не копия" >&2
  rm -f "$DB_FILE"
  exit 1
fi

# ── хранилище фото ────────────────────────────────────────────────────────
# Читаем том напрямую одноразовым контейнером: приложение при этом может
# работать. Фото иммутабельны — имя содержит sha256 содержимого, — поэтому
# файл, дописываемый во время снятия копии, здесь не встречается.
echo "  архив хранилища"
docker run --rm \
  -v "$STORAGE_VOLUME":/storage:ro \
  -v "$BACKUP_DIR":/out \
  --user 0:0 \
  alpine:3.20 \
  tar -C /storage -czf "/out/$(basename "$ST_FILE")" .

# ── контрольные суммы ─────────────────────────────────────────────────────
# Без них незаметная порча файла на диске обнаружится в момент, когда
# копия понадобится, — то есть слишком поздно.
( cd "$BACKUP_DIR" && sha256sum "$(basename "$DB_FILE")" "$(basename "$ST_FILE")" > "$(basename "$SUMS")" )
chmod 600 "$DB_FILE" "$ST_FILE" "$SUMS"

# ── проверка читаемости прямо сейчас ──────────────────────────────────────
echo "  проверка оглавления дампа"
docker run --rm -v "$BACKUP_DIR":/b:ro postgres:16-bookworm \
  pg_restore -l "/b/$(basename "$DB_FILE")" > /dev/null

# ── ротация ───────────────────────────────────────────────────────────────
# Локальная ротация — это защита от заполнения диска, а не хранение копий.
# Хранение — на отдельном ресурсе, см. README.
find "$BACKUP_DIR" -maxdepth 1 -type f \
     \( -name 'db-*.dump' -o -name 'storage-*.tar.gz' -o -name 'sha256-*.txt' \) \
     -mtime +"$KEEP_DAYS" -delete

printf '  база      %s (%s)\n' "$(basename "$DB_FILE")" "$(du -h "$DB_FILE" | cut -f1)"
printf '  хранилище %s (%s)\n' "$(basename "$ST_FILE")" "$(du -h "$ST_FILE" | cut -f1)"
echo "  готово, копии в $BACKUP_DIR (храним $KEEP_DAYS дней)"

# Напоминание, а не строчка для галочки: копия, лежащая на том же сервере,
# защищает от потери таблицы и от ошибки оператора, но не от потери сервера.
echo ""
echo "  Копия снята НА ТОТ ЖЕ сервер. Унесите её на отдельный ресурс —"
echo "  и только в РФ: в копии те же персональные данные, что в базе,"
echo "  и требование ст. 18 ч. 5 152-ФЗ на копии распространяется тоже."
