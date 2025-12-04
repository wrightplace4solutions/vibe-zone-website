-- Drop the old check constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_service_tier_check;

-- Add new check constraint with actual package names used by the system
ALTER TABLE public.bookings ADD CONSTRAINT bookings_service_tier_check 
CHECK (service_tier = ANY (ARRAY['Essential Vibe', 'Premium Experience', 'VZ Party Starter', 'Ultimate Entertainment Experience']));