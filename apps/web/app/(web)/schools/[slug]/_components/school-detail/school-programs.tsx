import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import type { SchoolDetailView } from "./school-detail-data"

type SchoolProgramsProps = Pick<SchoolDetailView, "school">

/**
 * Programs-offered grid: one card per program with its discipline, optional age range,
 * and an optional clamped description. The orchestrator guards on a non-empty program
 * list, so this always has cards to render.
 */
export function SchoolPrograms({ school }: SchoolProgramsProps) {
  return (
    <div>
      <H4>Programs offered ({school.programs.length})</H4>
      <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3 mt-4">
        {school.programs.map(p => (
          <Card key={p.id} hover={false}>
            <CardHeader>
              <Stack size="sm" direction="column">
                <span className="font-medium">{p.name}</span>
                <Stack size="xs" className="flex-wrap">
                  {p.discipline && (
                    <Badge variant="outline" size="sm">
                      {p.discipline.name}
                    </Badge>
                  )}
                  {(p.ageMin != null || p.ageMax != null) && (
                    <Badge variant="soft" size="sm">
                      Ages {p.ageMin ?? "?"}–{p.ageMax ?? "?"}
                    </Badge>
                  )}
                </Stack>
                {p.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                )}
              </Stack>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
