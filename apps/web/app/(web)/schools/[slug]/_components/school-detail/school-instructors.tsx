import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import type { SchoolDetailView } from "./school-detail-data"

type SchoolInstructorsProps = Pick<SchoolDetailView, "instructors" | "instructorRoleCodes">

/**
 * Instructors grid: one card per active instructor membership, showing their
 * instructor role title(s), discipline, and rank. The orchestrator guards on a
 * non-empty list, so this always has cards to render. The rank badge carries a
 * data-driven `BeltSwatch` (`Rank.colorHex` on the wire) — never a hardcoded belt
 * palette (ADR 0022).
 */
export function SchoolInstructors({ instructors, instructorRoleCodes }: SchoolInstructorsProps) {
  return (
    <div>
      <H4>Instructors ({instructors.length})</H4>
      <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3 mt-4">
        {instructors.map(m => (
          <Card key={m.id} hover={false}>
            <CardHeader>
              <Stack size="sm" direction="column">
                <span className="font-medium">{m.user.name ?? "Unknown"}</span>
                <Stack size="xs" className="flex-wrap">
                  {m.roleAssignments
                    .filter(ra => instructorRoleCodes.has(ra.role.code))
                    .map(ra => (
                      <Badge key={ra.role.id} variant="soft" size="sm">
                        {ra.role.displayTitle ?? ra.role.name}
                      </Badge>
                    ))}
                  {m.discipline && (
                    <Badge variant="outline" size="sm">
                      {m.discipline.name}
                    </Badge>
                  )}
                  {m.rank && (
                    <Badge
                      variant="outline"
                      size="sm"
                      prefix={<BeltSwatch colorHex={m.rank.colorHex} />}
                    >
                      {m.rank.name}
                    </Badge>
                  )}
                </Stack>
              </Stack>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
