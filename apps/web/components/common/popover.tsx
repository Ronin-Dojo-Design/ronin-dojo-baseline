"use client"

import { Popover } from "@base-ui/react/popover"
import { cx, popoverAnimationClasses } from "~/lib/utils"

function PopoverRoot({ ...props }: Popover.Root.Props) {
  return <Popover.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: Popover.Trigger.Props) {
  return <Popover.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  side,
  sideOffset = 4,
  ...props
}: Popover.Popup.Props & {
  align?: "center" | "start" | "end"
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}) {
  return (
    <Popover.Portal>
      <Popover.Positioner
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <Popover.Popup
          data-slot="popover-content"
          className={cx(
            "min-w-72 w-(--anchor-width) rounded-md border bg-popover p-4 text-popover-foreground shadow-md backdrop-blur-xs outline-hidden",
            popoverAnimationClasses,
            className,
          )}
          {...props}
        />
      </Popover.Positioner>
    </Popover.Portal>
  )
}

export { PopoverContent, PopoverRoot as Popover, PopoverTrigger }
