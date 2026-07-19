import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { StreamChat } from 'npm:stream-chat@8.64.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_KEY = Deno.env.get('STREAM_API_KEY')!
const API_SECRET = Deno.env.get('STREAM_API_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
    }
    const jwt = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
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

    const { userId } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (user.id !== userId) {
      return new Response(JSON.stringify({ error: 'userId does not match authenticated user' }), { status: 403 });
    }

    const client = StreamChat.getInstance(API_KEY, API_SECRET)
    const token = client.createToken(userId)

    return new Response(
      JSON.stringify({ token, apiKey: API_KEY, userId }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}