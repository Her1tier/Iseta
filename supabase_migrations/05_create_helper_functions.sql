-- Helper Database Functions for Edge Functions
-- These functions are called by the payment-callback Edge Function

-- ============================================================================
-- 1. DECREMENT PRODUCT STOCK
-- ============================================================================
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id;

  -- Check if stock is sufficient
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF current_stock < quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, quantity;
  END IF;

  -- Decrement stock
  UPDATE products
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION decrement_product_stock IS 'Decrements product stock by specified quantity. Used by payment callback.';

-- ============================================================================
-- 2. INCREMENT SELLER EARNINGS
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_seller_earnings(
  seller_user_id UUID,
  amount DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update seller profile earnings
  UPDATE seller_profiles
  SET 
    total_earnings = COALESCE(total_earnings, 0) + amount,
    pending_payout = COALESCE(pending_payout, 0) + amount,
    updated_at = NOW()
  WHERE user_id = seller_user_id;

  -- If no seller profile exists, create one (shouldn't happen, but safety check)
  IF NOT FOUND THEN
    INSERT INTO seller_profiles (user_id, total_earnings, pending_payout)
    VALUES (seller_user_id, amount, amount)
    ON CONFLICT (user_id) DO UPDATE
    SET 
      total_earnings = seller_profiles.total_earnings + amount,
      pending_payout = seller_profiles.pending_payout + amount,
      updated_at = NOW();
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION increment_seller_earnings IS 'Increments seller earnings and pending payout. Used by payment callback.';

-- ============================================================================
-- 3. GET ORDER TOTAL (Helper for calculating totals)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_order_total(order_id UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(price_at_time * quantity), 0) INTO total
  FROM order_items
  WHERE order_id = get_order_total.order_id;

  RETURN total;
END;
$$;

COMMENT ON FUNCTION get_order_total IS 'Calculates total amount for an order from order_items.';

-- ============================================================================
-- 4. VALIDATE CART STOCK (Helper for checkout validation)
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_cart_stock(user_id UUID)
RETURNS TABLE(
  cart_id UUID,
  product_id UUID,
  requested_quantity INTEGER,
  available_stock INTEGER,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS cart_id,
    c.product_id,
    c.quantity AS requested_quantity,
    COALESCE(p.stock_quantity, 0) AS available_stock,
    (c.quantity <= COALESCE(p.stock_quantity, 0)) AS is_valid
  FROM cart c
  JOIN products p ON p.id = c.product_id
  WHERE c.user_id = validate_cart_stock.user_id;
END;
$$;

COMMENT ON FUNCTION validate_cart_stock IS 'Validates that all cart items have sufficient stock. Returns validation results.';
