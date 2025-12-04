# Fix for "Edge Function returned a non-2xx status code" Booking Error

## Problem Identified

The booking error is caused by **incorrect RLS (Row Level Security) policies** on the `booking_rate_limits` table, which prevents the `create-booking-hold` edge function from querying or inserting records.

## Root Cause

Your edge function uses the **service role key** to access the database, but the RLS policy was incorrectly configured using `to service_role`, which is not valid PostgreSQL syntax. This prevents the edge function from:
1. Checking rate limits before creating a booking
2. Logging booking attempts to prevent spam

When the function fails to access this table, it returns a non-2xx status code, causing the error you see.

## Solution Steps

### Step 1: Apply the Updated Migration

I've already fixed the migration file at:
`supabase/migrations/20251130160000_update_booking_rate_limits_schema.sql`

You need to apply this migration to your Supabase database:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/gvxkuawokdamfytfoiqy
   - Click on **SQL Editor** in the left sidebar

2. **Run the Fixed Migration**
   - Click **"New Query"**
   - Copy and paste the entire contents of the fixed migration file
   - Click **"Run"**
   - You should see: ✅ "Success"

### Step 2: Verify the Table and Policy

After running the migration, verify it worked:

```sql
-- Check if table exists
SELECT * FROM public.booking_rate_limits LIMIT 1;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'booking_rate_limits';

-- Check the policy exists
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'booking_rate_limits';
```

You should see:
- Table exists (may be empty)
- `rowsecurity = true`
- Policy named "Allow service role full access to rate limits"

### Step 3: Verify Edge Function is Deployed

Make sure the `create-booking-hold` function is deployed:

1. **In Supabase Dashboard**, go to **Edge Functions**
2. You should see `create-booking-hold` listed
3. If it's missing, deploy it:
   - Click **"Deploy a new function"**
   - Name: `create-booking-hold`
   - Paste the code from: `supabase/functions/create-booking-hold/index.ts`
   - Click **"Deploy"**

### Step 4: Check Function Configuration

Verify the function has the correct JWT setting in `supabase/config.toml`:

```toml
[functions.create-booking-hold]
verify_jwt = true
```

This is already configured correctly in your project.

### Step 5: Test the Booking Flow

1. **Try submitting a booking** on your website
2. If you still get an error, check the **Edge Function Logs**:
   - Supabase Dashboard → Edge Functions → create-booking-hold → Logs
   - Look for specific error messages

## Why This Happened

The original migration attempted to use:
```sql
create policy "Service role can manage rate limits"
  on public.booking_rate_limits
  for all
  to service_role  -- ❌ This syntax is incorrect in PostgreSQL
  using (true)
  with check (true);
```

The correct approach for edge functions is to create a **permissive policy** that allows all operations when using the service role key:
```sql
create policy "Allow service role full access to rate limits"
  on public.booking_rate_limits
  for all
  using (true)
  with check (true);
```

Edge functions automatically use the service role key (not the `service_role` role), so the policy just needs to allow access without additional role checks.

## Expected Behavior After Fix

✅ Users can submit booking requests
✅ Rate limiting works (3 attempts per 10 minutes per email/device)
✅ Date availability is checked
✅ Booking holds are created successfully
✅ Users receive confirmation and payment link

## If You Still Have Issues

1. **Check Supabase Edge Function Logs** for detailed error messages
2. **Verify environment variables** in Edge Functions settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   
3. **Test the function directly** via the Supabase Dashboard:
   - Go to Edge Functions → create-booking-hold → Test
   - Use sample payload from the booking form

## Note About VS Code Errors

The red squiggly lines in VS Code are **false positives**. VS Code's SQL extension is treating the file as T-SQL (Microsoft SQL Server) instead of PostgreSQL. The syntax in your migration file is now **100% correct for PostgreSQL/Supabase**. You can safely ignore those VS Code warnings.

To fix the VS Code warnings (optional):
- Install the "PostgreSQL" extension by Chris Kolkman
- Or add a comment at the top: `-- language: postgresql`
- Or rename the file extension to `.pgsql`
