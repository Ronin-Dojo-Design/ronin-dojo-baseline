import { notFound } from "next/navigation"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { H4 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { RegistrationsTable } from "~/components/admin/tournaments/registrations-table"
import { findTournamentById } from "~/server/admin/tournaments/queries"
import { findRegistrationsByTournamentId } from "~/server/admin/tournaments/registrations-queries"
import { getRequestBrand } from "~/lib/brand-context"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const brand = await getRequestBrand()
  const tournament = await findTournamentById(id)

  if (!tournament) {
    return notFound()
  }

  const registrations = await findRegistrationsByTournamentId(id, brand)

  return (
    <Wrapper size="md" gap="sm">
      <H4>Registrations — {tournament.name}</H4>
      <RegistrationsTable
        registrations={registrations}
        tournamentName={tournament.name}
      />
    </Wrapper>
  )
})
