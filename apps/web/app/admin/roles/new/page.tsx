import { RoleForm } from "~/app/admin/roles/_components/role-form"
import { withAdminPage } from "~/components/admin/auth-hoc"

export default withAdminPage(async () => {
  return <RoleForm title="New Role" />
})
