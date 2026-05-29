"use client"

import { UploadIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { type ChangeEvent, useRef } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { uploadMediaToLibrary } from "~/server/admin/media/actions"

export const MediaUploader = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { execute, isPending } = useAction(uploadMediaToLibrary, {
    onSuccess: () => {
      toast.success("Media uploaded.")
      router.refresh()
    },
    onError: ({ error: { serverError, validationErrors } }) => {
      toast.error(validationErrors?.file?._errors?.[0] ?? serverError ?? "Failed to upload media.")
    },
  })

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      execute({ file })
    }
    event.target.value = ""
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        prefix={<UploadIcon />}
        isPending={isPending}
        onClick={() => inputRef.current?.click()}
      >
        Upload media
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleChange}
        className="hidden"
      />
    </>
  )
}
