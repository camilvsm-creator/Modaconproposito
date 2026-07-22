alter table public.ally_raw_material_assignments
  add column if not exists task_id uuid references public.assigned_tasks(id) on delete set null,
  add column if not exists used_quantity numeric;

create index if not exists ally_raw_material_assignments_task_id_idx
  on public.ally_raw_material_assignments (task_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ally_raw_material_assignments_used_quantity_check'
  ) then
    alter table public.ally_raw_material_assignments
      add constraint ally_raw_material_assignments_used_quantity_check
      check (
        used_quantity is null
        or used_quantity >= 0
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ally_raw_material_assignments_used_lte_assigned_check'
  ) then
    alter table public.ally_raw_material_assignments
      add constraint ally_raw_material_assignments_used_lte_assigned_check
      check (
        used_quantity is null
        or quantity is null
        or used_quantity <= quantity
      );
  end if;
end $$;
