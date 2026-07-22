-- ============================================================
-- Migración: Renombrar columnas en calificaciones + agregar nuevas
-- ============================================================

-- 1. Renombrar columnas existentes (si existen con el nombre viejo)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calificaciones' AND column_name = 'mentor_id'
  ) THEN
    ALTER TABLE calificaciones RENAME COLUMN mentor_id TO id_mentor_calificado;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calificaciones' AND column_name = 'calificacion'
  ) THEN
    ALTER TABLE calificaciones RENAME COLUMN calificacion TO puntaje;
  END IF;
END $$;

-- 2. Agregar columnas faltantes (si no existen)
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS id_estudiante_calificador UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS id_mentoria UUID REFERENCES mentorias(id) ON DELETE SET NULL;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 3. Asegurar que la columna puntaje tenga el CHECK correcto
ALTER TABLE calificaciones DROP CONSTRAINT IF EXISTS calificaciones_puntaje_check;
ALTER TABLE calificaciones ADD CONSTRAINT calificaciones_puntaje_check CHECK (puntaje >= 1 AND puntaje <= 5);

-- 4. Convertir id a UUID si es necesario (si la tabla se creó con otro tipo)
-- (se asume que ya es UUID por la sintaxis gen_random_uuid() usada antes)

-- 5. Indices
CREATE INDEX IF NOT EXISTS idx_calificaciones_mentor ON calificaciones(id_mentor_calificado);
CREATE INDEX IF NOT EXISTS idx_calificaciones_estudiante ON calificaciones(id_estudiante_calificador);

-- 6. Columna disponible en profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disponible BOOLEAN DEFAULT true;

-- 7. RLS
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Estudiantes pueden insertar sus calificaciones" ON calificaciones;
CREATE POLICY "Estudiantes pueden insertar sus calificaciones"
  ON calificaciones FOR INSERT
  WITH CHECK (auth.uid() = id_estudiante_calificador);

DROP POLICY IF EXISTS "Cualquiera puede leer calificaciones" ON calificaciones;
CREATE POLICY "Cualquiera puede leer calificaciones"
  ON calificaciones FOR SELECT
  USING (true);

-- 8. Función para calcular promedio (reemplazar si ya existe)
CREATE OR REPLACE FUNCTION get_mentor_rating(p_mentor_id UUID)
RETURNS TABLE(promedio NUMERIC, total_resenas BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT ROUND(AVG(puntaje)::numeric, 1) as promedio, COUNT(*)::bigint as total_resenas
  FROM calificaciones
  WHERE id_mentor_calificado = p_mentor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
