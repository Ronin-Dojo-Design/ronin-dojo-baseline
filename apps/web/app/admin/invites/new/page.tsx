import { InviteForm } from "~/app/admin/invites/_components/invite-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { findOrganizationOptions } from "~/server/admin/programs/queries"

export default withAdminPage(async () => {
  const organizations = await findOrganizationOptions()

  return <InviteForm title="New Invite" organizations={organizations} />
})
