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
  scoreMatchSchema,
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

      // Auto-advance BYE winners into round 2
      if (byeCount > 0 && totalRounds > 1) {
        const byeMatches = await tx.match.findMany({
          where: { bracketId: bracket.id, roundNumber: 1, status: "BYE" },
          include: { competitors: true },
          orderBy: { matchNumber: "asc" },
        })

        for (const byeMatch of byeMatches) {
          const soloCompetitor = byeMatch.competitors[0]
          if (soloCompetitor) {
            // Mark winner on BYE match
            await tx.match.update({
              where: { id: byeMatch.id },
              data: { winnerEntryId: soloCompetitor.registrationEntryId },
            })

            // Advance to round 2
            await advanceWinner(
              tx as any,
              bracket.id,
              1,
              byeMatch.matchNumber,
              soloCompetitor.registrationEntryId,
              totalRounds,
            )
          }
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

// -----------------------------------------------------------------------------
// Match scoring + bracket advancement
// -----------------------------------------------------------------------------

/**
 * Advance a winner into the next round of a single-elimination bracket.
 * Calculates the target match and slot based on the completed match's position.
 */
async function advanceWinner(
  tx: any,
  bracketId: string,
  completedRoundNumber: number,
  completedMatchNumber: number,
  winnerEntryId: string,
  totalRounds: number,
) {
  if (completedRoundNumber >= totalRounds) {
    // Final match — no advancement needed, this is the champion
    return null
  }

  // Find all matches in the completed round to determine position within round
  const roundMatches = await (tx as any).match.findMany({
    where: { bracketId, roundNumber: completedRoundNumber },
    orderBy: { matchNumber: "asc" },
    select: { id: true, matchNumber: true },
  })

  const positionInRound = roundMatches.findIndex(
    (m: any) => m.matchNumber === completedMatchNumber,
  )

  // Next round match: pair of matches feed into one
  const nextRoundMatchIndex = Math.floor(positionInRound / 2)
  // Slot: odd position (0-indexed) in round → slot 1, even → slot 2
  const slot = (positionInRound % 2 === 0) ? 1 : 2

  // Find the target match in the next round
  const nextRoundMatches = await (tx as any).match.findMany({
    where: { bracketId, roundNumber: completedRoundNumber + 1 },
    orderBy: { matchNumber: "asc" },
    select: { id: true, matchNumber: true },
  })

  const targetMatch = nextRoundMatches[nextRoundMatchIndex]
  if (!targetMatch) {
    throw new Error(`Could not find next-round match for advancement`)
  }

  // Create the MatchCompetitor in the next round
  await (tx as any).matchCompetitor.create({
    data: {
      matchId: targetMatch.id,
      registrationEntryId: winnerEntryId,
      slot,
    },
  })

  return { matchId: targetMatch.id, slot }
}

export const scoreMatch = adminActionClient
  .inputSchema(scoreMatchSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { matchId, winnerEntryId, result, scoreData, notes } = parsedInput

    // 1. Fetch match with bracket info and competitors
    const match = await db.match.findUnique({
      where: { id: matchId },
      include: {
        bracket: {
          select: {
            id: true,
            divisionId: true,
            seedData: true,
            division: {
              select: {
                tournamentDiscipline: {
                  select: { tournament: { select: { slug: true } } },
                },
              },
            },
          },
        },
        competitors: { select: { registrationEntryId: true } },
      },
    })

    if (!match) throw new Error("Match not found")

    // 2. Validate status
    if (match.status !== "SCHEDULED" && match.status !== "IN_PROGRESS") {
      throw new Error(`Match cannot be scored — current status is ${match.status}`)
    }

    // 3. Validate winner is a competitor in this match
    const isValidWinner = match.competitors.some(
      (c) => c.registrationEntryId === winnerEntryId,
    )
    if (!isValidWinner) {
      throw new Error("Winner must be a competitor in this match")
    }

    // 4. Get total rounds from bracket seedData
    const seedData = match.bracket.seedData as any
    const totalRounds = seedData?.totalRounds ?? 1

    // 5. Score + advance in transaction
    const scored = await db.$transaction(async (tx) => {
      // Update match
      const updated = await tx.match.update({
        where: { id: matchId },
        data: {
          status: "COMPLETED",
          result,
          winnerEntryId,
          scoreData: scoreData ?? undefined,
          notes,
          endedAt: new Date(),
        },
      })

      // Advance winner to next round
      const advancement = await advanceWinner(
        tx as any,
        match.bracket.id,
        match.roundNumber,
        match.matchNumber,
        winnerEntryId,
        totalRounds,
      )

      return { match: updated, advancement }
    })

    const tournamentSlug =
      match.bracket.division.tournamentDiscipline.tournament.slug

    after(async () => {
      revalidate({
        tags: [
          "tournaments",
          `tournament-${tournamentSlug}`,
          `bracket-${match.bracket.id}`,
        ],
      })
    })

    return {
      matchId: scored.match.id,
      status: scored.match.status,
      result: scored.match.result,
      advancement: scored.advancement,
    }
  })
