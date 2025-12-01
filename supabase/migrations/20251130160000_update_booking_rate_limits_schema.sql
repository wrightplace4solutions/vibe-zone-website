-- Update booking_rate_limits table schema
-- Drop existing table and recreate with improved schema

DROP TABLE IF EXISTS public.booking_rate_limits CASCADE;

CREATE TABLE public.booking_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rate_limits_email ON booking_rate_limits(email, created_at);
CREATE INDEX idx_rate_limits_ip ON booking_rate_limits(ip_hash, created_at);

ALTER TABLE booking_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage (edge functions use service role key)
CREATE POLICY "Service role can manage rate limits"
  ON booking_rate_limits FOR ALL
  USING (true) WITH CHECK (true);
