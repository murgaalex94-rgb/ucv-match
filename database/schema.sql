-- UCV Match Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(10) NOT NULL CHECK (rol IN ('ADMIN', 'SENIOR', 'JUNIOR', 'DUAL')),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(20) NOT NULL,
    carrera VARCHAR(150) NOT NULL,
    ciclo_actual INTEGER NOT NULL CHECK (ciclo_actual >= 1),
    promedio DECIMAL(3,2) NOT NULL CHECK (promedio >= 0 AND promedio <= 5),
    estilo_aprendizaje VARCHAR(20) NOT NULL CHECK (estilo_aprendizaje IN ('VISUAL', 'AUDITIVO', 'KINESTESICO', 'LECTO_ESCRITURA')),
    es_senior BOOLEAN NOT NULL DEFAULT FALSE,
    senior_validado BOOLEAN NOT NULL DEFAULT FALSE,
    biografia TEXT,
    foto_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_estudiantes_usuario_id ON estudiantes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_senior_pendiente ON estudiantes(es_senior, senior_validado);

-- Admin default (password: Admin123!)
INSERT INTO usuarios (id, nombre, email, password_hash, rol)
VALUES (
    uuid_generate_v4(),
    'Administrador',
    'admin@universidad.edu',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN'
) ON CONFLICT (email) DO NOTHING;
