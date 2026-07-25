import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
} from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"

/**
 * Client-safe params/row contract for the `/app/social-queue` AdminCollection (SESSION_0686,
 * social-flywheel-approval-queue-spec-draft.md §4) — mirrors `server/inbox/schema.ts`. Lives in
 * a kernel-shaped `server/social-queue/` module: no Prisma imports here, so the client table
 * never touches server-only types, and every enum rides as validated string literals (the
 * Prisma enums are never value-imported into client-shared code — the known trap).
 */

/**
 * Statuses as string literals — the Prisma `SocialQueueStatus` members. `PUBLISHED` exists in
 * the vocabulary (it is a real DB state reserved for the LATER wired publish step) but NO v1
 * code path writes it — see `server/social-queue/transitions.ts`.
 */
export const SOCIAL_QUEUE_STATUSES = ["DRAFT", "APPROVED", "REJECTED", "PUBLISHED"] as const
export type SocialQueueStatusLiteral = (typeof SOCIAL_QUEUE_STATUSES)[number]

/** Event classes as string literals — the Prisma `SocialQueueSource` members (spec E1–E5). */
export const SOCIAL_QUEUE_SOURCES = [
  "CLAIM_VERIFIED",
  "RANK_PROMOTION",
  "TECHNIQUE_FEATURED",
  "GRAPH_MILESTONE",
  "BLOG_POST",
] as const
export type SocialQueueSourceLiteral = (typeof SOCIAL_QUEUE_SOURCES)[number]

/**
 * CONSENT BASIS as string literals — the Prisma `SocialConsentBasis` members. Person-centric
 * items (`MEMBER_OPT_IN`) require an account-claimed subject Passport plus the affirmative
 * publicity opt-in (fork F2) re-verified LIVE at approve time; `AGGREGATE_ONLY` names no
 * person; `OWNED_CONTENT` is brand editorial.
 */
const SOCIAL_CONSENT_BASES = ["MEMBER_OPT_IN", "AGGREGATE_ONLY", "OWNED_CONTENT"] as const
export type SocialConsentBasisLiteral = (typeof SOCIAL_CONSENT_BASES)[number]

/** Facet/badge labels for the source column. */
export const SOCIAL_QUEUE_SOURCE_LABELS: Record<SocialQueueSourceLiteral, string> = {
  CLAIM_VERIFIED: "Claim verified",
  RANK_PROMOTION: "Belt promotion",
  TECHNIQUE_FEATURED: "Technique featured",
  GRAPH_MILESTONE: "Graph milestone",
  BLOG_POST: "Blog post",
}

/** Badge labels for the consent-basis column. */
export const SOCIAL_CONSENT_BASIS_LABELS: Record<SocialConsentBasisLiteral, string> = {
  MEMBER_OPT_IN: "Member opt-in",
  AGGREGATE_ONLY: "Aggregate only",
  OWNED_CONTENT: "Owned content",
}

/** Status labels for the status column + toolbar select. */
export const SOCIAL_QUEUE_STATUS_LABELS: Record<SocialQueueStatusLiteral, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
}

/** Sortable column ids — the oRPC router's zod enum and the page's sort filter share this. */
export const SOCIAL_QUEUE_SORTABLE_COLUMNS = ["createdAt", "status", "source"] as const
export type SocialQueueSortableColumn = (typeof SOCIAL_QUEUE_SORTABLE_COLUMNS)[number]

/**
 * What the oRPC `socialQueue.list` read returns per row. `headline` is extracted server-side
 * from the payload snapshot (the payload itself — card inputs, CTA path — stays server-only;
 * the list ships display strings, not the full snapshot).
 */
export type SocialQueueRow = {
  id: string
  headline: string | null
  /**
   * @added SESSION_0688 — relative `/api/og?…` card-preview URL extracted from the payload
   * snapshot (og-route paths ONLY — the router refuses any other payload URL); null when the
   * payload carries none. Rendered as the row thumbnail; the payload itself stays server-only.
   */
  previewImageUrl: string | null
  /** The idempotency key (`claim:<id>` · `award:<id>` · …) — the operator's fallback label. */
  subjectKey: string
  source: string
  consentBasis: string
  status: string
  rejectedReason: string | null
  approvedByName: string | null
  createdAt: Date
  approvedAt: Date | null
}

export type SocialQueueListResult = {
  rows: SocialQueueRow[]
  total: number
  pageCount: number
}

/**
 * `status` defaults to `DRAFT` so the surface opens on the review queue (the reason this list
 * exists — the inbox `UNREAD` idiom); `"all"` clears it. `source` backs the faceted filter.
 */
export const socialQueueTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<SocialQueueRow>().withDefault([{ id: "createdAt", desc: true }]),
  status: parseAsStringEnum([...SOCIAL_QUEUE_STATUSES, "all"] as const).withDefault("DRAFT"),
  source: parseAsArrayOf(
    parseAsStringEnum<SocialQueueSourceLiteral>([...SOCIAL_QUEUE_SOURCES]),
  ).withDefault([]),
}

export const socialQueueTableParamsCache = createSearchParamsCache(socialQueueTableParamsSchema)
export type SocialQueueTableSchema = Awaited<ReturnType<typeof socialQueueTableParamsCache.parse>>
