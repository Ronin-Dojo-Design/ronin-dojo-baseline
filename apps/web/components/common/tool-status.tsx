import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleSlashIcon,
  CircleXIcon,
} from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { ToolStatus } from "~/.generated/prisma/browser"
import type { Badge } from "~/components/common/badge"

/**
 * Badge variant props for each ToolStatus — used in admin table cells.
 */
export const toolStatusBadgeProps: Record<ToolStatus, ComponentProps<typeof Badge>> = {
  [ToolStatus.Draft]: { variant: "soft" },
  [ToolStatus.Pending]: { variant: "warning" },
  [ToolStatus.Scheduled]: { variant: "info" },
  [ToolStatus.Rejected]: { variant: "danger" },
  [ToolStatus.Published]: { variant: "success" },
  [ToolStatus.Deleted]: { variant: "outline" },
}

/**
 * Icon element for each ToolStatus — shared between admin and dashboard tables.
 */
export const toolStatusIcon: Record<ToolStatus, ReactNode> = {
  [ToolStatus.Published]: <CircleCheckIcon className="text-green-500" />,
  [ToolStatus.Scheduled]: <CircleDotIcon className="text-blue-500" />,
  [ToolStatus.Pending]: <CircleDotDashedIcon className="text-yellow-500" />,
  [ToolStatus.Rejected]: <CircleXIcon className="text-red-500" />,
  [ToolStatus.Draft]: <CircleDashedIcon className="text-gray-500" />,
  [ToolStatus.Deleted]: <CircleSlashIcon className="text-gray-500" />,
}
