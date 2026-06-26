"use client"

import { lazy, Suspense, useCallback, useRef, useState } from "react"
import { ImageIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { setPassportAvatarAsAdmin } from "~/server/admin/passport-avatar"

// Reuse the SAME circle cropper the self-service avatar flow uses (react-easy-crop
// + canvas) — lazy so its chunk only loads when an admin actually opens the modal.
const LazyCropper = lazy(() => import("~/components/web/uploader/cropper"))

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES = 10 * 1024 * 1024

type LineageAvatarActionProps = {
  passportId: string
  displayName: string
  initialAvatarUrl?: string | null
}

/**
 * Admin row action (SESSION_0437_TASK_0A): pick → re-crop (circle) → set the
 * avatar of ANY passport, including unclaimed placeholders. Wires the EXISTING
 * `ImageCropper` to the admin-gated `setPassportAvatarAsAdmin` safe-action.
 */
export function LineageAvatarAction({
  passportId,
  displayName,
  initialAvatarUrl,
}: LineageAvatarActionProps) {
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const action = useAction(setPassportAvatarAsAdmin, {
    onSuccess: ({ data }) => {
      if (data?.avatarUrl) {
        setAvatarUrl(data.avatarUrl)
        toast.success("Avatar updated.")
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to set avatar. Please try again.")
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, or GIF images are allowed.")
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("File must be under 10MB.")
      return
    }
    setRawPreviewUrl(URL.createObjectURL(file))
  }

  const handleCropComplete = useCallback(
    (cropped: File) => {
      if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
      setRawPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      action.execute({ passportId, file: cropped })
    },
    [rawPreviewUrl, action, passportId],
  )

  const handleCropCancel = useCallback(() => {
    if (rawPreviewUrl) URL.revokeObjectURL(rawPreviewUrl)
    setRawPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [rawPreviewUrl])

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Set avatar for ${displayName}`}
      />
      <Button
        variant="ghost"
        size="sm"
        prefix={
          avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-5 shrink-0 rounded-full object-cover" />
          ) : (
            <ImageIcon />
          )
        }
        isPending={action.isPending}
        disabled={action.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        Avatar
      </Button>

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
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            title={`Crop avatar for ${displayName}`}
          />
        </Suspense>
      )}
    </>
  )
}
