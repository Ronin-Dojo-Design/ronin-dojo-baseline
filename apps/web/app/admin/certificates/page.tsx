import { Suspense } from "react"
import { CertificatesTable } from "~/app/admin/certificates/_components/certificates-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findCertificateTemplates } from "~/server/admin/certificates/queries"
import { certificatesTableParamsCache } from "~/server/admin/certificates/schema"

export default withAdminPage(async ({ searchParams }) => {
  const search = certificatesTableParamsCache.parse(await searchParams)
  const templatesPromise = findCertificateTemplates(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Certificate Templates" />}>
      <CertificatesTable templatesPromise={templatesPromise} />
    </Suspense>
  )
})
