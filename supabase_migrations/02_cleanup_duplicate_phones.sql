-- SIMPLE CLEANUP: For phone 0780000000 duplicates
-- This approach uses ROW_NUMBER to keep just one account

-- Step 1: See which accounts have the duplicate phone
SELECT id, phone_number, shop_name, full_name
FROM profiles
WHERE phone_number = '0780000000';

-- Step 2: Clean up - Keep only ONE account with this phone (the first one by ID)
-- This query will keep the first account and NULL the rest
WITH ranked_accounts AS (
    SELECT 
        id,
        phone_number,
        ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY id) as rn
    FROM profiles
    WHERE phone_number = '0780000000'
)
UPDATE profiles
SET phone_number = NULL
FROM ranked_accounts
WHERE profiles.id = ranked_accounts.id
AND ranked_accounts.rn > 1;

-- Step 3: Verify (should show 0 or 1 rows):
SELECT id, phone_number, shop_name
FROM profiles
WHERE phone_number = '0780000000';

-- Step 4: Check for any other duplicates:
SELECT phone_number, COUNT(*) 
FROM profiles 
WHERE phone_number IS NOT NULL
GROUP BY phone_number 
HAVING COUNT(*) > 1;
