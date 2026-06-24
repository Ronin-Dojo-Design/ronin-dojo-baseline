import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import type { ResolvedLeadLineageSelections } from "~/server/admin/leads/lineage-selections"

/**
 * Slice B (SESSION_0442) — the free/Tool counterpart of Slice A's "Lineage selections" card
 * (`app/app/lineage/claims/[id]/_components/claim-review-detail.tsx`). The Join-the-Legacy
 * wizard's creatable comboboxes persist a registered pick as a typed ref id in `Lead.meta`;
 * this surfaces it as a verifiable link on the lead detail page so the steward sees the same
 * resolved selections a claim review shows. A custom (typed) entry has no ref and appears as
 * plain text.
 */
export function LeadLineageSelections({
  selections,
}: {
  selections: ResolvedLeadLineageSelections
}) {
  return (
    <Card className="p-4">
      <Heading render={props => <h2 {...props}>{props.children}</h2>} size="h5" className="mb-2">
        Lineage selections
      </Heading>
      <dl className="grid gap-2 text-sm">
        {selections.rank && (
          <Row label="Rank">
            {selections.rank.kind === "registered" ? (
              <>
                {selections.rank.colorHex && (
                  <span
                    className="inline-block h-4 w-4 rounded-full border"
                    style={{ backgroundColor: selections.rank.colorHex }}
                  />
                )}
                <span className="font-medium">{selections.rank.name}</span>
                {selections.rank.shortName && (
                  <Badge variant="outline">{selections.rank.shortName}</Badge>
                )}
                <Badge variant="outline">registered</Badge>
              </>
            ) : (
              <span>{selections.rank.text}</span>
            )}
          </Row>
        )}

        {selections.school && (
          <Row label="School">
            {selections.school.kind === "registered" ? (
              <>
                <Link href={`/schools/${selections.school.slug}`} className="hover:underline">
                  {selections.school.name}
                </Link>
                <Badge variant="outline">registered</Badge>
              </>
            ) : (
              <span>{selections.school.text}</span>
            )}
          </Row>
        )}

        {selections.trainedUnder && (
          <Row label="Trained under">
            {selections.trainedUnder.kind === "registered" ? (
              <>
                <span className="font-medium">{selections.trainedUnder.name}</span>
                <Badge variant="outline">registered</Badge>
              </>
            ) : (
              <span>{selections.trainedUnder.text}</span>
            )}
          </Row>
        )}

        {selections.represent && (
          <Row label="Represents">
            {selections.represent.kind === "registered" ? (
              <>
                <Link href={`/lineage/${selections.represent.slug}`} className="hover:underline">
                  {selections.represent.name}
                </Link>
                <Badge variant="outline">registered</Badge>
              </>
            ) : (
              <span>{selections.represent.text}</span>
            )}
          </Row>
        )}
      </dl>
      <p className="text-muted-foreground mt-2 text-xs">
        Registered picks link to the verified entity; custom entries are the claimant&apos;s own
        text.
      </p>
    </Card>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-muted-foreground w-28 shrink-0">{label}</dt>
      <dd className="flex items-center gap-2">{children}</dd>
    </div>
  )
}
