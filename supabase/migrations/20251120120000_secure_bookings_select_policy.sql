-- Harden SELECT access to bookings table to prevent public data exposure by
-- replacing the permissive SELECT policy with a scoped email match and trusted roles

DROP POLICY IF EXISTS "Anyone can view their own bookings by email" ON public.bookings;

CREATE POLICY "Customers can read their bookings"
ON public.bookings
FOR SELECT
USING (
  coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') IN ('service_role', 'supabase_admin')
  OR (
    coalesce(jsonb_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
    AND lower(customer_email) = lower(coalesce(jsonb_extract_path_text(auth.jwt(), 'email'), ''))
  )
);
