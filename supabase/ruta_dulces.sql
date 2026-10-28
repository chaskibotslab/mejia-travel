-- =====================================================================
-- RUTA DE LOS DULCES (Halloween) — rutas tipo "evento" con muchos locales
-- Ejecutar DESPUÉS de tourist_routes.sql
--
-- 1) Migración ADITIVA: solo agrega columnas opcionales. Las rutas
--    existentes quedan con display_mode = 'linear' y se ven igual que antes.
-- 2) Seed DEMO: 30 locales inventados en Machachi. La ruta queda
--    OCULTA (is_published = false): solo los admins la pueden ver en
--    /rutas/ruta-de-los-dulces. Reemplazar con la lista oficial.
-- =====================================================================

alter table public.tourist_routes
  add column if not exists display_mode text default 'linear';  -- 'linear' | 'event'

alter table public.tourist_route_stops
  add column if not exists address text,
  add column if not exists parish text,
  add column if not exists schedule text,
  add column if not exists phone text,
  add column if not exists image_url text,
  add column if not exists geo_status text default 'verified';  -- 'verified' | 'approx' | 'pending'

-- ---------------------------------------------------------------------
-- SEED DEMO
-- ---------------------------------------------------------------------
insert into public.tourist_routes (slug, name, description, short_description, cover_image, duration_hours, difficulty, distance_km, color, starting_point, is_published, is_featured, sort_order, display_mode) values
  (
    'ruta-de-los-dulces',
    'Ruta de los Dulces 🎃',
    'Este Halloween recorre los locales participantes del Cantón Mejía y llena tu funda de dulces. Usa el mapa para encontrar los locales más cercanos, marca los que ya visitaste y no te pierdas ninguno. ¡Ven disfrazado!',
    'Más de 200 locales entregan dulces este Halloween',
    null,
    null,
    'facil',
    null,
    '#f97316',
    'Parque Central de Machachi',
    false,   -- DEMO: oculta al público hasta cargar la lista oficial
    true,
    0,
    'event'
  )
on conflict (slug) do nothing;

-- Limpia paradas previas de esta ruta (permite re-ejecutar el script)
delete from public.tourist_route_stops
where route_id = (select id from public.tourist_routes where slug = 'ruta-de-los-dulces');

