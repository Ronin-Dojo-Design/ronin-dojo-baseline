import { notFound } from "next/navigation"
import { LeadForm } from "~/app/admin/leads/_components/lead-form"
import { FollowUpPanel } from "~/app/admin/leads/[id]/_components/follow-up-panel"
import { LeadStatusActions } from "~/app/admin/leads/[id]/_components/lead-status-actions"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findLeadById, findOrganizationList } from "~/server/admin/leads/queries"

export default withAdminPage(async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const lead = await findLeadById(id)

  if (!lead) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <LeadStatusActions lead={lead} />
      <LeadForm
        title={`Edit ${[lead.firstName, lead.lastName].filter(Boolean).join(" ")}`}
        lead={lead}
        organizationsPromise={findOrganizationList()}
      />
      <FollowUpPanel lead={lead} />
    </Wrapper>
  )
})
