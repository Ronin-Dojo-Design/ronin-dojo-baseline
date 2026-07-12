import { useDebouncedCallback } from "@mantine/hooks"
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  type SingleParser,
  type UseQueryStateOptions,
  useQueryState,
  useQueryStates,
} from "nuqs"
import * as React from "react"
import { useMemo, useState } from "react"
import { getSortingStateParser } from "~/lib/parsers"
import type { DataTableFilterField, ExtendedSortingState } from "~/types"

const EMPTY_COLUMN_FILTERS: ColumnFiltersState = []

type UseDataTableProps<TData> = Omit<
  TableOptions<TData>,
  | "state"
  | "pageCount"
  | "getCoreRowModel"
  | "manualFiltering"
  | "manualPagination"
  | "manualSorting"
> &
  Required<Pick<TableOptions<TData>, "pageCount">> & {
    /**
     * Defines filter fields for the table. Supports both dynamic faceted filters and search filters.
     * - Faceted filters are rendered when `options` are provided for a filter field.
     * - Otherwise, search filters are rendered.
     *
     * The indie filter field `value` represents the corresponding column name in the database table.
     * @default []
     * @type { label: string, value: keyof TData, placeholder?: string, options?: { label: string, value: string, icon?: ComponentType<{ className?: string }> }[] }[]
     * @example
     * ```ts
     * // Render a search filter
     * const filterFields = [
     *   { label: "Title", value: "title", placeholder: "Search titles" }
     * ];
     * // Render a faceted filter
     * const filterFields = [
     *   {
     *     label: "Status",
     *     value: "status",
     *     options: [
     *       { label: "Todo", value: "todo" },
     *       { label: "In Progress", value: "in-progress" },
     *     ]
     *   }
     * ];
     * ```
     */
    filterFields?: DataTableFilterField<TData>[]

    /**
     * Determines how query updates affect history.
     * `push` creates a new history entry; `replace` (default) updates the current entry.
     * @default "replace"
     */
    history?: "push" | "replace"

    /**
     * Indicates whether the page should scroll to the top when the URL changes.
     * @default false
     */
    scroll?: boolean

    /**
     * Shallow mode keeps query states client-side, avoiding server calls.
     * Setting to `false` triggers a network request with the updated querystring.
     * @default true
     */
    shallow?: boolean

    /**
     * Maximum time (ms) to wait between URL query string updates.
     * Helps with browser rate-limiting. Minimum effective value is 50ms.
     * @default 50
     */
    throttleMs?: number

    /**
     * Debounce time (ms) for filter updates to enhance performance during rapid input.
     * @default 300
     */
    debounceMs?: number

    /**
     * Observe Server Component loading states for non-shallow updates.
     * Pass `startTransition` from `useTransition()`.
     * Sets `shallow` to `false` automatically.
     * So shallow: true` and `startTransition` cannot be used at the same time.
     * @see https://dev/reference/react/useTransition
     */
    startTransition?: React.TransitionStartFunction

    /**
     * Clear URL query key-value pair when state is set to default.
     * Keep URL meaning consistent when defaults change.
     * @default false
     */
    clearOnDefault?: boolean

    /**
     * Enable notion like column filters.
     * Advanced filters and column filters cannot be used at the same time.
     * @default false
     * @type boolean
     */
    enableAdvancedFilter?: boolean

    initialState?: Omit<Partial<TableState>, "sorting"> & {
      // Extend to make the sorting id typesafe
      sorting?: ExtendedSortingState<TData>
    }
  }

/**
 * Restore declared initial filters when a controlled filter update removes them.
 * This keeps the toolbar state aligned with server params that use the same defaults:
 * clearing a defaulted facet means "reset to default", while selecting another value
 * (or every value to represent All) is preserved verbatim.
 */
export function mergeDefaultColumnFilters(
  filters: ColumnFiltersState,
  defaults: ColumnFiltersState = [],
): ColumnFiltersState {
  const activeIds = new Set(filters.map(filter => filter.id))
  const missingDefaults = defaults.filter(filter => !activeIds.has(filter.id))

  return missingDefaults.length > 0 ? [...filters, ...missingDefaults] : filters
}

