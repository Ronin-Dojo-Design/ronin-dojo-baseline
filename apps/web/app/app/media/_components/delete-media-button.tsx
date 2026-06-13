"use client"

import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { Button } from "~/components/common/button"
import { deleteMedia } from "~/server/admin/media/actions"

export const DeleteMediaButton = ({ id }: { id: string }) => {
  const router = useRouter()

  return (
    <DeleteDialog
      ids={[id]}
      label="media file"
      action={deleteMedia}
      callbacks={{
        onSuccess: () => {
          toast.success("Media deleted.")
          router.refresh()
        },
        onError: ({ error: { serverError } }) => {
          toast.error(serverError ?? "Failed to delete media.")
        },
      }}
    >
      <Button type="button" size="xs" variant="secondary" prefix={<Trash2Icon />}>
        Delete
      </Button>
    </DeleteDialog>
  )
}
