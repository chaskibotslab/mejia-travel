-- RUTA DE LOS DULCES — agregar un local suelto al final de la lista
-- Ejecutar en el SQL Editor de Supabase PRODUCCIÓN. No se duplica si ya existe.
-- Para otro local: cambiar solo los datos de la línea "values".

with r as (select id from public.tourist_routes where slug = 'ruta-de-los-dulces'),
m as (select coalesce(max(stop_order), 0) as mx from public.tourist_route_stops, r where route_id = r.id)
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, stop_order, address, phone, parish, geo_status)
select r.id, v.name, v.descr, v.lat, v.lng, m.mx + 1, v.addr, v.phone, 'Machachi', 'verified'
from r, m, (values
  --  nombre                          categoría   latitud      longitud      dirección               teléfono
  ('Depósito de Huevos Machachi', 'Tienda', -0.5134454, -78.5693723, 'José Mejía 03-61', null)
) as v(name, descr, lat, lng, addr, phone)
where not exists (
  select 1 from public.tourist_route_stops s
  where s.route_id = r.id and lower(trim(s.name)) = lower(trim(v.name))
);

-- Verificación: los últimos 3 de la lista
select stop_order, name, address
from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
order by stop_order desc
limit 3;
