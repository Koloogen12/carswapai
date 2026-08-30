-- Роль воркера: инфраструктура, а не арендатор.
--
-- ЧТО СЛОМАЛОСЬ. Воркер подключался ролью приложения и не видел очередь вовсе:
-- `select count(*) from render_jobs` возвращал ноль. Задания копились в
-- «queued», примерка в гараже не доезжала до модели, и по журналам это
-- выглядело как «воркер запустился и молчит».
--
-- Причина та же, что уже ловилась дважды: app.claim_render_jobs объявлена
-- security definer, но у таблиц включён force row level security, а политики
-- читают ПРЕТЕНЗИЮ, а не роль базы. Претензии у воркера нет и быть не может —
-- он обслуживает все точки сразу.
--
-- На машине разработчика этого не видно: там воркер ходит суперпользователем,
-- потому что других login-ролей в дев-базе просто нет.
--
-- ПОЧЕМУ BYPASSRLS, А НЕ ПОЛИТИКА. Политика выражает «кому из арендаторов что
-- видно». Воркер не арендатор: он обязан видеть очередь всех точек, иначе он
-- не очередь, а шесть очередей. Выразить это политикой можно только правилом
-- «этой роли видно всё», то есть тем же bypassrls, но спрятанным.
--
-- Границей служат ПРАВА НА ТАБЛИЦЫ, и они узкие: воркер читает задания и
-- позиции конфигурации, пишет рендеры и расход. Переписки, клиентов, нарядов,
-- согласий и счетов он не видит — bypassrls их не открывает, потому что на них
-- нет грантов.
-- САМА РОЛЬ здесь не создаётся. Обход политик выдаёт только суперпользователь,
-- а миграции идут под владельцем схемы — и это правильно: право раздавать
-- обход политик не должно лежать в миграции, которую накатывает кто угодно.
-- Роль заводит установщик кластера (deploy/hetzner/init/01-roles.sh) и стенд
-- (db/test.sh). Если её нет — миграция падает, и это верное поведение:
-- установку пропустили.

-- Ровно то, что перечислено в worker/main.py, и ничего сверх.
grant usage on schema app, public to carswap_worker;
grant select         on render_jobs, configuration_items, point_prices, catalog_items to carswap_worker;
grant select, insert on renders           to carswap_worker;
grant select, insert on generation_usage  to carswap_worker;
grant select         on photos            to carswap_worker;
grant select         on point_budgets     to carswap_worker;

grant execute on function app.claim_render_jobs(text, integer)  to carswap_worker;
grant execute on function app.finish_render_job(uuid, integer)  to carswap_worker;
grant execute on function app.fail_render_job(uuid, text)       to carswap_worker;
grant execute on function app.budget_state(uuid)                to carswap_worker;
