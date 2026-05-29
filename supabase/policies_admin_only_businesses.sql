-- =====================================================================
-- RESTRICCIÓN: Solo el admin puede crear/editar/eliminar negocios.
-- Los usuarios normales solo pueden LEER negocios publicados.
-- El marketplace_items sigue abierto: cualquier usuario logueado puede
-- publicar y editar SUS propios artículos del mercado.
-- =====================================================================

-- ----------- businesses: bloquear insert/update/delete a no-admins -----------
drop policy if exists "Owners can insert their businesses" on public.businesses;
drop policy if exists "Owners can update their businesses" on public.businesses;
drop policy if exists "Admins manage businesses" on public.businesses;

create policy "Public can read published businesses" on public.businesses
  for select using (is_published = true or public.is_admin());

create policy "Only admins manage businesses" on public.businesses
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- LISTO. A partir de ahora:
--   ✅ Cualquiera puede VER negocios publicados.
--   ✅ Solo admin puede CREAR/EDITAR/BORRAR negocios.
--   ✅ Marketplace queda libre para todos los usuarios registrados.
-- =====================================================================
