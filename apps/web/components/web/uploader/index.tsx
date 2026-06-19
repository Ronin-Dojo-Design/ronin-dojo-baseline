"use client"

import { lazy, Suspense, useCallback, useRef, useState } from "react"
import { XIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { cx } from "~/lib/utils"
import { BeltPreview } from "./belt-preview"
import { usePhotoUpload } from "./use-photo-upload"
import type { UploaderPhase } from "./types"

// The cropper is heavy (react-easy-crop + canvas) — lazy-load so the bundle
// chunk is only fetched when the crop modal actually opens.
const LazyCropper = lazy(() => import("./cropper"))

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES = 10 * 1024 * 1024

function formatBytes(n: number) {
  if (n === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB"]
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / k ** i).toFixed(1)} ${sizes[i]}`
}

export type AvatarUploaderProps = {
  /** Existing avatar URL shown before a new one is selected. */
  initialAvatarUrl?: string | null
  /** Rank.colorHex for the belt-tinted ring — never hardcoded. */
  rankColorHex?: string | null
  /** Called with the new R2 URL after a successful upload + promotion. */
  onAvatarUrl?: (url: string) => void
  disabled?: boolean
  className?: string
  size?: "sm" | "lg"
}

/**
 * Self-contained avatar pick → crop → preview → upload flow.
 *
 * Internally: file input → client validation → lazy `ImageCropper` modal →
 * belt-framed `BeltPreview` → `uploadAndPromotePassportAvatar` safe-action.
 *
 * The cropper chunk is loaded lazily (below-fold of the trigger) so it does
 * not inflate the initial page JS. Grep `LazyCropper` for chunk evidence.
 */
export function AvatarUploader({
  initialAvatarUrl,
  rankColorHex,
  onAvatarUrl,
  disabled = false,
  className,
  size = "lg",
}: AvatarUploaderProps) {
  const [phase, setPhase] = useState<UploaderPhase>("idle")
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null)
  const [croppedFile, setCroppedFile] = useState<File | null>(null)
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSuccess = useCallback(
    (url: string) => {
      setPhase("done")
      onAvatarUrl?.(url)
    },
    [onAvatarUrl],
  )

  const { upload, isPending, serverError } = usePhotoUpload({ onAvatarUrl: handleSuccess })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setValidationError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Only JPEG, PNG, WebP, or GIF images are allowed.")
      return
    }
    if (file.size > MAX_BYTES) {
      setValidationError(`File must be under ${formatBytes(MAX_BYTES)}.`)
      return
    }

    const url = URL.createObjectURL(file)
    setRawPreviewUrl(url)
    setPhase("crop")
  }

  const handleCropComplete = useCallback(
    (cropped: File) => {
      if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
      const url = URL.createObjectURL(cropped)
      setCroppedFile(cropped)
      setCroppedPreviewUrl(url)
      setPhase("preview")
      setRawPreviewUrl(null)
    },
    [rawPreviewUrl],
  )

  const handleCropCancel = useCallback(() => {
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
    setRawPreviewUrl(null)
    setPhase("idle")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [rawPreviewUrl])

  const handleUpload = useCallback(() => {
    if (!croppedFile) return
    upload(croppedFile)
  }, [croppedFile, upload])

  const handleReset = useCallback(() => {
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl)
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
    setCroppedFile(null)
    setCroppedPreviewUrl(null)
    setRawPreviewUrl(null)
    setPhase("idle")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [croppedPreviewUrl, rawPreviewUrl])

  const displayUrl = (() => {
    if (phase === "preview" || (phase === "done" && croppedPreviewUrl)) {
      return croppedPreviewUrl
    }
    return initialAvatarUrl
  })()

  const canChoose = !disabled && !isPending && phase !== "crop"

  return (
    <div className={cx("flex flex-col items-center gap-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        disabled={!canChoose}
        aria-label="Upload profile photo"
      />

      <BeltPreview
        avatarUrl={displayUrl}
        colorHex={rankColorHex}
        onChoosePhoto={canChoose ? () => fileInputRef.current?.click() : undefined}
        size={size}
      />

      {validationError && <p className="text-sm text-destructive">{validationError}</p>}

      {serverError && phase !== "done" && <p className="text-sm text-destructive">{serverError}</p>}

      {phase === "preview" && (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="primary"
            onClick={handleUpload}
            isPending={isPending}
            disabled={isPending}
          >
            Save photo
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            prefix={<XIcon />}
            onClick={handleReset}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      )}

      {phase === "done" && (
        <p className="text-sm text-green-600 dark:text-green-400">Photo saved.</p>
      )}

      {phase === "crop" && rawPreviewUrl && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
              <p className="text-sm text-white">Loading cropper…</p>
            </div>
          }
        >
          <LazyCropper
            imageSrc={rawPreviewUrl}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            title="Crop your profile photo"
          />
        </Suspense>
      )}
    </div>
  )
}
