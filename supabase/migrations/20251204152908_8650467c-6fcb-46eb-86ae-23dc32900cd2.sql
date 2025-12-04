-- Add reminder_sent_at column to track 24-hour payment reminders
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;