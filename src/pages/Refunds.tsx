const Refunds = () => {
  return <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Refund & Deposit Policy</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
          Our transparent policy on deposits, refunds, and date transfers.
        </p>

        <div className="space-y-6 sm:space-y-8">
          <section className="bg-muted/50 border-l-4 border-primary p-4 sm:p-6 rounded-r-lg">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1.5 sm:mb-2 text-primary">Key Policy Points</h2>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>✓ Deposits are <strong>non-refundable</strong> once paid</li>
              <li>✓ Dates can be transferred up to 30 days before your event</li>
              <li>✓ Full refunds available only in case of our cancellation</li>
              <li>✓ Deposits secure your date and cover booking costs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Deposit Requirements</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                A deposit is required to secure your event date and guarantee our services. Deposit amounts vary by package:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li><strong>Plug-and-Play Package:</strong>Plug-and-Play Package: $250 deposit required</li>
                <li><strong>Full Setup + Rentals Package:</strong>Full Setup + Rentals Package: $350 deposit required</li>
              </ul>
              <p className="text-xs sm:text-sm">
                Your date is <strong>not confirmed</strong> until the deposit is received. Once paid, your deposit 
                immediately reserves your date exclusively and covers administrative costs, scheduling, and planning time.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Non-Refundable Deposit Policy</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                <strong>All deposits are non-refundable.</strong> This policy exists because once your date is secured:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li>We turn down other potential bookings for that date</li>
                <li>We begin event planning and preparation specific to your needs</li>
                <li>We reserve equipment and resources exclusively for your event</li>
                <li>Administrative and scheduling costs are incurred immediately</li>
              </ul>
              <p className="text-xs sm:text-sm">
                If you cancel your event for any reason, the deposit will not be refunded. However, we offer 
                date transfer options (see below).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Date Transfer Window</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                While deposits are non-refundable, we understand that circumstances change. You may transfer 
                your booking to a new date under the following conditions:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
              <p className="text-xs sm:text-sm">
                <strong>Late Requests:</strong> Transfer requests made less than 30 days before the event will not be accepted. 
                The deposit will be forfeited and the booking will be cancelled.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Final Payment Timeline</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                The deposit is applied toward your total service cost. The remaining balance is due according to the 
                following schedule:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
              <p className="text-xs sm:text-sm">
                You'll receive payment reminders via email as your event date approaches.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Our Cancellation Policy</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                In the unlikely event that <strong>we</strong> must cancel your booking due to:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li>Illness or emergency</li>
                <li>Equipment failure that cannot be resolved</li>
                <li>Force majeure events (see Terms of Service)</li>
              </ul>
              <p className="text-xs sm:text-sm">
                You will receive a <strong>full refund</strong> of all payments including your deposit, OR we will provide 
                a qualified substitute DJ with your approval at no additional cost.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Chargebacks & Disputes</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                Filing a chargeback or payment dispute for services properly rendered or for deposits covered by this policy 
                will result in:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <li>Immediate cancellation of your event</li>
                <li>Forfeiture of all payments and deposits</li>
                <li>Inability to rebook or transfer your event</li>
                <li>Potential legal action to recover disputed funds plus associated costs</li>
              </ul>
              <p className="text-xs sm:text-sm">
                If you have a genuine concern about our service, please contact us directly at{" "}
                <a href="mailto:bookings@vzentertainment.fun" className="text-primary hover:underline break-all">
                  bookings@vzentertainment.fun
                </a>{" "}
                before initiating any payment disputes. We're committed to resolving all issues fairly.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Weather & Emergency Situations</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                Deposits remain non-refundable in the event of weather or emergencies. However:
              </p>
              <ul className="list-disc pl-4 sm:pl-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Questions?</h2>
            <div className="prose prose-sm sm:prose prose-slate dark:prose-invert">
              <p className="text-xs sm:text-sm">
                We want you to feel confident in your booking. If you have questions about our deposit or refund policy, 
                please reach out <strong>before</strong> making your deposit:
              </p>
              <p className="text-xs sm:text-sm">
                Email:{" "}
                <a href="mailto:bookings@vzentertainment.fun" className="text-primary hover:underline break-all">
                  bookings@vzentertainment.fun
                </a>
              </p>
              <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                By submitting a deposit, you acknowledge that you have read, understood, and agree to this Refund & Deposit Policy.
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>;
};
export default Refunds;