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
 */

const DIRECTORY_FACET_TABS = ["people", "organizations", "trees"] as const

export function normalizeDirectoryFacetTab(value: string | null | undefined): DirectoryFacetTab {
  return (DIRECTORY_FACET_TABS as readonly string[]).includes(value ?? "")
    ? (value as DirectoryFacetTab)
    : "people"
}

export type DirectoryFacetParams = {
  q?: string
  /** Discipline slug — shared cross-facet filter (people via membership slug). */
  discipline?: string
  /** Organization type filter (orgs facet) — UI deferred; not the tab `type`. */
  orgType?: string
  page?: number
  perPage?: number
}

export type DirectoryFacetPage = {
  tab: DirectoryFacetTab
  results: DirectoryFacetResult[]
  total: number
  page: number
  perPage: number
}

const DEFAULT_PER_PAGE = 24

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
  viewerUserId?: string | null
  viewerRole?: string | null
}): Promise<DirectoryFacetPage> {
  const page = params.page && params.page > 0 ? params.page : 1
  const perPage = params.perPage && params.perPage > 0 ? params.perPage : DEFAULT_PER_PAGE

  if (tab === "organizations") {
    const { schools, total } = await searchOrganizations(
      {
        q: params.q ?? "",
        type: params.orgType ?? "",
        discipline: params.discipline ?? "",
        sort: "",
        page,
        perPage,
      },
      brand,
    )

    return { tab, results: schools.map(mapOrganizationToFacet), total, page, perPage }
  }

  if (tab === "trees") {
    const { trees, total } = await searchPublishedLineageTrees({
      brand,
      search: {
        q: params.q ?? "",
        sort: "name.asc",
        page,
        perPage,
        discipline: params.discipline ?? "",
        organization: "",
      },
    })

    return { tab, results: trees.map(mapLineageTreeToFacet), total, page, perPage }
  }

  const { members, total } = await searchDirectoryProfiles(
    {
      q: params.q ?? "",
      discipline: params.discipline ?? "",
      sort: "",
      page,
      perPage,
      city: "",
      region: "",
    },
    brand,
    viewerUserId,
    viewerRole,
  )

  return {
    tab: "people",
    results: members.map(mapPersonToFacet),
    total,
    page,
    perPage,
  }
}
