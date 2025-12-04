-- Drop the restrictive INSERT policy and recreate as permissive
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create the INSERT policy as PERMISSIVE (default)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Also need to allow service role to manage bookings for edge functions
DROP POLICY IF EXISTS "Service role can manage bookings" ON public.bookings;

CREATE POLICY "Service role can manage bookings"
ON public.bookings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);