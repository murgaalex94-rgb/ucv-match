import { supabase } from './supabase'

// ============================================
// DASHBOARD SERVICES
// ============================================

export const getDashboardStats = async (userId) => {
  const { data: mentoriasActivas, error: err1 } = await supabase
    .from('mentorias')
    .select('id', { count: 'exact' })
    .or(`estudiante_id.eq.${userId},mentor_id.eq.${userId}`)
    .eq('estado', 'Activa')

  const { data: mentoresCount, error: err2 } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('rol', 'Mentor')

  if (err1 || err2) return { mentoriasActivas: 0, mentoresDisponibles: 0 }
  return {
    mentoriasActivas: mentoriasActivas?.length || 0,
    mentoresDisponibles: mentoresCount?.length || 0
  }
}

export const getProximasMentorias = async (userId) => {
  const { data } = await supabase
    .from('mentorias')
    .select(`
      id, materia, estado, fecha_solicitud, fecha_activacion,
      estudiante:estudiante_id(nombre_completo, avatar_url),
      mentor:mentor_id(nombre_completo, avatar_url)
    `)
    .or(`estudiante_id.eq.${userId},mentor_id.eq.${userId}`)
    .eq('estado', 'Activa')
    .order('fecha_activacion', { ascending: true })
    .limit(5)
  return data || []
}

export const getMentoresRecomendados = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, nombre_completo, carrera, promedio, avatar_url')
    .eq('rol', 'Mentor')
    .order('promedio', { ascending: false })
    .limit(4)
  return data || []
}

// ============================================
// ADMIN DASHBOARD SERVICES
// ============================================

export const getAdminStats = async () => {
  const { count: totalUsuarios } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: seniorsPendientes, count: pendientesCount } = await supabase
    .from('solicitudes_validacion')
    .select('id', { count: 'exact' })
    .eq('estado', 'Pendiente')

  const { count: mentoriasActivas } = await supabase
    .from('mentorias')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'Activa')

  return {
    totalUsuarios: totalUsuarios || 0,
    seniorsPendientes: pendientesCount || 0,
    mentoriasActivas: mentoriasActivas || 0
  }
}

export const getPendingSeniors = async () => {
  const { data } = await supabase
    .from('solicitudes_validacion')
    .select(`
      id, estado, created_at,
      usuario:usuario_id(id, nombre_completo, carrera, ciclo, promedio)
    `)
    .eq('estado', 'Pendiente')
    .order('created_at', { ascending: false })
  return data || []
}

export const approveSenior = async (solicitudId) => {
  const { error } = await supabase
    .from('solicitudes_validacion')
    .update({ estado: 'Aprobado', updated_at: new Date().toISOString() })
    .eq('id', solicitudId)
  return { error }
}

export const rejectSenior = async (solicitudId, comentario) => {
  const { error } = await supabase
    .from('solicitudes_validacion')
    .update({ estado: 'Rechazado', comentario_admin: comentario, updated_at: new Date().toISOString() })
    .eq('id', solicitudId)
  return { error }
}

// ============================================
// MENTOR SENIOR DASHBOARD SERVICES
// ============================================

export const getSeniorStats = async (userId) => {
  const { count: activas } = await supabase
    .from('mentorias')
    .select('*', { count: 'exact', head: true })
    .eq('mentor_id', userId)
    .eq('estado', 'Activa')

  const { count: solicitudes } = await supabase
    .from('mentorias')
    .select('*', { count: 'exact', head: true })
    .eq('mentor_id', userId)
    .eq('estado', 'Pendiente')

  return { activas: activas || 0, solicitudes: solicitudes || 0, sesionesSemana: activas || 0 }
}

export const getSolicitudesMentoria = async (userId) => {
  const { data } = await supabase
    .from('mentorias')
    .select(`
      id, materia, descripcion, estado, fecha_solicitud,
      estudiante:estudiante_id(nombre_completo, avatar_url, carrera)
    `)
    .eq('mentor_id', userId)
    .eq('estado', 'Pendiente')
    .order('fecha_solicitud', { ascending: false })
  return data || []
}

export const aceptarSolicitud = async (mentoriaId) => {
  const { error } = await supabase
    .from('mentorias')
    .update({ estado: 'Activa', fecha_activacion: new Date().toISOString() })
    .eq('id', mentoriaId)
  return { error }
}

export const rechazarSolicitud = async (mentoriaId) => {
  const { error } = await supabase
    .from('mentorias')
    .update({ estado: 'Cancelada' })
    .eq('id', mentoriaId)
  return { error }
}

