alter table public.ally_deliveries
  add column if not exists scheduled_for timestamptz;
