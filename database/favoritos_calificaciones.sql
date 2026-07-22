-- Tabla de favoritos (usuarios guardan mentores como favoritos)
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, mentor_id)
);

-- Tabla de calificaciones (usuarios califican mentores)
CREATE TABLE IF NOT EXISTS public.calificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calificacion NUMERIC(3,1) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(mentor_id, usuario_id)
);

-- RLS
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos
CREATE POLICY "Usuarios autenticados pueden ver sus favoritos"
  ON public.favoritos FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios autenticados pueden insertar sus favoritos"
  ON public.favoritos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios autenticados pueden eliminar sus favoritos"
  ON public.favoritos FOR DELETE
  USING (auth.uid() = usuario_id);

-- Políticas para calificaciones
CREATE POLICY "Calificaciones visibles para todos"
  ON public.calificaciones FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden calificar"
  ON public.calificaciones FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus calificaciones"
  ON public.calificaciones FOR UPDATE
  USING (auth.uid() = usuario_id);
