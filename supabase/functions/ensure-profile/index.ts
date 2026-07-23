import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
    }
    const jwt = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'targetUserId is required' }), { status: 400 });
    }

    // Use service_role client to bypass RLS
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Check if profile already exists
    const { data: existing } = await adminClient
      .from('profiles')
      .select('id, nombre_completo, avatar_url')
      .eq('id', targetUserId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ profile: existing }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    // Get auth user metadata from auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(targetUserId);
    if (authError || !authUser?.user) {
      return new Response(JSON.stringify({ error: 'Target user not found in auth' }), { status: 404 });
    }

    const meta = authUser.user.user_metadata || {};
    const nombre = meta.nombre_completo || authUser.user.email?.split('@')[0] || 'Usuario';

    const { data: newProfile, error: insertError } = await adminClient
      .from('profiles')
      .insert({
        id: targetUserId,
        nombre_completo: nombre,
        codigo_estudiante: meta.codigo_estudiante || `EST-${targetUserId.slice(0, 8)}`,
        email: authUser.user.email || `${targetUserId}@placeholder.com`,
        rol: meta.rol || 'Estudiante',
        carrera: meta.carrera || null,
        ciclo: parseInt(meta.ciclo) || 1,
        promedio: parseFloat(meta.promedio) || 0.00,
        estilo_aprendizaje: meta.estilo_aprendizaje || 'Visual',
      })
      .select('id, nombre_completo, avatar_url')
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ profile: newProfile }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
});
