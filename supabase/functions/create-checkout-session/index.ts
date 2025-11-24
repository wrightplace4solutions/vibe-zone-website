// @ts-nocheck - This is a Deno Edge Function, not a Node.js/TypeScript file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { z } from "https://esm.sh/zod@3.22.4";

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
  packageType: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventDetails?: {
    venueName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    startTime: string;
    endTime: string;
  };
  notes?: string;
  bookingId?: string;
}

const requestSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().max(100),
  customerPhone: z.string().regex(/^\d{10,15}$/),
  packageType: z.string(),
  eventDate: z.string(),
  eventDetails: z.object({
    venueName: z.string(),
    streetAddress: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  }).optional(),
  notes: z.string().optional(),
  bookingId: z.string().optional(),
});

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
  essentialVibe: {
    name: "Essential Vibe",
    deposit: 250,
    description: "Plug-and-play option when the client provides the system",
  },
  premiumExperience: {
    name: "Premium Experience",
    deposit: 350,
    description: "Extended plug-and-play coverage with planning support",
  },
  vzPartyStarter: {
    name: "VZ Party Starter",
    deposit: 550,
    description: "Full entertainment setup with professional sound and DJ gear",
  },
  ultimateExperience: {
    name: "Ultimate Entertainment Experience",
    deposit: 750,
    description: "Largest package for all-day or large venue productions",
  },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const validatedData = requestSchema.parse(rawData);
    
    const {
      packageType,
      customerEmail,
      customerName,
      customerPhone,
      eventDate,
      eventDetails,
      notes,
      bookingId,
    } = validatedData;

    let selectedPackage = PACKAGES[packageType as keyof typeof PACKAGES];
    const origin = req.headers.get("origin") || "https://vzentertainment.fun";
    let booking;

    if (bookingId) {
      const { data: existingBooking, error: existingBookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (existingBookingError || !existingBooking) {
        console.error("Existing booking lookup failed", existingBookingError);
        throw new Error("Booking not found");
      }

      booking = existingBooking;
      if (!selectedPackage && booking.package_type) {
        selectedPackage = PACKAGES[booking.package_type as keyof typeof PACKAGES];
      }
    } else {
      if (!eventDetails) {
        throw new Error("Event details are required");
      }
      if (!selectedPackage) {
        throw new Error("Invalid package selection");
      }

      const { data: insertedBooking, error: bookingError } = await supabase
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

      booking = insertedBooking;
    }

    const packageFromRecord = booking.package_type
      ? PACKAGES[booking.package_type as keyof typeof PACKAGES] || selectedPackage
      : selectedPackage;

    const depositAmount = booking.deposit_amount || packageFromRecord?.deposit;

    if (!depositAmount) {
      throw new Error("Missing deposit amount for booking");
    }

    const eventDateLabel = booking.event_date || eventDate;
    const venueLabel = booking.venue_name || eventDetails?.venueName || "TBD";
    const timeRange = [booking.start_time || eventDetails?.startTime, booking.end_time || eventDetails?.endTime]
      .filter(Boolean)
      .join(" - ");
    const descriptionParts = [
      packageFromRecord?.description,
      eventDateLabel ? `Event Date: ${eventDateLabel}` : null,
      venueLabel ? `Venue: ${venueLabel}` : null,
      timeRange ? `Time: ${timeRange}` : null,
    ].filter(Boolean);
    const productDescription = descriptionParts.join("\n");

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${booking.service_tier || packageFromRecord?.name || "DJ Package"} - Event Deposit`,
              description: productDescription,
            },
            unit_amount: Math.round(depositAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: booking.customer_email || customerEmail,
      billing_address_collection: "auto",
      customer_creation: "always",
      phone_number_collection: {
        enabled: false,
      },
      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
        customerName: booking.customer_name || customerName,
        packageType: booking.package_type || packageType,
        eventDate: eventDateLabel,
        venueName: venueLabel,
        startTime: booking.start_time || eventDetails?.startTime || "",
        endTime: booking.end_time || eventDetails?.endTime || "",
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
