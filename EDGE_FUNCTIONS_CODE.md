# Edge Functions Code for Manual Deployment

## How to Deploy These Functions

Since Supabase CLI isn't working, you'll need to deploy these manually through the Supabase Dashboard.

### Go to: https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov/functions

---

## Function 1: stripe-webhook

**Function Name:** `stripe-webhook`

**Code to paste:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-10-28.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Payment successful:", session.id);
        
        const metadata = session.metadata;
        const bookingId = metadata?.bookingId;
        
        if (bookingId) {
          // Get the booking details
          const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .single();

          if (fetchError) {
            console.error("Error fetching booking:", fetchError);
          } else if (booking) {
            // Update booking status to confirmed
            const { error: updateError } = await supabase
              .from("bookings")
              .update({
                status: "confirmed",
                stripe_payment_intent: session.payment_intent as string,
                confirmed_at: new Date().toISOString(),
              })
              .eq("id", bookingId);
            
            if (updateError) {
              console.error("Error updating booking:", updateError);
            } else {
              console.log("Booking confirmed:", bookingId);
              
              // TODO: Add Google Calendar integration here using direct API
              // Use GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, 
              // and GOOGLE_CALENDAR_REFRESH_TOKEN from Supabase secrets
            }
          }
        } else {
          console.warn("No booking ID in session metadata");
        }
        
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);
        
        // Try to find and update the booking
        const { data: booking } = await supabase
          .from("bookings")
          .select("id")
          .eq("stripe_payment_intent", paymentIntent.id)
          .single();
        
        if (booking) {
          await supabase
            .from("bookings")
            .update({ status: "payment_failed" })
            .eq("id", booking.id);
        }
        
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

---

## Function 2: check-expired-holds

**Function Name:** `check-expired-holds`

**Code to paste:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    console.log("Checking for expired booking holds...");

    // Calculate 48 hours ago
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // Find all pending bookings older than 48 hours
    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", fortyEightHoursAgo.toISOString());

    if (fetchError) {
      console.error("Error fetching expired bookings:", fetchError);
      throw fetchError;
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      console.log("No expired bookings found");
      return new Response(
        JSON.stringify({ message: "No expired bookings found", count: 0 }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${expiredBookings.length} expired booking(s)`);

    // Process each expired booking
    const results = [];
    for (const booking of expiredBookings) {
      try {
        // Update booking status to expired
        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            status: "expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        if (updateError) {
          console.error(`Error updating booking ${booking.id}:`, updateError);
          results.push({
            booking_id: booking.id,
            success: false,
            error: updateError.message,
          });
          continue;
        }

        // TODO: Send notification emails to both client and business owner
        // This would typically use a service like SendGrid, Resend, or AWS SES
        // For now, we'll just log the notification
        console.log(`Notification needed for expired booking ${booking.id}:`);
        console.log(`  - Client: ${booking.customer_name} (${booking.customer_email})`);
        console.log(`  - Event: ${booking.event_type} on ${booking.event_date}`);
        console.log(`  - Created: ${booking.created_at}`);

        // Here you would send emails:
        // await sendEmailToClient(booking);
        // await sendEmailToBusiness(booking);

        results.push({
          booking_id: booking.id,
          success: true,
          customer_email: booking.customer_email,
          event_date: booking.event_date,
        });
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        results.push({
          booking_id: booking.id,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${expiredBookings.length} expired booking(s)`,
        count: expiredBookings.length,
        results: results,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-expired-holds:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
```

---

## Notes

- These functions are already in your project files at:
  - `supabase/functions/stripe-webhook/index.ts`
  - `supabase/functions/check-expired-holds/index.ts`

- You're copying them here for manual deployment through the Supabase Dashboard

- After deploying, remember to set up the secrets as described in `SETUP_COMPLETE_GUIDE.md`
