# 🚀 Supabase Edge Functions Setup Guide

This guide will help you set up and deploy the MTN MoMo payment integration Edge Functions.

---

## 📋 Prerequisites

1. **Supabase CLI** installed
   ```bash
   npm install -g supabase
   ```

2. **Supabase Project** - You should have a Supabase project already set up

3. **MTN MoMo Developer Account** - With API credentials ready

---

## 🔧 Step 1: Install Supabase CLI (if not installed)

```bash
# Install globally
npm install -g supabase

# Or using Homebrew (Mac)
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

---

## 🔐 Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate with Supabase.

---

## 🔗 Step 3: Link Your Project

```bash
# Navigate to your project directory
cd C:\Users\Erick\Desktop\Iseta

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your project ref:**
- Go to your Supabase Dashboard
- The project ref is in the URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`
- Or check Settings → General → Reference ID

---

## 🔑 Step 4: Set Environment Variables (Secrets)

Set the following secrets in your Supabase project:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Edge Functions** → **Secrets**
2. Add the following secrets:

```
MOMO_API_USER=your_api_user_here
MOMO_API_KEY=your_api_key_here
MOMO_PRIMARY_KEY=7f7668344bdb4584bce151d3dec6bb75
MOMO_SECONDARY_KEY=41141b5c8f4446cfbf512a344e65c670
MOMO_SUBSCRIPTION_KEY=your_subscription_key_here
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_CALLBACK_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-callback
MOMO_TARGET_ENVIRONMENT=sandbox
```

**For Production:**
```
MOMO_BASE_URL=https://momodeveloper.mtn.com
MOMO_TARGET_ENVIRONMENT=production
MOMO_CALLBACK_URL=https://yourdomain.com/api/payment/callback
```

### Option B: Using Supabase CLI

```bash
# Set secrets one by one
supabase secrets set MOMO_API_USER=your_api_user_here
supabase secrets set MOMO_API_KEY=your_api_key_here
supabase secrets set MOMO_PRIMARY_KEY=7f7668344bdb4584bce151d3dec6bb75
supabase secrets set MOMO_SECONDARY_KEY=41141b5c8f4446cfbf512a344e65c670
supabase secrets set MOMO_SUBSCRIPTION_KEY=your_subscription_key_here
supabase secrets set MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
supabase secrets set MOMO_CALLBACK_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-callback
supabase secrets set MOMO_TARGET_ENVIRONMENT=sandbox

# Optional: For email notifications (Resend)
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

---

## 📦 Step 5: Deploy Edge Functions

Deploy all functions at once:

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy momo-auth
supabase functions deploy request-to-pay
supabase functions deploy payment-callback
supabase functions deploy payment-status
supabase functions deploy send-email
```

---

## 🧪 Step 6: Test the Functions

### Test Authentication Function

```bash
# Get your anon key from Supabase Dashboard → Settings → API
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/momo-auth' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY'
```

### Test Request to Pay

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/request-to-pay' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "order_id": "test-order-123",
    "phone": "+250788123456",
    "amount": 1000,
    "user_id": "user-uuid-here"
  }'
```

---

## 🔍 Step 7: Verify Functions are Deployed

1. Go to **Supabase Dashboard** → **Edge Functions**
2. You should see all 5 functions listed:
   - `momo-auth`
   - `request-to-pay`
   - `payment-callback`
   - `payment-status`
   - `send-email`

---

## 📝 Step 8: Update Callback URL in MTN Dashboard

1. Go to your **MTN MoMo Developer Portal**
2. Navigate to your application settings
3. Set the **Callback URL** to:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/payment-callback
   ```

**Important:** This URL must be publicly accessible for MTN to send webhooks.

---

## 🛠️ Local Development (Optional)

To test functions locally:

```bash
# Start local Supabase (requires Docker)
supabase start

# Serve functions locally
supabase functions serve

# Test locally
curl -X POST \
  'http://localhost:54321/functions/v1/momo-auth' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'apikey: YOUR_ANON_KEY'
```

---

## 📊 Function Endpoints

Once deployed, your functions will be available at:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/{function-name}
```

### Available Endpoints:

1. **POST** `/functions/v1/momo-auth`
   - Get MTN MoMo access token
   - No body required

2. **POST** `/functions/v1/request-to-pay`
   - Initiate payment request
   - Body: `{ order_id, phone, amount, user_id }`

3. **POST** `/functions/v1/payment-callback`
   - Webhook endpoint for MTN callbacks
   - Called automatically by MTN

4. **GET** `/functions/v1/payment-status?reference_id={id}`
   - Check payment status
   - Query param: `reference_id`

5. **POST** `/functions/v1/send-email`
   - Send order confirmation email
   - Body: `{ order_id, type }`

---

## 🔒 Security Notes

1. **Never commit secrets** - All sensitive data should be in Supabase Secrets
2. **Use RLS policies** - Ensure database tables have proper Row Level Security
3. **Validate inputs** - All functions validate input data
4. **HTTPS only** - Production callbacks must use HTTPS

---

## 🐛 Troubleshooting

### Function not found
- Verify function is deployed: `supabase functions list`
- Check function name matches exactly

### Authentication errors
- Verify secrets are set: Check Supabase Dashboard → Edge Functions → Secrets
- Ensure MOMO_API_USER and MOMO_API_KEY are correct

### Callback not receiving
- Verify callback URL is publicly accessible
- Check MTN dashboard has correct callback URL
- Verify function is deployed and active

### Database errors
- Ensure database migrations are run
- Check RLS policies allow function access
- Verify SUPABASE_SERVICE_ROLE_KEY is set (auto-set by Supabase)

---

## ✅ Next Steps

After setting up Edge Functions:

1. ✅ Test authentication function
2. ✅ Test request-to-pay with sandbox
3. ✅ Verify callback is receiving webhooks
4. ✅ Set up email service (Resend recommended)
5. ✅ Test complete payment flow
6. ✅ Move to production when ready

---

## 📚 Additional Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [MTN MoMo API Documentation](https://momodeveloper.mtn.com/)
- [Deno Runtime Docs](https://deno.land/manual)

---

**Ready to deploy!** 🚀
