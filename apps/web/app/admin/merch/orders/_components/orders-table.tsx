"use client"

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleXIcon,
  PackageIcon,
  PrinterIcon,
  RotateCcwIcon,
  TruckIcon,
  WalletIcon,
} from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { FulfillmentStatus } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/admin/merch/orders/_components/orders-table-columns"
import { merchOrdersTableParamsSchema } from "~/app/admin/merch/orders/_lib/schema"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findMerchOrders } from "~/server/web/merch/queries"
import type { DataTableFilterField } from "~/types"
import type { MerchOrderRow } from "~/server/web/merch/queries"

type OrdersTableProps = {
  ordersPromise: ReturnType<typeof findMerchOrders>
}

export function OrdersTable({ ordersPromise }: OrdersTableProps) {
  const { orders, total, pageCount } = use(ordersPromise)
  const [{ perPage, sort }] = useQueryStates(merchOrdersTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<MerchOrderRow>[] = [
    {
      id: "customerEmail",
      label: "Customer",
      placeholder: "Filter by customer...",
    },
    {
      id: "fulfillmentStatus",
      label: "Status",
      options: [
        { label: "Paid", value: FulfillmentStatus.PAID, icon: <WalletIcon className="text-blue-500" /> },
        { label: "Submitted", value: FulfillmentStatus.SUBMITTED, icon: <CircleDotIcon className="text-blue-500" /> },
        { label: "Printing", value: FulfillmentStatus.PRINTING, icon: <PrinterIcon className="text-yellow-600" /> },
        { label: "Shipped", value: FulfillmentStatus.SHIPPED, icon: <TruckIcon className="text-purple-500" /> },
        { label: "Delivered", value: FulfillmentStatus.DELIVERED, icon: <CircleCheckIcon className="text-green-500" /> },
        { label: "Failed", value: FulfillmentStatus.FAILED, icon: <CircleXIcon className="text-red-500" /> },
        { label: "Canceled", value: FulfillmentStatus.CANCELED, icon: <CircleDashedIcon className="text-gray-500" /> },
        { label: "Returned", value: FulfillmentStatus.RETURNED, icon: <RotateCcwIcon className="text-yellow-600" /> },
        { label: "Refunded", value: FulfillmentStatus.REFUNDED, icon: <PackageIcon className="text-gray-500" /> },
      ],
    },
  ]

  const { table } = useDataTable({
    data: orders,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage },
      sorting: sort,
      columnPinning: { right: [] },
    },
    getRowId: originalRow => originalRow.id,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader title="Merch Orders" total={total}>
        <DataTableToolbar table={table} filterFields={filterFields}>
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
