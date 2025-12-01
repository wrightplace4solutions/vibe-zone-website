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
        console.log(`Notification needed for expired booking: booking_id=${booking.id}, event_date=${booking.event_date}, status=expired`);

        // Here you would send emails:
        // await sendEmailToClient(booking);
        // await sendEmailToBusiness(booking);

        results.push({
          booking_id: booking.id,
          success: true,
          event_date: booking.event_date,
          status: 'expired',
        });
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.push({
          booking_id: booking.id,
          success: false,
          error: errorMessage,
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
