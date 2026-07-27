-- Enable ally-owned inventory, delivery and avatar operations.
-- Safe migration: no DROP TABLE, DROP COLUMN or DROP BUCKET.

alter table public.raw_materials
  add column if not exists ally_id uuid references public.allies(id) on delete set null;

create index if not exists raw_materials_ally_id_idx
  on public.raw_materials (ally_id);

create index if not exists allies_user_id_idx
  on public.allies (user_id);

create index if not exists ally_raw_material_assignments_ally_id_idx
  on public.ally_raw_material_assignments (ally_id);

create index if not exists ally_raw_material_assignments_raw_material_id_idx
  on public.ally_raw_material_assignments (raw_material_id);

create index if not exists ally_deliveries_ally_id_idx
  on public.ally_deliveries (ally_id);

alter table public.raw_materials enable row level security;
alter table public.ally_raw_material_assignments enable row level security;
alter table public.ally_deliveries enable row level security;
alter table public.raw_material_movements enable row level security;
alter table public.volunteers enable row level security;

drop policy if exists "Allies can read own raw materials" on public.raw_materials;
create policy "Allies can read own raw materials"
on public.raw_materials
for select
to authenticated
using (
  exists (
    select 1
    from public.allies ally
    where ally.id = raw_materials.ally_id
      and ally.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.ally_raw_material_assignments assignment
    join public.allies ally on ally.id = assignment.ally_id
    where assignment.raw_material_id = raw_materials.id
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Allies can create own raw materials" on public.raw_materials;
create policy "Allies can create own raw materials"
on public.raw_materials
for insert
to authenticated
with check (
  exists (
    select 1
    from public.allies ally
    where ally.id = raw_materials.ally_id
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Allies can update own raw materials" on public.raw_materials;
create policy "Allies can update own raw materials"
on public.raw_materials
for update
to authenticated
using (
  exists (
    select 1
    from public.allies ally
    where ally.id = raw_materials.ally_id
      and ally.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.allies ally
    where ally.id = raw_materials.ally_id
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Allies can manage own material assignments" on public.ally_raw_material_assignments;
create policy "Allies can manage own material assignments"
on public.ally_raw_material_assignments
for all
to authenticated
using (
  exists (
    select 1
    from public.allies ally
    where ally.id = ally_raw_material_assignments.ally_id
      and ally.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.allies ally
    where ally.id = ally_raw_material_assignments.ally_id
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Allies can manage own deliveries" on public.ally_deliveries;
create policy "Allies can manage own deliveries"
on public.ally_deliveries
for all
to authenticated
using (
  exists (
    select 1
    from public.allies ally
    where ally.id = ally_deliveries.ally_id
      and ally.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.allies ally
    where ally.id = ally_deliveries.ally_id
      and ally.user_id = (select auth.uid())
  )
  and ally_deliveries.status in ('pendiente', 'entregada', 'cancelada')
);

drop policy if exists "Allies can read own material movements" on public.raw_material_movements;
create policy "Allies can read own material movements"
on public.raw_material_movements
for select
to authenticated
using (
  exists (
    select 1
    from public.raw_materials material
    join public.allies ally on ally.id = material.ally_id
    where material.id = raw_material_movements.raw_material_id
      and ally.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.ally_raw_material_assignments assignment
    join public.allies ally on ally.id = assignment.ally_id
    where assignment.id = raw_material_movements.related_assignment_id
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Allies can create own material movements" on public.raw_material_movements;
create policy "Allies can create own material movements"
on public.raw_material_movements
for insert
to authenticated
with check (
  created_by_user_id = (select auth.uid())
  and (
    exists (
      select 1
      from public.raw_materials material
      join public.allies ally on ally.id = material.ally_id
      where material.id = raw_material_movements.raw_material_id
        and ally.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.ally_raw_material_assignments assignment
      join public.allies ally on ally.id = assignment.ally_id
      where assignment.id = raw_material_movements.related_assignment_id
        and ally.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "Public can register volunteer applications" on public.volunteers;
create policy "Public can register volunteer applications"
on public.volunteers
for insert
to anon
with check (
  status = 'postulado'
  and nullif(trim(name), '') is not null
  and email is not null
  and position('@' in email) > 1
);

drop policy if exists "Public can register volunteers" on public.volunteers;
