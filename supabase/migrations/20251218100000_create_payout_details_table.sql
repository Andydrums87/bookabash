-- Create payout_details table for storing supplier bank account information
CREATE TABLE payout_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

  -- Supplier info (denormalized for easy reference)
  supplier_name VARCHAR(200),

  -- Bank account information
  bank_name VARCHAR(100),
  account_holder_name VARCHAR(100) NOT NULL,
  sort_code VARCHAR(6) NOT NULL,
  account_number VARCHAR(8) NOT NULL,

  -- Status
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one payout detail per supplier
  UNIQUE(supplier_id)
);

-- Create indexes
CREATE INDEX idx_payout_details_supplier ON payout_details(supplier_id);

-- Enable RLS
ALTER TABLE payout_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Suppliers can view their own payout details
CREATE POLICY "Suppliers can view own payout details"
  ON payout_details
  FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE auth_user_id = auth.uid()
    )
  );

-- Suppliers can insert their own payout details
CREATE POLICY "Suppliers can insert own payout details"
  ON payout_details
  FOR INSERT
  WITH CHECK (
    supplier_id IN (
      SELECT id FROM suppliers WHERE auth_user_id = auth.uid()
    )
  );

-- Suppliers can update their own payout details
CREATE POLICY "Suppliers can update own payout details"
  ON payout_details
  FOR UPDATE
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE auth_user_id = auth.uid()
    )
  );

-- Service role can do everything (for admin/backend operations)
CREATE POLICY "Service role full access to payout details"
  ON payout_details
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_payout_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payout_details_updated_at
  BEFORE UPDATE ON payout_details
  FOR EACH ROW
  EXECUTE FUNCTION update_payout_details_updated_at();

-- Add comment for documentation
COMMENT ON TABLE payout_details IS 'Stores supplier bank account details for payouts. Sensitive data - RLS enabled.';
