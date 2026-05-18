-- 如果 model_items 表已经存在，执行这个脚本来补充 gifted 状态。

alter table public.model_items
drop constraint if exists model_items_status_check;

alter table public.model_items
add constraint model_items_status_check
check (status in ('wishlist', 'preorder', 'shipped', 'owned', 'cancelled', 'sold', 'gifted'));
