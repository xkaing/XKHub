-- Upgrade the existing game_purchases draft table into a unified PS game library.
-- One row can represent either an owned game or a wishlist game via status.

alter table public.game_purchases
  add column if not exists title text,
  add column if not exists cover_url text,
  add column if not exists release_date date,
  add column if not exists developer text,
  add column if not exists publisher text,
  add column if not exists platform text,
  add column if not exists status text not null default 'owned';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'game_purchases_status_check'
      and conrelid = 'public.game_purchases'::regclass
  ) then
    alter table public.game_purchases
      add constraint game_purchases_status_check
      check (status in ('owned', 'wishlist'));
  end if;
end;
$$;

update public.game_purchases
set title = games.title,
    cover_url = coalesce(public.game_purchases.cover_url, games.cover_url),
    platform = coalesce(public.game_purchases.platform, games.platform)
from public.games
where public.game_purchases.game_id = games.id
  and public.game_purchases.title is null;

create index if not exists game_purchases_status_idx on public.game_purchases (status);
create index if not exists game_purchases_release_date_idx on public.game_purchases (release_date desc);
create index if not exists game_purchases_purchase_date_idx on public.game_purchases (purchase_date desc);

drop trigger if exists set_game_purchases_updated_at on public.game_purchases;
create trigger set_game_purchases_updated_at
before update on public.game_purchases
for each row
execute function public.set_updated_at();

grant select, insert, update, delete on public.game_purchases to anon, authenticated;

alter table public.game_purchases enable row level security;

drop policy if exists "anon can manage game purchases" on public.game_purchases;
create policy "anon can manage game purchases"
on public.game_purchases for all
to anon
using (true)
with check (true);
