/**
 * Bun-only Playwright auth DB bridge.
 *
 * Playwright helpers run in Node, but this repo's generated Prisma TS client
 * imports cleanly under Bun. Keep all fixture DB writes here and call it from
 * e2e/helpers/auth.ts.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PostStatus, PrismaClient, type UserRole } from "../../.generated/prisma/client"
import { assertLiteralLocalE2eUrls } from "../../scripts/e2e-db-env"

assertLiteralLocalE2eUrls(process.env.DATABASE_URL, process.env.DIRECT_URL, {
  isCi: process.env.CI === "true",
})
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type AuthUserOptions = {
  name?: string
  email?: string
  role?: UserRole
}

type RegistrationUser = {
  userId: string
  email: string
  name: string
  emailVerified: boolean
  passportDisplayName: string | null
  directorySlug: string | null
  sessionCount: number
}

const decodePayload = <T>() => {
  const encoded = process.argv[3]
  if (!encoded) return undefined as T | undefined

  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as T
}

async function createSession(userId: string) {
  const token = crypto.randomUUID()

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  return { userId, token }
}

async function createUser(options: AuthUserOptions = {}) {
  const uid = crypto.randomUUID().slice(0, 12)
  const name = options.name ?? `e2e-user-${uid}`
  const email = options.email ?? `e2e-${uid}@test.local`
  const slug = `e2e-${uid}`

  const user = await prisma.user.create({
    data: { name, email, emailVerified: true, role: options.role ?? "user" },
  })

  const passport = await prisma.passport.create({
    data: { userId: user.id, displayName: name },
    select: { id: true },
  })
  await prisma.directoryProfile.create({ data: { passportId: passport.id, slug } })

  const session = await createSession(user.id)

  return { userId: user.id, name, email, token: session.token }
}

/**
 * Idempotently grant a user an entitlement by (brand, key) — SESSION_0529 Slice 3B, so the
 * mobile-shell spec can exercise the Elite (non-admin) MAB technique action. The Entitlement row is
 * upserted (it may already exist in a seeded DB); the ACTIVE UserEntitlement is a MANUAL_GRANT.
 */
async function grantEntitlement(payload: { userId: string; key: string; brand: string }) {
  const entitlement = await prisma.entitlement.upsert({
    where: { brand_key: { brand: payload.brand as any, key: payload.key } },
    update: {},
    create: { brand: payload.brand as any, key: payload.key, name: payload.key },
    select: { id: true },
  })
  await prisma.userEntitlement.create({
    data: {
      userId: payload.userId,
      entitlementId: entitlement.id,
      sourceType: "MANUAL_GRANT",
      status: "ACTIVE",
    },
  })
}

/**
 * Seed a single `Post` authored by a given test user, so a data-dependent spec (the WL-P2-54 A1
 * row-action guard) has a real row to act on REGARDLESS of the DB's base seed. CI's e2e DB has ZERO
 * posts (migrate + tournament fixture only), so a test that assumed a seeded post reddened `main`
 * (FS-0031). Slug is keyed to the author id → unique per test, parallel-safe. Draft by default so it
 * lands on the `/app/blog` Drafts-first default view.
 */
async function createPost(payload: { authorId: string; status?: PostStatus }) {
  const status = payload.status ?? PostStatus.Draft
  const post = await prisma.post.create({
    data: {
      title: "E2E A1 Row-Action Post",
      slug: `e2e-a1-${payload.authorId}`,
      content: "E2E A1 seed content.",
      plainText: "E2E A1 seed content.",
      status,
      publishedAt: status === PostStatus.Published ? new Date() : null,
      brand: Brand.BBL,
      author: { connect: { id: payload.authorId } },
    },
    select: { id: true, slug: true },
  })
  return post
}

async function deletePost(payload: { postId: string }) {
  await prisma.post.deleteMany({ where: { id: payload.postId } })
}

/**
 * Seed a single `Organization` so a data-dependent spec (the org-sort conformance test) has real
 * rows to order REGARDLESS of the DB's base seed. CI's e2e DB has exactly ONE org (the tournament
 * host from `globalSetup`), so a sort test that needs ≥2 differently-named rows can't prove the
 * server re-order there (FS-0031 — the local seed used to add its own orgs, which reddened `main`).
 * `slug` is caller-supplied + token-keyed → unique per test, parallel-safe. Brand BBL to match the
 * BBL-scoped surface. Returns the id for eager teardown.
 */
async function createOrg(payload: { name: string; slug: string }) {
  const org = await prisma.organization.create({
    data: { brand: Brand.BBL, name: payload.name, slug: payload.slug },
    select: { id: true, slug: true },
  })
  return org
}

async function deleteOrg(payload: { orgId: string }) {
  await prisma.organization.deleteMany({ where: { id: payload.orgId } })
}

