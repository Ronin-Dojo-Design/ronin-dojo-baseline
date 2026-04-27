import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Fetch disciplines available for a given brand.
 * Returns system disciplines (isSystem=true) plus brand-specific ones.
 */
export const getDisciplinesByBrand = cache(async (brand: Brand) => {
  return db.discipline.findMany({
    where: {
      OR: [{ isSystem: true }, { brand }],
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
})
