import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

export interface CheckoutSessionData {
  packageType: 'option1' | 'option2';
  customerEmail: string;
  customerName: string;
  eventDate: string;
  bookingId: string;
  eventDetails: {
    venueName: string;
    address: string;
    startTime: string;
    endTime: string;
  };
}
