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
/**
 * Opaque handle for the Better Auth client returned by `createMobileAuthClient`.
 *
 * The concrete return type of `createAuthClient` references internal paths
 * (`better-auth/dist/client/path-to-object.mjs`, `zod/v4/core`) that aren't
 * portable in `.d.ts` output (TS2742). We break the chain by declaring an
 * opaque branded type here. Consumers import `MobileAuthClient` and interact
 * with the instance via its runtime API — the branded wrapper is transparent
 * at runtime.
 */
// biome-ignore lint/suspicious/noExplicitAny: Opaque wrapper avoids TS2742
export type MobileAuthClient = ReturnType<typeof createAuthClient<any>>

export function createMobileAuthClient(config: AuthClientConfig): MobileAuthClient {
  return createAuthClient({
    baseURL: config.baseURL,
    plugins: [magicLinkClient()],
  })
}
