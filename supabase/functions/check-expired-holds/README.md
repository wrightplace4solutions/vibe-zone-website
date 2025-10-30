# Check Expired Holds Function

This Supabase Edge Function automatically checks for and processes expired booking holds.

## Purpose

When a customer submits a booking request, a 48-hour hold is placed on the date. This function:
1. Finds all bookings with status "pending" that are older than 48 hours
2. Updates their status to "expired"
3. Sends notifications to both the client and business owner

## Setup

### 1. Deploy the function

```bash
supabase functions deploy check-expired-holds
```

### 2. Set up a cron job

You can trigger this function periodically using:

#### Option A: Supabase Cron (Recommended)
Use Supabase's pg_cron extension:

```sql
-- Run every hour
SELECT cron.schedule(
  'check-expired-holds',
  '0 * * * *',  -- Every hour
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/check-expired-holds',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

#### Option B: External Cron Service
Use services like:
- GitHub Actions
- Render Cron Jobs
- EasyCron
- Cron-job.org

Example GitHub Actions workflow:

```yaml
name: Check Expired Holds
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            https://YOUR_PROJECT.supabase.co/functions/v1/check-expired-holds
```

### 3. Add Email Notifications

To enable email notifications, you'll need to:

1. Choose an email service (SendGrid, Resend, AWS SES, etc.)
2. Add the service API key to Supabase secrets
3. Uncomment and implement the email sending logic in the function

Example for Resend:

```typescript
const resendApiKey = Deno.env.get("RESEND_API_KEY");

async function sendEmailToClient(booking) {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "bookings@vzentertainment.fun",
      to: booking.customer_email,
      subject: "Booking Hold Expired",
      html: `<p>Hi ${booking.customer_name},</p>...`,
    }),
  });
}
```

## Manual Testing

Test the function manually:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  https://YOUR_PROJECT.supabase.co/functions/v1/check-expired-holds
```

## Response Format

```json
{
  "message": "Processed 2 expired booking(s)",
  "count": 2,
  "results": [
    {
      "booking_id": "uuid",
      "success": true,
      "customer_email": "client@example.com",
      "event_date": "2025-11-15"
    }
  ]
}
```
