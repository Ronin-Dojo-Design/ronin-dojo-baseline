"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { PostsDeleteDialog } from "~/app/app/blog/_components/posts-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

type PostActionsProps = ComponentProps<typeof Button> & {
  post: { id: string; slug: string }
}

export const PostActions = ({ className, post, ...props }: PostActionsProps) => {
  return (
    <Stack size="sm" wrap={false}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open menu"
              variant="secondary"
              size="sm"
              prefix={<EllipsisIcon />}
              className={cx("data-open:bg-accent", className)}
              {...props}
            />
          }
        />

        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuItem render={<Link href={`/app/blog/${post.id}`} />}>Edit</DropdownMenuItem>

          <DropdownMenuItem render={<Link href={`/blog/${post.slug}`} target="_blank" />}>
            View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PostsDeleteDialog posts={[post]}>
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          aria-label="Delete"
          className="text-red-500"
          {...props}
        />
      </PostsDeleteDialog>
    </Stack>
  )
}
