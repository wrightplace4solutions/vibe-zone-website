import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const BUSINESS_EMAIL = "dcn8tve2@yahoo.com";

// Google Calendar configuration
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET") || "";
const GOOGLE_REFRESH_TOKEN = Deno.env.get("GOOGLE_CALENDAR_REFRESH_TOKEN") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get Google access token
async function getGoogleAccessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Update calendar event to show cancelled/expired
async function updateCalendarEventAsCancelled(eventId: string, booking: any): Promise<boolean> {
  try {
    console.log("Updating calendar event as cancelled:", eventId);
    const accessToken = await getGoogleAccessToken();

    const eventDate = booking.event_date;
    const startTime = booking.start_time || "18:00";
    const endTime = booking.end_time || "22:00";

    const locationParts = [
      booking.venue_name,
      booking.street_address,
      booking.city,
      booking.state,
      booking.zip_code
    ].filter(Boolean);
    const location = locationParts.join(", ") || "TBD";

    const description = `
❌ CANCELLED - Deposit Not Received

This booking has been automatically cancelled due to non-payment within the 72-hour hold period.

Customer: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${booking.customer_phone}

Event Type: ${booking.event_type}
Service Tier: ${booking.service_tier}
Package: ${booking.package_type || "Standard"}

Location: ${location}

Total Amount: $${booking.total_amount}
Deposit Required: $${booking.deposit_amount || "N/A"}

Booking ID: ${booking.id}
Created: ${booking.created_at}
Expired: ${new Date().toISOString()}

The date is now available for new bookings.
`.trim();

    const calendarEvent = {
      summary: `[CANCELLED] Vibe Zone - ${booking.event_type} (${booking.customer_name})`,
      description: description,
      location: location,
      start: {
        dateTime: `${eventDate}T${startTime}:00`,
        timeZone: "America/New_York",
      },
      end: {
        dateTime: `${eventDate}T${endTime}:00`,
        timeZone: "America/New_York",
      },
      colorId: "11", // Red for cancelled
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!response.ok) {
      console.error("Failed to update calendar event:", await response.text());
      return false;
    }

    console.log("Calendar event updated as cancelled:", eventId);
    return true;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return false;
  }
}

const formatTimeDisplay = (time: string) => {
  if (!time) return "TBD";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const send24HourReminderEmail = async (booking: any) => {
  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .button { background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        .countdown { font-size: 24px; font-weight: bold; color: #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Reminder: Complete Your Booking</h1>
          <p>VZ Entertainment DJ Services</p>
        </div>
        <div class="content">
          <p>Hi ${booking.customer_name},</p>
          
          <div class="urgent">
            <p class="countdown">⚠️ Only 24 Hours Left!</p>
            <p>Your reservation hold expires soon. Complete your payment to secure your date!</p>
          </div>
          
          <div class="details">
            <h3>Your Reserved Event</h3>
            <p><strong>Event Date:</strong> ${formatDateDisplay(booking.event_date)}</p>
            <p><strong>Time:</strong> ${formatTimeDisplay(booking.start_time)} - ${formatTimeDisplay(booking.end_time)}</p>
            <p><strong>Venue:</strong> ${booking.venue_name}</p>
            <p><strong>Package:</strong> ${booking.service_tier}</p>
            <p><strong>Deposit Amount:</strong> $${booking.deposit_amount || booking.total_amount}</p>
          </div>
          
          <p>Don't miss out! If payment isn't received within 24 hours, your reservation will be released and the date will become available to other customers.</p>
          
          <div class="cta">
            <a href="https://vzentertainment.fun/booking" class="button">Complete Payment Now</a>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://vzentertainment.fun/auth?email=${encodeURIComponent(booking.customer_email)}" style="background: #7c3aed; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View My Booking Details</a>
          </div>
          
          <p style="font-size: 12px; color: #666; text-align: center;">Click the button above to view your booking details and pay your deposit. You'll receive a secure magic link to sign in.</p>
          
          <p>Questions? Reply to this email or contact us directly.</p>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} VZ Entertainment. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const businessEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ 24-Hour Reminder Sent</h1>
        </div>
        <div class="content">
          <p>A 24-hour payment reminder was sent to a customer with a pending booking.</p>
          
          <div class="details">
            <h3>Customer</h3>
            <p><strong>Name:</strong> ${booking.customer_name}</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
            <p><strong>Phone:</strong> ${booking.customer_phone}</p>
          </div>
          
          <div class="details">
            <h3>Event Details</h3>
            <p><strong>Date:</strong> ${formatDateDisplay(booking.event_date)}</p>
            <p><strong>Package:</strong> ${booking.service_tier}</p>
            <p><strong>Amount:</strong> $${booking.total_amount}</p>
          </div>
          
          <p>The hold will expire in 24 hours if payment is not received.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "VZ Entertainment <onboarding@resend.dev>",
      to: [booking.customer_email],
      subject: `⏰ 24 Hours Left to Secure Your Date - ${formatDateDisplay(booking.event_date)}`,
      html: customerEmailHtml,
    });

    await resend.emails.send({
      from: "VZ Entertainment <onboarding@resend.dev>",
      to: [BUSINESS_EMAIL],
      subject: `24hr Reminder Sent: ${booking.customer_name} - ${formatDateDisplay(booking.event_date)}`,
      html: businessEmailHtml,
    });

    console.log(`24-hour reminder emails sent for booking ${booking.id}`);
    return true;
  } catch (error) {
    console.error(`Error sending 24-hour reminder for booking ${booking.id}:`, error);
    return false;
  }
};

