-- XKHub 模型收藏数据初始化脚本。
-- 在 Supabase SQL Editor 中执行。

create extension if not exists pgcrypto;

create table if not exists public.model_items (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  brand text not null default 'JOYTOY',

  ip text,
  universe text,
  series text,
  faction text,
  character_name text,

  image_url text,
  storage_path text,

  purchase_date date,
  original_price numeric(10, 2),
  purchase_price numeric(10, 2),
  currency text not null default 'CNY'
    check (currency in ('CNY', 'USD', 'JPY')),

  purchase_platform text,
  seller text,
  order_no text,

  status text not null default 'owned'
    check (status in ('preorder', 'owned', 'gifted')),

  tags text[] not null default '{}',
  note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists model_items_brand_idx on public.model_items (brand);
create index if not exists model_items_status_idx on public.model_items (status);
create index if not exists model_items_purchase_date_idx on public.model_items (purchase_date desc);
create index if not exists model_items_tags_idx on public.model_items using gin (tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_model_items_updated_at on public.model_items;
create trigger set_model_items_updated_at
before update on public.model_items
for each row
execute function public.set_updated_at();

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

insert into storage.buckets (id, name, public)
values ('model-images', 'model-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "model images are publicly readable" on storage.objects;
create policy "model images are publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'model-images');

drop policy if exists "model images can be uploaded" on storage.objects;
create policy "model images can be uploaded"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'model-images');

drop policy if exists "model images can be updated" on storage.objects;
create policy "model images can be updated"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'model-images')
with check (bucket_id = 'model-images');

drop policy if exists "model images can be deleted" on storage.objects;
create policy "model images can be deleted"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'model-images');
