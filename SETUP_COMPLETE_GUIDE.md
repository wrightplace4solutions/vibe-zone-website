# Complete Setup Guide for Vibe Zone Entertainment Website

## ✅ What You've Already Done
- Created Supabase project: **Vibe Zone Entertainment** (ID: `ffikkqixlmexusrcxaov`)
- Configured `.env` file with correct credentials

## 🚀 Step-by-Step Setup (Manual - No CLI Required!)

### Step 1: Apply Database Migrations

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov
   - Click on **SQL Editor** in the left sidebar

2. **Run First Migration** (Create bookings table)
   - Click **"+ New query"**
   - Copy and paste this SQL:

```sql
-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  service_tier TEXT NOT NULL CHECK (service_tier IN ('basic', 'premium', 'platinum')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'call_requested', 'deposit_received', 'confirmed', 'cancelled')),
  deposit_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings (public can create, only admins can view all)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own bookings by email" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

   - Click **"Run"** (or press Ctrl+Enter)
   - You should see: ✅ "Success. No rows returned"

3. **Run Second Migration** (Update schema for 48-hour holds)
   - Click **"+ New query"** again
   - Copy and paste this SQL:

```sql
-- Update bookings table schema for 48-hour hold policy
-- Add missing columns and update status check constraint

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add venue_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'venue_name'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN venue_name TEXT;
  END IF;

  -- Add street_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN street_address TEXT;
  END IF;

  -- Add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'city'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN city TEXT;
  END IF;

  -- Add state column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'state'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN state TEXT;
  END IF;

  -- Add zip_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN zip_code TEXT;
  END IF;

  -- Add start_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN start_time TEXT;
  END IF;

  -- Add end_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN end_time TEXT;
  END IF;

  -- Add package_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'package_type'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN package_type TEXT;
  END IF;

  -- Add stripe_payment_intent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'stripe_payment_intent'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN stripe_payment_intent TEXT;
  END IF;

  -- Add stripe_session_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN stripe_session_id TEXT;
  END IF;

  -- Add confirmed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'confirmed_at'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Drop old constraint and add new one with 'expired' and 'payment_failed' statuses
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'expired', 'payment_failed', 'cancelled'));

-- Update service_tier to match current packages (option1, option2)
-- Keep old values for backward compatibility
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_service_tier_check;

-- Make service_tier less restrictive to allow package names
ALTER TABLE public.bookings 
ALTER COLUMN service_tier DROP NOT NULL;

COMMENT ON TABLE public.bookings IS 'Booking requests for DJ services with 48-hour hold policy';
COMMENT ON COLUMN public.bookings.status IS 'pending: 48-hour hold active, confirmed: payment received, expired: hold expired without payment, payment_failed: payment attempt failed, cancelled: booking cancelled';
COMMENT ON COLUMN public.bookings.created_at IS 'Timestamp when hold was requested - used to calculate 48-hour expiration';
COMMENT ON COLUMN public.bookings.confirmed_at IS 'Timestamp when payment was received and booking confirmed';
```

   - Click **"Run"**
   - You should see: ✅ "Success. No rows returned"

4. **Verify Table Creation**
   - Click **"Table Editor"** in left sidebar
   - You should see a `bookings` table with all columns

---

### Step 2: Deploy Edge Functions

Since you don't have Supabase CLI, we'll deploy functions manually:

1. **Go to Edge Functions**
   - In your Supabase Dashboard: https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov/functions
   - Click **"Deploy a new function"**

2. **Deploy `stripe-webhook` Function**
   - Function name: `stripe-webhook`
   - Click **"Create function"**
   - In the code editor, paste the contents from `supabase/functions/stripe-webhook/index.ts`
   - Click **"Deploy"**

3. **Deploy `check-expired-holds` Function**
   - Click **"Deploy a new function"** again
   - Function name: `check-expired-holds`
   - Click **"Create function"**
   - In the code editor, paste the contents from `supabase/functions/check-expired-holds/index.ts`
   - Click **"Deploy"**

4. **Deploy `get-booking-status` Function**
  - Click **"Deploy a new function"** again
  - Function name: `get-booking-status`
  - Click **"Create function"**
  - In the code editor, paste the contents from `supabase/functions/get-booking-status/index.ts`
  - Click **"Deploy"**

---

### Step 3: Set Up Secrets (Environment Variables)

1. **Go to Edge Functions Settings**
   - Dashboard → Edge Functions → **"Manage secrets"**

2. **Add these secrets one by one:**

   Click **"Add new secret"** for each:

   **Stripe Secrets:**
   - Name: `STRIPE_SECRET_KEY`
     Value: Get from Stripe Dashboard → Developers → API keys → Secret key (starts with `sk_test_`)

   - Name: `STRIPE_WEBHOOK_SECRET`
     Value: (Get this from Step 4 after creating webhook - starts with `whsec_`)

   **Google Calendar Secrets:**
   - Name: `GOOGLE_CALENDAR_CLIENT_ID`
     Value: `1025490265919-0vn7hg2259ndgsdan674ossq83aco9js.apps.googleusercontent.com`

   - Name: `GOOGLE_CALENDAR_CLIENT_SECRET`
     Value: `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`

   - Name: `GOOGLE_CALENDAR_REFRESH_TOKEN`
     Value: `L9IrWjBt9Rc2OM8HaZ7oyIV0divBxMp4YbYa1DUBqTYoCVSb8SXGWinUhVtKniqkuiLUcOk`

---

### Step 4: Configure Stripe Webhook

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/test/webhooks
   - Click **"Add endpoint"**

2. **Configure Endpoint**
   - Endpoint URL: `https://ffikkqixlmexusrcxaov.supabase.co/functions/v1/stripe-webhook`
   - Description: "Vibe Zone Booking Confirmations"
   - Click **"Select events"**

