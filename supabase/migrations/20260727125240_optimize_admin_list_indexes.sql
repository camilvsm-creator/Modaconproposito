create index if not exists assigned_tasks_ally_created_at_idx
  on public.assigned_tasks (ally_id, created_at desc);

create index if not exists assigned_tasks_status_created_at_idx
  on public.assigned_tasks (status, created_at desc);

create index if not exists ally_deliveries_ally_created_at_idx
  on public.ally_deliveries (ally_id, created_at desc);

create index if not exists ally_deliveries_status_created_at_idx
  on public.ally_deliveries (status, created_at desc);

create index if not exists raw_materials_ally_name_idx
  on public.raw_materials (ally_id, name);

create index if not exists ally_raw_material_assignments_ally_assigned_at_idx
  on public.ally_raw_material_assignments (ally_id, assigned_at desc);

create index if not exists aid_requesters_status_created_at_idx
  on public.aid_requesters (status, created_at desc);

create index if not exists aid_requests_requester_created_at_idx
  on public.aid_requests (requester_id, created_at desc);

create index if not exists aid_requests_status_created_at_idx
  on public.aid_requests (status, created_at desc);

create index if not exists volunteers_status_created_at_idx
  on public.volunteers (status, created_at desc);

create index if not exists collaborators_status_created_at_idx
  on public.collaborators (status, created_at desc);
