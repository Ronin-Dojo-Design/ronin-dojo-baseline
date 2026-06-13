import { notFound } from "next/navigation"
import { ReportForm } from "~/app/app/reports/_components/report-form"
import { Wrapper } from "~/components/common/wrapper"
import { findReportById } from "~/server/admin/reports/queries"

export default async function AppReportDetailPage({ params }: PageProps<"/app/reports/[id]">) {
  const { id } = await params
  const report = await findReportById(id)

  if (!report) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <ReportForm title="Update report" report={report} />
    </Wrapper>
  )
}
