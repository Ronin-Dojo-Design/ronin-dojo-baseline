import { getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { Link } from "~/components/common/link"
import { Listing } from "~/components/web/listing"
import { FeaturedTools } from "~/components/web/listings/featured-tools"
import { ToolList, ToolListSkeleton } from "~/components/web/tools/tool-list"
import type { ToolOne } from "~/server/web/tools/payloads"
import { findRelatedTools } from "~/server/web/tools/queries"

type RelatedToolsProps = Omit<ComponentProps<typeof Listing>, "title"> & {
  tool: ToolOne
}

const RelatedTools = async ({ tool, ...props }: RelatedToolsProps) => {
  const t = await getTranslations("components.listings")
  const tools = await findRelatedTools({ slug: tool.slug })

  if (!tools.length) {
    return <FeaturedTools />
  }

  return (
    <Listing
      title={t("similar_to", { toolName: tool.name })}
      button={<Link href="/">{t("view_all_tools")}</Link>}
      {...props}
    >
      <ToolList tools={tools} />
    </Listing>
  )
}

const RelatedToolsSkeleton = async ({ tool, ...props }: RelatedToolsProps) => {
  const t = await getTranslations("components.listings")

  return (
    <Listing title={t("similar_to", { toolName: tool.name })} {...props}>
      <ToolListSkeleton count={3} />
    </Listing>
  )
}

export { RelatedTools, RelatedToolsSkeleton }
