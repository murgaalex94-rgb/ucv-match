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
    const { email } = parsed
    if (!email)
      return res.status(400).json({ success: false, message: 'Email requerido' })

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey)
      return res.status(500).json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY no configurada' })

    const sql = async (query, params) => {
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

    const findRes = await sql("SELECT id FROM auth.users WHERE LOWER(email) = LOWER($1)", [email])
    const findData = await findRes.json()
    const rows = Array.isArray(findData) ? findData : []
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'No se encontró ninguna cuenta con ese correo' })

    const userId = rows[0].id

    await sql('DELETE FROM public.profiles WHERE id = $1', [userId])
    await sql('DELETE FROM auth.users WHERE id = $1', [userId])

    return res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' })
  }
}