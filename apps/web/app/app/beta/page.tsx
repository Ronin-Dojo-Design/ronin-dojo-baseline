import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { Heading } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"

/**
 * Beta index (SESSION_0498 TASK_04) — the list of in-flight features viewable
 * LIVE before public GA. Gate lives on the segment layout (`beta.view`).
 *
 * One flat list of L1 `Card`s — a feature entry is a name + description + link,
 * nothing more (no god-card, no registry abstraction until a third tenant
 * actually needs one).
 */

const BETA_FEATURES = [
  {
    href: "/app/beta/lineage-journey",
    name: "Lineage Journey",
    description:
      "The scroll-driven ancestry story on public profiles — previewed here with disabled scenes visible, so new scenes can be curated before flipping live.",
  },
] as const

export default function BetaIndexPage() {
  return (
    <Wrapper>
      <Stack direction="column" className="gap-6">
        <Stack direction="column" size="xs">
          <Heading render={props => <h1 {...props}>{props.children}</h1>} size="h3">
            Beta
          </Heading>
          <Note>
            In-flight features, live before public GA. What you see here may include content
            deliberately hidden from the public site.
          </Note>
        </Stack>

        <Stack direction="column" className="w-full gap-4">
          {BETA_FEATURES.map(feature => (
            <Card key={feature.href} render={<Link href={feature.href} />}>
              <CardHeader direction="column" size="xs">
                <Heading size="h4">{feature.name}</Heading>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Wrapper>
  )
}
