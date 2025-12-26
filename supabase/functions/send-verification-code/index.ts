// @ts-nocheck - Edge function executed in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://esm.sh/zod@3.22.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: max 3 codes per email per 10 minutes
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_CODES = 3;

const requestSchema = z.object({
  email: z.string().email("Invalid email address").max(255).toLowerCase(),
});

const generateCode = (): string => {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawPayload = await req.json();
    const validationResult = requestSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(
        JSON.stringify({ error: firstError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email } = validationResult.data;

    // Rate limiting: check how many codes sent in last 10 minutes
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabase
      .from("email_verifications")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", windowStart);

    if (countError) {
      console.error("Rate limit check failed:", countError);
      return new Response(
        JSON.stringify({ error: "Unable to process request. Please try again." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if ((count || 0) >= RATE_LIMIT_MAX_CODES) {
      return new Response(
        JSON.stringify({ error: "Too many verification requests. Please wait 10 minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate and store verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: insertError } = await supabase
      .from("email_verifications")
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Failed to store verification code:", insertError);
      return new Response(
        JSON.stringify({ error: "Unable to send verification code. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send verification email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
          .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937; background: white; padding: 20px 30px; border-radius: 8px; margin: 20px 0; display: inline-block; border: 2px dashed #f59e0b; }
          .footer { color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Verify Your Email</h1>
            <p>VZ Entertainment DJ Services</p>
          </div>
          <div class="content">
            <p>Enter this code to verify your email and continue with your booking:</p>
            <div class="code">${code}</div>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p class="footer">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: "VZ Entertainment <onboarding@resend.dev>",
        to: [email],
        subject: "🔐 Your Verification Code - VZ Entertainment",
        html: emailHtml,
      });

      console.log(`Verification code sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return new Response(
        JSON.stringify({ error: "Unable to send verification email. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent to your email.",
        expiresIn: 600 // 10 minutes in seconds
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-verification-code error:", error);
    return new Response(
      JSON.stringify({ error: "Unexpected error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
