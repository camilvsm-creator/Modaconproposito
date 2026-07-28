-- Fix avatar ownership checks to read the storage object path, not the ally name.
-- The bucket already exists; this migration only replaces the affected policies.

drop policy if exists "Allies can upload own avatar objects" on storage.objects;
create policy "Allies can upload own avatar objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ally-photos'
  and name like 'avatars/%/%'
  and exists (
    select 1
    from public.allies ally
    where ally.id::text = split_part(storage.objects.name, '/', 2)
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Allies can update own avatar objects" on storage.objects;
create policy "Allies can update own avatar objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'ally-photos'
  and exists (
    select 1
    from public.allies ally
    where ally.id::text = split_part(storage.objects.name, '/', 2)
      and ally.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'ally-photos'
  and exists (
    select 1
    from public.allies ally
    where ally.id::text = split_part(storage.objects.name, '/', 2)
      and ally.user_id = (select auth.uid())
  )
);

drop policy if exists "Allies can delete own avatar objects" on storage.objects;
create policy "Allies can delete own avatar objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'ally-photos'
  and exists (
    select 1
    from public.allies ally
    where ally.id::text = split_part(storage.objects.name, '/', 2)
      and ally.user_id = (select auth.uid())
  )
);
