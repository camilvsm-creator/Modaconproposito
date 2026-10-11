-- Separate contribution receipts from marketplace orders.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

create table if not exists public.marketplace_contributions (
  id uuid primary key default gen_random_uuid(),
  donor_name text not null,
  donor_email text not null,
  payment_method text not null check (payment_method in ('pago_movil', 'transferencia')),
  amount_bs numeric(12,2) not null check (amount_bs > 0),
  payment_reference text not null,
  payment_date date not null,
  proof_storage_path text not null unique,
  proof_original_name text not null,
  proof_content_type text not null,
  proof_file_size_bytes bigint not null check (proof_file_size_bytes > 0),
  status text not null default 'pendiente_verificacion'
    check (status in ('pendiente_verificacion', 'confirmado', 'rechazado')),
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_contributions_status_created_idx
  on public.marketplace_contributions (status, created_at desc);
create index if not exists marketplace_contributions_payment_date_idx
  on public.marketplace_contributions (payment_date desc);
create unique index if not exists marketplace_contributions_duplicate_guard_idx
  on public.marketplace_contributions (lower(donor_email), payment_method, payment_reference, payment_date);

alter table public.marketplace_contributions enable row level security;
grant select on public.marketplace_contributions to authenticated;

drop policy if exists "Admins can manage marketplace contributions" on public.marketplace_contributions;
create policy "Admins can manage marketplace contributions"
  on public.marketplace_contributions
  for all
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- The existing marketplace-payment-proofs bucket is private. Uploads and signed
-- URLs continue to be issued only by server actions using the service role.
