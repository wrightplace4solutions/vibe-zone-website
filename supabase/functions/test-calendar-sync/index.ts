// Test Calendar Sync Function - No Auth Required
// Creates or updates events on Google Calendar

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

// Build calendar event object from booking
function buildCalendarEvent(booking: any, isPending: boolean) {
  const eventDate = booking.event_date;
  const startTime = booking.start_time || "18:00";
  const endTime = booking.end_time || "22:00";

  const startDateTime = `${eventDate}T${startTime}:00`;
  const endDateTime = `${eventDate}T${endTime}:00`;

  const locationParts = [
    booking.venue_name,
    booking.street_address,
    booking.city,
    booking.state,
    booking.zip_code
  ].filter(Boolean);
  const location = locationParts.join(", ") || "TBD";

  const statusPrefix = isPending ? "[PENDING DEPOSIT] " : "[CONFIRMED] ";

  const description = `
Vibe Zone Entertainment Booking

Status: ${isPending ? "⏳ PENDING - Awaiting Deposit Payment" : "✅ CONFIRMED - Deposit Paid"}
${isPending ? "⚠️ 72-Hour Hold Policy: Deposit must be received within 72 hours or booking will be auto-cancelled." : "💰 Deposit has been received."}

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

Notes: ${booking.notes || "None"}
`.trim();

  return {
    summary: `${statusPrefix}Vibe Zone - ${booking.event_type} (${booking.customer_name})`,
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
    colorId: isPending ? "6" : "10", // Orange for pending, green for confirmed
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 48 * 60 },
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 60 },
      ],
    },
  };
}

// Function to create Google Calendar event
async function createCalendarEvent(booking: any, isPending: boolean = false): Promise<string> {
  console.log("Creating calendar event for booking:", booking.id);
  
  const accessToken = await getGoogleAccessToken();
  const calendarEvent = buildCalendarEvent(booking, isPending);

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
  
  return event.id;
}

// Function to update existing Google Calendar event
async function updateCalendarEvent(eventId: string, booking: any, isPending: boolean = false): Promise<string> {
  console.log("Updating calendar event:", eventId, "for booking:", booking.id);
  
  const accessToken = await getGoogleAccessToken();
  const calendarEvent = buildCalendarEvent(booking, isPending);

  console.log("Updating event on Google Calendar API...");

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
    const error = await response.text();
    console.error("Failed to update calendar event:", error);
    throw new Error(`Failed to update calendar event: ${error}`);
  }

  const event = await response.json();
  console.log("Calendar event updated successfully:", event.id);
  
  return event.id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, createTestEvent, forceUpdate } = await req.json();

    // Option 1: Create a test event directly (for testing)
    if (createTestEvent) {
      console.log("Creating test calendar event...");
      
      const testBooking = {
        id: "test-" + Date.now(),
        customer_name: "Test Customer - Calendar Sync",
        customer_email: "dcn8tve2@yahoo.com",
        customer_phone: "(555) 123-4567",
        event_date: "2025-02-15",
        start_time: "18:00",
        end_time: "22:00",
        event_type: "Birthday Party",
        service_tier: "Premium",
        package_type: "Full Service",
        venue_name: "Test Venue",
        street_address: "123 Test Street",
        city: "Atlanta",
        state: "GA",
        zip_code: "30301",
        total_amount: 500,
        deposit_amount: 150,
        notes: "This is a TEST EVENT to verify Google Calendar integration is working correctly.",
        created_at: new Date().toISOString(),
      };

      const eventId = await createCalendarEvent(testBooking, true);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Test event created on Google Calendar!",
          eventId: eventId,
          testBooking: testBooking
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Option 2: Sync an existing booking
    if (!bookingId) {
      throw new Error("bookingId is required (or set createTestEvent: true)");
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

    // Determine if booking is pending (not confirmed)
    const isPending = booking.status !== "confirmed";
    console.log("Booking status:", booking.status, "isPending:", isPending);

    // Check if already synced - if so, UPDATE the existing event
    if (booking.google_calendar_event_id) {
      console.log("Booking has existing calendar event, updating:", booking.google_calendar_event_id);
      
      const eventId = await updateCalendarEvent(
        booking.google_calendar_event_id, 
        booking, 
        isPending
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Calendar event UPDATED - Status: ${isPending ? "PENDING" : "CONFIRMED"}`,
          eventId: eventId,
          bookingId: booking.id,
          status: booking.status,
          updated: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create new Google Calendar event
    const calendarEventId = await createCalendarEvent(booking, isPending);

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
        message: `Calendar event CREATED - Status: ${isPending ? "PENDING" : "CONFIRMED"}`,
        eventId: calendarEventId,
        bookingId: booking.id,
        status: booking.status,
        created: true
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
