import { MDXContent } from "@content-collections/mdx/react"
import { type ComponentProps, Suspense } from "react"
import { Prose } from "~/components/common/prose"
import { MDXComponents } from "~/components/web/mdx-components"
import {
  ToolEntry as ToolEntryPrimitive,
  ToolEntrySkeleton,
} from "~/components/web/tools/tool-entry"
import { cx } from "~/lib/utils"
import { findTool } from "~/server/web/tools/queries"

type ToolEntryProps = ComponentProps<typeof ToolEntryPrimitive> & {
  tool: string
}

const ToolEntryRSC = async ({ tool: slug, className, ...props }: ToolEntryProps) => {
  const tool = await findTool({ where: { slug } })

  if (!tool) {
    return null
  }

  return (
    <ToolEntryPrimitive
      id={slug}
      tool={tool}
      className={cx("not-first:mt-[3em] not-last:mb-[3em]", className)}
      {...props}
    />
  )
}

const ToolEntry = ({ ...props }: ToolEntryProps) => {
  return (
    <Suspense fallback={<ToolEntrySkeleton />}>
      <ToolEntryRSC {...props} />
    </Suspense>
  )
}

type MDXProps = ComponentProps<typeof Prose> & ComponentProps<typeof MDXContent>

export const MDX = ({ className, code, components }: MDXProps) => {
  return (
    <Prose className={cx("max-w-3xl!", className)}>
      <MDXContent code={code} components={{ ToolEntry, ...MDXComponents, ...components }} />
    </Prose>
  )
}
