create table if not exists public.task_incidents (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.assigned_tasks(id) on delete cascade,
  created_by_user_id uuid,
  created_by_role text not null check (created_by_role in ('admin', 'aliado')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  resolution_notes text,
  resolved_by_user_id uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_incidents_task_id_idx on public.task_incidents (task_id);
create index if not exists task_incidents_status_idx on public.task_incidents (status);

alter table public.task_incidents enable row level security;

drop policy if exists "Admins can manage task incidents" on public.task_incidents;

create policy "Admins can manage task incidents"
on public.task_incidents
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allies can manage own task incidents" on public.task_incidents;

create policy "Allies can manage own task incidents"
on public.task_incidents
for all
to authenticated
using (exists (
  select 1
  from public.assigned_tasks task
  join public.allies ally on ally.id = task.ally_id
  where task.id = task_incidents.task_id
    and ally.user_id = (select auth.uid())
))
with check (exists (
  select 1
  from public.assigned_tasks task
  join public.allies ally on ally.id = task.ally_id
  where task.id = task_incidents.task_id
    and ally.user_id = (select auth.uid())
));
