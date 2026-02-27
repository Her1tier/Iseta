// MTN MoMo Authentication - Get Access Token
// This function retrieves an access token from MTN MoMo API

import { MOMO_CONFIG, validateMomoConfig } from '../_shared/momo-config.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate configuration
    const configCheck = validateMomoConfig()
    if (!configCheck.valid) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuration error', 
          details: configCheck.errors 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare Basic Auth
    const credentials = btoa(`${MOMO_CONFIG.API_USER}:${MOMO_CONFIG.API_KEY}`)
    
    // Request token from MTN MoMo
    const tokenUrl = `${MOMO_CONFIG.BASE_URL}/collection/token/`
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Ocp-Apim-Subscription-Key': MOMO_CONFIG.SUBSCRIPTION_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MTN MoMo Auth Error:', response.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get access token',
          status: response.status,
          details: errorText
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    
    // Return token (expires in ~3600 seconds)
    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        expires_in: data.expires_in || 3600,
        token_type: data.token_type || 'Bearer'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in momo-auth:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
