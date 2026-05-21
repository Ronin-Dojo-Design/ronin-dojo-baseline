"use client"

import { type ComponentProps, use } from "react"
import { MetricHeader, MetricHeaderSkeleton } from "~/components/admin/metrics/metric-header"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { cx } from "~/lib/utils"

type MetricValueProps = ComponentProps<typeof Card> & {
  label: string
  href: string
  query: Promise<number>
}

const MetricValue = ({ label, href, query, className, ...props }: MetricValueProps) => {
  const count = use(query)

  return (
    <Card className={cx("w-fit grow", className)} render={<Link href={href} />} {...props}>
      <MetricHeader title={label} value={count.toLocaleString()} />
    </Card>
  )
}

const MetricValueSkeleton = () => {
  return (
    <Card className="w-fit grow" hover={false}>
      <MetricHeaderSkeleton />
    </Card>
  )
}

export { MetricValue, MetricValueSkeleton }
