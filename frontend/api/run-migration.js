export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Method not allowed' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ success: false, message: 'Faltan variables de entorno' })
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
  }

  try {
    const results = {}

    // Verificar favoritos
    const favResp = await fetch(`${supabaseUrl}/rest/v1/favoritos?select=id&limit=1`, { headers })
    results.favoritos = favResp.ok ? 'OK' : `Error ${favResp.status}: ${await favResp.text()}`

    // Verificar calificaciones
    const calResp = await fetch(`${supabaseUrl}/rest/v1/calificaciones?select=id&limit=1`, { headers })
    results.calificaciones = calResp.ok ? 'OK' : `Error ${calResp.status}: ${await calResp.text()}`

    const allOk = results.favoritos === 'OK' && results.calificaciones === 'OK'

    if (allOk) {
      return res.json({ success: true, message: 'Ambas tablas existen', results })
    }

    // Si falta alguna, devolver SQL
    const sql = `
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, mentor_id)
);
CREATE TABLE IF NOT EXISTS public.calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calificacion NUMERIC(3,1) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mentor_id, usuario_id)
);
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuarios autenticados pueden ver sus favoritos' AND tablename = 'favoritos') THEN
    CREATE POLICY "Usuarios autenticados pueden ver sus favoritos" ON public.favoritos FOR SELECT USING (auth.uid() = usuario_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuarios autenticados pueden insertar sus favoritos' AND tablename = 'favoritos') THEN
    CREATE POLICY "Usuarios autenticados pueden insertar sus favoritos" ON public.favoritos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuarios autenticados pueden eliminar sus favoritos' AND tablename = 'favoritos') THEN
    CREATE POLICY "Usuarios autenticados pueden eliminar sus favoritos" ON public.favoritos FOR DELETE USING (auth.uid() = usuario_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Calificaciones visibles para todos' AND tablename = 'calificaciones') THEN
    CREATE POLICY "Calificaciones visibles para todos" ON public.calificaciones FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuarios autenticados pueden calificar' AND tablename = 'calificaciones') THEN
    CREATE POLICY "Usuarios autenticados pueden calificar" ON public.calificaciones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
  END IF;
END $$;
`
    return res.status(200).json({
      success: false,
      needsManualMigration: true,
      results,
      message: 'Faltan tablas. Ejecuta el SQL manualmente en el SQL Editor de Supabase.',
      sql,
      sqlEditorUrl: 'https://supabase.com/dashboard/project/baelhtrbulusonjbdtor/sql/new',
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error: ' + err.message })
  }
}
