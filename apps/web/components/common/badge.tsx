import { mergeProps } from "@base-ui/react"
import { useRender } from "@base-ui/react/use-render"
import type { ReactNode } from "react"
import { slot } from "~/lib/slot"
import { cva, cx, type VariantProps } from "~/lib/utils"

const badgeVariants = cva({
  base: "inline-flex items-center rounded-sm text-secondary-foreground font-medium leading-tight border border-transparent whitespace-nowrap",

  slots: {
    affix: "shrink-0 size-[1.1em]",
  },

  variants: {
    variant: {
      primary: "bg-primary text-background hover:[&[href],&[type]]:bg-primary/75",
      soft: "bg-border/50 hover:[&[href],&[type]]:bg-border/75",
      outline: "bg-background border-border hover:[&[href],&[type]]:bg-muted",
      success:
        "bg-green-500/15 text-green-700 hover:[&[href],&[type]]:bg-green-500/25 dark:bg-green-500/10 dark:text-green-300 dark:hover:[&[href],&[type]]:bg-green-500/20",
      caution:
        "bg-yellow-500/15 text-yellow-800 hover:[&[href],&[type]]:bg-yellow-500/25 dark:bg-yellow-500/10 dark:text-yellow-200 dark:hover:[&[href],&[type]]:bg-yellow-500/20",
      warning:
        "bg-orange-500/15 text-orange-700 hover:[&[href],&[type]]:bg-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:[&[href],&[type]]:bg-orange-500/20",
      info: "bg-blue-500/15 text-blue-700 hover:[&[href],&[type]]:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:[&[href],&[type]]:bg-blue-500/20",
      danger:
        "bg-red-500/15 text-red-700 hover:[&[href],&[type]]:bg-red-500/25 dark:bg-red-500/10 dark:text-red-300 dark:hover:[&[href],&[type]]:bg-red-500/20",
    },
    size: {
      sm: "px-1 py-px gap-1 text-2xs",
      md: "px-1.5 py-0.5 gap-1.5 text-xs",
      lg: "px-2 py-1 gap-2 text-sm rounded-md",
    },
  },

  defaultVariants: {
    variant: "soft",
    size: "md",
  },
})

type BadgeProps = Omit<useRender.ComponentProps<"span">, "prefix"> &
  VariantProps<typeof badgeVariants> & {
    prefix?: ReactNode
    suffix?: ReactNode
  }

const Badge = ({
  children,
  className,
  render,
  variant,
  size,
  prefix,
  suffix,
  ...rest
}: BadgeProps) => {
  const { base, affix } = badgeVariants({ variant, size })

  const props = mergeProps<"span">(
    {
      className: cx(base(), className),
      children: (
        <>
          {prefix && slot(prefix, { className: affix() })}
          {children}
          {suffix && slot(suffix, { className: affix() })}
        </>
      ),
    },
    rest,
  )

  return useRender({ defaultTagName: "span", render, props })
}

export { Badge, badgeVariants }
