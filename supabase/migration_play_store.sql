-- =====================================================================
-- MIGRACIÓN: Funciones requeridas para Google Play Store
-- (reportes, bloqueo de usuarios, moderación)
-- Ejecutar en Supabase SQL Editor (Dashboard -> SQL -> New query)
-- =====================================================================

-- 1. TABLA REPORTS (reportar publicaciones)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'marketplace',
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reporter_id, post_id)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create own reports" ON reports;
CREATE POLICY "Users create own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users view own reports" ON reports;
CREATE POLICY "Users view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins manage reports" ON reports;
CREATE POLICY "Admins manage reports" ON reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. TABLA USER_BLOCKS (bloquear usuarios)
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own blocks" ON user_blocks;
CREATE POLICY "Users manage own blocks" ON user_blocks
  FOR ALL USING (auth.uid() = blocker_id);

-- 3. AGREGAR COLUMNAS A MARKETPLACE_ITEMS (moderación + términos)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='moderation_status') THEN
    ALTER TABLE marketplace_items ADD COLUMN moderation_status TEXT DEFAULT 'approved';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='nsfw_score') THEN
    ALTER TABLE marketplace_items ADD COLUMN nsfw_score JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='marketplace_items' AND column_name='terms_accepted_at') THEN
    ALTER TABLE marketplace_items ADD COLUMN terms_accepted_at TIMESTAMPTZ;
  END IF;
END $$;
