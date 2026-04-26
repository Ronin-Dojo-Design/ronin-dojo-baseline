"use client"

import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { Box } from "~/components/common/box"
import { cx } from "~/lib/utils"

const Checkbox = ({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) => {
  return (
    <Box focusWithin>
      <CheckboxPrimitive.Root
        className={cx(
          "peer size-4 shrink-0 border-foreground/50! rounded-sm shadow disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="grid place-items-center">
          <CheckIcon className="size-3 stroke-3" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </Box>
  )
}

export { Checkbox }
