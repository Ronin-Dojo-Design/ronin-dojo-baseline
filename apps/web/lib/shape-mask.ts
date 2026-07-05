/**
 * Display-time shape-mask tokens (SESSION_0499; ADR 0040 one-primitive × variants).
 *
 * Doctrine — the avatar pattern generalized: the cropper family ALWAYS exports a
 * clean RECTANGULAR image (square stored, circle displayed); shapes are applied
 * at DISPLAY time via CSS clip-path so one stored asset is reusable in any
 * shape. Never bake alpha/masked pixels into the uploaded file.
 *
 * Consumers: the uploader cropper's frame-for-shape overlay reads
 * `SHAPE_MASK_CLIP_PATH` (via a CSS var); any display surface renders a masked
 * image with `shapeMaskClass(mask)`.
 */

export type ShapeMask = "circle" | "triangle" | "star"

/** Raw clip-path values — the cropper's mask overlay consumes these via a CSS var. */
export const SHAPE_MASK_CLIP_PATH: Record<ShapeMask, string> = {
  circle: "ellipse(50% 50% at 50% 50%)",
  triangle: "polygon(50% 0%, 100% 100%, 0% 100%)",
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
}

/**
 * Tailwind display classes per mask token. The class strings MUST stay literal
 * (Tailwind static extraction can't see interpolated values) — keep them in
 * sync with `SHAPE_MASK_CLIP_PATH` above; same file so one review sees both.
 */
const SHAPE_MASK_CLASS: Record<ShapeMask, string> = {
  // Circle keeps the existing rounded-full idiom (borders/rings/shadows follow
  // border-radius; clip-path would swallow them).
  circle: "rounded-full",
  triangle: "[clip-path:polygon(50%_0%,100%_100%,0%_100%)]",
  star: "[clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]",
}

/**
 * Display-mask class for a token; undefined = plain rectangle (no mask).
 * Deliberately exported ahead of its display consumers: this is the multi-use
 * API half of the doctrine above (the cropper consumes `SHAPE_MASK_CLIP_PATH`
 * today; display surfaces adopt `shapeMaskClass` as they render masked shapes).
 */
// fallow-ignore-next-line unused-export
export function shapeMaskClass(mask?: ShapeMask | null): string | undefined {
  return mask ? SHAPE_MASK_CLASS[mask] : undefined
}
