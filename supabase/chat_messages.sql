-- ============================================
-- 1. CREAR TABLA chat_messages
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id TEXT NOT NULL,
  emisor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receptor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  archivo_url TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para búsquedas por sala
CREATE INDEX IF NOT EXISTS idx_chat_messages_sala ON chat_messages(sala_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_emisor ON chat_messages(emisor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receptor ON chat_messages(receptor_id);

-- ============================================
-- 2. INSERTAR MENSAJES DE PRUEBA
-- ============================================
-- Estudiante: Alex Yelson Murga Lopez (a1000000-0000-0000-0000-000000000001)
-- Mentor: Carlos Gómez Rivera (b2000000-0000-0000-0000-000000000001)
-- Sala: messaging:mentoria-a1000000-b2000000

INSERT INTO chat_messages (sala_id, emisor_id, receptor_id, mensaje, tipo, fecha) VALUES
(
  'messaging:mentoria-a1000000-b2000000',
  'a1000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000001',
  '¡Hola Carlos! He solicitado tu mentoría para Programación Java. ¿Cuándo podríamos tener nuestra primera sesión?',
  'texto',
  now() - interval '2 days'
),
(
  'messaging:mentoria-a1000000-b2000000',
  'b2000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  '¡Hola Alex! Claro, estoy disponible los lunes y miércoles de 4 a 6 pm. ¿Qué día te queda mejor?',
  'texto',
  now() - interval '1 day'
),
(
  'messaging:mentoria-a1000000-b2000000',
  'a1000000-0000-0000-0000-000000000001',
  'b2000000-0000-0000-0000-000000000001',
  'Perfecto, el miércoles a las 4 pm me funciona. ¡Gracias!',
  'texto',
  now() - interval '12 hours'
);
