-- DEPRECATED: This migration is no longer needed
-- Post-booking events are now tracked in the party_tracking table's action_timeline
-- The tracking functions look up the record by email and append to the same timeline
-- This keeps all customer events in a single unified record

-- If you've already run this migration, you can drop the table:
-- DROP TABLE IF EXISTS party_engagement;

-- Original migration (kept for reference):
-- CREATE TABLE IF NOT EXISTS party_engagement (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
--   action TEXT NOT NULL,
--   action_data JSONB DEFAULT '{}'::jsonb,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
