-- Admins may list the files in the product-images bucket, so deleting a
-- fragrance can find and remove its uploaded photos. (Anyone can already view
-- a photo by its address because the bucket is public; this only adds listing,
-- and only for admins.)
create policy "Admins list product images" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and (select private.is_admin()));