export function useDataTable<TData>({
  pageCount = -1,
  filterFields = [],
  enableAdvancedFilter = false,
  history = "replace",
  scroll = false,
  shallow = true,
  throttleMs = 50,
  debounceMs = 250,
  clearOnDefault = false,
  startTransition,
  initialState,
  ...props
}: UseDataTableProps<TData>) {
  const queryStateOptions = useMemo<Omit<UseQueryStateOptions<string>, "parse">>(
    () => ({
      history,
      scroll,
      shallow,
      throttleMs,
      debounceMs,
      clearOnDefault,
      startTransition,
    }),
    [history, scroll, shallow, throttleMs, debounceMs, clearOnDefault, startTransition],
  )

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialState?.rowSelection ?? {},
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState?.columnVisibility ?? {},
  )
  const defaultColumnFilters = initialState?.columnFilters ?? EMPTY_COLUMN_FILTERS

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withOptions(queryStateOptions).withDefault(1),
  )
  const [perPage, setPerPage] = useQueryState(
    "perPage",
    parseAsInteger
      .withOptions(queryStateOptions)
      .withDefault(initialState?.pagination?.pageSize ?? 25),
  )
  const [sorting, setSorting] = useQueryState(
    "sort",
    getSortingStateParser<TData>()
      .withOptions(queryStateOptions)
      .withDefault(initialState?.sorting ?? []),
  )

  // Create parsers for each filter field
  const filterParsers = useMemo(() => {
    return filterFields.reduce<Record<string, SingleParser<string> | SingleParser<string[]>>>(
      (acc, field) => {
        const defaultFilter = defaultColumnFilters.find(filter => filter.id === field.id)

        if (field.options) {
          // Faceted filter
          const parser = parseAsArrayOf(parseAsString, ",").withOptions(queryStateOptions)
          acc[field.id] = Array.isArray(defaultFilter?.value)
            ? parser.withDefault(defaultFilter.value.map(String))
            : parser
        } else {
          // Search filter
          const parser = parseAsString.withOptions(queryStateOptions)
          const defaultValue = Array.isArray(defaultFilter?.value)
            ? defaultFilter.value[0]
            : defaultFilter?.value
          acc[field.id] =
            typeof defaultValue === "string" ? parser.withDefault(defaultValue) : parser
        }
        return acc
      },
      {},
    )
  }, [defaultColumnFilters, filterFields, queryStateOptions])

  const [filterValues, setFilterValues] = useQueryStates(filterParsers)

  const debouncedSetFilterValues = useDebouncedCallback((values: typeof filterValues) => {
    void setPage(1)
    void setFilterValues(values)
  }, debounceMs)

  // Paginate
  const pagination: PaginationState = {
    pageIndex: page - 1, // zero-based index -> one-based index
    pageSize: perPage,
  }

  function onPaginationChange(updaterOrValue: Updater<PaginationState>) {
    if (typeof updaterOrValue === "function") {
      const newPagination = updaterOrValue(pagination)
      void setPage(newPagination.pageIndex + 1)
      void setPerPage(newPagination.pageSize)
    } else {
      void setPage(updaterOrValue.pageIndex + 1)
      void setPerPage(updaterOrValue.pageSize)
    }
  }

  // Sort
  function onSortingChange(updaterOrValue: Updater<SortingState>) {
    if (typeof updaterOrValue === "function") {
      const newSorting = updaterOrValue(sorting) as ExtendedSortingState<TData>
      void setSorting(newSorting)
    }
  }

  // Filter
  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    if (enableAdvancedFilter) return []

    const parsedFilters = Object.entries(filterValues).reduce<ColumnFiltersState>(
      (filters, [key, value]) => {
        if (value !== null) {
          filters.push({
            id: key,
            value: Array.isArray(value) ? value : [value],
          })
        }
        return filters
      },
      [],
    )

    return mergeDefaultColumnFilters(parsedFilters, defaultColumnFilters)
  }, [defaultColumnFilters, filterValues, enableAdvancedFilter])

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters)

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = useMemo(() => {
    return enableAdvancedFilter
      ? { searchableColumns: [], filterableColumns: [] }
      : {
          searchableColumns: filterFields.filter(field => !field.options),
          filterableColumns: filterFields.filter(field => field.options),
        }
  }, [filterFields, enableAdvancedFilter])

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      // Don't process filters if advanced filtering is enabled
      if (enableAdvancedFilter) return

      setColumnFilters(prev => {
        const requestedNext =
          typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue
        const next = mergeDefaultColumnFilters(requestedNext, defaultColumnFilters)

        const filterUpdates = next.reduce<Record<string, string | string[] | null>>(
          (acc, filter) => {
            if (searchableColumns.find(col => col.id === filter.id)) {
              // For search filters, use the value directly
              acc[filter.id] = filter.value as string
            } else if (filterableColumns.find(col => col.id === filter.id)) {
              // For faceted filters, use the array of values
              acc[filter.id] = filter.value as string[]
            }
            return acc
          },
          {},
        )

        for (const prevFilter of prev) {
          if (!next.some(filter => filter.id === prevFilter.id)) {
            filterUpdates[prevFilter.id] = null
          }
        }

        debouncedSetFilterValues(filterUpdates)
        return next
      })
    },
    [
      debouncedSetFilterValues,
      defaultColumnFilters,
      enableAdvancedFilter,
      filterableColumns,
      searchableColumns,
      setPage,
    ],
  )

  const table = useReactTable({
    ...props,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: enableAdvancedFilter ? [] : columnFilters,
    },
    defaultColumn: {
      size: 0,
      minSize: 0,
    },
    enableRowSelection: props.enableRowSelection ?? true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableAdvancedFilter ? undefined : getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: enableAdvancedFilter ? undefined : getFacetedRowModel(),
    getFacetedUniqueValues: enableAdvancedFilter ? undefined : getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  return { table }
}
