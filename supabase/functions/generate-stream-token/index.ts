import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { StreamChat } from 'npm:stream-chat'

const API_KEY = Deno.env.get('STREAM_API_KEY')!
const API_SECRET = Deno.env.get('STREAM_API_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const client = StreamChat.getInstance(API_KEY, API_SECRET)
    const token = client.createToken(userId)

    return new Response(
      JSON.stringify({ token, apiKey: API_KEY, userId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
