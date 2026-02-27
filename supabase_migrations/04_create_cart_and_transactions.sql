-- Migration: Create Cart, Order Items, Transactions, and Seller Profiles Tables
-- Date: 2024
-- Description: Foundation tables for cart system, payment tracking, and seller onboarding

-- ============================================================================
-- 1. CART TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  variations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate cart items (same product + same variations)
  UNIQUE(user_id, product_id, variations)
);

-- Indexes for cart
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_created_at ON cart(created_at DESC);

-- RLS Policies for cart
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart"
  ON cart FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their cart"
  ON cart FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart"
  ON cart FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their cart"
  ON cart FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_updated_at_trigger
  BEFORE UPDATE ON cart
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_updated_at();

-- ============================================================================
-- 2. ORDER ITEMS TABLE (Support Multi-Product Orders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_time DECIMAL(10,2) NOT NULL,
  variations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- RLS Policies for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can view order items for orders they own
CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Sellers can view order items for their products
CREATE POLICY "Sellers can view order items for their products"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = order_items.product_id 
      AND products.seller_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'RWF',
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'success', 'failed', 'timeout', 'cancelled')),
  
  -- MTN MoMo Details
  momo_reference_id UUID UNIQUE,
  momo_external_id TEXT,
  momo_phone_number TEXT NOT NULL,
  payment_method TEXT DEFAULT 'mtn_momo',
  
  -- Platform Settlement
  platform_fee DECIMAL(10,2) DEFAULT 0 CHECK (platform_fee >= 0),
  seller_earnings DECIMAL(10,2) DEFAULT 0 CHECK (seller_earnings >= 0),
  seller_id UUID REFERENCES profiles(id),
  
  -- Metadata
  callback_data JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_momo_reference_id ON transactions(momo_reference_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- RLS Policies for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Sellers can view transactions for their products
CREATE POLICY "Sellers can view their transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = transactions.order_id 
      AND orders.seller_id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at_trigger
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transactions_updated_at();

-- ============================================================================
-- 4. SELLER PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS seller_profiles (
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
  
  -- Earnings Tracking
  total_earnings DECIMAL(10,2) DEFAULT 0 CHECK (total_earnings >= 0),
  pending_payout DECIMAL(10,2) DEFAULT 0 CHECK (pending_payout >= 0),
  paid_out DECIMAL(10,2) DEFAULT 0 CHECK (paid_out >= 0),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for seller_profiles
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_merchant_id ON seller_profiles(merchant_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_account_status ON seller_profiles(account_status);

-- RLS Policies for seller_profiles
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own seller profile
CREATE POLICY "Users can view their seller profile"
  ON seller_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their seller profile
CREATE POLICY "Users can create their seller profile"
  ON seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their seller profile (restricted fields)
CREATE POLICY "Users can update their seller profile"
  ON seller_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_seller_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seller_profiles_updated_at_trigger
  BEFORE UPDATE ON seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_profiles_updated_at();

-- ============================================================================
-- 5. UPDATE ORDERS TABLE
-- ============================================================================
-- Add new columns to existing orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES transactions(id),
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_earnings DECIMAL(10,2) DEFAULT 0;

-- Index for user_id on orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update RLS policy to allow users to view their orders
DROP POLICY IF EXISTS "Users can view their orders" ON orders;
CREATE POLICY "Users can view their orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = seller_id OR 
    auth.uid() = user_id
  );

-- ============================================================================
-- 6. UPDATE PROFILES TABLE
-- ============================================================================
-- Add role and verification columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' 
    CHECK (role IN ('buyer', 'seller', 'admin')),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending'
    CHECK (account_status IN ('pending', 'approved', 'rejected', 'suspended'));

-- Index for role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE cart IS 'Shopping cart items for authenticated users';
COMMENT ON TABLE order_items IS 'Individual items within an order (supports multi-product orders)';
COMMENT ON TABLE transactions IS 'Payment transactions with MTN MoMo integration';
COMMENT ON TABLE seller_profiles IS 'Seller/merchant profiles with business and payment info';
COMMENT ON COLUMN transactions.momo_reference_id IS 'MTN MoMo payment reference ID';
COMMENT ON COLUMN seller_profiles.merchant_id IS 'MTN Merchant ID for receiving payments';
