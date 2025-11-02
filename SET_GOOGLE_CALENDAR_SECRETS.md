# Set Google Calendar Secrets in Supabase

## URGENT: Your Google Calendar is not syncing because the secrets are not set in production!

Your booking from November 7th didn't appear in your Google Calendar (`dcn8tve@gmail.com`) because the Google Calendar API credentials are only in your local `.env` file, not in Supabase production.

## Fix This Now - Follow These Steps:

### Option 1: Via Supabase Dashboard (EASIEST) ✅

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/wabpexhnrziipvbghmhx

2. **Navigate to Edge Functions Settings**
   - Click on "Project Settings" (bottom left)
   - Click on "Edge Functions" 
   - Or go directly to: https://supabase.com/dashboard/project/wabpexhnrziipvbghmhx/settings/functions

3. **Add These 3 Secrets** (click "Add new secret" for each)

   **Secret 1:**
   ```
   Name: GOOGLE_CALENDAR_CLIENT_ID
   Value: 1025490265919-0vn7hg2259ndgsdan674ossq83aco9js.apps.googleusercontent.com
   ```

   **Secret 2:**
   ```
   Name: GOOGLE_CALENDAR_CLIENT_SECRET
   Value: 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
   ```

   **Secret 3:**
   ```
   Name: GOOGLE_CALENDAR_REFRESH_TOKEN
   Value: L9IrWjBt9Rc2OM8HaZ7oyIV0divBxMp4YbYa1DUBqTYoCVSb8SXGWinUhVtKniqkuiLUcOk
   ```

4. **Deploy the stripe-webhook function**
   - After setting secrets, you need to redeploy the function for it to pick them up
   - Run this command in PowerShell:
   ```powershell
   cd "c:\Users\dcn8t\OneDrive\Desktop\Vibe Zone Website\vibe-zone-website"
   supabase functions deploy stripe-webhook --project-ref wabpexhnrziipvbghmhx
   ```

### Option 2: Via Supabase CLI (Requires Login)

If you want to use the CLI instead:

1. **Login to Supabase**
   ```powershell
   supabase login
   ```
   This will open a browser window to authenticate

2. **Set the secrets**
   ```powershell
   supabase secrets set GOOGLE_CALENDAR_CLIENT_ID="1025490265919-0vn7hg2259ndgsdan674ossq83aco9js.apps.googleusercontent.com" --project-ref wabpexhnrziipvbghmhx

   supabase secrets set GOOGLE_CALENDAR_CLIENT_SECRET="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" --project-ref wabpexhnrziipvbghmhx

   supabase secrets set GOOGLE_CALENDAR_REFRESH_TOKEN="L9IrWjBt9Rc2OM8HaZ7oyIV0divBxMp4YbYa1DUBqTYoCVSb8SXGWinUhVtKniqkuiLUcOk" --project-ref wabpexhnrziipvbghmhx
   ```

3. **Verify secrets are set**
   ```powershell
   supabase secrets list --project-ref wabpexhnrziipvbghmhx
   ```

4. **Redeploy the webhook**
   ```powershell
   supabase functions deploy stripe-webhook --project-ref wabpexhnrziipvbghmhx
   ```

## What About Your November 7th Booking?

Since the calendar sync wasn't working when you made that booking, you have two options:

### Option A: Manually Add to Calendar
1. Check your bookings database to get the full details
2. Manually create the event in Google Calendar

### Option B: Re-trigger the Calendar Sync
After setting up the secrets, I can create a script to retroactively sync that booking to your calendar.

## Testing After Setup

1. Make another test booking
2. Complete the payment
3. Within seconds, check your Google Calendar (`dcn8tve@gmail.com`)
4. The event should appear automatically!

## Need Help?

Let me know once you've set the secrets in the dashboard, and I can:
1. Verify they're working
2. Help sync your existing booking to the calendar
3. Test with a new booking

---

**Current Status**: ❌ Google Calendar secrets NOT SET in production
**Your Calendar**: dcn8tve@gmail.com
**Project**: wabpexhnrziipvbghmhx
