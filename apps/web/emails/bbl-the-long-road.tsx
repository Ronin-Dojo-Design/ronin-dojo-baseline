import "dotenv/config"

import { Column, Hr, Link, Row, Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"
import { BBL_FOUNDER_EMAILS } from "~/lib/lineage/dirty-dozen"

/** Bob's two known inboxes, shown in the "intended for" footer (display-only). */
const FOUNDER_INTENDED_FOR = BBL_FOUNDER_EMAILS.join(" and ")

/** A numbered login step — a big brand-red circle with a white number, beside its instruction. */
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

/**
 * The founder's email to Bob Bass (SESSION_0418).
 *
 * A founder-to-founder letter addressed to "Mr. Bass": a warm "we're finally
 * here" invite, the "Open the preview" private-link CTA, a two-method sign-in
 * guide (Google + Magic Link, each as red-circle numbered steps), and "The Long
 * Road" — Brian Scott's 8-year founder testament
 * (RoninDashboard/philosophy/THE_LONG_ROAD.md).
 *
 * The button + paste link are the founder's one-click claim magic link, which
 * routes through the preview hop and one-click claims his node. The comp tier is
 * set by the claim flow, not promised in the copy.
 *
 * Every block is fluid + word-wrapping so it reads perfectly on a narrow phone
 * (Galaxy / iPhone) with no horizontal scroll.
 */

type EmailProps = BblEmailWrapperProps & {
  /** The founder's one-click claim magic link (button + paste fallback). */
  claimUrl: string
}

/** Section eyebrow — uppercase, tracked, brand-red. */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">
    {children}
  </Text>
)

/** A pull-quote, set apart with a brand-red left rule. */
const PullQuote = ({ children }: { children: React.ReactNode }) => (
  <Section className="my-5 border-y-0 border-l-[3px] border-r-0 border-solid border-red-600 bg-neutral-50 px-4 py-3">
    <Text className="my-0 text-[15px] italic leading-7 text-neutral-700">{children}</Text>
  </Section>
)

const TIMELINE: Array<{ when: string; what: string }> = [
  {
    when: "2018–2020",
    what: "A rush of excitement, and making it work — late nights sewing black belts, pressing shirts, coding away, getting Version 1.0 up and running. Some bumps in the road, but we got our first members on the site and we were off to the races. Functional, if not yet perfect.",
  },
  {
    when: "2020–2021",
    what: "The Tennessee hiatus. H2 Marketing, then ManageVisors — honing the craft.",
  },
  {
    when: "2022–2024",
    what: "Return to Colorado. Back in your good graces. The WordPress iteration.",
  },
  { when: "Oct 2025", what: "The revelation: it was finally time to learn React." },
  { when: "Nov 2025", what: "Iteration #15 succeeds. The finish line comes into view." },
  { when: "Dec 2025", what: "The Black Belt Legacy app comes to life — but built on WordPress." },
  {
    when: "Jan–March 2026",
    what: "The final touches. Production-ready — but not yet Rigan Machado performance-worthy: not built for the scalability and security the numbers ahead demand. All the while, Black Belt Legacy keeps capturing emails, and beta testing with real users returns valuable insight and feedback.",
  },
  {
    when: "April–June 2026",
    what: "The last mile — security hardening for performance, stability, and longevity.",
  },
]

