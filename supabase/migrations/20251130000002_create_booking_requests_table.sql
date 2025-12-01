-- Create booking_requests table for special requests tied to bookings
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('song_request', 'special_equipment', 'timing_change', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'completed')),
  admin_notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_requests_booking_id ON public.booking_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_user_id ON public.booking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create requests for their own bookings
CREATE POLICY "Users can create requests for own bookings"
  ON public.booking_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_requests.booking_id
      AND bookings.user_id = auth.uid()
      AND bookings.event_date > (CURRENT_DATE + INTERVAL '14 days')
    )
  );

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests"
  ON public.booking_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all requests
CREATE POLICY "Service role full access to requests"
  ON public.booking_requests
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_booking_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_requests_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_requests_updated_at();
