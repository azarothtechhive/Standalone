/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_GA_TRACKING_ID: string
  readonly VITE_HOTJAR_ID: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_HOTJAR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}