// MTN MoMo Request to Pay
// This function initiates a payment request to MTN MoMo

import { MOMO_CONFIG, validateMomoConfig } from '../_shared/momo-config.ts'
import { supabase } from '../_shared/supabase.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestToPayPayload {
  order_id: string
  phone: string
  amount: number
  user_id: string
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

    // Parse request body
    const payload: RequestToPayPayload = await req.json()
    const { order_id, phone, amount, user_id } = payload

    // Validate input
    if (!order_id || !phone || !amount || !user_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['order_id', 'phone', 'amount', 'user_id']
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate phone format (MTN Rwanda: +250XXXXXXXXX or 250XXXXXXXXX)
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (!cleanPhone.startsWith('250') || cleanPhone.length !== 12) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid phone number format',
          expected: 'MTN Rwanda format (+250XXXXXXXXX)'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate amount
    if (amount <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Amount must be greater than 0'
        }),
        { 
          status: 400,
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
      const errorData = await tokenResponse.json()
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get access token',
          details: errorData
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { access_token } = await tokenResponse.json()

    // Generate reference ID (UUID)
    const referenceId = crypto.randomUUID()

    // Prepare MTN MoMo request
    const momoPayload = {
      amount: amount.toString(),
      currency: 'RWF',
      externalId: order_id,
      payer: {
        partyIdType: 'MSISDN',
        partyId: cleanPhone
      },
      payerMessage: `Payment for order ${order_id}`,
      payeeNote: `Order ${order_id}`
    }

    // Call MTN MoMo API
    const momoUrl = `${MOMO_CONFIG.BASE_URL}/collection/v1_0/requesttopay`
    
    const momoResponse = await fetch(momoUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'X-Target-Environment': MOMO_CONFIG.TARGET_ENVIRONMENT,
        'X-Reference-Id': referenceId,
        'X-Callback-Url': MOMO_CONFIG.CALLBACK_URL,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': MOMO_CONFIG.SUBSCRIPTION_KEY
      },
      body: JSON.stringify(momoPayload)
    })

    // Get order details to calculate seller earnings
    const { data: order } = await supabase
      .from('orders')
      .select('seller_id, total_amount')
      .eq('id', order_id)
      .single()

    // Calculate commission (5% platform fee)
    const platformFeePercent = 0.05
    const platformFee = amount * platformFeePercent
    const sellerEarnings = amount - platformFee

    // Save transaction to database
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        order_id: order_id,
        user_id: user_id,
        amount: amount,
        currency: 'RWF',
        status: 'pending',
        momo_reference_id: referenceId,
        momo_external_id: order_id,
        momo_phone_number: phone,
        payment_method: 'mtn_momo',
        platform_fee: platformFee,
        seller_earnings: sellerEarnings,
        seller_id: order?.seller_id || null
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error saving transaction:', transactionError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save transaction',
          details: transactionError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Return response
    if (momoResponse.status === 202) {
      // 202 Accepted means payment request was sent successfully
      return new Response(
        JSON.stringify({
          success: true,
          reference_id: referenceId,
          transaction_id: transaction.id,
          status: 'pending',
          message: 'Payment request sent. Please check your phone to confirm.'
        }),
        {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      // Error from MTN MoMo
      const errorText = await momoResponse.text()
      console.error('MTN MoMo Error:', momoResponse.status, errorText)

      // Update transaction status to failed
      await supabase
        .from('transactions')
        .update({ 
          status: 'failed',
          error_message: errorText
        })
        .eq('id', transaction.id)

      return new Response(
        JSON.stringify({
          error: 'Payment request failed',
          status: momoResponse.status,
          details: errorText
        }),
        {
          status: momoResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error in request-to-pay:', error)
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
