"use client"

import type { ColumnDef, Table as TanstackTable, TableOptions } from "@tanstack/react-table"
import type { ComponentProps, ReactNode } from "react"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { useDataTable } from "~/hooks/use-data-table"
import type { DataTableFilterField, ExtendedSortingState } from "~/types"

type UseDataTableInitialState<TData> = Omit<
  NonNullable<Parameters<typeof useDataTable<TData>>[0]["initialState"]>,
  "pagination" | "sorting"
>

type AdminCollectionProps<TData> = {
  /**
   * Header title rendered by the {@link DataTableHeader}, e.g. `"Users"`.
   */
  title: string

  /**
   * Row count shown next to the title, e.g. `usersTotal`.
   */
  total?: number

  /**
   * Header call-to-action slot (e.g. the "Add person" / "New listing" button).
   */
  callToAction?: ReactNode

  /**
   * The rows for the current page. Callers unwrap their entity-specific promise
   * (`use(usersPromise)` → `{ users }`) and pass the array here, keeping the
   * per-surface query and result-shape out of the frame.
   */
  data: TData[]

  /**
   * Column definitions for this surface. Owned per-entity, never by the frame.
   */
  columns: ColumnDef<TData, unknown>[]

  /**
   * Total page count from the server query (drives pagination).
   */
  pageCount: number

  /**
   * Search + faceted filter fields for this surface. Rendered by the toolbar.
   * @default []
   */
  filterFields?: DataTableFilterField<TData>[]

  /**
   * Default sort state for the table, sourced from the surface's params schema.
   * @default []
   */
  sorting?: ExtendedSortingState<TData>

  /**
   * Rows-per-page for the initial pagination state, sourced from the params schema.
   */
  pageSize: number

  /**
   * Remaining table initial state (column pinning, column visibility, row
   * selection, …). Pagination and sorting are wired from `pageSize`/`sorting`.
   */
  initialState?: UseDataTableInitialState<TData>

  /**
   * Row id resolver, matching the per-surface behavior (some surfaces suffix the
   * index to avoid collisions on placeholder rows).
   */
  getRowId?: TableOptions<TData>["getRowId"]

  /**
   * Per-row selection predicate (e.g. disallow selecting admin users).
   */
  enableRowSelection?: TableOptions<TData>["enableRowSelection"]

  /**
   * Toolbar contents rendered to the right of the filters — the per-surface
   * bulk actions, date-range picker, and view options. A render function so
   * callers can wire the `table` instance into their toolbar actions (delete
   * dialogs, view options) exactly as the hand-rolled wrappers did.
   */
  children?: (table: TanstackTable<TData>) => ReactNode

  /**
   * Empty-state override forwarded to {@link DataTable}.
   */
  emptyState?: ComponentProps<typeof DataTable<TData>>["emptyState"]

  /**
   * Floating bar override forwarded to {@link DataTable}.
   */
  floatingBar?: ComponentProps<typeof DataTable<TData>>["floatingBar"]
}

/**
 * The one reusable admin-surface frame. Owns the toolbar + `DataTable` +
 * pagination shell that every `/app/*` `*-table.tsx` wrapper wired by hand.
 * Per-surface concerns — the columns, the server query/result shape, and the
 * toolbar action buttons — stay with the caller; this component owns only the
 * frame, so a migrated page is behavior-identical.
 */
export function AdminCollection<TData>({
  title,
  total,
  callToAction,
  data,
  columns,
  pageCount,
  filterFields = [],
  sorting = [],
  pageSize,
  initialState,
  getRowId,
  enableRowSelection,
  children,
  emptyState,
  floatingBar,
}: AdminCollectionProps<TData>) {
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      ...initialState,
      pagination: { pageIndex: 0, pageSize },
      sorting,
    },
    getRowId,
    enableRowSelection,
  })

  return (
    <DataTable table={table} emptyState={emptyState} floatingBar={floatingBar}>
      <DataTableHeader title={title} total={total} callToAction={callToAction}>
        <DataTableToolbar table={table} filterFields={filterFields}>
          {children?.(table)}
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
