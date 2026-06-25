import { notFound } from "next/navigation"
import { TournamentRoleForm } from "~/app/app/tournaments/roles/_components/tournament-role-form"
import { Wrapper } from "~/components/common/wrapper"
import { findTournamentRoleById } from "~/server/admin/tournaments/queries"

export default async ({ params }: PageProps<"/app/tournaments/roles/[id]">) => {
  const { id } = await params
  const role = await findTournamentRoleById(id)

  if (!role) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <TournamentRoleForm title="Update tournament role" role={role} />
    </Wrapper>
  )
}
