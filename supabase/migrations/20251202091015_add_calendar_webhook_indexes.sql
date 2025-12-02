-- Add indexes for calendar webhook lookups
-- These indexes improve performance when looking up suppliers by webhook channel/subscription IDs

-- GIN index for Google Calendar sync data (supports containment queries)
CREATE INDEX IF NOT EXISTS idx_suppliers_google_calendar_sync
ON suppliers USING GIN ((data->'googleCalendarSync'));

-- GIN index for Outlook Calendar sync data (supports containment queries)
CREATE INDEX IF NOT EXISTS idx_suppliers_outlook_calendar_sync
ON suppliers USING GIN ((data->'outlookCalendarSync'));

-- B-tree indexes for exact webhook ID lookups (faster for equality queries)
CREATE INDEX IF NOT EXISTS idx_suppliers_google_webhook_channel_id
ON suppliers ((data->'googleCalendarSync'->>'webhookChannelId'))
WHERE data->'googleCalendarSync'->>'webhookChannelId' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_suppliers_outlook_subscription_id
ON suppliers ((data->'outlookCalendarSync'->>'subscriptionId'))
WHERE data->'outlookCalendarSync'->>'subscriptionId' IS NOT NULL;
