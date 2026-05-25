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
  await prisma.registrationEntry.deleteMany({ where: { registration: { userId } } })
  await prisma.registration.deleteMany({ where: { userId } })
  await prisma.weighInRecord.deleteMany({ where: { userId } })
  await prisma.session.deleteMany({ where: { userId } })
  await prisma.directoryProfile.deleteMany({ where: { userId } })
  await prisma.passport.deleteMany({ where: { userId } })
  await prisma.user.deleteMany({ where: { id: userId } })
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
} else {
  throw new Error(`Unknown auth-db command: ${command ?? "<missing>"}`)
}
