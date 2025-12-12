-- Add columns to support pickup/collection order flow
-- ready_for_collection_at: When cake is ready for customer to pick up
-- collected_at: When customer picked up the cake

ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS ready_for_collection_at TIMESTAMPTZ;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ;

-- Add index for efficient querying of pickup orders
CREATE INDEX IF NOT EXISTS idx_enquiries_ready_for_collection_at ON enquiries(ready_for_collection_at) WHERE ready_for_collection_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enquiries_collected_at ON enquiries(collected_at) WHERE collected_at IS NOT NULL;
