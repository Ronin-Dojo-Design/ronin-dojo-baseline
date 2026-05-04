import type React from "react"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"

type Division = {
  id: string
  name: string
  format: string
  gender: string
  ageMin?: number | null
  ageMax?: number | null
  weightMinKg?: any
  weightMaxKg?: any
  feeCents: number
  capacity?: number | null
  roleRequired: { name: string }
  rankMin?: { name: string } | null
  rankMax?: { name: string } | null
  _count?: { entries: number }
}

type DivisionTableProps = {
  divisions: Division[]
}

export function DivisionTable({ divisions }: DivisionTableProps) {
  if (divisions.length === 0) {
    return <Note>No divisions configured yet.</Note>
  }

  return (
    <Table style={{ "--table-columns": "repeat(7, minmax(0, 1fr))" } as React.CSSProperties}>
      <TableHeader>
        <TableRow>
          <TableHead>Division</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Weight</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Spots</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {divisions.map(div => {
          const spotsUsed = div._count?.entries ?? 0
          const spotsText = div.capacity ? `${spotsUsed}/${div.capacity}` : `${spotsUsed}`

          return (
            <TableRow key={div.id}>
              <TableCell className="font-medium">{div.name}</TableCell>
              <TableCell>
                <Badge variant="soft">{div.format.replace(/_/g, " ")}</Badge>
              </TableCell>
              <TableCell>{div.gender}</TableCell>
              <TableCell>
                {div.ageMin != null || div.ageMax != null
                  ? `${div.ageMin ?? "—"}–${div.ageMax ?? "—"}`
                  : "Open"}
              </TableCell>
              <TableCell>
                {div.weightMinKg != null || div.weightMaxKg != null
                  ? `${div.weightMinKg ?? "—"}–${div.weightMaxKg ?? "—"} kg`
                  : "Open"}
              </TableCell>
              <TableCell>
                {div.feeCents > 0 ? `$${(div.feeCents / 100).toFixed(2)}` : "Free"}
              </TableCell>
              <TableCell>{spotsText}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
