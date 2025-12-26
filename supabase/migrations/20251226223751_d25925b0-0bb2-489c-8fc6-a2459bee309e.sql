-- Create table to store email verification codes
CREATE TABLE public.email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified_at timestamp with time zone,
  used_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Allow all operations (edge functions use service role)
CREATE POLICY "Allow all operations on email verifications"
ON public.email_verifications
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_email_verifications_email_code ON public.email_verifications(email, code);
CREATE INDEX idx_email_verifications_expires ON public.email_verifications(expires_at);

-- Function to clean up expired codes (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_verifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_verifications
  WHERE expires_at < now() - interval '1 hour';
END;
$$;