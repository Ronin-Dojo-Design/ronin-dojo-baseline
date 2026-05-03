import { LeadForm } from "~/app/admin/leads/_components/lead-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findOrganizationList } from "~/server/admin/leads/queries"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <LeadForm
        title="Create lead"
        organizationsPromise={findOrganizationList()}
      />
    </Wrapper>
  )
})
