-- Set manual instant book flag for a venue
-- Replace 'VENUE_ID_HERE' with the actual supplier ID

-- Enable instant book for a specific venue
UPDATE suppliers
SET data = jsonb_set(
  COALESCE(data, '{}'::jsonb),
  '{instantBook}',
  'true'::jsonb
)
WHERE id = 'VENUE_ID_HERE'
  AND service_type = 'venue';

-- Disable instant book for a specific venue
-- UPDATE suppliers
-- SET data = jsonb_set(
--   COALESCE(data, '{}'::jsonb),
--   '{instantBook}',
--   'false'::jsonb
-- )
-- WHERE id = 'VENUE_ID_HERE'
--   AND service_type = 'venue';

-- Check current instant book status for all venues
-- SELECT
--   id,
--   name,
--   data->>'instantBook' as instant_book_manual,
--   data->'googleCalendarSync'->>'enabled' as google_cal_enabled
-- FROM suppliers
-- WHERE service_type = 'venue'
-- ORDER BY name;
