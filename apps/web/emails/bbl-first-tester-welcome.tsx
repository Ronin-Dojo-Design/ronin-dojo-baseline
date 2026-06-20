import "dotenv/config"

import { Column, Hr, Link, Row, Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

/**
 * The operator's warm, personal thank-you to Brian Truelson (SESSION_0420) — a
 * long-time loyal member and Black Belt Legacy's FIRST non-admin tester. Written
 * founder-to-member in the first person ("I"), it mirrors the founder
 * "Long Road" letter (`bbl-the-long-road.tsx`): the BBL wrapper, the red-circle
 * numbered step pattern, and a one-click claim magic link carried inside.
 *
 * It says the things this moment calls for: gratitude for years of loyalty, the
 * invitation to be the first real claim test, a genuine ask for friction
 * feedback, the lifetime-membership gift (PayPal waived — messaging only; the
 * legacy WordPress PayPal sub has nothing to cancel in-app), the gear/certificate
 * offer, and a clear CLAIM-PROCESS explanation styled like the login explainer:
 * two ways to sign in (Google recommended + Magic Link), each as red-circle
 * numbered steps, plus the key reassurance that the profile claims itself on
 * sign-in via EITHER method — nothing more to do.
 *
 * Every block is fluid + word-wrapping so it reads perfectly on a narrow phone
 * with no horizontal scroll. The comp tier (lifetime Elite) is granted out of
 * band by the operator; this copy only announces it.
 */

type EmailProps = BblEmailWrapperProps & {
  /** First-person salutation name (e.g. "Brian"). */
  recipientName: string
  /** The recipient's one-click claim/sign-in magic link (button + paste fallback). */
  claimUrl: string
}

/** A numbered step — a big brand-red circle with a white number, beside its instruction. */
const LoginStep = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <Row className="mb-2">
    <Column className="w-9 align-top">
      <span className="inline-block h-7 w-7 rounded-full bg-red-600 text-center text-[13px] font-bold leading-7 text-white">
        {n}
      </span>
    </Column>
    <Column className="align-top">
      <Text className="my-0 text-[14px] leading-7 text-neutral-800">{children}</Text>
    </Column>
  </Row>
)

/** Section eyebrow — uppercase, tracked, brand-red. */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">
    {children}
  </Text>
)

