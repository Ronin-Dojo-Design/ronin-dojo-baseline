"use client"

import { useAction } from "next-safe-action/hooks"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { uploadMedia } from "~/server/web/actions/media"
import { validateImageFile } from "./validation"

/**
 * Pick → validate → objectURL lifecycle → `uploadMedia` wiring for
 * `ImageFieldUploader` (SESSION_0499 fallow decomposition — the component owns
 * only markup; this hook owns the flow state).
 *
 * `rawPreviewUrl` non-null IS the crop phase (the component mounts the lazy
 * cropper + the `useClaimEscape` claim off it — the `UploaderPhase` enum was
 * deliberately NOT adopted here: this flow has no preview/done phases, so an
 * enum would just mirror `rawPreviewUrl !== null` / `isUploading`). Every path
 * out of the crop phase runs through `handleCropCancel`, which revokes the
 * objectURL exactly once.
 */
export function useImageFieldUpload({
  uploadPathPrefix,
  onChange,
}: {
  /** S3 key prefix — each upload writes `${uploadPathPrefix}/${randomUUID()}`. */
  uploadPathPrefix: string
  /** Upload success → the new R2 URL (the parent form field's setter). */
  onChange: (url: string | null) => void
}) {
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const upload = useAction(uploadMedia, {
    onSuccess: ({ data }) => {
      if (data) onChange(data)
    },
    onError: ({ error: { serverError, validationErrors } }) => {
      toast.error(validationErrors?.file?._errors?.[0] ?? serverError ?? "Image upload failed.")
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = "" // allow re-selecting the same file
    if (!file) return

    const pickError = validateImageFile(file)
    setValidationError(pickError)
    if (pickError) return

    setRawPreviewUrl(URL.createObjectURL(file))
  }

  /** Leaves the crop phase — revokes the objectURL and unmounts the cropper. */
  const handleCropCancel = useCallback(() => {
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
    setRawPreviewUrl(null)
  }, [rawPreviewUrl])

  const handleCropComplete = (cropped: File) => {
    handleCropCancel()
    upload.execute({ file: cropped, path: `${uploadPathPrefix}/${crypto.randomUUID()}` })
  }

  return {
    rawPreviewUrl,
    validationError,
    isUploading: upload.isPending,
    handleFileChange,
    handleCropComplete,
    handleCropCancel,
  }
}
