/**
 * Bun-only Playwright auth DB bridge.
 *
 * Playwright helpers run in Node, but this repo's generated Prisma TS client
 * imports cleanly under Bun. Keep all fixture DB writes here and call it from
 * e2e/helpers/auth.ts.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

type AuthUserOptions = {
  name?: string
  email?: string
  role?: string
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

  await prisma.$transaction([
    prisma.passport.create({ data: { userId: user.id, displayName: name } }),
    prisma.directoryProfile.create({ data: { userId: user.id, slug } }),
  ])

  const session = await createSession(user.id)

  return { userId: user.id, name, email, token: session.token }
}

async function cleanupUser(userId: string) {
  await prisma.auditLog.deleteMany({ where: { userId } })
  await prisma.dataSubjectRequest.deleteMany({
    where: { OR: [{ userId }, { fulfilledBy: userId }] },
  })
  await prisma.registrationEntry.deleteMany({ where: { registration: { userId } } })
  await prisma.registration.deleteMany({ where: { userId } })
  await prisma.weighInRecord.deleteMany({ where: { userId } })
  await prisma.session.deleteMany({ where: { userId } })
  await prisma.directoryProfile.deleteMany({ where: { userId } })
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
      passport: true,
      directoryProfile: true,
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
    directorySlug: user.directoryProfile?.slug ?? null,
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
} else {
  throw new Error(`Unknown auth-db command: ${command ?? "<missing>"}`)
}
