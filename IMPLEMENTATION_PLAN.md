# 🚀 Full Payment, Cart & Seller System - Implementation Plan

**Project:** Iseta Multi-Vendor E-Commerce Platform  
**Payment Provider:** MTN Mobile Money (MoMo)  
**Tech Stack:** React + Supabase + MTN MoMo API

---

## 📋 CURRENT STATE ANALYSIS

### ✅ What Already Exists
- **Authentication System** - User registration, login, password reset
- **Product Management** - CRUD operations, variations, inventory tracking
- **Storefront** - Public store pages with product catalog
- **Basic Order System** - Manual order creation by sellers (pending/paid/completed/cancelled)
- **Seller Dashboard** - Orders view, overview stats, product management
- **Database Tables:**
  - `profiles` - User/seller profiles
  - `products` - Product catalog
  - `orders` - Basic order tracking (needs enhancement)

### ❌ What's Missing
- **Cart System** - No shopping cart functionality
- **Payment Integration** - No MTN MoMo integration
- **Checkout Flow** - No customer checkout process
- **Transaction Tracking** - No payment transaction records
- **Email Notifications** - No order confirmation emails
- **Seller Profiles** - No merchant onboarding system
- **Multi-Vendor Payments** - No commission/settlement logic
- **Order Items** - Orders only track single product (need order_items table)

---

## 🎯 IMPLEMENTATION ROADMAP

### PHASE 1: DATABASE SCHEMA ENHANCEMENTS

#### 1.1 Cart Table
```sql
CREATE TABLE cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  variations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, variations)
);
```

#### 1.2 Order Items Table (Support Multi-Product Orders)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL,
  variations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.3 Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'RWF',
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'success', 'failed', 'timeout', 'cancelled')),
  
  -- MTN MoMo Details
  momo_reference_id UUID UNIQUE,
  momo_external_id TEXT,
  momo_phone_number TEXT NOT NULL,
  payment_method TEXT DEFAULT 'mtn_momo',
  
  -- Platform Settlement
  platform_fee DECIMAL(10,2) DEFAULT 0,
  seller_earnings DECIMAL(10,2) DEFAULT 0,
  seller_id UUID REFERENCES profiles(id),
  
  -- Metadata
  callback_data JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.4 Seller Profiles Table
```sql
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Business Info
  business_name TEXT NOT NULL,
  business_type TEXT,
  tin_number TEXT,
  
  -- MTN Merchant Info
  merchant_id TEXT UNIQUE,
  momo_phone_number TEXT,
  
  -- Verification
  verification_document TEXT, -- URL to uploaded document
  account_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.5 Update Orders Table
```sql
-- Add new columns to existing orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES transactions(id),
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_earnings DECIMAL(10,2) DEFAULT 0;
```

---

### PHASE 2: CART SYSTEM IMPLEMENTATION

#### 2.1 Frontend Components
- **CartIcon Component** - Display cart count badge
- **CartModal Component** - Full cart view with items
- **AddToCartButton** - Replace WhatsApp button in ProductDetailModal
- **CartContext** - Global cart state management

#### 2.2 Cart Functions (Supabase)
```javascript
// Add to cart
const addToCart = async (productId, quantity, variations) => {
  // Check stock availability
  // Insert/update cart item
  // Handle multi-seller cart logic
}

// Remove from cart
const removeFromCart = async (cartId) => {
  // Delete cart item
}

// Update quantity
const updateCartQuantity = async (cartId, quantity) => {
  // Validate stock
  // Update quantity
}

// Get user cart
const getUserCart = async () => {
  // Fetch cart with product details
  // Group by seller
  // Calculate totals
}

// Clear cart
const clearCart = async () => {
  // Delete all cart items for user
}
```

#### 2.3 Business Rules
- Prevent quantity > available stock
- Auto-calculate totals per seller
- Restrict cart to authenticated users
- Handle multi-seller cart (group by seller)
- Validate variations match product options

---

### PHASE 3: MTN MOMO API INTEGRATION

#### 3.1 Backend Setup (Supabase Edge Functions)

**File Structure:**
```
supabase/
  functions/
    momo-auth/
      index.ts          # Get access token
    request-to-pay/
      index.ts          # Initiate payment
    payment-status/
      index.ts          # Check payment status
    payment-callback/
      index.ts          # Webhook handler
```

#### 3.2 Environment Variables (Supabase Secrets)
```bash
MOMO_API_USER=your_api_user
MOMO_API_KEY=your_api_key
MOMO_PRIMARY_KEY=7f7668344bdb4584bce151d3dec6bb75
MOMO_SECONDARY_KEY=41141b5c8f4446cfbf512a344e65c670
MOMO_SUBSCRIPTION_KEY=your_subscription_key
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com  # or production URL
MOMO_CALLBACK_URL=https://your-domain.com/api/payment/callback
```

#### 3.3 Authentication Function
```typescript
// supabase/functions/momo-auth/index.ts
export async function getMomoToken() {
  const apiUser = Deno.env.get('MOMO_API_USER');
  const apiKey = Deno.env.get('MOMO_API_KEY');
  const subscriptionKey = Deno.env.get('MOMO_SUBSCRIPTION_KEY');
  
  const response = await fetch(`${baseUrl}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${apiUser}:${apiKey}`)}`,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.access_token;
}
```

