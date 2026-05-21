"use client"

import { PreviewCard } from "@base-ui/react/preview-card"
import { cx } from "~/lib/utils"

const hoverCardAnimationClasses = [
  "origin-(--transform-origin)",
  "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-98",
  "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-98",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=bottom]:slide-out-to-top-2",
  "data-[side=left]:slide-in-from-right-2 data-[side=left]:slide-out-to-right-2",
  "data-[side=right]:slide-in-from-left-2 data-[side=right]:slide-out-to-left-2",
  "data-[side=top]:slide-in-from-bottom-2 data-[side=top]:slide-out-to-bottom-2",
]

function HoverCard({ ...props }: PreviewCard.Root.Props) {
  return <PreviewCard.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: PreviewCard.Trigger.Props) {
  return <PreviewCard.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardArrow({ ...props }: PreviewCard.Arrow.Props) {
  return <PreviewCard.Arrow data-slot="hover-card-arrow" {...props} />
}

function HoverCardContent({
  className,
  align = "center",
  side,
  sideOffset = 4,
  ...props
}: PreviewCard.Popup.Props & Pick<PreviewCard.Positioner.Props, "align" | "side" | "sideOffset">) {
  return (
    <PreviewCard.Portal>
      <PreviewCard.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PreviewCard.Popup
          data-slot="hover-card-content"
          className={cx(
            "w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md backdrop-blur-xs outline-none",
            hoverCardAnimationClasses,
            className,
          )}
          {...props}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )
}

export { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger }
