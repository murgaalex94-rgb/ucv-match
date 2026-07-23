import { createClient } from 'npm:@supabase/supabase-js@2'
import { StreamChat } from 'npm:stream-chat'

const API_KEY = Deno.env.get('STREAM_API_KEY') ?? ''
const API_SECRET = Deno.env.get('STREAM_API_SECRET') ?? ''

const streamServer = StreamChat.getInstance(API_KEY, API_SECRET)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })

    const jwt = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: `Bearer ${jwt}` } } })
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt)
    if (userError || !user) return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })

    const { userId, otherUserId } = await req.json()
    if (user.id !== userId) return new Response(JSON.stringify({ error: 'userId does not match authenticated user' }), { status: 403, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })

    const adminClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } })
    const { data: profile } = await adminClient.from('profiles').select('id, nombre_completo, avatar_url, rol').eq('id', user.id).maybeSingle()

    let displayName = profile?.nombre_completo || user.email?.split('@')[0] || 'Usuario'
    let avatarUrl = profile?.avatar_url || ''

    if (!profile) {
      const meta = user.user_metadata || {}
      displayName = meta.nombre_completo || user.email?.split('@')[0] || 'Usuario'
      const { data: created } = await adminClient.from('profiles').insert({
        id: user.id, nombre_completo: displayName, codigo_estudiante: meta.codigo_estudiante || `EST-${user.id.slice(0, 8)}`,
        email: user.email || '', rol: meta.rol || 'Estudiante', carrera: meta.carrera || null, ciclo: parseInt(meta.ciclo) || 1,
        promedio: parseFloat(meta.promedio) || 0.0, estilo_aprendizaje: meta.estilo_aprendizaje || 'Visual',
      }).select('id, nombre_completo, avatar_url, rol').single().catch(() => ({ data: null }))
      if (created) { displayName = created.nombre_completo; avatarUrl = created.avatar_url || '' }
    }

    // Crear usuario actual en Stream Chat
    await streamServer.upsertUser({ id: userId, name: displayName, image: avatarUrl || '', role: 'admin' })
    const token = streamServer.createToken(userId)

    let otherProfile = null
    if (otherUserId && otherUserId !== userId) {
      let otherP = await adminClient.from('profiles').select('id, nombre_completo, avatar_url').eq('id', otherUserId).maybeSingle().then(r => r.data)
      if (!otherP) {
        const { data: otherAuth } = await adminClient.auth.admin.getUserById(otherUserId).catch(() => ({ data: null }))
        if (otherAuth?.user) {
          const meta = otherAuth.user.user_metadata || {}
          const name = meta.nombre_completo || otherAuth.user.email?.split('@')[0] || 'Usuario'
          otherP = await adminClient.from('profiles').insert({
            id: otherUserId, nombre_completo: name, codigo_estudiante: meta.codigo_estudiante || `EST-${otherUserId.slice(0, 8)}`,
            email: otherAuth.user.email || '', rol: meta.rol || 'Estudiante',
          }).select('id, nombre_completo, avatar_url').single().then(r => r.data).catch(() => null)
        }
      }
      if (otherP) {
        otherProfile = { nombre_completo: otherP.nombre_completo, avatar_url: otherP.avatar_url }
        await streamServer.upsertUser({ id: otherUserId, name: otherP.nombre_completo, image: otherP.avatar_url || '', role: 'admin' })
      }
    }

    return new Response(JSON.stringify({ token, profile: { nombre_completo: displayName, avatar_url: avatarUrl }, otherProfile }), {
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    const msg = error?.message || String(error) || 'Unknown error'
    console.error('FUNCTION ERROR:', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' } })
  }
})
