"use client"

import { CircleCheckIcon, CircleDashedIcon, CircleDotIcon, PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { type Post, PostStatus } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/app/blog/_components/posts-table-columns"
import { PostsTableToolbarActions } from "~/app/app/blog/_components/posts-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findPosts } from "~/server/admin/posts/queries"
import { postsTableParamsSchema } from "~/server/admin/posts/schema"
import type { DataTableFilterField } from "~/types"

type PostsTableProps = {
  postsPromise: ReturnType<typeof findPosts>
}

export function PostsTable({ postsPromise }: PostsTableProps) {
  const { posts, total, pageCount } = use(postsPromise)
  const [{ perPage, sort }] = useQueryStates(postsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<Post>[] = [
    {
      id: "title",
      label: "Title",
      placeholder: "Filter by title...",
    },
    {
      id: "status",
      label: "Status",
      options: [
        {
          label: "Published",
          value: PostStatus.Published,
          icon: <CircleCheckIcon className="text-green-500" />,
        },
        {
          label: "Scheduled",
          value: PostStatus.Scheduled,
          icon: <CircleDotIcon className="text-blue-500" />,
        },
        {
          label: "Draft",
          value: PostStatus.Draft,
          icon: <CircleDashedIcon className="text-gray-500" />,
        },
      ],
    },
  ]

  const { table } = useDataTable({
    data: posts,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage },
      sorting: sort,
      columnVisibility: { createdAt: false },
      columnPinning: { right: ["actions"] },
    },
    getRowId: originalRow => originalRow.id,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader
        title="Posts"
        total={total}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/app/blog/new" />}
          >
            <div className="max-sm:sr-only">New post</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <PostsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
