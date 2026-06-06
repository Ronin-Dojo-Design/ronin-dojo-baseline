import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export type DirectoryFilterOptions = {
  disciplines: { slug: string; name: string }[]
}

export async function getDirectoryFilterOptions(brand: Brand): Promise<DirectoryFilterOptions> {
  const disciplines = await db.discipline.findMany({
    where: { brand },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return {
    disciplines: disciplines.map(d => ({ slug: d.slug, name: d.name })),
  }
}
