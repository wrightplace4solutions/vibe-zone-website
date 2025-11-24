const Refunds = () => {
  return <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Refund & Deposit Policy</h1>
        <p className="text-muted-foreground mb-8">
          Our transparent policy on deposits, refunds, and date transfers.
        </p>

        <div className="space-y-8">
          <section className="bg-muted/50 border-l-4 border-primary p-6 rounded-r-lg">
            <h2 className="text-xl font-semibold mb-2 text-primary">Key Policy Points</h2>
            <ul className="space-y-2 text-sm">
              <li>✓ Deposits are <strong>non-refundable</strong> once paid</li>
              <li>✓ Dates can be transferred up to 30 days before your event</li>
              <li>✓ Full refunds available only in case of our cancellation</li>
              <li>✓ Deposits secure your date and cover booking costs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Deposit Requirements</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                A deposit is required to secure your event date and guarantee our services. Deposit amounts vary by package:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Plug-and-Play Package:</strong>Plug-and-Play Package: $250 deposit required</li>
                <li><strong>Full Setup + Rentals Package:</strong>Full Setup + Rentals Package: $350 deposit required</li>
              </ul>
              <p>
                Your date is <strong>not confirmed</strong> until the deposit is received. Once paid, your deposit 
                immediately reserves your date exclusively and covers administrative costs, scheduling, and planning time.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Non-Refundable Deposit Policy</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                <strong>All deposits are non-refundable.</strong> This policy exists because once your date is secured:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We turn down other potential bookings for that date</li>
                <li>We begin event planning and preparation specific to your needs</li>
                <li>We reserve equipment and resources exclusively for your event</li>
                <li>Administrative and scheduling costs are incurred immediately</li>
              </ul>
              <p>
                If you cancel your event for any reason, the deposit will not be refunded. However, we offer 
                date transfer options (see below).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Date Transfer Window</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                While deposits are non-refundable, we understand that circumstances change. You may transfer 
                your booking to a new date under the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Transfer Window:</strong> Requests must be made at least <strong>30 days</strong> before 
                  your original event date
                </li>
                <li>
                  <strong>New Date Requirement:</strong> The new date must be within 12 months of your original booking date
                </li>
                <li>
                  <strong>Availability:</strong> Transfer is subject to our availability on the requested new date
                </li>
                <li>
                  <strong>One Transfer Only:</strong> Only one date transfer is permitted per booking
                </li>
                <li>
                  <strong>Package Changes:</strong> If you upgrade your package during transfer, price difference applies. 
                  Downgrades are not permitted.
                </li>
              </ul>
              <p>
                <strong>Late Requests:</strong> Transfer requests made less than 30 days before the event will not be accepted. 
                The deposit will be forfeited and the booking will be cancelled.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Final Payment Timeline</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                The deposit is applied toward your total service cost. The remaining balance is due according to the 
                following schedule:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Final Payment Deadline:</strong> Full payment must be received <strong>7 days before</strong> your event date
                </li>
                <li>
                  <strong>Payment Methods:</strong> We accept credit/debit cards, Zelle, Venmo, and Cash App
                </li>
                <li>
                  <strong>Late Payment:</strong> Events with outstanding balances 7 days before the event may be cancelled, 
                  and deposits will be forfeited
                </li>
              </ul>
              <p>
                You'll receive payment reminders via email as your event date approaches.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Cancellation Policy</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                In the unlikely event that <strong>we</strong> must cancel your booking due to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Illness or emergency</li>
                <li>Equipment failure that cannot be resolved</li>
                <li>Force majeure events (see Terms of Service)</li>
              </ul>
              <p>
                You will receive a <strong>full refund</strong> of all payments including your deposit, OR we will provide 
                a qualified substitute DJ with your approval at no additional cost.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Chargebacks & Disputes</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                Filing a chargeback or payment dispute for services properly rendered or for deposits covered by this policy 
                will result in:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Immediate cancellation of your event</li>
                <li>Forfeiture of all payments and deposits</li>
                <li>Inability to rebook or transfer your event</li>
                <li>Potential legal action to recover disputed funds plus associated costs</li>
              </ul>
              <p>
                If you have a genuine concern about our service, please contact us directly at{" "}
                <a href="mailto:bookings@vzentertainment.fun" className="text-primary hover:underline">
                  bookings@vzentertainment.fun
                </a>{" "}
                before initiating any payment disputes. We're committed to resolving all issues fairly.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Weather & Emergency Situations</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                Deposits remain non-refundable in the event of weather or emergencies. However:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Weather-related issues may qualify for a date transfer if notification is received at least 48 hours 
                  before the event
                </li>
                <li>
                  Government-mandated closures or restrictions will be handled on a case-by-case basis
                </li>
                <li>
                  We recommend event insurance for outdoor or high-risk events
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
            <div className="prose prose-slate dark:prose-invert">
              <p>
                We want you to feel confident in your booking. If you have questions about our deposit or refund policy, 
                please reach out <strong>before</strong> making your deposit:
              </p>
              <p>
                Email:{" "}
                <a href="mailto:bookings@vzentertainment.fun" className="text-primary hover:underline">
                  bookings@vzentertainment.fun
                </a>
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                By submitting a deposit, you acknowledge that you have read, understood, and agree to this Refund & Deposit Policy.
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>;
};
export default Refunds;