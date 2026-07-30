import type React from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"
import type { LineageTreeAccessGrantRow } from "~/server/web/lineage/tree-access-queries"

/**
 * BBL-EDITOR-005 (viewer slice, SESSION_0726): read-only display of the tree's `LineageTreeAccess`
 * grants. No action buttons — grant/revoke is a deferred, supervised slice.
 */
export function TreeAccessList({ rows }: { rows: LineageTreeAccessGrantRow[] }) {
  return (
    <Card>
      <CardHeader>
        <H3>Access grants</H3>
      </CardHeader>

      <div className="w-full p-4 pt-0">
        {rows.length === 0 ? (
          <Note>No access grants</Note>
        ) : (
          <Table style={{ "--table-columns": "repeat(2, minmax(0, 1fr))" } as React.CSSProperties}>
            <TableHeader>
              <TableRow>
                <TableHead>Grantee</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Note>{row.granteeName}</Note>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" size="sm">
                      {row.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
