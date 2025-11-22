-- Drop the old insecure policy
DROP POLICY IF EXISTS "Anyone can view their own bookings by email" ON bookings;

-- Create new secure policy that requires authentication
CREATE POLICY "Authenticated users can view their own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (auth.jwt()->>'email' = customer_email);

-- Optional: Keep the existing INSERT policy or update it
-- The current "Anyone can create bookings" policy is fine for the initial booking flow
-- since customers aren't authenticated yet when they first book
