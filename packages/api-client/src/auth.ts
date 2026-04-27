/**
 * Mobile auth client for Expo app.
 *
 * Mirrors the pattern from dirstarter_template/lib/auth-client.ts:
 *   createAuthClient({ baseURL, plugins })
 *
 * The mobile client uses the same Better-Auth server endpoints as the web app.
 * Storage adapter uses expo-secure-store for token persistence on device.
 *
 * @see ADR 0009 — Mobile Auth Strategy
 * @see dirstarter_template/lib/auth-client.ts (L1 reference)
 */
import { createAuthClient } from "better-auth/react"
import { magicLinkClient } from "better-auth/client/plugins"

export type AuthClientConfig = {
  /** Base URL of the web app (e.g. https://app.baselinemartialarts.com) */
  baseURL: string
}

/**
 * Create a mobile auth client instance.
 * Called once at app startup with the API base URL.
 *
 * Usage in apps/mobile/:
 *   import { createMobileAuthClient } from "@ronin-dojo/api-client/auth"
 *   const auth = createMobileAuthClient({ baseURL: process.env.EXPO_PUBLIC_API_URL })
 */
export function createMobileAuthClient(config: AuthClientConfig) {
  return createAuthClient({
    baseURL: config.baseURL,
    plugins: [magicLinkClient()],
  })
}

export type MobileAuthClient = ReturnType<typeof createMobileAuthClient>
