import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleStripeSuccess(sessionId: string) {
  try {
    // The Stripe webhook (Supabase Edge Function) handles payment confirmation server-side
    // This function checks if the booking was confirmed by the webhook
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return { success: false, error };
    }

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
