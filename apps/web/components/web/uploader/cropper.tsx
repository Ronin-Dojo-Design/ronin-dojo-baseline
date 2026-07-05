"use client"

import { type CSSProperties, useCallback, useEffect, useState } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import {
  CheckIcon,
  CircleIcon,
  CropIcon,
  RectangleHorizontalIcon,
  RectangleVerticalIcon,
  RotateCcwIcon,
  SquareIcon,
  StarIcon,
  TriangleIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import { Button } from "~/components/common/button"
import { ButtonGroup } from "~/components/common/button-group"
import { SHAPE_MASK_CLIP_PATH } from "~/lib/shape-mask"
import { CROP_PRESETS, type CropPresetKey } from "./crop-presets"

const PRESET_ICONS: Record<CropPresetKey, typeof CircleIcon> = {
  circle: CircleIcon,
  square: SquareIcon,
  wide: RectangleHorizontalIcon,
  tall: RectangleVerticalIcon,
  triangle: TriangleIcon,
  star: StarIcon,
  free: CropIcon,
}

// Tints the region that survives the display mask so the user frames for the
// final shape. The export itself stays rectangular (lib/shape-mask doctrine);
// the polygon arrives via a CSS var so ONE literal Tailwind class serves every
// mask token (arbitrary values can't be interpolated at runtime).
const MASK_OVERLAY_CLASS =
  "after:pointer-events-none after:absolute after:inset-0 after:bg-white/20 after:content-[''] after:[clip-path:var(--crop-mask-clip)]"

const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
  maxOutputPx?: number,
): Promise<File> => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener("load", () => resolve(img))
    img.addEventListener("error", reject)
    img.crossOrigin = "anonymous"
    img.src = imageSrc
  })

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")

  // Optional long-edge cap: consumers feeding size-capped upload seams (e.g. the
  // 512KB `uploadMedia` ceiling) downscale here at draw time instead of shipping
  // a full-resolution crop that the server would reject.
  const longEdge = Math.max(pixelCrop.width, pixelCrop.height)
  const scale = maxOutputPx && longEdge > maxOutputPx ? maxOutputPx / longEdge : 1

  canvas.width = Math.round(pixelCrop.width * scale)
  canvas.height = Math.round(pixelCrop.height * scale)
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
      "image/webp",
      0.9,
    ),
  )

  return new File([blob], "avatar.webp", { type: "image/webp" })
}

type ImageCropperProps = {
  imageSrc: string
  onCropComplete: (file: File) => void
  onCancel: () => void
  title?: string
  accentColor?: string
  /**
   * Allowed crop presets (`crop-presets.ts`) — more than one renders the easy
   * preset select row. Defaults to the avatar circle (zero regression for the
   * existing avatar consumers).
   */
  presets?: CropPresetKey[]
  /** Initially-selected preset; must be in `presets` (falls back to the first). */
  defaultPreset?: CropPresetKey
  /** Optional long-edge cap (px) — downscales the output canvas at draw time. */
  maxOutputPx?: number
}

/**
 * Full-screen crop overlay (hand-rolled `fixed inset-0`, NOT a Dialog).
 *
 * Escape ownership (SESSION_0499 Desi P1): because this is a raw overlay, a
 * host `Dialog` under it still owns the Escape key — mid-crop Escape closed
 * the HOST dialog and discarded its unsaved fields. The window keydown CAPTURE
 * listener below claims Escape while the cropper is mounted (cancel the crop,
 * keep the host dialog + its dirty state alive). The long-term fix is
 * rebuilding this overlay ON `~/components/common/dialog` so Base UI's
 * dismissal stack owns key handling natively — deliberately NOT done in the
 * Desi fix pass (scoped change only).
 */
export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  title = "Crop photo",
  accentColor = "var(--color-primary)",
  presets = ["circle"],
  defaultPreset,
  maxOutputPx,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [presetKey, setPresetKey] = useState<CropPresetKey>(
    defaultPreset && presets.includes(defaultPreset) ? defaultPreset : presets[0],
  )
  // The "free" preset crops at the source image's own aspect (react-easy-crop
  // is fixed-aspect only — true freeform isn't supported by the lib).
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null)

  const preset = CROP_PRESETS[presetKey]
  const aspect = preset.aspect ?? naturalAspect ?? 4 / 3
  // Circle uses the lib's native round mask (the existing avatar idiom);
  // triangle/star get a clip-path outline overlay on the rectangular crop box.
  const overlayMask = preset.mask && preset.mask !== "circle" ? preset.mask : null

  const onCropAreaComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!croppedArea) return
    setIsProcessing(true)
    try {
      const file = await createCroppedImage(imageSrc, croppedArea, maxOutputPx)
      onCropComplete(file)
    } finally {
      setIsProcessing(false)
    }
  }, [imageSrc, croppedArea, onCropComplete, maxOutputPx])

  // Escape closes the CROPPER, not the host dialog (see the component docblock).
  // Capture phase + stopImmediatePropagation beats Base UI Dialog's document-
  // level dismiss listener, so the host dialog and its dirty fields survive.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopImmediatePropagation()
      onCancel()
    }
    window.addEventListener("keydown", onKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true })
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 p-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button
          onClick={onCancel}
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
          aria-label="Cancel cropping"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      {/* Preset row — only when the consumer allows more than one preset */}
      {presets.length > 1 && (
        <div className="flex justify-center border-b border-neutral-800 bg-neutral-900 p-3">
          <ButtonGroup>
            {presets.map(key => {
              const option = CROP_PRESETS[key]
              const Icon = PRESET_ICONS[key]
              return (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={key === presetKey ? "primary" : "secondary"}
                  prefix={<Icon />}
                  aria-pressed={key === presetKey}
                  onClick={() => setPresetKey(key)}
                >
                  {option.label}
                </Button>
              )
            })}
          </ButtonGroup>
        </div>
      )}

      {/* Cropper area */}
      <div className="relative min-h-0 flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          cropShape={preset.mask === "circle" ? "round" : "rect"}
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropAreaComplete}
          onMediaLoaded={({ naturalWidth, naturalHeight }) =>
            setNaturalAspect(naturalWidth / naturalHeight)
          }
          classes={overlayMask ? { cropAreaClassName: MASK_OVERLAY_CLASS } : undefined}
          style={{
            containerStyle: { backgroundColor: "#000" },
            cropAreaStyle: {
              border: `2px solid ${accentColor}`,
              ...(overlayMask &&
                ({ "--crop-mask-clip": SHAPE_MASK_CLIP_PATH[overlayMask] } as CSSProperties)),
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="border-t border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={() => setZoom(z => Math.max(z - 0.1, 1))}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            aria-label="Zoom out"
          >
            <ZoomOutIcon className="size-5" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-neutral-700"
            style={{ accentColor }}
            aria-label="Zoom level"
          />
          <button
            onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            aria-label="Zoom in"
          >
            <ZoomInIcon className="size-5" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            prefix={<RotateCcwIcon />}
            onClick={() => setRotation(r => (r + 90) % 360)}
          >
            Rotate
          </Button>

          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirm}
              isPending={isProcessing}
              suffix={<CheckIcon />}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