// ============================================
// JUNIOR DASHBOARD SERVICES
// ============================================

export const getJuniorStats = async (userId) => {
  const { count: activas } = await supabase
    .from('mentorias')
    .select('*', { count: 'exact', head: true })
    .eq('estudiante_id', userId)
    .eq('estado', 'Activa')

  const { count: enviadas } = await supabase
    .from('mentorias')
    .select('*', { count: 'exact', head: true })
    .eq('estudiante_id', userId)
    .not('estado', 'eq', 'Cancelada')

  return { activas: activas || 0, enviadas: enviadas || 0, proximas: activas || 0 }
}

export const getMisSolicitudes = async (userId) => {
  const { data } = await supabase
    .from('mentorias')
    .select(`
      id, materia, estado, fecha_solicitud,
      mentor:mentor_id(nombre_completo)
    `)
    .eq('estudiante_id', userId)
    .order('fecha_solicitud', { ascending: false })
  return data || []
}

// ============================================
// COMUNIDAD SERVICES
// ============================================

export const getPublicaciones = async () => {
  const { data } = await supabase
    .from('publicaciones')
    .select(`
      id, contenido, imagen_url, likes, comentarios, compartidos, etiquetas, created_at,
      autor:autor_id(nombre_completo, avatar_url, rol)
    `)
    .order('created_at', { ascending: false })
    .limit(20)
  return data || []
}

export const createPublicacion = async (autorId, contenido, etiquetas) => {
  const { data, error } = await supabase
    .from('publicaciones')
    .insert({ autor_id: autorId, contenido, etiquetas })
    .select()
  return { data, error }
}

export const getEventos = async () => {
  const { data } = await supabase
    .from('eventos')
    .select('*')
    .gte('fecha', new Date().toISOString().split('T')[0])
    .order('fecha', { ascending: true })
    .limit(5)
  return data || []
}

export const getTopMentores = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, nombre_completo, carrera, promedio')
    .eq('rol', 'Mentor')
    .order('promedio', { ascending: false })
    .limit(3)
  return data || []
}

// ============================================
// CURSOS SERVICES
// ============================================

export const getMisCursos = async (userId) => {
  const { data } = await supabase
    .from('inscripciones_cursos')
    .select(`
      id, progreso, modulos_completados, estado,
      curso:curso_id(id, titulo, categoria, modulos, horas_totales, color,
        mentor:mentor_id(nombre_completo, avatar_url))
    `)
    .eq('usuario_id', userId)
  return data || []
}

export const getCursosDisponibles = async () => {
  const { data } = await supabase
    .from('cursos')
    .select('*, mentor:mentor_id(nombre_completo, avatar_url)')
    .limit(20)
  return data || []
}

export const getStatsCursos = async (userId) => {
  const { data: inscripciones } = await supabase
    .from('inscripciones_cursos')
    .select('progreso, modulos_completados, estado, curso:curso_id(horas_totales)')
    .eq('usuario_id', userId)

  const activos = inscripciones?.filter(i => i.estado === 'activo').length || 0
  const completados = inscripciones?.filter(i => i.estado === 'completado').length || 0
  const totalHoras = inscripciones?.reduce((sum, i) => sum + (i.curso?.horas_totales || 0), 0) || 0
  const progresoGeneral = inscripciones?.length > 0
    ? Math.round(inscripciones.reduce((sum, i) => sum + i.progreso, 0) / inscripciones.length)
    : 0

  return { activos, completados, totalHoras, progresoGeneral }
}

// ============================================
// LOGROS SERVICES
// ============================================

export const getLogros = async () => {
  const { data } = await supabase.from('logros').select('*').order('puntos', { ascending: true })
  return data || []
}

export const getLogrosUsuario = async (userId) => {
  const { data } = await supabase
    .from('logros_usuario')
    .select('*')
    .eq('usuario_id', userId)
  return data || []
}

export const getUsuarioXp = async (userId) => {
  const { data } = await supabase
    .from('usuario_xp')
    .select('*')
    .eq('usuario_id', userId)
    .maybeSingle()
  return data
}

// ============================================
// RECURSOS SERVICES
// ============================================

export const getRecursos = async () => {
  const { data } = await supabase
    .from('recursos')
    .select('*, subido_por:subido_por(nombre_completo, avatar_url)')
    .order('fecha_subida', { ascending: false })
  return data || []
}

export const getStatsRecursos = async (userId) => {
  const { count: total } = await supabase
    .from('recursos')
    .select('*', { count: 'exact', head: true })

  const { count: descargados } = await supabase
    .from('recursos')
    .select('*', { count: 'exact', head: true })

  const { count: misSubidos } = await supabase
    .from('recursos')
    .select('*', { count: 'exact', head: true })
    .eq('subido_por', userId)

  return { total: total || 0, descargados: descargados || 0, misSubidos: misSubidos || 0 }
}