3. **Select These Events:**
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
   - Click **"Add events"**

4. **Save and Get Signing Secret**
   - Click **"Add endpoint"**
   - Click on your new webhook
   - Click **"Reveal"** under "Signing secret"
   - Copy the secret (starts with `whsec_...`)
   - Go back to Supabase → Edge Functions → Manage secrets
   - Add `STRIPE_WEBHOOK_SECRET` with the value you copied

---

### Step 5: Set Up Cron Job for Expired Holds

1. **Go to Database → Cron Jobs**
   - In Supabase Dashboard, go to Database section
   - Look for **"Cron"** or **"Database Webhooks"**

2. **Create Cron Job**
   - Schedule: Every hour (`0 * * * *`)
   - Function: Call `check-expired-holds` edge function
   - Or manually set up using SQL:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to check for expired holds every hour
SELECT cron.schedule(
  'check-expired-holds',
  '0 * * * *', -- Every hour
  $$
  SELECT
    net.http_post(
      url:='https://ffikkqixlmexusrcxaov.supabase.co/functions/v1/check-expired-holds',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) AS request_id;
  $$
);
```

   **Note:** Replace `YOUR_SERVICE_ROLE_KEY` with your service role key from:
   - Settings → API → `service_role` key (⚠️ Keep this secret!)

---

### Step 6: Test Your Setup

1. **Test Database Connection**
   - Go to Table Editor → bookings
   - You should see an empty table with all columns

2. **Test Booking Flow**
   - Run your website locally: Open terminal and run `npm run dev`
   - Go to the booking page
   - Fill out a booking form
   - Check Supabase Table Editor to see if booking appears

3. **Test Stripe Payment**
   - Complete a test booking
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Check if booking status updates to "confirmed"

---

## 🎯 Quick Checklist

- [ ] Database migrations run successfully
- [ ] `bookings` table exists with all columns
- [ ] `stripe-webhook` function deployed
- [ ] `check-expired-holds` function deployed
- [ ] `get-booking-status` function deployed
- [ ] All secrets added to Edge Functions
- [ ] Stripe webhook configured and secret added
- [ ] Cron job set up for expired holds
- [ ] Test booking created successfully

---

## 🔧 Troubleshooting

### Can't deploy Edge Functions manually?
Alternative: Use the Supabase VSCode extension or wait for CLI to work

### Stripe webhook not working?
- Check that URL is correct: `https://ffikkqixlmexusrcxaov.supabase.co/functions/v1/stripe-webhook`
- Verify webhook secret is set in Supabase secrets
- Check webhook logs in Stripe Dashboard

### Bookings not appearing?
- Check browser console for errors
- Verify Supabase credentials in `.env` file
- Check Row Level Security policies allow inserts

---

## 📞 Need Help?

If you get stuck, check:
1. Supabase Dashboard → Logs (for function errors)
2. Browser DevTools → Console (for frontend errors)
3. Stripe Dashboard → Webhooks → View attempts

Your website should now be fully functional! 🎉
