-- Update booking_rate_limits table schema
-- Drop existing table and recreate with improved schema

drop table if exists public.booking_rate_limits cascade;

create table public.booking_rate_limits (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip_hash text,
  created_at timestamptz default now()
);

create index idx_rate_limits_email on public.booking_rate_limits(email, created_at);
create index idx_rate_limits_ip on public.booking_rate_limits(ip_hash, created_at);

alter table public.booking_rate_limits enable row level security;

-- Allow service role to manage (edge functions use service role key)
create policy "Service role can manage rate limits"
  on public.booking_rate_limits for all
  using (true) with check (true);
