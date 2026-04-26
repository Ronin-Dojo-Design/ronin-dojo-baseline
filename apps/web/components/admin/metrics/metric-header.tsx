import type { ComponentProps, ReactNode } from "react"
import { CardDescription, CardHeader } from "~/components/common/card"
import { H2 } from "~/components/common/heading"
import { Skeleton } from "~/components/common/skeleton"

type MetricHeaderProps = ComponentProps<typeof CardHeader> & {
  title: ReactNode
  value: ReactNode
  note?: ReactNode
}

const MetricHeader = ({ title, value, note }: MetricHeaderProps) => {
  return (
    <CardHeader>
      <CardDescription>{title}</CardDescription>
      {note && <span className="ml-auto text-xs text-muted-foreground/50">{note}</span>}
      <H2 className="w-full">{value}</H2>
    </CardHeader>
  )
}

const MetricHeaderSkeleton = () => {
  return (
    <CardHeader>
      <CardDescription>
        <Skeleton className="w-16">&nbsp;</Skeleton>
      </CardDescription>

      <H2 className="w-full">
        <Skeleton className="w-24">&nbsp;</Skeleton>
      </H2>
    </CardHeader>
  )
}

export { MetricHeader, MetricHeaderSkeleton }
