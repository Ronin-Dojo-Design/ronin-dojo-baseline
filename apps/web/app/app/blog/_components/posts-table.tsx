"use client"

import { CircleCheckIcon, CircleDashedIcon, CircleDotIcon, PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { PostStatus } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/app/blog/_components/posts-table-columns"
import { PostsTableToolbarActions } from "~/app/app/blog/_components/posts-table-toolbar-actions"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import type { findPosts, PostAdminRow } from "~/server/admin/posts/queries"
import { postsTableParamsSchema } from "~/server/admin/posts/schema"
import type { DataTableFilterField } from "~/types"

type PostsTableProps = {
  postsPromise: ReturnType<typeof findPosts>
}

// `/app/blog` now opens on the Drafts editorial queue (behavior change from the old all-posts
// view): the seeded `status` facet makes Drafts-first the default via the nuqs parser default.
// Module-scoped so the reference is stable across renders (the hook keys its filter-parser memo
// off this identity — see AdminCollection's `initialState` contract).
const POSTS_INITIAL_STATE = {
  columnFilters: [{ id: "status", value: [PostStatus.Draft] }],
  columnPinning: { right: ["actions"] },
}

export function PostsTable({ postsPromise }: PostsTableProps) {
  const { rows, total, pageCount } = use(postsPromise)
  const [{ perPage, sort }] = useQueryStates(postsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<PostAdminRow>[] = [
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
          label: "Draft",
          value: PostStatus.Draft,
          icon: <CircleDashedIcon className="text-gray-500" />,
        },
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
      ],
    },
  ]

  return (
    <AdminCollection
      title="Posts"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      filterFields={filterFields}
      sorting={sort}
      pageSize={perPage}
      initialState={POSTS_INITIAL_STATE}
      emptyState="No drafts. Clear the Status filter to see all posts."
      getRowId={row => row.id}
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
      {table => (
        <>
          <PostsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </>
      )}
    </AdminCollection>
  )
}
