"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cx } from "~/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cx("grid gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: Radio.Root.Props) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      className={cx(
        "grid place-items-center size-4 rounded-full border border-foreground/50! text-foreground shadow cursor-pointer",
        "outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Radio.Indicator
        data-slot="radio-group-indicator"
        className="size-2.5 rounded-full bg-primary"
      />
    </Radio.Root>
  )
}

export { RadioGroup, RadioGroupItem }
