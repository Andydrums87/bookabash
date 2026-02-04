-- Add claim token for venue handover flow
-- This allows pre-created venues to be claimed by their actual owners

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS claim_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS claim_token_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS pending_owner_email text;

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_suppliers_claim_token ON public.suppliers(claim_token) WHERE claim_token IS NOT NULL;

-- Comments
COMMENT ON COLUMN public.suppliers.claim_token IS 'Unique token for venue owners to claim their pre-created page';
COMMENT ON COLUMN public.suppliers.claim_token_expires_at IS 'When the claim token expires (optional)';
COMMENT ON COLUMN public.suppliers.pending_owner_email IS 'Email of the intended owner for reference';
