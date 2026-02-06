-- Set virtual tour / video tour for a venue
-- Replace 'VENUE_ID_HERE' with the actual supplier ID

-- Add 360° virtual tour (Momento360, Matterport, etc.)
-- Note: Use the embed URL, not the share URL
-- Momento360: https://momento360.com/e/uc/YOUR_ID?size=large
-- Matterport: https://my.matterport.com/show/?m=YOUR_ID

UPDATE suppliers
SET data = jsonb_set(
  COALESCE(data, '{}'::jsonb),
  '{serviceDetails,virtualTour}',
  '"https://momento360.com/e/uc/b15e52e555a148d697460fa8e4d4a140?size=large"'::jsonb
)
WHERE id = 'VENUE_ID_HERE'
  AND service_type = 'venue';

-- Add video tour (YouTube embed URL)
-- Note: Use embed URL format: https://www.youtube.com/embed/VIDEO_ID
-- UPDATE suppliers
-- SET data = jsonb_set(
--   COALESCE(data, '{}'::jsonb),
--   '{serviceDetails,videoTour}',
--   '"https://www.youtube.com/embed/YOUR_VIDEO_ID"'::jsonb
-- )
-- WHERE id = 'VENUE_ID_HERE'
--   AND service_type = 'venue';

-- Add both virtual tour and video tour at once
-- UPDATE suppliers
-- SET data = data
--   || jsonb_build_object('serviceDetails',
--        COALESCE(data->'serviceDetails', '{}'::jsonb)
--        || '{"virtualTour": "https://momento360.com/e/uc/YOUR_ID?size=large", "videoTour": "https://www.youtube.com/embed/YOUR_VIDEO_ID"}'::jsonb
--      )
-- WHERE id = 'VENUE_ID_HERE'
--   AND service_type = 'venue';

-- Remove virtual tour from a venue
-- UPDATE suppliers
-- SET data = data #- '{serviceDetails,virtualTour}'
-- WHERE id = 'VENUE_ID_HERE'
--   AND service_type = 'venue';

-- Check current virtual tour settings for all venues
-- SELECT
--   id,
--   name,
--   data->'serviceDetails'->>'virtualTour' as virtual_tour,
--   data->'serviceDetails'->>'videoTour' as video_tour
-- FROM suppliers
-- WHERE service_type = 'venue'
--   AND (data->'serviceDetails'->>'virtualTour' IS NOT NULL
--        OR data->'serviceDetails'->>'videoTour' IS NOT NULL)
-- ORDER BY name;
