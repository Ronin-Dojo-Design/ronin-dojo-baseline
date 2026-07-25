import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { authedProcedure } from "~/server/orpc/procedure"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import {
  SOCIAL_QUEUE_SORTABLE_COLUMNS,
  SOCIAL_QUEUE_SOURCES,
  SOCIAL_QUEUE_STATUSES,
  type SocialQueueRow,
} from "~/server/social-queue/schema"
import {
  canTransition,
  CONSENT_REVOKED_REASON,
  evaluateApprovalConsent,
  REJECTABLE_STATUSES,
} from "~/server/social-queue/transitions"
import { db } from "~/services/db"

/**
 * The consent-gated social approval-queue router (SESSION_0686,
 * social-flywheel-approval-queue-spec-draft.md; ADR 0024 full-oRPC direction — no
 * next-safe-action surface here). Consumed by the `/app/social-queue` AdminCollection.
 *
 * ═══ WHAT THIS ROUTER DELIBERATELY DOES NOT DO ═══
 * There is NO publish procedure. `approve` sets `status: APPROVED` ("ready to publish") and
 * STOPS — the actual publish/send is a later wired step behind operator authorization. The
 * status machine (`server/social-queue/transitions.ts`) has no edge into `PUBLISHED`, so no
 * call sequence through this router can ever mark an item published, and a REJECTED item is
 * terminal — it can never publish.
 *
 * Authz: every procedure gates on `APP_AREA_PERMISSIONS.socialQueue` (`social-queue.manage`)
 * through the standard `meta.permission` → `can()` pipeline — the existing authz system, not a
 * new one (repo rule: 4 authz systems, never a 5th). admin `"*"` covers it.
 *
 * CONSENT (spec §2.3): every item carries a `consentBasis` recorded at enqueue time;
 * `approve` RE-verifies it against the live subject before transitioning — see
 * `evaluateApprovalConsent` for the full basis-by-basis contract.
 */

const listInput = z.object({
  status: z.union([z.enum(SOCIAL_QUEUE_STATUSES), z.literal("all")]).default("DRAFT"),
  /** Faceted source filter (empty = all event classes). */
  source: z.array(z.enum(SOCIAL_QUEUE_SOURCES)).max(SOCIAL_QUEUE_SOURCES.length).default([]),
  page: z.number().int().min(1).max(10_000).default(1),
  perPage: z.number().int().min(1).max(100).default(25),
  sort: z
    .array(z.object({ id: z.enum(SOCIAL_QUEUE_SORTABLE_COLUMNS), desc: z.boolean() }))
    .max(3)
    .default([{ id: "createdAt", desc: true }]),
})

const idInput = z.object({ id: z.string().min(1).max(191) })

const rejectInput = idInput.extend({
  /** A human reason is REQUIRED — rejection is terminal and auditable. */
  reason: z.string().trim().min(1).max(500),
})

/**
 * List select — the payload snapshot stays server-side; only the display `headline` is
 * extracted for the table (the public-data floor applies to the payload builder upstream, but
 * the list still ships strings, not the raw snapshot).
 */
const LIST_SELECT = {
  id: true,
  source: true,
  subjectKey: true,
  payload: true,
  consentBasis: true,
  status: true,
  rejectedReason: true,
  createdAt: true,
  approvedAt: true,
  approvedBy: { select: { name: true } },
} as const

/** Extract the display headline from a payload snapshot (`{ headline: string, … }`). */
const headlineOf = (payload: unknown): string | null => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const headline = (payload as Record<string, unknown>).headline
    if (typeof headline === "string" && headline.length > 0) return headline
  }
  return null
}

/**
 * @added SESSION_0688 — extract the card-preview render URL from a payload snapshot
 * (`{ ogImageUrl: "/api/og?…" }`, written by the celebration-card feeder). RELATIVE og-route
 * paths ONLY: a stored payload can never point the admin surface's <img> at an arbitrary
 * origin — anything else ships as null.
 */
const previewImageUrlOf = (payload: unknown): string | null => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const url = (payload as Record<string, unknown>).ogImageUrl
    if (typeof url === "string" && url.startsWith("/api/og?")) return url
  }
  return null
}

const list = authedProcedure
  .meta({ permission: APP_AREA_PERMISSIONS.socialQueue })
  .input(listInput)
  .handler(async ({ input }) => {
    const where = {
      ...(input.status === "all" ? {} : { status: input.status }),
      ...(input.source.length > 0 ? { source: { in: input.source } } : {}),
    }

    const orderBy = [
      ...input.sort.map(({ id, desc }) => ({ [id]: desc ? "desc" : "asc" }) as const),
      { createdAt: "desc" as const },
    ]

    const [items, total] = await db.$transaction([
      db.socialQueueItem.findMany({
        where,
        select: LIST_SELECT,
        orderBy,
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
      }),
      db.socialQueueItem.count({ where }),
    ])

    const rows: SocialQueueRow[] = items.map(item => ({
      id: item.id,
      headline: headlineOf(item.payload),
      previewImageUrl: previewImageUrlOf(item.payload),
      subjectKey: item.subjectKey,
      source: item.source,
      consentBasis: item.consentBasis,
      status: item.status,
      rejectedReason: item.rejectedReason,
      approvedByName: item.approvedBy?.name ?? null,
      createdAt: item.createdAt,
      approvedAt: item.approvedAt,
    }))

    return { rows, total, pageCount: Math.ceil(total / input.perPage) }
  })

