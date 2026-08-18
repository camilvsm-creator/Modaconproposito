-- Marketplace de Moda con Propósito.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

create table if not exists public.marketplace_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  address text not null,
  status text not null default 'activo' check (status in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  ally_id uuid not null references public.allies(id) on delete restrict,
  slug text not null unique,
  name text not null,
  description text,
  price_usd numeric(12,2) not null check (price_usd > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  status text not null default 'pendiente_revision'
    check (status in ('pendiente_revision', 'aprobado', 'rechazado', 'pausado')),
  rejection_reason text,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.marketplace_products(id) on delete cascade,
  storage_path text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_payment_settings (
  id boolean primary key default true check (id = true),
  phone text not null default '',
  bank text not null default '',
  rif text not null default '',
  account_holder text not null default '',
  instructions text,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.marketplace_customers(id) on delete restrict,
  customer_user_id uuid not null,
  product_id uuid not null references public.marketplace_products(id) on delete restrict,
  ally_id uuid not null references public.allies(id) on delete restrict,
  product_name_snapshot text not null,
  unit_price_usd numeric(12,2) not null check (unit_price_usd > 0),
  quantity integer not null default 1 check (quantity > 0),
  total_usd numeric(12,2) not null check (total_usd > 0),
  buyer_name text not null,
  buyer_email text not null,
  buyer_whatsapp text not null,
  delivery_address text not null,
  payment_phone_snapshot text not null,
  payment_bank_snapshot text not null,
  payment_rif_snapshot text not null,
  payment_holder_snapshot text not null,
  payment_instructions_snapshot text,
  payment_status text not null default 'pendiente_comprobante'
    check (payment_status in ('pendiente_comprobante', 'en_revision', 'aprobado', 'rechazado')),
  order_status text not null default 'pendiente_pago'
    check (order_status in ('pendiente_pago', 'pago_en_revision', 'pago_aprobado', 'en_preparacion', 'enviado', 'entregado', 'cancelado')),
  payment_proof_path text,
  payment_review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  delivery_notes text,
  stock_released_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_orders
  add column if not exists stock_released_at timestamptz;

create index if not exists marketplace_products_ally_status_idx
  on public.marketplace_products (ally_id, status, created_at desc);
create index if not exists marketplace_products_status_created_at_idx
  on public.marketplace_products (status, created_at desc);
create index if not exists marketplace_product_images_product_sort_idx
  on public.marketplace_product_images (product_id, sort_order);
create index if not exists marketplace_orders_customer_created_at_idx
  on public.marketplace_orders (customer_user_id, created_at desc);
create index if not exists marketplace_orders_ally_status_created_at_idx
  on public.marketplace_orders (ally_id, order_status, created_at desc);
create index if not exists marketplace_orders_payment_status_idx
  on public.marketplace_orders (payment_status, created_at desc);

alter table public.marketplace_customers enable row level security;
alter table public.marketplace_products enable row level security;
alter table public.marketplace_product_images enable row level security;
alter table public.marketplace_payment_settings enable row level security;
alter table public.marketplace_orders enable row level security;

-- Writes go through server actions using the service role after validating ownership.
-- The Data API remains read-only for regular clients.
grant select on public.marketplace_customers to authenticated;
grant select on public.marketplace_products to anon, authenticated;
grant select on public.marketplace_product_images to anon, authenticated;
grant select on public.marketplace_payment_settings to anon, authenticated;
grant select on public.marketplace_orders to authenticated;

drop policy if exists "Customers can read own marketplace profile" on public.marketplace_customers;
create policy "Customers can read own marketplace profile"
on public.marketplace_customers for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Customers can update own marketplace profile" on public.marketplace_customers;
create policy "Customers can update own marketplace profile"
on public.marketplace_customers for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Admins can manage marketplace customers" on public.marketplace_customers;
create policy "Admins can manage marketplace customers"
on public.marketplace_customers for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can read approved marketplace products" on public.marketplace_products;
create policy "Public can read approved marketplace products"
on public.marketplace_products for select to anon, authenticated
using (status = 'aprobado');

drop policy if exists "Allies can read own marketplace products" on public.marketplace_products;
create policy "Allies can read own marketplace products"
on public.marketplace_products for select to authenticated
using (exists (
  select 1 from public.allies ally
  where ally.id = marketplace_products.ally_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Allies can create marketplace products" on public.marketplace_products;
create policy "Allies can create marketplace products"
on public.marketplace_products for insert to authenticated
with check (status = 'pendiente_revision' and exists (
  select 1 from public.allies ally
  where ally.id = marketplace_products.ally_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Allies can update own marketplace products" on public.marketplace_products;
create policy "Allies can update own marketplace products"
on public.marketplace_products for update to authenticated
using (exists (
  select 1 from public.allies ally
  where ally.id = marketplace_products.ally_id
    and ally.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.allies ally
  where ally.id = marketplace_products.ally_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Admins can manage marketplace products" on public.marketplace_products;
create policy "Admins can manage marketplace products"
on public.marketplace_products for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can read approved marketplace product images" on public.marketplace_product_images;
create policy "Public can read approved marketplace product images"
on public.marketplace_product_images for select to anon, authenticated
using (exists (
  select 1 from public.marketplace_products product
  where product.id = marketplace_product_images.product_id
    and product.status = 'aprobado'
));

drop policy if exists "Admins can manage marketplace product images" on public.marketplace_product_images;
create policy "Admins can manage marketplace product images"
on public.marketplace_product_images for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allies can manage own marketplace product images" on public.marketplace_product_images;
create policy "Allies can manage own marketplace product images"
on public.marketplace_product_images for all to authenticated
using (exists (
  select 1 from public.marketplace_products product
  join public.allies ally on ally.id = product.ally_id
  where product.id = marketplace_product_images.product_id
    and ally.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.marketplace_products product
  join public.allies ally on ally.id = product.ally_id
  where product.id = marketplace_product_images.product_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Public can read marketplace payment settings" on public.marketplace_payment_settings;
create policy "Public can read marketplace payment settings"
on public.marketplace_payment_settings for select to anon, authenticated
using (true);

drop policy if exists "Admins can manage marketplace payment settings" on public.marketplace_payment_settings;
create policy "Admins can manage marketplace payment settings"
on public.marketplace_payment_settings for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Customers can read own marketplace orders" on public.marketplace_orders;
create policy "Customers can read own marketplace orders"
on public.marketplace_orders for select to authenticated
using (customer_user_id = (select auth.uid()));

drop policy if exists "Allies can read own marketplace orders" on public.marketplace_orders;
create policy "Allies can read own marketplace orders"
on public.marketplace_orders for select to authenticated
using (exists (
  select 1 from public.allies ally
  where ally.id = marketplace_orders.ally_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Allies can update own marketplace order delivery" on public.marketplace_orders;
create policy "Allies can update own marketplace order delivery"
on public.marketplace_orders for update to authenticated
using (exists (
  select 1 from public.allies ally
  where ally.id = marketplace_orders.ally_id
    and ally.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.allies ally
  where ally.id = marketplace_orders.ally_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Admins can manage marketplace orders" on public.marketplace_orders;
create policy "Admins can manage marketplace orders"
on public.marketplace_orders for all to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- These buckets are created only when absent. They are intentionally separate:
-- product images are public, payment proofs remain private.
insert into storage.buckets (id, name, public)
select 'marketplace-products', 'marketplace-products', true
where not exists (select 1 from storage.buckets where id = 'marketplace-products');

insert into storage.buckets (id, name, public)
select 'marketplace-payment-proofs', 'marketplace-payment-proofs', false
where not exists (select 1 from storage.buckets where id = 'marketplace-payment-proofs');
