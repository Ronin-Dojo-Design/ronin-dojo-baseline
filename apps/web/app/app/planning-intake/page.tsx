import type { Metadata } from "next"
import { Suspense } from "react"
import { PlanningIntakeTable } from "~/app/app/planning-intake/_components/planning-intake-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { requirePermission } from "~/lib/auth-guard"
import { getPageMetadata } from "~/lib/pages"
import { findPlanningIntakeForAdmin } from "~/server/admin/planning-intake/queries"
import { planningIntakeTableParamsCache } from "~/server/admin/planning-intake/schema"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/**
 * The PlanningIntake triage AdminCollection index (SESSION_0592) — a SIBLING collection of
 * `/app/techniques` / `/app/reports`, gated INLINE (matches the techniques precedent: no
 * subordinate non-staff routes to protect here, so a `layout.tsx` gate would add nothing).
 * Lists the `FeatureWidget` idea-dump rows so an admin can triage them before hand-promoting
 * into `planning-ledger.md` PL rows (never automated).
 */
export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/app/planning-intake",
    metadata: {
      title: "Planning Intake",
      description: "Triage admin-submitted feature, bug, design, and note ideas.",
      robots: { index: false, follow: false },
    },
  })
}

export default async ({ searchParams }: PageProps<"/app/planning-intake">) => {
  await requirePermission(APP_AREA_PERMISSIONS.planningIntake)

  const search = planningIntakeTableParamsCache.parse(await searchParams)
  const rowsPromise = findPlanningIntakeForAdmin(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Planning Intake" />}>
      <PlanningIntakeTable rowsPromise={rowsPromise} />
    </Suspense>
  )
}
