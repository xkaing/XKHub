-- 历史兼容脚本：当前模型状态只保留 preorder、owned、gifted。

alter table public.model_items
drop constraint if exists model_items_status_check;

alter table public.model_items
add constraint model_items_status_check
check (status in ('preorder', 'owned', 'gifted'));
