import "server-only"

import { Brand } from "~/.generated/prisma/client"
import type { CreatableOption } from "~/components/common/creatable-combobox"
import type { BeltRankViewModel } from "~/components/web/belt/belt-view-model"
import { gateAwardSelect, getBjjDisciplineId } from "~/server/belt/queries"
import { projectProfileBeltEntries } from "~/server/belt/profile-projection"
import { getBjjRanksForClaimPicker } from "~/server/web/lineage/rank-queries"
import { getJoinWizardOptions } from "~/server/web/lineage/join-options"
import { db } from "~/services/db"

const PROMOTER_CAP = 300

/**
 * Registered promoter options for the belt fact-editor, keyed by **Passport id**.
 *
 * The promoter FK on `RankAward` is `awardedByPassportId` (→ Passport), and the belt
 * card pre-fills the picker from that stored passport id — so the OPTIONS must be keyed
 * by passport id too. The Join-wizard instructor picker (`getInstructorOptions`) is keyed
 * by **node id** because the claim path links `trainedUnderNodeId`; reusing it here wrote
 * a node id into the Passport FK and P2003'd on save (SESSION_0497). Hence this
 * belt-specific, passport-keyed source. Public BBL lineage people, de-duped by passport
 * (one person may hold a node in more than one tree).
 */
async function getBeltPromoterOptions(): Promise<CreatableOption[]> {
  const nodes = await db.lineageNode.findMany({
    where: {
      visibility: "PUBLIC",
      treeMembers: { some: { tree: { brand: Brand.BBL, isPublished: true } } },
    },
    select: {
      passportId: true,
      passport: { select: { displayName: true, user: { select: { name: true } } } },
    },
    orderBy: { passport: { displayName: "asc" } },
    take: PROMOTER_CAP,
  })

  const byPassport = new Map<string, string>()
  for (const node of nodes) {
    const name = (node.passport?.displayName ?? node.passport?.user?.name ?? "").trim()
    if (name && !byPassport.has(node.passportId)) byPassport.set(node.passportId, name)
  }
  return [...byPassport].map(([id, name]) => ({ id, name }))
}

/**
 * The "Belts" tab server load (Slice 5 — Petey Plan 0477 §Slice 5).
 *
 * Loads EVERYTHING the belt-journey grid needs in ONE pass (no N+1): the acting
 * member's Passport, their active BJJ RankEntries, the ceiling (`pickTopAwardInDiscipline`,
 * BJJ-scoped, via `ceilingSortOrder`), and the full BJJ rank ladder in `sortOrder`.
 * The shared `gateAwardSelect` now joins each milestone's `MediaAttachment → Media`
 * rows to their `url`/`type`, so `toBeltCard` emits render-ready media directly —
 * no separate select or URL-reconciliation pass (SESSION_0492 cleanup).
 *
 * BJJ-scoped throughout (BBL is a BJJ lineage product, Locked #5): the ladder, the
 * entries, and therefore the ceiling all come from the BJJ discipline resolved from
 * data (`discipline.code = "bjj"`), never hardcoded. Presentation-only view-models
 * out — no Prisma reaches the client belt components.
 */

export type BeltTabData = {
  /** One view-model per BJJ ladder rank in ascending `sortOrder`. */
  ranks: BeltRankViewModel[]
  /** The member's awarded ceiling `sortOrder`; `null` = no BJJ award (all locked). */
  ceiling: number | null
  /** The member's own Passport id — the upload target for a promotion soft-gate photo (B1). */
  passportId: string
  /** Registered promoter options (id = **Passport id**, matching the `awardedByPassportId` FK). */
  promoterOptions: CreatableOption[]
  /** Registered school options (id = Organization id) for the creatable combobox. */
  schoolOptions: CreatableOption[]
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

  // ONE pass: the ladder, the member's BJJ entries+milestone media, and the option
  // lists in parallel. Entries are pre-ordered by `rank.sortOrder desc` so the gate's
  // "first in discipline" ceiling rule holds.
  const [ladder, entries, joinOptions, promoterOptions] = await Promise.all([
    getBjjRanksForClaimPicker(),
    db.rankEntry.findMany({
      // PENDING records are proposed higher ranks and never affect the active ceiling.
      where: {
        passportId: passport.id,
        status: { not: "PENDING" },
        rank: { rankSystem: { disciplineId } },
      },
      select: { rankId: true, status: true, rankAward: { select: gateAwardSelect } },
      orderBy: { rank: { sortOrder: "desc" } },
    }),
    getJoinWizardOptions(),
    getBeltPromoterOptions(),
  ])

  const { ceiling, ranks } = projectProfileBeltEntries({
    ladder,
    entries,
    disciplineId,
  })

  return {
    ranks,
    ceiling,
    passportId: passport.id,
    promoterOptions,
    schoolOptions: joinOptions.schools.map(o => ({ id: o.id, name: o.name })),
  }
}
