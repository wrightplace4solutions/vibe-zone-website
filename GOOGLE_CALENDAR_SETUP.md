# Google Calendar Integration Setup

## Environment Variables Added

The following Google Calendar API credentials have been added to the project:

### Local Development (.env)
- `GOOGLE_CALENDAR_CLIENT_ID`: OAuth 2.0 Client ID
- `GOOGLE_CALENDAR_CLIENT_SECRET`: OAuth 2.0 Client Secret
- `GOOGLE_CALENDAR_REFRESH_TOKEN`: Refresh token for maintaining API access

## Setting Up Supabase Secrets (Production)

For production deployment, you need to add these as Supabase secrets:

### Via Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Click **Add Secrets**
4. Add the following secrets:
   - `GOOGLE_CALENDAR_CLIENT_ID`
   - `GOOGLE_CALENDAR_CLIENT_SECRET`
   - `GOOGLE_CALENDAR_REFRESH_TOKEN`

### Via Supabase CLI:
```bash
# Set the secrets
supabase secrets set GOOGLE_CALENDAR_CLIENT_ID=1025490265919-0vn7hg2259ndgsdan674ossq83aco9js.apps.googleusercontent.com
supabase secrets set GOOGLE_CALENDAR_CLIENT_SECRET=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
supabase secrets set GOOGLE_CALENDAR_REFRESH_TOKEN=L9IrWjBt9Rc2OM8HaZ7oyIV0divBxMp4YbYa1DUBqTYoCVSb8SXGWinUhVtKniqkuiLUcOk

# Verify the secrets are set
supabase secrets list
```

## Current Integration

Currently, the booking system uses Make.com webhook for Google Calendar integration. If you want to use these credentials directly in a Supabase Edge Function, you would need to:

1. Create a new Edge Function (e.g., `supabase/functions/google-calendar/index.ts`)
2. Use the Google Calendar API directly with these credentials
3. Update the webhook handler to call this function instead of Make.com

## Security Notes

⚠️ **Important**: 
- The `.env` file is gitignored and should never be committed to version control
- Always use Supabase secrets for production environment variables
- Rotate credentials periodically for security
- The refresh token allows ongoing access - keep it secure

## Credentials Details

- **Client ID**: `1025490265919-0vn7hg2259ndgsdan674ossq83aco9js.apps.googleusercontent.com`
- **Client Secret**: `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`
- **Refresh Token**: `L9IrWjBt9Rc2OM8HaZ7oyIV0divBxMp4YbYa1DUBqTYoCVSb8SXGWinUhVtKniqkuiLUcOk`
