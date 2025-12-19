-- Add paid_at column to invoices table for tracking when invoices are marked as paid
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Comment for documentation
COMMENT ON COLUMN invoices.paid_at IS 'Timestamp when the invoice was marked as paid (payout completed)';
