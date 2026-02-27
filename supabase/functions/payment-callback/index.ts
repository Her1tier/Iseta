// MTN MoMo Payment Callback Webhook
// This function handles payment callbacks from MTN MoMo

import { supabase } from '../_shared/supabase.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CallbackPayload {
  financialTransactionId?: string
  externalId?: string
  amount?: string
  currency?: string
  payer?: {
    partyIdType?: string
    partyId?: string
  }
  status?: 'SUCCESSFUL' | 'FAILED' | 'PENDING'
  reason?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get reference ID from headers (MTN sends this)
    const referenceId = req.headers.get('X-Reference-Id')
    
    if (!referenceId) {
      console.error('Missing X-Reference-Id header')
      return new Response(
        JSON.stringify({ error: 'Missing reference ID' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse callback payload
    const payload: CallbackPayload = await req.json()
    const { status, externalId, amount, financialTransactionId, reason } = payload

    console.log('Payment callback received:', {
      referenceId,
      status,
      externalId,
      amount
    })

    // Find transaction by reference ID
    const { data: transaction, error: findError } = await supabase
      .from('transactions')
      .select('*, orders(*)')
      .eq('momo_reference_id', referenceId)
      .single()

    if (findError || !transaction) {
      console.error('Transaction not found:', referenceId, findError)
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

    // Update transaction status
    const transactionStatus = status === 'SUCCESSFUL' ? 'success' : 
                             status === 'FAILED' ? 'failed' : 'pending'

    const updateData: any = {
      status: transactionStatus,
      callback_data: payload,
      updated_at: new Date().toISOString()
    }

    if (status === 'SUCCESSFUL') {
      updateData.paid_at = new Date().toISOString()
      if (financialTransactionId) {
        updateData.momo_external_id = financialTransactionId
      }
    } else if (status === 'FAILED') {
      updateData.error_message = reason || 'Payment failed'
    }

    // Update transaction
    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update transaction',
          details: updateError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // If payment successful, update order and process fulfillment
    if (status === 'SUCCESSFUL') {
      const orderId = transaction.order_id

      // Update order status
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'paid',
          transaction_id: transaction.id
        })
        .eq('id', orderId)

      if (orderUpdateError) {
        console.error('Error updating order:', orderUpdateError)
      }

      // Reduce inventory for order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId)

      if (orderItems) {
        for (const item of orderItems) {
          // Reduce stock (using RPC or direct update)
          await supabase.rpc('decrement_product_stock', {
            product_id: item.product_id,
            quantity: item.quantity
          }).catch(async () => {
            // Fallback: direct update if RPC doesn't exist
            const { data: product } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', item.product_id)
              .single()

            if (product) {
              await supabase
                .from('products')
                .update({
                  stock_quantity: Math.max(0, (product.stock_quantity || 0) - item.quantity)
                })
                .eq('id', item.product_id)
            }
          })
        }
      }

      // Clear user cart
      if (transaction.user_id) {
        await supabase
          .from('cart')
          .delete()
          .eq('user_id', transaction.user_id)
      }

      // Update seller earnings
      if (transaction.seller_id && transaction.seller_earnings) {
        await supabase.rpc('increment_seller_earnings', {
          seller_user_id: transaction.seller_id,
          amount: transaction.seller_earnings
        }).catch(async () => {
          // Fallback: direct update
          const { data: sellerProfile } = await supabase
            .from('seller_profiles')
            .select('total_earnings, pending_payout')
            .eq('user_id', transaction.seller_id)
            .single()

          if (sellerProfile) {
            await supabase
              .from('seller_profiles')
              .update({
                total_earnings: (sellerProfile.total_earnings || 0) + transaction.seller_earnings,
                pending_payout: (sellerProfile.pending_payout || 0) + transaction.seller_earnings
              })
              .eq('user_id', transaction.seller_id)
          }
        })
      }

      // Trigger email notification (async, don't wait)
      fetch(`${req.url.split('/functions/')[0]}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization') || '',
          'apikey': req.headers.get('apikey') || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_id: orderId,
          type: 'order_confirmation'
        })
      }).catch(err => {
        console.error('Error triggering email:', err)
      })
    }

    // Return success response to MTN
    return new Response(
      JSON.stringify({ 
        success: true,
        referenceId,
        status: transactionStatus
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in payment-callback:', error)
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
