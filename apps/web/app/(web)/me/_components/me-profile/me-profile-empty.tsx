import { PencilIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"

/**
 * Graceful fallback when the authenticated member has no provisioned profile yet
 * (post-S2 sign-up always creates one, but degrade without a redirect loop). Copy +
 * CTA preserved verbatim from the pre-decomposition page; the heading opts into the
 * BBL heading token via `bblHeadingFontClass` so it reads correctly under BBL.
 */
export function MeProfileEmpty() {
  return (
    <Section>
      <Section.Content>
        <Card hover={false} className="max-w-xl">
          <CardHeader>
            <H4 className={bblHeadingFontClass}>Set up your Passport</H4>
          </CardHeader>
          <Note>
            Your member profile isn&apos;t set up yet. Add your identity details to publish a
            profile.
          </Note>
          <Button variant="primary" prefix={<PencilIcon />} render={<Link href="/app/profile" />}>
            Complete your profile
          </Button>
        </Card>
      </Section.Content>
    </Section>
  )
}
