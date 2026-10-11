-- Marketplace: Pago Movil checkout data and exchange-rate snapshots.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

alter table public.marketplace_payment_settings
  add column if not exists pago_movil_exchange_rate numeric(12,4);

update public.marketplace_payment_settings
set pago_movil_exchange_rate = 876.7976,
    updated_at = now()
where id = true
  and (pago_movil_exchange_rate is null or pago_movil_exchange_rate <= 0);

insert into public.marketplace_payment_methods (
  code, name, method_type, payment_details, instructions, supports_amount, is_active, sort_order
)
select
  'pago-movil',
  'Pago Móvil',
  'manual',
  E'Banco: Bancamiga\nRIF: J502500073\nTeléfono: 04147775765\nTitular: Fundación Juan Pablo 2 Santos',
  'Realiza el Pago Móvil desde tu aplicación bancaria utilizando los datos indicados. Una vez completado, adjunta el comprobante para que podamos verificar tu compra.',
  false,
  true,
  1
where not exists (
  select 1 from public.marketplace_payment_methods where code = 'pago-movil'
);

alter table public.marketplace_orders
  add column if not exists payment_amount_bs numeric(12,2),
  add column if not exists payment_exchange_rate numeric(12,4),
  add column if not exists payment_date date,
  add column if not exists payment_submission_key text;

create unique index if not exists marketplace_orders_payment_submission_key_idx
  on public.marketplace_orders (payment_submission_key)
  where payment_submission_key is not null;
