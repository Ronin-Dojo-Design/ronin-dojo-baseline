"use client"

import { CameraIcon } from "lucide-react"
import { cx } from "~/lib/utils"

/**
 * Belt-framed avatar preview. The ring tint is driven by Rank.colorHex
 * passed from the caller — never a hardcoded belt-color map.
 * Falls back to a neutral border when no color is available.
 */
export function BeltPreview({
  avatarUrl,
  colorHex,
  onChoosePhoto,
  size = "lg",
}: {
  avatarUrl?: string | null
  colorHex?: string | null
  onChoosePhoto?: () => void
  size?: "sm" | "lg"
}) {
  const ringStyle = colorHex
    ? { boxShadow: `0 0 0 3px ${colorHex}, 0 0 0 5px color-mix(in srgb, ${colorHex} 20%, transparent)` }
    : { boxShadow: "0 0 0 2px hsl(var(--border))" }

  const sizeClasses = size === "lg" ? "size-28" : "size-20"
  const innerClasses = size === "lg" ? "size-24" : "size-16"
  const iconClasses = size === "lg" ? "size-8" : "size-6"

  const inner = (
    <span
      className={cx(
        "relative flex items-center justify-center rounded-full p-0.5",
        sizeClasses,
      )}
      style={ringStyle}
    >
      <span
        className={cx(
          "relative flex shrink-0 overflow-hidden rounded-full bg-muted",
          innerClasses,
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile photo" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <CameraIcon className={iconClasses} aria-hidden="true" />
          </span>
        )}

        {onChoosePhoto && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            <CameraIcon className={cx(iconClasses, "text-white")} aria-hidden="true" />
          </span>
        )}
      </span>
    </span>
  )

  if (onChoosePhoto) {
    return (
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onChoosePhoto}
          className="group inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring rounded-full"
          aria-label={avatarUrl ? "Change profile photo" : "Add profile photo"}
        >
          {inner}
        </button>
        {colorHex && (
          <div
            className="h-1 w-12 rounded-full"
            style={{ backgroundColor: colorHex }}
            aria-hidden="true"
          />
        )}
        <p className="text-xs text-muted-foreground">
          {avatarUrl ? "Click to change" : "Click to add photo"}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {inner}
      {colorHex && (
        <div
          className="h-1 w-12 rounded-full"
          style={{ backgroundColor: colorHex }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
