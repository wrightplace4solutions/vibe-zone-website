-- Create inquiries table for contact form submissions
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date DATE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'declined')),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert inquiries (public contact form)
CREATE POLICY "Anyone can submit inquiries"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own inquiries
CREATE POLICY "Users can view own inquiries"
  ON public.inquiries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can view and update all inquiries
CREATE POLICY "Service role full access to inquiries"
  ON public.inquiries
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiries_updated_at();
