-- Stabilize Red Promoda domain tables after the allies refactor.
-- Safe migration: no DROP TABLE, DROP COLUMN, or DROP BUCKET.

-- Canonical names for legacy constraints that survived table renames.
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'workshops_pkey') then
    alter table public.allies rename constraint workshops_pkey to allies_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshops_slug_key') then
    alter table public.allies rename constraint workshops_slug_key to allies_slug_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'user_workshops_pkey') then
    alter table public.user_allies rename constraint user_workshops_pkey to user_allies_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'user_workshops_user_id_workshop_id_key') then
    alter table public.user_allies rename constraint user_workshops_user_id_workshop_id_key to user_allies_user_id_ally_id_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'user_workshops_workshop_id_fkey') then
    alter table public.user_allies rename constraint user_workshops_workshop_id_fkey to user_allies_ally_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_activation_tokens_pkey') then
    alter table public.ally_activation_tokens rename constraint workshop_activation_tokens_pkey to ally_activation_tokens_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_activation_tokens_token_hash_key') then
    alter table public.ally_activation_tokens rename constraint workshop_activation_tokens_token_hash_key to ally_activation_tokens_token_hash_key;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_activation_tokens_workshop_id_fkey') then
    alter table public.ally_activation_tokens rename constraint workshop_activation_tokens_workshop_id_fkey to ally_activation_tokens_ally_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_needs_pkey') then
    alter table public.assigned_tasks rename constraint workshop_needs_pkey to assigned_tasks_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_needs_workshop_id_fkey') then
    alter table public.assigned_tasks rename constraint workshop_needs_workshop_id_fkey to assigned_tasks_ally_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_photos_pkey') then
    alter table public.ally_photos rename constraint workshop_photos_pkey to ally_photos_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_photos_workshop_id_fkey') then
    alter table public.ally_photos rename constraint workshop_photos_workshop_id_fkey to ally_photos_ally_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_help_offers_pkey') then
    alter table public.collaborator_offers rename constraint workshop_help_offers_pkey to collaborator_offers_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_help_offers_workshop_id_fkey') then
    alter table public.collaborator_offers rename constraint workshop_help_offers_workshop_id_fkey to collaborator_offers_ally_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_help_offers_need_id_fkey') then
    alter table public.collaborator_offers rename constraint workshop_help_offers_need_id_fkey to collaborator_offers_need_id_fkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_volunteers_pkey') then
    alter table public.ally_volunteer_assignments rename constraint workshop_volunteers_pkey to ally_volunteer_assignments_pkey;
  end if;

  if exists (select 1 from pg_constraint where conname = 'workshop_volunteers_workshop_id_fkey') then
    alter table public.ally_volunteer_assignments rename constraint workshop_volunteers_workshop_id_fkey to ally_volunteer_assignments_ally_id_fkey;
  end if;
end $$;

-- Missing FK indexes reported by Supabase advisors.
create index if not exists aid_requests_requester_id_idx on public.aid_requests (requester_id);
create index if not exists ally_deliveries_task_id_idx on public.ally_deliveries (task_id);
create index if not exists ally_raw_material_assignments_raw_material_id_idx on public.ally_raw_material_assignments (raw_material_id);
create index if not exists ally_volunteer_assignments_volunteer_id_idx on public.ally_volunteer_assignments (volunteer_id);
create index if not exists assigned_tasks_aid_request_id_idx on public.assigned_tasks (aid_request_id);
create index if not exists collaborator_offers_aid_request_id_idx on public.collaborator_offers (aid_request_id);
create index if not exists collaborator_offers_collaborator_id_idx on public.collaborator_offers (collaborator_id);

-- Canonical helper indexes. Keep these and remove duplicate legacy copies below.
create index if not exists allies_slug_idx on public.allies (slug);
create index if not exists ally_activation_tokens_token_hash_idx on public.ally_activation_tokens (token_hash);
create index if not exists collaborator_offers_need_id_idx on public.collaborator_offers (need_id);

