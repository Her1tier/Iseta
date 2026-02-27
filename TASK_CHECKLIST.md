# ✅ Task Implementation Checklist

**Based on TASKfinal.md requirements**

---

## 🟢 PHASE 1: MTN MOMO API INTEGRATION

### 1. Developer Setup
- [ ] Register on MTN MoMo Developer Portal
- [ ] Create Application
- [ ] Obtain API credentials:
  - [ ] API_USER
  - [ ] API_KEY
  - [ ] PRIMARY_KEY ✅ (7f7668344bdb4584bce151d3dec6bb75)
  - [ ] SECONDARY_KEY ✅ (41141b5c8f4446cfbf512a344e65c670)
  - [ ] COLLECTION_SUBSCRIPTION_KEY
  - [ ] CALLBACK_URL
  - [ ] Merchant ID
- [ ] Configure sandbox environment
- [ ] Prepare production deployment checklist

### 2. Backend Configuration
- [ ] Set up Supabase Edge Functions
- [ ] Install dependencies (if needed)
- [ ] Configure environment variables in Supabase Secrets:
  - [ ] MOMO_API_USER
  - [ ] MOMO_API_KEY
  - [ ] MOMO_PRIMARY_KEY
  - [ ] MOMO_SUBSCRIPTION_KEY
  - [ ] MOMO_BASE_URL
  - [ ] MOMO_CALLBACK_URL
- [ ] Security: Load env securely
- [ ] Security: Do not commit secrets
- [ ] Security: Configure HTTPS for production

### 3. Authentication
- [ ] Create `supabase/functions/momo-auth/index.ts`
- [ ] Implement Basic Auth
- [ ] Retrieve access token
- [ ] Optional: Cache token temporarily

### 4. Request To Pay
- [ ] Create `supabase/functions/request-to-pay/index.ts`
- [ ] Implement `request_to_pay(phone, amount, order_id)`
- [ ] Generate UUID reference
- [ ] Save transaction (PENDING) to database
- [ ] Send payment request to MTN API
- [ ] Log response

### 5. Payment Status Handling
- [ ] Create `supabase/functions/payment-status/index.ts`
- [ ] Implement `check_payment_status(reference_id)`
- [ ] Implement webhook callback handler
- [ ] Update transaction status:
  - [ ] SUCCESS
  - [ ] FAILED
  - [ ] TIMEOUT

### 6. Webhook Endpoint
- [ ] Create `supabase/functions/payment-callback/index.ts`
- [ ] POST endpoint: `/api/payment/callback`
- [ ] Validate authenticity (signature validation)
- [ ] Update transaction status
- [ ] Trigger order update
- [ ] Trigger email notification
- [ ] Log activity

---

## 🛒 PHASE 2: CART SYSTEM

### 1. Database Tables
- [ ] Create `cart` table migration
- [ ] Create `order_items` table migration
- [ ] Verify `users` table exists (auth.users)
- [ ] Verify `products` table exists
- [ ] Verify `orders` table exists

### 2. Cart Logic
- [ ] Create `src/lib/cartService.js`
- [ ] Implement `add_to_cart(user_id, product_id, quantity)`
- [ ] Implement `remove_from_cart(cart_id)`
- [ ] Implement `update_cart_quantity(cart_id, quantity)`
- [ ] Implement `get_user_cart(user_id)`
- [ ] Implement `clear_cart(user_id)`

**Business Rules:**
- [ ] Prevent quantity > stock
- [ ] Auto calculate totals
- [ ] Restrict cart to owner (RLS policies)
- [ ] Handle multi-seller cart

### 3. Frontend Components
- [ ] Create `src/components/cart/CartIcon.jsx`
- [ ] Create `src/components/cart/CartModal.jsx`
- [ ] Create `src/components/cart/AddToCartButton.jsx`
- [ ] Create `src/contexts/CartContext.jsx`
- [ ] Update `ProductDetailModal.jsx` to use AddToCartButton
- [ ] Add cart icon to navigation/header

---

## 🧾 PHASE 3: CHECKOUT FLOW

- [ ] Create `src/pages/Checkout.jsx`
- [ ] Step 1: User clicks checkout
- [ ] Step 2: Validate cart
- [ ] Step 3: Validate stock
- [ ] Step 4: Create Order (PENDING)
- [ ] Step 5: Create OrderItems
- [ ] Step 6: Calculate total
- [ ] Step 7: Call `request_to_pay()`
- [ ] Step 8: Await payment confirmation
- [ ] Step 9: On SUCCESS:
  - [ ] Reduce stock
  - [ ] Mark order PAID
  - [ ] Clear cart
  - [ ] Send email

---

