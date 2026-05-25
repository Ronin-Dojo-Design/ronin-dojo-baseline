import { Note } from "~/components/common/note"
import { LineageCard } from "~/components/web/lineage/lineage-card"
import { Grid } from "~/components/web/ui/grid"
import type { LineageTreeCardRow } from "~/server/web/lineage/queries"

type LineageListProps = {
  trees: LineageTreeCardRow[]
}

export const LineageList = ({ trees }: LineageListProps) => {
  if (trees.length === 0) {
    return <Note>No published lineage trees match this search.</Note>
  }

  return (
    <Grid>
      {trees.map(tree => (
        <LineageCard key={tree.id} tree={tree} />
      ))}
    </Grid>
  )
}

export type { LineageListProps }
