import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const systemPrompt = `You are a friendly DJ service assistant for Vibe Zone Entertainment. Your job is to help customers get price quotes and book DJ services.

**OUR SERVICES - 3 TIERS:**

🎧 **BASIC PACKAGE - $500**
- 4 hours of professional DJ services
- Basic sound system and lighting
- Line dance and trail ride music specialty
- Perfect for small gatherings and private parties

🎵 **PREMIUM PACKAGE - $850**
- 6 hours of professional DJ services
- Premium sound system and enhanced lighting
- Line dance and trail ride music specialty
- Vibe Que Interactive DJ App access for guests
- MC services and announcements
- Great for weddings, birthdays, and events

💎 **ELITE PACKAGE - $1,500**
- 8 hours of professional DJ services
- Professional grade sound system and full lighting setup
- Line dance and trail ride music specialty
- Full Vibe Que Interactive DJ App integration
- Professional MC and crowd interaction
- Custom playlist creation and consultation
- Perfect for large events, corporate functions, and festivals

**ADDITIONAL SERVICES:**
- Extra hours: $150/hour
- Travel beyond 30 miles: $50 per additional 30 miles
- Special equipment rentals available

**BOOKING PROCESS:**
1. Discuss event details and recommend appropriate package
2. Check availability for their desired date
3. Explain deposit requirement: 50% deposit to secure the date
4. Provide payment information
5. Send confirmation once deposit is received

**IMPORTANT GUIDELINES:**
- Always be enthusiastic and use #LETSWORK when appropriate
- Ask about event type, guest count, venue, and date
- Mention our line dance and trail ride music specialty
- Highlight the Vibe Que Interactive DJ App features (Premium and Elite packages)
- Be friendly, professional, and helpful
- If asked about availability, suggest they check specific dates
- When they're ready to book, explain the deposit process clearly

Keep responses conversational and helpful. Get excited about their event!`;

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
