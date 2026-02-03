-- Add dedicated columns to party_tracking for easier querying
-- These columns store party info that was previously buried in JSON

-- Party details columns
ALTER TABLE public.party_tracking
  ADD COLUMN IF NOT EXISTS party_theme text,
  ADD COLUMN IF NOT EXISTS party_date date,
  ADD COLUMN IF NOT EXISTS party_time text,
  ADD COLUMN IF NOT EXISTS party_location text,
  ADD COLUMN IF NOT EXISTS guest_count integer;

-- Supplier tracking columns (updated as user adds/removes suppliers)
ALTER TABLE public.party_tracking
  ADD COLUMN IF NOT EXISTS supplier_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_value numeric(10,2) DEFAULT 0;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_party_tracking_theme ON public.party_tracking(party_theme);
CREATE INDEX IF NOT EXISTS idx_party_tracking_estimated_value ON public.party_tracking(estimated_value);
CREATE INDEX IF NOT EXISTS idx_party_tracking_supplier_count ON public.party_tracking(supplier_count);

-- Add comments
COMMENT ON COLUMN public.party_tracking.party_theme IS 'Party theme (e.g., princess, superhero)';
COMMENT ON COLUMN public.party_tracking.party_date IS 'Planned party date';
COMMENT ON COLUMN public.party_tracking.party_time IS 'Planned party time';
COMMENT ON COLUMN public.party_tracking.party_location IS 'Party location/postcode';
COMMENT ON COLUMN public.party_tracking.guest_count IS 'Number of expected guests';
COMMENT ON COLUMN public.party_tracking.supplier_count IS 'Current number of suppliers in cart';
COMMENT ON COLUMN public.party_tracking.estimated_value IS 'Estimated total value of cart';
