"use client"

import { useReducedMotion, useResizeObserver } from "@mantine/hooks"
import { type HTMLMotionProps, motion } from "motion/react"
import type { PropsWithChildren } from "react"
import { slot } from "~/lib/slot"
import { cx } from "~/lib/utils"

type AnimatedContainerProps = Omit<HTMLMotionProps<"div">, "animate" | "children"> &
  PropsWithChildren<{
    width?: boolean
    height?: boolean
  }>

export const AnimatedContainer = (props: AnimatedContainerProps) => {
  const { children, className, width, height, transition, ...rest } = props
  const shouldReduceMotion = useReducedMotion()
  const [ref, rect] = useResizeObserver()

  if (shouldReduceMotion) {
    return slot(children, { className })
  }

  const motionProps: HTMLMotionProps<"div"> = {
    transition: transition ?? { type: "spring", duration: 0.3 },
    animate: {
      width: width ? rect.width : undefined,
      height: height ? rect.height : undefined,
    },
  }

  return (
    <motion.div className={cx("overflow-hidden", className)} {...motionProps} {...rest}>
      <div ref={ref} className={cx(height && "h-max", width && "w-max")}>
        {slot(children, { className: "animate-fade-in" })}
      </div>
    </motion.div>
  )
}
