import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"

/**
 * Client-safe params/row contract for the `/app/inbox` AdminCollection (G-033 slice 1,
 * SESSION_0639) — mirrors `server/admin/planning-intake/schema.ts`. Lives in the kernel-shaped
 * `server/inbox/` module (no Prisma imports here: the row type is a plain serializable shape so
 * the client table never touches the server-only oRPC router types, and `brand` is a plain
 * string — the Brand enum is never value-imported into client-shared code).
 */

/** Triage states as plain strings (pinned: no new enum). */
export const INBOX_TRIAGE_STATUSES = ["UNREAD", "READ", "ARCHIVED"] as const
export type InboxTriageStatus = (typeof INBOX_TRIAGE_STATUSES)[number]

/**
 * Brand filter values as string literals — the Prisma `Brand` enum's members without
 * value-importing the enum into client-shared code (the known trap). Kept in sync by the
 * type-check in `server/inbox/resend-payload.ts` (its map is typed against the real enum).
 */
export const INBOX_BRANDS = ["RONIN_DOJO_DESIGN", "BASELINE_MARTIAL_ARTS", "BBL", "WEKAF"] as const
export type InboxBrand = (typeof INBOX_BRANDS)[number]

/** Short facet/badge labels for the brand column. */
export const INBOX_BRAND_LABELS: Record<InboxBrand, string> = {
  RONIN_DOJO_DESIGN: "Ronin Dojo Design",
  BASELINE_MARTIAL_ARTS: "Baseline",
  BBL: "BBL",
  WEKAF: "WEKAF",
}

/** Sortable column ids — the oRPC router's zod enum and the page's sort filter share this. */
export const INBOX_SORTABLE_COLUMNS = [
  "fromAddress",
  "subject",
  "receivedAt",
  "triageStatus",
] as const
export type InboxSortableColumn = (typeof INBOX_SORTABLE_COLUMNS)[number]

/** What the oRPC `inbox.list` read returns per row (rawPayload/bodies deliberately excluded). */
export type InboxEmailRow = {
  id: string
  fromAddress: string
  toAddress: string
  subject: string
  brand: string | null
  receivedAt: Date
  triageStatus: string
}

export type InboxListResult = {
  rows: InboxEmailRow[]
  total: number
  pageCount: number
}

/**
 * `status` defaults to `UNREAD` so the surface opens on the untriaged queue (the reason this
 * list exists — mirrors planning-intake's `NEW` default); `"all"` clears it. `fromAddress`
 * backs the toolbar search field (param name = column id, the AdminCollection filter contract).
 */
export const inboxTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<InboxEmailRow>().withDefault([{ id: "receivedAt", desc: true }]),
  fromAddress: parseAsString.withDefault(""),
  status: parseAsStringEnum([...INBOX_TRIAGE_STATUSES, "all"] as const).withDefault("UNREAD"),
  brand: parseAsArrayOf(parseAsStringEnum<InboxBrand>([...INBOX_BRANDS])).withDefault([]),
}

export const inboxTableParamsCache = createSearchParamsCache(inboxTableParamsSchema)
export type InboxTableSchema = Awaited<ReturnType<typeof inboxTableParamsCache.parse>>
