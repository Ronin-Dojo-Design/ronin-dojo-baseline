import { CircleCheckIcon, CircleDashedIcon, CircleDotIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { PostStatus } from "~/.generated/prisma/browser"
import type { Badge } from "~/components/common/badge"

/**
 * Badge variant props for each PostStatus — used in admin table cells. A separate helper from
 * `tool-status` (a distinct enum); the `Record<PostStatus, …>` exhaustiveness means a future
 * 4th status is a compile error, not a silent unstyled badge.
 */
export const postStatusBadgeProps: Record<PostStatus, ComponentProps<typeof Badge>> = {
  [PostStatus.Draft]: { variant: "soft" },
  [PostStatus.Scheduled]: { variant: "info" },
  [PostStatus.Published]: { variant: "success" },
}

/**
 * Icon element for each PostStatus — shared between the admin table cell and the Status facet.
 */
export const postStatusIcon: Record<PostStatus, ReactNode> = {
  [PostStatus.Draft]: <CircleDashedIcon className="text-gray-500" />,
  [PostStatus.Scheduled]: <CircleDotIcon className="text-blue-500" />,
  [PostStatus.Published]: <CircleCheckIcon className="text-green-500" />,
}
