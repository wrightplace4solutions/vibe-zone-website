// @ts-nocheck - Edge Functions run in Deno and rely on runtime provided globals
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BookingStatusRequest {
  bookingId?: string;
  sessionId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, sessionId }: BookingStatusRequest = await req.json();

    if (!bookingId || !sessionId) {
      return new Response(
        JSON.stringify({ error: "bookingId and sessionId are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id, status, customer_name, customer_email, event_date, event_type, venue_name, start_time, end_time, city, state, street_address, zip_code, notes, deposit_amount, total_amount",
      )
      .eq("id", bookingId)
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("get-booking-status: error fetching booking", error);
      return new Response(
        JSON.stringify({ error: "Unable to look up booking" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
      );
    }

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "No booking found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 },
      );
    }

    return new Response(
      JSON.stringify({ booking }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("get-booking-status: unexpected error", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
