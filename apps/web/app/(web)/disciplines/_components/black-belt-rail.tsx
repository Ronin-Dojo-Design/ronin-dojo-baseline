import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { db } from "~/services/db"
import type { Brand } from "~/.generated/prisma/client"

type BlackBeltRailProps = {
  disciplineId: string
  brand: Brand
}

/**
 * Sidebar component showing members who hold the highest rank(s)
 * in a given discipline. Queries memberships with rank snapshots.
 */
export async function BlackBeltRail({ disciplineId, brand }: BlackBeltRailProps) {
  const topMembers = await db.membership.findMany({
    where: {
      disciplineId,
      brand,
      status: "ACTIVE",
      rankId: { not: null },
      rank: { sortOrder: { gte: 10 } },
    },
    include: {
      user: { select: { id: true, name: true } },
      rank: { select: { name: true, sortOrder: true } },
    },
    orderBy: { rank: { sortOrder: "desc" } },
    take: 10,
  })

  if (topMembers.length === 0) {
    return (
      <Card className="p-4">
        <H4 as="h3" className="mb-2 text-sm">Top Ranked</H4>
        <p className="text-xs text-muted-foreground">No ranked members yet.</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <H4 as="h3" className="mb-3 text-sm">Top Ranked Members</H4>
      <Stack direction="column" size="sm">
        {topMembers.map((m) => (
          <div key={m.id} className="flex items-center justify-between text-sm">
            <span className="truncate">{m.user.name ?? "Member"}</span>
            {m.rank && (
              <Badge variant="soft" size="sm">{m.rank.name}</Badge>
            )}
          </div>
        ))}
      </Stack>
    </Card>
  )
}
