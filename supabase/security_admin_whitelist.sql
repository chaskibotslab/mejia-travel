-- =====================================================================
-- SEGURIDAD EXTRA — Whitelist de emails admin
-- Ejecutar UNA VEZ en Supabase SQL Editor.
-- Solo los emails listados aquí pueden tener role = 'admin', aunque
-- alguien intente modificar la tabla profiles directamente.
-- =====================================================================

-- 1. Tabla de emails autorizados como admin
create table if not exists public.admin_whitelist (
  email text primary key,
  notes text,
  added_at timestamptz default now()
);

-- ➡  CAMBIA estos emails por los tuyos:
insert into public.admin_whitelist (email, notes) values
  ('chaskibots.ia@gmail.com', 'Administrador principal'),
  ('chaskibots@gmail.com',           'Backup admin')
on conflict (email) do nothing;

-- 2. Función que valida si un email puede ser admin
create or replace function public.is_email_allowed_admin(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_whitelist where lower(email) = lower(p_email));
$$;

-- 3. Trigger que protege la tabla profiles:
--    Si alguien intenta poner role='admin' a un email NO autorizado, lo bloquea.
create or replace function public.enforce_admin_whitelist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if new.role = 'admin' then
    select email into v_email from auth.users where id = new.id;
    if not public.is_email_allowed_admin(v_email) then
      raise exception 'Email % no está autorizado para ser admin. Añádelo primero a admin_whitelist.', v_email;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_admin_whitelist on public.profiles;
create trigger trg_enforce_admin_whitelist
  before insert or update of role on public.profiles
  for each row execute function public.enforce_admin_whitelist();

-- 4. Bloquear que cualquiera modifique admin_whitelist desde el cliente:
alter table public.admin_whitelist enable row level security;

drop policy if exists "Nadie lee whitelist" on public.admin_whitelist;
create policy "Nadie lee whitelist" on public.admin_whitelist
  for select using (false);  -- ni siquiera admins desde el cliente

-- (Solo se puede modificar desde el SQL Editor con tu sesión de dueño del proyecto)

-- =====================================================================
-- LISTO. Ahora aunque alguien hackee la app y consiga ejecutar
--   update profiles set role='admin' where email='hacker@evil.com'
-- el trigger lo va a rechazar.
-- =====================================================================
