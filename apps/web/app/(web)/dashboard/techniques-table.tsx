"use client"

import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/common/table"

type TechniqueRow = {
  id: string
  name: string
  slug: string
  isPublished: boolean
  difficulty: number | null
  createdAt: Date
  discipline: { id: string; name: string } | null
  organization: { id: string; name: string } | null
}

type TechniquesTableProps = {
  techniques: TechniqueRow[]
}

export function TechniquesTable({ techniques }: TechniquesTableProps) {
  if (techniques.length === 0) {
    return (
      <Note>
        No techniques found. You need to be an owner or instructor of a school to manage techniques.
      </Note>
    )
  }

  return (
    <Stack size="lg" direction="column">
      <Stack size="sm" direction="row" className="items-center justify-between">
        <H4>Techniques ({techniques.length})</H4>
        <Button size="sm" variant="primary" asChild>
          <Link href="/dashboard/techniques/new">Add Technique</Link>
        </Button>
      </Stack>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Discipline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Difficulty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {techniques.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <Link href={`/techniques/${t.slug}`} className="font-medium">
                  {t.name}
                </Link>
              </TableCell>
              <TableCell>
                {t.discipline && <Badge variant="soft">{t.discipline.name}</Badge>}
              </TableCell>
              <TableCell>
                <Badge variant={t.isPublished ? "success" : "warning"}>
                  {t.isPublished ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>{t.difficulty ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  )
}
