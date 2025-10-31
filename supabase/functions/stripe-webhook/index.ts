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

// Google Calendar configuration
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET") || "";
const GOOGLE_REFRESH_TOKEN = Deno.env.get("GOOGLE_CALENDAR_REFRESH_TOKEN") || "";

// Function to get Google access token from refresh token
async function getGoogleAccessToken(): Promise<string> {
  console.log("Fetching Google access token...");
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to get access token:", error);
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  console.log("Access token obtained successfully");
  return data.access_token;
}

// Function to create Google Calendar event
async function createCalendarEvent(booking: any): Promise<string> {
  console.log("Creating calendar event for booking:", booking.id);
  
  const accessToken = await getGoogleAccessToken();

  // Format the event date and times
  const eventDate = booking.event_date;
  const startTime = booking.start_time || "18:00";
  const endTime = booking.end_time || "22:00";

  // Create ISO datetime strings
  const startDateTime = `${eventDate}T${startTime}:00`;
  const endDateTime = `${eventDate}T${endTime}:00`;

  // Build location string
  const locationParts = [
    booking.venue_name,
    booking.street_address,
    booking.city,
    booking.state,
    booking.zip_code
  ].filter(Boolean);
  const location = locationParts.join(", ");

  // Build description
  const description = `
Vibe Zone Entertainment Booking

Customer: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${booking.customer_phone}

Event Type: ${booking.event_type}
Service Tier: ${booking.service_tier}
Package: ${booking.package_type || "Standard"}

Location: ${location}

Total Amount: $${booking.total_amount}
Deposit: $${booking.deposit_amount || "N/A"}

Booking ID: ${booking.id}
Confirmed: ${booking.confirmed_at}

Notes: ${booking.notes || "None"}
`.trim();

  const calendarEvent = {
    summary: `Vibe Zone Entertainment - ${booking.event_type}`,
    description: description,
    location: location,
    start: {
      dateTime: startDateTime,
      timeZone: "America/New_York", // Adjust timezone as needed
    },
    end: {
      dateTime: endDateTime,
      timeZone: "America/New_York",
    },
    attendees: [
      { email: booking.customer_email },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 }, // 1 day before
        { method: "popup", minutes: 60 }, // 1 hour before
      ],
    },
  };

  console.log("Sending event to Google Calendar API...");

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(calendarEvent),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to create calendar event:", error);
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const event = await response.json();
  console.log("Calendar event created successfully:", event.id);
  console.log("Event link:", event.htmlLink);
  
  return event.id;
}

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
              
              // Create Google Calendar event
              try {
                console.log("Attempting to create Google Calendar event...");
                const calendarEventId = await createCalendarEvent(booking);
                
                // Update booking with calendar event ID
                const { error: calendarUpdateError } = await supabase
                  .from("bookings")
                  .update({ google_calendar_event_id: calendarEventId })
                  .eq("id", bookingId);
                
                if (calendarUpdateError) {
                  console.error("Error storing calendar event ID:", calendarUpdateError);
                } else {
                  console.log("Calendar event created and linked to booking:", calendarEventId);
                }
              } catch (calendarError) {
                // Log the error but don't fail the webhook
                // The booking is still confirmed even if calendar sync fails
                console.error("Failed to create calendar event (booking still confirmed):", calendarError);
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
