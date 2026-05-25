/**
 * Bun-only Playwright DSR DB bridge.
 *
 * Mirrors `seed-membership-db.ts`: Playwright helpers run in Node, but the
 * generated Prisma TS client only imports cleanly under Bun. Keep all DSR DB
 * reads/writes here and call from `e2e/helpers/dsr.ts` via execFileSync.
 *
 * Commands:
 *   list-by-user  — returns DataSubjectRequest[] for a userId
 *   cleanup-by-user — deletes all DSR rows for a userId
 *
 * @added SESSION_0255
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const decodePayload = <T>() => {
  const encoded = process.argv[3]
  if (!encoded) return undefined as T | undefined
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as T
}

async function listByUser(userId: string) {
  return prisma.dataSubjectRequest.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
  })
}

async function cleanupByUser(userId: string) {
  await prisma.dataSubjectRequest.deleteMany({ where: { userId } })
}

const command = process.argv[2]

if (command === "list-by-user") {
  const payload = decodePayload<{ userId: string }>()
  if (!payload?.userId) throw new Error("Missing userId")
  const rows = await listByUser(payload.userId)
  process.stdout.write(JSON.stringify(rows))
} else if (command === "cleanup-by-user") {
  const payload = decodePayload<{ userId: string }>()
  if (!payload?.userId) throw new Error("Missing userId")
  await cleanupByUser(payload.userId)
} else {
  throw new Error(`Unknown dsr-db command: ${command ?? "<missing>"}`)
}
