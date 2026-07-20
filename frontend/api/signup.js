import { createClient } from '@supabase/supabase-js'

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

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: userData,
    })

    if (error)
      return res.status(500).json({ success: false, message: error.message })

    return res.status(200).json({ success: true, user: data.user })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Error interno del servidor' })
  }
}
