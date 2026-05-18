import type { Brand } from "~/.generated/prisma/client"
import { EmptyList } from "~/components/web/empty-list"
import { Grid } from "~/components/web/ui/grid"
import { findDisciplines } from "~/server/web/disciplines/queries"
import { DisciplineCard } from "./discipline-card"

interface DisciplineListProps {
  brand: Brand
}

export async function DisciplineList({ brand }: DisciplineListProps) {
  const disciplines = await findDisciplines(brand)

  if (disciplines.length === 0) {
    return (
      <Grid>
        <EmptyList>No disciplines found.</EmptyList>
      </Grid>
    )
  }

  return (
    <Grid>
      {disciplines.map(discipline => (
        <DisciplineCard key={discipline.id} discipline={discipline} />
      ))}
    </Grid>
  )
}
