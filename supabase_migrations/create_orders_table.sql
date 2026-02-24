-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Customer info (manually entered by seller)
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Order details
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL,
  variations JSONB DEFAULT '{}',
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Sellers can only see their own orders
CREATE POLICY "Sellers can view their orders"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id);

-- Sellers can create orders for their products
CREATE POLICY "Sellers can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own orders
CREATE POLICY "Sellers can update their orders"
  ON orders FOR UPDATE
  USING (auth.uid() = seller_id);

-- Sellers can delete their own orders
CREATE POLICY "Sellers can delete their orders"
  ON orders FOR DELETE
  USING (auth.uid() = seller_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at_trigger
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();
