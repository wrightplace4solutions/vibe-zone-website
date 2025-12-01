# Manual Migration Guide for Supabase

## Option 1: Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project: `gvxkuawokdamfytfoiqy`
3. Click "SQL Editor" in the left sidebar
4. Create a new query
5. Copy and paste each migration file content below, one at a time
6. Click "Run" after each one

### Migration 1: Inquiries Table
```sql
-- Copy contents from: supabase/migrations/20251130000001_create_inquiries_table.sql
```

### Migration 2: Booking Requests Table
```sql
-- Copy contents from: supabase/migrations/20251130000002_create_booking_requests_table.sql
```

### Migration 3: Reminders Table
```sql
-- Copy contents from: supabase/migrations/20251130000003_create_reminders_table.sql
```

## Option 2: Supabase CLI

```powershell
# Login
supabase login

# Link to your project
supabase link --project-ref gvxkuawokdamfytfoiqy

# Apply migrations
supabase db push

# Deploy edge function
supabase functions deploy send-reminders
```

## Verification

After running migrations, check in Supabase Dashboard > Table Editor:
- [ ] `inquiries` table exists
- [ ] `booking_requests` table exists  
- [ ] `reminders` table exists

Test the contact form on your site to verify data flows correctly.
