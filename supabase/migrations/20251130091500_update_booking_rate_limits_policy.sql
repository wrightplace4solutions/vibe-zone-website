-- Ensure booking_rate_limits table and indexes exist, and set permissive policy per request
create extension if not exists pgcrypto with schema public;

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

-- Create requested indexes if missing
create index if not exists idx_rate_limits_email
  on public.booking_rate_limits (email, created_at);

create index if not exists idx_rate_limits_ip
  on public.booking_rate_limits (ip_hash, created_at);

-- Enable RLS
alter table public.booking_rate_limits enable row level security;

-- Create requested permissive policy name if not present
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'booking_rate_limits'
      and policyname = 'Service role can manage rate limits'
  ) then
    create policy "Service role can manage rate limits"
      on public.booking_rate_limits
      for all
      using (true)
      with check (true);
  end if;
end $$;
