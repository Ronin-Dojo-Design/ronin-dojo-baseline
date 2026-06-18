import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"

/**
 * The events-index sidebar note explaining what a ceremony page groups together.
 * `H5` is left as the brand-neutral sans subheading (per the heading primitive) —
 * the BBL heading font is reserved for the display headings (page title, card
 * titles), matching the Prose / bbl-landing heading scope.
 */
export function ReadSurfaceAside() {
  return (
    <Card hover={false}>
      <CardHeader>
        <H5>Read Surface</H5>
      </CardHeader>
      <CardDescription className="line-clamp-none">
        Ceremony pages group shared event details, linked rank awards, and public gallery media.
      </CardDescription>
    </Card>
  )
}
