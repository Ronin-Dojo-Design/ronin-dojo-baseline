"use client"

import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { uploadAndPromotePassportAvatar } from "~/server/web/actions/passport-avatar"
import type { uploadJoinLegacyAvatar } from "~/server/web/lead/public-actions"

/**
 * The avatar-upload safe-actions the hook can drive: the default auth-gated Passport
 * promotion (`{ avatarUrl }`) or the guest public R2 staging path (`{ url }`). Both take
 * `{ file: File }`; the success reader tolerates either output shape (FI-010a).
 */
type AvatarUploadAction = typeof uploadAndPromotePassportAvatar | typeof uploadJoinLegacyAvatar

type UsePhotoUploadOptions = {
  onAvatarUrl?: (url: string) => void
  /**
   * Optional upload override (SESSION_0492 FI-010a). The default
   * `uploadAndPromotePassportAvatar` is auth-gated, so the guest Join-the-Legacy
   * wizard (no account/Passport yet) passes a public-action-backed uploader that
   * returns `{ url }` for a staged R2 photo instead of promoting to a Passport.
   */
  uploadAction?: AvatarUploadAction
}

/**
 * Thin hook that wires the `uploadAndPromotePassportAvatar` safe-action to
 * the `AvatarUploader` component. Toasts on error so the caller doesn't have
 * to; also calls `onAvatarUrl` on success so the parent can reflect the change.
 * A caller may pass `uploadAction` to swap the underlying action (e.g. the guest
 * public-upload path that returns `{ url }` without a Passport promotion).
 */
export function usePhotoUpload({ onAvatarUrl, uploadAction }: UsePhotoUploadOptions = {}) {
  // Both candidate actions take `{ file: File }`; their success outputs differ
  // (`{ avatarUrl }` vs `{ url }`), which `useAction`'s single generic can't union, so
  // pin the type to the default action and read the payload defensively below (FI-010a).
  const action = useAction(
    (uploadAction ?? uploadAndPromotePassportAvatar) as typeof uploadAndPromotePassportAvatar,
    {
      onSuccess: ({ data }) => {
        const payload = data as { avatarUrl?: string; url?: string } | null | undefined
        const url = payload?.avatarUrl ?? payload?.url
        if (url) {
          onAvatarUrl?.(url)
        }
      },
      onError: ({ error }) => {
        const msg = error.serverError ?? "Failed to upload photo. Please try again."
        toast.error(msg)
      },
    },
  )

  return {
    upload: (file: File) => action.execute({ file }),
    isPending: action.isPending,
    serverError: action.result?.serverError,
  }
}
