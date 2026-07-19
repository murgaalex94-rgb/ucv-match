import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { StreamChat } from 'https://esm.sh/stream-chat@8.64.0'

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

    // Verify user role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), { status: 404 });
    }

    const allowedRoles = ['ADMIN', 'SENIOR', 'JUNIOR', 'DUAL', 'MENTOR'];
    if (!allowedRoles.includes(profile.rol)) {
      return new Response(JSON.stringify({ error: 'Unauthorized role' }), { status: 403 });
    }

    const { userId } = await req.json();

    if (user.id !== userId) {
      return new Response(JSON.stringify({
        error: 'userId does not match authenticated user. Potential impersonation attempt.'
      }), { status: 403 });
    }

    const client = StreamChat.getInstance(
      Deno.env.get('STREAM_API_KEY') ?? '',
      Deno.env.get('STREAM_API_SECRET') ?? ''
    );

    const token = client.createToken(userId, Math.floor(Date.now() / 1000) + 3600);

    return new Response(JSON.stringify({ token }), {
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
