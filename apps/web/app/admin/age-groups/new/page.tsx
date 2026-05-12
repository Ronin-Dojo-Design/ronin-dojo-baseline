import { AgeGroupForm } from "~/app/admin/age-groups/_components/age-group-form"
import { withAdminPage } from "~/components/admin/auth-hoc"

export default withAdminPage(async () => {
  return <AgeGroupForm title="New Age Group" />
})
