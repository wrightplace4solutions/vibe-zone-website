-- Harden SELECT access to bookings table to prevent public data exposure

-- Helper function to read the caller's email claim from the JWT
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

-- Replace the insecure policy that allowed anyone to read all bookings
DROP POLICY IF EXISTS "Anyone can view their own bookings by email" ON public.bookings;

-- Only authenticated users whose email matches the booking, or privileged roles, may read rows
CREATE POLICY "Customers can read their bookings"
ON public.bookings
FOR SELECT
USING (
  auth.role() IN ('service_role', 'supabase_admin')
  OR (
    auth.role() = 'authenticated'
    AND lower(customer_email) = public.current_user_email()
  )
);
