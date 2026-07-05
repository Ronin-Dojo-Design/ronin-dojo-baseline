"use client"

import { Trash2Icon, UploadIcon } from "lucide-react"
import { lazy, Suspense, useRef } from "react"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import type { CropPresetKey } from "./crop-presets"
import { useClaimEscape } from "./use-claim-escape"
import { useImageFieldUpload } from "./use-image-field-upload"
import { ALLOWED_TYPES } from "./validation"

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
 * Flow state lives in `useImageFieldUpload`; this component is markup only.
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
  const {
    rawPreviewUrl,
    validationError,
    isUploading,
    handleFileChange,
    handleCropComplete,
    handleCropCancel,
  } = useImageFieldUpload({ uploadPathPrefix, onChange })

  // Escape claim for the WHOLE crop phase — including the lazy-chunk Suspense
  // FALLBACK window, where the cropper's own claim isn't mounted yet and
  // Escape would otherwise dismiss a host Base UI dialog and its dirty fields
  // (SESSION_0499 fallow-fix P2; see use-claim-escape.ts).
  useClaimEscape(rawPreviewUrl !== null, handleCropCancel)

  const busy = disabled || isUploading

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

      <FieldActions
        value={value}
        busy={busy}
        isUploading={isUploading}
        onPick={() => fileInputRef.current?.click()}
        onRemove={() => onChange(null)}
      />

      {validationError && <p className="text-sm text-destructive">{validationError}</p>}

      <FieldCropOverlay
        rawPreviewUrl={rawPreviewUrl}
        presets={presets}
        defaultPreset={defaultPreset}
        maxOutputPx={maxOutputPx}
        cropTitle={cropTitle}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />
    </div>
  )
}

/** Upload/Replace + Remove row — Remove only renders once a value exists. */
function FieldActions({
  value,
  busy,
  isUploading,
  onPick,
  onRemove,
}: {
  value: string | null
  busy: boolean
  isUploading: boolean
  onPick: () => void
  onRemove: () => void
}) {
  return (
    <Stack size="sm">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        prefix={<UploadIcon />}
        isPending={isUploading}
        disabled={busy}
        onClick={onPick}
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
          onClick={onRemove}
        >
          Remove
        </Button>
      )}
    </Stack>
  )
}

/** The lazy crop modal — mounts only during the crop phase (`rawPreviewUrl` set). */
function FieldCropOverlay({
  rawPreviewUrl,
  presets,
  defaultPreset,
  maxOutputPx,
  cropTitle,
  onCropComplete,
  onCancel,
}: {
  rawPreviewUrl: string | null
  presets?: CropPresetKey[]
  defaultPreset?: CropPresetKey
  maxOutputPx: number
  cropTitle: string
  onCropComplete: (file: File) => void
  onCancel: () => void
}) {
  if (!rawPreviewUrl) return null
  return (
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
        onCropComplete={onCropComplete}
        onCancel={onCancel}
      />
    </Suspense>
  )
}
