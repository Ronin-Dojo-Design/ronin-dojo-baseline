import type { Brand } from "~/.generated/prisma/client"
import { Card } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4 } from "~/components/common/heading"
import { db } from "~/services/db"
import { BlackBeltRailList, type RankedMember } from "./black-belt-rail-list"

type BlackBeltRailProps = {
  disciplineId: string
  brand: Brand
}

/**
 * Sidebar honor strip showing members who hold the highest rank(s) in a given
 * discipline. Queries memberships with rank snapshots; the visual reveal +
 * belt-color treatment lives in the client BlackBeltRailList (SESSION_0304).
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
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          passport: { select: { avatarUrl: true } },
        },
      },
      rank: { select: { name: true, sortOrder: true, colorHex: true } },
    },
    orderBy: { rank: { sortOrder: "desc" } },
    take: 10,
  })

  const members: RankedMember[] = topMembers.map(m => ({
    id: m.id,
    name: m.user.name ?? "Member",
    // Prefer the promoted Passport avatar, fall back to User.image.
    image: m.user.passport?.avatarUrl ?? m.user.image ?? null,
    rankName: m.rank?.name ?? null,
    colorHex: m.rank?.colorHex ?? null,
  }))

  return (
    <Card className="p-4">
      <H4 render={props => <h3 {...props}>{props.children}</h3>} className="mb-3 text-sm">
        Top Ranked
      </H4>
      {members.length === 0 ? (
        <EmptyList className="text-xs">No ranked members yet.</EmptyList>
      ) : (
        <BlackBeltRailList members={members} />
      )}
    </Card>
  )
}
