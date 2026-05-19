# XKHub

Personal data dashboard for models, games, trophies, spending, and future AI workflows.

## Stack

- Next.js 14 App Router
- React + TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Supabase Postgres + Storage

## Current Modules

- `/models`: model collection CRUD, image upload, Supabase-only data source
- `/games`: schema draft for games and PSN trophies
- `/insights`: derived spending and collection metrics
- `/ai`: placeholder for AI data assistant

## Supabase Setup

Run these scripts in Supabase SQL Editor:

1. `database/init_model_items.sql`
2. `database/model_items_open_rls_policies.sql` if RLS blocks frontend CRUD
3. `database/alter_model_items_add_gifted_status.sql` if the table was created before `gifted` status was added
4. `database/init_psn.sql` for PSN game, playtime, trophy, and manual purchase tables

The model image Storage bucket defaults to `model-images`.

## Environment

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_MODEL_IMAGES_BUCKET=model-images
SUPABASE_SERVICE_ROLE_KEY=
```

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000/models`.

## PSN Sync

Install the PSN schema in Supabase first:

```bash
# Run this file in the Supabase SQL Editor
database/init_psn.sql
```

Export PSN data locally without saving the NPSSO:

```bash
npm run psn:sync
```

The script reads `PSN_NPSSO` from the environment or stdin, exchanges it for PSN auth tokens, fetches played games and trophy data, and writes an ignored JSON export under `exports/psn/`.

For a light test run:

```bash
npm run psn:sync -- --max-trophy-titles 5
```

To also write fetched data into Supabase after the tables exist:

```bash
npm run psn:sync -- --sync-supabase
```

To write an existing export into Supabase without calling PSN again:

```bash
npm run psn:sync -- --from-file exports/psn/latest-supabase-sync.json --sync-supabase
```

By default the script does not store NPSSO or PSN auth tokens. Only use `--save-tokens` together with `--sync-supabase` if you intentionally want the server-side `psn_auth_tokens` table to store refresh credentials.

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```
