import { getTranslations } from "next-intl/server"
import type { Brand } from "~/.generated/prisma/client"
import { EmptyList } from "~/components/web/empty-list"
import { Grid } from "~/components/web/ui/grid"
import { ResultsCount } from "~/components/web/ui/results-count"
import { findDisciplines } from "~/server/web/disciplines/queries"
import { DisciplineCard } from "./discipline-card"

interface DisciplineListProps {
  brand: Brand
}

export async function DisciplineList({ brand }: DisciplineListProps) {
  const t = await getTranslations("disciplines")
  const disciplines = await findDisciplines(brand)
  const total = disciplines.length

  return (
    <>
      <ResultsCount total={total} label={t("results", { count: total })} />
      <Grid>
        {total === 0 ? (
          <EmptyList>{t("empty")}</EmptyList>
        ) : (
          disciplines.map(discipline => (
            <DisciplineCard key={discipline.id} discipline={discipline} />
          ))
        )}
      </Grid>
    </>
  )
}
