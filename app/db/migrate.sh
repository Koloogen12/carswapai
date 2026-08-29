#!/usr/bin/env bash
# CarSwap AI · накат миграций на любую базу одной командой.
#
# Идемпотентно: каждая миграция применяется ровно один раз. Учёт ведётся в
# таблице deploy.schema_migrations. Схема отдельная намеренно — служебная
# таблица не должна попадать в public, где 005_grants.sql раздаёт права
# app_tenant всем таблицам подряд.
#
# Вместе с записью хранится контрольная сумма файла. Если применённую
# миграцию потом отредактировали, следующий прогон это заметит и остановится:
# расхождение между репозиторием и базой нельзя пропускать молча — на живой
# базе оно означает, что схема не та, которую читает код.
#
# Каждая миграция едет в одной транзакции вместе со своей записью об учёте.
# Упала посередине — не осталось ни половины схемы, ни отметки о накате.
#
# Роль. Запускать под ролью-владельцем схемы (carswap_owner), не под
# superuser и не под app_tenant. Причина в 005_grants.sql: alter default
# privileges действует от имени того, кто его выполнил, поэтому владелец
# всех миграций должен быть один и тот же — иначе таблицы из будущих
# миграций молча останутся без прав арендатора.
#
# Использование:
#   DATABASE_URL=postgresql://... ./migrate.sh             накатить недостающие
#   DATABASE_URL=postgresql://... ./migrate.sh --status    что применено, что нет
#   DATABASE_URL=postgresql://... ./migrate.sh --dry-run   что будет накачено
#   DATABASE_URL=postgresql://... ./migrate.sh --baseline  пометить всё применённым,
#                                                          ничего не выполняя
#
# --baseline нужен ровно для одного случая: база, накаченная руками до
# появления этого скрипта (например дев-база на /tmp/cswdev). Проверьте
# глазами, что схема действительно соответствует файлам, и только потом.
#
# Пароль внутри DATABASE_URL виден в `ps` на общей машине. На сервере
# держите пароль в ~/.pgpass (chmod 600), а в URL оставляйте только хост,
# порт, базу и роль.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-$SCRIPT_DIR/migrations}"

# Произвольная, но стабильная пара ключей для advisory-блокировки: два
# одновременных деплоя не должны накатывать одно и то же.
LOCK_SQL='do $lock$ begin perform pg_advisory_xact_lock(4919, 1); end $lock$;'

MODE=apply
case "${1:-}" in
  '')          ;;
  --status)    MODE=status ;;
  --dry-run)   MODE=dryrun ;;
  --baseline)  MODE=baseline ;;
  -h|--help)   sed -n '2,44p' "$0" | sed 's/^#\{1,\} \{0,1\}//'; exit 0 ;;
  *)           echo "migrate.sh: неизвестный аргумент «$1». См. --help" >&2; exit 2 ;;
esac

# ── psql ──────────────────────────────────────────────────────────────────
if ! command -v psql >/dev/null 2>&1; then
  for d in /opt/homebrew/opt/postgresql@16/bin \
           /usr/local/opt/postgresql@16/bin \
           /usr/lib/postgresql/16/bin \
           /usr/pgsql-16/bin; do
    if [ -x "$d/psql" ]; then PATH="$d:$PATH"; break; fi
  done
fi
if ! command -v psql >/dev/null 2>&1; then
  echo "migrate.sh: psql не найден в PATH" >&2
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "migrate.sh: не задан DATABASE_URL" >&2
  echo "  пример: DATABASE_URL=postgresql://carswap_owner@127.0.0.1:5432/carswap ./migrate.sh" >&2
  exit 1
fi

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "migrate.sh: нет каталога миграций: $MIGRATIONS_DIR" >&2
  exit 1
fi

# -X — не читать ~/.psqlrc: чужие настройки не должны влиять на накат.
psql_run() { psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }
psql_val() { psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 -tA "$@"; }

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    openssl dgst -sha256 "$1" | awk '{print $NF}'
  fi
}

