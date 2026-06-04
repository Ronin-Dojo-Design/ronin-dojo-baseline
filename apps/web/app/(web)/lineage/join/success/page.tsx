import { CheckCircle2Icon } from "lucide-react"
import type { Metadata } from "next"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"

export const metadata: Metadata = {
  title: "Lineage Membership Confirmed",
  description: "Your Black Belt Legacy lineage membership checkout is complete.",
}

export default function LineageMembershipSuccessPage() {
  return (
    <Wrapper size="sm" gap="lg">
      <Intro>
        <Badge variant="success" prefix={<CheckCircle2Icon />}>
          Checkout complete
        </Badge>
        <IntroTitle>Lineage Membership Confirmed</IntroTitle>
        <IntroDescription>
          Your payment is complete. Membership access can take a moment while Stripe sends the final
          confirmation.
        </IntroDescription>
      </Intro>

      <Stack direction="column" size="md">
        <Note>Return to your lineage hub or continue to your Passport.</Note>
        <Stack>
          <Button render={<Link href="/lineage" />}>Lineage hub</Button>
          <Button variant="secondary" render={<Link href="/me" />}>
            My Passport
          </Button>
        </Stack>
      </Stack>
    </Wrapper>
  )
}
