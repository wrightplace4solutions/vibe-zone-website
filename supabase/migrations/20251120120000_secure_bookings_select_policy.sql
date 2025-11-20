-- Harden SELECT access to bookings table to prevent public data exposure by
-- replacing the permissive SELECT policy with a scoped email match and trusted roles

DO $policy$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bookings'
      AND policyname = 'Anyone can view their own bookings by email'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can view their own bookings by email" ON public.bookings';
  END IF;

  EXECUTE $ddl$
    CREATE POLICY "Customers can read their bookings"
    ON public.bookings
    FOR SELECT
    USING (
      coalesce(json_extract_path_text(auth.jwt(), 'role'), '') IN ('service_role', 'supabase_admin')
      OR (
        coalesce(json_extract_path_text(auth.jwt(), 'role'), '') = 'authenticated'
        AND lower(customer_email) = lower(coalesce(json_extract_path_text(auth.jwt(), 'email'), ''))
      )
    )
  $ddl$;
END $policy$;
