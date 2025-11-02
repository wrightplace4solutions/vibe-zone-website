-- Get full details of your November 7th booking to manually add to Google Calendar
-- Run this in Supabase SQL Editor

SELECT 
    id,
    customer_name,
    customer_email,
    customer_phone,
    event_date,
    start_time,
    end_time,
    event_type,
    service_tier,
    package_type,
    venue_name,
    street_address,
    city,
    state,
    zip_code,
    notes,
    total_amount,
    deposit_amount,
    status,
    confirmed_at
FROM bookings
WHERE id = 'bf54cd31-5daf-46b7-ae0c-ac8651c591b0';
