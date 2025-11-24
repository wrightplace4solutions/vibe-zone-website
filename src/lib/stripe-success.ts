// Use the guarded supabase client so missing env vars don't crash the app.
import { supabase } from '@/integrations/supabase/client';

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
