-- =====================================================================
-- Agrega un horario global de atención a las cooperativas (oficina/boletería).
-- Esto es independiente de los horarios de cada RUTA.
-- =====================================================================
alter table public.transport_cooperatives
  add column if not exists schedule_general text;

-- Ejemplo de uso desde el admin: "Lunes a Viernes 06:00–20:00, Sábados 06:00–14:00"
