-- =====================================================================
-- MEJÍA TRAVEL - Schema v2 (extensión)
-- Ejecutar DESPUÉS de schema.sql
-- Añade: profesionales individuales, cooperativas de transporte y sus rutas,
-- horarios estructurados, favoritos, promociones, banners y settings clave-valor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Mejora de la tabla categories: cover_image (imagen de cabecera) y
-- listing_mode (cómo se renderiza la subcategoría: businesses | professionals | cooperatives)
-- ---------------------------------------------------------------------
alter table public.categories
  add column if not exists cover_image text,
  add column if not exists description text,
  add column if not exists listing_mode text default 'businesses'
    check (listing_mode in ('businesses','professionals','cooperatives','custom'));

-- =====================================================================
-- TABLA: professionals (profesionales individuales — Doctor, Abogado, etc.)
-- =====================================================================
create table if not exists public.professionals (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references public.categories(id) on delete cascade,
  full_name text not null,
  profession text,
  bio text,
  photo text,
  phone text,
  whatsapp text,
  email text,
  facebook text,
  instagram text,
  tiktok text,
  website text,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_published boolean default true,
  is_featured boolean default false,
  sort_order int default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_professionals_category on public.professionals(category_id);
create index if not exists idx_professionals_published on public.professionals(is_published);

-- =====================================================================
-- TABLA: transport_cooperatives (cooperativas de buses/taxis/camionetas)
-- =====================================================================
create table if not exists public.transport_cooperatives (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  type text default 'bus' check (type in ('bus','taxi','camioneta','escolar','turismo')),
  description text,
  founded_year int,
  logo text,
  cover_image text,
  color text default '#1B97A3',
  phone text,
  whatsapp text,
  email text,
  website text,
  address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_published boolean default false,
  is_featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_coops_published on public.transport_cooperatives(is_published);

-- =====================================================================
-- TABLA: transport_routes (rutas de cada cooperativa con horarios)
-- =====================================================================
create table if not exists public.transport_routes (
  id uuid primary key default uuid_generate_v4(),
  cooperative_id uuid not null references public.transport_cooperatives(id) on delete cascade,
  origin text not null,
  destination text not null,
  schedule_start text,        -- ej: "04:00"
  schedule_end text,          -- ej: "21:00"
  frequency text,             -- ej: "Cada 7 min" / "Cada 3 horas"
  fare numeric(6,2),
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_routes_coop on public.transport_routes(cooperative_id);

-- =====================================================================
-- TABLA: business_hours (horarios estructurados día por día)
-- =====================================================================
create table if not exists public.business_hours (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  -- 0 = domingo, 1 = lunes ... 6 = sábado
  open_time text,             -- "08:00" o null si cerrado
  close_time text,            -- "18:00" o null si cerrado
  is_closed boolean default false
);
create index if not exists idx_hours_business on public.business_hours(business_id);

-- =====================================================================
-- TABLA: favorites (negocios guardados por el usuario)
-- =====================================================================
create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, business_id)
);

-- =====================================================================
-- TABLA: business_promotions (promociones / descuentos)
-- =====================================================================
create table if not exists public.business_promotions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  image text,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists idx_promos_business on public.business_promotions(business_id);

-- =====================================================================
-- TABLA: banners (banners hero rotativos del home, gestionados por admin)
-- =====================================================================
create table if not exists public.banners (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  image text not null,
  link text,
  is_active boolean default true,
  sort_order int default 0,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- =====================================================================
-- TABLA: app_settings (clave-valor para que admin edite textos/colores)
-- Nada queda hardcoded: nombre de la app, lema, teléfono GAD, etc.
-- =====================================================================
create table if not exists public.app_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- =====================================================================
-- RLS para las tablas nuevas
-- =====================================================================
alter table public.professionals enable row level security;
alter table public.transport_cooperatives enable row level security;
alter table public.transport_routes enable row level security;
alter table public.business_hours enable row level security;
alter table public.favorites enable row level security;
alter table public.business_promotions enable row level security;
alter table public.banners enable row level security;
alter table public.app_settings enable row level security;

-- helper: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ----------- professionals -----------
drop policy if exists "Professionals public read" on public.professionals;
create policy "Professionals public read" on public.professionals
  for select using (is_published = true or public.is_admin());
drop policy if exists "Admins manage professionals" on public.professionals;
create policy "Admins manage professionals" on public.professionals
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------- transport_cooperatives -----------
drop policy if exists "Coops public read" on public.transport_cooperatives;
create policy "Coops public read" on public.transport_cooperatives
  for select using (is_published = true or public.is_admin());
drop policy if exists "Admins manage coops" on public.transport_cooperatives;
create policy "Admins manage coops" on public.transport_cooperatives
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------- transport_routes -----------
drop policy if exists "Routes public read" on public.transport_routes;
create policy "Routes public read" on public.transport_routes
  for select using (true);
drop policy if exists "Admins manage routes" on public.transport_routes;
create policy "Admins manage routes" on public.transport_routes
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------- business_hours -----------
drop policy if exists "Hours public read" on public.business_hours;
create policy "Hours public read" on public.business_hours for select using (true);
drop policy if exists "Owners manage hours" on public.business_hours;
create policy "Owners manage hours" on public.business_hours
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.owner_id = auth.uid() or public.is_admin()))
  );

-- ----------- favorites -----------
drop policy if exists "Users see own favs" on public.favorites;
create policy "Users see own favs" on public.favorites for select using (auth.uid() = user_id);
drop policy if exists "Users add own favs" on public.favorites;
create policy "Users add own favs" on public.favorites for insert with check (auth.uid() = user_id);
drop policy if exists "Users remove own favs" on public.favorites;
create policy "Users remove own favs" on public.favorites for delete using (auth.uid() = user_id);

-- ----------- business_promotions -----------
drop policy if exists "Promos public read" on public.business_promotions;
create policy "Promos public read" on public.business_promotions
  for select using (is_active = true and (ends_at is null or ends_at > now()));
drop policy if exists "Owners manage promos" on public.business_promotions;
create policy "Owners manage promos" on public.business_promotions
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.owner_id = auth.uid() or public.is_admin()))
  );

-- ----------- banners -----------
drop policy if exists "Banners public read" on public.banners;
create policy "Banners public read" on public.banners for select using (is_active = true);
drop policy if exists "Admins manage banners" on public.banners;
create policy "Admins manage banners" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------- app_settings -----------
drop policy if exists "Settings public read" on public.app_settings;
create policy "Settings public read" on public.app_settings for select using (true);
drop policy if exists "Admins manage settings" on public.app_settings;
create policy "Admins manage settings" on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Refuerzo: que admin pueda gestionar TODO en categorías y negocios
-- =====================================================================
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage businesses" on public.businesses;
create policy "Admins manage businesses" on public.businesses
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage marketplace" on public.marketplace_items;
create policy "Admins manage marketplace" on public.marketplace_items
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Settings iniciales (vacíos — los llena el admin desde la UI)
-- =====================================================================
insert into public.app_settings (key, value) values
  ('site.name',        '"Mejía Travel"'::jsonb),
  ('site.tagline',     '"Todo lo que buscas en el Cantón Mejía"'::jsonb),
  ('site.gad_phone',   '""'::jsonb),
  ('site.gad_email',   '""'::jsonb),
  ('site.gad_address', '""'::jsonb),
  ('site.center_lat',  '-0.5081'::jsonb),
  ('site.center_lng',  '-78.5680'::jsonb)
on conflict (key) do nothing;
