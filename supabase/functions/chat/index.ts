import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Initialize Supabase client for checking availability
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user is asking about availability
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let availabilityInfo = "";
    
    if (lastMessage.includes("available") || lastMessage.includes("availability") || /\d{4}-\d{2}-\d{2}/.test(lastMessage)) {
      // Extract date if present
      const dateMatch = lastMessage.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) {
        const requestedDate = dateMatch[0];
        const { data: bookings } = await supabase
          .from("bookings")
          .select("event_date, status")
          .eq("event_date", requestedDate)
          .in("status", ["confirmed", "pending"]);

        if (bookings && bookings.length > 0) {
          availabilityInfo = `\n\nIMPORTANT: ${requestedDate} is NOT available (already booked).`;
        } else {
          availabilityInfo = `\n\nGREAT NEWS: ${requestedDate} is AVAILABLE! `;
        }
      }
    }

    const systemPrompt = `You are a friendly DJ service assistant for Vibe Zone Entertainment. Your job is to help customers get price quotes, check availability, and guide them to book DJ services.

**OUR DJ SERVICES - 4 PACKAGES:**

🎧 **PLUG-AND-PLAY OPTIONS** (Customer Provides Sound System):

1️⃣ **Essential Vibe - $495** (3 hours)
   - 1 Wireless microphone included
   - 15-minute pre-event music consultation call
   - Line dance and trail ride music specialty
   - Deposit: $250
   - Best for: Intimate gatherings at venues, small corporate events, church gatherings (up to 50 guests)

2️⃣ **Premium Experience - $695** (5 hours)
   - 1 Wireless microphone included
   - Dedicated planning session (virtually or in-person)
   - Line dance and trail ride music specialty
   - Deposit: $350
   - Best for: Medium-sized events at various venues, longer celebrations, church events (50-100 guests)

🎵 **COMPLETE ENTERTAINMENT SETUPS** (DJ Provides Full Equipment):

3️⃣ **VZ Party Starter - $1,095** (4 hours)
   - Professional sound system (PA) + DJ equipment included
   - 2 Wireless microphones included
   - Dedicated planning session (virtually or in-person)
   - Line dance and trail ride music specialty
   - Vibe Que Interactive DJ App access for guests
   - Deposit: $550
   - Best for: Weddings, corporate events at larger venues, milestone celebrations, church programs (75-150 guests)

4️⃣ **Ultimate Entertainment Experience - $1,495** (6 hours)
   - Professional sound system (PA) + DJ equipment included
   - 2 Wireless microphones included
   - Dedicated planning session (virtually or in-person)
   - Line dance and trail ride music specialty
   - Vibe Que Interactive DJ App access for guests
   - Deposit: $750
   - Best for: Large weddings, galas, all-day venue events, major church celebrations (150-200+ guests)

**ADD-ONS & EXTRAS:**
- Basic Lighting Package: $125
- Premium Lighting Upgrade: $275
- Large Venue (200-300+ guests): +$200
- Extra Hour: $125/hour
- Travel over 30 miles: $0.67 per mile (standard state rate)

**IMPORTANT PACKAGE DETAILS:**
✓ All packages include dedicated planning sessions (virtually or in-person)
✓ DJ will request prior access to venue for brief walk-through
✓ DJ requires 1-hour setup access prior to event start time
⚠️ Pricing subject to change based on client's individual needs
💬 Contact us for customized pricing options

**BOOKING PROCESS:**
1. Discuss event details (type, date, guest count, location, venue size)
2. Help customer choose the right package based on their needs
3. Explain that add-ons can be selected during checkout (they'll see real-time pricing updates)
4. Calculate approximate total: base package + add-ons + travel distance
5. Explain: 50% deposit required to secure the date (calculated automatically with add-ons)
6. Check date availability - if available, guide them to:
   - Pricing page: vzentertainment.fun/pricing (to view all details)
   - Booking page: vzentertainment.fun/booking (to complete booking)
7. For custom requests or special pricing needs, direct them to vzentertainment.fun/contact

**PRICING CALCULATION EXAMPLES:**
- Small church gathering (40 guests, Essential Vibe) = $495 base | Deposit: $250
- Birthday party (80 guests, VZ Party Starter + basic lighting) = $1,095 + $125 = $1,220 total | Deposit: $610
- Wedding (180 guests, Ultimate Experience + premium lighting + large venue) = $1,495 + $275 + $200 = $1,970 total | Deposit: $985
- Corporate event (250 guests, 40 miles away, VZ Party Starter + premium lighting + large venue) = $1,095 + $275 + $200 + $7 travel = $1,577 total | Deposit: $789

**IMPORTANT GUIDELINES:**
- Always be enthusiastic and use #LETSWORK when appropriate
- Ask about: event type, date, guest count, venue location, expected crowd size
- Mention our line dance and trail ride music specialty
- Explain that customers can add/select add-ons during the booking checkout
- Explain that deposit amounts automatically adjust based on selected add-ons (50% of total)
- Calculate travel fees for distances over 30 miles ($0.67/mile)
- When they provide a date, availability will be checked automatically
- For custom pricing needs, direct them to the contact page
- Be friendly, professional, and helpful!

${availabilityInfo}

Keep responses conversational, provide accurate quotes, and get excited about their event!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
