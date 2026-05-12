import { cacheLife, cacheTag } from "next/cache"
import type { ComponentProps } from "react"
import { MetricChart } from "~/components/admin/metrics/metric-chart"
import type { Card } from "~/components/common/card"
import { getTotalVisitors } from "~/lib/analytics"

const getVisitors = async () => {
  "use cache"

  cacheTag("analytics")
  cacheLife("minutes")

  try {
    return await getTotalVisitors()
  } catch (err) {
    console.error("Analytics fetch error:", err)
    return { results: [], totalVisitors: 0, averageVisitors: 0 }
  }
}

const VisitorMetric = async ({ ...props }: ComponentProps<typeof Card>) => {
  const { results, totalVisitors, averageVisitors } = await getVisitors()

  return (
    <MetricChart
      header={{
        title: "Visitors",
        value: totalVisitors.toLocaleString(),
        note: "last 30 days",
      }}
      chart={{
        data: results,
        dataLabel: "Visitor",
        average: averageVisitors,
        cellClassName: "bg-chart-4",
      }}
      {...props}
    />
  )
}

export { VisitorMetric }
