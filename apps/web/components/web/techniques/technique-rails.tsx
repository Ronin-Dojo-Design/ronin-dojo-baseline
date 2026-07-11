import type { Brand } from "~/.generated/prisma/client"
import { H2 } from "~/components/common/heading"
import { TechniqueRail } from "~/components/web/techniques/technique-rail"
import { getTechniqueRails, UNCATEGORIZED_RAIL } from "~/server/web/techniques/queries"

/**
 * Human labels for the positional `TechniqueCategory` enum, used as rail titles. Unknown
 * values fall back to a humanized enum string (Title Case). Kept as literals — the other
 * technique facets label their enums inline the same way (no i18n round-trip).
 */
const CATEGORY_RAIL_LABELS: Record<string, string> = {
  SUBMISSION: "Submissions",
  ESCAPE: "Escapes",
  TRANSITION: "Transitions",
  SWEEP: "Sweeps",
  TAKEDOWN: "Takedowns",
  THROW: "Throws",
  STRIKE: "Strikes",
  KICK: "Kicks",
  BLOCK: "Blocks",
  FORM: "Forms",
  DRILL: "Drills",
  CONDITIONING: "Conditioning",
  [UNCATEGORIZED_RAIL]: "Core techniques",
}

function railLabel(category: string): string {
  return (
    CATEGORY_RAIL_LABELS[category] ??
    category
      .toLowerCase()
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )
}

/**
 * Browse-by-category technique rails (Stream D2). A server component that loads the
 * per-category rail groups and renders one {@link TechniqueRail} carousel each. Renders
 * nothing when the brand has no rail-worthy techniques, so it is safe above the faceted
 * grid on the technique index.
 */
export async function TechniqueRails({ brand }: { brand: Brand }) {
  const rails = await getTechniqueRails(brand)

  if (rails.length === 0) return null

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <H2>Browse by category</H2>
        <p className="text-sm text-muted-foreground">
          Snap through the curriculum by movement family, or search the full library below.
        </p>
      </div>

      {rails.map(rail => (
        <TechniqueRail
          key={rail.category}
          title={railLabel(rail.category)}
          total={rail.total}
          techniques={rail.techniques}
        />
      ))}
    </div>
  )
}
