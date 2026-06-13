import { notFound } from "next/navigation"
import { RoleForm } from "~/app/app/roles/_components/role-form"
import { findRoleById } from "~/server/admin/roles/queries"

export default async function ({ params }: PageProps<"/app/roles/[id]">) {
  const { id } = await params
  const role = await findRoleById(id)

  if (!role) {
    notFound()
  }

  return <RoleForm title="Edit Role" roleData={role} />
}
