import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.replace('pk_', 'sk_') || '', {
  apiVersion: '2024-10-28.acacia',
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleStripeSuccess(sessionId: string) {
  try {
    // Get the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      const bookingId = session.metadata?.bookingId;
      
      if (bookingId) {
        // Update booking to confirmed
        const { error } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            stripe_payment_intent: session.payment_intent as string,
            stripe_session_id: sessionId,
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', bookingId);

        if (error) {
          console.error('Error updating booking:', error);
          return { success: false, error };
        }

        // TODO: Add Google Calendar event here
        // For now, this confirms the booking
        
        return { success: true, bookingId };
      }
    }
    
    return { success: false, error: 'Payment not completed' };
  } catch (error) {
    console.error('Error handling Stripe success:', error);
    return { success: false, error };
  }
}
