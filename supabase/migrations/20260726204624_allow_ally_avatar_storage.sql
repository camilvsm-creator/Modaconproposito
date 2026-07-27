-- Allow an ally to manage its own avatar path while keeping admin access.
-- The bucket is expected to already exist; this migration does not create or drop buckets.

drop policy if exists "Admins can manage ally avatar objects" on storage.objects;
create policy "Admins can manage ally avatar objects"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'ally-photos'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'ally-photos'
  and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
);

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
    where ally.id::text = split_part(name, '/', 2)
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
    where ally.id::text = split_part(name, '/', 2)
      and ally.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'ally-photos'
  and exists (
    select 1
    from public.allies ally
    where ally.id::text = split_part(name, '/', 2)
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
    where ally.id::text = split_part(name, '/', 2)
      and ally.user_id = (select auth.uid())
  )
);
