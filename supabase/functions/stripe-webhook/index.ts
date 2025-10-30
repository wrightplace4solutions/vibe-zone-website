// @ts-nocheck - This is a Deno Edge Function, not a Node.js/TypeScript file
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
              
              // Send booking data to Make.com webhook for Google Calendar integration
              try {
                const webhookUrl = "https://hook.us2.make.com/yb9heqwhecy4vnpnlbauixxf6nxc6nno";
                const webhookResponse = await fetch(webhookUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    booking_id: bookingId,
                    customer_name: booking.customer_name,
                    customer_email: booking.customer_email,
                    customer_phone: booking.customer_phone,
                    event_type: booking.event_type,
                    event_date: booking.event_date,
                    start_time: booking.start_time,
                    end_time: booking.end_time,
                    venue_name: booking.venue_name,
                    street_address: booking.street_address,
                    city: booking.city,
                    state: booking.state,
                    zip_code: booking.zip_code,
                    package_type: booking.package_type,
                    service_tier: booking.service_tier,
                    total_amount: booking.total_amount,
                    notes: booking.notes,
                    confirmed_at: new Date().toISOString(),
                  }),
                });

                if (!webhookResponse.ok) {
                  console.error("Failed to send to Make.com webhook:", await webhookResponse.text());
                } else {
                  console.log("Successfully sent booking to Make.com webhook");
                }
              } catch (webhookError) {
                console.error("Error calling Make.com webhook:", webhookError);
              }
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
