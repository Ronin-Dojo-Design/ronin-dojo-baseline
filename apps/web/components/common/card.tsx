import { useRender } from "@base-ui/react/use-render"
import type { ComponentProps } from "react"
import { boxVariants } from "~/components/common/box"
import { Stack } from "~/components/common/stack"
import { slot } from "~/lib/slot"
import { cva, cx, type VariantProps } from "~/lib/utils"

const cardVariants = cva({
  extend: boxVariants,
  base: "group relative flex flex-col items-start gap-4 w-full border bg-card p-5 rounded-lg",

  variants: {
    isRevealed: {
      true: "animate-reveal transform-gpu",
    },

    isHighlighted: {
      true: "bg-yellow-500/10",
    },
  },

  compoundVariants: [
    {
      hover: true,
      className: "hover:bg-accent",
    },
    {
      hover: true,
      isHighlighted: true,
      className: "hover:bg-yellow-500/15",
    },
  ],

  defaultVariants: {
    hover: true,
    focus: true,
  },
})

type CardProps = useRender.ComponentProps<"div"> & VariantProps<typeof cardVariants>

const Card = ({
  className,
  hover,
  focus,
  isRevealed,
  isHighlighted,
  render,
  ...props
}: CardProps) => {
  return useRender({
    render,
    defaultTagName: "div",
    props: {
      className: cardVariants({ hover, focus, isRevealed, isHighlighted, className }),
      ...props,
    },
  })
}

const CardHeader = ({ className, ...props }: ComponentProps<typeof Stack>) => {
  return <Stack className={cx("w-full", className)} {...props} />
}

const CardFooter = ({ className, ...props }: ComponentProps<typeof Stack>) => {
  return <Stack size="sm" className={cx("text-xs text-muted-foreground", className)} {...props} />
}

const CardDescription = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx("line-clamp-2 text-sm/normal text-secondary-foreground text-pretty", className)}
      {...props}
    />
  )
}

const CardBadges = ({ className, size = "sm", ...props }: ComponentProps<typeof Stack>) => {
  return (
    <Stack
      size={size}
      className={cx("absolute top-0 inset-x-5 z-10 -translate-y-1/2", className)}
      {...props}
    />
  )
}

const CardBg = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx(
        "absolute -top-px -inset-x-px -z-10 h-24 rounded-lg overflow-clip pointer-events-none",
        className,
      )}
      {...props}
    >
      <div className="-mt-12 size-full -rotate-12 bg-primary/10 blur-xl rounded-full" />
    </div>
  )
}

const CardIcon = ({ children, className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cx(
        "absolute inset-px overflow-clip rounded-sm opacity-10 pointer-events-none",
        className,
      )}
      {...props}
    >
      {slot(children, {
        className:
          "absolute -top-20 -right-20 -z-10 size-60 rotate-12 mask-b-from-25 mask-l-from-25",
      })}
    </div>
  )
}

export {
  Card,
  CardBadges,
  CardBg,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  type CardProps,
  cardVariants,
}