-- Remove duplicate legacy indexes only. These are recreated above with canonical names where needed.
drop index if exists public.workshops_status_idx;
drop index if exists public.workshops_user_id_idx;
drop index if exists public.workshops_slug_idx;
drop index if exists public.user_workshops_user_id_idx;
drop index if exists public.user_workshops_workshop_id_idx;
drop index if exists public.workshop_activation_tokens_workshop_id_idx;
drop index if exists public.workshop_activation_tokens_token_hash_idx;
drop index if exists public.workshop_needs_workshop_id_idx;
drop index if exists public.workshop_needs_status_idx;
drop index if exists public.workshop_photos_workshop_id_idx;
drop index if exists public.workshop_photos_status_idx;
drop index if exists public.workshop_help_offers_workshop_id_idx;
drop index if exists public.workshop_help_offers_need_id_idx;
drop index if exists public.workshop_volunteers_workshop_id_idx;

-- Normalize migrated volunteer assignment snapshots into the canonical volunteers table.
with source_volunteers as (
  select
    min(trim(name)) as name,
    nullif(regexp_replace(max(coalesce(phone, '')), '\D', '', 'g'), '') as phone,
    nullif(min(nullif(trim(instagram), '')), '') as instagram,
    nullif(string_agg(distinct nullif(trim(role), ''), ', ' order by nullif(trim(role), '')), '') as skills,
    min(created_at) as created_at
  from public.ally_volunteer_assignments
  where volunteer_id is null
    and nullif(trim(name), '') is not null
  group by
    lower(trim(name)),
    nullif(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), ''),
    lower(coalesce(nullif(trim(instagram), ''), ''))
)
insert into public.volunteers (name, phone, instagram, skills, status, created_at, updated_at)
select name, phone, instagram, skills, 'activo', created_at, now()
from source_volunteers source
where not exists (
  select 1
  from public.volunteers existing
  where lower(trim(existing.name)) = lower(trim(source.name))
    and coalesce(nullif(regexp_replace(coalesce(existing.phone, ''), '\D', '', 'g'), ''), '') = coalesce(source.phone, '')
    and lower(coalesce(nullif(trim(existing.instagram), ''), '')) = lower(coalesce(source.instagram, ''))
);

update public.ally_volunteer_assignments assignment
set volunteer_id = volunteer.id,
    updated_at = now()
from public.volunteers volunteer
where assignment.volunteer_id is null
  and lower(trim(assignment.name)) = lower(trim(volunteer.name))
  and coalesce(nullif(regexp_replace(coalesce(assignment.phone, ''), '\D', '', 'g'), ''), '') = coalesce(nullif(regexp_replace(coalesce(volunteer.phone, ''), '\D', '', 'g'), ''), '')
  and lower(coalesce(nullif(trim(assignment.instagram), ''), '')) = lower(coalesce(nullif(trim(volunteer.instagram), ''), ''));

