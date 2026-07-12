import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deletePosts } from "~/server/admin/posts/actions"

type PostsDeleteDialogProps = PropsWithChildren<{
  posts: Array<{ id: string }>
  onExecute?: () => void
}>

export const PostsDeleteDialog = ({ posts, onExecute, ...props }: PostsDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={posts.map(({ id }) => id)}
      label="post"
      action={deletePosts}
      callbacks={{
        onExecute: () => {
          toast.success("Post(s) deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
