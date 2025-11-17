-- Add personalization_data column to store child's favorite thing and photo
-- Structure: { favoriteThing: string, childPhoto: string }
ALTER TABLE party_gift_registries
ADD COLUMN IF NOT EXISTS personalization_data JSONB;

CREATE INDEX IF NOT EXISTS idx_party_gift_registries_personalization_data
ON party_gift_registries USING GIN (personalization_data);
