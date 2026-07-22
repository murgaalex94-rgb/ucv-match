const api = (url, opts = {}) => fetch(url, {
  ...opts,
  headers: {
    'Content-Type': 'application/json',
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    ...opts.headers,
  },
})

const listUsers = async (supabaseUrl, email) => {
  const res = await api(`${supabaseUrl}/auth/v1/admin/users`)
  const data = await res.json()
  if (!res.ok || !data.users) return null
  return data.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
}

const deleteUser = async (supabaseUrl, email, userId) => {
  await api(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email.toLowerCase())}`, { method: 'DELETE' })
  await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
}

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
    const { email, password, captchaToken, userData } = parsed
    if (!email || !password || !captchaToken)
      return res.status(400).json({ success: false, message: 'Email, password y CAPTCHA son requeridos' })

    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET,
        response: captchaToken,
        remoteip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '',
      }),
    })
    const captchaResult = await r.json()
    if (!captchaResult.success)
      return res.status(403).json({ success: false, message: 'CAPTCHA inválido', errors: captchaResult['error-codes'] })

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey)
      return res.status(500).json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY no configurada' })

    // Intentar crear usuario
    let supabaseRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        user_metadata: userData,
      }),
    })

    let supabaseData = await supabaseRes.json()

    // Si falla porque el usuario ya existe, intentar eliminar y recrear
    if (!supabaseRes.ok) {
      const msg = (supabaseData?.msg || supabaseData?.message || '').toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('duplicate key') || msg.includes('unique constraint')) {
        const existing = await listUsers(supabaseUrl, email)
        if (existing) {
          await deleteUser(supabaseUrl, email, existing.id)

          supabaseRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              email,
              password,
              user_metadata: userData,
            }),
          })
          supabaseData = await supabaseRes.json()
        }
      }
    }

    if (!supabaseRes.ok)
      return res.status(500).json({ success: false, message: supabaseData?.msg || supabaseData?.message || 'Error en Supabase Admin' })

    await fetch(`${supabaseUrl}/auth/v1/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ type: 'signup', email }),
    }).catch(() => {})

    return res.status(200).json({ success: true, user: supabaseData })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Error interno del servidor',
    })
  }
}