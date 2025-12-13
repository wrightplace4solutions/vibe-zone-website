# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/503cec89-12da-47b7-b65c-89d7a16c70a0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/503cec89-12da-47b7-b65c-89d7a16c70a0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project is configured for **Vercel** deployment:

1. Import the repository at [vercel.com](https://vercel.com)
2. Add environment variables (see below)
3. Deploy!

See `FINAL_DEPLOYMENT_GUIDE.md` for detailed instructions.

## Environment Variables

For local development and external hosting (Vercel) you must provide Supabase and any feature keys. Copy `.env.example` to `.env` and fill in real values:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_PUBLIC_SITE_URL=https://vzentertainment.fun
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key
```

**Important:** Add these same variables in Vercel Dashboard → Settings → Environment Variables.

Do not commit real secrets (service role key, Stripe secret, Google credentials). Those stay in Supabase secrets.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
