-- Add archived column to enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_enquiries_archived ON enquiries(archived) WHERE archived = true;
