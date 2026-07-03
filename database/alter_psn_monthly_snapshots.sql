create extension if not exists pgcrypto;

create table if not exists public.psn_monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  psn_account_id uuid not null references public.psn_accounts(id) on delete cascade,
  snapshot_date date not null,
  captured_at timestamptz not null default now(),
  online_id text,
  trophy_summary jsonb not null default '{}'::jsonb,
  total_play_seconds integer not null default 0,
  total_earned_trophies jsonb not null default '{}'::jsonb,
  raw_account jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (psn_account_id, snapshot_date)
);

create table if not exists public.psn_monthly_snapshot_games (
  snapshot_id uuid not null references public.psn_monthly_snapshots(id) on delete cascade,
  psn_account_id uuid not null references public.psn_accounts(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  np_communication_id text not null,
  title text not null,
  platform text,
  category text,
  cover_url text,
  play_count integer,
  play_duration_seconds integer,
  last_played_at timestamptz,
  trophy_progress integer,
  earned_trophies jsonb not null default '{}'::jsonb,
  defined_trophies jsonb not null default '{}'::jsonb,
  last_updated_at timestamptz,
  raw_trophy_title jsonb not null default '{}'::jsonb,
  raw_game_progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (snapshot_id, np_communication_id)
);

create index if not exists psn_monthly_snapshots_account_date_idx
on public.psn_monthly_snapshots (psn_account_id, snapshot_date desc);

create index if not exists psn_monthly_snapshot_games_account_title_idx
on public.psn_monthly_snapshot_games (psn_account_id, np_communication_id);

alter table public.psn_monthly_snapshots enable row level security;
alter table public.psn_monthly_snapshot_games enable row level security;

grant select on public.psn_monthly_snapshots to authenticated;
grant select on public.psn_monthly_snapshot_games to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'psn_monthly_snapshots'
      and policyname = 'authenticated can read psn monthly snapshots'
  ) then
    create policy "authenticated can read psn monthly snapshots"
    on public.psn_monthly_snapshots for select
    to authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'psn_monthly_snapshot_games'
      and policyname = 'authenticated can read psn monthly snapshot games'
  ) then
    create policy "authenticated can read psn monthly snapshot games"
    on public.psn_monthly_snapshot_games for select
    to authenticated
    using (true);
  end if;
end $$;
