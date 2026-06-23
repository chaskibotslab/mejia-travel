-- =====================================================================
-- FIX: Permitir que CUALQUIER usuario autenticado suba imágenes al
-- bucket "media" (necesario para que los usuarios publiquen artículos
-- del mercado, suban su foto de perfil, etc.).
--
-- Ejecutar en Supabase SQL Editor (Dashboard -> SQL -> New query).
-- Sobrescribe las políticas previas que solo permitían a admins.
-- =====================================================================

-- 1) Asegurar que el bucket existe y es público
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB por archivo
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif'];

-- 2) Eliminar las políticas antiguas restrictivas
drop policy if exists "Admins upload media" on storage.objects;
drop policy if exists "Admins update media" on storage.objects;
drop policy if exists "Admins delete media" on storage.objects;
drop policy if exists "Authenticated upload media" on storage.objects;
drop policy if exists "Users update own media" on storage.objects;
drop policy if exists "Users delete own media" on storage.objects;
drop policy if exists "Public read media" on storage.objects;

-- 3) Lectura pública (cualquiera ve las imágenes)
create policy "Public read media" on storage.objects
  for select
  using (bucket_id = 'media');

-- 4) Cualquier usuario AUTENTICADO puede subir al bucket media
create policy "Authenticated upload media" on storage.objects
  for insert
  with check (
    bucket_id = 'media'
    and auth.uid() is not null
  );

-- 5) El dueño del archivo (o un admin) puede actualizarlo
create policy "Owner or admin update media" on storage.objects
  for update
  using (
    bucket_id = 'media'
    and (
      owner = auth.uid()
      or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    )
  );

-- 6) El dueño del archivo (o un admin) puede eliminarlo
create policy "Owner or admin delete media" on storage.objects
  for delete
  using (
    bucket_id = 'media'
    and (
      owner = auth.uid()
      or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    )
  );
