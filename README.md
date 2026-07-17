# UCV Match

Plataforma de mentoría académica que conecta estudiantes juniors con seniors para compartir conocimiento.

## Estructura del Proyecto

```
ucv-match/
├── backend/          # Spring Boot 3.2.5 + PostgreSQL
└── frontend/         # React + Vite + TailwindCSS
```

## Requisitos Previos

- Java 17 o superior
- Maven 3.6+
- Node.js 18+ y npm
- Cuenta de Supabase con PostgreSQL

## Configuración de la Base de Datos

El proyecto está configurado para usar Supabase PostgreSQL. Las credenciales ya están configuradas en `backend/src/main/resources/application.properties`.

**IMPORTANTE:** Antes de ejecutar, debes crear las tablas en tu base de datos Supabase:

```sql
-- Tabla usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla estudiantes
CREATE TABLE estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE REFERENCES usuarios(id),
    carrera VARCHAR(255) NOT NULL,
    ciclo_actual INTEGER NOT NULL,
    promedio DECIMAL(3,2) NOT NULL,
    estilo_aprendizaje VARCHAR(50) NOT NULL,
    es_senior BOOLEAN DEFAULT false,
    senior_validado BOOLEAN DEFAULT false,
    biografia TEXT,
    foto_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Ejecución Local

### Terminal 1 - Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

El backend iniciará en el puerto 8080. Deberías ver: `Started UcvMatchApplication`

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend iniciará en el puerto 5173 y se abrirá automáticamente en tu navegador.

## Pruebas Sugeridas

1. **Registrar usuario Junior:**
   - Ve a http://localhost:5173/register
   - Crea un usuario con ciclo 2, promedio 3.0
   - Verifica que redirige a login con mensaje de éxito
   - Inicia sesión y verifica redirección a `/dashboard-junior`

2. **Registrar usuario Senior:**
   - Cierra sesión y ve a `/register`
   - Crea un usuario con ciclo 7, promedio 4.0, marca checkbox de mentor
   - Verifica redirección a `/pending-validation`
   - En Supabase, cambia manualmente `senior_validado` a true
   - Inicia sesión nuevamente, verifica redirección a `/dashboard-senior`

3. **Probar rutas protegidas:**
   - Intenta acceder a dashboards sin token (debe redirigir a login)

## Características

- **Autenticación JWT** con Spring Security
- **Roles:** ADMIN, SENIOR, JUNIOR, DUAL
- **Validación de seniors** por administrador
- **UI Responsive** con TailwindCSS
- **API RESTful** con Spring Boot
- **Base de datos PostgreSQL** vía Supabase

## Tecnologías

### Backend
- Spring Boot 3.2.5
- Spring Data JPA
- Spring Security
- JWT (jjwt 0.12.5)
- PostgreSQL
- Lombok

### Frontend
- React 18
- React Router DOM
- Axios
- Lucide React (iconos)
- TailwindCSS
- Vite
