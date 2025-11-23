-- Create unique index to prevent duplicate bookings for same date
-- This ensures at the database level that only one pending or confirmed booking
-- can exist for any given event_date

-- First, identify and handle any existing duplicate bookings
-- Keep the most recent booking and cancel older duplicates
WITH duplicates AS (
  SELECT 
    id,
    event_date,
    ROW_NUMBER() OVER (
      PARTITION BY event_date 
      ORDER BY created_at DESC
    ) as rn
  FROM bookings
  WHERE status IN ('pending', 'confirmed')
)
UPDATE bookings
SET status = 'cancelled',
    notes = CONCAT(COALESCE(notes, ''), chr(10), chr(10), 'Automatically cancelled due to duplicate booking on same date.')
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now create the unique index
CREATE UNIQUE INDEX idx_one_booking_per_date 
ON bookings (event_date) 
WHERE status IN ('pending', 'confirmed');
