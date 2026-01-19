-- Add VAT number, company registration number, and business address to payout_details
-- These fields are optional and used for invoice generation

ALTER TABLE payout_details
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS company_reg_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_address_line1 VARCHAR(200),
ADD COLUMN IF NOT EXISTS business_address_line2 VARCHAR(200),
ADD COLUMN IF NOT EXISTS business_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_postcode VARCHAR(20);

-- Add comments for documentation
COMMENT ON COLUMN payout_details.vat_number IS 'VAT registration number (optional, for VAT-registered businesses)';
COMMENT ON COLUMN payout_details.company_reg_number IS 'Companies House registration number (optional, for limited companies)';
COMMENT ON COLUMN payout_details.business_address_line1 IS 'Business address line 1 for invoice display';
COMMENT ON COLUMN payout_details.business_address_line2 IS 'Business address line 2 (optional)';
COMMENT ON COLUMN payout_details.business_city IS 'Business city for invoice display';
COMMENT ON COLUMN payout_details.business_postcode IS 'Business postcode for invoice display';
