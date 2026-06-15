import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export type DirectoryLocationOption = { region: string; city: string }

export type DirectoryFilterOptions = {
  disciplines: { slug: string; name: string }[]
  organizations: { slug: string; name: string }[]
  /** Distinct, non-empty regions across PUBLIC profiles + brand organizations. */
  regions: string[]
  /** Distinct region/city pairs; City selects narrow by the chosen region client-side. */
  cities: DirectoryLocationOption[]
}

/**
 * Brand-scoped option lists for the shared `/directory` filter bar.
 *
 * Location options are sourced from PUBLIC DirectoryProfiles (so a MEMBERS_ONLY /
 * HIDDEN profile never reveals that someone exists in a city) unioned with brand
 * organizations, then deduped. Brand is always server-derived.
 */
export async function getDirectoryFilterOptions(brand: Brand): Promise<DirectoryFilterOptions> {
  // Plain sequential awaits on the single connection. Neither Promise.all nor
  // $transaction([]) is safe with the local pg driver adapter — both pipeline
  // queries and trip "client is already executing a query" (SESSION_0352/0353).
  // Disciplines are mostly system rows (`brand: null`, `isSystem: true`); match the
  // /disciplines page scope (system + brand-specific) so the filter isn't empty —
  // a plain `where: { brand }` excluded every system discipline (SESSION_0353).
  const disciplines = await db.discipline.findMany({
    where: { OR: [{ isSystem: true }, { brand }] },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })
  const organizations = await db.organization.findMany({
    where: { brand },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })
  const profileLocations = await db.directoryProfile.findMany({
    where: {
      visibility: "PUBLIC",
      passport: { user: { memberships: { some: { organization: { brand } } } } },
    },
    select: { locationRegion: true, locationCity: true },
    distinct: ["locationRegion", "locationCity"],
  })
  const orgLocations = await db.organization.findMany({
    where: { brand },
    select: { state: true, city: true },
    distinct: ["state", "city"],
  })

  const pairs = new Map<string, DirectoryLocationOption>()
  const regions = new Set<string>()

  const addLocation = (region: string | null | undefined, city: string | null | undefined) => {
    const r = (region ?? "").trim()
    const c = (city ?? "").trim()
    if (r) regions.add(r)
    if (c) pairs.set(`${r.toLowerCase()}::${c.toLowerCase()}`, { region: r, city: c })
  }

  for (const p of profileLocations) addLocation(p.locationRegion, p.locationCity)
  for (const o of orgLocations) addLocation(o.state, o.city)

  return {
    disciplines: disciplines.map(d => ({ slug: d.slug, name: d.name })),
    organizations: organizations.map(o => ({ slug: o.slug, name: o.name })),
    regions: [...regions].sort((a, b) => a.localeCompare(b)),
    cities: [...pairs.values()].sort(
      (a, b) => a.region.localeCompare(b.region) || a.city.localeCompare(b.city),
    ),
  }
}
