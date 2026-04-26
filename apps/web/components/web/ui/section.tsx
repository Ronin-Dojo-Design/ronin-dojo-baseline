import type { ComponentProps } from "react"
import { Wrapper } from "~/components/common/wrapper"
import { Sticky } from "~/components/web/ui/sticky"
import { cx } from "~/lib/utils"

const SectionBase = ({ className, gap = "md", ...props }: ComponentProps<typeof Wrapper>) => {
  return (
    <Wrapper
      gap={gap}
      className={cx("items-start gap-x-6 md:grid md:grid-cols-3 lg:gap-x-8", className)}
      {...props}
    />
  )
}

const SectionContent = ({ className, gap = "md", ...props }: ComponentProps<typeof Wrapper>) => {
  return <Wrapper gap={gap} className={cx("items-start md:col-span-2", className)} {...props} />
}

const SectionSidebar = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <Sticky>
      <div className={cx("flex flex-col gap-y-6 md:col-span-1", className)} {...props} />
    </Sticky>
  )
}

export const Section = Object.assign(SectionBase, {
  Content: SectionContent,
  Sidebar: SectionSidebar,
})
