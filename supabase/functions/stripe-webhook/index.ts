import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-10-28.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const BUSINESS_EMAIL = "dcn8tve2@yahoo.com";

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

// Function to format time for display (e.g., "18:00" -> "6:00 PM")
function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Function to format date for display (e.g., "2025-12-08" -> "December 8, 2025")
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Function to send confirmation emails
async function sendConfirmationEmails(booking: any): Promise<void> {
  console.log("Sending confirmation emails for booking:", booking.id);

  const eventDate = formatDateDisplay(booking.event_date);
  const startTime = formatTimeDisplay(booking.start_time || "18:00");
  const endTime = formatTimeDisplay(booking.end_time || "22:00");
  
  const locationParts = [
    booking.venue_name,
    booking.street_address,
    booking.city,
    booking.state,
    booking.zip_code
  ].filter(Boolean);
  const location = locationParts.join(", ");

  // Email to customer
  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e11d48; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hey ${booking.customer_name}!
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Your booking with <strong>Vibe Zone Entertainment</strong> has been confirmed! We're excited to help make your event unforgettable.
        </p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #e11d48; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📋 Event Details</h2>
          <p style="margin: 8px 0; color: #555;"><strong>Date:</strong> ${eventDate}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Location:</strong> ${location}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Package:</strong> ${booking.service_tier}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Total:</strong> $${booking.total_amount}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Deposit Paid:</strong> $${booking.deposit_amount}</p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>⏰ Setup Reminder:</strong> Please ensure the DJ has access to the venue 1 hour before the event start time.
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          A calendar invite has been sent to your email. If you have any questions or need to make changes, please don't hesitate to reach out!
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 14px;">
            Vibe Zone Entertainment<br>
            <a href="https://vzentertainment.fun" style="color: #e11d48;">vzentertainment.fun</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Email to business owner
  const businessEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; margin: 0; font-size: 28px;">💰 New Booking Confirmed!</h1>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          A new booking has been paid and confirmed!
        </p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📋 Booking Details</h2>
          <p style="margin: 8px 0; color: #555;"><strong>Booking ID:</strong> ${booking.id}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Customer:</strong> ${booking.customer_name}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> ${booking.customer_email}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Phone:</strong> ${booking.customer_phone}</p>
        </div>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🎤 Event Info</h2>
          <p style="margin: 8px 0; color: #555;"><strong>Date:</strong> ${eventDate}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Location:</strong> ${location}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Package:</strong> ${booking.service_tier}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Event Type:</strong> ${booking.event_type}</p>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
          <h2 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">💵 Payment</h2>
          <p style="margin: 8px 0; color: #555;"><strong>Total Amount:</strong> $${booking.total_amount}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Deposit Received:</strong> $${booking.deposit_amount}</p>
          <p style="margin: 8px 0; color: #555;"><strong>Balance Due:</strong> $${booking.total_amount - booking.deposit_amount}</p>
        </div>
        
        ${booking.notes ? `
        <div style="background-color: #f5f5f5; padding: 15px; margin: 25px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">📝 Notes</h3>
          <p style="margin: 0; color: #555; font-size: 14px; white-space: pre-wrap;">${booking.notes}</p>
        </div>
        ` : ''}
        
        <p style="font-size: 14px; color: #888; margin-top: 30px;">
          This event has been added to your Google Calendar.
        </p>
      </div>
    </body>
    </html>
  `;

  try {
    // Send to customer
    const customerResult = await resend.emails.send({
      from: "Vibe Zone Entertainment <onboarding@resend.dev>",
      to: [booking.customer_email],
      subject: `🎉 Booking Confirmed - ${eventDate}`,
      html: customerEmailHtml,
    });
    console.log("Customer email sent:", customerResult);

    // Send to business owner
    const businessResult = await resend.emails.send({
      from: "Vibe Zone Bookings <onboarding@resend.dev>",
      to: [BUSINESS_EMAIL],
      subject: `💰 New Booking: ${booking.customer_name} - ${eventDate}`,
      html: businessEmailHtml,
    });
    console.log("Business email sent:", businessResult);
  } catch (emailError) {
    console.error("Error sending confirmation emails:", emailError);
    // Don't throw - emails failing shouldn't break the webhook
  }
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
              
              // Refetch booking with updated data
              const { data: confirmedBooking } = await supabase
                .from("bookings")
                .select("*")
                .eq("id", bookingId)
                .single();
              
              // Create Google Calendar event
              try {
                console.log("Attempting to create Google Calendar event...");
                const calendarEventId = await createCalendarEvent(confirmedBooking || booking);
                
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
              
              // Send confirmation emails
              try {
                await sendConfirmationEmails(confirmedBooking || booking);
              } catch (emailError) {
                console.error("Failed to send confirmation emails:", emailError);
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