-- Messaging module: admin <-> ally threads.
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  ally_id uuid references public.allies(id) on delete set null,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_thread_participants (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  user_id uuid,
  ally_id uuid references public.allies(id) on delete cascade,
  participant_role text not null check (participant_role in ('admin', 'aliado')),
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint message_thread_participants_identity_check check (user_id is not null or ally_id is not null)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_user_id uuid,
  sender_role text not null check (sender_role in ('admin', 'aliado')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists message_threads_ally_id_idx on public.message_threads (ally_id);
create index if not exists message_threads_status_idx on public.message_threads (status);
create index if not exists message_thread_participants_thread_id_idx on public.message_thread_participants (thread_id);
create index if not exists message_thread_participants_user_id_idx on public.message_thread_participants (user_id);
create index if not exists message_thread_participants_ally_id_idx on public.message_thread_participants (ally_id);
create unique index if not exists message_thread_participants_thread_user_unique_idx
  on public.message_thread_participants (thread_id, user_id)
  where user_id is not null;
create unique index if not exists message_thread_participants_thread_ally_unique_idx
  on public.message_thread_participants (thread_id, ally_id)
  where ally_id is not null;
create index if not exists messages_thread_id_created_at_idx on public.messages (thread_id, created_at);

alter table public.message_threads enable row level security;
alter table public.message_thread_participants enable row level security;
alter table public.messages enable row level security;

grant select, insert, update, delete on public.message_threads to authenticated;
grant select, insert, update, delete on public.message_thread_participants to authenticated;
grant select, insert on public.messages to authenticated;

drop policy if exists "Admins can manage message threads" on public.message_threads;
create policy "Admins can manage message threads"
on public.message_threads
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allies can read own message threads" on public.message_threads;
create policy "Allies can read own message threads"
on public.message_threads
for select
to authenticated
using (exists (
  select 1
  from public.allies ally
  where ally.id = message_threads.ally_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Admins can manage message participants" on public.message_thread_participants;
create policy "Admins can manage message participants"
on public.message_thread_participants
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allies can read own message participants" on public.message_thread_participants;
create policy "Allies can read own message participants"
on public.message_thread_participants
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.allies ally
    where ally.id = message_thread_participants.ally_id
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Admins can manage messages" on public.messages;
create policy "Admins can manage messages"
on public.messages
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Allies can read own messages" on public.messages;
create policy "Allies can read own messages"
on public.messages
for select
to authenticated
using (exists (
  select 1
  from public.message_threads thread
  join public.allies ally on ally.id = thread.ally_id
  where thread.id = messages.thread_id
    and ally.user_id = (select auth.uid())
));

drop policy if exists "Allies can send own messages" on public.messages;
create policy "Allies can send own messages"
on public.messages
for insert
to authenticated
with check (
  sender_user_id = (select auth.uid())
  and sender_role = 'aliado'
  and exists (
    select 1
    from public.message_threads thread
    join public.allies ally on ally.id = thread.ally_id
    where thread.id = messages.thread_id
      and ally.user_id = (select auth.uid())
      and thread.status = 'open'
  )
);

-- Rename legacy RLS policies to canonical domain language where possible.
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='allies' and policyname='Admins can manage workshops') then
    alter policy "Admins can manage workshops" on public.allies rename to "Admins can manage allies";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='allies' and policyname='Public can register workshops') then
    alter policy "Public can register workshops" on public.allies rename to "Public can register allies";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='allies' and policyname='Public can read active workshops') then
    alter policy "Public can read active workshops" on public.allies rename to "Public can read active allies";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='allies' and policyname='Workshop owners can read own workshop') then
    alter policy "Workshop owners can read own workshop" on public.allies rename to "Allies can read own ally";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='allies' and policyname='Workshop owners can update own workshop') then
    alter policy "Workshop owners can update own workshop" on public.allies rename to "Allies can update own ally";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='assigned_tasks' and policyname='Admins can manage needs') then
    alter policy "Admins can manage needs" on public.assigned_tasks rename to "Admins can manage assigned tasks";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='assigned_tasks' and policyname='Workshop owners can manage own needs') then
    alter policy "Workshop owners can manage own needs" on public.assigned_tasks rename to "Allies can manage own assigned tasks";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='assigned_tasks' and policyname='Public can read published needs') then
    alter policy "Public can read published needs" on public.assigned_tasks rename to "Public can read published assigned tasks";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='ally_photos' and policyname='Workshop owners can manage own photos') then
    alter policy "Workshop owners can manage own photos" on public.ally_photos rename to "Allies can manage own photos";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='ally_volunteer_assignments' and policyname='Workshop owners can read own volunteers') then
    alter policy "Workshop owners can read own volunteers" on public.ally_volunteer_assignments rename to "Allies can read own volunteer assignments";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='collaborator_offers' and policyname='Admins can manage help offers') then
    alter policy "Admins can manage help offers" on public.collaborator_offers rename to "Admins can manage collaborator offers";
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='collaborator_offers' and policyname='Public can create help offers') then
    alter policy "Public can create help offers" on public.collaborator_offers rename to "Public can create collaborator offers";
  end if;
end $$;
