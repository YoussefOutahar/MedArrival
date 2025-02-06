interface ImportMetaEnv {
  VITE_GOOGLE_AUTH_URL: string
  VITE_OAUTH2_REDIRECT_URI: string
  VITE_API_SOCKET_URL: string
  VITE_BASE_URL: string
  readonly VITE_API_BASE_URL: string
  readonly OAUTH2_REDIRECT_URI: string
  readonly GOOGLE_AUTH_URL: string
}

interface Window {
  ENV: ENV
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
