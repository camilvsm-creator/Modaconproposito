-- Marketplace: configurable payment methods, guest proofs and stock reservations.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

create table if not exists public.marketplace_payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  method_type text not null default 'manual'
    check (method_type in ('link', 'manual')),
  payment_url text,
  payment_details text,
  instructions text,
  supports_amount boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.marketplace_payment_methods (code, name, method_type, payment_url, instructions, supports_amount, sort_order)
select 'paypal', 'PayPal', 'link', coalesce(nullif(settings.paypal_url, ''), 'https://www.paypal.com/paypalme/fundacionjp2santos'), coalesce(settings.instructions, 'Paga el total exacto del pedido y conserva la referencia o comprobante.'), true, 0
from public.marketplace_payment_settings settings
where settings.id = true
on conflict (code) do update
set payment_url = coalesce(nullif(public.marketplace_payment_methods.payment_url, ''), excluded.payment_url),
    instructions = coalesce(nullif(public.marketplace_payment_methods.instructions, ''), excluded.instructions),
    updated_at = now();

alter table public.marketplace_orders
  add column if not exists payment_method_id uuid references public.marketplace_payment_methods(id) on delete set null,
  add column if not exists payment_method_code_snapshot text,
  add column if not exists payment_method_name_snapshot text,
  add column if not exists payment_method_type_snapshot text,
  add column if not exists payment_method_url_snapshot text,
  add column if not exists payment_method_details_snapshot text,
  add column if not exists payment_reference text,
  add column if not exists payment_submitted_at timestamptz,
  add column if not exists stock_reservation_expires_at timestamptz;

create table if not exists public.marketplace_order_payment_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  content_type text not null,
  file_size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_payment_methods_active_sort_idx on public.marketplace_payment_methods (is_active, sort_order, created_at);
create index if not exists marketplace_orders_payment_method_idx on public.marketplace_orders (payment_method_id, created_at desc);
create index if not exists marketplace_orders_reservation_expiry_idx on public.marketplace_orders (stock_reservation_expires_at) where stock_reserved_at is not null and stock_released_at is null;
create index if not exists marketplace_order_payment_proofs_order_idx on public.marketplace_order_payment_proofs (order_id, created_at desc);

alter table public.marketplace_payment_methods enable row level security;
alter table public.marketplace_order_payment_proofs enable row level security;

grant select on public.marketplace_payment_methods to anon, authenticated;
grant select on public.marketplace_order_payment_proofs to authenticated;

drop policy if exists "Public can read active marketplace payment methods" on public.marketplace_payment_methods;
create policy "Public can read active marketplace payment methods" on public.marketplace_payment_methods for select to anon, authenticated using (is_active = true);
drop policy if exists "Admins can manage marketplace payment methods" on public.marketplace_payment_methods;
create policy "Admins can manage marketplace payment methods" on public.marketplace_payment_methods for all to authenticated using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin') with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can read marketplace payment proofs" on public.marketplace_order_payment_proofs;
create policy "Admins can read marketplace payment proofs" on public.marketplace_order_payment_proofs for select to authenticated using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Allies can read own marketplace payment proofs" on public.marketplace_order_payment_proofs;
create policy "Allies can read own marketplace payment proofs" on public.marketplace_order_payment_proofs for select to authenticated using (exists (select 1 from public.marketplace_orders order_row join public.allies ally on ally.id = order_row.ally_id where order_row.id = marketplace_order_payment_proofs.order_id and ally.user_id = (select auth.uid())));

create schema if not exists private;
create or replace function private.release_expired_marketplace_reservations()
returns integer language plpgsql security definer set search_path = public
as $$
declare reservation record; released_count integer := 0;
begin
  for reservation in select id, product_id, quantity from public.marketplace_orders where order_status = 'pendiente_pago' and stock_reserved_at is not null and stock_released_at is null and stock_reservation_expires_at is not null and stock_reservation_expires_at <= now() for update skip locked loop
    update public.marketplace_products set stock_quantity = stock_quantity + reservation.quantity, updated_at = now() where id = reservation.product_id;
    update public.marketplace_orders set order_status = 'cancelado', stock_released_at = now(), stock_reservation_expires_at = null, payment_review_notes = coalesce(payment_review_notes || E'\n', '') || 'Reserva vencida automáticamente.', updated_at = now() where id = reservation.id;
    released_count := released_count + 1;
  end loop;
  return released_count;
end;
$$;
revoke all on function private.release_expired_marketplace_reservations() from public, anon, authenticated;
