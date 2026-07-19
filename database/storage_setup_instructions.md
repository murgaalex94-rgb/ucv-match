# Configuración de Storage en Supabase - UCV Match

Este documento explica cómo configurar los buckets de Storage requeridos para el sistema UCV Match.

## Buckets Requeridos

### 1. Bucket Público: `mentorlink-archivos`

**Propósito:** Almacenar archivos compartidos por usuarios (PDFs, imágenes, videos, documentos)

**Configuración:**
- **Nombre:** `mentorlink-archivos`
- **Tipo:** Público (Public)
- **Permisos:**
  - Lectura: Público (cualquiera puede ver)
  - Escritura: Solo usuarios autenticados

**Instrucciones de configuración en Supabase Dashboard:**

1. Ve a la sección **Storage** en el dashboard de Supabase
2. Haz clic en **New bucket**
3. Ingresa el nombre: `mentorlink-archivos`
4. Marca la opción **Public bucket**
5. Haz clic en **Create bucket**

**Políticas RLS para el bucket:**

```sql
-- Política para permitir a usuarios autenticados subir archivos
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mentorlink-archivos');

-- Política para permitir a usuarios autenticados ver archivos
CREATE POLICY "Authenticated users can view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'mentorlink-archivos');

-- Política para permitir a usuarios actualizar sus propios archivos
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'mentorlink-archivos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir a usuarios eliminar sus propios archivos
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mentorlink-archivos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2. Bucket Privado: `avatars`

**Propósito:** Almacenar fotos de perfil de usuarios

**Configuración:**
- **Nombre:** `avatars`
- **Tipo:** Privado (Private)
- **Permisos:**
  - Lectura: Solo el propietario del avatar
  - Escritura: Solo el propietario del avatar

**Instrucciones de configuración en Supabase Dashboard:**

1. Ve a la sección **Storage** en el dashboard de Supabase
2. Haz clic en **New bucket**
3. Ingresa el nombre: `avatars`
4. NO marques la opción **Public bucket** (debe ser privado)
5. Haz clic en **Create bucket**

**Políticas RLS para el bucket:**

```sql
-- Política para permitir a usuarios subir su propio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir a usuarios ver su propio avatar
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir a usuarios actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir a usuarios eliminar su propio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Script Completo de Políticas de Storage

Ejecuta este script en el **SQL Editor** de Supabase después de crear los buckets:

```sql
-- ============================================
-- POLÍTICAS RLS PARA STORAGE BUCKETS
-- ============================================

-- Habilitar RLS en storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA mentorlink-archivos (Público)
-- ============================================

-- Usuarios autenticados pueden subir archivos
CREATE POLICY "Authenticated users can upload to mentorlink-archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mentorlink-archivos');

-- Usuarios autenticados pueden ver archivos
CREATE POLICY "Authenticated users can view mentorlink-archivos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'mentorlink-archivos');

-- Usuarios pueden actualizar sus propios archivos
CREATE POLICY "Users can update own files in mentorlink-archivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'mentorlink-archivos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'mentorlink-archivos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuarios pueden eliminar sus propios archivos
CREATE POLICY "Users can delete own files in mentorlink-archivos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'mentorlink-archivos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Público puede ver archivos (bucket público)
CREATE POLICY "Public can view mentorlink-archivos"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'mentorlink-archivos');

-- ============================================
-- POLÍTICAS PARA avatars (Privado)
-- ============================================

-- Usuarios pueden subir su propio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuarios pueden ver su propio avatar
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuarios pueden actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuarios pueden eliminar su propio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Estructura de Carpetas Sugerida

### Bucket `mentorlink-archivos`
```
mentorlink-archivos/
├── {user_id}/
│   ├── programacion/
│   │   ├── apuntes.pdf
│   │   └── guias/
│   ├── matematicas/
│   └── otros/
```

### Bucket `avatars`
```
avatars/
├── {user_id}/
│   └── avatar.{ext}
```

## Notas Importantes

1. **Los buckets deben crearse manualmente** en el dashboard de Supabase antes de ejecutar las políticas RLS
2. **Las políticas RLS de storage** son independientes de las políticas RLS de las tablas de la base de datos
3. **El formato de nombres de archivos** debe incluir el user_id como primera carpeta para que funcionen las políticas de seguridad
4. **Para URLs públicas** del bucket `mentorlink-archivos`, usa el formato:
   ```
   https://{project_ref}.supabase.co/storage/v1/object/public/mentorlink-archivos/{path}
   ```
5. **Para URLs privadas** del bucket `avatars`, genera signed URLs temporalmente:
   ```javascript
   const { data, error } = await supabase
     .storage
     .from('avatars')
     .createSignedUrl('user_id/avatar.jpg', 60) // 60 segundos
   ```

## Verificación

Después de configurar todo, verifica que:

- [ ] Los buckets existen en Storage
- [ ] Las políticas RLS están activas
- [ ] Puedes subir archivos como usuario autenticado
- [ ] Puedes ver archivos públicos sin autenticación (mentorlink-archivos)
- [ ] NO puedes ver archivos privados sin autenticación (avatars)
