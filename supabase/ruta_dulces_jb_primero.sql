-- RUTA DE LOS DULCES — posición de JB Laboratorios en la lista
-- Ejecutar en el SQL Editor de Supabase PRODUCCIÓN. Seguro de repetir.
-- Orden: 1) JB principal, 100) JB Sucursal 2; el resto en su orden actual.

update public.tourist_route_stops s
set stop_order = case
    when o.name = 'JB Laboratorios de Diagnóstico Clínico' then 1
    when o.name = 'JB Laboratorio Sucursal 2' then 100
    when o.n <= 98 then o.n + 1   -- puestos 2..99
    else o.n + 2                  -- puestos 101 en adelante
  end
from (
  select id, name, row_number() over (
    partition by name in ('JB Laboratorios de Diagnóstico Clínico', 'JB Laboratorio Sucursal 2')
    order by stop_order, created_at
  ) as n
  from public.tourist_route_stops
  where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
) o
where s.id = o.id;

-- Verificación: JB principal debe salir en 1 y la sucursal en 100
select stop_order, name
from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
  and stop_order in (1, 2, 99, 100, 101)
order by stop_order;
