import type { ShapeMask } from "~/lib/shape-mask"

/**
 * Crop-preset registry (SESSION_0499) — the single source for the cropper's
 * easy preset selects. TWO layers, deliberately separate:
 *
 * - `aspect` constrains the CROP (what pixels get exported — always a clean
 *   rectangle, exactly like today's avatar flow: square stored).
 * - `mask` is a DISPLAY-time token (`lib/shape-mask.ts`) — circle/triangle/star
 *   are applied with CSS clip-path where the image renders, so one uploaded
 *   asset is reusable in any shape. The cropper only overlays the mask outline
 *   so the user frames for the final shape.
 */

export type CropPresetKey = "circle" | "square" | "wide" | "tall" | "triangle" | "star" | "free"

export type CropPreset = {
  key: CropPresetKey
  label: string
  /** Crop aspect (width / height). undefined = free — the source image's own aspect. */
  aspect?: number
  /** Display-time mask token — the exported crop stays rectangular. */
  mask?: ShapeMask
}

export const CROP_PRESETS: Record<CropPresetKey, CropPreset> = {
  circle: { key: "circle", label: "Circle", aspect: 1, mask: "circle" },
  square: { key: "square", label: "Square", aspect: 1 },
  wide: { key: "wide", label: "Wide", aspect: 16 / 9 },
  tall: { key: "tall", label: "Tall", aspect: 4 / 5 },
  triangle: { key: "triangle", label: "Triangle", aspect: 1, mask: "triangle" },
  star: { key: "star", label: "Star", aspect: 1, mask: "star" },
  free: { key: "free", label: "Free" },
}
