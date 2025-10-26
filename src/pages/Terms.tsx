const Terms = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Please read these terms carefully before booking our services.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Scope of Service & Hours</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                Vibe Zone Entertainment provides professional DJ services including equipment setup, music mixing, 
                and entertainment for the contracted event duration. Service hours are as specified in your booking 
                confirmation. Any additional hours requested on-site are subject to availability and additional fees.
              </p>
              <p>
                Our standard service includes DJ performance, basic sound system, and music library access. 
                Premium packages include additional lighting, expanded equipment, and rental options as specified.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Client Responsibilities</h2>
            <div className="prose prose-slate dark:prose-invert">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Provide accurate venue details including address, access times, and any venue-specific rules or restrictions
                </li>
                <li>
                  Ensure venue has appropriate permissions/licenses for music performance if required
                </li>
                <li>
                  Communicate any special requests, song preferences, or do-not-play lists at least 72 hours before the event
                </li>
                <li>
                  Provide a point of contact who will be available on the day of the event
                </li>
                <li>
                  Ensure safe and secure parking is available for equipment load-in/load-out
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Setup, Power & Weather Considerations</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                <strong>Power Requirements:</strong> Client must provide access to adequate electrical power 
                (standard 110V outlets within 50 feet of setup location). For outdoor events, weather-protected 
                power sources are required.
              </p>
              <p>
                <strong>Setup Space:</strong> Minimum 6ft x 6ft space required for DJ booth and equipment. 
                Additional space needed for lighting and PA rentals if included in package.
              </p>
              <p>
                <strong>Weather:</strong> For outdoor events, client must provide adequate weather protection 
                (tent, canopy, or indoor backup location) for equipment. We reserve the right to cease performance 
                if weather conditions pose a safety risk to equipment or personnel.
              </p>
              <p>
                <strong>Load-In Time:</strong> We typically require 60-90 minutes for setup before event start time. 
                Client must ensure venue access during this window.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cancellations & Rescheduling</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                <strong>Client Cancellations:</strong> See our Refund & Deposit Policy page for complete cancellation terms. 
                Deposits are non-refundable but may be transferred to a new date within the specified window.
              </p>
              <p>
                <strong>Rescheduling:</strong> Events may be rescheduled up to 30 days before the event date without penalty. 
                Rescheduling within 30 days is subject to availability and may incur additional fees. Only one reschedule 
                is permitted per booking.
              </p>
              <p>
                <strong>Our Cancellation:</strong> In the unlikely event we must cancel (due to illness, emergency, or 
                equipment failure), we will provide a full refund including deposit, or arrange a qualified substitute DJ 
                with your approval.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Equipment Rentals</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                When PA systems, lighting, or other equipment rentals are included in your package:
              </p>
              <ul className="list-disc pl-6 space-y-2">
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
            <h2 className="text-2xl font-semibold mb-4">Force Majeure</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                Neither party shall be liable for failure to perform due to causes beyond reasonable control including 
                but not limited to: acts of God, natural disasters, pandemic, government restrictions, venue closures, 
                power failures, or other emergencies.
              </p>
              <p>
                In such cases, we will work with you to reschedule the event or provide a refund of all payments minus 
                any non-recoverable costs already incurred.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Liability & Conduct</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                We maintain appropriate liability insurance for our equipment and operations. We are not responsible 
                for accidents, injuries, or property damage caused by venue conditions, guest behavior, or factors 
                outside our control.
              </p>
              <p>
                We reserve the right to cease performance if guest behavior becomes threatening, abusive, or creates 
                an unsafe environment. No refund will be provided in such circumstances.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                Questions about these terms? Contact us at{" "}
                <a href="mailto:bookings@vzentertainment.fun" className="text-primary hover:underline">
                  bookings@vzentertainment.fun
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-4">
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
