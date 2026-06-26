import { eachDayOfInterval, format, isSameDay, startOfDay, subDays } from "date-fns"
import { cacheLife, cacheTag } from "next/cache"
import type { ComponentProps } from "react"
import type { ChartData } from "~/components/admin/chart"
import { MetricChart } from "~/components/admin/metrics/metric-chart"
import type { Card } from "~/components/common/card"
import { db } from "~/services/db"

const getUsers = async () => {
  "use cache"

  cacheTag("users")
  cacheLife("minutes")

  const users = await db.user.findMany({
    where: { createdAt: { gte: startOfDay(subDays(new Date(), 30)) } },
  })

  const results: ChartData[] = eachDayOfInterval({
    start: subDays(new Date(), 30),
    end: new Date(),
  }).map(day => ({
    date: format(day, "yyyy-MM-dd"),
    value: users.filter(user => isSameDay(user.createdAt, day)).length,
  }))

  const totalUsers = users.length
  const averageUsers = results.reduce((sum, day) => sum + day.value, 0) / results.length

  return {
    results,
    totalUsers,
    averageUsers,
  }
}

const UserMetric = async ({ ...props }: ComponentProps<typeof Card>) => {
  const { results, totalUsers, averageUsers } = await getUsers()

  return (
    <MetricChart
      header={{
        title: "Users",
        value: totalUsers.toLocaleString(),
        note: "last 30 days",
      }}
      chart={{
        data: results,
        dataLabel: "User",
        average: averageUsers,
        cellClassName: "bg-chart-1",
      }}
      {...props}
    />
  )
}

export { UserMetric }
