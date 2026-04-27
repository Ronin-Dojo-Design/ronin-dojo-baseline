/**
 * @ronin-dojo/api-client
 *
 * Typed client package for the Expo mobile app (apps/mobile/).
 * Follows Dirstarter's auth-client pattern — same createAuthClient call,
 * different runtime (React Native instead of Next.js).
 *
 * @see ADR 0009 — Mobile Auth Strategy
 */
export { createMobileAuthClient, type AuthClientConfig, type MobileAuthClient } from "./auth"
