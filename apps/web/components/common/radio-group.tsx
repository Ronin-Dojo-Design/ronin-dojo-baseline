"use client"

import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { boxVariants } from "~/components/common/box"
import { cx } from "~/lib/utils"

const RadioGroup = ({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) => {
  return <RadioGroupPrimitive.Root className={cx("grid gap-2", className)} {...props} />
}

const RadioGroupItem = ({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) => {
  return (
    <RadioGroupPrimitive.Item
      className={cx(
        boxVariants({ focusWithin: true }),
        "size-4 rounded-full border-foreground/50! text-foreground shadow disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="grid place-items-center">
        <span className="size-2.5 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
