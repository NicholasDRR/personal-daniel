
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email } = await req.json()
    console.log('Attempting to send magic link to:', email)

    // Verificar se o email está autorizado
    const { data: authorizedEmail, error: checkError } = await supabaseClient
      .from('authorized_emails')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    console.log('Authorized email check result:', { authorizedEmail, checkError })

    if (checkError || !authorizedEmail) {
      console.log('Email not authorized:', email)
      return new Response(
        JSON.stringify({ error: 'Email não autorizado' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Email is authorized, sending magic link...')

    // Enviar magic link diretamente, sem criar perfil
    const { error: authError } = await supabaseClient.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${req.headers.get('origin')}/admin?authenticated=true`,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email: ' + authError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Magic link sent successfully')
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor: ' + error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
