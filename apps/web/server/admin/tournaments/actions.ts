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
  generateBracketSchema,
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

// -----------------------------------------------------------------------------
// Bracket generation
// -----------------------------------------------------------------------------

export const generateBracket = adminActionClient
  .inputSchema(generateBracketSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { divisionId, bracketName } = parsedInput

    // 1. Fetch the division and its tournament for revalidation
    const division = await db.division.findUnique({
      where: { id: divisionId },
      include: {
        tournamentDiscipline: {
          include: { tournament: { select: { id: true, slug: true } } },
        },
      },
    })

    if (!division) {
      throw new Error("Division not found")
    }

    // 2. Check no bracket already exists for this division
    const existingBracket = await db.bracket.findFirst({
      where: { divisionId },
    })

    if (existingBracket) {
      throw new Error("A bracket already exists for this division. Delete it first to regenerate.")
    }

    // 3. Fetch approved registration entries for this division
    const entries = await db.registrationEntry.findMany({
      where: {
        divisionId,
        status: "ACTIVE",
        registration: { status: "APPROVED" },
      },
      include: {
        registration: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "asc" }, // Default seed order: registration order
    })

    if (entries.length < 2) {
      throw new Error(`Need at least 2 approved entries to generate a bracket. Found ${entries.length}.`)
    }

    // 4. Calculate single-elimination bracket structure
    const competitorCount = entries.length
    const totalRounds = Math.ceil(Math.log2(competitorCount))
    const bracketSize = Math.pow(2, totalRounds) // Next power of 2
    const byeCount = bracketSize - competitorCount

    // 5. Create bracket, matches, and competitors in a transaction
    const bracket = await db.$transaction(async (tx) => {
      // Create the bracket
      const bracket = await tx.bracket.create({
        data: {
          name: bracketName || `${division.name} — Single Elimination`,
          divisionId,
          sortOrder: 0,
          seedData: {
            type: "SINGLE_ELIMINATION",
            competitorCount,
            bracketSize,
            totalRounds,
            byeCount,
          },
        },
      })

      // Build all rounds and matches
      let matchNumber = 0

      // Round 1: pair competitors, assign byes
      const round1MatchCount = bracketSize / 2
      const round1Matches: { id: string; matchNumber: number }[] = []

      for (let i = 0; i < round1MatchCount; i++) {
        matchNumber++
        const match = await tx.match.create({
          data: {
            bracketId: bracket.id,
            roundNumber: 1,
            matchNumber,
            status: "SCHEDULED",
          },
        })
        round1Matches.push({ id: match.id, matchNumber })
      }

      // Seed competitors into round 1 using standard bracket seeding
      // Slot 1 = top, Slot 2 = bottom
      let entryIndex = 0
      for (let i = 0; i < round1MatchCount; i++) {
        const match = round1Matches[i]!

        // Slot 1: always has a competitor
        if (entryIndex < entries.length) {
          await tx.matchCompetitor.create({
            data: {
              matchId: match.id,
              registrationEntryId: entries[entryIndex]!.id,
              slot: 1,
              seed: entryIndex + 1,
            },
          })
          entryIndex++
        }

        // Slot 2: competitor or BYE
        if (entryIndex < entries.length) {
          // Check if this is a bye slot (byes go at the bottom of the bracket)
          const isByeSlot = i >= round1MatchCount - byeCount

          if (isByeSlot && byeCount > 0 && entryIndex >= competitorCount) {
            // This match is a BYE — mark it
            await tx.match.update({
              where: { id: match.id },
              data: { status: "BYE" },
            })
          } else {
            await tx.matchCompetitor.create({
              data: {
                matchId: match.id,
                registrationEntryId: entries[entryIndex]!.id,
                slot: 2,
                seed: entryIndex + 1,
              },
            })
            entryIndex++
          }
        } else {
          // No more competitors — this is a BYE
          await tx.match.update({
            where: { id: match.id },
            data: { status: "BYE" },
          })
        }
      }

      // Create empty matches for subsequent rounds
      for (let round = 2; round <= totalRounds; round++) {
        const matchesInRound = bracketSize / Math.pow(2, round)
        for (let i = 0; i < matchesInRound; i++) {
          matchNumber++
          await tx.match.create({
            data: {
              bracketId: bracket.id,
              roundNumber: round,
              matchNumber,
              status: "SCHEDULED",
            },
          })
        }
      }

      return bracket
    })

    const tournamentSlug = division.tournamentDiscipline.tournament.slug

    after(async () => {
      revalidate({
        tags: [
          "tournaments",
          `tournament-${tournamentSlug}`,
          `division-${divisionId}`,
        ],
      })
    })

    return {
      bracketId: bracket.id,
      bracketName: bracket.name,
      totalRounds,
      competitorCount,
      byeCount,
    }
  })
