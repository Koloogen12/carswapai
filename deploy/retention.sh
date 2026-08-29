#!/usr/bin/env bash
# CarSwap AI · уничтожение персональных данных по истечении срока хранения.
#
# Второй шаг механизма, описанного в app/db/migrations/007_retention.sql.
# База умеет находить просроченное, стирать строки и складывать пути файлов
# в очередь app.file_erasures. Она не умеет одного — удалять файлы с диска.
# Этим занимается этот скрипт.
#
# ПОРЯДОК ДЕЙСТВИЙ И ПОЧЕМУ ИМЕННО ТАКОЙ
#
#   1. app.expire_personal_data(batch) — порциями, пока не вернёт пусто.
#      Внутри одной транзакции: строка с ПД стирается или обезличивается,
#      путь файла кладётся в очередь, в audit_log ложится запись.
#   2. app.claim_file_erasures(...) — забрать пометки, удалить файлы,
#      app.finish_file_erasure(...) — закрыть пометку и записать в журнал.
#
# Обрыв между шагами оставляет систему в состоянии «строки ПД уже нет,
# файл ещё лежит, пометка жива»: следующий запуск доделает. Обратный
# порядок (сначала файл) оставил бы запись в базе, ссылающуюся в пустоту, —
# тихую порчу, которую никто не найдёт. Пропавший файл считается успехом:
# цель в том, чтобы файла не было, а не в том, чтобы удалили именно мы.
#
# ПОЧЕМУ ОТДЕЛЬНЫЙ КОНТЕЙНЕР, А НЕ CRON ВНУТРИ ПРИЛОЖЕНИЯ
#
#   · Контейнер приложения — то, что масштабируется горизонтально. Cron
#     внутри него означает N параллельных проходов на N копиях; они не
#     испортят данные (skip locked и advisory-блокировка разведут их),
#     но будут греть базу впустую и путать журнал.
#   · Cron внутри контейнера приложения умирает при каждом обновлении
#     образа и не оставляет следа. Обязанность по 152-ФЗ не должна
#     зависеть от того, заметил ли кто-то, что задание перестало ходить.
#   · Cron на хосте (как у backup.sh) — рабочий вариант, но требует
#     ручной строчки в crontab на каждом сервере. Список «что осталось
#     сделать руками» в README и так длинный, и уничтожение ПД —
#     последнее, что стоит в него добавлять.
#
# Поэтому это отдельный сервис compose, который поднимается вместе со
# стеком и сам выдерживает интервал. Одна копия по построению.
#
# Запуск руками (на сервере, из каталога deploy):
#   docker compose run --rm retention --once     один проход и выйти
#   docker compose logs -f retention             что делает постоянный
#
# Локально, без docker:
#   PGHOST=127.0.0.1 PGUSER=carswap_app PGPASSWORD=... PGDATABASE=carswap \
#   STORAGE_ROOT=/var/lib/carswap/storage ./retention.sh --once

set -euo pipefail

STORAGE_ROOT="${STORAGE_ROOT:-/var/lib/carswap/storage}"
# Публичный префикс, под которым прокси отдаёт хранилище (nginx location
# /storage/ → alias /var/lib/carswap/storage/). Пути в базе записаны в этом
# виде, и сопоставление «путь в базе → файл на диске» живёт здесь.
STORAGE_PREFIX="${STORAGE_PREFIX:-/storage/}"
BATCH="${RETENTION_BATCH:-500}"
INTERVAL="${RETENTION_INTERVAL:-3600}"
DRY_RUN="${RETENTION_DRY_RUN:-0}"
WORKER="${HOSTNAME:-retention}-$$"
ONCE=0

case "${1:-}" in
  '')        ;;
  --once)    ONCE=1 ;;
  --dry-run) ONCE=1; DRY_RUN=1 ;;
  -h|--help) sed -n '2,45p' "$0" | sed 's/^#\{1,\} \{0,1\}//'; exit 0 ;;
  *) echo "retention.sh: неизвестный аргумент «$1». См. --help" >&2; exit 2 ;;
esac

: "${PGDATABASE:=carswap}"
export PGDATABASE
# Пароль берётся из PGPASSWORD в окружении, а не из строки подключения:
# аргументы psql видны в `ps`, окружение процесса — нет.

log() { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

q() { psql -X -q -A -t -v ON_ERROR_STOP=1 "$@"; }

# ── шаг 1: найти просроченное и стереть его в базе ────────────────────────
sweep_database() {
  local pass=0 out total=0
  # Порциями, пока функция не вернёт пусто. Ограничение на число проходов —
  # защита от бесконечного цикла, если что-то в базе не даёт строке стереться:
  # лучше остановиться и оставить след в логе, чем крутиться сутки.
  while [ "$pass" -lt 200 ]; do
    pass=$((pass + 1))
    out="$(q -c "select entity || ': ' || affected from app.expire_personal_data($BATCH)")"
    if [ -z "$out" ]; then break; fi
    while IFS= read -r line; do
      if [ -n "$line" ]; then
        log "  стёрто · $line"
        total=$((total + 1))
      fi
    done <<< "$out"
  done
  if [ "$pass" -ge 200 ]; then
    log "  ВНИМАНИЕ: 200 проходов подряд возвращали работу — проверьте app.retention_status()"
  fi
  if [ "$total" -eq 0 ]; then log "  в базе просроченного нет"; fi
}

# ── шаг 2: удалить файлы с диска и закрыть пометки ────────────────────────
erase_files() {
  local claimed erased=0 skipped=0 failed=0
  claimed="$(mktemp)"

  q -F '|' -c "select erasure_id, erasure_point, erasure_path
                 from app.claim_file_erasures('$WORKER', $BATCH)" > "$claimed"

  if [ ! -s "$claimed" ]; then
    rm -f "$claimed"
    log "  файлов к удалению нет"
    return 0
  fi

  local id point path target note ok
  while IFS='|' read -r id point path; do
    if [ -z "$id" ]; then continue; fi
    note=''
    ok=true

    case "$path" in
      "$STORAGE_PREFIX"*)
        # Обход каталога наружу: путь пришёл из нашей же базы, но проверка
        # стоит здесь потому, что цена ошибки — rm вне хранилища.
        case "$path" in
          *..*) ok=false; note='подозрительный путь с .., файл не тронут' ;;
          *)
            target="$STORAGE_ROOT/${path#"$STORAGE_PREFIX"}"
            if [ "$DRY_RUN" = "1" ]; then
              log "  [сухой прогон] удалил бы $target"
              continue
            fi
            if rm -f -- "$target" 2>/dev/null; then
              # rm -f не жалуется на отсутствующий файл, и это верно:
              # цель достигнута в обоих случаях.
              erased=$((erased + 1))
            else
              ok=false; note='не удалось удалить файл с диска'
            fi ;;
        esac ;;
      *)
        # Ссылка на файл в хранилище мессенджера или на демонстрационный
        # файл, запечённый в образ. Ни то ни другое не лежит в нашем томе,
        # и удалить это мы не можем. Пометка закрывается с пояснением,
        # чтобы очередь не росла вечно, но след остаётся.
        ok=true
        note="путь вне тома хранилища ($path) — файла в контуре нет"
        skipped=$((skipped + 1)) ;;
    esac

    if [ "$ok" = false ]; then failed=$((failed + 1)); fi

    # Через stdin, а не через -c: psql не подставляет свои переменные
    # в строку -c. Подстановка нужна ради :'fpoint' и :'fnote' — они
    # экранируются psql как литералы, а не склеиваются в текст запроса.
    q -v fid="$id" -v fpoint="$point" -v fok="$ok" -v fnote="$note" > /dev/null <<'FINISH'
select app.finish_file_erasure(:fid, :'fpoint'::uuid, :fok, nullif(:'fnote',''));
FINISH
  done < "$claimed"
  rm -f "$claimed"

  log "  файлов удалено: $erased, вне контура: $skipped, с ошибкой: $failed"
  if [ "$failed" -gt 0 ]; then
    log "  ВНИМАНИЕ: пометки с ошибкой остались в очереди и будут взяты снова"
  fi
  return 0
}

status() {
  q -F ' / ' -c "select 'просроченных фото: ' || overdue_photos,
                        'клиентов к обезличиванию: ' || overdue_clients,
                        'файлов в очереди: ' || files_pending,
                        'файлов удалено всего: ' || files_erased
                   from app.retention_status()"
}

run_once() {
  log "── проход уничтожения ПД (порция $BATCH)"
  sweep_database
  erase_files
  log "  состояние: $(status)"
}

# Ожидание базы: сервис поднимается вместе со стеком и может стартовать
# раньше, чем Postgres начнёт принимать соединения.
until pg_isready -q 2>/dev/null; do
  log "жду базу…"
  sleep 5
done

if [ "$ONCE" = "1" ]; then
  run_once
  exit 0
fi

log "задание уничтожения ПД запущено, интервал ${INTERVAL} с, порция ${BATCH}"
while true; do
  # Падение одного прохода не должно убивать задание: следующий проход
  # доделает то, что не доделал этот.
  run_once || log "  проход завершился с ошибкой, повтор через ${INTERVAL} с"
  sleep "$INTERVAL"
done
