import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Prose } from "~/components/common/prose"
import type { CurriculumJourneyItem } from "./scene-model"

/**
 * A representative curriculum item within a CurriculumJourney scene (G-022 Wave 3,
 * SESSION_0649) — presentational only, no motion, no interaction (the full item
 * detail + technique-graph links stay in `BjjCurriculumBrowser`'s dialog below).
 * Shared by the motion scene (`CurriculumJourneyScene`) and its reduced-motion twin
 * (`CurriculumJourneyStaticScene`) so the two never drift.
 */
export function CurriculumJourneyItemCard({ item }: { item: CurriculumJourneyItem }) {
  return (
    <Card hover={false} focus={false} className="gap-2">
      <CardHeader size="xs" direction="column" className="gap-1">
        <H4 className="text-base">{item.title}</H4>
        {item.description && (
          <p className="text-sm text-secondary-foreground">{item.description}</p>
        )}
      </CardHeader>

      {item.keyPoints.length > 0 && (
        <Prose className="prose-sm max-w-none">
          <ul>
            {item.keyPoints.map(point => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Prose>
      )}
    </Card>
  )
}
