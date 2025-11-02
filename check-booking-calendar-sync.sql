-- Check if your November 7th booking has a google_calendar_event_id
-- Run this query in Supabase SQL Editor: 
-- https://supabase.com/dashboard/project/wabpexhnrziipvbghmhx/editor

-- See the most recent bookings and their calendar sync status
SELECT 
    id,
    customer_name,
    customer_email,
    event_date,
    event_type,
    status,
    google_calendar_event_id,
    confirmed_at,
    created_at
FROM bookings
WHERE event_date >= '2025-11-01'  -- November bookings
ORDER BY created_at DESC
LIMIT 10;

-- If google_calendar_event_id is NULL, the calendar sync failed
-- Check if there are any confirmed bookings without calendar events
SELECT 
    COUNT(*) as confirmed_without_calendar
FROM bookings
WHERE status = 'confirmed' 
AND google_calendar_event_id IS NULL;
