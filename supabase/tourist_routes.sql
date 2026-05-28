-- =====================================================================
-- TOURIST ROUTES — Circuitos turísticos del Cantón Mejía con mapa
-- Ejecutar DESPUÉS de schema.sql y schema_v2.sql
-- =====================================================================

create table if not exists public.tourist_routes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  short_description text,
  cover_image text,
  duration_hours numeric(4,1),
  difficulty text check (difficulty in ('facil','media','dificil')) default 'facil',
  distance_km numeric(6,2),
  color text default '#a855f7',
  starting_point text,
  is_published boolean default true,
  is_featured boolean default false,
  sort_order int default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tourist_route_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.tourist_routes(id) on delete cascade,
  name text not null,
  description text,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  business_slug text,                -- opcional: link a una ficha de negocio
  stop_order int not null,
  estimated_time_min int,            -- tiempo estimado en este punto
  created_at timestamptz default now()
);

create index if not exists tourist_route_stops_route_idx on public.tourist_route_stops(route_id, stop_order);

-- RLS público de lectura
alter table public.tourist_routes enable row level security;
alter table public.tourist_route_stops enable row level security;

drop policy if exists "public read tourist_routes" on public.tourist_routes;
create policy "public read tourist_routes" on public.tourist_routes for select using (is_published = true);

drop policy if exists "public read tourist_route_stops" on public.tourist_route_stops;
create policy "public read tourist_route_stops" on public.tourist_route_stops for select using (true);

-- Solo admins pueden modificar
drop policy if exists "admin write tourist_routes" on public.tourist_routes;
create policy "admin write tourist_routes" on public.tourist_routes for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "admin write tourist_route_stops" on public.tourist_route_stops;
create policy "admin write tourist_route_stops" on public.tourist_route_stops for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ---------------------------------------------------------------------
-- SEED: 3 rutas turísticas emblemáticas del Cantón Mejía
-- ---------------------------------------------------------------------
insert into public.tourist_routes (slug, name, description, short_description, cover_image, duration_hours, difficulty, distance_km, color, starting_point, is_featured, sort_order) values
  (
    'circuito-volcanes',
    'Circuito de los Volcanes',
    'Recorre los volcanes emblemáticos que rodean el Valle de Machachi. Comienza en el Pasochoa con su bosque protector, sigue al mirador del Cotopaxi para admirar al gigante nevado, y termina en El Corazón con sus vistas únicas. Recomendado en vehículo 4x4 para acceder a los miradores. Ideal para amantes de la naturaleza y la fotografía.',
    'Pasochoa, Cotopaxi y El Corazón en un día',
    'https://images.unsplash.com/photo-1568388505325-cad6c925da12?w=1200&q=80',
    8.0,
    'media',
    65.0,
    '#7c3aed',
    'Plaza Central de Machachi',
    true,
    1
  ),
  (
    'ruta-aguas-termales',
    'Ruta de las Aguas Termales',
    'Día de relax recorriendo los manantiales termales de Mejía. Comienza con un desayuno típico en Machachi, sigue al Balneario Tesalia para una mañana de piscinas, almuerzo de hornado en hueca tradicional y termina la tarde en Aguas Termales La Calera. Perfecto para familias y parejas.',
    'Tour de relax por los balnearios termales',
    'https://images.unsplash.com/photo-1582550945154-d1cf95d8a9d2?w=1200&q=80',
    6.0,
    'facil',
    12.0,
    '#0ea5e9',
    'Machachi centro',
    true,
    2
  ),
  (
    'patrimonio-machachi',
    'Patrimonio Histórico de Machachi',
    'Recorrido a pie por el corazón histórico de Machachi. Visita la Iglesia Matriz del siglo XIX, el Parque Central, el Mercado Tradicional donde podrás probar humitas y morocho, y termina en un mirador con vista al Valle. Ruta corta perfecta para conocer la esencia cultural del cantón.',
    'Patrimonio cultural a pie por el centro',
    'https://images.unsplash.com/photo-1548276145-69a9521f0499?w=1200&q=80',
    2.5,
    'facil',
    3.0,
    '#f59e0b',
    'Iglesia Matriz, Plaza Central',
    true,
    3
  )
on conflict (slug) do nothing;

-- Paradas del Circuito de los Volcanes
with r as (select id from public.tourist_routes where slug='circuito-volcanes')
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, business_slug, stop_order, estimated_time_min)
select r.id, v.name, v.descr, v.lat, v.lng, v.biz, v.ord, v.tim from r,
(values
  ('Plaza Central Machachi','Punto de partida del recorrido. Desayuno típico recomendado.',-0.5081::numeric,-78.5680::numeric,'parque-central-machachi',1,30),
  ('Refugio Pasochoa','Caminata corta por el Bosque Protector y avistamiento de aves.',-0.4669::numeric,-78.4892::numeric,'volcan-pasochoa',2,120),
  ('Mirador del Cotopaxi','Vista panorámica del volcán más alto activo del mundo.',-0.6810::numeric,-78.4377::numeric,'volcan-cotopaxi',3,90),
  ('Volcán El Corazón','Mirador hacia la cumbre con forma de corazón.',-0.5333::numeric,-78.6500::numeric,'volcan-corazon',4,60),
  ('Regreso a Machachi','Retorno al punto de partida.',-0.5081::numeric,-78.5680::numeric,null,5,30)
) as v(name,descr,lat,lng,biz,ord,tim);

-- Paradas Ruta de las Aguas Termales
with r as (select id from public.tourist_routes where slug='ruta-aguas-termales')
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, business_slug, stop_order, estimated_time_min)
select r.id, v.name, v.descr, v.lat, v.lng, v.biz, v.ord, v.tim from r,
(values
  ('Machachi Centro','Desayuno tradicional: humitas, morocho, café de olla.',-0.5081::numeric,-78.5680::numeric,null,1,45),
  ('Balneario Tesalia','Mañana de piscinas termales naturales.',-0.5180::numeric,-78.5750::numeric,'termales-tesalia',2,150),
  ('Hornados Dieguito','Almuerzo típico de hornado tradicional.',-0.5085::numeric,-78.5685::numeric,'hornados-dieguito',3,75),
  ('Aguas Termales La Calera','Tarde de relax con piscinas mineromedicinales.',-0.5250::numeric,-78.5950::numeric,'termales-la-calera',4,90)
) as v(name,descr,lat,lng,biz,ord,tim);

-- Paradas Patrimonio Histórico
with r as (select id from public.tourist_routes where slug='patrimonio-machachi')
insert into public.tourist_route_stops (route_id, name, description, latitude, longitude, business_slug, stop_order, estimated_time_min)
select r.id, v.name, v.descr, v.lat, v.lng, v.biz, v.ord, v.tim from r,
(values
  ('Iglesia Matriz','Templo histórico del siglo XIX, fachada de piedra.',-0.5081::numeric,-78.5680::numeric,'iglesia-matriz-machachi',1,30),
  ('Parque Central','Plaza principal con monumento y vendedores tradicionales.',-0.5081::numeric,-78.5680::numeric,'parque-central-machachi',2,30),
  ('Mercado Central','Prueba humitas, morocho, mote con chicharrón.',-0.5089::numeric,-78.5675::numeric,null,3,45),
  ('Mirador de Aloasí','Vista panorámica de los volcanes circundantes.',-0.5150::numeric,-78.5900::numeric,'mirador-aloasi',4,30)
) as v(name,descr,lat,lng,biz,ord,tim);
