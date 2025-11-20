import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleStripeSuccess(sessionId: string, bookingId: string) {
  try {
    // The Stripe webhook (Supabase Edge Function) handles payment confirmation server-side
    // This function checks if the booking was confirmed by the webhook without exposing the bookings table

    const { data, error } = await supabase.functions.invoke('get-booking-status', {
      body: { sessionId, bookingId },
    });

    if (error) {
      console.error('Error fetching booking status:', error);
      return { success: false, error };
    }

    const booking = data?.booking;

    if (booking && booking.status === 'confirmed') {
      return { success: true, bookingId: booking.id };
    }

    // Booking exists but not confirmed yet (webhook may still be processing)
    return { success: false, error: 'Booking not confirmed yet' };
  } catch (error) {
    console.error('Error handling Stripe success:', error);
    return { success: false, error };
  }
}
