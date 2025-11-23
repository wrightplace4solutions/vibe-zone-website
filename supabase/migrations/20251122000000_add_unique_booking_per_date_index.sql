-- Create unique index to prevent duplicate bookings for same date
-- This ensures at the database level that only one pending or confirmed booking
-- can exist for any given event_date
CREATE UNIQUE INDEX idx_one_booking_per_date 
ON bookings (event_date) 
WHERE status IN ('pending', 'confirmed');
