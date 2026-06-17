import "dotenv/config"

import { Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

type EmailProps = BblEmailWrapperProps & {
  /** First name for the greeting (falls back to a warm generic). */
  firstName?: string | null
  /** The imported profile's display name, e.g. "Chris Haueter". */
  profileName: string
  /** Absolute URL that starts the claim flow for this person's node. */
  claimUrl: string
  /** Comped membership tier label (the gift). */
  compTier?: "ELITE"
  /** Dirty Dozen → lifetime; everyone else → one free year. */
  isLifetime?: boolean
}

export const EmailBblClaimYourProfile = ({
  firstName,
  profileName,
  claimUrl,
  compTier = "ELITE",
  isLifetime = false,
  ...props
}: EmailProps) => {
  const tierLabel = compTier === "ELITE" ? "Elite" : "membership"
  const compLine = isLifetime
    ? `lifetime ${tierLabel} membership — on us, for good`
    : `one year of ${tierLabel} membership — on us`

  return (
    <BblEmailWrapper
      {...props}
      preview="blackbeltlegacy.com is live — claim your profile and your free membership"
    >
      <BblEmailHeading>Your place in the lineage is waiting</BblEmailHeading>

      <Text className="mt-0">Hey {firstName?.trim() || "there"},</Text>

      <Text>
        Black Belt Legacy is now live at <strong>blackbeltlegacy.com</strong> — a permanent home for
        the lineage and the people who built it. We&apos;ve already created a profile for{" "}
        <strong>{profileName}</strong> from the records carried over from the old site, so your
        story is on the tree from day one.
      </Text>

      <Text>
        Claim it to take ownership of your account: confirm your details, edit your profile, and see
        the students who trace their lineage through you.
      </Text>

      {/* The comp gift — visually set apart. */}
      <Section className="my-2 rounded-lg border border-solid border-red-100 bg-red-50 px-5 py-4">
        <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
          A gift, founder to founder
        </Text>
        <Text className="mb-0 mt-1 text-[15px] text-neutral-800">
          When you claim your profile, you get <strong>{compLine}</strong>. No card required —
          it&apos;s our thanks for being part of this legacy.
        </Text>
      </Section>

      <BblEmailButton href={claimUrl}>Claim your profile</BblEmailButton>

      <Text className="text-[13px] text-neutral-500">
        If the button doesn&apos;t work, copy and paste this link into your browser:
        <br />
        <span className="break-all text-neutral-700">{claimUrl}</span>
      </Text>
    </BblEmailWrapper>
  )
}

EmailBblClaimYourProfile.PreviewProps = {
  to: "chris@example.com",
  firstName: "Chris",
  profileName: "Chris Haueter",
  claimUrl: "https://blackbeltlegacy.com/lineage/join?node=chris-haueter",
  compTier: "ELITE",
  isLifetime: true,
} satisfies EmailProps

export default EmailBblClaimYourProfile
