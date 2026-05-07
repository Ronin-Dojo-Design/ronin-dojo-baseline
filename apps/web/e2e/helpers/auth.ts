/**
 * Playwright auth helper — creates a test user + session directly in the DB,
 * then sets the Better-Auth session cookie on the browser context.
 *
 * No email, no magic link, no server round-trip.
 * Uses a standalone Prisma client (not ~/services/db) to avoid Next.js env validation.
 */
import type { Page } from "@playwright/test"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })
const AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "dev-only-change-me-before-deploy-please-rotate-when-pushed"

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

export async function createAuthenticatedUser(page: Page, options?: { name?: string; email?: string; role?: string }) {
  const uid = crypto.randomUUID().slice(0, 12)
  const name = options?.name ?? `e2e-user-${uid}`
  const email = options?.email ?? `e2e-${uid}@test.local`

  // 1. Create user
  const user = await prisma.user.create({
    data: { name, email, emailVerified: true, role: options?.role ?? "user" },
  })

  // 2. Create Passport + DirectoryProfile (mirrors sign-up hook in auth.ts)
  const slug = `e2e-${uid}`
  await prisma.$transaction([
    prisma.passport.create({ data: { userId: user.id, displayName: name } }),
    prisma.directoryProfile.create({ data: { userId: user.id, slug } }),
  ])

  // 3. Create session with known token
  const token = crypto.randomUUID()
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  // 4. Set signed session cookie (Better-Auth uses HMAC-SHA-256 signed cookies)
  const signedToken = await signCookieValue(token, AUTH_SECRET)
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: signedToken,
      domain: "localhost",
      path: "/",
    },
  ])

  return { userId: user.id, name, email, token }
}

export async function cleanupTestUser(userId: string) {
  await prisma.registrationEntry.deleteMany({ where: { registration: { userId } } })
  await prisma.registration.deleteMany({ where: { userId } })
  await prisma.weighInRecord.deleteMany({ where: { userId } })
  await prisma.session.deleteMany({ where: { userId } })
  await prisma.directoryProfile.deleteMany({ where: { userId } })
  await prisma.passport.deleteMany({ where: { userId } })
  await prisma.user.deleteMany({ where: { id: userId } })
}