#### 3.4 Request to Pay Function
```typescript
// supabase/functions/request-to-pay/index.ts
export async function requestToPay(phone: string, amount: number, orderId: string) {
  const token = await getMomoToken();
  const referenceId = crypto.randomUUID();
  
  // Save transaction as PENDING
  await supabase.from('transactions').insert({
    order_id: orderId,
    momo_reference_id: referenceId,
    momo_phone_number: phone,
    amount: amount,
    status: 'pending'
  });
  
  // Call MTN API
  const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Target-Environment': 'sandbox', // or 'production'
      'X-Reference-Id': referenceId,
      'X-Callback-Url': callbackUrl,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: 'RWF',
      externalId: orderId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phone.replace(/[^0-9]/g, '')
      },
      payerMessage: `Payment for order ${orderId}`,
      payeeNote: `Order ${orderId}`
    })
  });
  
  return { referenceId, status: response.status };
}
```

#### 3.5 Payment Callback Handler
```typescript
// supabase/functions/payment-callback/index.ts
export async function handlePaymentCallback(req: Request) {
  const { referenceId, status, amount } = await req.json();
  
  // Validate callback authenticity (check headers, signatures)
  
  // Update transaction
  const { data: transaction } = await supabase
    .from('transactions')
    .update({
      status: status === 'SUCCESSFUL' ? 'success' : 'failed',
      paid_at: status === 'SUCCESSFUL' ? new Date().toISOString() : null,
      callback_data: req.body
    })
    .eq('momo_reference_id', referenceId)
    .select()
    .single();
  
  if (status === 'SUCCESSFUL' && transaction) {
    // Update order
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'paid',
        transaction_id: transaction.id
      })
      .eq('id', transaction.order_id);
    
    // Reduce stock
    await reduceOrderStock(transaction.order_id);
    
    // Clear cart
    await clearUserCart(transaction.user_id);
    
    // Send email
    await sendOrderConfirmationEmail(transaction.order_id);
    
    // Update seller earnings
    await updateSellerEarnings(transaction.order_id);
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

### PHASE 4: CHECKOUT FLOW

#### 4.1 Checkout Page Component
```javascript
// src/pages/Checkout.jsx
const Checkout = () => {
  // 1. Fetch user cart
  // 2. Group items by seller
  // 3. Calculate totals per seller
  // 4. Display order summary
  // 5. Collect customer phone number
  // 6. Initiate payment on "Pay Now"
}
```

#### 4.2 Checkout Process
1. **Validate Cart**
   - Check all items still in stock
   - Verify quantities
   - Check product availability

2. **Create Order**
   - Create order record (status: pending)
   - Create order_items for each cart item
   - Calculate total amount
   - Save customer info

3. **Initiate Payment**
   - Call request-to-pay edge function
   - Show payment pending UI
   - Poll payment status (or wait for webhook)

4. **On Payment Success**
   - Update order status
   - Reduce inventory
   - Clear cart
   - Send email
   - Show success page

---

### PHASE 5: EMAIL NOTIFICATION SYSTEM

#### 5.1 Setup (Supabase Edge Function)
```typescript
// supabase/functions/send-email/index.ts
import { Resend } from 'https://esm.sh/resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

export async function sendOrderConfirmationEmail(orderId: string) {
  // Fetch order details
  const order = await getOrderDetails(orderId);
  
  // Send email
  await resend.emails.send({
    from: 'orders@iseta.com',
    to: order.user.email,
    subject: `Order Confirmation - ${orderId}`,
    html: generateOrderEmailHTML(order)
  });
}
```

#### 5.2 Email Template
- Order ID
- Product list with quantities
- Total amount
- Payment confirmation
- Support contact info
- Store information

---

### PHASE 6: SELLER REGISTRATION & MERCHANT ONBOARDING

#### 6.1 Update Profiles Table
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' 
    CHECK (role IN ('buyer', 'seller', 'admin')),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending'
    CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));
```

#### 6.2 Seller Registration Flow
1. **Account Creation**
   - User signs up
   - Selects "I want to sell" option
   - Role set to 'seller'
   - Account status: 'pending'

2. **Business Info Submission**
   - Fill seller profile form
   - Submit Merchant ID
   - Upload verification document
   - Save to `seller_profiles` table

3. **Admin Approval**
   - Admin reviews application
   - Approve/reject in admin panel
   - On approval: `account_status = 'approved'`, `is_verified = true`

#### 6.3 Seller Profile Form Component
```javascript
// src/components/seller/SellerProfileForm.jsx
- Business name
- Business type
- Merchant ID
- MoMo phone number
- TIN number (optional)
- Verification document upload
```

---

### PHASE 7: MULTI-VENDOR PAYMENT LOGIC

