create table if not exists public.raw_material_movements (
  id uuid primary key default gen_random_uuid(),
  raw_material_id uuid not null references public.raw_materials(id) on delete cascade,
  related_task_id uuid references public.assigned_tasks(id) on delete set null,
  related_assignment_id uuid references public.ally_raw_material_assignments(id) on delete set null,
  movement_type text not null check (movement_type in ('entrada_inicial', 'entrada', 'devolucion', 'merma', 'ajuste', 'asignacion_tarea')),
  quantity_change numeric not null,
  balance_after numeric,
  notes text,
  created_by_user_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists raw_material_movements_raw_material_id_idx
  on public.raw_material_movements (raw_material_id);

create index if not exists raw_material_movements_related_task_id_idx
  on public.raw_material_movements (related_task_id);

create index if not exists raw_material_movements_created_at_idx
  on public.raw_material_movements (created_at desc);

alter table public.raw_material_movements enable row level security;

drop policy if exists "Admins can manage raw material movements" on public.raw_material_movements;

create policy "Admins can manage raw material movements"
on public.raw_material_movements
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
