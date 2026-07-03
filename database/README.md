# Database Scripts

Run scripts from Supabase SQL Editor.

## Model Items

- `init_model_items.sql`: creates `model_items`, indexes, updated_at trigger, Storage bucket, and open prototype policies.
- `model_items_open_rls_policies.sql`: reapplies open CRUD policies if RLS blocks frontend access.
- `alter_model_items_add_gifted_status.sql`: updates the status check constraint to include `gifted`.
- `alter_model_items_simplify_status.sql`: merges legacy statuses into `preorder`, `owned`, and `gifted`.

The current app only depends on `model_items` and the `model-images` Storage bucket.

## PSN

- `init_psn.sql`: creates PSN accounts, games, trophy, purchase, and monthly snapshot tables.
- `alter_psn_add_title_links.sql`: adds manual/verified links between trophy titles and game records.
- `alter_psn_monthly_snapshots.sql`: adds monthly PSN snapshot tables for month-over-month playtime and trophy deltas.

Monthly snapshots are saved manually from the games list with "记录快照".
The snapshot copies the latest PSN data already stored in the database and does not require valid PSN tokens.
