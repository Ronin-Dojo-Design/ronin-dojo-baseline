"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cva, cx, popoverAnimationClasses, type VariantProps } from "~/lib/utils"

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const tooltipContentVariants = cva({
  base: "max-w-[20em] inline-flex items-center gap-2 bg-foreground text-background text-center text-pretty rounded-md shadow-md",

  variants: {
    size: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-[13px]",
      lg: "px-5 py-3.5 text-sm",
    },
  },

  defaultVariants: {
    size: "sm",
  },
})

type TooltipContentProps = TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "sideOffset" | "side" | "align"> &
  VariantProps<typeof tooltipContentVariants>

function TooltipContent({
  className,
  children,
  sideOffset = 4,
  size,
  side,
  align,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        sideOffset={sideOffset}
        side={side}
        align={align}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cx(
            tooltipContentVariants({ size }),
            "data-instant:duration-0",
            popoverAnimationClasses,
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2 rotate-45 bg-foreground data-[side=bottom]:-top-1 data-[side=top]:-bottom-1 data-[side=left]:-right-1 data-[side=right]:-left-1" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
