// Send Email Notification
// This function sends order confirmation emails

import { supabase } from '../_shared/supabase.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  order_id: string
  type: 'order_confirmation' | 'payment_failed' | 'order_cancelled'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()
    const { order_id, type } = payload

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'Missing order_id' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch order details with user and items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            price
          )
        ),
        user:user_id (
          email
        )
      `)
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ 
          error: 'Order not found',
          details: orderError?.message
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user email
    const { data: user } = await supabase.auth.admin.getUserById(order.user_id)
    const userEmail = user?.user?.email

    if (!userEmail) {
      return new Response(
        JSON.stringify({ 
          error: 'User email not found'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate email HTML
    const emailHTML = generateOrderEmailHTML(order, type)

    // Use Supabase's built-in email or external service
    // Option 1: Use Resend (recommended)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Iseta <orders@iseta.com>', // Update with your domain
          to: userEmail,
          subject: type === 'order_confirmation' 
            ? `Order Confirmation - ${order_id.slice(0, 8)}`
            : `Order Update - ${order_id.slice(0, 8)}`,
          html: emailHTML
        })
      })

      if (resendResponse.ok) {
        const resendData = await resendResponse.json()
        return new Response(
          JSON.stringify({
            success: true,
            email_id: resendData.id,
            message: 'Email sent successfully'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Option 2: Log email (for development/testing)
    console.log('Email would be sent to:', userEmail)
    console.log('Email HTML:', emailHTML)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email logged (no email service configured)',
        recipient: userEmail
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-email:', error)
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

function generateOrderEmailHTML(order: any, type: string): string {
  const orderItems = order.order_items || []
  const totalAmount = order.total_amount || order.price_at_time || 0

  let itemsHTML = ''
  orderItems.forEach((item: any) => {
    itemsHTML += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.products?.name || 'Product'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${(item.price_at_time * item.quantity).toLocaleString()} RWF
        </td>
      </tr>
    `
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Iseta</h1>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; margin-top: 20px;">
        <h2 style="color: #000; margin-top: 0;">
          ${type === 'order_confirmation' ? 'Order Confirmation' : 'Order Update'}
        </h2>
        
        <p>Thank you for your order!</p>
        
        <div style="background-color: #fff; padding: 15px; margin: 20px 0; border-left: 4px solid #000;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id.slice(0, 8)}...</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
          <p style="margin: 5px 0;"><strong>Payment:</strong> ${order.payment_status || 'Pending'}</p>
        </div>
        
        <h3 style="color: #000;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #000;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #000;">Quantity</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #000;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #000;">
                Total:
              </td>
              <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #000;">
                ${totalAmount.toLocaleString()} RWF
              </td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
        
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    </body>
    </html>
  `
}
