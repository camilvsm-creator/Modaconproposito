-- Cover marketplace order foreign keys identified by the Supabase performance advisor.
-- Safe migration: indexes only.

create index if not exists marketplace_orders_customer_id_idx
  on public.marketplace_orders (customer_id);

create index if not exists marketplace_orders_product_id_idx
  on public.marketplace_orders (product_id);
