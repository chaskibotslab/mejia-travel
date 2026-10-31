-- RUTA DE LOS DULCES — locales del Agachaditos del Chagra (-0.516970, -78.571379)
-- Ejecutar en el SQL Editor de Supabase PRODUCCIÓN, después de ruta_dulces_locales_reales.sql

-- Agachaditos del Chagra: mover Pameliny al punto común
update public.tourist_route_stops
set latitude = -0.516970, longitude = -78.571379, address = 'Agachaditos del Chagra'
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
  and name = 'Pizzería Pameliny';

-- Agregar los 3 locales nuevos (no se duplican si ya existen)
with r as (select id from public.tourist_routes where slug = 'ruta-de-los-dulces'),
m as (select coalesce(max(stop_order), 0) as mx from public.tourist_route_stops, r where route_id = r.id)
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, stop_order, address, parish, geo_status)
select r.id, v.name, 'Restaurante', -0.516970, -78.571379, m.mx + v.ord, 'Agachaditos del Chagra', 'Machachi', 'verified'
from r, m, (values ('Baiben de Sabores', 1), ('Sabor a Cada Bocado', 2), ('Rincón Casero', 3)) as v(name, ord)
where not exists (
  select 1 from public.tourist_route_stops s
  where s.route_id = r.id and lower(trim(s.name)) = lower(trim(v.name))
);

-- Verificación: todos los locales del Agachaditos del Chagra
select stop_order, name, latitude, longitude
from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
  and latitude = -0.516970 and longitude = -78.571379
order by stop_order;