export const EmailBblFirstTesterWelcome = ({
  recipientName,
  claimUrl,
  to,
  ...props
}: EmailProps) => {
  return (
    <BblEmailWrapper
      {...props}
      to={to}
      preview="Thank you — and a first look at the new Black Belt Legacy, just for you"
    >
      <BblEmailHeading>Thank You — and Welcome In</BblEmailHeading>

      <Text className="mt-0">{recipientName},</Text>

      <Text>
        First and most of all — <strong>thank you</strong>. You&apos;ve been a loyal member of Black
        Belt Legacy for all these years, and that loyalty is exactly what kept me building.
        I&apos;ve thought about members like you at every step of this, and I&apos;m grateful
        you&apos;re still here.
      </Text>

      <Text>
        Your timing reaching out couldn&apos;t have been better. We just finished testing the new
        site among the team, and I&apos;d love for you to be the <strong>very first</strong> member
        outside our admins to take it for a real spin. I&apos;m hoping you&apos;ll be our{" "}
        <strong>first claim success</strong> — the first real member to step in and take ownership
        of your profile.
      </Text>

      <BblEmailButton href={claimUrl}>Open the site & claim your profile</BblEmailButton>

      <Text className="text-[13px] text-neutral-500">
        Or paste this into your browser:
        <br />
        <Link href={claimUrl} className="break-all text-red-700 underline">
          {claimUrl}
        </Link>
      </Text>

      <Text>
        One tap on that link signs you in and claims your profile in a single step. It&apos;s yours,
        privately — it&apos;s bound to your email and good for 7 days.
      </Text>

      <Hr className="my-6 border-neutral-200" />

      {/* The gift — lifetime membership + PayPal waived. */}
      <Eyebrow>A Token of My Appreciation</Eyebrow>
      <Section className="my-4 overflow-hidden rounded-lg border border-solid border-red-200 bg-red-50 px-4 py-4">
        <Text className="my-0 text-[15px] leading-7 text-neutral-800">
          For sticking with us all this time, I&apos;ve granted you{" "}
          <strong className="text-neutral-950">lifetime membership</strong> — the full Elite
          experience, on the house, for as long as Black Belt Legacy exists. And{" "}
          <strong className="text-neutral-950">your old PayPal subscription is waived</strong> —
          there&apos;s nothing for you to cancel and nothing more to pay. Consider it a small thank
          you for a long loyalty.
        </Text>
      </Section>

      <Hr className="my-6 border-neutral-200" />

      {/* Gear + certificate offer. */}
      <Eyebrow>On the House — Gear & Your Certificate</Eyebrow>
      <Text className="mt-0">
        Certificates, shirts, rashguards, and hoodies are dropping shortly. Here&apos;s my personal
        offer to you:
      </Text>
      <Text className="my-2">
        📦 <strong>Send me your school logo</strong> and I&apos;ll personally send you a shirt,
        rashguard, or hoodie — with your school logo, the Black Belt Legacy logo, or both. Your
        call.
      </Text>
      <Text className="my-2">
        🥋 <strong>Tell me your updated rank</strong> and I&apos;ll send you a free certificate,
        hand-signed by Rigan.
      </Text>
      <Text className="mt-2">
        Just reply to this email with your logo and your current rank and I&apos;ll take care of the
        rest.
      </Text>

      <Hr className="my-6 border-neutral-200" />

      {/* The real ask — friction feedback. */}
      <Eyebrow>Your Feedback Is the Real Gift</Eyebrow>
      <Text className="mt-0">
        As you move through the site,{" "}
        <strong>please tell me if anything breaks, feels off, or has any friction</strong> —
        anywhere it could be easier or clearer. I think it&apos;s solid, but your eyes on it right
        now are invaluable, and I&apos;d much rather hear about a little kink from you than have the
        next member hit it. Flag any final rough edges as you navigate — nothing is too small.
      </Text>

      <Hr className="my-6 border-neutral-200" />

      {/* How signing in AND claiming works — login-explainer pattern. */}
      <Eyebrow>How to Sign In — and How Your Profile Claims Itself</Eyebrow>
      <Text className="mt-0">
        The link above signs you in automatically this first time and claims your profile on the
        spot. For every visit after, here are your two ways back in — I&apos;d start with Google.
      </Text>

      <Section className="my-4 overflow-hidden rounded-lg border border-solid border-neutral-200 bg-neutral-50 px-4 py-4">
        <Text className="my-0 mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-red-700">
          Option 1 — Google · Recommended
        </Text>
        <LoginStep n={1}>Tap “Continue with Google.”</LoginStep>
        <LoginStep n={2}>Choose your Google account.</LoginStep>
        <LoginStep n={3}>You&apos;re in — instantly, every time.</LoginStep>
      </Section>

      <Section className="my-4 overflow-hidden rounded-lg border border-solid border-neutral-200 px-4 py-4">
        <Text className="my-0 mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-red-700">
          Option 2 — Magic Link
        </Text>
        <Text className="my-0 mb-3 text-[14px] leading-7 text-neutral-700">
          No password to remember, none to lose or steal. We email you a single, private link that
          signs you in with one tap. It feels new, but it&apos;s exactly how the best modern apps do
          it — Slack, Notion, Substack, and Vercel all sign you in this way. It&apos;s the secure,
          simple standard, and it&apos;s the safest login there is.
        </Text>
        <LoginStep n={1}>Enter your email on the sign-in screen.</LoginStep>
        <LoginStep n={2}>Open the email from Black Belt Legacy and tap its link.</LoginStep>
        <LoginStep n={3}>
          That&apos;s it — you&apos;re signed in. (Open it within a few days; the link is
          time-limited for your security.)
        </LoginStep>
      </Section>

      <Section className="my-4 overflow-hidden rounded-lg border border-solid border-red-200 bg-red-50 px-4 py-4">
        <Text className="my-0 mb-2 text-[12px] font-bold uppercase tracking-[0.16em] text-red-700">
          And the claim? It happens for you.
        </Text>
        <Text className="my-0 text-[14px] leading-7 text-neutral-800">
          Here&apos;s the part you don&apos;t have to think about: your profile is already linked to
          your email behind the scenes. The moment you sign in —{" "}
          <strong>by Google or by Magic Link, it doesn&apos;t matter which</strong> — your profile
          claims itself automatically. There are no extra steps, no forms, nothing to fill out. Sign
          in, and it&apos;s yours.
        </Text>
      </Section>

      <Hr className="my-6 border-neutral-200" />

      <Text>
        Thank you, truly, for your support and your patience. We&apos;ve been working diligently to
        launch this the right way — safely, securely, and professionally — and having you be the
        first member to walk through the door means a great deal to me.
      </Text>

      <Text className="mt-6 text-[15px] text-neutral-700">
        With honor, respect, and gratitude —
        <br />
        <strong className="text-neutral-950">Brian</strong>
      </Text>

      <Text className="mt-4 text-center text-[15px] font-bold tracking-[0.2em] text-red-700">
        OSSS. 🙏🏻
      </Text>
    </BblEmailWrapper>
  )
}

EmailBblFirstTesterWelcome.PreviewProps = {
  to: "btruelson@gmail.com",
  recipientName: "Brian",
  claimUrl:
    "https://blackbeltlegacy.com/api/auth/magic-link/verify?token=preview&callbackURL=%2Fpreview",
} satisfies EmailProps

export default EmailBblFirstTesterWelcome
