-- Page Views table for visitor tracking
-- Tracks all page views with visitor fingerprinting (no cookies needed)

CREATE TABLE IF NOT EXISTS public.page_views (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Visitor identification (fingerprint-based, no cookies)
    visitor_id text NOT NULL,
    -- Page information
    page_path text NOT NULL,
    page_title text,
    -- Referrer tracking
    referrer text,
    referrer_domain text,
    -- UTM parameters for campaign tracking
    utm_source text,
    utm_medium text,
    utm_campaign text,
    -- Device information
    device_type text, -- 'desktop', 'mobile', 'tablet'
    browser text,
    os text,
    screen_resolution text,
    -- Geographic (from headers, not precise)
    country text,
    -- Session tracking
    session_id text,
    is_new_visitor boolean DEFAULT true,
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    -- Link to party_tracking if visitor later starts planning
    party_tracking_session_id text
);

-- Indexes for common queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_visitor_id ON public.page_views(visitor_id);
CREATE INDEX idx_page_views_page_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_referrer_domain ON public.page_views(referrer_domain);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from anon (for tracking)
CREATE POLICY "Allow anonymous inserts" ON public.page_views
    FOR INSERT TO anon
    WITH CHECK (true);

-- Policy: Allow service role full access (for admin queries)
CREATE POLICY "Service role full access" ON public.page_views
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.page_views IS 'Tracks page views for site analytics. Privacy-friendly: uses fingerprinting instead of cookies.';
