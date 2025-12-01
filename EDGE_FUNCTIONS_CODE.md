# Edge Functions Code for Manual Deployment

## How to Deploy These Functions

Since Supabase CLI isn't working, you'll need to deploy these manually through the Supabase Dashboard.

### Go to: https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov/functions

---

## Function 1: stripe-webhook

**Function Name:** `stripe-webhook`

**Code to paste:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-10-28.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

---

## Testing Cron Guard

Use `curl` to verify the guard:

```bash
# Unauthorized (no header)
curl -i https://<project-ref>.functions.supabase.co/check-expired-holds

# Authorized with header
curl -i \
  -H "x-cron-secret: $CRON_SECRET" \
  https://<project-ref>.functions.supabase.co/check-expired-holds

# For send-reminders
curl -i \
  -H "x-cron-secret: $CRON_SECRET" \
  https://<project-ref>.functions.supabase.co/send-reminders
```

Replace `<project-ref>` with your Supabase project ref.

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Payment successful:", session.id);
        
        const metadata = session.metadata;
        const bookingId = metadata?.bookingId;
        
        if (bookingId) {
          // Get the booking details
          const { data: booking, error: fetchError } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", bookingId)
            .single();

          if (fetchError) {
            console.error("Error fetching booking:", fetchError);
          } else if (booking) {
            // Update booking status to confirmed
            const { error: updateError } = await supabase
              .from("bookings")
              .update({
                status: "confirmed",
                stripe_payment_intent: session.payment_intent as string,
                confirmed_at: new Date().toISOString(),
              })
              .eq("id", bookingId);
            
            if (updateError) {
              console.error("Error updating booking:", updateError);
            } else {
              console.log("Booking confirmed:", bookingId);
              
              // TODO: Add Google Calendar integration here using direct API
              // Use GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, 
              // and GOOGLE_CALENDAR_REFRESH_TOKEN from Supabase secrets
            }
          }
        } else {
          console.warn("No booking ID in session metadata");
        }
        
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);
        
        // Try to find and update the booking
        const { data: booking } = await supabase
          .from("bookings")
          .select("id")
          .eq("stripe_payment_intent", paymentIntent.id)
          .single();
        
        if (booking) {
          await supabase
            .from("bookings")
            .update({ status: "payment_failed" })
            .eq("id", booking.id);
        }
        
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

---

## Function 2: check-expired-holds

**Function Name:** `check-expired-holds`

**Code to paste:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const CRON_SECRET = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('x-cron-secret');
  if (CRON_SECRET && authHeader !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const CRON_SECRET = Deno.env.get('CRON_SECRET');
  const authHeader = req.headers.get('x-cron-secret');
  if (CRON_SECRET && authHeader !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    console.log("Checking for expired booking holds...");

    // Calculate 48 hours ago
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    // Find all pending bookings older than 48 hours
    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", fortyEightHoursAgo.toISOString());

    if (fetchError) {
      console.error("Error fetching expired bookings:", fetchError);
      throw fetchError;
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      console.log("No expired bookings found");
      return new Response(
        JSON.stringify({ message: "No expired bookings found", count: 0 }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Found ${expiredBookings.length} expired booking(s)`);

    // Process each expired booking
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

        // TODO: Send notification emails to both client and business owner
        // This would typically use a service like SendGrid, Resend, or AWS SES
        // For now, we'll just log the notification
        console.log(`Notification needed for expired booking ${booking.id}:`);
        console.log(`  - Client: ${booking.customer_name} (${booking.customer_email})`);
        console.log(`  - Event: ${booking.event_type} on ${booking.event_date}`);
        console.log(`  - Created: ${booking.created_at}`);

        // Here you would send emails:
        // await sendEmailToClient(booking);
        // await sendEmailToBusiness(booking);

        results.push({
          booking_id: booking.id,
          success: true,
          customer_email: booking.customer_email,
          event_date: booking.event_date,
        });
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        results.push({
          booking_id: booking.id,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${expiredBookings.length} expired booking(s)`,
        count: expiredBookings.length,
        results: results,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-expired-holds:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
```

---

## Function 3: create-booking-hold

**Function Name:** `create-booking-hold`

**Code to paste:**

```typescript
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
    const payload = await req.json();

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
```

---

## Notes

- These functions are already in your project files at:
  - `supabase/functions/stripe-webhook/index.ts`
  - `supabase/functions/check-expired-holds/index.ts`
  - `supabase/functions/create-booking-hold/index.ts`

- You're copying them here for manual deployment through the Supabase Dashboard

- After deploying, remember to set up the secrets as described in `SETUP_COMPLETE_GUIDE.md`
