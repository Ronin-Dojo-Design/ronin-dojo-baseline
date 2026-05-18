"use server"

import { actionClient } from "~/lib/safe-actions"
import { db } from "~/services/db"

export const findMemberFilterOptions = actionClient.action(async () => {
  const disciplines = await db.discipline.findMany({
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return {
    disciplines: disciplines.map(d => ({ slug: d.slug, name: d.name })),
  }
})

export const findSchoolFilterOptions = actionClient.action(async () => {
  const disciplines = await db.discipline.findMany({
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })

  return {
    disciplines: disciplines.map(d => ({ slug: d.slug, name: d.name })),
  }
})
