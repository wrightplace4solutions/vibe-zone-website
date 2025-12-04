-- language: postgresql
-- Update booking_rate_limits table schema
-- This migration ensures proper RLS policies for edge function access

-- Ensure the table exists with correct schema
do $$
begin
  if not exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'booking_rate_limits'
  ) then
    create table public.booking_rate_limits (
      id uuid primary key default gen_random_uuid(),
      email text not null,
      ip_hash text,
      created_at timestamptz default now()
    );
  end if;
end $$;

-- Create indexes if they don't exist
create index if not exists idx_rate_limits_email on public.booking_rate_limits (email, created_at);
create index if not exists idx_rate_limits_ip on public.booking_rate_limits (ip_hash, created_at);

-- Enable RLS
alter table public.booking_rate_limits enable row level security;

-- Drop all existing policies to avoid conflicts
do $$
begin
  drop policy if exists "Service role can manage rate limits" on public.booking_rate_limits;
  drop policy if exists "service_role_manage_booking_rate_limits" on public.booking_rate_limits;
exception
  when others then null;
end $$;

-- Create a permissive policy that allows service role full access
-- Edge functions use the service role key, so this policy allows them to work
create policy "Allow service role full access to rate limits"
  on public.booking_rate_limits
  for all
  using (true)
  with check (true);
