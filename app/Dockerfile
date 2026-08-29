# CarSwap AI · образ приложения.
#
# Многоступенчатая сборка: инструменты сборки и исходники не попадают в
# образ, который поедет на сервер. В финальном слое только Node, готовый
# standalone-бандл Next и статика.
#
# Node 20 LTS. Базовый образ — debian slim, а не alpine: pg и sharp
# на musl регулярно приносят сюрпризы, а выигрыш в размере тут не тот,
# ради которого стоит их ловить на продакшене.
#
# Собирается из каталога app/:
#   docker build -t carswap-app:$(git rev-parse --short HEAD) app/

# ── 1 · зависимости ───────────────────────────────────────────────────────
# Отдельный слой, чтобы правка исходников не тянула переустановку пакетов.
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Полный набор, включая devDependencies: сборка Next нуждается в typescript
# и @types. В финальный образ этот слой не попадает.
RUN npm ci --ignore-scripts

# ── 2 · сборка ────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# standalone-вывод. В next.config.mjs поле output не задано, а сам конфиг —
# не территория деплоя, поэтому оборачиваем его на время сборки: исходный
# конфиг сохраняется и импортируется, репозиторий не меняется.
# Когда output: 'standalone' появится в next.config.mjs, эти три строки
# можно снести — обёртка станет тождественной.
RUN mv next.config.mjs next.config.base.mjs \
 && printf "import base from './next.config.base.mjs';\nexport default { ...base, output: 'standalone' };\n" > next.config.mjs \
 && npm run build

# ── 3 · запуск ────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    TZ=Europe/Moscow

# Хранилище фото и рендеров. Внутрь образа не кладётся ничего: это точка
# монтирования тома, данные переживают пересборку образа.
RUN mkdir -p /var/lib/carswap/storage \
 && chown -R node:node /var/lib/carswap

# server.js, трассированные зависимости и package.json — всё, что нужно
# standalone-серверу. node_modules целиком не переносится намеренно.
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Статика и public отдаются с диска: внешних CDN в продукте нет (§13),
# шрифты Onest и рендеры лежат здесь же.
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node
EXPOSE 3000

# Проверка живости бьёт в /login: это чистая клиентская страница без
# запросов к базе. Иначе недоступность Postgres превращалась бы в
# бесконечный перезапуск контейнера вместо честной ошибки на экране.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
