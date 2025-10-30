-- Update bookings table schema for 48-hour hold policy
-- Add missing columns and update status check constraint

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add venue_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'venue_name'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN venue_name TEXT;
  END IF;

  -- Add street_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN street_address TEXT;
  END IF;

  -- Add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN city TEXT;
  END IF;

  -- Add state column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'state'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN state TEXT;
  END IF;

  -- Add zip_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN zip_code TEXT;
  END IF;

  -- Add start_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN start_time TEXT;
  END IF;

  -- Add end_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN end_time TEXT;
  END IF;

  -- Add package_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'package_type'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN package_type TEXT;
  END IF;

  -- Add stripe_payment_intent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'stripe_payment_intent'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN stripe_payment_intent TEXT;
  END IF;

  -- Add stripe_session_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN stripe_session_id TEXT;
  END IF;

  -- Add confirmed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Drop old constraint and add new one with 'expired' and 'payment_failed' statuses
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'expired', 'payment_failed', 'cancelled'));

-- Update service_tier to match current packages (option1, option2)
-- Keep old values for backward compatibility
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_service_tier_check;

-- Make service_tier less restrictive to allow package names
ALTER TABLE public.bookings 
ALTER COLUMN service_tier DROP NOT NULL;

COMMENT ON TABLE public.bookings IS 'Booking requests for DJ services with 48-hour hold policy';
COMMENT ON COLUMN public.bookings.status IS 'pending: 48-hour hold active, confirmed: payment received, expired: hold expired without payment, payment_failed: payment attempt failed, cancelled: booking cancelled';
COMMENT ON COLUMN public.bookings.created_at IS 'Timestamp when hold was requested - used to calculate 48-hour expiration';
COMMENT ON COLUMN public.bookings.confirmed_at IS 'Timestamp when payment was received and booking confirmed';
