# Supabase Database Setup Guide for Vibe Zone Website

## Current Situation

You have **2 Supabase projects** (both on free tier):
1. **VibeQue App** - Your existing project
2. **Vibe Zone Entertainment** - Project ID: `ffikkqixlmexusrcxaov`

✅ **No upgrade needed!** Supabase free tier allows 2 projects.

## Step-by-Step Setup

### 1. Verify You're Connected to the Right Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Look for project: **ffikkqixlmexusrcxaov** or check the URL matches: `https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov`
3. If you don't see this project, you may need to create it (see Step 2)

### 2. If Project Doesn't Exist - Create It

1. Click "+ New Project" in Supabase dashboard
2. Name it: "Vibe Zone Entertainment" or "vibe-zone-website"
3. Set a secure database password (save it!)
4. Choose region closest to you
5. Wait for project to be created

### 3. Apply Database Migrations

Once the project is created, run migrations to create the bookings table:

#### Option A: Using Supabase Dashboard (Easiest)
1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20251026014442_57d8478a-9aca-47c2-a846-bd3d1e4efe12.sql`
4. Run the query
5. Then copy and paste `supabase/migrations/20251030000000_update_bookings_for_holds.sql`
6. Run that query too

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ffikkqixlmexusrcxaov

# Push migrations
supabase db push
```

### 4. Set Up Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Deploy stripe webhook
supabase functions deploy stripe-webhook

# Deploy expired holds checker
supabase functions deploy check-expired-holds

# Deploy secure booking status lookup
supabase functions deploy get-booking-status
```

### 5. Add Supabase Secrets

Set environment variables for your Edge Functions:

```bash
# Stripe secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_<YOUR_SECRET_KEY>
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Google Calendar secrets
supabase secrets set GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
supabase secrets set GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret
supabase secrets set GOOGLE_CALENDAR_REFRESH_TOKEN=your_google_refresh_token

# CRON_SECRET (used by scheduled edge functions; send as `x-cron-secret`)
# Verify secrets are set
supabase secrets list
```

### 6. Update Your Local .env File

If you created a new project, update your local `.env` file with the new credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_public_key
VITE_SUPABASE_PROJECT_ID=your_project_ref
```

### Booking Rate Limits

This project includes a `booking_rate_limits` table used to track booking attempts for rate limiting:

- Table: `public.booking_rate_limits`
- Indexes: `idx_rate_limits_email (email, created_at)`, `idx_rate_limits_ip (ip_hash, created_at)`
- RLS enabled, with policy: "Service role can manage rate limits"

Client-side booking submission logs a non-blocking insert into this table with the user's email and a SHA-256 fingerprint of `navigator.userAgent` as `ip_hash`. For stronger security, consider server-side logging in the `create-booking-hold` function using the request IP.
Get these from: Supabase Dashboard → Settings → API

### 7. Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://ffikkqixlmexusrcxaov.supabase.co/functions/v1/stripe-webhook`
3. Select events to send:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret
5. Add it to Supabase secrets (see step 5)

### 8. Test the Setup

1. Try creating a booking through your website
2. Check Supabase Dashboard → Table Editor → bookings
3. You should see your test booking with status "pending"

## Troubleshooting

### Can't see the project?
- Make sure you're logged into the correct Supabase account
- Check if you created it under a different organization

### Database errors?
- Make sure migrations ran successfully
- Check SQL Editor → Query History for errors

### Function deployment fails?
- Make sure Supabase CLI is installed and you're logged in
- Check that you're linked to the correct project

## Free Tier Limits

Each project gets:
- 500 MB database storage
- 1 GB file storage  
- 50,000 monthly active users
- 2 GB bandwidth

You're well within limits for both projects! 🎉
