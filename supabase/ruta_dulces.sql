-- =====================================================================
-- RUTA DE LOS DULCES (Halloween) — rutas tipo "evento" con muchos locales
-- Ejecutar DESPUÉS de tourist_routes.sql
--
-- 1) Migración ADITIVA: solo agrega columnas opcionales. Las rutas
--    existentes quedan con display_mode = 'linear' y se ven igual que antes.
-- 2) Crea la ruta OCULTA (is_published = false): solo los admins la ven
--    en /rutas/ruta-de-los-dulces. Los locales están en
--    ruta_dulces_locales_reales.sql.
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
-- RUTA
-- ---------------------------------------------------------------------
insert into public.tourist_routes (slug, name, description, short_description, cover_image, duration_hours, difficulty, distance_km, color, starting_point, is_published, is_featured, sort_order, display_mode) values
  (
    'ruta-de-los-dulces',
    'Ruta de los Dulces 🎃',
    'Este Halloween recorre los locales participantes del Cantón Mejía y llena tu funda de dulces. Usa el mapa para encontrar los locales más cercanos, marca los que ya visitaste y no te pierdas ninguno. ¡Ven disfrazado!',
    'Los locales del Cantón Mejía entregan dulces este Halloween',
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

-- Los locales reales se cargan con ruta_dulces_locales_reales.sql
-- (el seed demo de 30 locales ficticios se eliminó)