#### 7.1 Platform Settlement Strategy
- Customer pays to **platform Merchant ID**
- Platform records `seller_id` per product
- Calculate commission (e.g., 5% platform fee)
- Track seller earnings in `transactions` table
- Store payout balance in `seller_profiles`

#### 7.2 Commission Calculation
```javascript
const calculateCommission = (orderTotal) => {
  const platformFeePercent = 0.05; // 5%
  const platformFee = orderTotal * platformFeePercent;
  const sellerEarnings = orderTotal - platformFee;
  
  return { platformFee, sellerEarnings };
};
```

#### 7.3 Seller Earnings Tracking
```sql
-- Add to seller_profiles
ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_payout DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_out DECIMAL(10,2) DEFAULT 0;
```

---

### PHASE 8: ENHANCED SELLER DASHBOARD

#### 8.1 New Dashboard Features
- **Revenue Summary**
  - Total earnings
  - Pending payouts
  - Commission breakdown
  
- **Payout Management**
  - Request withdrawal
  - View payout history
  - Pending balance

- **Order Management** (Enhanced)
  - Filter by payment status
  - View transaction details
  - Export orders

---

### PHASE 9: SECURITY & VALIDATION

#### 9.1 Validations
- **MTN Phone Format**: `+250XXXXXXXXX` or `250XXXXXXXXX`
- **Duplicate Merchant ID**: Unique constraint on `seller_profiles.merchant_id`
- **Duplicate Payments**: Idempotency key on transactions
- **Stock Validation**: Prevent overselling
- **Input Sanitization**: All user inputs

#### 9.2 Security Measures
- Encrypt sensitive financial data
- Rate limiting on payment endpoints
- Webhook signature validation
- Audit logs for merchant ID updates
- RLS policies on all tables

---

### PHASE 10: ADMIN & MONITORING

#### 10.1 Admin Panel Features
- **Transaction Monitoring**
  - View all transactions
  - Filter by status, date, seller
  - Export transaction reports

- **Seller Management**
  - Approve/reject seller applications
  - View seller profiles
  - Suspend/activate sellers

- **Revenue Analytics**
  - Platform revenue
  - Commission breakdown
  - Seller performance metrics

- **Manual Verification**
  - Manual transaction verification tool
  - Override payment status (with audit log)

---

## 🔄 COMPLETE SYSTEM FLOW

```
1. Customer browses storefront
2. Adds products to cart
3. Clicks checkout
4. System validates cart & stock
5. Creates order (PENDING)
6. Creates order_items
7. Calls MTN MoMo request-to-pay
8. Customer confirms on phone
9. MTN sends webhook callback
10. System updates transaction (SUCCESS)
11. Updates order (PAID)
12. Reduces inventory
13. Clears cart
14. Sends email confirmation
15. Updates seller earnings
16. Shows success page
```

---

## 📦 FILE STRUCTURE

```
src/
  components/
    cart/
      CartIcon.jsx
      CartModal.jsx
      AddToCartButton.jsx
    checkout/
      CheckoutPage.jsx
      PaymentStatus.jsx
    seller/
      SellerProfileForm.jsx
      SellerOnboarding.jsx
  pages/
    Checkout.jsx
    SellerRegistration.jsx
    Admin.jsx
  contexts/
    CartContext.jsx
  lib/
    momoClient.js          # MTN MoMo API client
    emailService.js        # Email utilities
    cartService.js         # Cart operations
    paymentService.js      # Payment operations

supabase/
  functions/
    momo-auth/
      index.ts
    request-to-pay/
      index.ts
    payment-status/
      index.ts
    payment-callback/
      index.ts
    send-email/
      index.ts
  migrations/
    create_cart_table.sql
    create_order_items_table.sql
    create_transactions_table.sql
    create_seller_profiles_table.sql
    update_orders_table.sql
    update_profiles_table.sql
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Week 1: Foundation
1. ✅ Database migrations (cart, order_items, transactions, seller_profiles)
2. ✅ Cart system (frontend + backend)
3. ✅ Basic checkout page

### Week 2: Payment Integration
4. ✅ MTN MoMo API setup
5. ✅ Request-to-pay function
6. ✅ Payment callback handler
7. ✅ Payment status polling

### Week 3: Complete Flow
8. ✅ Email notifications
9. ✅ Seller onboarding
10. ✅ Multi-vendor payment logic

### Week 4: Polish & Admin
11. ✅ Security validations
12. ✅ Admin panel
13. ✅ Testing & bug fixes

---

## 🔑 API KEYS (From TASKfinal.md)

```
Primary Key: 7f7668344bdb4584bce151d3dec6bb75
Secondary Key: 41141b5c8f4446cfbf512a344e65c670
```

**⚠️ IMPORTANT:** Store these as Supabase secrets, never commit to git!

---

## 📝 NEXT STEPS

1. Review this implementation plan
2. Set up Supabase Edge Functions environment
3. Create database migrations
4. Start with Phase 1 (Database Schema)
5. Build incrementally, test each phase

---

**Ready to start implementation!** 🚀
