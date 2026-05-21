"use client"

import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import { depthLabel } from "~/lib/lineage/tree-layout"
import { LineageNodeCard } from "./lineage-node-card"

/**
 * Renders the bucketed lineage rows. Each row is a depth-bucket from the
 * pure-TS layout module; nodes inside a row are sorted by display name.
 *
 * No SVG edges in MVP — alignment-only per the port spec.
 *
 * Author: Cody / SESSION_0175 TASK_03.
 */

type LineageTreeProps = {
  rows: LineageRow[]
  rootId: string
  onSelect: (nodeId: string) => void
}

export function LineageTree({ rows, rootId, onSelect }: LineageTreeProps) {
  if (rows.length === 0) {
    return <Note>This lineage has no recorded practitioners yet.</Note>
  }

  return (
    <Stack size="lg" direction="column" className="w-full">
      {rows.map(row => (
        <section key={row.depth} aria-label={depthLabel(row.depth)} className="w-full">
          <H6
            render={props => <h6 {...props}>{props.children}</h6>}
            className="mb-2 text-muted-foreground uppercase tracking-wide"
          >
            {depthLabel(row.depth)}
          </H6>
          <Stack size="md" wrap>
            {row.nodes.map(node => (
              <LineageNodeCard
                key={node.id}
                node={node}
                isRoot={node.id === rootId}
                onSelect={onSelect}
              />
            ))}
          </Stack>
        </section>
      ))}
    </Stack>
  )
}
