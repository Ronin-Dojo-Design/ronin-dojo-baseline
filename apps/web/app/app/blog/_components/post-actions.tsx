"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import type { ComponentProps } from "react"
import type { Post } from "~/.generated/prisma/browser"
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
  post: Post
}

export const PostActions = ({ className, post, ...props }: PostActionsProps) => {
  return (
    <Stack size="xs">
      <PostsDeleteDialog posts={[post]}>
        <Button variant="ghost" size="sm" prefix={<TrashIcon />} aria-label="Delete" {...props} />
      </PostsDeleteDialog>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              prefix={<EllipsisIcon />}
              aria-label="More actions"
              className={cx("text-muted", className)}
              {...props}
            />
          }
        />

        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/app/blog/${post.id}`} />}>Edit</DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/blog/${post.slug}`} target="_blank" />}>
            View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Stack>
  )
}
