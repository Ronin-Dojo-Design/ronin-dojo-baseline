"use client"

import { ImageUpIcon, Loader2Icon, XIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { cx } from "~/lib/utils"
import { uploadJoinLegacyEvidence } from "~/server/web/lead/public-actions"

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]
const MAX_BYTES = 8 * 1024 * 1024

/**
 * Guest-capable evidence photo uploader for the Join-the-Legacy intake (SESSION_0445 #3).
 *
 * Replaces the plain URL input with a real upload: a guest (no account) picks a
 * certificate/proof photo, it uploads straight to R2 via the public, rate-limited
 * `uploadJoinLegacyEvidence` action, and the returned URL lands in the form's
 * `evidenceUrl` string. Photo-only (no link paste — a profile/competition LINK
 * belongs in the "Website / public profile" and "Instagram / social proof" fields
 * right above). The avatar uploader/cropper don't fit: the cropper forces a
 * round-square avatar crop (wrong for a certificate) and FormMedia's upload is
 * auth-gated.
 */
export function EvidencePhotoInput({
  value,
  onChange,
}: {
  value: string
  onChange: (next: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { execute, isPending } = useAction(uploadJoinLegacyEvidence, {
    onSuccess: ({ data }) => {
      if (data?.url) onChange(data.url)
    },
    onError: ({ error }) => {
      const message = error.serverError ?? "Upload failed. Please try again."
      setValidationError(message)
      toast.error(message)
    },
  })

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setValidationError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Use a JPEG, PNG, WebP, or AVIF image.")
      return
    }
    if (file.size > MAX_BYTES) {
      setValidationError("Image must be under 8MB.")
      return
    }
    execute({ file })
  }

  const clear = () => {
    onChange("")
    setValidationError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const hasValue = value.trim().length > 0

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handlePick}
        className="hidden"
        aria-label="Upload an evidence photo"
      />

      {hasValue ? (
        // Filled state: the uploaded photo thumbnail + a remove button.
        <div className="flex items-center gap-3 rounded-2xl border bg-background/60 p-2.5">
          {/* Uploaded R2 image. Plain img (no next/image remote config). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Evidence preview"
            className="size-14 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Photo attached</p>
            <p className="truncate text-xs text-muted-foreground">Ready for steward review</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            prefix={<XIcon />}
            onClick={clear}
            disabled={isPending}
          >
            Remove
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className={cx(
            "flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed p-4 text-center transition-colors",
            "hover:border-red-500/50 hover:bg-red-500/5 disabled:opacity-60",
          )}
        >
          {isPending ? (
            <Loader2Icon className="size-6 animate-spin text-red-500" aria-hidden="true" />
          ) : (
            <ImageUpIcon className="size-6 text-red-500" aria-hidden="true" />
          )}
          <span className="text-sm font-medium">
            {isPending ? "Uploading…" : "Upload a certificate or photo"}
          </span>
          <span className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, or AVIF · up to 8MB
          </span>
        </button>
      )}

      {validationError && <p className="text-sm text-destructive">{validationError}</p>}
    </div>
  )
}
