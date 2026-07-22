-- =========================================================================
-- CONSULTA SQL / VISTA PARA OBTENER LOS CHATS CON DATOS DEL OTRO PARTICIPANTE
-- =========================================================================

-- Esta consulta obtiene la lista de mentorías/chats en las que participa el usuario,
-- haciendo un JOIN directo con la tabla profiles para devolver:
--  - nombre_usuario (primer nombre del otro participante)
--  - apellido_usuario (apellidos del otro participante)
--  - avatar_url (URL de la foto de perfil del otro participante)

SELECT 
    m.id AS mentoria_id,
    m.materia,
    m.estado,
    p.id AS otro_usuario_id,
    SPLIT_PART(p.nombre_completo, ' ', 1) AS nombre_usuario,
    CASE 
        WHEN POSITION(' ' IN p.nombre_completo) > 0 
        THEN SUBSTRING(p.nombre_completo FROM POSITION(' ' IN p.nombre_completo) + 1)
        ELSE ''
    END AS apellido_usuario,
    p.avatar_url
FROM public.mentorias m
JOIN public.profiles p ON (
    p.id = CASE 
        WHEN m.estudiante_id = auth.uid() THEN m.mentor_id 
        ELSE m.estudiante_id 
    END
)
WHERE (m.estudiante_id = auth.uid() OR m.mentor_id = auth.uid())
  AND m.estado IN ('Activa', 'Pendiente')
ORDER BY m.fecha_solicitud DESC;
