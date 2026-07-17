-- Finish canonical naming after the allies refactor.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'workshops_status_check') then
    alter table public.allies rename constraint workshops_status_check to allies_status_check;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_photos_status_check') then
    alter table public.ally_photos rename constraint workshop_photos_status_check to ally_photos_status_check;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_help_offers_status_check') then
    alter table public.collaborator_offers rename constraint workshop_help_offers_status_check to collaborator_offers_status_check;
  end if;

  if exists (select 1 from pg_policies where schemaname='public' and tablename='user_allies' and policyname='Admins can manage user workshops') then
    alter policy "Admins can manage user workshops" on public.user_allies rename to "Admins can manage user allies";
  end if;
end $$;
