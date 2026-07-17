"use client"

import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/common/table"

type TechniqueRow = {
  id: string
  name: string
  slug: string
  isPublished: boolean
  difficultyLevel: string | null
  createdAt: Date
  /**
   * Watch link, resolved server-side (SESSION_0529): profile-scoped for own authored rows.
   * `null` for DRAFTS (Desi P1) — the public watch reads are published-only, so a draft link
   * would 404; the name renders unlinked and the Status column's "Draft" badge carries the state.
   */
  href: string | null
  discipline: { id: string; name: string } | null
  organization: { id: string; name: string } | null
}

type TechniquesTableProps = {
  techniques: TechniqueRow[]
  /**
   * Whether the org-canonical create page (`/app/techniques/new`, OWNER/INSTRUCTOR-gated) is
   * reachable for this viewer (SESSION_0529 Slice 3B) — an Elite non-staff author would 404 there,
   * so the button hides and the authored plus-card is their create path.
   */
  showOrgCreate?: boolean
  /**
   * Whether the viewer holds the authoring capability (the plus-card renders above this table) —
   * steers the empty-state copy toward the action instead of reciting who is allowed (WL-P2-52:
   * the old copy read as a denial to the very member it was inviting).
   */
  canCreate?: boolean
}

export function TechniquesTable({
  techniques,
  showOrgCreate = false,
  canCreate = false,
}: TechniquesTableProps) {
  if (techniques.length === 0) {
    return (
      <Note>
        {canCreate
          ? "No techniques yet. Use “Add technique” above to publish your first one to your profile curriculum."
          : "No techniques yet. Techniques you author — or manage for your school — will show up here."}
      </Note>
    )
  }

  return (
    <Stack size="lg" direction="column">
      <Stack size="sm" direction="row" className="items-center justify-between">
        <H4>Techniques ({techniques.length})</H4>
        {/* WL-P2-52: named destination — staff also see the authored plus-card, so the two create
            affordances must say WHERE each one puts the technique (school library vs profile). */}
        {showOrgCreate && (
          <Button size="sm" variant="primary" render={<Link href="/app/techniques/new" />}>
            Add school technique
          </Button>
        )}
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
          {techniques.map(t => (
            <TableRow key={t.id}>
              <TableCell>
                {t.href ? (
                  <Link href={t.href} className="font-medium">
                    {t.name}
                  </Link>
                ) : (
                  <span className="font-medium">{t.name}</span>
                )}
              </TableCell>
              <TableCell>
                {t.discipline && <Badge variant="soft">{t.discipline.name}</Badge>}
              </TableCell>
              <TableCell>
                <Badge variant={t.isPublished ? "success" : "warning"}>
                  {t.isPublished ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>{t.difficultyLevel ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  )
}
