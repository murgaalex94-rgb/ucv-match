-- ============================================================
-- UCV Match — Script SQL completo para Supabase (PostgreSQL)
-- Ejecutar en el SQL Editor de Supabase en una base de datos vacía.
-- NO depende de auth.users ni triggers externos.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Limpieza previa (seguro para re-ejecución)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS mentorias     CASCADE;
DROP TABLE IF EXISTS profiles      CASCADE;

-- ────────────────────────────────────────────────────────────
-- 1. TABLA: profiles
-- ────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo     VARCHAR(200)  NOT NULL,
  codigo_estudiante   VARCHAR(20)   UNIQUE NOT NULL,
  email               VARCHAR(255)  UNIQUE NOT NULL,
  rol                 VARCHAR(20)   NOT NULL CHECK (rol IN ('Estudiante', 'Mentor')),
  carrera             VARCHAR(150)  NOT NULL,
  ciclo               INTEGER       NOT NULL CHECK (ciclo >= 1 AND ciclo <= 12),
  promedio            DECIMAL(4,2)  NOT NULL CHECK (promedio >= 0 AND promedio <= 20),
  estilo_aprendizaje  VARCHAR(30)   NOT NULL CHECK (estilo_aprendizaje IN ('Visual', 'Auditivo', 'Kinestésico', 'Lecto-Escritura')),
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Índices útiles
CREATE INDEX idx_profiles_rol    ON profiles(rol);
CREATE INDEX idx_profiles_email  ON profiles(email);

