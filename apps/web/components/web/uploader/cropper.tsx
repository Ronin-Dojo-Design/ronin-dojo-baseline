"use client"

import { useCallback, useState } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { CheckIcon, RotateCcwIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"
import { Button } from "~/components/common/button"

const createCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<File> => {
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

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
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
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  title = "Crop photo",
  accentColor = "hsl(var(--primary))",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropAreaComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (!croppedArea) return
    setIsProcessing(true)
    try {
      const file = await createCroppedImage(imageSrc, croppedArea)
      onCropComplete(file)
    } finally {
      setIsProcessing(false)
    }
  }, [imageSrc, croppedArea, onCropComplete])

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

      {/* Cropper area */}
      <div className="relative min-h-0 flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropAreaComplete}
          style={{
            containerStyle: { backgroundColor: "#000" },
            cropAreaStyle: { border: `2px solid ${accentColor}` },
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
          <button
            onClick={() => setRotation(r => (r + 90) % 360)}
            className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-white transition-colors hover:bg-neutral-700"
          >
            <RotateCcwIcon className="size-4" />
            Rotate
          </button>

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
