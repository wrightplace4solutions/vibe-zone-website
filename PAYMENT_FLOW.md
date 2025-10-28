# Stripe Payment Flow Diagram

## How Payments Work in Your Vibe Zone Website

```
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER JOURNEY                           │
└─────────────────────────────────────────────────────────────────┘

1. Customer visits booking page
   └─> /booking
   
2. Customer fills out booking form
   ├─> Event details (date, time, venue)
   ├─> Package selection (Plug-and-Play or Full Setup)
   └─> Contact information (name, email, phone)

3. Customer submits form
   └─> Booking request sent to Make.com webhook
       (for your records/notifications)

4. Customer clicks "Pay with Card (Stripe)"
   └─> handleStripeCheckout() function triggered

┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING                           │
└─────────────────────────────────────────────────────────────────┘

5. Frontend calls Supabase Edge Function
   └─> POST to /functions/v1/create-checkout-session
       {
         packageType: "option1" or "option2",
         customerEmail: "customer@email.com",
         customerName: "John Doe",
         eventDate: "2025-11-15",
         eventDetails: { ... }
       }

6. Edge Function creates Stripe Checkout Session
   ├─> Uses STRIPE_SECRET_KEY
   ├─> Sets amount: $100 or $150 (deposit)
   ├─> Includes booking metadata
   └─> Returns checkout URL

7. Customer redirected to Stripe Checkout
   ├─> Secure Stripe-hosted payment page
   ├─> Customer enters card details
   └─> Stripe processes payment

8. Payment completed (or failed)
   └─> Stripe redirects customer back to your site
       ├─> Success: /booking?session_id={ID}&payment_status=success
       └─> Cancelled: /booking?payment_status=cancelled

┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK HANDLING                             │
└─────────────────────────────────────────────────────────────────┘

9. Stripe sends webhook event
   └─> POST to /functions/v1/stripe-webhook
       Event types:
       ├─> checkout.session.completed (payment success)
       └─> payment_intent.payment_failed (payment failed)

10. Webhook function processes event
    ├─> Verifies webhook signature (security)
    ├─> Extracts payment and booking details
    └─> You can add custom logic here:
        ├─> Update database
        ├─> Send confirmation email
        ├─> Notify admin
        └─> Update booking status

┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                    │
└─────────────────────────────────────────────────────────────────┘

Frontend (React/TypeScript)
    │
    ├─> Stripe.js (loads Stripe SDK)
    │   └─> Manages redirect to checkout
    │
    └─> Supabase Client
        └─> Calls Edge Functions

Supabase Edge Functions (Deno/TypeScript)
    │
    ├─> create-checkout-session
    │   └─> Uses Stripe SDK
    │       └─> Creates checkout session
    │           └─> Returns URL to frontend
    │
    └─> stripe-webhook
        └─> Receives Stripe events
            └─> Processes payment confirmations

Stripe (External Service)
    │
    ├─> Hosts checkout page
    ├─> Processes payments
    ├─> Sends webhooks
    └─> Stores customer data

┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                            │
└─────────────────────────────────────────────────────────────────┘

✅ Publishable key (VITE_STRIPE_PUBLISHABLE_KEY)
   └─> Safe to expose in frontend code
   └─> Only used for client-side operations

✅ Secret key (STRIPE_SECRET_KEY)
   └─> NEVER exposed to frontend
   └─> Stored in Supabase secrets
   └─> Only used in Edge Functions

✅ Webhook signature verification
   └─> Ensures webhooks are from Stripe
   └─> Prevents fraudulent requests

✅ Secure checkout
   └─> Payment details never touch your server
   └─> Handled entirely by Stripe
   └─> PCI DSS compliant

┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER RECEIVES                            │
└─────────────────────────────────────────────────────────────────┘

📧 Email from Stripe (automatic)
   ├─> Payment receipt
   ├─> Amount charged
   └─> Transaction ID

📧 Email from you (you need to implement)
   ├─> Booking confirmation
   ├─> Event details
   └─> Next steps

┌─────────────────────────────────────────────────────────────────┐
│                    YOU RECEIVE                                  │
└─────────────────────────────────────────────────────────────────┘

💰 Payment in Stripe account
   └─> Available in 2-7 business days
   └─> Or instant with Stripe Instant Payouts

📊 Dashboard data
   ├─> Stripe Dashboard: payment details
   ├─> Make.com: booking form data
   └─> Email notifications (if configured)

┌─────────────────────────────────────────────────────────────────┐
│                    REFUND FLOW (if needed)                      │
└─────────────────────────────────────────────────────────────────┘

1. Go to Stripe Dashboard
   └─> https://dashboard.stripe.com/payments

2. Find the payment
   └─> Search by customer email or amount

3. Click on payment
   └─> View payment details

4. Click "Refund payment"
   ├─> Full refund
   └─> Partial refund (specify amount)

5. Confirm refund
   └─> Funds returned to customer in 5-10 business days

6. Customer receives email from Stripe
   └─> Refund confirmation

┌─────────────────────────────────────────────────────────────────┐
│                    TEST MODE vs LIVE MODE                       │
└─────────────────────────────────────────────────────────────────┘

TEST MODE (Development)
├─> Keys start with sk_test_ and pk_test_
├─> Use test card numbers
├─> No real money moves
├─> Perfect for testing
└─> Separate from live data

LIVE MODE (Production)
├─> Keys start with sk_live_ and pk_live_
├─> Real card numbers only
├─> Real money is charged
├─> Requires activated Stripe account
└─> Use for actual customers

┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING & LOGS                            │
└─────────────────────────────────────────────────────────────────┘

Stripe Dashboard
├─> Payments: https://dashboard.stripe.com/payments
├─> Customers: https://dashboard.stripe.com/customers
├─> Webhooks: https://dashboard.stripe.com/webhooks
└─> Events: https://dashboard.stripe.com/events

Supabase Logs
└─> View Edge Function logs:
    npx supabase functions logs create-checkout-session
    npx supabase functions logs stripe-webhook

Browser Console
└─> Check for JavaScript errors
    └─> F12 → Console tab
```

## Key Points

1. **Customer never sees your API keys** - All sensitive operations happen server-side
2. **No card data on your server** - Stripe handles all payment details
3. **Secure by default** - PCI DSS compliance handled by Stripe
4. **Real-time confirmations** - Webhooks notify you immediately
5. **Easy refunds** - Managed through Stripe Dashboard

## Next Steps After Setup

1. ✅ Test with test cards
2. ✅ Verify webhooks are working
3. ✅ Test refund process
4. ✅ Customize email notifications (optional)
5. ✅ Add booking confirmation page (optional)
6. ✅ Integrate with calendar (optional)
7. ✅ Go live when ready!
