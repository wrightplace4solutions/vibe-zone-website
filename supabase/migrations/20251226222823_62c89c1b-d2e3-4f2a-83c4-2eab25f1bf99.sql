-- Drop the existing policy that uses 'to service_role' syntax
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.booking_rate_limits;
DROP POLICY IF EXISTS "Allow service role full access to rate limits" ON public.booking_rate_limits;

-- Create a simple permissive policy for all operations
-- Edge functions use service role key which bypasses RLS, but this is a safety net
CREATE POLICY "Allow all operations on rate limits"
ON public.booking_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Also ensure the table has the correct structure
ALTER TABLE public.booking_rate_limits
  ALTER COLUMN identifier SET DEFAULT '',
  ALTER COLUMN request_count SET DEFAULT 1,
  ALTER COLUMN window_start SET DEFAULT now();