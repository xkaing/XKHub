-- 将模型状态收敛为三种：preorder、owned、gifted。
-- 执行前会先把旧状态归并到新的三种状态，再收紧 check 约束。

update public.model_items
set status = case
  when status in ('preorder', 'shipped', 'wishlist') then 'preorder'
  when status = 'gifted' then 'gifted'
  else 'owned'
end;

alter table public.model_items
drop constraint if exists model_items_status_check;

alter table public.model_items
add constraint model_items_status_check
check (status in ('preorder', 'owned', 'gifted'));
