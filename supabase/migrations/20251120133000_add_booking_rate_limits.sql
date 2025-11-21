-- Track booking submission attempts for rate limiting bot/spam traffic
create extension if not exists pgcrypto with schema public;

do $$
begin
  if not exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'booking_rate_limits'
  ) then
    create table public.booking_rate_limits (
      id uuid primary key default gen_random_uuid(),
      email text,
      ip_hash text,
      created_at timestamptz not null default timezone('utc', now())
    );
  end if;
end $$;

create index if not exists booking_rate_limits_email_window_idx
  on public.booking_rate_limits (email, created_at);

create index if not exists booking_rate_limits_ip_window_idx
  on public.booking_rate_limits (ip_hash, created_at);

alter table public.booking_rate_limits enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'service_role_manage_booking_rate_limits'
      and schemaname = 'public' and tablename = 'booking_rate_limits'
  ) then
    create policy service_role_manage_booking_rate_limits
      on public.booking_rate_limits
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;