const sendCancellationEmails = async (booking: any) => {
  const customerEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .button { background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Reservation Expired</h1>
          <p>VZ Entertainment DJ Services</p>
        </div>
        <div class="content">
          <p>Hi ${booking.customer_name},</p>
          <p>We're sorry to inform you that your reservation for <strong>${formatDateDisplay(booking.event_date)}</strong> has expired due to non-payment within the 72-hour hold period.</p>
          
          <div class="details">
            <h3>Expired Reservation Details</h3>
            <p><strong>Event Date:</strong> ${formatDateDisplay(booking.event_date)}</p>
            <p><strong>Time:</strong> ${formatTimeDisplay(booking.start_time)} - ${formatTimeDisplay(booking.end_time)}</p>
            <p><strong>Venue:</strong> ${booking.venue_name}</p>
            <p><strong>Package:</strong> ${booking.service_tier}</p>
          </div>
          
          <p>The date is now available for other customers to book.</p>
          
          <h3>Want to Rebook?</h3>
          <p>If you'd still like to book with VZ Entertainment, you have two options:</p>
          <ul>
            <li><strong>Visit our website</strong> to check availability and submit a new booking request</li>
            <li><strong>Contact us directly</strong> to discuss rebooking options</li>
          </ul>
          
          <div class="cta">
            <a href="https://vzentertainment.fun/booking" class="button">Book Again</a>
          </div>
          
          <p>We hope to have the opportunity to make your event memorable!</p>
          
          <div class="footer">
            <p>Questions? Reply to this email or visit vzentertainment.fun</p>
            <p>© ${new Date().getFullYear()} VZ Entertainment. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const businessEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status { background: #fecaca; color: #991b1b; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Hold Expired</h1>
          <span class="status">❌ Cancelled - No Payment</span>
        </div>
        <div class="content">
          <p>A booking hold has expired due to non-payment. The date is now available.</p>
          
          <div class="details">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${booking.customer_name}</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
            <p><strong>Phone:</strong> ${booking.customer_phone}</p>
          </div>
          
          <div class="details">
            <h3>Event Details</h3>
            <p><strong>Date:</strong> ${formatDateDisplay(booking.event_date)}</p>
            <p><strong>Time:</strong> ${formatTimeDisplay(booking.start_time)} - ${formatTimeDisplay(booking.end_time)}</p>
            <p><strong>Venue:</strong> ${booking.venue_name}</p>
            <p><strong>Package:</strong> ${booking.service_tier}</p>
            <p><strong>Total:</strong> $${booking.total_amount}</p>
          </div>
          
          <p><strong>Date ${formatDateDisplay(booking.event_date)} is now available for new bookings.</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "VZ Entertainment <onboarding@resend.dev>",
      to: [booking.customer_email],
      subject: `❌ Reservation Expired - ${formatDateDisplay(booking.event_date)}`,
      html: customerEmailHtml,
    });

    await resend.emails.send({
      from: "VZ Entertainment <onboarding@resend.dev>",
      to: [BUSINESS_EMAIL],
      subject: `Hold Expired: ${booking.customer_name} - ${formatDateDisplay(booking.event_date)}`,
      html: businessEmailHtml,
    });

    console.log(`Cancellation emails sent for booking ${booking.id}`);
    return true;
  } catch (error) {
    console.error(`Error sending cancellation emails for booking ${booking.id}:`, error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for expired booking holds and sending reminders...");

    // Calculate time windows
    const seventyTwoHoursAgo = new Date();
    seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);
    
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // STEP 1: Send 24-hour reminders (bookings 48-72 hours old that haven't received reminder)
    const { data: reminderBookings, error: reminderFetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .is("reminder_sent_at", null)
      .lt("created_at", fortyEightHoursAgo.toISOString())
      .gte("created_at", seventyTwoHoursAgo.toISOString());

    if (reminderFetchError) {
      console.error("Error fetching bookings for reminders:", reminderFetchError);
    } else if (reminderBookings && reminderBookings.length > 0) {
      console.log(`Found ${reminderBookings.length} booking(s) needing 24-hour reminder`);
      
      for (const booking of reminderBookings) {
        const sent = await send24HourReminderEmail(booking);
        if (sent) {
          await supabase
            .from("bookings")
            .update({ reminder_sent_at: new Date().toISOString() })
            .eq("id", booking.id);
        }
      }
    } else {
      console.log("No bookings need 24-hour reminders");
    }

    // STEP 2: Find and expire bookings older than 72 hours
    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", seventyTwoHoursAgo.toISOString());

    if (fetchError) {
      console.error("Error fetching expired bookings:", fetchError);
      throw fetchError;
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      console.log("No expired bookings found");
      return new Response(
        JSON.stringify({ 
          message: "No expired bookings found", 
          reminders_sent: reminderBookings?.length || 0,
          expired_count: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${expiredBookings.length} expired booking(s)`);

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

        // Update Google Calendar event if it exists
        let calendarUpdated = false;
        if (booking.google_calendar_event_id) {
          calendarUpdated = await updateCalendarEventAsCancelled(
            booking.google_calendar_event_id, 
            booking
          );
        }

        // Send cancellation emails
        const emailsSent = await sendCancellationEmails(booking);

        results.push({
          booking_id: booking.id,
          success: true,
          event_date: booking.event_date,
          customer_name: booking.customer_name,
          status: 'expired',
          emails_sent: emailsSent,
          calendar_updated: calendarUpdated,
        });

        console.log(`Booking ${booking.id} expired successfully`);
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({
          booking_id: booking.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${expiredBookings.length} expired booking(s)`,
        reminders_sent: reminderBookings?.length || 0,
        expired_count: expiredBookings.length,
        results: results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-expired-holds:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
