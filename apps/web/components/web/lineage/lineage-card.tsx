import Link from "next/link"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import type { LineageTreeCardRow } from "~/server/web/lineage/queries"

type LineageCardProps = {
  tree: LineageTreeCardRow
}

export const LineageCard = ({ tree }: LineageCardProps) => {
  return (
    <Link href={`/lineage/${tree.slug}`}>
      <Card>
        <CardHeader>
          <Stack size="xs" direction="column">
            <H5>{tree.name}</H5>
            {tree.description && (
              <CardDescription className="line-clamp-2">{tree.description}</CardDescription>
            )}
            <Stack size="xs">
              {tree.discipline && <Badge variant="outline">{tree.discipline.name}</Badge>}
              {tree.organization && <Badge variant="soft">{tree.organization.name}</Badge>}
              <Badge variant="soft">
                {tree.memberCount} {tree.memberCount === 1 ? "member" : "members"}
              </Badge>
            </Stack>
          </Stack>
        </CardHeader>
      </Card>
    </Link>
  )
}
