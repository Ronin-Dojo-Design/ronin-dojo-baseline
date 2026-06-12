import { Brand, type Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export const findRecentBblJoinLegacyCaptures = async () => {
  return await db.lead.findMany({
    where: {
      brand: Brand.BBL,
      meta: { path: ["source"], equals: "join-the-legacy" },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      createdAt: true,
      notes: true,
      meta: true,
    },
  })
}

export type BblJoinLegacyCapture = Awaited<
  ReturnType<typeof findRecentBblJoinLegacyCaptures>
>[number]

export const readLeadMetaString = (meta: Prisma.JsonValue, key: string) => {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null
  const value = meta[key]
  return typeof value === "string" && value.trim() ? value : null
}
