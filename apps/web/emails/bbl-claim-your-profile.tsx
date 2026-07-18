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
  /** Durable sign-in URL; the profile claim reconciles after sign-in via the email binding. */
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
      preview="Your Black Belt Legacy profile is ready — claim it in 3 steps"
    >
      <BblEmailHeading>Your place in the lineage is waiting</BblEmailHeading>

      <Text className="mt-0">Hey {firstName?.trim() || "there"},</Text>

      <Text>
        Black Belt Legacy is now live at <strong>blackbeltlegacy.com</strong> — a permanent home for
        the lineage and the people who built it.
      </Text>

      <Text>
        We created a profile for <strong>{profileName}</strong> from the records we carried over
        from the old site. <strong>Your information is safe</strong> — your name, your rank, and the
        students who trace their lineage through you are already on the tree, exactly as they were
        before. Nothing was lost.
      </Text>

      <Section className="my-4 rounded-lg border border-solid border-neutral-200 bg-neutral-50 px-5 py-4">
        <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">
          How to claim your profile — 3 steps
        </Text>
        <Text className="mb-0 mt-3 text-[14px] leading-7 text-neutral-800">
          <strong>1.</strong> Click the button below to open the sign-in screen — no password to set
          up or remember.
          <br />
          <strong>2.</strong> Confirm your details and add a photo if you like.
          <br />
          <strong>3.</strong> That&apos;s it — your profile is claimed after sign-in and ready to
          update.
        </Text>
        <Text className="mb-0 mt-2 text-[13px] text-neutral-500">
          Once you&apos;re in, you can see your students in the lineage tree and edit anything that
          needs updating.
        </Text>
      </Section>

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

      <Text className="text-[13px] text-neutral-500">
        Questions? Reply to this email and we&apos;ll help you through it.
      </Text>
    </BblEmailWrapper>
  )
}

EmailBblClaimYourProfile.PreviewProps = {
  to: "chris@example.com",
  firstName: "Chris",
  profileName: "Chris Haueter",
  claimUrl: "https://blackbeltlegacy.com/auth/login?next=%2Fme",
  compTier: "ELITE",
  isLifetime: true,
} satisfies EmailProps

export default EmailBblClaimYourProfile
