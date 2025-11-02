# Deploy Google Calendar Sync Function - Step by Step

## The Problem
Your booking system works, but the Google Calendar sync function (`sync-booking-to-calendar`) hasn't been deployed yet, so it can't add events to your calendar automatically.

## Solution: Deploy the Edge Function

### Step 1: Get Your Supabase Access Token

1. **Go to:** https://supabase.com/dashboard/account/tokens
2. **Click "Generate New Token"**
3. **Name it:** "CLI Deployment"
4. **Copy the token** (it starts with `sbp_`)

### Step 2: Set the Token as Environment Variable

Open PowerShell and run:

```powershell
$env:SUPABASE_ACCESS_TOKEN = "YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token you copied.

### Step 3: Deploy the Function

```powershell
cd "c:\Users\dcn8t\OneDrive\Desktop\Vibe Zone Website\vibe-zone-website"
supabase functions deploy sync-booking-to-calendar --project-ref wabpexhnrziipvbghmhx
```

### Step 4: Test the Sync

After deployment succeeds:
1. Go back to the `sync-booking-tool.html` in your browser
2. Refresh the page
3. Paste your booking ID: `bf54cd31-5daf-46b7-ae0c-ac8651c591b0`
4. Click "Sync to Google Calendar"
5. It should work! ✅

---

## Alternative: Deploy via Supabase Dashboard (If CLI Doesn't Work)

If the CLI continues to have issues, we can deploy through the dashboard:

1. **Go to:** https://supabase.com/dashboard/project/wabpexhnrziipvbghmhx/functions
2. **Click "Deploy a new function"**
3. **Function name:** `sync-booking-to-calendar`
4. **Copy the entire code** from: `supabase/functions/sync-booking-to-calendar/index.ts`
5. **Paste it** into the editor
6. **Click "Deploy"**

---

## Your Booking Details (For Reference)

- **Event:** DJ Service
- **Date:** November 7, 2025
- **Time:** 4:00 PM - 10:00 PM (16:00 - 22:00)
- **Venue:** community center
- **Address:** 5615 Melbeck Court, North Chesterfield, VA 23234
- **Customer:** STEPHANIE C WRIGHT
- **Email:** dcn8tve2@yahoo.com
- **Phone:** 8045365835
- **Booking ID:** bf54cd31-5daf-46b7-ae0c-ac8651c591b0
- **Status:** ✅ confirmed

Once the function is deployed, future bookings will automatically sync to your calendar when payment is completed!
