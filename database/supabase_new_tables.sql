-- ============================================
-- UCV MATCH - NEW TABLES MIGRATION
-- Conectar todos los paneles a Supabase
-- ============================================

-- ============================================
-- 1. PUBLICACIONES (Comunidad Feed)
-- ============================================
CREATE TABLE IF NOT EXISTS public.publicaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    autor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    imagen_url TEXT,
    likes INTEGER DEFAULT 0,
    comentarios INTEGER DEFAULT 0,
    compartidos INTEGER DEFAULT 0,
    etiquetas TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_publicaciones_autor_id ON public.publicaciones(autor_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_created_at ON public.publicaciones(created_at DESC);

-- ============================================
-- 2. EVENTOS (Comunidad)
-- ============================================
CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Taller', 'Webinar', 'Evento', 'Seminario', 'Otro')),
    asistentes INTEGER DEFAULT 0,
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON public.eventos(fecha);

-- ============================================
-- 3. CURSOS (Catálogo de cursos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cursos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    modulos INTEGER DEFAULT 0,
    horas_totales INTEGER DEFAULT 0,
    nivel TEXT DEFAULT 'Principiante' CHECK (nivel IN ('Principiante', 'Intermedio', 'Avanzado')),
    color TEXT DEFAULT 'bg-blue-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON public.cursos(categoria);
CREATE INDEX IF NOT EXISTS idx_cursos_mentor_id ON public.cursos(mentor_id);

-- ============================================
-- 4. INSCRIPCIONES CURSOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.inscripciones_cursos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    progreso INTEGER DEFAULT 0,
    modulos_completados INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'pendiente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(curso_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_inscripciones_usuario_id ON public.inscripciones_cursos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_curso_id ON public.inscripciones_cursos(curso_id);

-- ============================================
-- 5. LOGROS (Definiciones de logros)
-- ============================================
CREATE TABLE IF NOT EXISTS public.logros (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    icono TEXT DEFAULT 'Star',
    puntos INTEGER DEFAULT 50,
    rarity TEXT DEFAULT 'Común' CHECK (rarity IN ('Común', 'Raro', 'Épico', 'Legendario')),
    condicion_tipo TEXT NOT NULL CHECK (condicion_tipo IN ('mentorias', 'horas', 'cursos', 'dias', 'descargas', 'ayudas', 'calificacion')),
    condicion_valor INTEGER NOT NULL
);

-- ============================================
-- 6. LOGROS USUARIO (Progreso individual)
-- ============================================
CREATE TABLE IF NOT EXISTS public.logros_usuario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    logro_id UUID NOT NULL REFERENCES public.logros(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    progreso INTEGER DEFAULT 0,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(logro_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_logros_usuario_usuario_id ON public.logros_usuario(usuario_id);

-- ============================================
-- 7. XP / NIVELES USUARIO
-- ============================================
CREATE TABLE IF NOT EXISTS public.usuario_xp (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    nivel INTEGER DEFAULT 1,
    xp_actual INTEGER DEFAULT 0,
    xp_total INTEGER DEFAULT 0,
    rango TEXT DEFAULT 'Principiante',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 8. NOTIFICACIONES
-- ============================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('mensaje', 'mentoria', 'logro', 'sistema', 'recordatorio')),
    titulo TEXT NOT NULL,
    contenido TEXT,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON public.notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON public.notificaciones(leido);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON public.notificaciones(created_at DESC);

-- ============================================
-- 9. PREFERENCIAS USUARIO
-- ============================================
CREATE TABLE IF NOT EXISTS public.preferencias_usuario (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    email_notify BOOLEAN DEFAULT TRUE,
    push_notify BOOLEAN DEFAULT TRUE,
    mentorship_reminders BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT FALSE,
    tema_oscuro BOOLEAN DEFAULT FALSE,
    idioma TEXT DEFAULT 'es',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 10. SOLICITUDES VALIDACIÓN (Seniors)
-- ============================================
CREATE TABLE IF NOT EXISTS public.solicitudes_validacion (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
    comentario_admin TEXT,
    revisado_por UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(usuario_id)
);

-- ============================================
-- 11. REPORTES
-- ============================================
CREATE TABLE IF NOT EXISTS public.reportes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'PDF' CHECK (tipo IN ('PDF', 'XLSX')),
    descripcion TEXT,
    tamano TEXT,
    periodo TEXT NOT NULL CHECK (periodo IN ('semanal', 'mensual', 'trimestral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reportes_usuario_id ON public.reportes(usuario_id);

-- ============================================
-- 12. OFERTAS MENTORÍA (Senior)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ofertas_mentoria (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    materia TEXT NOT NULL,
    disponibles INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ofertas_mentor_id ON public.ofertas_mentoria(mentor_id);

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferencias_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_validacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ofertas_mentoria ENABLE ROW LEVEL SECURITY;

-- PUBLICACIONES
DROP POLICY IF EXISTS "Anyone can read publicaciones" ON public.publicaciones;
CREATE POLICY "Anyone can read publicaciones"
    ON public.publicaciones FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert own publicaciones" ON public.publicaciones;
CREATE POLICY "Users can insert own publicaciones"
    ON public.publicaciones FOR INSERT WITH CHECK (auth.uid() = autor_id);

DROP POLICY IF EXISTS "Users can update own publicaciones" ON public.publicaciones;
CREATE POLICY "Users can update own publicaciones"
    ON public.publicaciones FOR UPDATE USING (auth.uid() = autor_id);

DROP POLICY IF EXISTS "Users can delete own publicaciones" ON public.publicaciones;
CREATE POLICY "Users can delete own publicaciones"
    ON public.publicaciones FOR DELETE USING (auth.uid() = autor_id);

-- EVENTOS
DROP POLICY IF EXISTS "Anyone can read eventos" ON public.eventos;
CREATE POLICY "Anyone can read eventos"
    ON public.eventos FOR SELECT USING (auth.uid() IS NOT NULL);

-- CURSOS
DROP POLICY IF EXISTS "Anyone can read cursos" ON public.cursos;
CREATE POLICY "Anyone can read cursos"
    ON public.cursos FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSCRIPCIONES
DROP POLICY IF EXISTS "Users can view own inscripciones" ON public.inscripciones_cursos;
CREATE POLICY "Users can view own inscripciones"
    ON public.inscripciones_cursos FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can insert own inscripciones" ON public.inscripciones_cursos;
CREATE POLICY "Users can insert own inscripciones"
    ON public.inscripciones_cursos FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update own inscripciones" ON public.inscripciones_cursos;
CREATE POLICY "Users can update own inscripciones"
    ON public.inscripciones_cursos FOR UPDATE USING (auth.uid() = usuario_id);

-- LOGROS
DROP POLICY IF EXISTS "Anyone can read logros" ON public.logros;
CREATE POLICY "Anyone can read logros"
    ON public.logros FOR SELECT USING (auth.uid() IS NOT NULL);

-- LOGROS USUARIO
DROP POLICY IF EXISTS "Users can view own logros_usuario" ON public.logros_usuario;
CREATE POLICY "Users can view own logros_usuario"
    ON public.logros_usuario FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update own logros_usuario" ON public.logros_usuario;
CREATE POLICY "Users can update own logros_usuario"
    ON public.logros_usuario FOR UPDATE USING (auth.uid() = usuario_id);

-- XP
DROP POLICY IF EXISTS "Users can view own xp" ON public.usuario_xp;
CREATE POLICY "Users can view own xp"
    ON public.usuario_xp FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update own xp" ON public.usuario_xp;
CREATE POLICY "Users can update own xp"
    ON public.usuario_xp FOR UPDATE USING (auth.uid() = usuario_id);

-- NOTIFICACIONES
DROP POLICY IF EXISTS "Users can view own notificaciones" ON public.notificaciones;
CREATE POLICY "Users can view own notificaciones"
    ON public.notificaciones FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update own notificaciones" ON public.notificaciones;
CREATE POLICY "Users can update own notificaciones"
    ON public.notificaciones FOR UPDATE USING (auth.uid() = usuario_id);

-- PREFERENCIAS
DROP POLICY IF EXISTS "Users can view own preferencias" ON public.preferencias_usuario;
CREATE POLICY "Users can view own preferencias"
    ON public.preferencias_usuario FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can upsert own preferencias" ON public.preferencias_usuario;
CREATE POLICY "Users can upsert own preferencias"
    ON public.preferencias_usuario FOR INSERT WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can update own preferencias" ON public.preferencias_usuario;
CREATE POLICY "Users can update own preferencias"
    ON public.preferencias_usuario FOR UPDATE USING (auth.uid() = usuario_id);

-- SOLICITUDES VALIDACIÓN
DROP POLICY IF EXISTS "Users can view own solicitudes" ON public.solicitudes_validacion;
CREATE POLICY "Users can view own solicitudes"
    ON public.solicitudes_validacion FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Admins can view all solicitudes" ON public.solicitudes_validacion;
CREATE POLICY "Admins can view all solicitudes"
    ON public.solicitudes_validacion FOR SELECT
    USING ((SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'Mentor');

DROP POLICY IF EXISTS "Admins can update solicitudes" ON public.solicitudes_validacion;
CREATE POLICY "Admins can update solicitudes"
    ON public.solicitudes_validacion FOR UPDATE
    USING ((SELECT rol FROM public.profiles WHERE id = auth.uid()) = 'Mentor');

-- REPORTES
DROP POLICY IF EXISTS "Users can view own reportes" ON public.reportes;
CREATE POLICY "Users can view own reportes"
    ON public.reportes FOR SELECT USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Users can insert own reportes" ON public.reportes;
CREATE POLICY "Users can insert own reportes"
    ON public.reportes FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- OFERTAS
DROP POLICY IF EXISTS "Anyone can read ofertas" ON public.ofertas_mentoria;
CREATE POLICY "Anyone can read ofertas"
    ON public.ofertas_mentoria FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Mentors can insert own ofertas" ON public.ofertas_mentoria;
CREATE POLICY "Mentors can insert own ofertas"
    ON public.ofertas_mentoria FOR INSERT WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Mentors can update own ofertas" ON public.ofertas_mentoria;
CREATE POLICY "Mentors can update own ofertas"
    ON public.ofertas_mentoria FOR UPDATE USING (auth.uid() = mentor_id);

-- ============================================
-- TRIGGER: AUTO-CREAR XP ROW ON PROFILE CREATE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_xp()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuario_xp (usuario_id, nivel, xp_actual, xp_total, rango)
    VALUES (NEW.id, 1, 0, 0, 'Principiante');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_xp ON public.profiles;
CREATE TRIGGER on_profile_created_xp
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_xp();

-- ============================================
-- TRIGGER: AUTO-CREAR PREFERENCIAS ON PROFILE CREATE
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_prefs()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.preferencias_usuario (usuario_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_prefs ON public.profiles;
CREATE TRIGGER on_profile_created_prefs
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_prefs();

-- ============================================
-- SEED DATA: LOGROS
-- ============================================
INSERT INTO public.logros (titulo, descripcion, icono, puntos, rarity, condicion_tipo, condicion_valor) VALUES
('Primera Mentoría', 'Completa tu primera sesión de mentoría', 'Star', 50, 'Común', 'mentorias', 1),
('Estrella del Aprendizaje', 'Completa 10 mentorías', 'Trophy', 200, 'Raro', 'mentorias', 10),
('Maratón de Estudio', 'Acumula 50 horas de mentoría', 'Clock', 300, 'Épico', 'horas', 50),
('Maestro del Conocimiento', 'Completa 5 cursos diferentes', 'Crown', 500, 'Legendario', 'cursos', 5),
('Racha de Estudio', 'Mantén una racha de 7 días de estudio', 'Flame', 100, 'Común', 'dias', 7),
('Ayudante Destacado', 'Ayuda a 5 compañeros en la comunidad', 'Medal', 250, 'Raro', 'ayudas', 5),
('Recolector de Recursos', 'Descarga 20 recursos educativos', 'Trophy', 150, 'Común', 'descargas', 20),
('Mentor del Mes', 'Obtén la calificación más alta del mes', 'Crown', 1000, 'Legendario', 'calificacion', 1),
('Velocidad de Aprendizaje', 'Completa un curso en menos de 2 semanas', 'Zap', 150, 'Raro', 'cursos', 1),
('Persistente', 'Inicia sesión por 30 días consecutivos', 'Target', 400, 'Épico', 'dias', 30)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: CURSOS
-- ============================================
-- Nota: Reemplazar UUIDs con IDs reales de mentores después de crear usuarios
-- Estos se insertan con valores por defecto para que la app funcione

-- ============================================
-- SEED DATA: EVENTOS
-- ============================================
INSERT INTO public.eventos (titulo, descripcion, fecha, hora, tipo, asistentes) VALUES
('Taller de Álgebra Lineal', 'Taller práctico de álgebra lineal para universitarios', CURRENT_DATE + INTERVAL '2 days', '10:00', 'Taller', 45),
('Webinar: Introducción a IA', 'Introducción a inteligencia artificial y machine learning', CURRENT_DATE + INTERVAL '4 days', '18:00', 'Webinar', 89),
('Hackathon UCV Match', 'Hackathon de 24 horas para estudiantes', CURRENT_DATE + INTERVAL '8 days', '09:00', 'Evento', 120)
ON CONFLICT DO NOTHING;

-- ============================================
-- RECOMENDACIÓN: DESPUÉS DE EJECUTAR, CORRER ESTO EN SUPABASE SQL EDITOR
-- ============================================
-- Para confirmar emails automáticamente (desarrollo):
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
