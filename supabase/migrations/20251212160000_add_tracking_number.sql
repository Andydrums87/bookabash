-- Add tracking_number column to enquiries table
-- Stores the courier tracking number separately from the tracking URL

ALTER TABLE enquiries
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN enquiries.tracking_number IS 'Courier tracking number (e.g., IV804142085GB)';
