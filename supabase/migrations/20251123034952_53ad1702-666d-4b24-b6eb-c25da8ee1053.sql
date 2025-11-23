-- Create demo_requests table for VibeQue demo access requests
CREATE TABLE public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_type text CHECK (user_type IN ('dj', 'instructor', 'event_planner')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert demo requests (lead capture)
CREATE POLICY "Anyone can submit demo requests"
ON public.demo_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins can view demo requests
CREATE POLICY "Only admins can view demo requests"
ON public.demo_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add index for efficient lookups
CREATE INDEX idx_demo_requests_created_at ON public.demo_requests(created_at DESC);
CREATE INDEX idx_demo_requests_email ON public.demo_requests(email);