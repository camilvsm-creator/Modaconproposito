alter table public.volunteers enable row level security;

drop policy if exists "Public can register volunteers" on public.volunteers;
create policy "Public can register volunteers"
on public.volunteers
for insert
to anon
with check (
  status = 'activo'
  and nullif(trim(name), '') is not null
  and email is not null
  and position('@' in email) > 1
);
