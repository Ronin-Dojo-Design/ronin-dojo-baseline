import { TournamentForm } from "~/app/admin/tournaments/_components/tournament-form"
import { withTournamentAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export default withTournamentAdminPage(async () => {
  const organizations = await db.organization.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <Wrapper size="md" gap="sm">
      <TournamentForm title="Create tournament" organizations={organizations} />
    </Wrapper>
  )
})
