# Fixing Duplicate Phone Numbers

## Problem

You're seeing this error:
```
ERROR: could not create unique index "unique_phone_number" 
DETAIL: Key (phone_number)=(0780000000) is duplicated.
```

This means multiple accounts have the same phone number. We need to clean up duplicates before adding the unique constraint.

## Solution - 3 Steps

### Step 1: Find Duplicates

Run this in Supabase SQL Editor to see what's duplicated:

```sql
SELECT 
    phone_number, 
    COUNT(*) as count,
    STRING_AGG(id::text, ', ') as user_ids
FROM profiles 
WHERE phone_number IS NOT NULL
GROUP BY phone_number 
HAVING COUNT(*) > 1
ORDER BY count DESC;
```

This shows which phone numbers appear multiple times and which user accounts have them.

---

### Step 2: Clean Up Duplicates

You have two options:

#### **Option A: Set Duplicates to NULL (Recommended)**

This keeps all accounts but removes the phone number from duplicate accounts (keeping only the oldest account's phone number):

```sql
UPDATE profiles
SET phone_number = NULL
WHERE id IN (
    SELECT p.id
    FROM profiles p
    INNER JOIN (
        SELECT phone_number, MIN(created_at) as first_created
        FROM profiles
        WHERE phone_number IS NOT NULL
        GROUP BY phone_number
        HAVING COUNT(*) > 1
    ) dups ON p.phone_number = dups.phone_number
    WHERE p.created_at > dups.first_created
);
```

**What this does:**
- Finds all phone numbers that appear more than once
- Keeps the phone number on the OLDEST account (earliest `created_at`)
- Sets phone number to NULL on all newer duplicate accounts
- Preserves all user accounts

#### **Option B: Delete Duplicate Accounts (Use with Caution)**

Only use this if you want to completely remove duplicate accounts:

```sql
DELETE FROM profiles
WHERE id IN (
    SELECT p.id
    FROM profiles p
    INNER JOIN (
        SELECT phone_number, MIN(created_at) as first_created
        FROM profiles
        WHERE phone_number IS NOT NULL
        GROUP BY phone_number
        HAVING COUNT(*) > 1
    ) dups ON p.phone_number = dups.phone_number
    WHERE p.created_at > dups.first_created
);
```

---

### Step 3: Add Unique Constraint

After cleaning duplicates, run this:

```sql
ALTER TABLE profiles 
ADD CONSTRAINT unique_phone_number UNIQUE (phone_number);
```

Verify it worked:

```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND constraint_name = 'unique_phone_number';
```

You should see one row returned.

---

## Quick Reference

**Files created for you:**
1. `01_find_duplicate_phones.sql` - Find duplicates
2. `02_cleanup_duplicate_phones.sql` - Clean up duplicates
3. `add_unique_phone_constraint.sql` - Add constraint (updated)

**Run them in order:**
1. Run step 1 to see what's duplicated
2. Run step 2 (Option A recommended) to clean up
3. Run step 3 to add the constraint

---

## After Migration

Once complete:
- New signups will validate phone uniqueness in real-time
- Submit button disabled if phone is already registered
- Visual feedback (green/red borders) like shop name validation

## Troubleshooting

**Still getting duplicates error?**
- Run step 1 again to check if duplicates still exist
- Make sure you ran step 2 successfully
- Check the query results to confirm

**Accidentally deleted too much?**
- If you have a database backup, you can restore
- Contact users to re-register if needed

**Need to remove the constraint?**
```sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_phone_number;
```

---

## Summary

1. ✅ Find duplicates (step 1)
2. ✅ Clean them up (step 2)  
3. ✅ Add unique constraint (step 3)
4. ✅ Test signup with duplicate phone

The frontend validation is already live and working!
