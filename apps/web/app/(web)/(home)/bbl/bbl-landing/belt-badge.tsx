import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { cx } from "~/lib/utils"

/**
 * A rank chip whose belt color is `Rank.colorHex` DATA, rendered via `<BeltSwatch>`
 * — never a hardcoded belt-color className map. This replaces the landing's legacy
 * `BELT_BADGE_CLASSES` (`bg-red-700` / `from-red-600 via-white …`), the exact
 * "hardcoded belt palette" ADR 0022 forbids. The chip chrome is neutral, token-only
 * (`variant="outline"` → `bg-background` + `border-border`), so the belt swatch is
 * the only color and it stays theme-safe. `colorHex` of `null` → neutral swatch.
 */
export const BeltBadge = ({
  rank,
  colorHex,
  size = "md",
  className,
}: {
  rank: string
  colorHex: string | null
  size?: ComponentProps<typeof Badge>["size"]
  className?: string
}) => (
  <Badge variant="outline" size={size} className={cx("border", className)}>
    <BeltSwatch colorHex={colorHex} className="size-3" />
    {rank}
  </Badge>
)