export const incrementarDescarga = async (recursoId) => {
  await supabase.rpc('incrementar_descargas', { p_recurso_id: recursoId })
}

export const getCategoriasRecursos = async () => {
  const { data } = await supabase
    .from('recursos')
    .select('categoria')
  const counts = {}
  data?.forEach(r => { counts[r.categoria] = (counts[r.categoria] || 0) + 1 })
  return counts
}

// ============================================
// MENTORES SERVICES
// ============================================

export const getMentores = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('id, nombre_completo, carrera, promedio, avatar_url')
    .eq('rol', 'Mentor')
    .order('promedio', { ascending: false })
  return data || []
}

export const solicitarMentoria = async (estudianteId, mentorId, materia, descripcion) => {
  const { data, error } = await supabase
    .from('mentorias')
    .insert({
      estudiante_id: estudianteId,
      mentor_id: mentorId,
      materia,
      descripcion,
      estado: 'Pendiente'
    })
    .select()
  return { data, error }
}

// ============================================
// CONFIGURACIÓN SERVICES
// ============================================

export const updateProfile = async (userId, profileData) => {
  const { error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
  return { error }
}

export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error }
}

export const getPreferencias = async (userId) => {
  const { data } = await supabase
    .from('preferencias_usuario')
    .select('*')
    .eq('usuario_id', userId)
    .maybeSingle()
  return data
}

export const updatePreferencias = async (userId, prefs) => {
  const { error } = await supabase
    .from('preferencias_usuario')
    .upsert({ usuario_id: userId, ...prefs, updated_at: new Date().toISOString() })
  return { error }
}

// ============================================
// NOTIFICACIONES SERVICES
// ============================================

export const getNotificaciones = async (userId) => {
  const { data } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data || []
}

export const marcarNotificacionLeida = async (notifId) => {
  await supabase.from('notificaciones').update({ leido: true }).eq('id', notifId)
}

export const marcarTodasLeidas = async (userId) => {
  await supabase.from('notificaciones').update({ leido: true }).eq('usuario_id', userId)
}

export const getNotificacionesNoLeidas = async (userId) => {
  const { count } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', userId)
    .eq('leido', false)
  return count || 0
}

// ============================================
// Ofertas Mentoría
// ============================================

export const createOferta = async (mentorId, titulo, descripcion, materia) => {
  const { data, error } = await supabase
    .from('ofertas_mentoria')
    .insert({ mentor_id: mentorId, titulo, descripcion, materia })
    .select()
  return { data, error }
}

export const getMisOfertas = async (mentorId) => {
  const { data } = await supabase
    .from('ofertas_mentoria')
    .select('*')
    .eq('mentor_id', mentorId)
    .order('created_at', { ascending: false })
  return data || []
}

// ============================================
// Reportes
// ============================================

export const getReportes = async (userId) => {
  const { data } = await supabase
    .from('reportes')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

// ============================================
// CONVERSACIONES (para mensajes)
// ============================================

export const getConversaciones = async (userId) => {
  const { data: mentorias } = await supabase
    .from('mentorias')
    .select(`
      id,
      materia,
      estado,
      estudiante:estudiante_id(id, nombre_completo, avatar_url),
      mentor:mentor_id(id, nombre_completo, avatar_url)
    `)
    .or(`estudiante_id.eq.${userId},mentor_id.eq.${userId}`)
    .in('estado', ['Activa', 'Pendiente'])
    .order('fecha_solicitud', { ascending: false })

  if (!mentorias) return []

  const otrasPersonas = mentorias.map(m => {
    const otro = m.estudiante?.id === userId ? m.mentor : m.estudiante
    const parts = (otro?.nombre_completo || '').trim().split(/\s+/)
    const nombre_usuario = parts[0] || ''
    const apellido_usuario = parts.slice(1).join(' ') || ''
    return {
      id: otro?.id,
      nombre_usuario,
      apellido_usuario,
      avatar_url: otro?.avatar_url || null,
      name: `${nombre_usuario} ${apellido_usuario}`.trim() || 'Usuario',
      subject: m.materia,
      mentoriaId: m.id
    }
  })

  const unique = []
  const seen = new Set()
  otrasPersonas.forEach(p => {
    if (p.id && !seen.has(p.id)) {
      seen.add(p.id)
      unique.push(p)
    }
  })

  return unique
}
