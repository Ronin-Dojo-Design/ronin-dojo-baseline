"use client"

import { Trash2Icon, UploadIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { lazy, Suspense, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import { uploadMedia } from "~/server/web/actions/media"
import type { CropPresetKey } from "./crop-presets"
import { ALLOWED_TYPES, validateImageFile } from "./validation"

// Same lazy chunk as AvatarUploader — react-easy-crop + canvas only load when
// the crop modal actually opens.
const LazyCropper = lazy(() => import("./cropper"))

export type ImageFieldUploaderProps = {
  /** Current image URL (the form field's value); renders the preview thumb. */
  value: string | null
  /** Upload success → the new R2 URL; Remove → null. */
  onChange: (url: string | null) => void
  /**
   * S3 key prefix — each upload writes `${uploadPathPrefix}/${randomUUID()}`
   * (the admin-library uuid idiom: a unique key per upload, so a Replace never
   * silently rewrites the bytes behind a previously-saved URL).
   */
  uploadPathPrefix: string
  /** Allowed crop presets (`crop-presets.ts`); more than one renders the preset row. */
  presets?: CropPresetKey[]
  defaultPreset?: CropPresetKey
  /**
   * Long-edge cap for the exported crop. Defaults to 1600px — the `uploadMedia`
   * seam enforces a 512KB ceiling (`createFileSchema`), which full-resolution
   * crops routinely exceed; 1600px ≈ 2x retina of typical hero render widths.
   */
  maxOutputPx?: number
  cropTitle?: string
  disabled?: boolean
  className?: string
}

/**
 * FIELD variant of the uploader family (SESSION_0499): pick → crop (preset
 * row) → upload through the canonical `uploadMedia` seam (R2; auth +
 * `media.manage`/`canUploadMedia` gate) → the returned URL lands in ONE form
 * field via `onChange`. The dumb-form counterpart to `AvatarUploader` — no
 * entity side-effects, no `Media` row; the parent form owns persistence.
 *
 * Upload fires immediately after the crop (the blog `post-form.tsx` hero
 * precedent) — a later Cancel of the parent form orphans the R2 object, same
 * accepted trade-off as that precedent.
 */
export function ImageFieldUploader({
  value,
  onChange,
  uploadPathPrefix,
  presets,
  defaultPreset,
  maxOutputPx = 1600,
  cropTitle = "Crop image",
  disabled = false,
  className,
}: ImageFieldUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleCropComplete = (cropped: File) => {
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
    setRawPreviewUrl(null)
    upload.execute({ file: cropped, path: `${uploadPathPrefix}/${crypto.randomUUID()}` })
  }

  const handleCropCancel = () => {
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
    setRawPreviewUrl(null)
  }

  const busy = disabled || upload.isPending

  return (
    <div className={cx("flex w-full flex-col gap-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={busy}
        aria-label="Upload image"
      />

      {value && (
        <img
          src={value}
          alt="Current image"
          className="h-24 w-auto max-w-full self-start rounded-md border object-cover"
        />
      )}

      <Stack size="sm">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          prefix={<UploadIcon />}
          isPending={upload.isPending}
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
        >
          {value ? "Replace" : "Upload image"}
        </Button>

        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            prefix={<Trash2Icon />}
            disabled={busy}
            onClick={() => onChange(null)}
          >
            Remove
          </Button>
        )}
      </Stack>

      {validationError && <p className="text-sm text-destructive">{validationError}</p>}

      {rawPreviewUrl && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
              <p className="text-sm text-white">Loading cropper…</p>
            </div>
          }
        >
          <LazyCropper
            imageSrc={rawPreviewUrl}
            presets={presets}
            defaultPreset={defaultPreset}
            maxOutputPx={maxOutputPx}
            title={cropTitle}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        </Suspense>
      )}
    </div>
  )
}
