-- =====================================================================
-- SUPABASE STORAGE — Bucket público para imágenes de la app
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- =====================================================================

-- Crear bucket público si no existe
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

-- Políticas RLS para el bucket "media"
-- Lectura pública (cualquiera puede ver las imágenes)
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media" on storage.objects
  for select
  using (bucket_id = 'media');

-- Solo admins pueden subir
drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media" on storage.objects
  for insert
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Solo admins pueden actualizar/sobrescribir
drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media" on storage.objects
  for update
  using (
    bucket_id = 'media'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Solo admins pueden eliminar
drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media" on storage.objects
  for delete
  using (
    bucket_id = 'media'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ALTERNATIVA: Si quieres que cualquier usuario autenticado pueda subir
-- (por ejemplo dueños de negocio para su propio local), descomenta esto
-- y comenta las políticas de admin de arriba:
--
-- drop policy if exists "Authenticated upload media" on storage.objects;
-- create policy "Authenticated upload media" on storage.objects
--   for insert with check (bucket_id = 'media' and auth.uid() is not null);
