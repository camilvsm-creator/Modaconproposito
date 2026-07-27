-- Messaging v1: admin conversations with allies and authenticated requesters.
-- Existing message tables are empty in the remote project, so the new ownership
-- constraint can be validated without data migration or destructive operations.

alter table public.message_threads
  add column if not exists requester_id uuid references public.aid_requesters(id) on delete restrict;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.message_threads'::regclass
      and conname = 'message_threads_context_check'
  ) then
    alter table public.message_threads drop constraint message_threads_context_check;
  end if;

  alter table public.message_threads
    add constraint message_threads_context_check
    check ((ally_id is not null) <> (requester_id is not null));
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.message_thread_participants'::regclass
      and conname = 'message_thread_participants_participant_role_check'
  ) then
    alter table public.message_thread_participants drop constraint message_thread_participants_participant_role_check;
  end if;

  alter table public.message_thread_participants
    add constraint message_thread_participants_participant_role_check
    check (participant_role in ('admin', 'aliado', 'solicitante'));

  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.message_thread_participants'::regclass
      and conname = 'message_thread_participants_identity_role_check'
  ) then
    alter table public.message_thread_participants drop constraint message_thread_participants_identity_role_check;
  end if;

  alter table public.message_thread_participants
    add constraint message_thread_participants_identity_role_check
    check (
      (participant_role = 'aliado' and ally_id is not null and user_id is null)
      or (participant_role in ('admin', 'solicitante') and user_id is not null and ally_id is null)
    );
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.messages'::regclass
      and conname = 'messages_sender_role_check'
  ) then
    alter table public.messages drop constraint messages_sender_role_check;
  end if;

  alter table public.messages
    add constraint messages_sender_role_check
    check (sender_role in ('admin', 'aliado', 'solicitante'));
end $$;

create index if not exists message_threads_requester_id_idx
  on public.message_threads (requester_id);

create index if not exists message_threads_ally_status_updated_at_idx
  on public.message_threads (ally_id, status, updated_at desc);

create index if not exists message_threads_requester_status_updated_at_idx
  on public.message_threads (requester_id, status, updated_at desc);

create index if not exists message_thread_participants_user_thread_id_idx
  on public.message_thread_participants (user_id, thread_id)
  where user_id is not null;

create index if not exists messages_thread_created_at_id_idx
  on public.messages (thread_id, created_at, id);

drop policy if exists "Admins can manage message threads" on public.message_threads;
drop policy if exists "Allies can read own message threads" on public.message_threads;
drop policy if exists "Users can read own message threads" on public.message_threads;
drop policy if exists "Admins can create message threads" on public.message_threads;
drop policy if exists "Admins can update message threads" on public.message_threads;
drop policy if exists "Admins can delete message threads" on public.message_threads;

create policy "Users can read own message threads"
on public.message_threads
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  or exists (
    select 1
    from public.allies ally
    where ally.id = message_threads.ally_id
      and ally.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.aid_requesters requester
    where requester.id = message_threads.requester_id
      and requester.user_id = (select auth.uid())
  )
);

create policy "Admins can create message threads"
on public.message_threads
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can update message threads"
on public.message_threads
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete message threads"
on public.message_threads
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can manage message participants" on public.message_thread_participants;
drop policy if exists "Allies can read own message participants" on public.message_thread_participants;
drop policy if exists "Users can read own message participants" on public.message_thread_participants;
drop policy if exists "Users can update own message participants" on public.message_thread_participants;
drop policy if exists "Admins can insert message participants" on public.message_thread_participants;
drop policy if exists "Admins can delete message participants" on public.message_thread_participants;

create policy "Users can read own message participants"
on public.message_thread_participants
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  or exists (
    select 1
    from public.allies ally
    where message_thread_participants.ally_id = ally.id
      and ally.user_id = (select auth.uid())
  )
  or (
    message_thread_participants.user_id = (select auth.uid())
    and message_thread_participants.participant_role = 'solicitante'
  )
);

create policy "Users can update own message participants"
on public.message_thread_participants
for update
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  or exists (
    select 1
    from public.allies ally
    where message_thread_participants.ally_id = ally.id
      and ally.user_id = (select auth.uid())
  )
  or (
    message_thread_participants.user_id = (select auth.uid())
    and message_thread_participants.participant_role = 'solicitante'
  )
)
with check (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  or exists (
    select 1
    from public.allies ally
    where message_thread_participants.ally_id = ally.id
      and ally.user_id = (select auth.uid())
  )
  or (
    message_thread_participants.user_id = (select auth.uid())
    and message_thread_participants.participant_role = 'solicitante'
  )
);

create policy "Admins can insert message participants"
on public.message_thread_participants
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete message participants"
on public.message_thread_participants
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can manage messages" on public.messages;
drop policy if exists "Allies can read own messages" on public.messages;
drop policy if exists "Allies can send own messages" on public.messages;
drop policy if exists "Users can read own messages" on public.messages;
drop policy if exists "Users can send own messages" on public.messages;
drop policy if exists "Admins can update messages" on public.messages;
drop policy if exists "Admins can delete messages" on public.messages;

create policy "Users can read own messages"
on public.messages
for select
to authenticated
using (
  ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
  or exists (
    select 1
    from public.message_threads thread
    join public.allies ally on ally.id = thread.ally_id
    where thread.id = messages.thread_id
      and ally.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.message_threads thread
    join public.aid_requesters requester on requester.id = thread.requester_id
    where thread.id = messages.thread_id
      and requester.user_id = (select auth.uid())
  )
);

create policy "Users can send own messages"
on public.messages
for insert
to authenticated
with check (
  (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and sender_user_id = (select auth.uid())
    and sender_role = 'admin'
  )
  or (
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
  )
  or (
    sender_user_id = (select auth.uid())
    and sender_role = 'solicitante'
    and exists (
      select 1
      from public.message_threads thread
      join public.aid_requesters requester on requester.id = thread.requester_id
      where thread.id = messages.thread_id
        and requester.user_id = (select auth.uid())
        and thread.status = 'open'
    )
  )
);

create policy "Admins can update messages"
on public.messages
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins can delete messages"
on public.messages
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'message_threads'
  ) then
    alter publication supabase_realtime add table public.message_threads;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
