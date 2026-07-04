import { mergeProps } from "@base-ui/react"
import { useRender } from "@base-ui/react/use-render"
import { Children, isValidElement, type ReactNode } from "react"
import { boxVariants } from "~/components/common/box"
import { slot } from "~/lib/slot"
import { cva, cx, type VariantProps } from "~/lib/utils"

const buttonVariants = cva({
  extend: boxVariants,

  base: [
    "group/button inline-flex items-center justify-center border-transparent! font-medium text-[0.8125rem]/tight text-start rounded-md overflow-clip hover:z-10 hover:border-transparent",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ],

  slots: {
    content: "flex-1 truncate only:text-center has-[div]:contents",

    affix: [
      "shrink-0 first:not-last:-ml-[0.21425em] last:not-first:-mr-[0.21425em] only:-mx-[0.21425em]",
      "[svg]:my-[0.077em] [svg]:size-[1.1em] [svg]:text-inherit [svg]:fill-foreground/10 [svg]:opacity-75",
    ],
  },

  variants: {
    variant: {
      fancy: "scheme-dark bg-primary text-primary-foreground hover:opacity-90",
      primary: "scheme-dark text-background bg-foreground hover:opacity-90",
      secondary:
        "scheme-light border-border! bg-background text-secondary-foreground hover:bg-card hover:border-ring! hover:text-foreground",
      soft: "scheme-light bg-muted text-secondary-foreground hover:bg-border/50 hover:text-foreground hover:outline-none",
      ghost:
        "scheme-light text-secondary-foreground hover:bg-muted hover:text-foreground hover:outline-none",
      destructive:
        "scheme-light bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    size: {
      xs: "px-2 py-1 gap-[0.66ch] text-xs",
      sm: "px-2 py-1 gap-[0.66ch]",
      md: "px-3 py-2 gap-[0.75ch]",
      lg: "px-3.5 py-2.5 gap-[1ch] rounded-lg sm:text-sm/tight",
      // Circular icon-only button: a square target with a centered ~1.4em glyph and no label
      // (SESSION_0495 C2-5). The community FAB + Epic B's radial MAB render through this instead of
      // hand-patching the `lg` pill with `mx-0! my-0! size-6! rounded-full p-4`.
      icon: "size-11 shrink-0 rounded-full p-0",
    },
    isPending: {
      true: "relative [&>*]:opacity-0! select-none after:absolute after:size-[1.1em] after:rounded-full after:border-[1.5px] after:border-[light-dark(var(--color-foreground),var(--color-background))] after:border-t-transparent after:animate-spin",
    },
  },

  compoundVariants: [
    {
      // Icon-only: neutralize the affix's em-based negative margins (they nudge a label-adjacent
      // glyph) and grow the lone icon so it reads as a proper icon button, not a shrunken pill glyph.
      size: "icon",
      className: {
        affix: "mx-0! my-0! [svg]:size-[1.4em]",
      },
    },
  ],

  defaultVariants: {
    hover: true,
    focus: true,
    variant: "primary",
    size: "lg",
  },
})

export type ButtonProps = Omit<useRender.ComponentProps<"button">, "size" | "prefix"> &
  VariantProps<typeof buttonVariants> & {
    isPending?: boolean
    prefix?: ReactNode
    suffix?: ReactNode
  }

const Button = ({
  children,
  className,
  disabled,
  render,
  isPending,
  prefix,
  suffix,
  variant,
  size,
  hover,
  focus,
  ...rest
}: ButtonProps) => {
  const { base, affix, content } = buttonVariants({ hover, focus, variant, size, isPending })

  const props = mergeProps<"button">(
    {
      disabled: disabled ?? isPending,
      className: cx(base(), className),
      children: (
        <>
          {slot(prefix, { className: affix() })}

          {Children.count(children) > 0 &&
            slot(isValidElement(children) ? children : <span>{children}</span>, {
              className: content(),
            })}

          {slot(suffix, { className: affix() })}
        </>
      ),
    },
    rest,
  )

  return useRender({ defaultTagName: "button", render, props })
}

export { Button, buttonVariants }
