export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }
  let body = ''
  await new Promise((resolve) => {
    req.on('data', (chunk) => { body += chunk })
    req.on('end', resolve)
  })
  if (!body) {
    return res.status(400).json({ success: false, message: 'Empty body' })
  }
  let parsed
  try {
    parsed = JSON.parse(body)
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid JSON', raw: body })
  }
  const token = parsed.token
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' })
  }
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET,
        response: token,
        remoteip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '',
      }),
    })
    const result = await r.json()
    if (!result.success) {
      return res.status(403).json({ success: false, message: 'Verificación fallida', errors: result['error-codes'] })
    }
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno' })
  }
}
