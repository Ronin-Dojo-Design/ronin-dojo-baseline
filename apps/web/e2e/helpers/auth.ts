/**
 * Playwright auth helper — creates a test user + session directly in the DB,
 * then sets the Better-Auth session cookie on the browser context.
 *
 * No email, no magic link, no server round-trip.
 * DB work runs through a Bun CLI bridge because Playwright executes this file
 * in Node, while the generated Prisma TS client imports cleanly under Bun.
 */

import { execFileSync } from "node:child_process"
import type { Page } from "@playwright/test"
import "dotenv/config"

const AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ?? "dev-only-change-me-before-deploy-please-rotate-when-pushed"

type AuthUserOptions = { name?: string; email?: string; role?: string }

export type AuthenticatedUser = {
  userId: string
  name: string
  email: string
  token: string
}

export type RegisteredUserShell = {
  userId: string
  email: string
  name: string
  emailVerified: boolean
  passportDisplayName: string | null
  directorySlug: string | null
  sessionCount: number
}

type AuthSession = {
  userId: string
  token: string
}

function runAuthDbCommand<T>(command: string, payload?: unknown): T {
  const args = ["e2e/helpers/auth-db.ts", command]

  if (payload !== undefined) {
    args.push(Buffer.from(JSON.stringify(payload), "utf-8").toString("base64"))
  }

  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

/**
 * Sign a cookie value using HMAC-SHA-256, matching Better-Auth's cookie signing.
 * Format: `value.base64signature`
 */
async function signCookieValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))
  const base64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return encodeURIComponent(`${value}.${base64Sig}`)
}

async function setSessionCookie(page: Page, token: string) {
  const signedToken = await signCookieValue(token, AUTH_SECRET)
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: signedToken,
      domain: "localhost",
      path: "/",
    },
  ])
  // Authenticated test users behave like RETURNING users: pre-mark BOTH first-run
  // onboarding modals as seen so their auto-opening (and click-intercepting)
  // dialogs never ambush the functional flows under test — the dashboard tour
  // AND the profile-enhancement wizard (which auto-opens for an incomplete
  // Passport). Keys mirror DashboardOnboardingTour / ProfileEnhancementLauncher
  // STORAGE_KEY; a dedicated onboarding test would clear/skip these seeds.
  await page.context().addInitScript(() => {
    try {
      window.localStorage.setItem("bbl:onboarding:dashboard:v1", "done")
      window.localStorage.setItem("bbl:onboarding:profile:v1", "done")
    } catch {
      // Storage unavailable (e.g. about:blank) — first paint will simply show the tour.
    }
  })
}

export async function createAuthenticatedUser(page: Page, options?: AuthUserOptions) {
  const authUser = runAuthDbCommand<AuthenticatedUser>("create-user", options)
  await setSessionCookie(page, authUser.token)
  return authUser
}

export function createTestUser(options?: AuthUserOptions) {
  return runAuthDbCommand<AuthenticatedUser>("create-user", options)
}

export async function createAuthenticatedSession(page: Page, userId: string) {
  const session = runAuthDbCommand<AuthSession>("create-session", { userId })
  await setSessionCookie(page, session.token)
  return session
}

export async function cleanupTestUser(userId: string) {
  runAuthDbCommand<void>("cleanup-user", { userId })
}

export function getMagicLinkToken(email: string) {
  return runAuthDbCommand<string | null>("get-magic-link-token", { email })
}

export function readRegisteredUserByEmail(email: string) {
  return runAuthDbCommand<RegisteredUserShell | null>("read-registered-user-by-email", { email })
}

export function cleanupTestUserByEmail(email: string) {
  runAuthDbCommand<void>("cleanup-user-by-email", { email })
}

/** Grant an ACTIVE entitlement (brand+key) to a test user — cleaned up by `cleanupTestUser`. */
export function grantTestEntitlement(userId: string, key: string, brand = "BBL") {
  runAuthDbCommand<void>("grant-entitlement", { userId, key, brand })
}

/**
 * Seed a `Post` authored by a test user so a data-dependent spec has a real row to act on regardless
 * of the DB's base seed (CI's e2e DB has zero posts). Draft by default (lands on the Drafts-first
 * `/app/blog` default). `cleanupTestUser` also deletes it; call `deleteTestPost` for eager cleanup.
 */
export function createTestPost(authorId: string, options?: { status?: "Draft" | "Published" }) {
  return runAuthDbCommand<{ id: string; slug: string }>("create-post", { authorId, ...options })
}

export function deleteTestPost(postId: string) {
  runAuthDbCommand<void>("delete-post", { postId })
}

/**
 * Seed an `Organization` (brand BBL) so a data-dependent spec has a real row REGARDLESS of the DB's
 * base seed (CI's e2e DB has exactly one org — the tournament host). Slug is caller-supplied +
 * token-keyed → unique per test, parallel-safe. Call `deleteTestOrg(id)` for eager cleanup.
 */
export function createTestOrg(name: string, slug: string) {
  return runAuthDbCommand<{ id: string; slug: string }>("create-org", { name, slug })
}

export function deleteTestOrg(orgId: string) {
  runAuthDbCommand<void>("delete-org", { orgId })
}
