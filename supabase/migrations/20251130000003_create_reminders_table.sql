-- Create reminders table for scheduled notifications
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('72h_before', '24h_before', 'day_of', 'thank_you')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reminders_booking_id ON public.reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON public.reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON public.reminders(scheduled_for) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reminders
CREATE POLICY "Users can view own reminders"
  ON public.reminders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all reminders
CREATE POLICY "Service role full access to reminders"
  ON public.reminders
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to automatically create reminders when a booking is confirmed
CREATE OR REPLACE FUNCTION create_booking_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create reminders for confirmed/paid bookings
  IF NEW.status IN ('confirmed', 'paid') AND NEW.event_date IS NOT NULL THEN
    -- 72 hour reminder
    INSERT INTO public.reminders (booking_id, user_id, reminder_type, scheduled_for)
    VALUES (
      NEW.id,
      NEW.user_id,
      '72h_before',
      (NEW.event_date || ' ' || COALESCE(NEW.event_time, '18:00:00'))::TIMESTAMPTZ - INTERVAL '72 hours'
    )
    ON CONFLICT DO NOTHING;

    -- 24 hour reminder
    INSERT INTO public.reminders (booking_id, user_id, reminder_type, scheduled_for)
    VALUES (
      NEW.id,
      NEW.user_id,
      '24h_before',
      (NEW.event_date || ' ' || COALESCE(NEW.event_time, '18:00:00'))::TIMESTAMPTZ - INTERVAL '24 hours'
    )
    ON CONFLICT DO NOTHING;

    -- Day-of reminder (morning of event)
    INSERT INTO public.reminders (booking_id, user_id, reminder_type, scheduled_for)
    VALUES (
      NEW.id,
      NEW.user_id,
      'day_of',
      (NEW.event_date || ' 09:00:00')::TIMESTAMPTZ
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on bookings table
CREATE TRIGGER booking_confirmed_create_reminders
  AFTER INSERT OR UPDATE OF status, event_date, event_time
  ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status IN ('confirmed', 'paid'))
  EXECUTE FUNCTION create_booking_reminders();
