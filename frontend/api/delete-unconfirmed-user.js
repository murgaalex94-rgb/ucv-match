export default async function handler(req, res) {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ success: false, message: 'Method not allowed' })

    let body = ''
    await new Promise((resolve) => {
      req.on('data', (chunk) => { body += chunk })
      req.on('end', resolve)
    })
    let parsed
    try {
      parsed = JSON.parse(body)
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON' })
    }
    const { email, codigoEstudiante } = parsed
    if (!email)
      return res.status(400).json({ success: false, message: 'Email requerido' })

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey)
      return res.status(500).json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY no configurada' })

    const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    })
    const listData = await listRes.json()
    if (!listRes.ok || !listData.users || listData.users.length === 0)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })

    const user = listData.users[0]

    const codigoEstudianteMeta = user.user_metadata?.codigo_estudiante || ''
    const codigoToDelete = codigoEstudianteMeta || codigoEstudiante || ''

    const execSql = async (query, params) => {
      const r = await fetch(`${supabaseUrl}/pg/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ query, params }),
      })
      return r
    }

    await execSql('DELETE FROM public.profiles WHERE id = $1', [user.id])
    if (codigoToDelete) {
      await execSql('DELETE FROM public.profiles WHERE codigo_estudiante = $1', [codigoToDelete])
    }

    const deleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    })

    if (!deleteRes.ok) {
      const text = await deleteRes.text()
      return res.status(500).json({ success: false, message: text || 'Error al eliminar usuario' })
    }

    return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' })
  }
}