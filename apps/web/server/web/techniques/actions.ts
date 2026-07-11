"use server"

import { actionClient } from "~/lib/safe-actions"
import { getTechniqueBeltOptions } from "~/server/web/techniques/queries"
import { db } from "~/services/db"

export const findTechniqueFilterOptions = actionClient.action(async () => {
  // Plain sequential awaits — Promise.all / $transaction([]) pipeline queries and trip
  // the local pg adapter's "client is already executing a query" (SESSION_0352/0353).
  const disciplines = await db.discipline.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  })

  // Belt options (Stream D1) — shared with the author form (SESSION_0527 Slice 1) so the facet and
  // the belt-tag selector ride ONE list; `id` matches the technique's `beltLevelMinId` FK exactly.
  const belts = await getTechniqueBeltOptions()

  return {
    disciplines: disciplines.map(d => ({ slug: d.slug, name: d.name })),
    belts,
  }
})
