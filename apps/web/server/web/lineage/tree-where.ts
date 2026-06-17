import type {
  Brand,
  LineageTreeScopeType,
  LineageVisibility,
  Prisma,
} from "~/.generated/prisma/client"

/**
 * Filter inputs that shape the published-lineage-tree `where` clause.
 * `brand` is intentionally NOT part of this type — it is always passed
 * separately and server-derived, never trusted from the URL.
 */
export type LineageTreeWhereFilters = {
  q?: string
  /** Discipline slug. */
  discipline?: string
  /** Organization (school) slug. */
  organization?: string
  /**
   * Tree **kind** = the `scopeType` enum value
   * (`BRAND` / `ORGANIZATION` / `DISCIPLINE` / `STYLE` / `PERSON` / `CUSTOM`).
   * Supplied from the URL as a raw string and validated against the enum here,
   * so a bogus value simply omits the clause rather than reaching Prisma.
   */
  kind?: string
}

/** Published + publicly-visible tree scope (mirrors `queries.ts` `PUBLIC_VISIBILITY_SCOPE`). */
const PUBLIC_TREE_VISIBILITY: LineageVisibility[] = ["PUBLIC"]

/** The `LineageTreeScopeType` members, as literals — kept type-checked against the enum union. */
const TREE_SCOPE_TYPES: readonly LineageTreeScopeType[] = [
  "BRAND",
  "ORGANIZATION",
  "DISCIPLINE",
  "STYLE",
  "PERSON",
  "CUSTOM",
]

/** Narrow a raw URL string to a real `LineageTreeScopeType` enum member. */
const isTreeScopeType = (value: string): value is LineageTreeScopeType =>
  (TREE_SCOPE_TYPES as readonly string[]).includes(value)

/**
 * Pure builder for the published, brand- and visibility-scoped LineageTree
 * `where` clause.
 *
 * Security invariant: `brand`, `isPublished`, and the PUBLIC visibility scope are
 * pinned regardless of the filter inputs, so a cross-brand `discipline`/`organization`
 * slug or a bogus `kind` supplied via the URL can only ever narrow — never widen
 * results to another brand or to unpublished/private trees.
 *
 * Type-only Prisma imports keep this builder runtime-free, so the clause — including
 * the new `kind` (scopeType) facet — is unit-testable without a database or the
 * generated client, mirroring `buildDirectoryProfileWhere`.
 */
export function buildPublishedLineageTreeWhere(
  filters: LineageTreeWhereFilters,
  brand: Brand,
): Prisma.LineageTreeWhereInput {
  const q = (filters.q ?? "").trim()
  const discipline = (filters.discipline ?? "").trim()
  const organization = (filters.organization ?? "").trim()
  const kind = (filters.kind ?? "").trim()

  const where: Prisma.LineageTreeWhereInput = {
    brand,
    isPublished: true,
    visibility: { in: PUBLIC_TREE_VISIBILITY },
    ...(discipline && { discipline: { slug: discipline } }),
    ...(organization && { organization: { slug: organization } }),
    ...(isTreeScopeType(kind) && { scopeType: kind }),
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { discipline: { name: { contains: q, mode: "insensitive" } } },
      { organization: { name: { contains: q, mode: "insensitive" } } },
    ]
  }

  return where
}
