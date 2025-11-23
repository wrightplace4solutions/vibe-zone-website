// @ts-nocheck - Edge function executed in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Validation Schema
const customerSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\s\-.']+$/, "Invalid name format"),
  email: z.string()
    .trim()
    .email("Invalid email")
    .max(255, "Email too long")
    .toLowerCase(),
  phone: z.string()
    .trim()
    .min(10, "Phone too short")
    .max(15, "Phone too long")
    .regex(/^[\d\s\-()]+$/, "Invalid phone format"),
});

const eventSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, "Event date must be in the future"),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time"),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time"),
  venueName: z.string()
    .trim()
    .min(1, "Venue name required")
    .max(200, "Venue name too long"),
  streetAddress: z.string()
    .trim()
    .min(1, "Address required")
    .max(200, "Address too long"),
  city: z.string()
    .trim()
    .min(1, "City required")
    .max(100, "City too long")
    .regex(/^[a-zA-Z\s\-.']+$/, "Invalid city format"),
  state: z.string()
    .trim()
    .length(2, "State must be 2 characters")
    .regex(/^[A-Z]{2}$/, "Invalid state format"),
  zipCode: z.string()
    .trim()
    .regex(/^\d{5}$/, "ZIP must be 5 digits"),
});

const requestSchema = z.object({
  packageType: z.enum(["essentialVibe", "premiumExperience", "vzPartyStarter", "ultimateExperience"], {
    errorMap: () => ({ message: "Invalid package type" }),
  }),
  selectedAddOns: z.array(z.string()).optional().default([]),
  customer: customerSchema,
  event: eventSchema,
  notes: z.string().max(1000, "Notes too long").optional().default(""),
  honeypot: z.string().max(0, "Suspicious submission").optional().default(""),
});

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
    const rawPayload = await req.json();

    // Validate with Zod
    const validationResult = requestSchema.safeParse(rawPayload);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return sendError(firstError.message, 400);
    }

    const payload = validationResult.data;

    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      return sendError("Suspicious submission.", 400);
    }

    const customer = payload.customer;
    const eventDetails = payload.event;
    const packageConfig = PACKAGES[payload.packageType];

    const normalizedEmail = customer.email;

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