async function cleanupUser(userId: string) {
  await prisma.userEntitlement.deleteMany({ where: { userId } })
  // Posts authored by the test user (the A1 guard seeds one) — Post.author is a required User FK, so
  // any authored row must go before the user delete. Defensive backstop even if the spec cleans up.
  await prisma.post.deleteMany({ where: { authorId: userId } })
  // Authored techniques + uploaded media (SESSION_0529 Slice 3B round-trip): Technique.author is
  // SetNull (a user delete would orphan the rows) and Media.uploadedBy has no cascade (it would
  // block the user delete), so both are removed explicitly. MediaAttachment cascades from Media.
  await prisma.technique.deleteMany({ where: { author: { userId } } })
  await prisma.media.deleteMany({ where: { uploadedById: userId } })
  await prisma.auditLog.deleteMany({ where: { userId } })
  await prisma.dataSubjectRequest.deleteMany({
    where: { OR: [{ userId }, { fulfilledBy: userId }] },
  })
  await prisma.registrationEntry.deleteMany({ where: { registration: { userId } } })
  await prisma.registration.deleteMany({ where: { userId } })
  await prisma.weighInRecord.deleteMany({ where: { userId } })
  await prisma.session.deleteMany({ where: { userId } })
  await prisma.directoryProfile.deleteMany({ where: { passport: { userId } } })
  await prisma.passport.deleteMany({ where: { userId } })
  await prisma.user.deleteMany({ where: { id: userId } })
}

async function getMagicLinkToken(email: string) {
  const verification = await prisma.verification.findFirst({
    where: {
      value: { contains: `"email":"${email}"` },
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  return verification?.identifier ?? null
}

async function readRegisteredUserByEmail(email: string): Promise<RegistrationUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      // Phase 3c: DirectoryProfile is Passport-rooted; reach it through the account's Passport.
      passport: { include: { directoryProfile: true } },
      sessions: { select: { id: true } },
    },
  })

  if (!user) return null

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    passportDisplayName: user.passport?.displayName ?? null,
    directorySlug: user.passport?.directoryProfile?.slug ?? null,
    sessionCount: user.sessions.length,
  }
}

async function cleanupUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })

  await prisma.verification.deleteMany({
    where: { value: { contains: `"email":"${email}"` } },
  })

  if (user) {
    await cleanupUser(user.id)
  }
}

const command = process.argv[2]

if (command === "create-user") {
  const user = await createUser(decodePayload<AuthUserOptions>())
  process.stdout.write(JSON.stringify(user))
} else if (command === "create-session") {
  const payload = decodePayload<{ userId: string }>()
  if (!payload?.userId) throw new Error("Missing userId")

  const session = await createSession(payload.userId)
  process.stdout.write(JSON.stringify(session))
} else if (command === "cleanup-user") {
  const payload = decodePayload<{ userId: string }>()
  if (!payload?.userId) throw new Error("Missing userId")

  await cleanupUser(payload.userId)
} else if (command === "get-magic-link-token") {
  const payload = decodePayload<{ email: string }>()
  if (!payload?.email) throw new Error("Missing email")

  process.stdout.write(JSON.stringify(await getMagicLinkToken(payload.email)))
} else if (command === "read-registered-user-by-email") {
  const payload = decodePayload<{ email: string }>()
  if (!payload?.email) throw new Error("Missing email")

  process.stdout.write(JSON.stringify(await readRegisteredUserByEmail(payload.email)))
} else if (command === "cleanup-user-by-email") {
  const payload = decodePayload<{ email: string }>()
  if (!payload?.email) throw new Error("Missing email")

  await cleanupUserByEmail(payload.email)
} else if (command === "grant-entitlement") {
  const payload = decodePayload<{ userId: string; key: string; brand: string }>()
  if (!payload?.userId || !payload.key || !payload.brand) {
    throw new Error("Missing userId/key/brand")
  }

  await grantEntitlement(payload)
} else if (command === "create-post") {
  const payload = decodePayload<{ authorId: string; status?: PostStatus }>()
  if (!payload?.authorId) throw new Error("Missing authorId")

  process.stdout.write(JSON.stringify(await createPost(payload)))
} else if (command === "delete-post") {
  const payload = decodePayload<{ postId: string }>()
  if (!payload?.postId) throw new Error("Missing postId")

  await deletePost(payload)
} else if (command === "create-org") {
  const payload = decodePayload<{ name: string; slug: string }>()
  if (!payload?.name || !payload.slug) throw new Error("Missing name/slug")

  process.stdout.write(JSON.stringify(await createOrg(payload)))
} else if (command === "delete-org") {
  const payload = decodePayload<{ orgId: string }>()
  if (!payload?.orgId) throw new Error("Missing orgId")

  await deleteOrg(payload)
} else {
  throw new Error(`Unknown auth-db command: ${command ?? "<missing>"}`)
}
