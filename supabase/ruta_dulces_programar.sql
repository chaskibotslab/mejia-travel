-- =====================================================================
-- RUTAS PROGRAMADAS — una ruta publicada con publish_at en el futuro
-- muestra solo su portada + cuenta regresiva; los locales (paradas) los
-- entrega la base de datos únicamente a partir de esa hora (reloj del
-- servidor de Supabase, no del celular). Los admins ven todo siempre.
-- Ejecutar en el SQL Editor de Supabase PRODUCCIÓN. Seguro de repetir.
-- =====================================================================

alter table public.tourist_routes
  add column if not exists publish_at timestamptz;  -- null = visible apenas se publica

-- Paradas: el público solo las lee si la ruta está publicada y ya llegó su hora.
-- (La política "admin write tourist_route_stops" sigue dando acceso total a admins.)
drop policy if exists "public read tourist_route_stops" on public.tourist_route_stops;
create policy "public read tourist_route_stops" on public.tourist_route_stops for select using (
  exists (
    select 1 from public.tourist_routes r
    where r.id = tourist_route_stops.route_id
      and r.is_published = true
      and (r.publish_at is null or r.publish_at <= now())
  )
);

-- Ruta de los Dulces: visible para todos HOY 31/10/2026 a las 12:00 (hora de Ecuador)
update public.tourist_routes
set is_published = true, publish_at = '2026-10-31 12:00:00-05', updated_at = now()
where slug = 'ruta-de-los-dulces';

-- Verificación: hora_ecuador_servidor y si ya es visible para todos
select slug, is_published,
       publish_at at time zone 'America/Guayaquil' as se_activa_hora_ecuador,
       now() at time zone 'America/Guayaquil' as hora_ecuador_servidor,
       (publish_at is null or publish_at <= now()) as visible_para_todos
from public.tourist_routes
where slug = 'ruta-de-los-dulces';
