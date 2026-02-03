-- Add fields to track consolidated booking confirmation email
-- This prevents sending the email multiple times when all suppliers accept

ALTER TABLE "public"."parties"
ADD COLUMN IF NOT EXISTS "booking_confirmed_email_sent" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "booking_confirmed_email_sent_at" timestamp with time zone;

-- Add an index for quick lookups
CREATE INDEX IF NOT EXISTS "idx_parties_booking_confirmed_email"
ON "public"."parties" ("booking_confirmed_email_sent")
WHERE "booking_confirmed_email_sent" = false;

COMMENT ON COLUMN "public"."parties"."booking_confirmed_email_sent" IS 'Whether the consolidated booking confirmation email has been sent to the customer after all suppliers accepted';
COMMENT ON COLUMN "public"."parties"."booking_confirmed_email_sent_at" IS 'Timestamp when the consolidated booking confirmation email was sent';
