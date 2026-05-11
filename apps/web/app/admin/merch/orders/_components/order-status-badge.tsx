"use client"

import type { ComponentProps } from "react"
import { FulfillmentStatus } from "~/.generated/prisma/browser"
import { Badge } from "~/components/common/badge"

const statusBadgeProps: Record<FulfillmentStatus, ComponentProps<typeof Badge>> = {
  [FulfillmentStatus.PAID]: { variant: "info" },
  [FulfillmentStatus.SUBMITTED]: { variant: "info" },
  [FulfillmentStatus.PRINTING]: { variant: "warning" },
  [FulfillmentStatus.SHIPPED]: { variant: "primary" },
  [FulfillmentStatus.DELIVERED]: { variant: "success" },
  [FulfillmentStatus.FAILED]: { variant: "danger" },
  [FulfillmentStatus.CANCELED]: { variant: "soft" },
  [FulfillmentStatus.RETURNED]: { variant: "warning" },
  [FulfillmentStatus.REFUNDED]: { variant: "outline" },
}

const statusLabels: Record<FulfillmentStatus, string> = {
  [FulfillmentStatus.PAID]: "Paid",
  [FulfillmentStatus.SUBMITTED]: "Submitted",
  [FulfillmentStatus.PRINTING]: "Printing",
  [FulfillmentStatus.SHIPPED]: "Shipped",
  [FulfillmentStatus.DELIVERED]: "Delivered",
  [FulfillmentStatus.FAILED]: "Failed",
  [FulfillmentStatus.CANCELED]: "Canceled",
  [FulfillmentStatus.RETURNED]: "Returned",
  [FulfillmentStatus.REFUNDED]: "Refunded",
}

type OrderStatusBadgeProps = {
  status: FulfillmentStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <Badge {...statusBadgeProps[status]}>{statusLabels[status]}</Badge>
}
