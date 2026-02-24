-- SIMPLE FIX: Just manually null out the duplicate phone number
-- Since you know the duplicate is 0780000000, this is the quickest fix

-- Step 1: See which accounts have this phone
SELECT id, shop_name, email, full_name, phone_number
FROM profiles
WHERE phone_number = '0780000000';

-- Step 2: Decide which account to KEEP (note its ID)
-- Then run this for the accounts you want to remove the phone from:
-- Replace 'account-id-to-remove-phone-from' with the actual ID

-- UPDATE profiles 
-- SET phone_number = NULL 
-- WHERE id = 'account-id-to-remove-phone-from';

-- Example: If you have 2 accounts and want to keep the first one:
-- UPDATE profiles 
-- SET phone_number = NULL 
-- WHERE phone_number = '0780000000' 
-- AND id != 'id-of-account-to-keep';
