-- Create reminders table for event notifications
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('72h_before', '24h_before', 'day_of')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_reminders_status_scheduled ON public.reminders(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_reminders_booking_id ON public.reminders(booking_id);

-- RLS policies for reminders (admin access only)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reminders"
  ON public.reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Service role can manage reminders"
  ON public.reminders FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to create reminders when booking is confirmed
CREATE OR REPLACE FUNCTION public.create_booking_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create reminders for confirmed bookings
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- 72 hours before
    INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for)
    VALUES (
      NEW.id,
      '72h_before',
      (NEW.event_date || ' ' || COALESCE(NEW.start_time, '00:00'))::TIMESTAMPTZ - INTERVAL '72 hours'
    );
    
    -- 24 hours before
    INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for)
    VALUES (
      NEW.id,
      '24h_before',
      (NEW.event_date || ' ' || COALESCE(NEW.start_time, '00:00'))::TIMESTAMPTZ - INTERVAL '24 hours'
    );
    
    -- Day of (6 hours before)
    INSERT INTO public.reminders (booking_id, reminder_type, scheduled_for)
    VALUES (
      NEW.id,
      'day_of',
      (NEW.event_date || ' ' || COALESCE(NEW.start_time, '00:00'))::TIMESTAMPTZ - INTERVAL '6 hours'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically create reminders
DROP TRIGGER IF EXISTS create_reminders_on_booking_confirmed ON public.bookings;
CREATE TRIGGER create_reminders_on_booking_confirmed
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_booking_reminders();