import { notFound } from "next/navigation"
import { RegistrationsTable } from "~/components/admin/tournaments/registrations-table"
import { H4 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { Brand } from "~/.generated/prisma/client"
import {
  findActiveUsers,
  findTournamentById,
  findTournamentRoles,
} from "~/server/admin/tournaments/queries"
import { findRegistrationsByTournamentId } from "~/server/admin/tournaments/registrations-queries"

export default async ({ params }: PageProps<"/app/tournaments/[id]/registrations">) => {
  const { id } = await params
  const tournament = await findTournamentById(id)

  if (!tournament) {
    return notFound()
  }

  const [registrations, roles, users] = await Promise.all([
    findRegistrationsByTournamentId(id, Brand.BBL),
    findTournamentRoles(),
    findActiveUsers(),
  ])

  const divisions = tournament.disciplines.flatMap(td =>
    td.divisions.map(d => ({
      id: d.id,
      name: `${td.discipline.name} — ${d.name}`,
      roleRequiredId: d.roleRequired?.id ?? null,
    })),
  )

  return (
    <Wrapper size="md" gap="sm">
      <H4>Registrations — {tournament.name}</H4>
      <RegistrationsTable
        registrations={registrations}
        tournamentName={tournament.name}
        tournamentId={tournament.id}
        divisions={divisions}
        roles={roles.map(r => ({ id: r.id, name: r.name }))}
        users={users}
      />
    </Wrapper>
  )
}
