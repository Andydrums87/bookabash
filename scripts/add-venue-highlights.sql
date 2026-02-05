-- Add highlights to venues for "What We Love" / "Perfect For" feature
-- Run this script to add highlights to your venues

-- Example: Add highlights to Eden Room at Saint & Sinner
UPDATE suppliers
SET data = jsonb_set(
  data,
  '{highlights}',
  '[
    "Perfect for kids birthday parties",
    "Spacious private function room",
    "Full catering menu available",
    "Flexible booking hours",
    "Tables and seating included"
  ]'::jsonb
)
WHERE id = '6632e9df-eb58-44bc-b167-c9fbe0d4dc09';

-- Example: Add highlights to other venues (update the WHERE clause with your venue IDs)
-- Template for adding highlights to any venue:
/*
UPDATE suppliers
SET data = jsonb_set(
  data,
  '{highlights}',
  '[
    "Your first highlight here",
    "Second highlight",
    "Third highlight"
  ]'::jsonb
)
WHERE id = 'YOUR-VENUE-ID-HERE';
*/

-- Verify the update
SELECT
  business_name,
  id,
  data->'highlights' as highlights
FROM suppliers
WHERE data->'highlights' IS NOT NULL
  AND jsonb_array_length(data->'highlights') > 0;
