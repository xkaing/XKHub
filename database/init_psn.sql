create extension if not exists pgcrypto;

create table if not exists public.psn_accounts (
  id uuid primary key default gen_random_uuid(),
  account_id text not null unique,
  online_id text,
  avatar_url text,
  is_plus boolean,
  trophy_summary jsonb not null default '{}'::jsonb,
  raw_profile jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.psn_auth_tokens (
  psn_account_id uuid primary key references public.psn_accounts(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  access_token_expires_at timestamptz not null,
  refresh_token_expires_at timestamptz,
  token_type text,
  scope text,
  updated_at timestamptz not null default now()
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  localized_title text,
  platform text,
  category text,
  cover_url text,
  hero_url text,
  psn_title_id text unique,
  psn_concept_id bigint,
  psn_concept_name text,
  status text not null default 'played',
  raw_psn jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.psn_game_progress (
  psn_account_id uuid not null references public.psn_accounts(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  service text,
  play_count integer,
  play_duration_iso text,
  play_duration_seconds integer,
  first_played_at timestamptz,
  last_played_at timestamptz,
  raw_psn jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now(),
  primary key (psn_account_id, game_id)
);

create table if not exists public.psn_trophy_titles (
  psn_account_id uuid not null references public.psn_accounts(id) on delete cascade,
  game_id uuid references public.games(id) on delete set null,
  np_communication_id text not null,
  np_service_name text not null,
  trophy_set_version text,
  name text not null,
  platform text,
  icon_url text,
  has_trophy_groups boolean,
  defined_trophies jsonb not null default '{}'::jsonb,
  earned_trophies jsonb not null default '{}'::jsonb,
  progress integer,
  hidden boolean,
  last_updated_at timestamptz,
  raw_psn jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now(),
  primary key (psn_account_id, np_communication_id)
);

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

create table if not exists public.psn_trophies (
  psn_account_id uuid not null references public.psn_accounts(id) on delete cascade,
  np_communication_id text not null,
  trophy_id integer not null,
  group_id text,
  type text,
  rarity integer,
  rarity_label text,
  earned_rate numeric,
  hidden boolean not null default false,
  earned boolean not null default false,
  earned_at timestamptz,
  name text,
  detail text,
  icon_url text,
  raw_psn jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now(),
  primary key (psn_account_id, np_communication_id, trophy_id),
  foreign key (psn_account_id, np_communication_id)
    references public.psn_trophy_titles(psn_account_id, np_communication_id)
    on delete cascade
);

create table if not exists public.game_purchases (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete set null,
  purchase_date date,
  purchase_price numeric(12, 2),
  currency text not null default 'CNY',
  store text,
  order_no text,
  edition text,
  format text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.psn_accounts enable row level security;
alter table public.psn_auth_tokens enable row level security;
alter table public.games enable row level security;
alter table public.psn_game_progress enable row level security;
alter table public.psn_trophy_titles enable row level security;
alter table public.psn_title_links enable row level security;
alter table public.psn_trophies enable row level security;
alter table public.game_purchases enable row level security;

grant select on public.psn_accounts to authenticated;
grant select on public.games to authenticated;
grant select on public.psn_game_progress to authenticated;
grant select on public.psn_trophy_titles to authenticated;
grant select on public.psn_title_links to authenticated;
grant select on public.psn_trophies to authenticated;
grant select, insert, update, delete on public.game_purchases to authenticated;

create policy "authenticated can read psn accounts"
on public.psn_accounts for select
to authenticated
using (true);

create policy "authenticated can read games"
on public.games for select
to authenticated
using (true);

create policy "authenticated can read psn game progress"
on public.psn_game_progress for select
to authenticated
using (true);

create policy "authenticated can read psn trophy titles"
on public.psn_trophy_titles for select
to authenticated
using (true);

create policy "authenticated can read psn title links"
on public.psn_title_links for select
to authenticated
using (true);

create policy "authenticated can read psn trophies"
on public.psn_trophies for select
to authenticated
using (true);

create policy "authenticated can manage game purchases"
on public.game_purchases for all
to authenticated
using (true)
with check (true);
