// @ts-nocheck - This is a Deno Edge Function, not a Node.js/TypeScript file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-10-28.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  packageType: "option1" | "option2";
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventDetails: {
    venueName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    startTime: string;
    endTime: string;
  };
  notes?: string;
}

const PACKAGES = {
  option1: {
    name: "Plug-and-Play",
    deposit: 100,
    description: "Essential DJ setup - bring your vibe, we bring the sound",
  },
  option2: {
    name: "Full Setup + Rentals Fees",
    deposit: 150,
    description: "Complete setup of DJ area, sound system (PA), including rental equipment",
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { packageType, customerEmail, customerName, customerPhone, eventDate, eventDetails, notes }: RequestBody =
      await req.json();

    const selectedPackage = PACKAGES[packageType];
    const origin = req.headers.get("origin") || "https://vzentertainment.fun";

    // Create booking record in database first
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        event_date: eventDate,
        start_time: eventDetails.startTime,
        end_time: eventDetails.endTime,
        venue_name: eventDetails.venueName,
        street_address: eventDetails.streetAddress,
        city: eventDetails.city,
        state: eventDetails.state,
        zip_code: eventDetails.zipCode,
        package_type: packageType,
        event_type: "DJ Service",
        service_tier: selectedPackage.name,
        status: "pending",
        deposit_amount: selectedPackage.deposit,
        total_amount: selectedPackage.deposit,
        notes: notes || "",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      throw new Error("Failed to create booking");
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${selectedPackage.name} - Event Deposit`,
              description: `${selectedPackage.description}\n\nEvent Date: ${eventDate}\nVenue: ${eventDetails.venueName}\nTime: ${eventDetails.startTime} - ${eventDetails.endTime}`,
            },
            unit_amount: selectedPackage.deposit * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: customerEmail,
      client_reference_id: packageType,
      metadata: {
        bookingId: booking.id,
        customerName,
        packageType,
        eventDate,
        venueName: eventDetails.venueName,
        startTime: eventDetails.startTime,
        endTime: eventDetails.endTime,
      },
      success_url: `${origin}/booking?session_id={CHECKOUT_SESSION_ID}&payment_status=success&booking_id=${booking.id}`,
      cancel_url: `${origin}/booking?payment_status=cancelled&booking_id=${booking.id}`,
    });

    // Update booking with Stripe session ID
    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
