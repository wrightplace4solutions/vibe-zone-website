/// <reference types="vite/client" />
/// <reference types="@types/google.maps" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_PROJECT_ID?: string
  readonly VITE_ZAP_CATCH_HOOK?: string
  readonly VITE_STRIPE_LINK_OPTION1?: string
  readonly VITE_STRIPE_LINK_OPTION2?: string
  readonly VITE_PUBLIC_SITE_URL?: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    google?: typeof google;
  }
}
