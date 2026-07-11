"use client"

import { BeltFilter } from "./belt-filter"
import { CategoryFilter } from "./category-filter"
import { DisciplineFilter } from "./discipline-filter"
import { PositionFilter } from "./position-filter"

/**
 * Technique filter bar — the directory-filters analogue, decomposed into a colocated
 * folder module (component-launch-sweep recipe step 1, mirroring the SESSION_0353 /
 * directory sweep). This `index.tsx` is the thin orchestrator and the module's ONLY
 * public export: it composes the facets and is the import boundary
 * (`~/components/web/techniques/technique-filters`). Each facet is a private,
 * single-responsibility file; the shared `useFilters` state + the discipline-options
 * loader live in `use-technique-filters`.
 *
 * Facets: category + position are static enums (inlined to avoid bundling the Prisma
 * client client-side); discipline + belt load brand-scoped options from the server and
 * hide themselves when there are none (belt = the tagged-belt facet, Stream D1). Clearing
 * is handled by the global `Filters` reset (no cross-facet resets — unlike directory's
 * discipline→rank, the technique belt facet is flat, not discipline-scoped).
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export const TechniqueFilters = () => {
  return (
    <>
      <CategoryFilter />
      <PositionFilter />
      <BeltFilter />
      <DisciplineFilter />
    </>
  )
}
