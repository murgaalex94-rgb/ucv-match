export default async function handler(req, res) {
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
  const { email, captchaToken } = parsed
  if (!email || !captchaToken)
    return res.status(400).json({ success: false, message: 'Email y CAPTCHA son requeridos' })

  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET,
      response: captchaToken,
    }),
  })
  const captchaResult = await r.json()
  if (!captchaResult.success)
    return res.status(403).json({ success: false, message: 'CAPTCHA inválido' })

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey)
    return res.status(500).json({ success: false, message: 'SUPABASE_SERVICE_ROLE_KEY no configurada en Vercel' })

  const siteUrl = process.env.VITE_SITE_URL || 'https://ucv-match.vercel.app'

  const recoverRes = await fetch(`${supabaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(siteUrl + '/reset-password')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ email }),
  })

  if (!recoverRes.ok) {
    const text = await recoverRes.text()
    return res.status(500).json({ success: false, message: text || 'Error en Supabase' })
  }

  return res.status(200).json({ success: true })
}
