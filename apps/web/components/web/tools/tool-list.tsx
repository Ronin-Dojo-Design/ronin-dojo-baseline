"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/web/empty-list"
import { ToolCard, ToolCardSkeleton } from "~/components/web/tools/tool-card"
import { Grid } from "~/components/web/ui/grid"
import type { ToolMany } from "~/server/web/tools/payloads"

type ToolListProps = ComponentProps<typeof Grid> & {
  tools: ToolMany[]
}

const ToolList = ({ children, tools, ...props }: ToolListProps) => {
  const t = useTranslations()

  return (
    <Grid {...props}>
      {tools.map((tool, order) => (
        <ToolCard key={tool.slug} tool={tool} style={{ order }} />
      ))}

      {tools.length ? children : <EmptyList>{t("tools.no_tools")}</EmptyList>}
    </Grid>
  )
}

const ToolListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <Grid>
      {[...Array(count)].map((_, index) => (
        <ToolCardSkeleton key={index} />
      ))}
    </Grid>
  )
}

export { ToolList, ToolListSkeleton, type ToolListProps }
