import { Grid } from "~/components/web/ui/grid"
import { DisciplineCardSkeleton } from "./discipline-card"

export function DisciplineListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Grid>
      {[...Array(count)].map((_, index) => (
        <DisciplineCardSkeleton key={index} />
      ))}
    </Grid>
  )
}
