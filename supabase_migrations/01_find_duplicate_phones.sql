-- STEP 1: Find all duplicate phone numbers
-- Run this first to see what duplicates exist

SELECT 
    phone_number, 
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids
FROM profiles 
WHERE phone_number IS NOT NULL
GROUP BY phone_number 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- This will show you:
-- - Which phone numbers are duplicated
-- - How many times each appears
-- - The user IDs that have each phone number