-- ────────────────────────────────────────────────────────────
-- 2. TABLA: mentorias
-- ────────────────────────────────────────────────────────────
CREATE TABLE mentorias (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id    UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id        UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  estado           VARCHAR(20)  NOT NULL DEFAULT 'Pendiente'
                     CHECK (estado IN ('Pendiente', 'Activa', 'Completada', 'Cancelada')),
  fecha_solicitud  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  materia          VARCHAR(150) NOT NULL,
  descripcion      TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentorias_estudiante ON mentorias(estudiante_id);
CREATE INDEX idx_mentorias_mentor     ON mentorias(mentor_id);
CREATE INDEX idx_mentorias_estado     ON mentorias(estado);

-- ────────────────────────────────────────────────────────────
-- 3. TABLA: chat_messages
-- ────────────────────────────────────────────────────────────
CREATE TABLE chat_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id      TEXT         NOT NULL,
  emisor_id    UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receptor_id  UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mensaje      TEXT         NOT NULL,
  tipo         VARCHAR(20)  NOT NULL DEFAULT 'texto'
                 CHECK (tipo IN ('texto', 'imagen', 'archivo', 'audio')),
  archivo_url  TEXT,
  leido        BOOLEAN      NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_sala      ON chat_messages(sala_id);
CREATE INDEX idx_chat_emisor    ON chat_messages(emisor_id);
CREATE INDEX idx_chat_receptor  ON chat_messages(receptor_id);

-- ────────────────────────────────────────────────────────────
-- 4. FUNCIÓN AUXILIAR: updated_at automático
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_mentorias_updated_at
  BEFORE UPDATE ON mentorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────
-- 5. DATOS DE PRUEBA
-- ────────────────────────────────────────────────────────────

-- ── 5a. Estudiantes ─────────────────────────────────────────
INSERT INTO profiles (id, nombre_completo, codigo_estudiante, email, rol, carrera, ciclo, promedio, estilo_aprendizaje, avatar_url)
VALUES
  ('a1000000-0000-0000-0000-000000000001',
   'Alex Yelson Murga Lopez',
   'EST-2024001',
   'almurgalo@ucvvirtual.edu.pe',
   'Estudiante',
   'Ingeniería de Sistemas',
   5,
   16.50,
   'Visual',
   NULL),

  ('a1000000-0000-0000-0000-000000000002',
   'Pedro Castillo Ramos',
   'EST-2024002',
   'pecastillora@ucvvirtual.edu.pe',
   'Estudiante',
   'Ingeniería de Sistemas',
   4,
   15.80,
   'Kinestésico',
   NULL),

  ('a1000000-0000-0000-0000-000000000003',
   'Lucía Mendoza Vargas',
   'EST-2024003',
   'lumendozava@ucvvirtual.edu.pe',
   'Estudiante',
   'Ingeniería Industrial',
   6,
   17.20,
   'Auditivo',
   NULL),

  ('a1000000-0000-0000-0000-000000000004',
   'Diego Herrera Sánchez',
   'EST-2024004',
   'diherrerasa@ucvvirtual.edu.pe',
   'Estudiante',
   'Ingeniería Civil',
   4,
   14.90,
   'Lecto-Escritura',
   NULL),

  ('a1000000-0000-0000-0000-000000000005',
   'Valeria Cruz Quispe',
   'EST-2024005',
   'vacruzqu@ucvvirtual.edu.pe',
   'Estudiante',
   'Ingeniería de Sistemas',
   6,
   16.75,
   'Visual',
   NULL);

-- ── 5b. Mentores ────────────────────────────────────────────
INSERT INTO profiles (id, nombre_completo, codigo_estudiante, email, rol, carrera, ciclo, promedio, estilo_aprendizaje, avatar_url)
VALUES
  ('b2000000-0000-0000-0000-000000000001',
   'Carlos Gómez Rivera',
   'MEN-2024001',
   'cagomezri@ucvvirtual.edu.pe',
   'Mentor',
   'Ingeniería de Sistemas',
   9,
   18.00,
   'Visual',
   NULL),

  ('b2000000-0000-0000-0000-000000000002',
   'María Fernández Rojas',
   'MEN-2024002',
   'mafernandezro@ucvvirtual.edu.pe',
   'Mentor',
   'Ingeniería Industrial',
   10,
   19.50,
   'Auditivo',
   NULL),

  ('b2000000-0000-0000-0000-000000000003',
   'José Ramírez Torres',
   'MEN-2024003',
   'joramirezto@ucvvirtual.edu.pe',
   'Mentor',
   'Ingeniería de Sistemas',
   8,
   17.80,
   'Kinestésico',
   NULL),

  ('b2000000-0000-0000-0000-000000000004',
   'Ana Torres Medina',
   'MEN-2024004',
   'antorresme@ucvvirtual.edu.pe',
   'Mentor',
   'Ingeniería Civil',
   9,
   18.50,
   'Lecto-Escritura',
   NULL),

  ('b2000000-0000-0000-0000-000000000005',
   'Roberto Silva Paredes',
   'MEN-2024005',
   'rosilvapa@ucvvirtual.edu.pe',
   'Mentor',
   'Ingeniería de Sistemas',
   10,
   19.00,
   'Visual',
   NULL);

-- ── 5c. Mentorías ───────────────────────────────────────────
INSERT INTO mentorias (id, estudiante_id, mentor_id, estado, fecha_solicitud, materia, descripcion)
VALUES
  ('c3000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',  -- Alex Murga
   'b2000000-0000-0000-0000-000000000001',  -- Carlos Gómez
   'Activa',
   now() - INTERVAL '5 days',
   'Programación Java',
   'Necesito ayuda con estructuras de datos y algoritmos de ordenamiento en Java. Estoy preparándome para el parcial.'),

  ('c3000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',  -- Pedro Castillo
   'b2000000-0000-0000-0000-000000000002',  -- María Fernández
   'Pendiente',
   now() - INTERVAL '1 day',
   'Matemática II',
   'Requiero refuerzo en integrales dobles y triples. Tengo examen la próxima semana.'),

  ('c3000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',  -- Lucía Mendoza
   'b2000000-0000-0000-0000-000000000003',  -- José Ramírez
   'Completada',
   now() - INTERVAL '15 days',
   'Álgebra Lineal',
   'Sesiones de repaso sobre espacios vectoriales y transformaciones lineales. ¡Aprobé con 17!'),

  ('c3000000-0000-0000-0000-000000000004',
   'a1000000-0000-0000-0000-000000000004',  -- Diego Herrera
   'b2000000-0000-0000-0000-000000000004',  -- Ana Torres
   'Activa',
   now() - INTERVAL '3 days',
   'Resistencia de Materiales',
   'Apoyo con diagramas de esfuerzo cortante y momento flector para el proyecto final.'),

  ('c3000000-0000-0000-0000-000000000005',
   'a1000000-0000-0000-0000-000000000005',  -- Valeria Cruz
   'b2000000-0000-0000-0000-000000000005',  -- Roberto Silva
   'Pendiente',
   now(),
   'Base de Datos',
   'Necesito entender normalización (1FN, 2FN, 3FN) y modelado ER para mi proyecto de curso.');

-- ── 5d. Mensajes de Chat ────────────────────────────────────
-- Conversación entre Alex Murga (estudiante) y Carlos Gómez (mentor)
-- sala_id = IDs ordenados alfabéticamente concatenados
INSERT INTO chat_messages (sala_id, emisor_id, receptor_id, mensaje, tipo, leido, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',  -- Alex (emisor)
   'b2000000-0000-0000-0000-000000000001',  -- Carlos (receptor)
   '¡Hola Carlos! Soy Alex, me asignaron contigo para la mentoría de Programación Java. ¿Cuándo podríamos tener nuestra primera sesión?',
   'texto',
   true,
   now() - INTERVAL '4 days 8 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',  -- Carlos (emisor)
   'a1000000-0000-0000-0000-000000000001',  -- Alex (receptor)
   '¡Hola Alex! Claro, podemos reunirnos este jueves a las 3pm en la biblioteca o por Google Meet. ¿Qué temas te cuestan más?',
   'texto',
   true,
   now() - INTERVAL '4 days 6 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',  -- Alex (emisor)
   'b2000000-0000-0000-0000-000000000001',  -- Carlos (receptor)
   'Perfecto, prefiero presencial. Me cuesta bastante la recursividad y los árboles binarios. También tengo dudas con las listas enlazadas.',
   'texto',
   true,
   now() - INTERVAL '4 days 5 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',  -- Carlos (emisor)
   'a1000000-0000-0000-0000-000000000001',  -- Alex (receptor)
   'Genial, entonces arrancamos con recursividad que es la base para entender árboles. Te voy a preparar unos ejercicios progresivos. Trae tu laptop con el JDK instalado.',
   'texto',
   true,
   now() - INTERVAL '4 days 4 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',  -- Alex (emisor)
   'b2000000-0000-0000-0000-000000000001',  -- Carlos (receptor)
   '¡Dale! Ya tengo IntelliJ instalado y el JDK 17. Nos vemos el jueves entonces. ¡Gracias crack! 🙌',
   'texto',
   false,
   now() - INTERVAL '4 days 3 hours'),

-- Conversación entre Pedro Castillo y María Fernández
  ('a1000000-0000-0000-0000-000000000002_b2000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',  -- Pedro (emisor)
   'b2000000-0000-0000-0000-000000000002',  -- María (receptor)
   'Buenas tardes profesora María, vi que aceptó mi solicitud de mentoría en Matemática II. ¿Podría ayudarme con integrales dobles?',
   'texto',
   true,
   now() - INTERVAL '1 day 2 hours'),

  ('a1000000-0000-0000-0000-000000000002_b2000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000002',  -- María (emisor)
   'a1000000-0000-0000-0000-000000000002',  -- Pedro (receptor)
   '¡Hola Pedro! No soy profesora, soy mentora 😄 pero con gusto te ayudo. Las integrales dobles son más fáciles de lo que parecen. ¿Mañana a las 10am te funciona?',
   'texto',
   false,
   now() - INTERVAL '1 day 1 hour');


-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- ── 6a. Habilitar RLS ───────────────────────────────────────
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorias     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ── 6b. Políticas para profiles ─────────────────────────────

-- Cualquiera autenticado puede ver todos los perfiles (necesario para buscar mentores)
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Acceso público de lectura para la app (anon key)
CREATE POLICY "profiles_select_anon"
  ON profiles FOR SELECT
  TO anon
  USING (true);

-- Cada usuario solo puede editar su propio perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Permitir inserción para registro (el id debe coincidir con auth.uid)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ── 6c. Políticas para mentorias ────────────────────────────

-- Ver mentorías donde soy estudiante o mentor
CREATE POLICY "mentorias_select_participant"
  ON mentorias FOR SELECT
  TO authenticated
  USING (
    estudiante_id = auth.uid()
    OR mentor_id = auth.uid()
  );

-- Acceso anon de lectura (para la app con anon key)
CREATE POLICY "mentorias_select_anon"
  ON mentorias FOR SELECT
  TO anon
  USING (true);

-- Estudiantes pueden crear solicitudes de mentoría
CREATE POLICY "mentorias_insert_estudiante"
  ON mentorias FOR INSERT
  TO authenticated
  WITH CHECK (estudiante_id = auth.uid());

-- Participantes pueden actualizar la mentoría (ej: cambiar estado)
CREATE POLICY "mentorias_update_participant"
  ON mentorias FOR UPDATE
  TO authenticated
  USING (
    estudiante_id = auth.uid()
    OR mentor_id = auth.uid()
  )
  WITH CHECK (
    estudiante_id = auth.uid()
    OR mentor_id = auth.uid()
  );

-- ── 6d. Políticas para chat_messages ────────────────────────

-- Ver mensajes donde soy emisor o receptor
CREATE POLICY "chat_select_participant"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    emisor_id = auth.uid()
    OR receptor_id = auth.uid()
  );

