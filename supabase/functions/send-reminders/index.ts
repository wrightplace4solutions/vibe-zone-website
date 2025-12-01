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
          event_time,
          event_type,
          user_id,
          users:user_id (
            email,
            raw_user_meta_data
          )
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
        const user = booking?.users;
        const email = user?.email;

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
          booking,
          user
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
  booking: any,
  user: any
): ReminderEmail {
  const name = user?.raw_user_meta_data?.full_name || "there";
  const eventDate = new Date(booking.event_date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const eventTime = booking.event_time || "TBD";

  switch (reminderType) {
    case "72h_before":
      return {
        to: user.email,
        subject: "Your Event is in 3 Days! 🎵",
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2 style="color:#6d28d9;">Hi ${name}!</h2>
          <p>Just a friendly reminder that your event is coming up in <strong>3 days</strong>.</p>
          <p style="margin-top:16px;font-weight:bold;">Event Details:</p>
          <ul>
            <li><strong>Date:</strong> ${eventDate}</li>
            <li><strong>Time:</strong> ${eventTime}</li>
            <li><strong>Type:</strong> ${booking.event_type}</li>
          </ul>
          <p>If you have any special requests or changes, please let us know ASAP!</p>
          <p style="margin-top:24px;">See you soon! <em>#LETSWORK</em></p>
        </body></html>`,
      };

    case "24h_before":
      return {
        to: user.email,
        subject: "Tomorrow's the Big Day! 🎉",
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2 style="color:#6d28d9;">Hi ${name}!</h2>
          <p>Your event is <strong>tomorrow</strong>! We're excited to make it unforgettable.</p>
          <p style="margin-top:16px;font-weight:bold;">Event Details:</p>
          <ul>
            <li><strong>Date:</strong> ${eventDate}</li>
            <li><strong>Time:</strong> ${eventTime}</li>
            <li><strong>Type:</strong> ${booking.event_type}</li>
          </ul>
          <p>We'll see you tomorrow! Get ready to party! 🎊</p>
        </body></html>`,
      };

    case "day_of":
      return {
        to: user.email,
        subject: "Today's the Day! 🎵",
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2 style="color:#6d28d9;">Hi ${name}!</h2>
          <p>Good morning! Today's your event!</p>
          <p style="margin-top:16px;font-weight:bold;">Event Details:</p>
          <ul>
            <li><strong>Date:</strong> ${eventDate}</li>
            <li><strong>Time:</strong> ${eventTime}</li>
            <li><strong>Type:</strong> ${booking.event_type}</li>
          </ul>
          <p>We're all set and ready to make this amazing. See you soon!</p>
        </body></html>`,
      };

    default:
      return {
        to: user.email,
        subject: "Event Reminder from VZ Entertainment",
        html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2 style="color:#6d28d9;">Hi ${name}!</h2>
          <p>This is a reminder about your upcoming event.</p>
          <p style="margin-top:16px;font-weight:bold;">Event Details:</p>
          <ul>
            <li><strong>Date:</strong> ${eventDate}</li>
            <li><strong>Time:</strong> ${eventTime}</li>
            <li><strong>Type:</strong> ${booking.event_type}</li>
          </ul>
        </body></html>`,
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
