import "dotenv/config"

import { Text } from "@react-email/components"
import {
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

type EmailProps = BblEmailWrapperProps & {
  name?: string | null
}

/**
 * Black Belt Legacy pre-launch teaser confirmation (SESSION_0411).
 *
 * Sent best-effort when a visitor leaves their email on the launch teaser landing
 * page. The capture persists regardless of send (the send no-ops when Resend isn't
 * configured), so this is purely a courtesy confirmation, not part of the write path.
 */
export const EmailBblTeaserWelcome = ({ name, ...props }: EmailProps) => {
  return (
    <BblEmailWrapper {...props} preview="You're on the Black Belt Legacy early-access list">
      <BblEmailHeading>You're on the list</BblEmailHeading>

      <Text className="mt-0">Hey {name?.trim() || "there"}!</Text>

      <Text>
        Thanks for joining the Black Belt Legacy early-access list. We're building a new home for
        the lineage — verified history, living profiles, and the legacy of Rigan Machado's family
        tree, all in one place.
      </Text>

      <Text>We'll email you the moment early access opens. Until then, keep training.</Text>
    </BblEmailWrapper>
  )
}

EmailBblTeaserWelcome.PreviewProps = {
  to: "member@example.com",
  name: "Alex",
} satisfies EmailProps

export default EmailBblTeaserWelcome
