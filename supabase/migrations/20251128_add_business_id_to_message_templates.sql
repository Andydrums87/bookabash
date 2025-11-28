-- Add business_id column to supplier_message_templates for multi-business support
ALTER TABLE "public"."supplier_message_templates"
ADD COLUMN IF NOT EXISTS "business_id" uuid;

-- Add index for faster queries by business_id
CREATE INDEX IF NOT EXISTS "idx_supplier_message_templates_business_id"
ON "public"."supplier_message_templates" ("business_id");

-- Add composite index for supplier + business queries
CREATE INDEX IF NOT EXISTS "idx_supplier_message_templates_supplier_business"
ON "public"."supplier_message_templates" ("supplier_id", "business_id");
