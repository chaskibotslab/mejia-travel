-- =====================================================================
-- MEJ\u00cdA TRAVEL - Supabase Schema
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor > New Query
-- =====================================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- =====================================================================
-- TABLA: profiles (usuarios extendidos)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','owner','admin')),
  created_at timestamptz default now()
);

-- =====================================================================
-- TABLA: categories (categor\u00edas principales y subcategor\u00edas)
-- =====================================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid references public.categories(id) on delete cascade,
  slug text unique not null,
  name_es text not null,
  name_en text,
  icon text,
  color text default '#1B97A3',
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_categories_slug on public.categories(slug);

-- =====================================================================
-- TABLA: businesses (empresas / emprendimientos)
-- =====================================================================
create table if not exists public.businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  slug text unique not null,
  name text not null,
  description text,
  short_description text,

  -- contacto
  phone text,
  whatsapp text,
  email text,
  website text,
  facebook text,
  instagram text,
  tiktok text,

  -- direcci\u00f3n y ubicaci\u00f3n
  address text,
  address_branch_1 text,
  address_branch_2 text,
  owner_name text,
  latitude numeric(10,7),
  longitude numeric(10,7),

  -- contenido multimedia
  cover_image text,
  gallery jsonb default '[]'::jsonb,
  catalog_pdf text,
  logo text,

  -- horario (estructura simple)
  schedule jsonb default '{}'::jsonb,

  -- estado y planes
  is_published boolean default false,
  is_featured boolean default false,
  is_verified boolean default false,
  plan text default 'free' check (plan in ('free','premium')),
  premium_until timestamptz,

  -- m\u00e9tricas
  views_count int default 0,
  calls_count int default 0,
  whatsapp_count int default 0,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_businesses_category on public.businesses(category_id);
create index if not exists idx_businesses_owner on public.businesses(owner_id);
create index if not exists idx_businesses_published on public.businesses(is_published);
create index if not exists idx_businesses_name_trgm on public.businesses using gin (name gin_trgm_ops);

-- =====================================================================
-- TABLA: reviews (rese\u00f1as)
-- =====================================================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(business_id, user_id)
);

create index if not exists idx_reviews_business on public.reviews(business_id);

-- Trigger para actualizar rating_avg y rating_count
create or replace function public.update_business_rating()
returns trigger as $$
begin
  update public.businesses b
  set
    rating_avg = coalesce((select avg(rating)::numeric(3,2) from public.reviews where business_id = b.id), 0),
    rating_count = (select count(*) from public.reviews where business_id = b.id)
  where b.id = coalesce(new.business_id, old.business_id);
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_update_business_rating on public.reviews;
create trigger trg_update_business_rating
after insert or update or delete on public.reviews
for each row execute function public.update_business_rating();

-- =====================================================================
-- TABLA: events (eventos / agenda cultural)
-- =====================================================================
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  cover_image text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  organizer text,
  contact_phone text,
  category text,
  is_published boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_events_starts on public.events(starts_at);

-- =====================================================================
-- TABLA: marketplace_items (art\u00edculos en venta - 48h)
-- =====================================================================
create table if not exists public.marketplace_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric(10,2) not null,
  currency text default 'USD',
  category text,
  condition text check (condition in ('nuevo','usado','seminuevo')),
  images jsonb default '[]'::jsonb,
  phone text,
  whatsapp text,
  location text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_featured boolean default false,
  featured_until timestamptz,
  expires_at timestamptz not null default (now() + interval '48 hours'),
  is_sold boolean default false,
  views_count int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_marketplace_expires on public.marketplace_items(expires_at);
create index if not exists idx_marketplace_user on public.marketplace_items(user_id);

-- =====================================================================
-- TABLA: business_analytics (eventos para due\u00f1os)
-- =====================================================================
create table if not exists public.business_analytics (
  id bigserial primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  event_type text not null check (event_type in ('view','call','whatsapp','map','website')),
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_analytics_business on public.business_analytics(business_id, created_at desc);

-- =====================================================================
-- RLS (Row Level Security)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.reviews enable row level security;
alter table public.events enable row level security;
alter table public.marketplace_items enable row level security;
alter table public.business_analytics enable row level security;

-- profiles
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- categories (lectura p\u00fablica)
drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public" on public.categories for select using (true);

-- businesses
drop policy if exists "Published businesses are public" on public.businesses;
create policy "Published businesses are public" on public.businesses for select using (is_published = true or auth.uid() = owner_id);
drop policy if exists "Owners can update their businesses" on public.businesses;
create policy "Owners can update their businesses" on public.businesses for update using (auth.uid() = owner_id);
drop policy if exists "Owners can insert their businesses" on public.businesses;
create policy "Owners can insert their businesses" on public.businesses for insert with check (auth.uid() = owner_id);

-- reviews
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews for select using (true);
drop policy if exists "Auth users can review" on public.reviews;
create policy "Auth users can review" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "Users can edit own reviews" on public.reviews;
create policy "Users can edit own reviews" on public.reviews for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own reviews" on public.reviews;
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- events
drop policy if exists "Events are public" on public.events;
create policy "Events are public" on public.events for select using (is_published = true);

-- marketplace
drop policy if exists "Active marketplace items are public" on public.marketplace_items;
create policy "Active marketplace items are public" on public.marketplace_items for select using (expires_at > now() and is_sold = false);
drop policy if exists "Users manage own items" on public.marketplace_items;
create policy "Users manage own items" on public.marketplace_items for all using (auth.uid() = user_id);

-- analytics: solo el due\u00f1o puede leer
drop policy if exists "Owners read own analytics" on public.business_analytics;
create policy "Owners read own analytics" on public.business_analytics
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
drop policy if exists "Anyone can insert analytics" on public.business_analytics;
create policy "Anyone can insert analytics" on public.business_analytics for insert with check (true);

-- =====================================================================
-- FUNCI\u00d3N: limpiar marketplace expirado (llamar peri\u00f3dicamente)
-- =====================================================================
create or replace function public.cleanup_expired_marketplace()
returns void as $$
begin
  delete from public.marketplace_items where expires_at < now() - interval '7 days';
end;
$$ language plpgsql;

-- =====================================================================
-- FUNCI\u00d3N: registrar usuario nuevo (trigger en auth.users)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
