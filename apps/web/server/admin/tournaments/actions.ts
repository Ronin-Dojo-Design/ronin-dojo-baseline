"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { idSchema, idsSchema } from "~/server/admin/shared/schema"
import {
  tournamentSchema,
  tournamentDisciplineSchema,
  divisionSchema,
  updateTournamentStatusSchema,
} from "~/server/admin/tournaments/schema"

// -----------------------------------------------------------------------------
// Tournament CRUD
// -----------------------------------------------------------------------------

export const upsertTournament = adminActionClient
  .inputSchema(tournamentSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { id, ...input } = parsedInput

    const tournament = id
      ? await db.tournament.update({
          where: { id },
          data: input,
        })
      : await db.tournament.create({
          data: {
            ...input,
            slug: input.slug || "",
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/tournaments"],
        tags: ["tournaments", `tournament-${tournament.slug}`],
      })
    })

    return tournament
  })

export const deleteTournaments = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.tournament.deleteMany({
      where: { id: { in: ids } },
    })

    revalidate({
      paths: ["/admin/tournaments"],
      tags: ["tournaments"],
    })

    return true
  })

// -----------------------------------------------------------------------------
// Status transitions
// -----------------------------------------------------------------------------

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["CLOSED", "DRAFT"],
  CLOSED: ["ARCHIVED", "PUBLISHED"],
  ARCHIVED: [],
}

export const updateTournamentStatus = adminActionClient
  .inputSchema(updateTournamentStatusSchema)
  .action(async ({ parsedInput: { id, status }, ctx: { db, revalidate } }) => {
    const tournament = await db.tournament.findUniqueOrThrow({ where: { id } })

    const allowed = VALID_TRANSITIONS[tournament.status] ?? []
    if (!allowed.includes(status)) {
      throw new Error(
        `Cannot transition from ${tournament.status} to ${status}. Allowed: ${allowed.join(", ")}`,
      )
    }

    const updated = await db.tournament.update({
      where: { id },
      data: { status },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/tournaments"],
        tags: ["tournaments", `tournament-${updated.slug}`],
      })
    })

    return updated
  })

// -----------------------------------------------------------------------------
// Tournament Discipline CRUD
// -----------------------------------------------------------------------------

export const upsertTournamentDiscipline = adminActionClient
  .inputSchema(tournamentDisciplineSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { id, ...input } = parsedInput

    const td = id
      ? await db.tournamentDiscipline.update({
          where: { id },
          data: input,
        })
      : await db.tournamentDiscipline.create({
          data: input,
        })

    after(async () => {
      revalidate({
        tags: ["tournaments", `tournament-disciplines-${input.tournamentId}`],
      })
    })

    return td
  })

export const deleteTournamentDiscipline = adminActionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput: { id }, ctx: { db, revalidate } }) => {
    const td = await db.tournamentDiscipline.delete({ where: { id } })

    after(async () => {
      revalidate({
        tags: ["tournaments", `tournament-disciplines-${td.tournamentId}`],
      })
    })

    return true
  })

// -----------------------------------------------------------------------------
// Division CRUD
// -----------------------------------------------------------------------------

export const upsertDivision = adminActionClient
  .inputSchema(divisionSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { id, ...input } = parsedInput

    const division = id
      ? await db.division.update({
          where: { id },
          data: input,
        })
      : await db.division.create({
          data: input,
        })

    after(async () => {
      revalidate({
        tags: ["tournaments", `divisions-${input.tournamentDisciplineId}`],
      })
    })

    return division
  })

export const deleteDivision = adminActionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput: { id }, ctx: { db, revalidate } }) => {
    const division = await db.division.delete({ where: { id } })

    after(async () => {
      revalidate({
        tags: ["tournaments", `divisions-${division.tournamentDisciplineId}`],
      })
    })

    return true
  })
