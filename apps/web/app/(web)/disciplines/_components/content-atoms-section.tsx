import type { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { db } from "~/services/db"

type ContentAtomsSectionProps = {
  disciplineId: string
  brand: Brand
}

/**
 * Server component listing published content atoms linked to a discipline.
 */
export async function ContentAtomsSection({ disciplineId, brand }: ContentAtomsSectionProps) {
  const atoms = await db.contentAtom.findMany({
    where: {
      disciplineId,
      siteTargets: { has: brand },
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      hook: true,
      channelTargets: true,
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  })

  if (atoms.length === 0) return null

  return (
    <section>
      <H4 as="h3" className="mb-4">
        Related Content ({atoms.length})
      </H4>
      <div className="grid gap-3 @md:grid-cols-2">
        {atoms.map(atom => (
          <Card key={atom.id}>
            <CardHeader>
              <Stack size="sm" direction="column">
                <span className="font-medium text-sm">{atom.title}</span>
                {atom.hook && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{atom.hook}</p>
                )}
                {atom.channelTargets.length > 0 && (
                  <Stack size="xs">
                    {atom.channelTargets.slice(0, 3).map(ch => (
                      <Badge key={ch} variant="outline" size="sm">
                        {ch}
                      </Badge>
                    ))}
                  </Stack>
                )}
              </Stack>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
