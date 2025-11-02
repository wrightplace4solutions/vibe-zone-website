// Manual Calendar Sync Function
// Use this to sync a specific booking to Google Calendar
// Useful for bookings made before calendar integration was working

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Google Calendar configuration
const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CALENDAR_CLIENT_ID") || "";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CALENDAR_CLIENT_SECRET") || "";
const GOOGLE_REFRESH_TOKEN = Deno.env.get("GOOGLE_CALENDAR_REFRESH_TOKEN") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
Confirmed: ${booking.confirmed_at || "Manually synced"}

Notes: ${booking.notes || "None"}
`.trim();

  const calendarEvent = {
    summary: `Vibe Zone Entertainment - ${booking.event_type}`,
    description: description,
    location: location,
    start: {
      dateTime: startDateTime,
      timeZone: "America/New_York",
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error("bookingId is required");
    }

    console.log("Syncing booking to calendar:", bookingId);

    // Get the booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError) {
      console.error("Error fetching booking:", fetchError);
      throw new Error(`Failed to fetch booking: ${fetchError.message}`);
    }

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check if already synced
    if (booking.google_calendar_event_id) {
      console.log("Booking already has calendar event:", booking.google_calendar_event_id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Booking already synced to calendar",
          eventId: booking.google_calendar_event_id 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create Google Calendar event
    const calendarEventId = await createCalendarEvent(booking);

    // Update booking with calendar event ID
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ google_calendar_event_id: calendarEventId })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error storing calendar event ID:", updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    console.log("Calendar event created and linked to booking:", calendarEventId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Booking synced to Google Calendar successfully",
        eventId: calendarEventId,
        bookingId: booking.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error syncing booking to calendar:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
