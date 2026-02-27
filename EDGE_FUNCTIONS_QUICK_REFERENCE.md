# 🚀 Edge Functions Quick Reference

Quick reference guide for the MTN MoMo payment integration Edge Functions.

---

## 📍 Function Endpoints

Base URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1`

---

## 1. 🔐 momo-auth

**Purpose:** Get MTN MoMo access token

**Endpoint:** `POST /functions/v1/momo-auth`

**Request:**
```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/momo-auth' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY'
```

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

---

## 2. 💳 request-to-pay

**Purpose:** Initiate payment request to MTN MoMo

**Endpoint:** `POST /functions/v1/request-to-pay`

**Request Body:**
```json
{
  "order_id": "uuid-here",
  "phone": "+250788123456",
  "amount": 1000,
  "user_id": "user-uuid-here"
}
```

**Request:**
```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/request-to-pay' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "uuid-here",
    "phone": "+250788123456",
    "amount": 1000,
    "user_id": "user-uuid-here"
  }'
```

**Success Response (202):**
```json
{
  "success": true,
  "reference_id": "uuid-reference",
  "transaction_id": "transaction-uuid",
  "status": "pending",
  "message": "Payment request sent. Please check your phone to confirm."
}
```

**Error Response:**
```json
{
  "error": "Payment request failed",
  "status": 400,
  "details": "Error message"
}
```

---

## 3. 📞 payment-callback

**Purpose:** Webhook endpoint for MTN MoMo payment callbacks

**Endpoint:** `POST /functions/v1/payment-callback`

**Note:** This is called automatically by MTN MoMo. You don't need to call it manually.

**MTN sends:**
- Header: `X-Reference-Id` (the reference ID)
- Body: Payment status and details

**What it does:**
- Updates transaction status
- Updates order status to "paid"
- Reduces inventory
- Clears cart
- Sends email
- Updates seller earnings

---

## 4. 🔍 payment-status

**Purpose:** Check payment status by reference ID

**Endpoint:** `GET /functions/v1/payment-status?reference_id={id}`

**Request:**
```bash
curl -X GET \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-status?reference_id=uuid-here' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY'
```

**Response:**
```json
{
  "reference_id": "uuid-here",
  "status": "success",
  "amount": 1000,
  "currency": "RWF",
  "financial_transaction_id": "mtn-tx-id",
  "paid_at": "2024-01-15T10:30:00Z",
  "source": "mtn_api"
}
```

**Status values:**
- `pending` - Payment request sent, waiting for user confirmation
- `success` - Payment completed successfully
- `failed` - Payment failed
- `timeout` - Payment timed out
- `cancelled` - Payment was cancelled

---

## 5. 📧 send-email

**Purpose:** Send order confirmation email

**Endpoint:** `POST /functions/v1/send-email`

**Request Body:**
```json
{
  "order_id": "uuid-here",
  "type": "order_confirmation"
}
```

**Request:**
```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "uuid-here",
    "type": "order_confirmation"
  }'
```

**Response:**
```json
{
  "success": true,
  "email_id": "resend-email-id",
  "message": "Email sent successfully"
}
```

**Email types:**
- `order_confirmation` - Order confirmation email
- `payment_failed` - Payment failed notification
- `order_cancelled` - Order cancellation notification

---

## 🔄 Complete Payment Flow

```javascript
// 1. Create order
const order = await createOrder(cartItems, userId)

// 2. Request payment
const paymentResponse = await fetch(
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/request-to-pay',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'apikey': anonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_id: order.id,
      phone: userPhone,
      amount: order.total_amount,
      user_id: userId
    })
  }
)

const { reference_id, transaction_id } = await paymentResponse.json()

// 3. Poll payment status (or wait for webhook)
const checkStatus = async () => {
  const statusResponse = await fetch(
    `https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-status?reference_id=${reference_id}`,
    {
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      }
    }
  )
  return await statusResponse.json()
}

// Poll every 3 seconds until status changes
const pollInterval = setInterval(async () => {
  const status = await checkStatus()
  if (status.status === 'success') {
    clearInterval(pollInterval)
    // Payment successful!
    // Redirect to success page
  } else if (status.status === 'failed') {
    clearInterval(pollInterval)
    // Payment failed
    // Show error message
  }
}, 3000)
```

---

## 🔑 Required Secrets

Make sure these are set in Supabase Dashboard → Edge Functions → Secrets:

```
MOMO_API_USER
MOMO_API_KEY
MOMO_PRIMARY_KEY
MOMO_SECONDARY_KEY
MOMO_SUBSCRIPTION_KEY
MOMO_BASE_URL
MOMO_CALLBACK_URL
MOMO_TARGET_ENVIRONMENT
RESEND_API_KEY (optional, for emails)
```

---

## 🐛 Common Issues

### 401 Unauthorized
- Check that `Authorization` header includes `Bearer YOUR_ANON_KEY`
- Check that `apikey` header is set

### 500 Internal Server Error
- Check Supabase Edge Functions logs
- Verify all secrets are set correctly
- Check database migrations are run

### Payment callback not received
- Verify callback URL in MTN dashboard
- Check function is deployed
- Verify callback URL is publicly accessible

### Email not sending
- Check `RESEND_API_KEY` is set (if using Resend)
- Verify email service is configured
- Check Edge Functions logs for errors

---

## 📚 Next Steps

1. ✅ Deploy functions: `supabase functions deploy`
2. ✅ Set secrets in Supabase Dashboard
3. ✅ Test authentication function
4. ✅ Test request-to-pay with sandbox
5. ✅ Verify callback URL in MTN dashboard
6. ✅ Test complete payment flow

---

**Ready to integrate!** 🚀
