alter table public.cartuchera_donations
  add column if not exists initiative text not null default 'adopta-una-cartuchera';
