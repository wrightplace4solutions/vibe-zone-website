import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { date } = await req.json();
    
    if (!date) {
      return new Response(
        JSON.stringify({ error: "Date is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if date is already booked or held
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, status, event_date")
      .eq("event_date", date)
      .in("status", ["confirmed", "pending"]);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    const isAvailable = !bookings || bookings.length === 0;

    return new Response(
      JSON.stringify({
        available: isAvailable,
        date,
        bookings: bookings || [],
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error checking availability:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
