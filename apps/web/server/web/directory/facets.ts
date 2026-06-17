import type { Brand } from "~/.generated/prisma/client"
import {
  type DirectoryFacetResult,
  type DirectoryFacetTab,
  mapLineageTreeToFacet,
  mapOrganizationToFacet,
  mapPersonToFacet,
} from "~/lib/directory/facet-result"
import { searchOrganizations } from "~/server/web/directory/search-organizations"
import { searchDirectoryProfiles } from "~/server/web/directory/search-profiles"
import { searchPublishedLineageTrees } from "~/server/web/lineage/queries"

/**
 * Faceted `/directory` dispatcher (SESSION_0350).
 *
 * Keeps each entity's existing privacy-aware query separate and only normalizes
 * the result rows into the shared `DirectoryFacetResult` card shape. People,
 * organizations, and trees now all reuse paginated `search*` read models.
 *
 * Params arrive already string-defaulted by `directoryFilterParamsCache` (every key has a
 * `.withDefault("")` / numeric default), so this layer no longer re-coerces `?? ""` — it routes
 * to one of three per-facet builders (SESSION_0400 simplification; removed the redundant
 * `"" → undefined → ""` round-trip the page + this dispatcher used to do).
 */

const DIRECTORY_FACET_TABS = ["people", "organizations", "trees"] as const

export function normalizeDirectoryFacetTab(value: string | null | undefined): DirectoryFacetTab {
  return (DIRECTORY_FACET_TABS as readonly string[]).includes(value ?? "")
    ? (value as DirectoryFacetTab)
    : "people"
}

export type DirectoryFacetParams = {
  q: string
  /** Discipline slug — shared cross-facet filter (people via membership slug). */
  discipline: string
  /** Organization (school) slug — applies to People (membership) + Trees (tree org). */
  org: string
  /** Rank id — applies to People only (earned RankAward). `Rank` has no slug. */
  rank: string
  /** Tree kind = `scopeType` enum value — applies to Trees only (BBL-DISCOVER-002). */
  kind: string
  /** Location filters — apply to People (profile) + Organizations (org city/state). */
  city: string
  region: string
  /** Organization type filter (orgs facet) — UI deferred; not the tab `type`. */
  orgType?: string
  page: number
  perPage: number
}

export type DirectoryFacetPage = {
  tab: DirectoryFacetTab
  results: DirectoryFacetResult[]
  total: number
  page: number
  perPage: number
}

const DEFAULT_PER_PAGE = 24

/** Pagination params are trusted from the URL, so clamp non-positive values to a sane fallback. */
const positiveOr = (value: number, fallback: number) => (value > 0 ? value : fallback)

type FacetViewer = { viewerUserId?: string | null; viewerRole?: string | null }
type FacetBuilderArgs = {
  brand: Brand
  params: DirectoryFacetParams
  page: number
  perPage: number
} & FacetViewer

export async function getDirectoryFacets({
  brand,
  tab,
  params,
  viewerUserId,
  viewerRole,
}: {
  brand: Brand
  tab: DirectoryFacetTab
  params: DirectoryFacetParams
} & FacetViewer): Promise<DirectoryFacetPage> {
  const page = positiveOr(params.page, 1)
  const perPage = positiveOr(params.perPage, DEFAULT_PER_PAGE)
  const args: FacetBuilderArgs = { brand, params, page, perPage, viewerUserId, viewerRole }

  if (tab === "organizations") return organizationsFacet(args)
  if (tab === "trees") return treesFacet(args)
  return peopleFacet(args)
}

// Orgs facet: discipline + location apply; org-slug does not (it would just be self-selection).
async function organizationsFacet({
  brand,
  params,
  page,
  perPage,
}: FacetBuilderArgs): Promise<DirectoryFacetPage> {
  const { schools, total } = await searchOrganizations(
    {
      q: params.q,
      type: params.orgType ?? "",
      discipline: params.discipline,
      city: params.city,
      region: params.region,
      sort: "",
      page,
      perPage,
    },
    brand,
  )

  return {
    tab: "organizations",
    results: schools.map(mapOrganizationToFacet),
    total,
    page,
    perPage,
  }
}

// Trees facet: discipline + org-slug + kind apply; trees carry no location.
async function treesFacet({
  brand,
  params,
  page,
  perPage,
}: FacetBuilderArgs): Promise<DirectoryFacetPage> {
  const { trees, total } = await searchPublishedLineageTrees({
    brand,
    search: {
      q: params.q,
      sort: "name.asc",
      page,
      perPage,
      discipline: params.discipline,
      organization: params.org,
      kind: params.kind,
    },
  })

  return { tab: "trees", results: trees.map(mapLineageTreeToFacet), total, page, perPage }
}

// People facet: discipline + org-slug + rank + location all apply.
async function peopleFacet({
  brand,
  params,
  page,
  perPage,
  viewerUserId,
  viewerRole,
}: FacetBuilderArgs): Promise<DirectoryFacetPage> {
  const { members, total } = await searchDirectoryProfiles(
    {
      q: params.q,
      discipline: params.discipline,
      org: params.org,
      rank: params.rank,
      sort: "",
      page,
      perPage,
      city: params.city,
      region: params.region,
    },
    brand,
    viewerUserId,
    viewerRole,
  )

  return { tab: "people", results: members.map(mapPersonToFacet), total, page, perPage }
}
