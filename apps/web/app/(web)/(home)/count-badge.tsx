import { formatNumber } from "@dirstack/utils"
import { subDays } from "date-fns"
import { cacheLife, cacheTag } from "next/cache"
import { getTranslations } from "next-intl/server"
import { ToolStatus } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Link } from "~/components/common/link"
import { Ping } from "~/components/common/ping"
import { db } from "~/services/db"

const getCounts = async () => {
  "use cache"

  cacheTag("tools")
  cacheLife("infinite")

  return await db.$transaction([
    db.tool.count({
      where: { status: ToolStatus.Published },
    }),

    db.tool.count({
      where: { status: ToolStatus.Published, publishedAt: { gte: subDays(new Date(), 7) } },
    }),
  ])
}

const CountBadge = async () => {
  const [count, newCount] = await getCounts()
  const t = await getTranslations("components.count_badge")

  return (
    <Badge
      prefix={<Ping />}
      className="order-first"
      render={<Link href="/?sort=publishedAt.desc" />}
    >
      {newCount
        ? t("new_tools", { count: formatNumber(newCount) })
        : t("total_tools", { count: formatNumber(count) })}
    </Badge>
  )
}

const CountBadgeSkeleton = () => {
  return (
    <Badge prefix={<Ping />} className="min-w-20 order-first pointer-events-none animate-pulse">
      &nbsp;
    </Badge>
  )
}

export { CountBadge, CountBadgeSkeleton }
