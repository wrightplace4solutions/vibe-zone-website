-- Create booking_rate_limits table for rate limiting
CREATE TABLE IF NOT EXISTS public.booking_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_booking_rate_limits_identifier_window 
  ON public.booking_rate_limits (identifier, window_start);

-- Enable RLS
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.booking_rate_limits;

-- Create policy that only allows service role access
CREATE POLICY "Service role can manage rate limits"
  ON public.booking_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);