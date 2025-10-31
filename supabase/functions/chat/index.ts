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

**OUR SERVICES - 2 PACKAGES:**

🎧 **PLUG & PLAY PACKAGE - $550**
- 4 hours of professional DJ services
- You provide the sound system (PA), we bring the skills and music
- Line dance and trail ride music specialty
- Perfect for venues with existing equipment
- Event types: Birthday parties, small gatherings, fundraisers, corporate events, trail rides

🎵 **FULL SETUP PACKAGE - $950**
- 4-5 hours of professional DJ services
- Complete DJ area setup with our professional sound system (PA)
- Line dance and trail ride music specialty
- All equipment included - you provide nothing but the venue
- Vibe Que Interactive DJ App access for guests
- Event types: Weddings, birthday parties, corporate events, fundraisers, indoor events

**ADD-ONS & EXTRAS:**
- Basic Lighting Package: $100-$150
- Premium Lighting Package: $200-$300
- Large Venue (100-300+ guests): +$150-$250
- Travel over 30 miles: $0.67 per mile (standard state rate)
- Extra hours: $150/hour

**SPECIAL DISCOUNTS:**
- 10% discount for first-time clients
- 15% discount for returning clients
(Apply ONE discount per booking)

**BOOKING PROCESS:**
1. Discuss event details (type, date, guest count, location, venue size)
2. Calculate pricing based on package + any add-ons + travel distance
3. Check date availability - if date is available, guide them to booking page at vzentertainment.fun/booking
4. Explain: 50% deposit required to secure the date
5. For special requests, they can call or email directly

**PRICING CALCULATION EXAMPLES:**
- Birthday party (75 guests, 25 miles away, plug & play) = $550 base
- Wedding (150 guests, 40 miles away, full setup, premium lighting) = $950 + $250 (large venue) + $300 (lighting) + $7 travel = $1,507 (before discount)
- Corporate event (200 guests, 50 miles away, full setup, basic lighting) = $950 + $200 (large venue) + $125 (lighting) + $13 travel = $1,288 (before discount)

**IMPORTANT GUIDELINES:**
- Always be enthusiastic and use #LETSWORK when appropriate
- Ask about: event type, date, guest count, venue location, expected crowd size
- Mention our line dance and trail ride music specialty
- Calculate travel fees for distances over 30 miles ($0.67/mile)
- Check if they're a first-time or returning client for discount
- When they provide a date, availability will be checked automatically
- Guide them to the booking page at vzentertainment.fun/booking once they're ready
- For special equipment or unique requests, suggest calling or emailing
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
