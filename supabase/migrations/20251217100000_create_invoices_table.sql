-- Create invoices table for supplier invoice management
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,

  -- Relationships
  party_id UUID REFERENCES parties(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,

  -- Invoice details
  invoice_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  service_date DATE,

  -- Amount breakdown
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'paid')),
  approved_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,

  -- Secure token access
  access_token UUID UNIQUE DEFAULT gen_random_uuid(),

  -- Booking snapshot (stores customer/party details at time of invoice)
  booking_details JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_invoices_supplier ON invoices(supplier_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_party ON invoices(party_id);
CREATE INDEX idx_invoices_enquiry ON invoices(enquiry_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date DESC);

-- Unique index on access token (excluding nulls)
CREATE UNIQUE INDEX idx_invoices_access_token ON invoices(access_token) WHERE access_token IS NOT NULL;

-- Function to generate sequential invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  current_year INTEGER;
  next_seq INTEGER;
  invoice_num VARCHAR(50);
BEGIN
  current_year := EXTRACT(YEAR FROM NOW());

  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || current_year || '-%';

  -- Format: INV-2025-00001
  invoice_num := 'INV-' || current_year || '-' || LPAD(next_seq::TEXT, 5, '0');

  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Suppliers can view their own invoices
CREATE POLICY "Suppliers can view own invoices"
  ON invoices FOR SELECT
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE auth_user_id = auth.uid()
    )
  );

-- Suppliers can update their own invoices (for approval/decline)
CREATE POLICY "Suppliers can update own invoices"
  ON invoices FOR UPDATE
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE auth_user_id = auth.uid()
    )
  );

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

-- Comment for documentation
COMMENT ON TABLE invoices IS 'Stores supplier invoices for booking payouts. Suppliers must approve invoices before receiving payment.';
COMMENT ON COLUMN invoices.gross_amount IS 'Full booking price paid by customer';
COMMENT ON COLUMN invoices.platform_fee IS 'Platform fee (15% of gross)';
COMMENT ON COLUMN invoices.net_amount IS 'Amount supplier receives (gross - platform_fee)';
COMMENT ON COLUMN invoices.booking_details IS 'Snapshot of booking details at invoice creation time';
