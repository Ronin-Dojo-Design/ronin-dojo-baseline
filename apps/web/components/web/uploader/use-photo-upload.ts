"use client"

import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { uploadAndPromotePassportAvatar } from "~/server/web/actions/passport-avatar"

type UsePhotoUploadOptions = {
  onAvatarUrl?: (url: string) => void
}

/**
 * Thin hook that wires the `uploadAndPromotePassportAvatar` safe-action to
 * the `AvatarUploader` component. Toasts on error so the caller doesn't have
 * to; also calls `onAvatarUrl` on success so the parent can reflect the change.
 */
export function usePhotoUpload({ onAvatarUrl }: UsePhotoUploadOptions = {}) {
  const action = useAction(uploadAndPromotePassportAvatar, {
    onSuccess: ({ data }) => {
      if (data?.avatarUrl) {
        onAvatarUrl?.(data.avatarUrl)
      }
    },
    onError: ({ error }) => {
      const msg = error.serverError ?? "Failed to upload photo. Please try again."
      toast.error(msg)
    },
  })

  return {
    upload: (file: File) => action.execute({ file }),
    isPending: action.isPending,
    serverError: action.result?.serverError,
  }
}
