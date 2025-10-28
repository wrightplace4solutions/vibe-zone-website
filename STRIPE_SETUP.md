# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe payment processing for your Vibe Zone website.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Supabase project set up
3. Access to your project's environment variables

## Step 1: Get Your Stripe API Keys

1. Log in to your Stripe Dashboard: https://dashboard.stripe.com
2. Click on **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Click **Reveal test key** and copy your **Secret key** (starts with `sk_test_`)

## Step 2: Configure Environment Variables

### Frontend (.env file in project root)

Create a `.env` file in your project root and add:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Supabase Edge Functions

1. In your terminal, navigate to your project directory
2. Set the Stripe secret key for Supabase functions:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Step 3: Deploy Supabase Edge Functions

Deploy the Stripe checkout and webhook functions:

```bash
# Deploy the checkout session creation function
npx supabase functions deploy create-checkout-session

# Deploy the webhook handler function
npx supabase functions deploy stripe-webhook
```

## Step 4: Set Up Stripe Webhooks

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://[your-supabase-project-id].supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Set it in Supabase:
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

## Step 5: Test the Integration

### Using Test Mode

Stripe provides test card numbers for testing:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- This will trigger a card declined error

### Test Flow:

1. Go to your booking page: http://localhost:5173/booking
2. Fill out the booking form
3. Click "Pay with Card (Stripe)"
4. Use a test card number
5. Complete the payment
6. You should be redirected back with a success message

## Step 6: Go Live (When Ready)

1. Complete Stripe account activation
2. Switch from test to live mode in Stripe Dashboard
3. Get your **live** API keys (start with `pk_live_` and `sk_live_`)
4. Update environment variables with live keys:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   ```
   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   ```
5. Update webhook endpoint to use live mode
6. Get the live webhook secret and update:
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
   ```

## Monitoring Payments

### Stripe Dashboard
- View all payments: https://dashboard.stripe.com/payments
- View customers: https://dashboard.stripe.com/customers
- View events: https://dashboard.stripe.com/events

### Webhook Logs
Check webhook delivery in Stripe Dashboard → Developers → Webhooks → [Your endpoint]

## Troubleshooting

### Payment Not Processing
- Check browser console for errors
- Verify publishable key is correct in `.env`
- Check Supabase function logs
- Ensure secret key is set correctly in Supabase

### Webhook Not Receiving Events
- Verify webhook URL is correct
- Check webhook signing secret is set
- Review Stripe webhook logs for delivery failures
- Ensure Supabase function is deployed

### Common Errors

**"Stripe failed to initialize"**
- Publishable key is missing or invalid
- Check `.env` file and restart dev server

**"Unable to initialize payment"**
- Supabase function not deployed
- Secret key not set in Supabase
- Check Supabase function logs

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

## Security Notes

⚠️ **NEVER** commit your secret keys to git!
- Add `.env` to `.gitignore`
- Use environment variables for all keys
- Use test keys during development
- Only use live keys in production

## Next Steps

1. **Customize Email Notifications**: Add email confirmations when payments succeed
2. **Database Integration**: Store payment records in Supabase database
3. **Customer Dashboard**: Create a portal for customers to view their bookings
4. **Refund Handling**: Implement refund processing through Stripe
