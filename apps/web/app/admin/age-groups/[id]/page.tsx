import { notFound } from "next/navigation"
import { AgeGroupForm } from "~/app/admin/age-groups/_components/age-group-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { findAgeGroupById } from "~/server/admin/age-groups/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/age-groups/[id]">) => {
  const { id } = await params
  const ageGroup = await findAgeGroupById(id)

  if (!ageGroup) {
    notFound()
  }

  return <AgeGroupForm title="Edit Age Group" ageGroup={ageGroup} />
})
