-- ============================================
-- UCV MATCH - SUPABASE DATABASE SCHEMA
-- Sistema de Mentorías para Estudiantes
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLA PROFILES (Extensión de auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    codigo_estudiante TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('Estudiante', 'Mentor')),
    carrera TEXT,
    ciclo INTEGER,
    promedio DECIMAL(4, 2) CHECK (promedio >= 0 AND promedio <= 20),
    estilo_aprendizaje TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_codigo_estudiante ON public.profiles(codigo_estudiante);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON public.profiles(rol);
CREATE INDEX IF NOT EXISTS idx_profiles_carrera ON public.profiles(carrera);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 2. TABLA MENTORIAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.mentorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    estudiante_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Activa', 'Completada', 'Cancelada')),
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    materia TEXT NOT NULL,
    descripcion TEXT,
    fecha_activacion TIMESTAMP WITH TIME ZONE,
    fecha_completada TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT mentorias_not_same_user CHECK (estudiante_id != mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_mentorias_estudiante_id ON public.mentorias(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_mentorias_mentor_id ON public.mentorias(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorias_estado ON public.mentorias(estado);
CREATE INDEX IF NOT EXISTS idx_mentorias_materia ON public.mentorias(materia);

DROP TRIGGER IF EXISTS mentorias_updated_at ON public.mentorias;
CREATE TRIGGER mentorias_updated_at
    BEFORE UPDATE ON public.mentorias
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 3. TABLA CHAT_MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sala_id TEXT NOT NULL,
    emisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receptor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'archivo')),
    archivo_url TEXT,
    archivo_nombre TEXT,
    archivo_tamano INTEGER,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT chat_messages_not_same_user CHECK (emisor_id != receptor_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sala_id ON public.chat_messages(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_emisor_id ON public.chat_messages(emisor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receptor_id ON public.chat_messages(receptor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_fecha ON public.chat_messages(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_leido ON public.chat_messages(leido);

-- ============================================
-- 4. TABLA RECURSOS (Biblioteca)
-- ============================================

CREATE TABLE IF NOT EXISTS public.recursos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('PDF', 'PPT', 'Imagen', 'Video', 'Documento', 'Otro')),
    url TEXT NOT NULL,
    categoria TEXT NOT NULL,
    subido_por UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    descargas INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    etiquetas TEXT[],
    tamano_archivo INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recursos_categoria ON public.recursos(categoria);
CREATE INDEX IF NOT EXISTS idx_recursos_tipo ON public.recursos(tipo);
CREATE INDEX IF NOT EXISTS idx_recursos_subido_por ON public.recursos(subido_por);
CREATE INDEX IF NOT EXISTS idx_recursos_fecha_subida ON public.recursos(fecha_subida DESC);
CREATE INDEX IF NOT EXISTS idx_recursos_titulo ON public.recursos(titulo);

DROP TRIGGER IF EXISTS recursos_updated_at ON public.recursos;
CREATE TRIGGER recursos_updated_at
    BEFORE UPDATE ON public.recursos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS PARA PROFILES
-- ============================================

-- All authenticated users can view all profiles (needed for chat)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Mentors can view student profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles"
    ON public.profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS RLS PARA MENTORIAS
-- ============================================

DROP POLICY IF EXISTS "Students can view own mentorships" ON public.mentorias;
CREATE POLICY "Students can view own mentorships"
    ON public.mentorias FOR SELECT
    USING (auth.uid() = estudiante_id);

DROP POLICY IF EXISTS "Mentors can view received mentorships" ON public.mentorias;
CREATE POLICY "Mentors can view received mentorships"
    ON public.mentorias FOR SELECT
    USING (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Students can create mentorship requests" ON public.mentorias;
CREATE POLICY "Students can create mentorship requests"
    ON public.mentorias FOR INSERT
    WITH CHECK (auth.uid() = estudiante_id);

DROP POLICY IF EXISTS "Mentors can update received mentorships" ON public.mentorias;
CREATE POLICY "Mentors can update received mentorships"
    ON public.mentorias FOR UPDATE
    USING (auth.uid() = mentor_id)
    WITH CHECK (auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Students can cancel own mentorships" ON public.mentorias;
CREATE POLICY "Students can cancel own mentorships"
    ON public.mentorias FOR UPDATE
    USING (auth.uid() = estudiante_id AND estado = 'Pendiente')
    WITH CHECK (auth.uid() = estudiante_id AND estado = 'Cancelada');

-- ============================================
-- POLÍTICAS RLS PARA CHAT_MESSAGES
-- ============================================

DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages"
    ON public.chat_messages FOR SELECT
    USING (auth.uid() = emisor_id OR auth.uid() = receptor_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
CREATE POLICY "Users can insert own messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (auth.uid() = emisor_id);

DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;
CREATE POLICY "Users can update own messages"
    ON public.chat_messages FOR UPDATE
    USING (auth.uid() = emisor_id)
    WITH CHECK (auth.uid() = emisor_id);

DROP POLICY IF EXISTS "Users can mark received messages as read" ON public.chat_messages;
CREATE POLICY "Users can mark received messages as read"
    ON public.chat_messages FOR UPDATE
    USING (auth.uid() = receptor_id)
    WITH CHECK (auth.uid() = receptor_id AND leido = TRUE);

-- ============================================
-- POLÍTICAS RLS PARA RECURSOS
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can view resources" ON public.recursos;
CREATE POLICY "Authenticated users can view resources"
    ON public.recursos FOR SELECT
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert resources" ON public.recursos;
CREATE POLICY "Authenticated users can insert resources"
    ON public.recursos FOR INSERT
    WITH CHECK (auth.uid() = subido_por);

DROP POLICY IF EXISTS "Users can update own resources" ON public.recursos;
CREATE POLICY "Users can update own resources"
    ON public.recursos FOR UPDATE
    USING (auth.uid() = subido_por)
    WITH CHECK (auth.uid() = subido_por);

DROP POLICY IF EXISTS "Users can delete own resources" ON public.recursos;
CREATE POLICY "Users can delete own resources"
    ON public.recursos FOR DELETE
    USING (auth.uid() = subido_por);

-- ============================================
-- 6. FUNCIONES HELPER
-- ============================================

CREATE OR REPLACE FUNCTION public.incrementar_descargas(p_recurso_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.recursos
    SET descargas = descargas + 1
    WHERE id = p_recurso_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.toggle_like_recurso(p_recurso_id UUID, p_usuario_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_likes INTEGER;
BEGIN
    UPDATE public.recursos
    SET likes = likes + 1
    WHERE id = p_recurso_id;
    
    SELECT likes INTO v_likes FROM public.recursos WHERE id = p_recurso_id;
    RETURN v_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.crear_sala_chat(p_usuario1 UUID, p_usuario2 UUID)
RETURNS TEXT AS $$
DECLARE
    v_sala_id TEXT;
BEGIN
    v_sala_id := LEAST(p_usuario1::TEXT, p_usuario2::TEXT) || '_' || GREATEST(p_usuario1::TEXT, p_usuario2::TEXT);
    RETURN v_sala_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. TRIGGER PARA CREAR PROFILE AUTOMÁTICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nombre_completo, codigo_estudiante, email, rol, carrera, ciclo, promedio, estilo_aprendizaje)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'codigo_estudiante', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'rol', 'Estudiante'),
        COALESCE(NEW.raw_user_meta_data->>'carrera', NULL),
        COALESCE((NEW.raw_user_meta_data->>'ciclo')::INTEGER, NULL),
        COALESCE((NEW.raw_user_meta_data->>'promedio')::DECIMAL, NULL),
        COALESCE(NEW.raw_user_meta_data->>'estilo_aprendizaje', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. DATOS INICIALES DE PRUEBA
-- ============================================

-- Ejemplo de inserción de profiles (descomentar y usar UUIDs reales de auth.users)
/*
-- Insertar Estudiante de prueba
INSERT INTO public.profiles (id, nombre_completo, codigo_estudiante, email, rol, carrera, ciclo, promedio, estilo_aprendizaje)
VALUES (
    'UUID_DEL_ESTUDIANTE_DESDE_AUTH',
    'Juan Pérez García',
    '20230001',
    'juan.perez@ucv.edu.pe',
    'Estudiante',
    'Ingeniería de Sistemas',
    3,
    15.50,
    'Visual'
);

-- Insertar Mentor de prueba
INSERT INTO public.profiles (id, nombre_completo, codigo_estudiante, email, rol, carrera, ciclo, promedio, estilo_aprendizaje)
VALUES (
    'UUID_DEL_MENTOR_DESDE_AUTH',
    'María Rodríguez López',
    '20190500',
    'maria.rodriguez@ucv.edu.pe',
    'Mentor',
    'Ingeniería de Sistemas',
    10,
    18.75,
    'Auditivo'
);

-- Insertar mentoría de prueba
INSERT INTO public.mentorias (estudiante_id, mentor_id, estado, materia, descripcion)
VALUES (
    'UUID_DEL_ESTUDIANTE_DESDE_AUTH',
    'UUID_DEL_MENTOR_DESDE_AUTH',
    'Pendiente',
    'Estructuras de Datos',
    'Necesito ayuda con árboles y grafos'
);

-- Insertar mensaje de prueba
INSERT INTO public.chat_messages (sala_id, emisor_id, receptor_id, mensaje, tipo)
VALUES (
    'sala_uuid_estudiante_uuid_mentor',
    'UUID_DEL_ESTUDIANTE_DESDE_AUTH',
    'UUID_DEL_MENTOR_DESDE_AUTH',
    'Hola, ¿podrías ayudarme con estructuras de datos?',
    'texto'
);

-- Insertar recurso de prueba
INSERT INTO public.recursos (titulo, descripcion, tipo, url, categoria, subido_por, etiquetas)
VALUES (
    'Guía de Árboles Binarios',
    'Apuntes completos sobre árboles binarios con ejemplos',
    'PDF',
    'https://storage.supabase.co/mentorlink-archivos/arboles-binarios.pdf',
    'Programación',
    'UUID_DEL_MENTOR_DESDE_AUTH',
    ARRAY['árboles', 'estructuras', 'algoritmos']
);
*/

-- ============================================
-- 9. VISTAS ÚTILES
-- ============================================

CREATE OR REPLACE VIEW public.v_mentorias_detalle AS
SELECT 
    m.id,
    m.estado,
    m.fecha_solicitud,
    m.materia,
    m.descripcion,
    m.fecha_activacion,
    m.fecha_completada,
    e.nombre_completo AS estudiante_nombre,
    e.codigo_estudiante AS estudiante_codigo,
    e.email AS estudiante_email,
    ment.nombre_completo AS mentor_nombre,
    ment.codigo_estudiante AS mentor_codigo,
    ment.email AS mentor_email
FROM public.mentorias m
JOIN public.profiles e ON m.estudiante_id = e.id
JOIN public.profiles ment ON m.mentor_id = ment.id;

CREATE OR REPLACE VIEW public.v_recursos_detalle AS
SELECT 
    r.id,
    r.titulo,
    r.descripcion,
    r.tipo,
    r.url,
    r.categoria,
    r.fecha_subida,
    r.descargas,
    r.likes,
    r.etiquetas,
    r.tamano_archivo,
    p.nombre_completo AS subido_por_nombre,
    p.email AS subido_por_email,
    p.rol AS subido_por_rol
FROM public.recursos r
JOIN public.profiles p ON r.subido_por = p.id;

CREATE OR REPLACE VIEW public.v_estadisticas_mentorias AS
SELECT 
    p.nombre_completo,
    p.rol,
    COUNT(m.id) AS total_mentorias,
    COUNT(CASE WHEN m.estado = 'Activa' THEN 1 END) AS mentorias_activas,
    COUNT(CASE WHEN m.estado = 'Completada' THEN 1 END) AS mentorias_completadas,
    COUNT(CASE WHEN m.estado = 'Pendiente' THEN 1 END) AS mentorias_pendientes
FROM public.profiles p
LEFT JOIN public.mentorias m ON (p.id = m.estudiante_id OR p.id = m.mentor_id)
GROUP BY p.id, p.nombre_completo, p.rol;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
