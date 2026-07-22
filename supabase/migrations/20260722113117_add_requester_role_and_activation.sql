alter table public.aid_requesters
  add column if not exists user_id uuid;

create unique index if not exists aid_requesters_user_id_unique_idx
  on public.aid_requesters (user_id)
  where user_id is not null;

alter table public.ally_deliveries
  add column if not exists received_at timestamptz;

create table if not exists public.aid_requester_activation_tokens (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.aid_requesters(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by_user_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists aid_requester_activation_tokens_requester_id_idx
  on public.aid_requester_activation_tokens (requester_id);

create index if not exists aid_requester_activation_tokens_token_hash_idx
  on public.aid_requester_activation_tokens (token_hash);

alter table public.aid_requester_activation_tokens enable row level security;

drop policy if exists "Requesters can read own requester" on public.aid_requesters;
create policy "Requesters can read own requester"
on public.aid_requesters
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and user_id = (select auth.uid())
);

drop policy if exists "Requesters can update own requester" on public.aid_requesters;
create policy "Requesters can update own requester"
on public.aid_requesters
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and user_id = (select auth.uid())
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and user_id = (select auth.uid())
);

drop policy if exists "Requesters can read own aid requests" on public.aid_requests;
create policy "Requesters can read own aid requests"
on public.aid_requests
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and exists (
    select 1
    from public.aid_requesters requester
    where requester.id = aid_requests.requester_id
      and requester.user_id = (select auth.uid())
  )
);

drop policy if exists "Requesters can create own aid requests" on public.aid_requests;
create policy "Requesters can create own aid requests"
on public.aid_requests
for insert
to authenticated
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and status in ('recibida', 'en_revision')
  and exists (
    select 1
    from public.aid_requesters requester
    where requester.id = aid_requests.requester_id
      and requester.user_id = (select auth.uid())
  )
);

drop policy if exists "Requesters can update own open aid requests" on public.aid_requests;
create policy "Requesters can update own open aid requests"
on public.aid_requests
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and aid_requests.status in ('recibida', 'en_revision')
  and exists (
    select 1
    from public.aid_requesters requester
    where requester.id = aid_requests.requester_id
      and requester.user_id = (select auth.uid())
  )
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and aid_requests.status in ('recibida', 'en_revision')
  and exists (
    select 1
    from public.aid_requesters requester
    where requester.id = aid_requests.requester_id
      and requester.user_id = (select auth.uid())
  )
);

drop policy if exists "Requesters can read own deliveries" on public.ally_deliveries;
create policy "Requesters can read own deliveries"
on public.ally_deliveries
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and exists (
    select 1
    from public.assigned_tasks task
    join public.aid_requests request on request.id = task.aid_request_id
    join public.aid_requesters requester on requester.id = request.requester_id
    where task.id = ally_deliveries.task_id
      and requester.user_id = (select auth.uid())
  )
);

drop policy if exists "Requesters can confirm own deliveries" on public.ally_deliveries;
create policy "Requesters can confirm own deliveries"
on public.ally_deliveries
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and ally_deliveries.status = 'entregada'
  and exists (
    select 1
    from public.assigned_tasks task
    join public.aid_requests request on request.id = task.aid_request_id
    join public.aid_requesters requester on requester.id = request.requester_id
    where task.id = ally_deliveries.task_id
      and requester.user_id = (select auth.uid())
  )
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante'
  and ally_deliveries.status = 'recibida'
  and exists (
    select 1
    from public.assigned_tasks task
    join public.aid_requests request on request.id = task.aid_request_id
    join public.aid_requesters requester on requester.id = request.requester_id
    where task.id = ally_deliveries.task_id
      and requester.user_id = (select auth.uid())
  )
);