with r as (select id from public.tourist_routes where slug = 'ruta-de-los-dulces')
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, stop_order, address, parish, schedule, geo_status)
select r.id, v.name, v.descr, v.lat, v.lng, v.ord, v.addr, 'Machachi', v.sched, 'verified' from r,
(values
  ('Panadería La Calabaza',        'Pan de muerto y chupetes para los niños.',          -0.5098::numeric, -78.5672::numeric,  1, 'Calle Cristóbal Colón y Barriga',        '16:00 - 20:00'),
  ('Tienda Don Fantasma',          'Caramelos y chocolates.',                           -0.5091::numeric, -78.5681::numeric,  2, 'Calle Barriga y José Mejía',             '16:00 - 21:00'),
  ('Farmacia Luna Llena',          'Gomitas y stickers de Halloween.',                  -0.5104::numeric, -78.5660::numeric,  3, 'Av. Amazonas y Colón',                   '15:00 - 20:00'),
  ('Heladería El Murciélago',      'Mini conos para los disfrazados.',                  -0.5085::numeric, -78.5665::numeric,  4, 'Calle Luis Cordero y Amazonas',          '16:00 - 20:00'),
  ('Ferretería Escoba Mágica',     'Chupetes y globos.',                                -0.5112::numeric, -78.5689::numeric,  5, 'Calle Rocafuerte y García Moreno',       '16:00 - 19:00'),
  ('Cafetería La Bruja Buena',     'Galletas decoradas.',                               -0.5076::numeric, -78.5694::numeric,  6, 'Av. Pablo Guarderas y Colón',            '16:00 - 21:00'),
  ('Minimarket El Caldero',        'Caramelos surtidos.',                               -0.5069::numeric, -78.5677::numeric,  7, 'Calle Antonio Benítez y Barriga',        '15:00 - 21:00'),
  ('Papelería Calavera Feliz',     'Lápices y dulces.',                                 -0.5121::numeric, -78.5671::numeric,  8, 'Calle García Moreno y Mejía',            '16:00 - 20:00'),
  ('Pastelería Telaraña',          'Cupcakes de Halloween (hasta agotar stock).',       -0.5094::numeric, -78.5701::numeric,  9, 'Av. Pablo Guarderas y Rocafuerte',       '16:00 - 20:00'),
  ('Óptica Ojo de Gato',           'Chocolates.',                                       -0.5102::numeric, -78.5650::numeric, 10, 'Av. Amazonas y Luis Cordero',            '16:00 - 19:00'),
  ('Juguetería El Duende',         'Juguetes pequeños y dulces.',                       -0.5130::numeric, -78.5683::numeric, 11, 'Calle Rocafuerte y Simón Bolívar',       '15:00 - 20:00'),
  ('Restaurante La Momia',         'Colada morada en vasitos.',                         -0.5088::numeric, -78.5711::numeric, 12, 'Av. Pablo Guarderas y Benítez',          '16:00 - 21:00'),
  ('Bazar Las Calabacitas',        'Caramelos y pulseras.',                             -0.5060::numeric, -78.5664::numeric, 13, 'Calle Colón y Antonio Benítez',          '16:00 - 20:00'),
  ('Dulcería El Vampiro',          'Gomitas de colores.',                               -0.5115::numeric, -78.5655::numeric, 14, 'Av. Amazonas y García Moreno',           '15:00 - 21:00'),
  ('Peluquería La Araña',          'Chupetes.',                                         -0.5079::numeric, -78.5652::numeric, 15, 'Calle Luis Cordero y Colón',             '16:00 - 19:00'),
  ('Licorería Noche de Brujas',    'Chocolates (solo para niños acompañados).',         -0.5138::numeric, -78.5667::numeric, 16, 'Calle Simón Bolívar y Amazonas',         '16:00 - 20:00'),
  ('Panadería Pan de Muerto',      'Guaguas de pan pequeñas.',                          -0.5052::numeric, -78.5685::numeric, 17, 'Calle Barriga y Antonio Benítez',        '15:00 - 20:00'),
  ('Tienda Mi Calabacín',          'Caramelos.',                                        -0.5126::numeric, -78.5698::numeric, 18, 'Calle García Moreno y Pablo Guarderas',  '16:00 - 20:00'),
  ('Cyber El Esqueleto',           'Chupetes y stickers.',                              -0.5072::numeric, -78.5706::numeric, 19, 'Av. Pablo Guarderas y Barriga',          '16:00 - 21:00'),
  ('Florería Rosa Negra',          'Dulces y flores de papel.',                         -0.5107::numeric, -78.5640::numeric, 20, 'Av. Amazonas y Rocafuerte',              '16:00 - 19:00'),
  ('Zapatería Bota de Bruja',      'Caramelos surtidos.',                               -0.5095::numeric, -78.5645::numeric, 21, 'Calle Luis Cordero y Rocafuerte',        '16:00 - 20:00'),
  ('Frutería La Manzana Encantada','Fruta confitada.',                                  -0.5146::numeric, -78.5679::numeric, 22, 'Calle Simón Bolívar y García Moreno',    '15:00 - 20:00'),
  ('Lavandería Sábana Fantasma',   'Chupetes.',                                         -0.5064::numeric, -78.5650::numeric, 23, 'Calle Colón y Luis Cordero',             '16:00 - 19:00'),
  ('Asadero El Hombre Lobo',       'Dulces y colada morada.',                           -0.5082::numeric, -78.5725::numeric, 24, 'Av. Pablo Guarderas y José Mejía',       '16:00 - 21:00'),
  ('Librería El Hechizo',          'Libros para colorear y dulces.',                    -0.5118::numeric, -78.5706::numeric, 25, 'Calle Rocafuerte y Pablo Guarderas',     '16:00 - 20:00'),
  ('Abarrotes La Linterna',        'Caramelos.',                                        -0.5045::numeric, -78.5672::numeric, 26, 'Calle Antonio Benítez y Colón',          '15:00 - 21:00'),
  ('Veterinaria Gato Negro',       'Dulces y premios para mascotas disfrazadas.',       -0.5134::numeric, -78.5650::numeric, 27, 'Calle García Moreno y Amazonas',         '16:00 - 19:00'),
  ('Chocolatería Noche Oscura',    'Bombones.',                                         -0.5100::numeric, -78.5690::numeric, 28, 'Calle José Mejía y Rocafuerte',          '16:00 - 20:00'),
  ('Tienda El Castillo Embrujado', 'Caramelos y chupetes.',                             -0.5058::numeric, -78.5698::numeric, 29, 'Calle Barriga y Pablo Guarderas',        '16:00 - 20:00'),
  ('Parque Central de Machachi',   'Punto de encuentro: concurso de disfraces 18:00.',  -0.5081::numeric, -78.5680::numeric, 30, 'Parque Central',                         '17:00 - 20:00')
) as v(name, descr, lat, lng, ord, addr, sched);
