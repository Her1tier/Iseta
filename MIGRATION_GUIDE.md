# Database Migration Guide

## ⚠️ IMPORTANT: Manual Step Required

The `variation_stock` column needs to be added to your products table in Supabase. This is a **one-time manual step** that must be done before the variation stock features will work.

## How to Run the Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/remxfxopqdgwqyyjssrn/sql/new
   - Or navigate to your project → SQL Editor → New Query

2. **Copy and paste this SQL:**

```sql
-- Add variation_stock column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS variation_stock JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.variation_stock IS 
'Stores stock and image mapping for variation combinations. Format: { "variant-key": { "stock": number, "image_index": number } }';
```

3. **Run the query** (Click "Run" button or press Cmd+Enter)

4. **Verify** - You should see a success message

### Option 2: Using the provided SQL file

The migration is also available in:
`supabase_migrations/add_variation_stock.sql`

Just copy the contents and paste into Supabase SQL Editor.

## What This Migration Does

- Adds a new `variation_stock` column to the `products` table
- Column type: JSONB (allows flexible JSON data storage)
- Default: NULL (backward compatible with existing products)
- Stores stock and image mappings for each variation combination

## Example Data Structure

After migration, products with variations can store stock like this:

```json
{
  "S-Red": { "stock": 10, "image_index": 0 },
  "M-Blue": { "stock": 5, "image_index": 1 },
  "L-Red": { "stock": 0, "image_index": 0 }
}
```

## Verification

After running migration, you can verify it worked:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'variation_stock';
```

You should see one row returned showing the column exists.

## Troubleshooting

**Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Use the project owner account or an account with ALTER TABLE permissions

**Error: "column already exists"**
- The migration has already been run! You're good to go.
- The `IF NOT EXISTS` clause prevents errors if run multiple times

## Next Steps

Once the migration is complete:
1. Create a new product with variations in the seller dashboard
2. Assign stock to each variation combination
3. View the product on the storefront
4. Test the dynamic stock display and image switching

---

**Questions?** The migration is safe to run and won't affect existing products. All existing products will continue to work normally.
