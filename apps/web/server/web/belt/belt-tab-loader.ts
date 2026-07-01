import "server-only"

import type { CreatableOption } from "~/components/common/creatable-combobox"
import type { BeltMediaItem, BeltRankViewModel } from "~/components/web/belt/belt-view-model"
import type { MediaType, Prisma } from "~/.generated/prisma/client"
import { ceilingSortOrder } from "~/server/belt/belt-gate"
import { getBjjDisciplineId, toBeltCard, toGateAward } from "~/server/belt/queries"
import { getBjjRanksForClaimPicker } from "~/server/web/lineage/rank-queries"
import { getJoinWizardOptions } from "~/server/web/lineage/join-options"
import { db } from "~/services/db"

/**
 * The "Belts" tab server load (Slice 5 — Petey Plan 0477 §Slice 5).
 *
 * Loads EVERYTHING the belt-journey grid needs in ONE pass (no N+1): the acting
 * member's Passport, their awarded BJJ ranks, the ceiling (`pickTopAwardInDiscipline`,
 * BJJ-scoped, via `ceilingSortOrder`), the full BJJ rank ladder in `sortOrder`, and
 * — the seam Slice 4 delegated — each milestone's `MediaAttachment → Media` rows
 * joined to their `url`/`type` so the galleries render real media, not bare ids.
 *
 * BJJ-scoped throughout (BBL is a BJJ lineage product, Locked #5): the ladder, the
 * awards, and therefore the ceiling all come from the BJJ discipline resolved from
 * data (`discipline.code = "bjj"`), never hardcoded. Presentation-only view-models
 * out — no Prisma reaches the client belt components.
 */

/** Awards + their milestone media joined to the resolvable `Media` fields. */
const beltTabAwardSelect = {
  id: true,
  source: true,
  verificationStatus: true,
  awardedAt: true,
  notes: true,
  location: true,
  awardedById: true,
  awardedByPassportId: true,
  organizationId: true,
  rankId: true,
  rank: {
    select: {
      name: true,
      colorHex: true,
      sortOrder: true,
      rankSystem: { select: { disciplineId: true } },
    },
  },
  milestone: {
    select: {
      id: true,
      story: true,
      media: {
        select: {
          id: true,
          mediaId: true,
          purpose: true,
          media: { select: { url: true, type: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  },
} satisfies Prisma.RankAwardSelect

type BeltTabAward = Prisma.RankAwardGetPayload<{ select: typeof beltTabAwardSelect }>

export type BeltTabData = {
  /** One view-model per BJJ ladder rank in ascending `sortOrder`. */
  ranks: BeltRankViewModel[]
  /** The member's awarded ceiling `sortOrder`; `null` = no BJJ award (all locked). */
  ceiling: number | null
  /** The member's own Passport id — the upload target for a promotion soft-gate photo (B1). */
  passportId: string
  /** Registered promoter options (id = Passport/node ref) for the creatable combobox. */
  promoterOptions: CreatableOption[]
  /** Registered school options (id = Organization id) for the creatable combobox. */
  schoolOptions: CreatableOption[]
}

/** Reshape the join rows Slice 4's `BeltMediaItem` expects (ids → resolved URL/type). */
function resolveMedia(award: BeltTabAward): BeltMediaItem[] {
  const rows = award.milestone?.media ?? []
  return rows.flatMap(row => {
    // Drop rows whose Media was removed (SetNull leaves an orphan attachment) —
    // the gallery has nothing to render without a URL.
    if (!row.media) return []
    return [
      {
        attachmentId: row.id,
        mediaId: row.mediaId,
        purpose: row.purpose,
        url: row.media.url,
        type: row.media.type as MediaType,
      },
    ]
  })
}

/**
 * Load the belt-journey tab for the signed-in member. Returns `null` when the
 * member has no Passport yet (nothing to enrich) so the tab can render an empty
 * state instead of throwing.
 */
export async function loadBeltTabData(userId: string): Promise<BeltTabData | null> {
  const passport = await db.passport.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!passport) return null

  const disciplineId = await getBjjDisciplineId()

  // ONE pass: the ladder, the member's BJJ awards+milestone media, and the option
  // lists in parallel. Awards are pre-ordered by `rank.sortOrder desc` so the gate's
  // "first in discipline" ceiling rule holds.
  const [ladder, awards, joinOptions] = await Promise.all([
    getBjjRanksForClaimPicker(),
    db.rankAward.findMany({
      where: { passportId: passport.id, rank: { rankSystem: { disciplineId } } },
      select: beltTabAwardSelect,
      orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
    }),
    getJoinWizardOptions(),
  ])

  const ceiling = ceilingSortOrder(awards.map(toGateAward), disciplineId)

  // Index the member's awards by rankId so each ladder rank finds its card in O(1).
  const awardByRankId = new Map(awards.map(award => [award.rankId, award]))

  const ranks: BeltRankViewModel[] = ladder.map(rank => {
    const award = awardByRankId.get(rank.id)
    return {
      rank: {
        id: rank.id,
        name: rank.name,
        colorHex: rank.colorHex,
        sortOrder: rank.sortOrder,
      },
      card: award ? toBeltCard(award) : null,
      media: award ? resolveMedia(award) : [],
    }
  })

  return {
    ranks,
    ceiling,
    passportId: passport.id,
    promoterOptions: joinOptions.instructors.map(o => ({ id: o.id, name: o.name })),
    schoolOptions: joinOptions.schools.map(o => ({ id: o.id, name: o.name })),
  }
}
