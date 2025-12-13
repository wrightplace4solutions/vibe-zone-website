-- Update booking_rate_limits table schema
-- This migration ensures proper RLS policies for edge function access

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.booking_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_rate_limits_email ON public.booking_rate_limits (email, created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.booking_rate_limits (ip_hash, created_at);

-- Enable RLS
ALTER TABLE public.booking_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (these are safe to run even if policies don't exist)
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.booking_rate_limits;
DROP POLICY IF EXISTS "service_role_manage_booking_rate_limits" ON public.booking_rate_limits;
DROP POLICY IF EXISTS "Allow service role full access to rate limits" ON public.booking_rate_limits;

-- Create a permissive policy that allows service role full access
-- Edge functions use the service role key, so this policy allows them to work
CREATE POLICY "Allow service role full access to rate limits"
  ON public.booking_rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);
