#!/usr/bin/env bash
# YOOMP · выкатка на общий сервер Hetzner.
#
# Запускается НА СЕРВЕРЕ. Повторный запуск — обычный способ обновиться:
# секреты не перегенерируются, блок Caddy не дублируется, миграции идут по
# одному разу.
#
# Правило общей машины: ни одна команда здесь не выходит за пределы
# /opt/stacks/yoomp, /etc/yoomp и собственного блока в /opt/caddy/Caddyfile.
# Ни prune, ни --all, ни --remove-orphans, ни перезапуска Caddy.
set -euo pipefail

STACK=/opt/stacks/yoomp
SECRETS=/etc/yoomp/secrets.env
DOMAIN=${DOMAIN:-yoomp.io}
REPO=${REPO:-https://github.com/Koloogen12/carswapai.git}
BRANCH=${BRANCH:-main}

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }

# ── 1 · код ───────────────────────────────────────────────────────────────
say "1 · код"
install -d -m 755 "$STACK"
if [ -d "$STACK/.git" ]; then
  git -C "$STACK" fetch --depth 1 origin "$BRANCH"
  git -C "$STACK" reset --hard "origin/$BRANCH"
else
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$STACK"
fi
git -C "$STACK" log --oneline -1

# ── 2 · секреты ───────────────────────────────────────────────────────────
# set_if_absent: существующее значение не перезаписывается никогда.
# Перезапись JWT/AUTH_CODE_SALT разлогинивает всех, перезапись пароля
# Postgres при уже созданном томе ломает подключение, не меняя пароль в базе.
say "2 · секреты"
install -d -m 700 /etc/yoomp
touch "$SECRETS"; chmod 600 "$SECRETS"
set_if_absent() { grep -q "^$1=" "$SECRETS" || printf '%s=%s\n' "$1" "$2" >> "$SECRETS"; }
set_if_absent POSTGRES_PASSWORD "$(openssl rand -hex 24)"
set_if_absent OWNER_PASSWORD    "$(openssl rand -hex 24)"
set_if_absent APP_PASSWORD      "$(openssl rand -hex 24)"
set_if_absent AUTH_CODE_SALT    "$(openssl rand -hex 32)"
# Внешние ключи — заглушками, чтобы стек поднялся. Живые значения владелец
# подставляет отдельно: в репозитории и в этом скрипте их нет и не будет.
set_if_absent COMETAPI_KEY      "placeholder-replace-me"
set_if_absent SMS_GATEWAY_URL   ""
set_if_absent SMS_GATEWAY_KEY   ""
# Трансграничная передача кадра во внешнюю модель. Выключено по умолчанию:
# включает владелец, когда юрист подтвердит достаточность обезличивания.
set_if_absent CSW_TRANSFER_CLEARED "no"
# gemini-3.1-flash-image, а не pro: учёт расхода в очереди проставляет 850
# копеек за кадр, и это цена именно flash. С pro (1130) касса точки считала бы
# на треть меньше, чем списывает шлюз, — и потолок расхода перестал бы быть
# потолком. Модель и цена меняются вместе или не меняются вовсе.
set_if_absent CSW_B_MODEL       "gemini-3.1-flash-image"
set_if_absent CSW_B_BASE_URL    "https://api.cometapi.com/v1"
echo "переменных в secrets.env: $(grep -c '=' "$SECRETS")"

# ── 3 · несекретное ───────────────────────────────────────────────────────
say "3 · .env стека"
cat > "$STACK/.env" <<ENV
DOMAIN=$DOMAIN
PUBLIC_URL=https://$DOMAIN
# Демонстрационные данные. Только для стенда: на боевом контуре в РФ выдуманные
# точки и клиенты неотличимы от настоящих ровно тогда, когда настоящие пойдут.
SEED_DEMO=${SEED_DEMO:-yes}
ENV
cat "$STACK/.env"

# ── 4 · сборка и запуск ───────────────────────────────────────────────────
# --project-directory обязателен: без него compose считает относительные пути
# от каталога СВОЕГО файла, и ./app превращается в deploy/hetzner/app.
# --env-file подставляет \${...} В САМ compose; env_file: внутри сервиса
# кладёт переменные В КОНТЕЙНЕР. Нужно и то и другое, поэтому склейка.
# Когда указан --env-file, автоматический .env из каталога уже не читается.
say "4 · сборка"
cd "$STACK"
TMP=$(mktemp); trap 'rm -f "$TMP"' EXIT
cat .env "$SECRETS" > "$TMP"
docker compose -f deploy/hetzner/compose.stack.yml --project-directory "$STACK" --env-file "$TMP" build
say "5 · запуск"
docker compose -f deploy/hetzner/compose.stack.yml --project-directory "$STACK" --env-file "$TMP" up -d
docker compose -f deploy/hetzner/compose.stack.yml --project-directory "$STACK" --env-file "$TMP" ps
