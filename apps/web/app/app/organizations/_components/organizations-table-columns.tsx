"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import type { OrganizationRow } from "~/server/admin/org-settings/queries"

/** Whether the org carries any theme override (matches the hand-rolled `hasTheme` check). */
function hasTheme(org: OrganizationRow): boolean {
  const settings = org.orgSettings
  return Boolean(settings && (settings.primaryColor || settings.accentColor || settings.logoUrl))
}

/**
 * Columns for the organizations list migrated onto `AdminCollection` (ADR 0045). The
 * former card (name + slug, brand badge, "Themed" badge, primary-color swatch) is
 * preserved column-for-column; the row→detail link (`/app/organizations/[id]/theme`)
 * moves onto the Name cell.
 */
export const getColumns = (): ColumnDef<OrganizationRow>[] => {
  return [
    {
      id: "name",
      accessorKey: "name",
      enableHiding: false,
      size: 240,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => {
        const org = row.original
        return (
          <div className="min-w-0">
            <DataTableLink href={`/app/organizations/${org.id}/theme`} title={org.name} />
            <Note className="block truncate">{org.slug}</Note>
          </div>
        )
      },
    },
    {
      id: "brand",
      accessorKey: "brand",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Brand" />,
      cell: ({ row }) => <Badge variant="outline">{row.original.brand}</Badge>,
    },
    {
      id: "theme",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Theme" />,
      cell: ({ row }) => {
        const org = row.original
        return (
          <Stack size="xs" wrap={false}>
            {hasTheme(org) && <Badge variant="primary">Themed</Badge>}
            {org.orgSettings?.primaryColor && (
              <div
                className="size-5 rounded-full border"
                style={{ backgroundColor: `hsl(${org.orgSettings.primaryColor})` }}
                title={`Primary: ${org.orgSettings.primaryColor}`}
              />
            )}
            {!hasTheme(org) && !org.orgSettings?.primaryColor && <Note>—</Note>}
          </Stack>
        )
      },
    },
  ]
}
