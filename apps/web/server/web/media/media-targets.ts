import type { Prisma } from "~/.generated/prisma/client"

/**
 * The owner entities a web (non-admin) user can attach media to through the
 * shared capability-gated upload pipeline. Each kind maps to exactly one
 * nullable FK column on `MediaAttachment`; every other FK column stays null.
 *
 * `course` and `passport` resolvers exist (see media-authorization.ts) but have
 * no UI consumer yet — they are wired here so the next surface is a thin mount,
 * not a new pipeline (SESSION_0322 plan, "factor reusable helper").
 *
 * `rankMilestone` (SESSION_0482 — Petey Plan 0477 Slice 5) resolves ownership
 * through `RankMilestone → RankAward → Passport.userId`; the belt-journey media
 * galleries upload through this pipeline to mint a `mediaId`, then link it via the
 * belt oRPC `attachMilestoneMedia` (idempotent — no double-attach).
 */
export type MediaAttachTargetKind =
  | "promotionEvent"
  | "technique"
  | "organization"
  | "course"
  | "passport"
  | "rankMilestone"

export type MediaAttachTarget = {
  kind: MediaAttachTargetKind
  id: string
}

/** AuditLog `entityType` label for each target kind. */
export const MEDIA_TARGET_ENTITY_TYPE: Record<MediaAttachTargetKind, string> = {
  promotionEvent: "PromotionEvent",
  technique: "Technique",
  organization: "Organization",
  course: "Course",
  passport: "Passport",
  rankMilestone: "RankMilestone",
}

/**
 * Typed `where` fragment that selects the single FK column for a target.
 * An explicit switch (rather than a computed key) keeps Prisma's input types
 * intact and exhaustively checks every kind.
 */
export function mediaTargetWhere(target: MediaAttachTarget): Prisma.MediaAttachmentWhereInput {
  switch (target.kind) {
    case "promotionEvent":
      return { promotionEventId: target.id }
    case "technique":
      return { techniqueId: target.id }
    case "organization":
      return { organizationId: target.id }
    case "course":
      return { courseId: target.id }
    case "passport":
      return { passportId: target.id }
    case "rankMilestone":
      return { rankMilestoneId: target.id }
  }
}

type MediaTargetCreateData = Pick<
  Prisma.MediaAttachmentUncheckedCreateInput,
  | "promotionEventId"
  | "techniqueId"
  | "organizationId"
  | "courseId"
  | "passportId"
  | "rankMilestoneId"
>

/** Typed create fragment that sets the single FK column for a target. */
export function mediaTargetCreateData(target: MediaAttachTarget): MediaTargetCreateData {
  switch (target.kind) {
    case "promotionEvent":
      return { promotionEventId: target.id }
    case "technique":
      return { techniqueId: target.id }
    case "organization":
      return { organizationId: target.id }
    case "course":
      return { courseId: target.id }
    case "passport":
      return { passportId: target.id }
    case "rankMilestone":
      return { rankMilestoneId: target.id }
  }
}
