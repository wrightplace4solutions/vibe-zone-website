// @ts-nocheck - Edge function executed in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_ATTEMPTS = 3;

const PACKAGES = {
  essentialVibe: { name: "Essential Vibe", basePrice: 495 },
  premiumExperience: { name: "Premium Experience", basePrice: 695 },
  vzPartyStarter: { name: "VZ Party Starter", basePrice: 1095 },
  ultimateExperience: { name: "Ultimate Entertainment Experience", basePrice: 1495 },
};

const ADD_ON_PRICING = new Map([
  ["Basic Lighting Package", 125],
  ["Premium Lighting Upgrade", 275],
  ["Large Venue (200-300+ guests)", 200],
  ["Extra Hour", 125],
]);

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
}

interface EventDetails {
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface RequestBody {
  packageType: string;
  selectedAddOns?: string[];
  customer?: CustomerDetails;
  event?: EventDetails;
  notes?: string;
  honeypot?: string;
}

const hashIdentifier = async (value: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const getClientIp = (headers: Headers) => {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }
  return headers.get("cf-connecting-ip") || headers.get("x-real-ip") || null;
};

const sanitizeAddOns = (selectedAddOns?: string[]) => {
  if (!Array.isArray(selectedAddOns)) return [];
  return selectedAddOns.filter((name) => ADD_ON_PRICING.has(name));
};

const sendError = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: RequestBody = await req.json();

    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      return sendError("Suspicious submission.", 400);
    }

    const customer = payload.customer;
    const eventDetails = payload.event;
    const packageConfig = PACKAGES[payload.packageType];

    if (!customer || !eventDetails || !packageConfig) {
      return sendError("Missing booking details.");
    }

    const normalizedEmail = (customer.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return sendError("Email is required.");
    }

    if (!customer.name || !customer.phone) {
      return sendError("Name and phone are required.");
    }

    if (!eventDetails.date || !eventDetails.startTime || !eventDetails.endTime) {
      return sendError("Event date and times are required.");
    }

    const ipAddress = getClientIp(req.headers);
    let ipHash: string | null = null;
    if (ipAddress) {
      const fingerprintSource = `${ipAddress}:${req.headers.get("user-agent") || ""}`;
      ipHash = await hashIdentifier(fingerprintSource);
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();

    const { count: emailCount, error: emailCountError } = await supabase
      .from("booking_rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("email", normalizedEmail)
      .gte("created_at", windowStart);

    if (emailCountError) {
      console.error("Rate limit lookup failed", emailCountError);
      return sendError("Unable to verify request. Please try again shortly.", 503);
    }

    if ((emailCount || 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
      return sendError("Too many requests. Please try again later.", 429);
    }

    let ipCount = 0;
    if (ipHash) {
      const { count, error } = await supabase
        .from("booking_rate_limits")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", windowStart);

      if (error) {
        console.error("IP rate limit lookup failed", error);
        return sendError("Unable to verify request. Please try again shortly.", 503);
      }
      ipCount = count || 0;
      if (ipCount >= RATE_LIMIT_MAX_ATTEMPTS) {
        return sendError("Too many requests from this device. Please wait before trying again.", 429);
      }
    }

    const addOns = sanitizeAddOns(payload.selectedAddOns);
    const addOnsTotal = addOns.reduce((sum, name) => sum + (ADD_ON_PRICING.get(name) || 0), 0);
    const totalAmount = packageConfig.basePrice + addOnsTotal;
    const depositAmount = Math.round(totalAmount * 0.5);
    const addOnSummary = addOns.length > 0 ? addOns.join(", ") : "None";
    const sanitizedNotes = (payload.notes || "").trim();
    const notes = `${sanitizedNotes}

Selected Add-ons: ${addOnSummary}`.trim();

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_name: customer.name,
        customer_email: normalizedEmail,
        customer_phone: customer.phone,
        event_date: eventDetails.date,
        start_time: eventDetails.startTime,
        end_time: eventDetails.endTime,
        venue_name: eventDetails.venueName,
        street_address: eventDetails.streetAddress,
        city: eventDetails.city,
        state: eventDetails.state,
        zip_code: eventDetails.zipCode,
        package_type: payload.packageType,
        service_tier: packageConfig.name,
        event_type: "DJ Service",
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        status: "pending",
        notes,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking insert failed", bookingError);
      return sendError("Unable to save booking. Please try again.", 500);
    }

    await supabase
      .from("booking_rate_limits")
      .insert({ email: normalizedEmail, ip_hash: ipHash });

    const attemptsUsed = Math.max(emailCount || 0, ipCount) + 1;
    const attemptsRemaining = Math.max(RATE_LIMIT_MAX_ATTEMPTS - attemptsUsed, 0);

    return new Response(
      JSON.stringify({
        booking,
        rateLimit: {
          windowMinutes: RATE_LIMIT_WINDOW_MINUTES,
          maxAttempts: RATE_LIMIT_MAX_ATTEMPTS,
          attemptsRemaining,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (error) {
    console.error("create-booking-hold error", error);
    const message = error?.message || "Unexpected error";
    return sendError(message, error?.status || 400);
  }
});
