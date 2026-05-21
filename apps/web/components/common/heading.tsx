import { useRender } from "@base-ui/react/use-render"
import { cva, cx, type VariantProps } from "~/lib/utils"

const headingVariants = cva({
  base: "font-display font-semibold",

  variants: {
    size: {
      h1: "text-3xl tracking-tight text-balance bg-linear-to-b from-foreground to-foreground/75 bg-clip-text text-transparent md:text-4xl",
      h2: "text-2xl tracking-micro text-balance md:text-3xl",
      h3: "text-2xl tracking-micro text-balance",
      h4: "text-xl tracking-micro text-balance",
      h5: "text-base font-sans font-medium",
      h6: "text-sm/tight font-sans font-medium",
    },
  },

  defaultVariants: {
    size: "h3",
  },
})

export type HeadingProps = Omit<useRender.ComponentProps<"h2">, "size"> &
  VariantProps<typeof headingVariants>

const Heading = ({ className, render, size, ...props }: HeadingProps) => {
  return useRender({
    render,
    defaultTagName: (size ?? "h2") as keyof React.JSX.IntrinsicElements,
    props: { className: cx(headingVariants({ size }), className), ...props },
  })
}

const H1 = (props: HeadingProps) => <Heading size="h1" {...props} />
const H2 = (props: HeadingProps) => <Heading size="h2" {...props} />
const H3 = (props: HeadingProps) => <Heading size="h3" {...props} />
const H4 = (props: HeadingProps) => <Heading size="h4" {...props} />
const H5 = (props: HeadingProps) => <Heading size="h5" {...props} />
const H6 = (props: HeadingProps) => <Heading size="h6" {...props} />

export { H1, H2, H3, H4, H5, H6, Heading }
