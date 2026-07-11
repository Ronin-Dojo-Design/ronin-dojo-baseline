"use server"

import { actionClient } from "~/lib/safe-actions"
import { db } from "~/services/db"

export const findTechniqueFilterOptions = actionClient.action(async () => {
  // Plain sequential awaits — Promise.all / $transaction([]) pipeline queries and trip
  // the local pg adapter's "client is already executing a query" (SESSION_0352/0353).
  const disciplines = await db.discipline.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  // Belt options (Stream D1). Scope to the rank systems of disciplines that actually have
  // published techniques (BBL → BJJ's IBJJF ladder), so the facet lists relevant belts
  // instead of every rank system. `id` matches the technique's `beltLevelMinId` FK exactly.
  const techniqueDisciplines = await db.technique.findMany({
    where: { isPublished: true },
    select: { disciplineId: true },
    distinct: ["disciplineId"],
  })
  const disciplineIds = techniqueDisciplines.map(t => t.disciplineId)
  const belts = disciplineIds.length
    ? await db.rank.findMany({
        where: { rankSystem: { disciplineId: { in: disciplineIds } } },
        select: { id: true, name: true, shortName: true, colorHex: true },
        orderBy: [{ rankSystem: { name: "asc" } }, { sortOrder: "asc" }],
      })
    : []

  return {
    disciplines: disciplines.map(d => ({ slug: d.slug, name: d.name })),
    belts,
  }
})
