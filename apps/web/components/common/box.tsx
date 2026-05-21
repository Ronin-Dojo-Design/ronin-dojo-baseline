import { cva } from "~/lib/utils"

const boxVariants = cva({
  base: "border outline-transparent transition duration-100 ease-out",

  variants: {
    hover: {
      true: "cursor-pointer hover:outline-border/50 hover:border-ring",
    },
    focus: {
      true: "focus-visible:outline-2 focus-visible:outline-border/50 focus-visible:border-ring",
    },
    focusWithin: {
      true: "focus-within:outline-2 focus-within:outline-border/50 focus-within:border-ring",
    },
  },
})

export { boxVariants }
