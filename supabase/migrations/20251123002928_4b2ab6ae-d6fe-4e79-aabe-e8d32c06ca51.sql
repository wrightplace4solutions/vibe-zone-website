-- Step 1: Update Bookings RLS Policy
DROP POLICY IF EXISTS "Anyone can view their own bookings by email" ON bookings;

CREATE POLICY "Authenticated users can view their own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (auth.jwt()->>'email' = customer_email);

-- Step 2: Drop Orphaned Chat Tables
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;