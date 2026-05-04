"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { idSchema, idsSchema } from "~/server/admin/shared/schema"
import {
  tournamentSchema,
  tournamentDisciplineSchema,
  divisionSchema,
  updateTournamentStatusSchema,
  registrationStatusUpdateSchema,
  bulkRegistrationStatusUpdateSchema,
  REGISTRATION_STATUS_TRANSITIONS,
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

// -----------------------------------------------------------------------------
// Registration status transitions (admin)
// -----------------------------------------------------------------------------

export const updateRegistrationStatus = adminActionClient
  .inputSchema(registrationStatusUpdateSchema)
  .action(async ({ parsedInput: { registrationId, status }, ctx: { db, revalidate } }) => {
    const registration = await db.registration.findUniqueOrThrow({
      where: { id: registrationId },
      select: { id: true, status: true, tournamentId: true },
    })

    const allowed = REGISTRATION_STATUS_TRANSITIONS[registration.status] ?? []
    if (!allowed.includes(status)) {
      throw new Error(
        `Cannot transition registration from ${registration.status} to ${status}. Allowed: ${allowed.join(", ") || "none"}`,
      )
    }

    const updated = await db.registration.update({
      where: { id: registrationId },
      data: { status },
    })

    // If cancelled, also cancel all entries
    if (status === "CANCELLED") {
      await db.registrationEntry.updateMany({
        where: { registrationId },
        data: { status: "CANCELLED" },
      })
    }

    after(async () => {
      revalidate({
        tags: ["tournaments", `tournament-registrations-${registration.tournamentId}`],
      })
    })

    return updated
  })

export const bulkUpdateRegistrationStatus = adminActionClient
  .inputSchema(bulkRegistrationStatusUpdateSchema)
  .action(async ({ parsedInput: { registrationIds, status }, ctx: { db, revalidate } }) => {
    const registrations = await db.registration.findMany({
      where: { id: { in: registrationIds } },
      select: { id: true, status: true, tournamentId: true },
    })

    // Validate all transitions before applying any
    const invalid = registrations.filter((r) => {
      const allowed = REGISTRATION_STATUS_TRANSITIONS[r.status] ?? []
      return !allowed.includes(status)
    })

    if (invalid.length > 0) {
      throw new Error(
        `Cannot transition ${invalid.length} registration(s): ${invalid.map((r) => `${r.id} (${r.status})`).join(", ")}`,
      )
    }

    await db.registration.updateMany({
      where: { id: { in: registrationIds } },
      data: { status },
    })

    // If cancelled, also cancel all entries
    if (status === "CANCELLED") {
      await db.registrationEntry.updateMany({
        where: { registrationId: { in: registrationIds } },
        data: { status: "CANCELLED" },
      })
    }

    const tournamentIds = [...new Set(registrations.map((r) => r.tournamentId))]

    after(async () => {
      revalidate({
        tags: [
          "tournaments",
          ...tournamentIds.map((tid) => `tournament-registrations-${tid}`),
        ],
      })
    })

    return { updated: registrationIds.length }
  })
