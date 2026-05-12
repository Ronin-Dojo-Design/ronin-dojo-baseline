import { notFound } from "next/navigation"
import { RoleForm } from "~/app/admin/roles/_components/role-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { findRoleById } from "~/server/admin/roles/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/roles/[id]">) => {
  const { id } = await params
  const role = await findRoleById(id)

  if (!role) {
    notFound()
  }

  return <RoleForm title="Edit Role" roleData={role} />
})
