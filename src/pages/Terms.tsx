const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Terms of Service</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          Please read these terms carefully before booking our services.
        </p>

        <div className="space-y-6 sm:space-y-8">
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Booking & Payment Timeline</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                <strong>Hold Requests:</strong> When you submit a booking request, we place a temporary HOLD on your 
                selected date for 72 hours. This hold is reserved under your name and event details and added to our calendar.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>72-Hour Payment Window:</strong> To confirm your booking, you must complete the deposit payment 
                within 72 hours of submitting your booking request. If payment is made during the same session, your 
                booking is immediately confirmed. If paying later, you have up to 72 hours from the time of booking.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Payment Reminders:</strong> You will receive reminder emails at 48 hours and 24 hours before your 
                hold expires if deposit has not been received.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Expired Holds:</strong> If payment is not received within 72 hours, the hold will automatically 
                be cancelled and the date becomes available to other clients. Both you and Vibe Zone Entertainment will 
                receive a notification when a hold expires. You may submit a new booking request if the date is still available.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Confirmation:</strong> Once payment is received, you will receive an email confirmation with all 
                event details and your booking status will be updated to "Confirmed."
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Scope of Service & Hours</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                Vibe Zone Entertainment provides professional DJ services including equipment setup, music mixing, 
                and entertainment for the contracted event duration. Service hours are as specified in your booking 
                confirmation. Any additional hours requested on-site are subject to availability and additional fees.
              </p>
              <p className="text-xs sm:text-sm">
                Our standard service includes DJ performance, basic sound system, and music library access. 
                Premium packages include additional lighting, expanded equipment, and rental options as specified.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Event Planning Timelines</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                <strong>Timeline Approval (Weddings &amp; Formal Events):</strong> Final event timeline details —
                including ceremony order, reception flow, grand entrance order, and any scheduled announcements —
                should be provided no later than <strong>14 days before the event date</strong> to allow adequate
                planning and coordination.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Music Planning:</strong> Must-play songs, special dances (first dance, parent dances, etc.),
                introduction music, and do-not-play lists should be submitted no later than <strong>7 days before
                the event</strong> whenever possible. Late submissions are accepted on a best-effort basis but cannot
                be guaranteed. This applies to weddings, parties, and all events requiring curated playlists.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Client Responsibilities</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li>
                  Provide accurate venue details including address, access times, and any venue-specific rules or restrictions
                </li>
                <li>
                  Ensure venue has appropriate permissions/licenses for music performance if required
                </li>
                <li>
                  Submit must-play songs, special dances, introductions, and do-not-play lists no later than 7 days
                  before the event; wedding timelines should be finalized no later than 14 days before the event
                </li>
                <li>
                  Provide a point of contact who will be available on the day of the event
                </li>
                <li>
                  Ensure safe and secure parking is available for equipment load-in/load-out
                </li>
                <li>
                  <strong>Vendor Meal:</strong> For events exceeding five (5) consecutive hours, Client agrees to
                  provide the DJ and any approved assistant(s), if applicable, with a meal or a reasonable meal
                  break during the event. This provision applies to weddings, receptions, and extended party events.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Setup, Power & Weather Considerations</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                <strong>Power Requirements:</strong> Client must provide access to adequate electrical power 
                (standard 110V outlets within 50 feet of setup location). For outdoor events, weather-protected 
                power sources are required.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Setup Space:</strong> Minimum 6ft x 6ft space required for DJ booth and equipment. 
                Additional space needed for lighting and PA rentals if included in package.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Weather:</strong> For outdoor events, client must provide adequate weather protection 
                (tent, canopy, or indoor backup location) for equipment. We reserve the right to cease performance 
                if weather conditions pose a safety risk to equipment or personnel.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Load-In Time:</strong> We typically require 60-90 minutes for setup before event start time. 
                Client must ensure venue access during this window.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Cancellations & Rescheduling</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                <strong>Client Cancellations:</strong> See our Refund & Deposit Policy page for complete cancellation terms. 
                Deposits are non-refundable but may be transferred to a new date within the specified window.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Rescheduling:</strong> Events may be rescheduled up to 30 days before the event date without penalty. 
                Rescheduling within 30 days is subject to availability and may incur additional fees. Only one reschedule 
                is permitted per booking.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>Our Cancellation:</strong> In the unlikely event we must cancel (due to illness, emergency, or 
                equipment failure), we will provide a full refund including deposit, or arrange a qualified substitute DJ 
                with your approval.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Equipment Rentals</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                When PA systems, lighting, or other equipment rentals are included in your package:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li>
                  All equipment remains the property of Vibe Zone Entertainment
                </li>
                <li>
                  Client is responsible for any damage beyond normal wear and tear
                </li>
                <li>
                  Equipment may not be moved or adjusted by client or guests without permission
                </li>
                <li>
                  Additional fees apply for early setup or late breakdown outside standard event hours
                </li>
                <li>
                  Rental equipment is configured for the specific venue and event type - last-minute venue changes 
                  may require equipment modifications and additional fees
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Photography &amp; Media Release</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                <strong>Optional Media Authorization:</strong> By booking our services, Client authorizes Vibe Zone
                Entertainment to use non-sensitive photographs and video clips captured at the event for promotional
                purposes, including but not limited to our website, social media channels, and marketing materials.
                Non-sensitive content refers to general event atmosphere footage (DJ booth, dance floor, crowd
                energy, lighting, etc.) that does not identify or focus on specific guests without consent.
              </p>
              <p className="text-xs sm:text-sm">
                If Client wishes to opt out of this authorization or restrict specific types of media use, written
                notice must be provided no later than 7 days before the event. Vibe Zone Entertainment will honor
                all reasonable media restrictions communicated in advance.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Sound System Selection</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                Client and Vibe Zone Entertainment will coordinate audio system selection based on venue requirements
                and event needs. The following options may apply:
              </p>
              <ul className="list-none pl-2 sm:pl-4 space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-base leading-none">☐</span>
                  <span>
                    <strong>Venue-Provided Audio System (Plug &amp; Play Package)</strong> — Client or venue supplies
                    the existing in-house sound system; Vibe Zone Entertainment connects and operates using available
                    infrastructure.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-base leading-none">☐</span>
                  <span>
                    <strong>Vibe Zone Entertainment Audio System</strong> — Vibe Zone Entertainment supplies,
                    delivers, and operates professional DJ audio equipment for the event.
                  </span>
                </li>
              </ul>
              <p className="text-xs sm:text-sm mt-2">
                Additional equipment rental, setup, delivery, labor, and operational fees may apply depending on
                venue requirements, guest count, equipment needs, and overall event logistics. Final audio
                configuration will be confirmed prior to the event.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Force Majeure</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                Neither party shall be liable for failure to perform due to causes beyond reasonable control including 
                but not limited to: acts of God, natural disasters, pandemic, government restrictions, venue closures, 
                power failures, or other emergencies.
              </p>
              <p className="text-xs sm:text-sm">
                In such cases, we will work with you to reschedule the event or provide a refund of all payments minus 
                any non-recoverable costs already incurred.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Liability & Conduct</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                We maintain appropriate liability insurance for our equipment and operations. We are not responsible 
                for accidents, injuries, or property damage caused by venue conditions, guest behavior, or factors 
                outside our control.
              </p>
              <p className="text-xs sm:text-sm">
                We reserve the right to cease performance if guest behavior becomes threatening, abusive, or creates 
                an unsafe environment. No refund will be provided in such circumstances.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Contact</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                Questions about these terms? Contact us at{" "}
                <a href="mailto:bookings@vzentertainment.fun" className="text-primary hover:underline break-all">
                  bookings@vzentertainment.fun
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
