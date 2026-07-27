-- Expand volunteer workflow statuses for public applications and ally assignments.
-- Existing rows use the legacy values and remain valid.

alter table public.volunteers
  drop constraint if exists volunteers_status_check;

alter table public.volunteers
  add constraint volunteers_status_check
  check (status in ('postulado', 'revisado', 'activo', 'asignado', 'pausado', 'inactivo'));

notify pgrst, 'reload schema';
