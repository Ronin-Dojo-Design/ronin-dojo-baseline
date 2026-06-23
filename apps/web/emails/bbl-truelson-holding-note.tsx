import "dotenv/config"

import { Text } from "@react-email/components"
import {
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

/**
 * Brian Truelson holding note (SESSION_0436) — the warm "we've got you" touch
 * BEFORE the real claim invite. Deliberately carries NO claim link: it sets the
 * expectation (profile + promotion history preserved; claim invite + certificates
 * coming) while E0 (unified Passport claim, ADR 0036) lands. Two-touch: this note
 * now, the one-click claim invite shortly after.
 *
 * Founder-to-member first person ("I"), reusing the BBL wrapper. Operator-approved
 * copy (SESSION_0436); the only edit from the operator's draft is softening the
 * "hopefully by tonight" line to "coming very soon" to match the E0-first gate.
 */

type EmailProps = BblEmailWrapperProps & {
  /** First-person salutation name (e.g. "Brian"). */
  recipientName: string
}

const Para = ({ children }: { children: React.ReactNode }) => (
  <Text className="my-0 mb-4 text-[15px] leading-relaxed text-neutral-800">{children}</Text>
)

export const EmailBblTruelsonHoldingNote = ({ recipientName, ...wrapper }: EmailProps) => (
  <BblEmailWrapper
    {...wrapper}
    preview="Your profile and promotion history are preserved — your claim invite is coming very soon."
  >
    <BblEmailHeading>We&apos;ve got you, {recipientName}</BblEmailHeading>

    <Para>
      Thank you for reaching out — and I&apos;m sorry the old site left you staring at a blank where
      your profile and certificates should&apos;ve been. That&apos;s exactly the kind of thing
      we&apos;re rebuilding Black Belt Legacy to never do again.
    </Para>

    <Para>
      I want you to know: your place in the lineage is already preserved. You&apos;re recorded as a
      1st-degree black belt under Bill Hosken — and your promotion history is in the system, not
      lost. (If you&apos;ve been promoted since, just let me know. Once you&apos;re in, you&apos;ll
      be able to add photos, edit dates, and more — we&apos;re pulling in features from beta
      constantly, so tell me anything that would be helpful to you.)
    </Para>

    <Para>
      We&apos;re putting the final polish on the part that lets you claim your own profile — sign
      in, edit it, and see it live on your page, the way it always should have worked. I didn&apos;t
      want to send you a half-working link, so I&apos;m holding the claim invite until it&apos;s a
      clean, one-click experience. You&apos;ll be among the very first we send it to, and it&apos;s
      coming very soon.
    </Para>

    <Para>
      Certificates are on the way too — we&apos;re building a proper home for them so your rank
      shows up digitally and you can order physical copies, the way you earned it.
    </Para>

    <Para>Appreciate your patience and your loyalty over the years. More soon.</Para>

    <Para>
      — Brian Scott
      <br />
      Black Belt Legacy
    </Para>
  </BblEmailWrapper>
)

export default EmailBblTruelsonHoldingNote
