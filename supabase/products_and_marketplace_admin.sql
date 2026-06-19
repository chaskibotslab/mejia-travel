-- =====================================================================
-- 1) TABLA: business_products — catálogo de cada negocio
-- =====================================================================
create table if not exists public.business_products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  category text,                -- texto libre (Bebidas, Repuestos, Verduras…)
  price numeric(10,2),
  currency text default 'USD',
  image text,
  sku text,
  stock int,
  is_published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_bp_business on public.business_products(business_id);
create index if not exists idx_bp_category on public.business_products(category);
create index if not exists idx_bp_published on public.business_products(is_published);

alter table public.business_products enable row level security;
drop policy if exists "Public read published products" on public.business_products;
create policy "Public read published products" on public.business_products
  for select using (is_published = true or public.is_admin());
drop policy if exists "Only admins manage products" on public.business_products;
create policy "Only admins manage products" on public.business_products
  for all using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- 2) Configuración general (duración de publicaciones del mercado, etc.)
--    Si no existe app_settings, la creamos.
-- =====================================================================
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
alter table public.app_settings enable row level security;
drop policy if exists "Public read settings" on public.app_settings;
create policy "Public read settings" on public.app_settings for select using (true);
drop policy if exists "Only admins write settings" on public.app_settings;
create policy "Only admins write settings" on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Duración por defecto de publicaciones del marketplace en horas
insert into public.app_settings (key, value) values
  ('marketplace_default_hours', '48'::jsonb)
on conflict (key) do nothing;

-- =====================================================================
-- 3) Función que limpia publicaciones expiradas + vendidas (>30 días)
--    Se puede llamar desde un cron (pg_cron) o manualmente desde el admin.
-- =====================================================================
create or replace function public.cleanup_expired_marketplace()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare deleted int;
begin
  delete from public.marketplace_items
   where (expires_at < now() - interval '7 days')
      or (is_sold = true and created_at < now() - interval '30 days');
  get diagnostics deleted = row_count;
  return deleted;
end $$;

-- =====================================================================
-- LISTO
-- =====================================================================
