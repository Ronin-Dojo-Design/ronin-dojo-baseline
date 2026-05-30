import type { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { db } from "~/services/db"

type SchoolsSectionProps = {
  disciplineId: string
  brand: Brand
}

/**
 * Server component listing DOJO/SCHOOL-type organizations for a discipline.
 */
export async function SchoolsSection({ disciplineId, brand }: SchoolsSectionProps) {
  const orgLinks = await db.organizationDiscipline.findMany({
    where: {
      disciplineId,
      organization: {
        brand,
        type: { in: ["DOJO", "SCHOOL"] },
      },
    },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, type: true, city: true, state: true },
      },
    },
    take: 20,
  })

  if (orgLinks.length === 0) {
    return (
      <section>
        <H4 render={props => <h3 {...props}>{props.children}</h3>}>Schools & Dojos</H4>
        <EmptyList>No schools listed yet.</EmptyList>
      </section>
    )
  }

  return (
    <section>
      <H4 render={props => <h3 {...props}>{props.children}</h3>} className="mb-4">
        Schools & Dojos ({orgLinks.length})
      </H4>
      <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3">
        {orgLinks.map(({ organization: org }) => (
          <Link key={org.id} href={`/organizations/${org.slug}`} className="no-underline">
            <Card className="h-full transition-colors hover:border-foreground/20">
              <CardHeader>
                <Stack size="sm" direction="column">
                  <span className="font-medium">{org.name}</span>
                  <Stack size="xs" className="text-sm text-muted-foreground">
                    <Badge variant="outline" size="sm">
                      {org.type}
                    </Badge>
                    {(org.city || org.state) && (
                      <span>{[org.city, org.state].filter(Boolean).join(", ")}</span>
                    )}
                  </Stack>
                </Stack>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
