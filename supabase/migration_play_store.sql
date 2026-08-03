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

-- 4. COLUMNAS PARA CANDIDATOS POLÍTICOS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='formacion_academica') THEN
    ALTER TABLE businesses ADD COLUMN formacion_academica TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='experiencia_laboral') THEN
    ALTER TABLE businesses ADD COLUMN experiencia_laboral TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='propuestas_gobierno') THEN
    ALTER TABLE businesses ADD COLUMN propuestas_gobierno TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='businesses' AND column_name='movimiento_politico') THEN
    ALTER TABLE businesses ADD COLUMN movimiento_politico TEXT;
  END IF;
END $$;

-- 5. ARREGLO: permitir 'like' en business_analytics
ALTER TABLE public.business_analytics DROP CONSTRAINT IF EXISTS business_analytics_event_type_check;
ALTER TABLE public.business_analytics ADD CONSTRAINT business_analytics_event_type_check
  CHECK (event_type in ('view','call','whatsapp','map','website','like'));

-- Permitir lectura pública (para contar likes/vistas)
DROP POLICY IF EXISTS "Public can count analytics" ON public.business_analytics;
CREATE POLICY "Public can count analytics" ON public.business_analytics
  FOR SELECT USING (true);

-- Reemplazar política de insert: vistas anónimas OK, likes requieren auth
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.business_analytics;
CREATE POLICY "Anyone can insert analytics" ON public.business_analytics
  FOR INSERT WITH CHECK (
    event_type != 'like' OR (event_type = 'like' AND auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Permitir a usuarios borrar sus propios likes (unlike)
DROP POLICY IF EXISTS "Users can delete own likes" ON public.business_analytics;
CREATE POLICY "Users can delete own likes" ON public.business_analytics
  FOR DELETE USING (user_id = auth.uid());

-- Índice único: un like por usuario por negocio (evitar duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_like_per_user
  ON public.business_analytics(business_id, user_id)
  WHERE event_type = 'like';
