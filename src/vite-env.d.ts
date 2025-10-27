/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ZAP_CATCH_HOOK?: string
  readonly VITE_STRIPE_LINK_OPTION1?: string
  readonly VITE_STRIPE_LINK_OPTION2?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
