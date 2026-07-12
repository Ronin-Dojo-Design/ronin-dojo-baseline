import type { Metadata } from "next"
import { Suspense } from "react"
import { TechniquesTable } from "~/app/app/techniques/_components/techniques-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { requirePermission } from "~/lib/auth-guard"
import { getPageMetadata } from "~/lib/pages"
import { findTechniquesForAdmin } from "~/server/admin/techniques/queries"
import { techniquesTableParamsCache } from "~/server/admin/techniques/schema"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

/**
 * The Techniques AdminCollection index (FI-027, ADR 0045) — a SIBLING collection of
 * `/app/tools`, not a mount underneath. Completes the ADR-0046 promote loop: staff
 * discover authored techniques awaiting the SESSION_0529 3C `isFeatured` promotion, then
 * click a row into `/app/techniques/[id]` to promote.
 *
 * Gated INLINE (not via a subtree layout): a `techniques/layout.tsx` would also clobber the
 * deliberately author-accessible `[id]` / `new` routes, where a non-staff org OWNER/INSTRUCTOR
 * edits/creates their org techniques. Only this index is staff-only.
 */
export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/app/techniques",
    metadata: {
      title: "Techniques",
      description: "Browse and promote authored techniques.",
      robots: { index: false, follow: false },
    },
  })
}

export default async ({ searchParams }: PageProps<"/app/techniques">) => {
  await requirePermission(APP_AREA_PERMISSIONS.techniques)

  const search = techniquesTableParamsCache.parse(await searchParams)
  const techniquesPromise = findTechniquesForAdmin(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Techniques" />}>
      <TechniquesTable techniquesPromise={techniquesPromise} />
    </Suspense>
  )
}
