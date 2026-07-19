-- ============================================================
-- UCV Match — Mensajes de prueba para chat_messages (Supabase)
-- Ejecutar DESPUÉS de seed_complete.sql
-- ============================================================

-- Verificar que la tabla chat_messages existe (creada en seed_complete.sql)
-- Si necesitas recrearla de cero, descomenta el siguiente bloque:

-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- CREATE TABLE chat_messages (
--   id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   sala_id      TEXT         NOT NULL,
--   emisor_id    UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   receptor_id  UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
--   mensaje      TEXT         NOT NULL,
--   tipo         TEXT         NOT NULL DEFAULT 'texto',
--   archivo_url  TEXT,
--   fecha        TIMESTAMPTZ  NOT NULL DEFAULT now(),
--   leido        BOOLEAN      NOT NULL DEFAULT false
-- );
-- CREATE INDEX idx_chat_sala_id      ON chat_messages(sala_id);
-- CREATE INDEX idx_chat_emisor_id    ON chat_messages(emisor_id);
-- CREATE INDEX idx_chat_receptor_id  ON chat_messages(receptor_id);

-- ────────────────────────────────────────────────────────────
-- UUIDs de referencia (deben coincidir con seed_complete.sql):
--
-- ESTUDIANTES:
--   Alex Murga      = a1000000-0000-0000-0000-000000000001
--   Pedro Castillo  = a1000000-0000-0000-0000-000000000002
--   Lucía Mendoza   = a1000000-0000-0000-0000-000000000003
--
-- MENTORES:
--   Carlos Gómez    = b2000000-0000-0000-0000-000000000001
--   María Fernández = b2000000-0000-0000-0000-000000000002
--   José Ramírez    = b2000000-0000-0000-0000-000000000003
-- ────────────────────────────────────────────────────────────

-- Limpiar mensajes existentes para evitar duplicados
DELETE FROM chat_messages;

-- ── Conversación 1: Alex Murga ↔ Carlos Gómez (Mentoría Java) ──
INSERT INTO chat_messages (sala_id, emisor_id, receptor_id, mensaje, tipo, leido, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',
   '¡Hola Carlos! Soy Alex, me asignaron contigo para la mentoría de Programación Java. ¿Cuándo podríamos tener nuestra primera sesión?',
   'texto', true, now() - INTERVAL '4 days 8 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   '¡Hola Alex! Claro, podemos reunirnos este jueves a las 3pm en la biblioteca o por Google Meet. ¿Qué temas te cuestan más?',
   'texto', true, now() - INTERVAL '4 days 6 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',
   'Perfecto, prefiero presencial. Me cuesta bastante la recursividad y los árboles binarios.',
   'texto', true, now() - INTERVAL '4 days 5 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'Genial, arrancamos con recursividad que es la base para entender árboles. Te preparo unos ejercicios. Trae tu laptop con el JDK instalado 💻',
   'texto', true, now() - INTERVAL '4 days 4 hours'),

  ('a1000000-0000-0000-0000-000000000001_b2000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'b2000000-0000-0000-0000-000000000001',
   '¡Dale! Ya tengo IntelliJ y JDK 17 listos. Nos vemos el jueves. ¡Gracias crack! 🙌',
   'texto', false, now() - INTERVAL '4 days 3 hours');

-- ── Conversación 2: Pedro Castillo ↔ María Fernández (Matemática II) ──
INSERT INTO chat_messages (sala_id, emisor_id, receptor_id, mensaje, tipo, leido, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000002_b2000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000002',
   'Buenas tardes María, vi que aceptaste mi solicitud de mentoría en Matemática II. ¿Podrías ayudarme con integrales dobles?',
   'texto', true, now() - INTERVAL '1 day 4 hours'),

  ('a1000000-0000-0000-0000-000000000002_b2000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   '¡Hola Pedro! Con gusto. Las integrales dobles son más fáciles de lo que parecen cuando entiendes la región de integración. ¿Mañana a las 10am?',
   'texto', true, now() - INTERVAL '1 day 3 hours'),

  ('a1000000-0000-0000-0000-000000000002_b2000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   'b2000000-0000-0000-0000-000000000002',
   'Perfecto, mañana 10am me va bien. ¿En la sala de estudio del pabellón B?',
   'texto', false, now() - INTERVAL '1 day 2 hours');

-- ── Conversación 3: Lucía Mendoza ↔ José Ramírez (Álgebra Lineal) ──
INSERT INTO chat_messages (sala_id, emisor_id, receptor_id, mensaje, tipo, leido, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000003_b2000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   'b2000000-0000-0000-0000-000000000003',
   '¡Hola José! He solicitado tu mentoría en Álgebra Lineal. Tengo problemas con espacios vectoriales y transformaciones lineales.',
   'texto', true, now() - INTERVAL '15 days'),

  ('a1000000-0000-0000-0000-000000000003_b2000000-0000-0000-0000-000000000003',
   'b2000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   '¡Hola Lucía! Tranquila, esos temas los puedo explicar bien. Empecemos con la base de un espacio vectorial que es lo fundamental.',
   'texto', true, now() - INTERVAL '14 days 20 hours'),

  ('a1000000-0000-0000-0000-000000000003_b2000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   'b2000000-0000-0000-0000-000000000003',
   '¡Gracias José! Después de las sesiones logré aprobar con 17 puntos 🎉. Eres un excelente mentor.',
   'texto', true, now() - INTERVAL '2 days');


-- ── Verificación ──
DO $$
DECLARE
  v_total INT;
  v_salas INT;
BEGIN
  SELECT count(*) INTO v_total FROM chat_messages;
  SELECT count(DISTINCT sala_id) INTO v_salas FROM chat_messages;
  RAISE NOTICE '════════════════════════════════════════';
  RAISE NOTICE '  ✅ Chat Messages insertados';
  RAISE NOTICE '  💬 Total mensajes:     %', v_total;
  RAISE NOTICE '  🏠 Conversaciones:     %', v_salas;
  RAISE NOTICE '════════════════════════════════════════';
END;
$$;