-- Acceso anon de lectura
CREATE POLICY "chat_select_anon"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

-- Puedo enviar mensajes como emisor
CREATE POLICY "chat_insert_emisor"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (emisor_id = auth.uid());

-- Puedo actualizar mensajes que recibí (ej: marcar como leído)
CREATE POLICY "chat_update_receptor"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (receptor_id = auth.uid())
  WITH CHECK (receptor_id = auth.uid());


-- ────────────────────────────────────────────────────────────
-- 7. TRIGGER PARA PRODUCCIÓN (COMENTADO)
--    Descomenta esto cuando conectes el registro de la app
--    para que se cree un profile automáticamente al registrarse.
-- ────────────────────────────────────────────────────────────
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.profiles (
--     id,
--     nombre_completo,
--     codigo_estudiante,
--     email,
--     rol,
--     carrera,
--     ciclo,
--     promedio,
--     estilo_aprendizaje
--   ) VALUES (
--     NEW.id,
--     COALESCE(NEW.raw_user_meta_data->>'nombre_completo', ''),
--     COALESCE(NEW.raw_user_meta_data->>'codigo_estudiante', ''),
--     NEW.email,
--     COALESCE(NEW.raw_user_meta_data->>'rol', 'Estudiante'),
--     COALESCE(NEW.raw_user_meta_data->>'carrera', ''),
--     COALESCE((NEW.raw_user_meta_data->>'ciclo')::INT, 1),
--     COALESCE((NEW.raw_user_meta_data->>'promedio')::DECIMAL, 0.00),
--     COALESCE(NEW.raw_user_meta_data->>'estilo_aprendizaje', 'Visual')
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 8. VERIFICACIÓN FINAL
-- ────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_profiles   INT;
  v_mentorias  INT;
  v_messages   INT;
BEGIN
  SELECT count(*) INTO v_profiles  FROM profiles;
  SELECT count(*) INTO v_mentorias FROM mentorias;
  SELECT count(*) INTO v_messages  FROM chat_messages;

  RAISE NOTICE '════════════════════════════════════════════';
  RAISE NOTICE '  ✅ UCV Match — Base de datos poblada';
  RAISE NOTICE '  📋 Profiles:      % registros', v_profiles;
  RAISE NOTICE '  🎓 Mentorías:     % registros', v_mentorias;
  RAISE NOTICE '  💬 Chat Messages: % registros', v_messages;
  RAISE NOTICE '════════════════════════════════════════════';
END;
$$;
