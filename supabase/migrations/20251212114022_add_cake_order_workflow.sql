-- Migration: Add cake order workflow fields to enquiries table
-- This adds order_status for tracking cake order progression and tracking_url for delivery tracking

-- Add order_status column for cake order workflow
-- Statuses: confirmed (payment received), preparing (baker preparing), dispatched (sent for delivery), delivered (completed)
ALTER TABLE "public"."enquiries"
ADD COLUMN IF NOT EXISTS "order_status" varchar(50) DEFAULT NULL;

-- Add tracking_url column for delivery tracking link
ALTER TABLE "public"."enquiries"
ADD COLUMN IF NOT EXISTS "tracking_url" text DEFAULT NULL;

-- Add dispatched_at timestamp for when order was dispatched
ALTER TABLE "public"."enquiries"
ADD COLUMN IF NOT EXISTS "dispatched_at" timestamp with time zone DEFAULT NULL;

-- Add delivered_at timestamp for when order was delivered
ALTER TABLE "public"."enquiries"
ADD COLUMN IF NOT EXISTS "delivered_at" timestamp with time zone DEFAULT NULL;

-- Add comment explaining the order_status field
COMMENT ON COLUMN "public"."enquiries"."order_status" IS 'Order fulfillment status for cake/product orders: confirmed (payment received), preparing (in progress), dispatched (sent), delivered (complete)';

-- Add comment explaining the tracking_url field
COMMENT ON COLUMN "public"."enquiries"."tracking_url" IS 'External tracking URL from courier service for delivery tracking';

-- Create index for order_status queries (filtering by order status)
CREATE INDEX IF NOT EXISTS "idx_enquiries_order_status" ON "public"."enquiries" USING "btree" ("order_status");
