# Database Scripts

Run scripts from Supabase SQL Editor.

## Model Items

- `init_model_items.sql`: creates `model_items`, indexes, updated_at trigger, Storage bucket, and open prototype policies.
- `model_items_open_rls_policies.sql`: reapplies open CRUD policies if RLS blocks frontend access.
- `alter_model_items_add_gifted_status.sql`: updates the status check constraint to include `gifted`.

The current app only depends on `model_items` and the `model-images` Storage bucket.
