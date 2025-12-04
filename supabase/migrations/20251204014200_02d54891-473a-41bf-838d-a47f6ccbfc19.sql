-- Add missing columns to booking_rate_limits table
ALTER TABLE public.booking_rate_limits 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS ip_hash text;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_booking_rate_limits_email ON public.booking_rate_limits (email);
CREATE INDEX IF NOT EXISTS idx_booking_rate_limits_ip_hash ON public.booking_rate_limits (ip_hash);