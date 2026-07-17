/**
 * @added   SESSION_0541 (2026-07-15)
 * @why     Remove duplicated Lead.meta coercion from school and promoter outreach flows
 * @wired   server/web/lead/emit-school-lead.ts, server/web/lead/emit-promoter-lead.ts
 */
import type { Prisma } from "~/.generated/prisma/client"

/**
 * Shared `Lead.meta` JSON coercion helpers for the demand-capture lead flows (school + promoter
 * outreach). Extracted SESSION_0541 — `emit-promoter-lead.ts` mirrored `emit-school-lead.ts` and
 * these four pure readers were byte-identical (fallow clone `dup:e1bc692a`). Pure, DB-free.
 */

/** Coerce a `Lead.meta` value to a plain record — arrays / null / primitives collapse to `{}`. */
export function jsonRecord(meta: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {}
}

/** The string members of an unknown value, trimmed-nonblank; anything else → `[]`. */
export function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : []
}

/** Dedup a string list (trimmed, blanks dropped), preserving first-seen (latest-first) order. */
export function uniqueWithLatestFirst(values: string[]): string[] {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}

/** The stored demand count on a lead's meta, or 0 when absent / malformed. */
export function demandCountFromMeta(meta: Prisma.JsonValue | null | undefined): number {
  const count = jsonRecord(meta).demandCount
  return typeof count === "number" && Number.isFinite(count) && count > 0 ? count : 0
}
