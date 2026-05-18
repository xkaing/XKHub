-- 如果开启 RLS 后前端不能读写 model_items，就执行这个脚本。
-- 当前策略为个人后台原型开放读写。
-- 后续接回登录系统后，再把策略收紧到指定用户。

grant select, insert, update, delete on public.model_items to anon, authenticated;

alter table public.model_items enable row level security;

drop policy if exists "model items are readable" on public.model_items;
create policy "model items are readable"
on public.model_items for select
to anon, authenticated
using (true);

drop policy if exists "model items can be inserted" on public.model_items;
create policy "model items can be inserted"
on public.model_items for insert
to anon, authenticated
with check (true);

drop policy if exists "model items can be updated" on public.model_items;
create policy "model items can be updated"
on public.model_items for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "model items can be deleted" on public.model_items;
create policy "model items can be deleted"
on public.model_items for delete
to anon, authenticated
using (true);
