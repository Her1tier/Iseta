-- Migration: Add variation_stock column to products table
-- This allows products to have stock tracking per variation combination

-- Add variation_stock column (JSONB, nullable for backward compatibility)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS variation_stock JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.variation_stock IS 
'Stores stock and image mapping for variation combinations. Format: { "variant-key": { "stock": number, "image_index": number } }';

-- Example usage:
-- {
--   "S-Red": { "stock": 10, "image_index": 0 },
--   "M-Blue": { "stock": 5, "image_index": 1 }
-- }
