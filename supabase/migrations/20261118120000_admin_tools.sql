-- ---------------------------------------------------------------------------
-- Admin dashboard support
-- ---------------------------------------------------------------------------

-- Change someone's role. Only admins may call it, and an admin cannot remove
-- their own admin access (so the shop can't be left without an admin).
create or replace function public.admin_set_role(target uuid, new_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Only admins can change roles' using errcode = '42501';
  end if;
  if target = (select auth.uid()) and new_role <> 'admin' then
    raise exception 'You cannot remove your own admin access' using errcode = '42501';
  end if;
  update public.profiles set role = new_role where id = target;
end;
$$;

revoke execute on function public.admin_set_role(uuid, public.user_role) from public, anon;
grant execute on function public.admin_set_role(uuid, public.user_role) to authenticated;

-- Product photos: public to view, only admins may upload, replace or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select private.is_admin()));

create policy "Admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));

create policy "Admins delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));
