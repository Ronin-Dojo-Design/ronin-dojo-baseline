import { z } from "zod"

/**
 * Belt-journey oRPC in/out schemas (Slice 3 — Petey Plan 0477).
 *
 * `rankId` / `rankAwardId` are never remapped by any mutation (Locked #5 —
 * `updateRankAwardFact` NEVER changes `rankId`); the id inputs only IDENTIFY the
 * row, they don't move it.
 */

const cuid = z.string().min(1).max(191)

/**
 * Media purpose convention (Locked #2) — a shared-column string, not an enum.
 * Module-private: only the `MilestoneMediaPurpose` TYPE and `attachMilestoneMediaInput`
 * (below) are consumed elsewhere (SESSION_0492 dead-export trim).
 */
const MILESTONE_MEDIA_PURPOSES = ["belt", "instructor", "certificate", "competition"] as const
export type MilestoneMediaPurpose = (typeof MILESTONE_MEDIA_PURPOSES)[number]

export const upsertBeltMilestoneInput = z.object({
  rankId: cuid,
  story: z.string().max(5000).nullish(),
})

/**
 * Promoter + school each accept a TYPED FK (match) OR freetext (miss → lead).
 * Both keys are optional/nullish so a partial fact edit (e.g. only the date)
 * leaves the others untouched; passing `null` explicitly clears a value.
 */
const promoterFactInput = z
  .object({
    // A **Passport id** (the belt promoter picker is keyed by passport to match the
    // `awardedByPassportId` FK — SESSION_0497). The handler verifies it exists before
    // writing the FK. Freetext instead → `name`.
    awardedByPassportId: cuid.nullish(),
    name: z.string().max(200).nullish(),
  })
  .nullable()

export const updateRankAwardFactInput = z.object({
  rankAwardId: cuid,
  awardedAt: z.coerce.date().nullish(),
  promoter: promoterFactInput.optional(),
  school: z
    .object({
      organizationId: cuid.nullish(),
      name: z.string().max(200).nullish(),
      /**
       * ISO 3166-1 alpha-2 country for the school (Locked #7 — country belongs to
       * the SCHOOL, so it rides on the school entry, NOT a top-level award field).
       * Only consumed on the FREETEXT path → `emitSchoolLead` sets the placeholder
       * `Organization.country`; ignored when a registered `organizationId` is picked.
       */
      country: z.string().length(2).nullish(),
    })
    .nullish(),
})

export type UpdateRankAwardFactInput = z.infer<typeof updateRankAwardFactInput>

/**
 * A distinct admin command, not a flag hidden in the ordinary fact editor. The promoter
 * key is required (and may explicitly be null to clear) because invoking the command must
 * both resolve a pending proposal and apply an intentional correction.
 */
export const overrideRankAwardPromoterAsAdminInput = z.object({
  rankAwardId: cuid,
  promoter: promoterFactInput,
})

export const attachMilestoneMediaInput = z.object({
  rankMilestoneId: cuid,
  mediaId: cuid,
  purpose: z.enum(MILESTONE_MEDIA_PURPOSES),
})

export const detachMilestoneMediaInput = z.object({
  rankMilestoneId: cuid,
  mediaId: cuid,
})

export const deleteRankAwardInput = z.object({
  rankAwardId: cuid,
})

/**
 * Enriched belt card returned by the mutating procedures (the read model).
 * Module-private schema — only the inferred `BeltCardOutput` type is consumed
 * externally (SESSION_0492 dead-export trim).
 */
const beltCardOutput = z.object({
  rankAwardId: z.string(),
  rankId: z.string(),
  rankName: z.string(),
  rankSortOrder: z.number(),
  colorHex: z.string().nullable(),
  verificationStatus: z.string(),
  /**
   * Present on mutation responses so the client overlay immediately reflects the
   * RankEntry + pending-review authority instead of preserving a stale pre-save badge.
   * Server-loaded cards receive the same value through their surrounding view-model.
   */
  trustState: z.enum(["verified", "unverified", "pending_review"]).optional(),
  /**
   * B1 (ADR 0035 Amendment 1): may the member edit this award's promotion facts?
   * True only for self-added STATED backfills; false for promotion-minted /
   * imported / disputed awards (authority-owned). The card renders read-only when false.
   */
  isFactEditable: z.boolean(),
  /**
   * PER-FACT editability for the award owner (SESSION_0501 fill-blanks policy —
   * `memberFactEditability` in `belt-gate.ts`). On an authority-owned award an
   * EMPTY fact is fillable by the owner; a FILLED one is locked. Server-computed;
   * the edit form renders an input per true flag, a read-only note per false one.
   */
  factEditability: z.object({
    awardedAt: z.boolean(),
    promoter: z.boolean(),
    school: z.boolean(),
  }),
  /** Why — `SELF_BACKFILL` (full edit) / `AUTHORITY_PARTIAL` (fill blanks) / `AUTHORITY_LOCKED`. */
  editabilityReason: z.enum(["SELF_BACKFILL", "AUTHORITY_PARTIAL", "AUTHORITY_LOCKED"]),
  awardedAt: z.coerce.date().nullable(),
  promoterName: z.string().nullable(),
  awardedByPassportId: z.string().nullable(),
  /** Server-authoritative identity classification for same-session client reconciliation. */
  promoterIsRecruited: z.boolean(),
  schoolName: z.string().nullable(),
  organizationId: z.string().nullable(),
  milestone: z
    .object({
      id: z.string(),
      story: z.string().nullable(),
      media: z.array(
        z.object({
          attachmentId: z.string(),
          mediaId: z.string(),
          purpose: z.string().nullable(),
          /**
           * Render-ready media the card carries directly (SESSION_0492 cleanup):
           * the milestone select joins the resolvable `Media` fields, so the
           * galleries no longer need a separate URL-reconciliation pass. Orphaned
           * attachments (Media SetNull) are dropped at projection, so `url` is
           * always present here.
           */
          url: z.string(),
          type: z.enum(["IMAGE", "VIDEO", "YOUTUBE", "DOCUMENT"]),
        }),
      ),
    })
    .nullable(),
})

export type BeltCardOutput = z.infer<typeof beltCardOutput>
