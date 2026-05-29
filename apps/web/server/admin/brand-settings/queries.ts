import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export const findBrandSettings = async (brand: Brand) => {
  return db.brandSettings.findUnique({ where: { brand } })
}

export const findAllBrandSettings = async () => {
  return db.brandSettings.findMany({ orderBy: { brand: "asc" } })
}
