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
}

export async function createAuthenticatedUser(page: Page, options?: AuthUserOptions) {
  const authUser = runAuthDbCommand<AuthenticatedUser>("create-user", options)
  await setSessionCookie(page, authUser.token)
  return authUser
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
