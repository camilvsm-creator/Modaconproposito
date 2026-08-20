-- Guest order access token for uploading payment proofs without an account.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

alter table public.marketplace_orders
  add column if not exists guest_access_token_hash text;

create unique index if not exists marketplace_orders_guest_access_token_hash_idx
  on public.marketplace_orders (guest_access_token_hash)
  where guest_access_token_hash is not null;
