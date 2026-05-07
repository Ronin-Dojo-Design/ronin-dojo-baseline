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
const TS = Date.now()
let counter = 0

export async function createAuthenticatedUser(page: Page, options?: { name?: string; email?: string }) {
  counter++
  const name = options?.name ?? `e2e-user-${TS}-${counter}`
  const email = options?.email ?? `e2e-${TS}-${counter}@test.local`

  // 1. Create user
  const user = await prisma.user.create({
    data: { name, email, emailVerified: true },
  })

  // 2. Create Passport + DirectoryProfile (mirrors sign-up hook in auth.ts)
  const slug = `e2e-${TS}-${counter}`
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

  // 4. Set session cookie
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: token,
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
