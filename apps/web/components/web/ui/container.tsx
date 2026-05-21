import { useRender } from "@base-ui/react/use-render"
import { cva, cx, type VariantProps } from "~/lib/utils"

const containerVariants = cva({
  base: "relative w-full max-w-272 mx-auto px-6 lg:px-8",
})

type ContainerProps = useRender.ComponentProps<"div"> & VariantProps<typeof containerVariants>

const Container = ({ className, render, ...props }: ContainerProps) => {
  return useRender({
    render,
    defaultTagName: "div",
    props: { className: cx(containerVariants(), className), ...props },
  })
}

export { Container, containerVariants }
