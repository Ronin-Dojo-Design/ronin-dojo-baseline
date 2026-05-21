import { type ComponentProps, isValidElement } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/common/hover-card"
import type { ToolMany } from "~/server/web/tools/payloads"
import { ToolCard } from "./tool-card"

type ToolHoverCardProps = ComponentProps<typeof HoverCardTrigger> & {
  tool: ToolMany
}

export const ToolHoverCard = ({
  tool,
  children,
  closeDelay = 100,
  delay = 200,
  render,
  ...props
}: ToolHoverCardProps) => {
  const shouldRenderChild = !render && isValidElement(children)

  return (
    <HoverCard>
      <HoverCardTrigger
        closeDelay={closeDelay}
        delay={delay}
        render={render ?? (shouldRenderChild ? children : undefined)}
        {...props}
      >
        {shouldRenderChild ? undefined : children}
      </HoverCardTrigger>

      <HoverCardContent
        align="start"
        className="max-w-72 border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
      >
        <ToolCard tool={tool} />
      </HoverCardContent>
    </HoverCard>
  )
}
