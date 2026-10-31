-- RUTA DE LOS DULCES — poner JB Laboratorios primero en la lista
-- Ejecutar en el SQL Editor de Supabase PRODUCCIÓN. Seguro de repetir.
-- Orden: 1) JB principal, 2) JB Sucursal 2, luego el resto en su orden actual.

update public.tourist_route_stops s
set stop_order = o.n
from (
  select id, row_number() over (
    order by
      case name
        when 'JB Laboratorios de Diagnóstico Clínico' then 0
        when 'JB Laboratorio Sucursal 2' then 1
        else 2
      end,
      stop_order, created_at
  ) as n
  from public.tourist_route_stops
  where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
) o
where s.id = o.id;

-- Verificación: los primeros 5 de la lista
select stop_order, name
from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
order by stop_order
limit 5;
