# AI Assistant Guidelines for XKHub

XKHub is being rebuilt as a personal data OS using Next.js, React, shadcn/ui-style local components, Tailwind CSS, and Supabase.

## Project Shape

```txt
src/
  app/
    ai/
    games/
    insights/
    models/
    page.tsx
  components/
    models/
    ui/
    app-shell.tsx
  lib/
    data/
    supabase/
    utils.ts
  types/
database/
  init_model_items.sql
  model_items_open_rls_policies.sql
  alter_model_items_add_gifted_status.sql
```

## Rules

- Model data must come from Supabase `model_items`; do not reintroduce local JSON/mock data.
- Images should upload to Supabase Storage bucket `model-images` unless `NEXT_PUBLIC_SUPABASE_MODEL_IMAGES_BUCKET` overrides it.
- Keep shadcn/ui components local under `src/components/ui`.
- Prefer small, typed data helpers in `src/lib/data`.
- Use client components only where browser state, forms, uploads, or Supabase browser client are required.

## Checks

Run these before considering changes complete:

```bash
npx tsc --noEmit
npm run lint
```