export const EmailBblTheLongRoad = ({
  claimUrl,
  intendedFor = FOUNDER_INTENDED_FOR,
  ...props
}: EmailProps) => {
  return (
    <BblEmailWrapper
      {...props}
      intendedFor={intendedFor}
      preview="A first look at Black Belt Legacy — and the long road that got us here"
    >
      <BblEmailHeading>A First Look at Black Belt Legacy</BblEmailHeading>

      <Text className="mt-0">Mr. Bass,</Text>

      <Text>
        We are finally here — the new Black Belt Legacy — your lineage under Rigan, your students,
        and the whole network in one place — and I&apos;d love your eyes on it. This link opens the
        full site for you. Any tweaks or edits, additions or removals you want are easy to do —
        quickly, professionally, and perfectly. The backend security and stability is airtight, and
        the frontend is beautifully rendered, ready for you.
      </Text>

      <Text>
        77 people from the original site and the email capture that&apos;s been up since January —
        plus the emails and interest we&apos;ve received from the seminars and the folks I&apos;ve
        been talking with on the phone, by email, and in person.
      </Text>

      <Text className="font-bold text-neutral-950">Let&apos;s get more now.</Text>

      <BblEmailButton href={claimUrl}>Open the preview</BblEmailButton>

      <Text className="text-[13px] text-neutral-500">
        Or paste this into your browser:
        <br />
        <Link href={claimUrl} className="break-all text-red-700 underline">
          {claimUrl}
        </Link>
      </Text>

      <Text>
        Take a look around — the lineage tree, your profile, and the sign-up flow. Opening it claims
        your profile and locks in your place at the head of the lineage.
      </Text>

      <Hr className="my-6 border-neutral-200" />

      {/* How to sign in — two methods, each as big red-circle numbered steps. */}
      <Eyebrow>Signing In — Two Easy Ways</Eyebrow>
      <Text className="mt-0">
        The link above signs you in automatically this first time. For every visit after, here are
        your two ways back in — I&apos;d start with Google.
      </Text>

      <Section className="my-4 overflow-hidden rounded-lg border border-solid border-neutral-200 bg-neutral-50 px-4 py-4">
        <Text className="my-0 mb-3 text-[12px] font-bold uppercase tracking-[0.16em] text-red-700">
          Option 1 — Google · Recommended for you
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
          it — Slack, Notion, Substack, Medium, and Vercel all sign you in this way. It&apos;s the
          secure, simple standard, and it&apos;s the safest login there is.
        </Text>
        <LoginStep n={1}>Enter your email on the sign-in screen.</LoginStep>
        <LoginStep n={2}>Open the email from Black Belt Legacy and tap its link.</LoginStep>
        <LoginStep n={3}>
          That&apos;s it — you&apos;re signed in. (Open it within a few days; the link is
          time-limited for your security.)
        </LoginStep>
      </Section>

      <Text className="mt-4 leading-7 text-neutral-700">
        And you&apos;re never doing any of this alone — I&apos;m here to walk you through every
        step, any time. I&apos;ll be calling you daily now, with progress and new signups.
      </Text>

      <Hr className="my-6 border-neutral-200" />

      {/* The Long Road — Brian's founder testament. */}
      <Eyebrow>A note from Brian — The Long Road</Eyebrow>

      <PullQuote>
        “This one is about reflection, gratitude, and documenting what was — and showing what will
        be.”
      </PullQuote>

      <Text>
        Eight years of struggle. Eight years of falling, failing, flailing, fighting. Eight years of
        getting knocked down, knocked around, and almost knocked out. Eight years of you calling,
        checking in — and me hiding, avoiding the calls, letting you down.
      </Text>
      <Text>
        Eight years of struggling with code — Google, Stack Overflow, course after course — building
        page after page, form after form, trying to build a directory worthy of a worldwide BJJ icon
        in Rigan Machado, and worthy of the man who dreamed up Black Belt Legacy in the first place:{" "}
        <strong>you</strong>.
      </Text>

      <Eyebrow>The Man Who Believed</Eyebrow>
      <Text>
        My teacher. My BJJ instructor and mentor. The one who gave me my most important Black Belt,
        earned over <strong>19 years</strong> on the mats with you. My childhood idol, now my friend
        and business partner, who gifted me the opportunity of a lifetime and — unknowingly, to both
        of us — burdened me with <strong>Glorious Purpose</strong>.
      </Text>
      <PullQuote>We now stand on the precipice of greatness.</PullQuote>

      <Eyebrow>Your Faith</Eyebrow>
      <Text>
        You stuck by me through all of it — the login complaints, the broken pages, the people who
        said they could do it better, helped for a moment, then quit under the weight. You heard,
        for years, that you should replace me with someone better.
      </Text>
      <Text className="font-bold text-neutral-950">And you stuck with me.</Text>
      <PullQuote>Diamonds are forged under pressure.</PullQuote>

      <Eyebrow>The Journey Back</Eyebrow>
      <Text>
        I grew. I learned. I fixed my marriage, focused on my family, cleared my mind, and built my
        base. Here is the road, in dates:
      </Text>

      <Section className="my-4 overflow-hidden rounded-lg border border-solid border-neutral-200">
        {TIMELINE.map((row, index) => (
          <Section
            key={row.when}
            className={`px-4 py-3 ${index % 2 === 0 ? "bg-neutral-50" : "bg-white"}`}
          >
            <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
              {row.when}
            </Text>
            <Text className="my-0 mt-1 text-[14px] leading-6 text-neutral-800">{row.what}</Text>
          </Section>
        ))}
      </Section>

      <Eyebrow>The Transformation</Eyebrow>
      <Text>
        From an eager part-time web developer — to the battle-hardened, React- and AI-fueled senior
        developer, designer, and architect that stands before you now. Humbled by defeat, honored
        with victories, and ready for the rewards of the long road it took to get here.
      </Text>

      <Hr className="my-6 border-neutral-200" />

      <Text className="my-1 font-bold text-neutral-950">Planned Passion Produces Purpose.</Text>
      <Text className="my-1 font-bold text-neutral-950">
        Design by Discipline. Disciplined by Design.
      </Text>
      <Text className="my-1 font-bold text-neutral-950">Developed with Determination.</Text>

      <Text className="mt-6 text-[15px] text-neutral-700">
        With honor, respect, and love —
        <br />
        <strong className="text-neutral-950">Brian</strong>
      </Text>

      <Text className="mt-4 text-center text-[15px] font-bold tracking-[0.2em] text-red-700">
        OSSS. 🙏🏻
      </Text>
    </BblEmailWrapper>
  )
}

EmailBblTheLongRoad.PreviewProps = {
  to: "ronindojodesign@gmail.com",
  claimUrl:
    "https://blackbeltlegacy.com/api/auth/magic-link/verify?token=preview&callbackURL=%2Fpreview",
} satisfies EmailProps

export default EmailBblTheLongRoad
