import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    if (fetchError) throw fetchError;

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

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

        // Here you would integrate with your email service (SendGrid, Resend, etc.)
        // For now, we'll mark as sent and log
        console.log("Sending email:", emailContent);

        await supabase
          .from("reminders")
          .update({ 
            status: "sent", 
            sent_at: new Date().toISOString() 
          })
          .eq("id", reminder.id);

        results.push({ 
          reminderId: reminder.id, 
          status: "sent", 
          email 
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
    return new Response(
      JSON.stringify({ error: error.message }),
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
        html: `
          <h2>Hi ${name}!</h2>
          <p>Just a friendly reminder that your event is coming up in 3 days.</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li>Date: ${eventDate}</li>
            <li>Time: ${eventTime}</li>
            <li>Type: ${booking.event_type}</li>
          </ul>
          <p>If you have any special requests or changes, please let us know ASAP!</p>
          <p>See you soon! #LETSWORK</p>
        `,
      };

    case "24h_before":
      return {
        to: user.email,
        subject: "Tomorrow's the Big Day! 🎉",
        html: `
          <h2>Hi ${name}!</h2>
          <p>Your event is tomorrow! We're excited to make it unforgettable.</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li>Date: ${eventDate}</li>
            <li>Time: ${eventTime}</li>
            <li>Type: ${booking.event_type}</li>
          </ul>
          <p>We'll see you tomorrow! Get ready to party! 🎊</p>
        `,
      };

    case "day_of":
      return {
        to: user.email,
        subject: "Today's the Day! 🎵",
        html: `
          <h2>Hi ${name}!</h2>
          <p>Good morning! Today's your event!</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li>Date: ${eventDate}</li>
            <li>Time: ${eventTime}</li>
            <li>Type: ${booking.event_type}</li>
          </ul>
          <p>We're all set and ready to make this amazing. See you soon!</p>
        `,
      };

    default:
      return {
        to: user.email,
        subject: "Event Reminder from VZ Entertainment",
        html: `
          <h2>Hi ${name}!</h2>
          <p>This is a reminder about your upcoming event.</p>
          <p><strong>Event Details:</strong></p>
          <ul>
            <li>Date: ${eventDate}</li>
            <li>Time: ${eventTime}</li>
            <li>Type: ${booking.event_type}</li>
          </ul>
        `,
      };
  }
}
