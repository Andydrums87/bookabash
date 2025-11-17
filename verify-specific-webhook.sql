-- Verify specific webhook processed correctly
-- For payment intent: pi_3SUOj9D7q7N6HQJN0NFfsWTZ
-- Party ID: 055a7e60-fc6a-4a7c-8eed-aeffb8956f5e

-- 1. Check party was updated by webhook
SELECT
  id,
  child_name,
  theme,
  status,
  payment_status,
  payment_intent_id,
  deposit_amount,
  remaining_balance,
  payment_date,
  updated_at
FROM parties
WHERE id = '055a7e60-fc6a-4a7c-8eed-aeffb8956f5e';

-- Expected results:
-- status: 'planned' (was 'draft')
-- payment_status: 'partial_paid' or 'fully_paid'
-- payment_intent_id: 'pi_3SUOj9D7q7N6HQJN0NFfsWTZ'
-- deposit_amount: 50.00
-- remaining_balance: 100.00

-- 2. Check enquiries were created/updated
SELECT
  id,
  supplier_category,
  status,
  payment_status,
  quoted_price,
  created_at,
  updated_at
FROM enquiries
WHERE party_id = '055a7e60-fc6a-4a7c-8eed-aeffb8956f5e'
ORDER BY created_at DESC;

-- Expected results:
-- status: 'accepted'
-- payment_status: 'deposit_paid' or 'fully_paid'
-- supplier_category: 'facePainting'

-- 3. Check if there are multiple parties with this payment intent (should be only 1)
SELECT COUNT(*) as party_count
FROM parties
WHERE payment_intent_id = 'pi_3SUOj9D7q7N6HQJN0NFfsWTZ';

-- Expected: 1 row

-- 4. Check for any payment errors
SELECT
  id,
  payment_status,
  payment_error
FROM parties
WHERE payment_intent_id = 'pi_3SUOj9D7q7N6HQJN0NFfsWTZ'
  AND payment_error IS NOT NULL;

-- Expected: 0 rows (no errors)
