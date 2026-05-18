import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

interface DisciplineCardProps {
  discipline: {
    id: string
    name: string
    slug: string
    code: string | null
    defaultInstructorTitle: string | null
    _count: {
      organizations: number
      rankSystems: number
      memberships: number
      programs: number
      courses: number
    }
  }
}

export function DisciplineCard({ discipline }: DisciplineCardProps) {
  return (
    <Link href={`/disciplines/${discipline.slug}`} className="no-underline">
      <Card className="h-full transition-colors hover:border-foreground/20">
        <CardHeader>
          <Stack size="sm" direction="column">
            <Stack size="sm">
              <H4 as="h3">{discipline.name}</H4>
              {discipline.code && (
                <Badge variant="outline" size="sm">
                  {discipline.code}
                </Badge>
              )}
            </Stack>

            <Stack size="xs" className="text-sm text-muted-foreground">
              <span>
                {discipline._count.rankSystems} rank system
                {discipline._count.rankSystems !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                {discipline._count.organizations} org
                {discipline._count.organizations !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>
                {discipline._count.memberships} member
                {discipline._count.memberships !== 1 ? "s" : ""}
              </span>
            </Stack>

            {discipline.defaultInstructorTitle && (
              <span className="text-xs text-muted-foreground">
                Instructor: {discipline.defaultInstructorTitle}
              </span>
            )}
          </Stack>
        </CardHeader>
      </Card>
    </Link>
  )
}
