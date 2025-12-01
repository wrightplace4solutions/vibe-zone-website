// @ts-nocheck
// This edge function runs on Deno in Supabase. VS Code's default TypeScript
// checker (configured for the Vite/Node project) doesn't understand Deno URL
// imports or the global `Deno` type. The directive above disables TS checking
// for this file in the editor while keeping deploys working via the Supabase CLI.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// SMTP / Email environment variables (Zoho or other provider)
const SMTP_HOST = Deno.env.get("SMTP_HOST");
const SMTP_PORT = Deno.env.get("SMTP_PORT"); // string, will parse to number
const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || SMTP_USER; // fallback
const EMAIL_REPLY_TO = Deno.env.get("EMAIL_REPLY_TO") || EMAIL_FROM;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmail {
  to: string;
  subject: string;
  html: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get pending reminders that are due
    const { data: reminders, error: fetchError } = await supabase
      .from("reminders")
      .select(`
        id,
        reminder_type,
        booking_id,
        bookings (
          id,
          event_date,
          start_time,
          end_time,
          event_type,
          customer_email,
          customer_name,
          venue_name,
          street_address,
          city,
          state,
          zip_code,
          package_type,
          notes
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error("Reminders fetch error", fetchError);
      return new Response(
        JSON.stringify({
          debug: true,
          stage: "fetch_reminders",
          error: fetchError.message,
          details: fetchError
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<Record<string, unknown>> = [];

    for (const reminder of reminders) {
      try {
        const booking = reminder.bookings as any;
        const email = booking?.customer_email;

        if (!email) {
          await supabase
            .from("reminders")
            .update({ 
              status: "failed", 
              error_message: "No email address found" 
            })
            .eq("id", reminder.id);
          continue;
        }

        const emailContent = generateEmailContent(
          reminder.reminder_type,
          booking
        );

        let sendStatus: 'sent' | 'skipped' | 'failed' = 'sent';
        let errorMessage: string | null = null;

        if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD && EMAIL_FROM) {
          try {
            await sendEmailViaSMTP({
              to: emailContent.to,
              subject: emailContent.subject,
              html: emailContent.html,
            });
          } catch (sendErr: any) {
            console.error("SMTP send error:", sendErr);
            sendStatus = 'failed';
            errorMessage = sendErr?.message || 'SMTP send failed';
          }
        } else {
          // Missing SMTP config, mark as skipped (still update reminder?)
          console.warn("SMTP env vars missing; marking reminder as skipped.");
          sendStatus = 'skipped';
          errorMessage = 'SMTP configuration missing';
        }

        await supabase
          .from("reminders")
          .update({ 
            status: sendStatus === 'sent' ? 'sent' : 'failed', 
            sent_at: sendStatus === 'sent' ? new Date().toISOString() : null,
            error_message: sendStatus === 'failed' ? errorMessage : null
          })
          .eq("id", reminder.id);

        results.push({ 
          reminderId: reminder.id, 
          status: sendStatus, 
          email,
          error: errorMessage
        });
      } catch (error: any) {
        await supabase
          .from("reminders")
          .update({ 
            status: "failed", 
            error_message: error.message 
          })
          .eq("id", reminder.id);

        results.push({ 
          reminderId: reminder.id, 
          status: "failed", 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} reminders`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Unhandled send-reminders error", error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function generateEmailContent(
  reminderType: string,
  booking: any
): ReminderEmail {
  const name = booking?.customer_name?.split(' ')[0] || "there";
  const eventDate = new Date(booking.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const startTime = booking.start_time || "TBD";
  const endTime = booking.end_time || "";
  const timeRange = endTime ? `${startTime} - ${endTime}` : startTime;
  
  const venue = booking.venue_name || "Your venue";
  const address = booking.street_address 
    ? `${booking.street_address}${booking.city ? ', ' + booking.city : ''}${booking.state ? ', ' + booking.state : ''}${booking.zip_code ? ' ' + booking.zip_code : ''}`
    : "";

  const emailStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .logo { color: white; font-size: 28px; font-weight: bold; margin: 0; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
      .greeting { color: #6d28d9; font-size: 24px; margin-bottom: 20px; }
      .highlight { background: #f3f4f6; padding: 20px; border-left: 4px solid #6d28d9; margin: 20px 0; border-radius: 4px; }
      .detail-row { margin: 12px 0; }
      .detail-label { font-weight: 600; color: #6d28d9; display: inline-block; width: 100px; }
      .detail-value { color: #374151; }
      .cta { background: #6d28d9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; }
      .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
      .hashtag { color: #6d28d9; font-weight: bold; }
    </style>
  `;

  switch (reminderType) {
    case "72h_before":
      return {
        to: booking.customer_email,
        subject: "🎵 Your Event is in 3 Days - VZ Entertainment",
        html: `<!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="header">
            <h1 class="logo">VZ Entertainment</h1>
          </div>
          <div class="content">
            <h2 class="greeting">Hi ${name}! 👋</h2>
            <p>We're getting excited! Your event is coming up in just <strong>3 days</strong>, and we wanted to reach out with a friendly reminder.</p>
            
            <p>Our team is already preparing to make your ${booking.event_type} absolutely unforgettable. We're bringing the energy, the music, and the vibes that will keep your guests talking about this event for months to come!</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #6d28d9;">📅 Event Details</h3>
              <div class="detail-row"><span class="detail-label">Date:</span> <span class="detail-value">${eventDate}</span></div>
              <div class="detail-row"><span class="detail-label">Time:</span> <span class="detail-value">${timeRange}</span></div>
              <div class="detail-row"><span class="detail-label">Type:</span> <span class="detail-value">${booking.event_type}</span></div>
              ${venue !== "Your venue" ? `<div class="detail-row"><span class="detail-label">Venue:</span> <span class="detail-value">${venue}</span></div>` : ''}
              ${address ? `<div class="detail-row"><span class="detail-label">Location:</span> <span class="detail-value">${address}</span></div>` : ''}
              ${booking.package_type ? `<div class="detail-row"><span class="detail-label">Package:</span> <span class="detail-value">${booking.package_type}</span></div>` : ''}
            </div>
            
            <p><strong>Need to make any last-minute changes or have special requests?</strong> Now's the perfect time! Whether it's a specific song, a special announcement, or any other details you'd like us to know about, please don't hesitate to reach out.</p>
            
            <p>We're here to make sure everything is exactly how you envision it. Your satisfaction is our top priority, and we want every detail to be perfect!</p>
            
            <p style="margin-top: 30px;">Can't wait to see you soon!</p>
            <p style="margin-top: 5px;">With excitement,<br><strong>The VZ Entertainment Team</strong></p>
            <p class="hashtag">#LETSWORK 🎉</p>
          </div>
          <div class="footer">
            <p>VZ Entertainment | Bringing the Vibe to Your Event</p>
            <p style="font-size: 12px; margin-top: 10px;">If you have questions, reply to this email or contact us directly.</p>
          </div>
        </body>
        </html>`,
      };

    case "24h_before":
      return {
        to: booking.customer_email,
        subject: "🎉 Tomorrow's the Big Day! - VZ Entertainment",
        html: `<!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="header">
            <h1 class="logo">VZ Entertainment</h1>
          </div>
          <div class="content">
            <h2 class="greeting">Hi ${name}! 🎊</h2>
            <p><strong>Tomorrow is the day!</strong> We're counting down the hours until we get to celebrate with you and your guests.</p>
            
            <p>Our equipment is ready, our playlist is curated, and our team is pumped to deliver an incredible experience. We've been looking forward to this, and we know it's going to be absolutely amazing!</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #6d28d9;">📅 Tomorrow's Event</h3>
              <div class="detail-row"><span class="detail-label">Date:</span> <span class="detail-value">${eventDate}</span></div>
              <div class="detail-row"><span class="detail-label">Time:</span> <span class="detail-value">${timeRange}</span></div>
              <div class="detail-row"><span class="detail-label">Type:</span> <span class="detail-value">${booking.event_type}</span></div>
              ${venue !== "Your venue" ? `<div class="detail-row"><span class="detail-label">Venue:</span> <span class="detail-value">${venue}</span></div>` : ''}
              ${address ? `<div class="detail-row"><span class="detail-label">Location:</span> <span class="detail-value">${address}</span></div>` : ''}
              ${booking.package_type ? `<div class="detail-row"><span class="detail-label">Package:</span> <span class="detail-value">${booking.package_type}</span></div>` : ''}
            </div>
            
            ${booking.notes ? `<p><strong>Your Special Notes:</strong><br><em>${booking.notes}</em></p>` : ''}
            
            <p><strong>Quick Reminders for Tomorrow:</strong></p>
            <ul style="line-height: 2;">
              <li>We'll arrive early to set up and test everything</li>
              <li>Feel free to share any last-minute song requests</li>
              <li>If there are any access or parking instructions, please let us know</li>
              <li>Relax and get ready to have an incredible time!</li>
            </ul>
            
            <p>We're bringing our A-game tomorrow, and we can't wait to help make your ${booking.event_type} one for the books! Get ready for an unforgettable experience! 🎵</p>
            
            <p style="margin-top: 30px;">See you tomorrow!</p>
            <p style="margin-top: 5px;">Warmly,<br><strong>The VZ Entertainment Team</strong></p>
            <p class="hashtag">#LETSWORK 🔥</p>
          </div>
          <div class="footer">
            <p>VZ Entertainment | Bringing the Vibe to Your Event</p>
            <p style="font-size: 12px; margin-top: 10px;">Questions before tomorrow? We're here to help - just reply to this email!</p>
          </div>
        </body>
        </html>`,
      };

    case "day_of":
      return {
        to: booking.customer_email,
        subject: "🎵 Today's the Day! We're Ready for You - VZ Entertainment",
        html: `<!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="header">
            <h1 class="logo">VZ Entertainment</h1>
          </div>
          <div class="content">
            <h2 class="greeting">Good Morning, ${name}! ☀️</h2>
            <p><strong>TODAY IS THE DAY!</strong> We hope you're as excited as we are!</p>
            
            <p>Our team is ready, our gear is packed, and we're set to bring the perfect energy to your ${booking.event_type}. We've been preparing for this moment, and we're committed to making today absolutely spectacular for you and your guests.</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #6d28d9;">📅 Today's Event</h3>
              <div class="detail-row"><span class="detail-label">Date:</span> <span class="detail-value">${eventDate} (TODAY!)</span></div>
              <div class="detail-row"><span class="detail-label">Time:</span> <span class="detail-value">${timeRange}</span></div>
              <div class="detail-row"><span class="detail-label">Type:</span> <span class="detail-value">${booking.event_type}</span></div>
              ${venue !== "Your venue" ? `<div class="detail-row"><span class="detail-label">Venue:</span> <span class="detail-value">${venue}</span></div>` : ''}
              ${address ? `<div class="detail-row"><span class="detail-label">Location:</span> <span class="detail-value">${address}</span></div>` : ''}
              ${booking.package_type ? `<div class="detail-row"><span class="detail-label">Package:</span> <span class="detail-value">${booking.package_type}</span></div>` : ''}
            </div>
            
            <p><strong>What You Can Expect:</strong></p>
            <ul style="line-height: 2;">
              <li>🎤 Professional setup with premium equipment</li>
              <li>🎶 Carefully curated music to match your vibe</li>
              <li>💫 High energy and positive atmosphere</li>
              <li>🎯 Attention to every detail you requested</li>
            </ul>
            
            ${booking.notes ? `<p><strong>We haven't forgotten your special requests:</strong><br><em>${booking.notes}</em></p>` : ''}
            
            <p>Take a deep breath, relax, and get ready to enjoy yourself! We've got everything under control. Our only goal today is to exceed your expectations and create memories that last a lifetime.</p>
            
            <p><strong>Need to reach us before the event?</strong> Feel free to reply to this email or call us. We're here and ready!</p>
            
            <p style="margin-top: 30px; font-size: 18px; font-weight: 600;">Let's make today AMAZING! 🎉</p>
            <p style="margin-top: 5px;">With energy and excitement,<br><strong>The VZ Entertainment Team</strong></p>
            <p class="hashtag">#LETSWORK 💪</p>
          </div>
          <div class="footer">
            <p>VZ Entertainment | Bringing the Vibe to Your Event</p>
            <p style="font-size: 12px; margin-top: 10px;">See you soon! Get ready for an unforgettable experience! 🌟</p>
          </div>
        </body>
        </html>`,
      };

    default:
      return {
        to: booking.customer_email,
        subject: "Event Reminder - VZ Entertainment",
        html: `<!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="header">
            <h1 class="logo">VZ Entertainment</h1>
          </div>
          <div class="content">
            <h2 class="greeting">Hi ${name}!</h2>
            <p>This is a friendly reminder about your upcoming event with VZ Entertainment.</p>
            
            <div class="highlight">
              <h3 style="margin-top: 0; color: #6d28d9;">📅 Event Details</h3>
              <div class="detail-row"><span class="detail-label">Date:</span> <span class="detail-value">${eventDate}</span></div>
              <div class="detail-row"><span class="detail-label">Time:</span> <span class="detail-value">${timeRange}</span></div>
              <div class="detail-row"><span class="detail-label">Type:</span> <span class="detail-value">${booking.event_type}</span></div>
              ${venue !== "Your venue" ? `<div class="detail-row"><span class="detail-label">Venue:</span> <span class="detail-value">${venue}</span></div>` : ''}
              ${address ? `<div class="detail-row"><span class="detail-label">Location:</span> <span class="detail-value">${address}</span></div>` : ''}
            </div>
            
            <p>We're looking forward to making your event memorable! If you have any questions or special requests, please don't hesitate to reach out.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>The VZ Entertainment Team</strong></p>
          </div>
          <div class="footer">
            <p>VZ Entertainment | Bringing the Vibe to Your Event</p>
          </div>
        </body>
        </html>`,
      };
  }
}

async function sendEmailViaSMTP({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM) {
    throw new Error('Missing SMTP configuration');
  }
  const port = Number(SMTP_PORT);
  const client = new SmtpClient();
  // Prefer STARTTLS on 587; if using 465 use connectTLS
  if (port === 465) {
    await client.connectTLS({ hostname: SMTP_HOST, port, username: SMTP_USER, password: SMTP_PASSWORD });
  } else {
    await client.connect({ hostname: SMTP_HOST, port, username: SMTP_USER, password: SMTP_PASSWORD });
  }
  await client.send({
    from: EMAIL_FROM,
    to,
    subject,
    content: html,
    headers: EMAIL_REPLY_TO ? { 'Reply-To': EMAIL_REPLY_TO } : undefined,
  });
  await client.close();
}
