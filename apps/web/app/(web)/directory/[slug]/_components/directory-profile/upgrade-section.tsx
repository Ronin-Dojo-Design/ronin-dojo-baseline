import { LockKeyholeIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"

/** Listing-preview upgrade CTA — only shown when the full profile is gated. */
export function UpgradeSection() {
  return (
    <Section>
      <Stack direction="column" size="sm" className="max-w-xl">
        <H4>Publish the full profile</H4>
        <Note>
          Premium and elite lineage listings publish the full public profile while free listings
          stay intentionally compact.
        </Note>
        <Button
          variant="primary"
          size="md"
          prefix={<LockKeyholeIcon />}
          render={<Link href="/lineage/join" />}
        >
          Upgrade listing
        </Button>
      </Stack>
    </Section>
  )
}
