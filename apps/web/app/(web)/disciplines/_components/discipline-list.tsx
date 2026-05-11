import type { Brand } from "~/.generated/prisma/client"
import { findDisciplines } from "~/server/web/disciplines/queries"
import { DisciplineCard } from "./discipline-card"

interface DisciplineListProps {
  brand: Brand
}

export async function DisciplineList({ brand }: DisciplineListProps) {
  const disciplines = await findDisciplines(brand)

  if (disciplines.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No disciplines found.
      </p>
    )
  }

  return (
    <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
      {disciplines.map((discipline) => (
        <DisciplineCard key={discipline.id} discipline={discipline} />
      ))}
    </div>
  )
}
