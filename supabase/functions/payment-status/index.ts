// Check Payment Status
// This function checks the status of a payment transaction

import { MOMO_CONFIG, validateMomoConfig } from '../_shared/momo-config.ts'
import { supabase } from '../_shared/supabase.ts'

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
    // Get reference ID from query params or body
    const url = new URL(req.url)
    const referenceId = url.searchParams.get('reference_id') || 
                       (await req.json().catch(() => ({}))).reference_id

    if (!referenceId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing reference_id parameter'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First, check our database
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .select('*')
      .eq('momo_reference_id', referenceId)
      .single()

    if (dbError || !transaction) {
      return new Response(
        JSON.stringify({ 
          error: 'Transaction not found',
          referenceId
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If already successful or failed, return cached status
    if (transaction.status === 'success' || transaction.status === 'failed') {
      return new Response(
        JSON.stringify({
          reference_id: referenceId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          paid_at: transaction.paid_at,
          source: 'database'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If still pending, check with MTN MoMo API
    const configCheck = validateMomoConfig()
    if (!configCheck.valid) {
      // Return database status if config invalid
      return new Response(
        JSON.stringify({
          reference_id: referenceId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          source: 'database',
          note: 'MTN API config invalid, using cached status'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get access token
    const tokenResponse = await fetch(`${req.url.split('/functions/')[0]}/functions/v1/momo-auth`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'apikey': req.headers.get('apikey') || ''
      }
    })

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({
          reference_id: referenceId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          source: 'database',
          note: 'Failed to get access token'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { access_token } = await tokenResponse.json()

    // Check payment status with MTN
    const statusUrl = `${MOMO_CONFIG.BASE_URL}/collection/v1_0/requesttopay/${referenceId}`
    
    const momoResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Target-Environment': MOMO_CONFIG.TARGET_ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': MOMO_CONFIG.SUBSCRIPTION_KEY
      }
    })

    if (momoResponse.ok) {
      const momoData = await momoResponse.json()
      
      // Update transaction if status changed
      const newStatus = momoData.status === 'SUCCESSFUL' ? 'success' :
                       momoData.status === 'FAILED' ? 'failed' :
                       momoData.status === 'PENDING' ? 'pending' : transaction.status

      if (newStatus !== transaction.status) {
        await supabase
          .from('transactions')
          .update({
            status: newStatus,
            paid_at: newStatus === 'success' ? new Date().toISOString() : null,
            callback_data: momoData
          })
          .eq('id', transaction.id)
      }

      return new Response(
        JSON.stringify({
          reference_id: referenceId,
          status: newStatus,
          amount: momoData.amount || transaction.amount,
          currency: momoData.currency || transaction.currency,
          financial_transaction_id: momoData.financialTransactionId,
          paid_at: newStatus === 'success' ? new Date().toISOString() : null,
          source: 'mtn_api'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      // Return database status if API call fails
      return new Response(
        JSON.stringify({
          reference_id: referenceId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          source: 'database',
          note: 'MTN API call failed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error in payment-status:', error)
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
