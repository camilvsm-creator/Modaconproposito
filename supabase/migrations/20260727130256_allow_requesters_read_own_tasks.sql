create policy "Requesters can read own assigned tasks"
on public.assigned_tasks
for select
to authenticated
using (
  (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'solicitante')
  and exists (
    select 1
    from public.aid_requests request
    join public.aid_requesters requester on requester.id = request.requester_id
    where request.id = assigned_tasks.aid_request_id
      and requester.user_id = (select auth.uid())
  )
);
