-- Migration: Add courier fields for dispatch tracking
-- This adds courier_code and courier_name for tracking which courier service is being used

-- Add courier_code column (internal identifier like 'royal_mail', 'dpd')
ALTER TABLE "public"."enquiries"
ADD COLUMN IF NOT EXISTS "courier_code" varchar(50) DEFAULT NULL;

-- Add courier_name column (display name like 'Royal Mail', 'DPD')
ALTER TABLE "public"."enquiries"
ADD COLUMN IF NOT EXISTS "courier_name" varchar(100) DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN "public"."enquiries"."courier_code" IS 'Internal courier service identifier (e.g., royal_mail, dpd, evri)';
COMMENT ON COLUMN "public"."enquiries"."courier_name" IS 'Display name of courier service (e.g., Royal Mail, DPD, Evri)';
