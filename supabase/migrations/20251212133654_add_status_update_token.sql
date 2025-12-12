-- Add status_update_token column for quick status updates without login
-- This allows cake suppliers to update order status via a secure link

ALTER TABLE enquiries
ADD COLUMN IF NOT EXISTS status_update_token UUID DEFAULT gen_random_uuid();

-- Create unique index for fast token lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_enquiries_status_update_token
ON enquiries(status_update_token)
WHERE status_update_token IS NOT NULL;

-- Backfill existing enquiries that don't have a token
UPDATE enquiries
SET status_update_token = gen_random_uuid()
WHERE status_update_token IS NULL;
