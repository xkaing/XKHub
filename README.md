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

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```
