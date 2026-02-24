-- STEP 3: Add unique constraint (run AFTER cleaning duplicates)
-- This will prevent future duplicates

ALTER TABLE profiles 
ADD CONSTRAINT unique_phone_number UNIQUE (phone_number);

-- Add comment for documentation
COMMENT ON CONSTRAINT unique_phone_number ON profiles IS 
'Ensures each phone number can only be used by one account';

-- Verify the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND constraint_name = 'unique_phone_number';