# ── список миграций, по возрастанию имени ─────────────────────────────────
FILES=""
for path in "$MIGRATIONS_DIR"/*.sql; do
  [ -e "$path" ] || continue
  FILES="$FILES$(basename "$path")
"
done
FILES="$(printf '%s' "$FILES" | LC_ALL=C sort)"

if [ -z "$FILES" ]; then
  echo "migrate.sh: в $MIGRATIONS_DIR нет ни одного .sql" >&2
  exit 1
fi

# Имена подставляются в SQL, поэтому набор символов ограничен явно.
while IFS= read -r f; do
  [ -n "$f" ] || continue
  case "$f" in
    *[!A-Za-z0-9._-]*)
      echo "migrate.sh: недопустимое имя файла миграции: «$f»" >&2
      exit 1 ;;
  esac
done <<EOF
$FILES
EOF

# ── журнал накатов ────────────────────────────────────────────────────────
psql_run <<'SQL'
set client_min_messages = warning;
create schema if not exists deploy;
create table if not exists deploy.schema_migrations (
  filename    text primary key,
  checksum    text not null,
  applied_at  timestamptz not null default now(),
  applied_by  text not null default current_user,
  duration_ms integer
);
comment on table deploy.schema_migrations is
  'Журнал применённых миграций. Ведётся app/db/migrate.sh, руками не правится.';
SQL

APPLIED="$(psql_val -F $'\t' -c \
  "select filename, checksum from deploy.schema_migrations order by filename")"

applied_sum() {
  printf '%s\n' "$APPLIED" | awk -F'\t' -v f="$1" '$1 == f { print $2; exit }'
}

# ── что делать ────────────────────────────────────────────────────────────
PENDING=""
DRIFT=""
while IFS= read -r f; do
  [ -n "$f" ] || continue
  sum="$(sha256_of "$MIGRATIONS_DIR/$f")"
  was="$(applied_sum "$f")"
  if [ -z "$was" ]; then
    PENDING="$PENDING$f
"
  elif [ "$was" != "$sum" ]; then
    DRIFT="$DRIFT$f
"
  fi
done <<EOF
$FILES
EOF

if [ -n "$DRIFT" ] && [ "$MODE" != "status" ]; then
  echo "migrate.sh: применённые миграции изменились после наката:" >&2
  printf '%s' "$DRIFT" | sed 's/^/  /' >&2
  echo "" >&2
  echo "  База и репозиторий разошлись. Так не чинят: правку оформляют" >&2
  echo "  новой миграцией. Если файл изменили осознанно и база уже" >&2
  echo "  соответствует — обновите контрольную сумму в журнале руками." >&2
  exit 1
fi

case "$MODE" in
  status)
    echo "миграции: $MIGRATIONS_DIR"
    echo "база:     $(psql_val -c 'select current_database()') / роль $(psql_val -c 'select current_user')"
    echo ""
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      sum="$(sha256_of "$MIGRATIONS_DIR/$f")"
      was="$(applied_sum "$f")"
      if   [ -z "$was" ];         then mark="—  не применена"
      elif [ "$was" != "$sum" ];  then mark="!  изменена после наката"
      else                             mark="ok применена"
      fi
      printf '  %-8s %s\n' "$mark" "$f"
    done <<EOF
$FILES
EOF
    exit 0
    ;;

  dryrun)
    if [ -z "$PENDING" ]; then
      echo "нечего накатывать: все миграции уже применены"
    else
      echo "будут накачены:"
      printf '%s' "$PENDING" | sed 's/^/  /'
    fi
    exit 0
    ;;

  baseline)
    if [ -z "$PENDING" ]; then
      echo "нечего размечать: журнал уже полон"
      exit 0
    fi
    echo "разметка без выполнения (--baseline):"
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      sum="$(sha256_of "$MIGRATIONS_DIR/$f")"
      psql_run -c "insert into deploy.schema_migrations (filename, checksum, duration_ms)
                   values ('$f', '$sum', 0)
                   on conflict (filename) do nothing"
      echo "  отмечена $f"
    done <<EOF
$PENDING
EOF
    exit 0
    ;;
esac

# ── накат ─────────────────────────────────────────────────────────────────
if [ -z "$PENDING" ]; then
  echo "нечего накатывать: все миграции уже применены"
  exit 0
fi

COUNT=0
while IFS= read -r f; do
  [ -n "$f" ] || continue
  sum="$(sha256_of "$MIGRATIONS_DIR/$f")"
  printf '  накат %s ... ' "$f"

  # Всё в одной транзакции: блокировка, тело миграции, запись в журнал.
  # Запись без on conflict намеренно: если параллельный прогон успел
  # накатить эту же миграцию, insert упадёт и транзакция откатится —
  # лучше громкая ошибка, чем тихий двойной накат.
  if psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 --single-transaction \
       -c "$LOCK_SQL" \
       -f "$MIGRATIONS_DIR/$f" \
       -c "insert into deploy.schema_migrations (filename, checksum, duration_ms)
           values ('$f', '$sum',
                   (extract(epoch from clock_timestamp() - transaction_timestamp()) * 1000)::int)"
  then
    echo "ok"
    COUNT=$((COUNT + 1))
  else
    echo "ПРОВАЛ"
    echo "migrate.sh: миграция $f не применена, изменения откачены" >&2
    echo "  Частая причина на свежем сервере — прав роли не хватает на то," >&2
    echo "  что делает миграция (создание роли, расширения). Разбор в" >&2
    echo "  deploy/README.md, раздел «Роли в базе»." >&2
    exit 1
  fi
done <<EOF
$PENDING
EOF

echo "накачено миграций: $COUNT"
