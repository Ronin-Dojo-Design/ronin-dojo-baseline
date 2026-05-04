"use server"

import { actionClient } from "~/lib/safe-actions"
import { db } from "~/services/db"

export const findTechniqueFilterOptions = actionClient.action(async () => {
  const disciplines = await db.discipline.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return {
    disciplines: disciplines.map(d => ({ slug: d.slug, name: d.name })),
  }
})
