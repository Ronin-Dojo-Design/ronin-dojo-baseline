"use client"

import type { ComponentProps } from "react"
import { Chart } from "~/components/admin/chart"
import { MetricHeader, MetricHeaderSkeleton } from "~/components/admin/metrics/metric-header"
import { Card } from "~/components/common/card"
import { Skeleton } from "~/components/common/skeleton"

type MetricChartProps = ComponentProps<typeof Card> & {
  header: ComponentProps<typeof MetricHeader>
  chart: ComponentProps<typeof Chart>
}

const MetricChart = ({ header, chart, ...props }: MetricChartProps) => {
  return (
    <Card hover={false} {...props}>
      <MetricHeader {...header} />
      <Chart {...chart} />
    </Card>
  )
}

const MetricChartSkeleton = () => {
  return (
    <Card hover={false}>
      <MetricHeaderSkeleton />
      <Skeleton className="w-full h-24" />
    </Card>
  )
}

export { MetricChart, MetricChartSkeleton }