/**
 * DRAFT → APPROVED, and STOP. Approval means "a human signed this off — ready to publish";
 * it does NOT publish, schedule, or send anything (non-negotiable #1). The live consent
 * re-check runs FIRST (spec §2.3):
 *
 * - re-check fails `consent-revoked` → the item is auto-flipped to REJECTED with
 *   `rejectedReason: "consent-revoked"` (returned, not thrown — the queue reflects reality).
 * - re-check fails `consent-unratified` / `unknown-basis` → CONFLICT; the item STAYS DRAFT.
 */
const approve = authedProcedure
  .meta({ permission: APP_AREA_PERMISSIONS.socialQueue })
  .input(idInput)
  .handler(async ({ input, context }) => {
    const item = await db.socialQueueItem.findUnique({
      where: { id: input.id },
      select: { id: true, status: true, consentBasis: true, passportId: true },
    })
    if (!item) {
      throw new ORPCError("NOT_FOUND", { message: "Queue item not found" })
    }
    if (!canTransition(item.status, "APPROVED")) {
      throw new ORPCError("CONFLICT", {
        message: `Only DRAFT items can be approved (this item is ${item.status})`,
      })
    }

    // THE CONSENT GATE — re-verified against the LIVE subject, never the enqueue-time state.
    const passport = item.passportId
      ? await db.passport.findUnique({
          where: { id: item.passportId },
          select: { userId: true },
        })
      : null
    const consent = evaluateApprovalConsent({ consentBasis: item.consentBasis, passport })

    if (!consent.ok && consent.reason === "consent-revoked") {
      // The subject can no longer consent → the draft dies (spec §2.3). Compare-and-swap on
      // DRAFT so a concurrent transition can't be clobbered.
      await db.socialQueueItem.updateMany({
        where: { id: item.id, status: "DRAFT" },
        data: { status: "REJECTED", rejectedReason: CONSENT_REVOKED_REASON },
      })
      return {
        id: item.id,
        outcome: "auto-rejected" as const,
        status: "REJECTED" as const,
        rejectedReason: CONSENT_REVOKED_REASON,
      }
    }
    if (!consent.ok) {
      throw new ORPCError("CONFLICT", {
        message:
          consent.reason === "consent-unratified"
            ? "The publicity-consent mechanism (fork F2) is not yet ratified — person-centric items cannot be approved until it lands. The item stays DRAFT."
            : "Unrecognized consent basis — refusing to approve. The item stays DRAFT.",
      })
    }

    // Compare-and-swap: `status: "DRAFT"` in the where clause makes the transition atomic — a
    // concurrent approve/reject loses the race cleanly instead of double-writing.
    const { count } = await db.socialQueueItem.updateMany({
      where: { id: item.id, status: "DRAFT" },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedById: context.user.id,
        // Deliberately ABSENT: status: "PUBLISHED", publishedAt — no publish here, ever.
      },
    })
    if (count === 0) {
      throw new ORPCError("CONFLICT", { message: "Item was transitioned by someone else" })
    }

    return { id: item.id, outcome: "approved" as const, status: "APPROVED" as const }
  })

/**
 * DRAFT|APPROVED → REJECTED (terminal). A rejected item never publishes — the machine has no
 * edge out of REJECTED. Approve-time stamps (approvedAt/approvedById) are kept for audit when
 * an APPROVED item is pulled back.
 */
const reject = authedProcedure
  .meta({ permission: APP_AREA_PERMISSIONS.socialQueue })
  .input(rejectInput)
  .handler(async ({ input }) => {
    const item = await db.socialQueueItem.findUnique({
      where: { id: input.id },
      select: { id: true, status: true },
    })
    if (!item) {
      throw new ORPCError("NOT_FOUND", { message: "Queue item not found" })
    }
    if (!canTransition(item.status, "REJECTED")) {
      throw new ORPCError("CONFLICT", {
        message: `Only ${REJECTABLE_STATUSES.join("/")} items can be rejected (this item is ${item.status})`,
      })
    }

    const { count } = await db.socialQueueItem.updateMany({
      where: { id: item.id, status: { in: REJECTABLE_STATUSES } },
      data: { status: "REJECTED", rejectedReason: input.reason },
    })
    if (count === 0) {
      throw new ORPCError("CONFLICT", { message: "Item was transitioned by someone else" })
    }

    return { id: item.id, status: "REJECTED" as const }
  })

export const socialQueue = {
  list,
  approve,
  reject,
}
