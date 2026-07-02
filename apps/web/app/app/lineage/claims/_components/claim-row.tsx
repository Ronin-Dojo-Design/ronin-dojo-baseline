import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Link } from "~/components/common/link"
import type { ClaimRowViewModel } from "./claim-row-view-model"

/**
 * One pending-claim queue row (SESSION_0492 cleanup). Presentation-only — it
 * consumes the pure {@link ClaimRowViewModel} the list page derives, so the fat
 * `.map` arrow no longer carries the display logic.
 */
export function ClaimRow({ vm }: { vm: ClaimRowViewModel }) {
  return (
    <Link
      href={vm.href}
      className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{vm.title}</p>
        {vm.belt ? (
          <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
            <BeltSwatch colorHex={vm.belt.colorHex} />
            {vm.belt.label}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground truncate">{vm.treeLabel}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {vm.isPromotion && <Badge variant="soft">Promotion</Badge>}
        <Badge variant={vm.status === "NEEDS_INFO" ? "outline" : "info"}>{vm.status}</Badge>
        <span className="text-xs text-muted-foreground">{vm.createdLabel}</span>
      </div>
    </Link>
  )
}
