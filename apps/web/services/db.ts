import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"
import { env } from "~/env"
import { uniqueSlugsExtension } from "~/prisma/extensions/unique-slugs"

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
  return new PrismaClient({ adapter }).$extends(uniqueSlugsExtension)
}

declare const globalThis: {
  dbGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const db = globalThis.dbGlobal ?? prismaClientSingleton()

export { db }

if (process.env.NODE_ENV !== "production") globalThis.dbGlobal = db
