create table if not exists public.psn_title_links (
  psn_account_id uuid not null references public.psn_accounts(id) on delete cascade,
  np_communication_id text not null,
  game_id uuid not null references public.games(id) on delete cascade,
  psn_title_id text,
  match_method text not null,
  match_confidence numeric(5, 2) not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (psn_account_id, np_communication_id),
  foreign key (psn_account_id, np_communication_id)
    references public.psn_trophy_titles(psn_account_id, np_communication_id)
    on delete cascade
);

alter table public.psn_title_links enable row level security;

grant select on public.psn_title_links to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'psn_title_links'
      and policyname = 'authenticated can read psn title links'
  ) then
    create policy "authenticated can read psn title links"
    on public.psn_title_links for select
    to authenticated
    using (true);
  end if;
end $$;

insert into public.psn_title_links (
  psn_account_id,
  np_communication_id,
  game_id,
  psn_title_id,
  match_method,
  match_confidence,
  verified,
  updated_at
)
select
  title.psn_account_id,
  title.np_communication_id,
  title.game_id,
  game.psn_title_id,
  'legacy_trophy_game_id',
  0.75,
  false,
  now()
from public.psn_trophy_titles title
join public.games game on game.id = title.game_id
where title.game_id is not null
on conflict (psn_account_id, np_communication_id) do nothing;
