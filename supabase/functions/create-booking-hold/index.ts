// @ts-nocheck - Edge function executed in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://esm.sh/zod@3.22.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const BUSINESS_EMAIL = "dcn8tve2@yahoo.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_ATTEMPTS = 3;

const PACKAGES = {
  essentialVibe: { name: "Essential Vibe", basePrice: 450 },
  premiumExperience: { name: "Premium Experience", basePrice: 650 },
  vzPartyStarter: { name: "VZ Party Starter", basePrice: 875 },
  ultimateExperience: { name: "Ultimate Entertainment Experience", basePrice: 1150 },
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

const sendHoldEmails = async (booking: any, packageName: string) => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 72);
  const expirationStr = expirationDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

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
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .cta { text-align: center; margin: 30px 0; }
        .button { background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 Your Date is Reserved!</h1>
          <p>VZ Entertainment DJ Services</p>
        </div>
        <div class="content">
          <p>Hi ${booking.customer_name},</p>
          <p>Great news! We've reserved <strong>${formatDateDisplay(booking.event_date)}</strong> for your event. Your reservation is being held for the next <strong>72 hours</strong>.</p>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This reservation will expire on <strong>${expirationStr}</strong> if payment is not received. Complete your deposit payment to confirm your booking.
          </div>
          
          <div class="details">
            <h3>Reservation Details</h3>
            <div class="detail-row"><span>Event Date:</span><strong>${formatDateDisplay(booking.event_date)}</strong></div>
            <div class="detail-row"><span>Time:</span><strong>${formatTimeDisplay(booking.start_time)} - ${formatTimeDisplay(booking.end_time)}</strong></div>
            <div class="detail-row"><span>Venue:</span><strong>${booking.venue_name}</strong></div>
            <div class="detail-row"><span>Address:</span><strong>${booking.street_address}, ${booking.city}, ${booking.state} ${booking.zip_code}</strong></div>
            <div class="detail-row"><span>Package:</span><strong>${packageName}</strong></div>
            <div class="detail-row"><span>Total:</span><strong>$${booking.total_amount}</strong></div>
            <div class="detail-row"><span>Deposit Due:</span><strong>$${booking.deposit_amount}</strong></div>
          </div>
          
          <p>Once your deposit is received, your event will be automatically added to our calendar and you'll receive a confirmation email.</p>
          
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
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status { background: #fef3c7; color: #92400e; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Booking Hold</h1>
          <span class="status">⏳ Awaiting Payment</span>
        </div>
        <div class="content">
          <p>A new reservation has been submitted and is awaiting payment.</p>
          
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
            <p><strong>Address:</strong> ${booking.street_address}, ${booking.city}, ${booking.state} ${booking.zip_code}</p>
            <p><strong>Package:</strong> ${packageName}</p>
            <p><strong>Total:</strong> $${booking.total_amount}</p>
            <p><strong>Deposit:</strong> $${booking.deposit_amount}</p>
            ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
          </div>
          
          <p><strong>Expires:</strong> ${expirationStr}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    // Send to customer
    await resend.emails.send({
      from: "VZ Entertainment <onboarding@resend.dev>",
      to: [booking.customer_email],
      subject: `🎵 Your Date is Reserved - ${formatDateDisplay(booking.event_date)}`,
      html: customerEmailHtml,
    });

    // Send to business
    await resend.emails.send({
      from: "VZ Entertainment <onboarding@resend.dev>",
      to: [BUSINESS_EMAIL],
      subject: `New Hold: ${booking.customer_name} - ${formatDateDisplay(booking.event_date)}`,
      html: businessEmailHtml,
    });

    console.log("Hold confirmation emails sent successfully");
  } catch (error) {
    console.error("Error sending hold emails:", error);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    const rawPayload = await req.json();
    
    // Validate with Zod
    const validationResult = requestSchema.safeParse(rawPayload);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return sendError(firstError.message, 400);
    }
    
    const payload = validationResult.data;

    // Honeypot check
    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      return sendError("Suspicious submission.", 400);
    }

    // Note: Events can span midnight (e.g., 10:00 PM to 1:00 AM next day)
    // Both start and end times are validated by schema, no comparison needed

    const customer = payload.customer;
    const eventDetails = payload.event;
    const packageConfig = PACKAGES[payload.packageType];

    if (!packageConfig) {
      return sendError("Invalid package type.");
    }

    const normalizedEmail = customer.email; // Already lowercased by schema

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

    // Check date availability
    const { data: existingBookings, error: availabilityError } = await supabase
      .from("bookings")
      .select("id")
      .eq("event_date", eventDetails.date)
      .in("status", ["pending", "confirmed"])
      .limit(1);

    if (availabilityError) {
      console.error("Availability check failed", availabilityError);
      return sendError("Unable to verify date availability. Please try again.", 503);
    }

    if (existingBookings && existingBookings.length > 0) {
      return sendError("This date is already booked. Please select another date.", 409);
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

    // Send hold confirmation emails (fire and forget, don't block response)
    sendHoldEmails(booking, packageConfig.name).catch((err) => {
      console.error("Failed to send hold emails:", err);
    });

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
    
    // Handle Zod validation errors specifically
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return sendError(firstError.message, 400);
    }
    
    const message = error?.message || "Unexpected error";
    return sendError(message, error?.status || 400);
  }
});
