import { notFound } from "next/navigation"
import { AgeGroupForm } from "~/app/app/age-groups/_components/age-group-form"
import { findAgeGroupById } from "~/server/admin/age-groups/queries"

export default async ({ params }: PageProps<"/app/age-groups/[id]">) => {
  const { id } = await params
  const ageGroup = await findAgeGroupById(id)

  if (!ageGroup) {
    notFound()
  }

  return <AgeGroupForm title="Edit Age Group" ageGroup={ageGroup} />
}
