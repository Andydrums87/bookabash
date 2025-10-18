-- Migration: Add invite_slug column to public_invites table
-- Purpose: Enable friendly URLs like /e-invites/emma-smith-2025-06-15 instead of /e-invites/invite_1760819100359_ej110l7qu

-- Add the invite_slug column
ALTER TABLE public_invites
ADD COLUMN IF NOT EXISTS invite_slug TEXT;

-- Create a unique index on invite_slug for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_invites_invite_slug
ON public_invites(invite_slug)
WHERE is_active = true;

-- Add a comment to document the column
COMMENT ON COLUMN public_invites.invite_slug IS
'User-friendly URL slug generated from child name and party date (e.g., emma-smith-2025-06-15)';

-- Update existing rows to have a slug (if any exist without one)
-- This is a one-time migration for existing data
UPDATE public_invites
SET invite_slug = id
WHERE invite_slug IS NULL;
