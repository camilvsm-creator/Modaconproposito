drop policy if exists "Admins can manage requester activation tokens" on public.aid_requester_activation_tokens;

create policy "Admins can manage requester activation tokens"
on public.aid_requester_activation_tokens
for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