## 📧 PHASE 4: EMAIL NOTIFICATION SYSTEM

### Setup
- [ ] Choose email service (Resend/SendGrid/SMTP)
- [ ] Install email library
- [ ] Add email credentials to Supabase Secrets:
  - [ ] EMAIL_API_KEY (or SMTP credentials)
  - [ ] EMAIL_FROM_ADDRESS

### Function
- [ ] Create `supabase/functions/send-email/index.ts`
- [ ] Implement `send_order_confirmation_email(user_email, order_data)`

**Email Must Include:**
- [ ] Order ID
- [ ] Products purchased
- [ ] Quantity
- [ ] Total amount
- [ ] Payment confirmation
- [ ] Support contact

- [ ] Log email success/failure

---

## 🧑‍💼 PHASE 5: SELLER REGISTRATION & MERCHANT ONBOARDING

### 1. Update Users/Profiles Table
- [ ] Add `role` column (buyer, seller, admin)
- [ ] Add `is_verified` column
- [ ] Add `account_status` column (PENDING, APPROVED, REJECTED, SUSPENDED)

### 2. SellerProfile Table
- [ ] Create `seller_profiles` table migration
- [ ] Fields:
  - [ ] id
  - [ ] user_id
  - [ ] business_name
  - [ ] business_type
  - [ ] merchant_id
  - [ ] momo_phone_number
  - [ ] tin_number (optional)
  - [ ] verification_document
  - [ ] created_at
  - [ ] updated_at

### 3. Seller Registration Flow

**Step 1: Account Creation**
- [ ] Update signup form to include "I want to sell" option
- [ ] Set role = SELLER on registration
- [ ] Email verification required

**Step 2: Business Info Submission**
- [ ] Create `src/pages/SellerRegistration.jsx`
- [ ] Create `src/components/seller/SellerProfileForm.jsx`
- [ ] Submit Merchant ID
- [ ] Submit business info
- [ ] Save status = PENDING

**Step 3: Admin Approval**
- [ ] Create admin review interface
- [ ] Admin reviews seller
- [ ] Approve or reject functionality
- [ ] On approval:
  - [ ] account_status = APPROVED
  - [ ] is_verified = True

---

## 💰 PHASE 6: MULTI-VENDOR PAYMENT LOGIC

### Recommended MVP Strategy: Platform Settlement
- [ ] Customer pays platform Merchant ID
- [ ] Platform records seller_id per product
- [ ] Calculate commission (e.g., 5%)
- [ ] Track seller earnings
- [ ] Store payout balance

### Add to Orders/Transactions:
- [ ] Add `seller_id` to transactions
- [ ] Add `platform_fee` column
- [ ] Add `seller_earnings` column
- [ ] Update seller_profiles with earnings tracking

---

## 📊 PHASE 7: SELLER DASHBOARD

- [ ] View products (already exists)
- [ ] View orders (already exists - enhance)
- [ ] View revenue summary
  - [ ] Total earnings
  - [ ] Pending payouts
  - [ ] Commission breakdown
- [ ] View pending payouts
- [ ] Request withdrawal (future)
- [ ] Edit business info (restricted)

---

## 🔐 PHASE 8: SECURITY & VALIDATION

- [ ] Validate MTN phone format (+250XXXXXXXXX)
- [ ] Prevent duplicate Merchant ID (unique constraint)
- [ ] Prevent duplicate payments (idempotency key)
- [ ] Implement idempotency key on transactions
- [ ] Sanitize all inputs
- [ ] Encrypt sensitive financial data
- [ ] Add rate limiting (Supabase Edge Functions)
- [ ] Log merchant ID updates (audit log)

---

## 📈 PHASE 9: ADMIN & MONITORING

- [ ] Create `src/pages/Admin.jsx`
- [ ] View all transactions
- [ ] View failed payments
- [ ] Revenue analytics
- [ ] Seller approval management
- [ ] Manual transaction verification tool

---

## 🔁 COMPLETE SYSTEM FLOW

Test the complete flow:
- [ ] User → Add to Cart
- [ ] User → Checkout
- [ ] System → Create Order
- [ ] System → Request MTN Payment
- [ ] User → Confirms on Phone
- [ ] MTN → Callback
- [ ] System → Mark Order Paid
- [ ] System → Send Email
- [ ] System → Clear Cart
- [ ] System → Update Seller Earnings

---

## 📝 NOTES

- All database migrations go in `supabase_migrations/`
- All Edge Functions go in `supabase/functions/`
- Store all secrets in Supabase Dashboard → Settings → Secrets
- Test in sandbox before production
- Follow MTN MoMo API documentation for exact request/response formats

---

**Status:** Ready to start implementation! 🚀
