import { TournamentForm } from "~/app/admin/tournaments/_components/tournament-form"
import { Wrapper } from "~/components/common/wrapper"
import { getRequestBrand } from "~/lib/brand-context"
import { db } from "~/services/db"

export default async () => {
  const brand = await getRequestBrand()
  const organizations = await db.organization.findMany({
    where: { brand },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  return (
    <Wrapper size="md" gap="sm">
      <TournamentForm title="Create tournament" organizations={organizations} />
    </Wrapper>
  )
}
