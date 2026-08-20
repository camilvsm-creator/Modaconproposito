-- Marketplace checkout without buyer accounts, using the foundation's PayPal link.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

alter table public.marketplace_payment_settings
  add column if not exists paypal_url text,
  add column if not exists contact_whatsapp text;

insert into public.marketplace_payment_settings as settings (id, paypal_url, contact_whatsapp)
values (
  true,
  'https://www.paypal.com/paypalme/fundacionjp2santos?country.x=VE&locale.x=es_XC&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAafHoMNfUYtrPj4eJrV4M90Gz1t_PnGgqUVQFd60W9wMrxLItgYN-0-rperpvw_aem_4M4ltjmydzeaFiFXFiOxaQ',
  '584222600032'
)
on conflict (id) do update
set paypal_url = coalesce(nullif(settings.paypal_url, ''), excluded.paypal_url),
    contact_whatsapp = coalesce(nullif(settings.contact_whatsapp, ''), excluded.contact_whatsapp);

alter table public.marketplace_orders
  alter column customer_id drop not null,
  alter column customer_user_id drop not null,
  add column if not exists paypal_url_snapshot text,
  add column if not exists paypal_reference text,
  add column if not exists stock_reserved_at timestamptz;
