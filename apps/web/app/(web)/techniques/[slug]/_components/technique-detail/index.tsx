import dynamic from "next/dynamic"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { TechniqueBadges } from "./technique-badges"
import type { TechniqueDetailView } from "./technique-detail-format"
import { TechniqueProseList } from "./technique-prose-list"
import { TechniqueSafety } from "./technique-safety"

// Lazy boundary: the media gallery is the heaviest, last-painted section, so its chunk
// loads once reached. SSR is kept (no `ssr: false`) so the media still server-renders.
const TechniqueMedia = dynamic(() => import("./technique-media").then(m => m.TechniqueMedia))

/**
 * Public technique-detail orchestrator — the colocated folder module's barrel and only
 * export (component-launch-sweep recipe). Thin: it wires the header + badges + the lazy
 * media gallery + the prose sections inside the brand typography scope; it owns no data
 * fetching (the route loads the technique on the wire) and no section presentation.
 *
 * Brand seam: the whole visible body renders inside `BrandTypography`
 * (`bblHeadingScopeClass`) so the title + section headings inherit the BBL type tokens
 * under BBL and degrade to the app fonts off-BBL. The badges were already token-clean
 * (semantic variants, no hex; techniques carry no `Rank.colorHex`), so step 2 is a
 * type-seam-only pass.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function TechniqueDetail({ technique, brand }: TechniqueDetailView) {
  return (
    <BrandTypography brand={brand} className={bblHeadingScopeClass}>
      <Intro>
        <IntroTitle>{technique.name}</IntroTitle>
        {technique.description && <IntroDescription>{technique.description}</IntroDescription>}
      </Intro>

      <TechniqueBadges technique={technique} />

      <TechniqueMedia
        mediaAttachments={technique.mediaAttachments}
        techniqueName={technique.name}
      />

      <TechniqueProseList title="Teaching Cues" items={technique.teachingCues} />
      <TechniqueProseList title="Common Errors" items={technique.commonErrors} />
      <TechniqueSafety notes={technique.safetyNotes} />
    </BrandTypography>
  )
}
