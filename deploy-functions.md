# How to Deploy Stripe Edge Functions

Since you're using Lovable for your website, the Supabase Edge Functions need to be deployed separately.

## ✅ Prerequisites:
- [ ] Added `STRIPE_SECRET_KEY` to Supabase secrets
- [ ] Added `STRIPE_WEBHOOK_SECRET` to Supabase secrets
- [ ] Created webhook in Stripe Dashboard

## 🚀 Deployment Options:

### Option 1: Deploy via Supabase Dashboard (Recommended for Lovable users)

1. **Go to your Supabase Functions page:**
   - https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov/functions

2. **Deploy `create-checkout-session` function:**
   - Click **"Create a new function"**
   - Name: `create-checkout-session`
   - Copy/paste the code from: `supabase/functions/create-checkout-session/index.ts`
   - Click **"Deploy function"**

3. **Deploy `stripe-webhook` function:**
   - Click **"Create a new function"**
   - Name: `stripe-webhook`
   - Copy/paste the code from: `supabase/functions/stripe-webhook/index.ts`
   - Click **"Deploy function"**

### Option 2: Deploy via GitHub (Automated)

1. **Push your code to GitHub** (already done ✅)

2. **Connect GitHub to Supabase:**
   - Go to: https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov/settings/functions
   - Click **"Connect to GitHub"**
   - Select repository: `wrightplace4solutions/vibe-zone-website`
   - Select branch: `main`
   - Functions directory: `supabase/functions`

3. **Enable auto-deployment:**
   - Toggle **"Deploy on push"**
   - Every time you push to GitHub, functions will auto-deploy!

### Option 3: Manual Deploy via CLI (If you get CLI working)

If you successfully install Supabase CLI later:

```bash
# Link to your project
npx supabase link --project-ref ffikkqixlmexusrcxaov

# Deploy all functions
npx supabase functions deploy create-checkout-session
npx supabase functions deploy stripe-webhook
```

## 🔍 Verify Deployment:

After deploying, check:
- https://supabase.com/dashboard/project/ffikkqixlmexusrcxaov/functions

You should see:
- ✅ `chat` (existing from VibeQue)
- ✅ `create-checkout-session` (new)
- ✅ `stripe-webhook` (new)

## 📝 Important Notes:

**Multiple Functions in One Project:**
- Your Supabase project can have multiple Edge Functions
- VibeQue's `chat` function won't interfere with Stripe functions
- Each function has its own endpoint URL

**Your Stripe Functions will be available at:**
- Create Checkout: `https://ffikkqixlmexusrcxaov.supabase.co/functions/v1/create-checkout-session`
- Webhook: `https://ffikkqixlmexusrcxaov.supabase.co/functions/v1/stripe-webhook`

**When Publishing with Lovable:**
- Lovable publishes your frontend code
- Supabase hosts your backend functions
- They work together seamlessly!

## ✅ Final Checklist Before Going Live:

- [ ] Stripe secrets added to Supabase
- [ ] Both Edge Functions deployed
- [ ] Webhook created in Stripe Dashboard
- [ ] Website published via Lovable
- [ ] Test payment with test card (4242 4242 4242 4242)
- [ ] Test payment with real card (small amount)
- [ ] Switch to live mode keys when ready!
