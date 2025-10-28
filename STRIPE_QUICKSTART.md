# Quick Start: Stripe Integration

## ✅ What's Been Done

I've integrated Stripe payment processing into your Vibe Zone website. Here's what was added:

1. **Stripe SDK** - Installed `@stripe/stripe-js` and `stripe` packages
2. **Payment Component** - Created Stripe checkout integration in booking flow
3. **Supabase Edge Functions** - Created two serverless functions:
   - `create-checkout-session` - Generates secure checkout links
   - `stripe-webhook` - Handles payment confirmations
4. **Updated Booking Page** - Replaced static Stripe links with dynamic checkout

## 🚀 Setup Instructions

### 1. Get Your Stripe API Keys

1. Sign up or log in to Stripe: https://dashboard.stripe.com
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Reveal and copy your **Secret key** (starts with `sk_test_`)

### 2. Configure Your Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and add your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### 3. Configure Supabase Secrets

Set your Stripe secret key in Supabase:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

### 4. Deploy Edge Functions

```bash
# Deploy the checkout session function
npx supabase functions deploy create-checkout-session

# Deploy the webhook handler
npx supabase functions deploy stripe-webhook
```

### 5. Set Up Webhooks (Important!)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Set it in Supabase:
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

### 6. Test Your Integration

Use Stripe's test cards:

**✅ Successful Payment:**
```
Card: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123 (any 3 digits)
ZIP: 12345 (any 5 digits)
```

**❌ Failed Payment:**
```
Card: 4000 0000 0000 0002
```

## 🧪 Testing Flow

1. Start your dev server: `npm run dev`
2. Go to: http://localhost:5173/booking
3. Fill out the booking form
4. Click "Pay with Card (Stripe)"
5. Use a test card number
6. Complete payment
7. Get redirected back with success message

## 📊 Monitor Payments

- **Payments**: https://dashboard.stripe.com/payments
- **Customers**: https://dashboard.stripe.com/customers
- **Webhooks**: https://dashboard.stripe.com/webhooks

## 🔒 Security Notes

- ✅ Never commit `.env` to git (already in `.gitignore`)
- ✅ Use test keys during development
- ✅ Only use live keys in production
- ✅ Keep secret keys in Supabase secrets, not in code

## 🌐 Going Live

When ready to accept real payments:

1. Complete Stripe account activation
2. Switch to **Live mode** in Stripe Dashboard
3. Get your **live** API keys (pk_live_... and sk_live_...)
4. Update environment variables with live keys
5. Create a new webhook endpoint for live mode
6. Test with a real card (small amount)

## 🆘 Troubleshooting

**"Stripe failed to initialize"**
- Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env`
- Restart your dev server after adding the key

**"Unable to initialize payment"**
- Verify Supabase functions are deployed
- Check that `STRIPE_SECRET_KEY` is set in Supabase secrets
- View logs: `npx supabase functions logs create-checkout-session`

**Webhook not working**
- Verify webhook URL is correct
- Check signing secret is set correctly
- View webhook logs in Stripe Dashboard

## 📧 Customer Experience

1. Customer fills out booking form
2. Clicks "Pay with Card (Stripe)"
3. Redirected to secure Stripe checkout page
4. Enters card details on Stripe's secure form
5. Payment processed
6. Redirected back to your site with confirmation
7. Receives email receipt from Stripe

## 💡 Next Steps

- [ ] Test the payment flow with test cards
- [ ] Customize the success/failure messages
- [ ] Add email notifications (optional)
- [ ] Set up production environment when ready to go live

For detailed documentation, see `STRIPE_SETUP.md`

---

Need help? Check the Stripe docs: https://stripe.com/docs
