import type { ComponentProps } from "react"
import { Heading, type HeadingProps } from "~/components/common/heading"
import { cva, cx, type VariantProps } from "~/lib/utils"

const introVariants = cva({
  base: "flex w-full flex-col gap-y-2",

  variants: {
    alignment: {
      start: "items-start text-start mr-auto",
      center: "items-center text-center mx-auto",
      end: "items-end text-end ml-auto",
    },
  },

  defaultVariants: {
    alignment: "start",
  },
})

type IntroProps = ComponentProps<"div"> & VariantProps<typeof introVariants>

const Intro = ({ className, alignment, ...props }: IntroProps) => {
  return <div className={cx(introVariants({ alignment, className }))} {...props} />
}

const IntroTitle = ({ size = "h1", ...props }: HeadingProps) => {
  return <Heading size={size} {...props} />
}

const IntroDescription = ({ className, ...props }: ComponentProps<"h2">) => {
  return (
    <h2
      className={cx(
        "max-w-2xl text-pretty text-secondary-foreground [word-break:break-word] md:text-lg *:[[href]]:underline *:[[href]]:hover:text-primary",
        className,
      )}
      {...props}
    />
  )
}

export { Intro, IntroTitle, IntroDescription }
