import "dotenv/config"

import { Hr, Link, Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

/**
 * The founder's email to Bob Bass (SESSION_0418).
 *
 * Matches the existing "A First Look at Black Belt Legacy" preview-invite voice
 * exactly — greeting, the private-link framing, the "Open the preview" button,
 * and the "Or paste this into your browser" fallback (no "if the button doesn't
 * work" wording, no hand-holding filler) — and folds in "The Long Road": Brian
 * Scott's 8-year founder testament (RoninDashboard/philosophy/THE_LONG_ROAD.md).
 *
 * The button + paste link are the founder's one-click claim magic link, which
 * routes through the preview hop and finalizes his claim (Elite, for life).
 *
 * Every block is fluid + word-wrapping so it reads perfectly on a narrow phone
 * (Galaxy / iPhone) with no horizontal scroll.
 */

type EmailProps = BblEmailWrapperProps & {
  /** Greeting name — defaults to Bob (the founder this letter honors). */
  firstName?: string | null
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
  { when: "2018", what: "Black Belt Legacy begins — the glorious purpose, taken on eagerly." },
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
  { when: "Dec 2025", what: "The crazy week — all three sites carried to staging." },
  {
    when: "Jan 2026",
    what: "The final touches. Production-ready. Black Belt Legacy launches first.",
  },
]

export const EmailBblTheLongRoad = ({ firstName, claimUrl, ...props }: EmailProps) => {
  const greetingName = firstName?.trim() || "Bob"

  return (
    <BblEmailWrapper
      {...props}
      preview="A first look at Black Belt Legacy — and the long road that got us here"
    >
      <BblEmailHeading>A First Look at Black Belt Legacy</BblEmailHeading>

      <Text className="mt-0">Hi {greetingName},</Text>

      <Text>
        We&apos;ve been building the new Black Belt Legacy — your lineage under Rigan, your
        students, and the whole network in one place — and we&apos;d love your eyes on it before it
        goes public.
      </Text>

      <Text>
        This private link opens the full site for you. Everyone else still sees a countdown page
        until we launch, so this is just for you:
      </Text>

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
        your profile and locks in your place at the head of the lineage: Elite, on us, for life.
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
      <Text className="mt-3">This is the way of the Ronin. Master yourself.</Text>

      <Text className="mt-6 text-[15px] text-neutral-700">
        With honor, respect, and love —
        <br />
        <strong className="text-neutral-950">Brian</strong>
        <br />
        <span className="text-[13px] text-neutral-500">and The Black Belt Legacy team</span>
      </Text>

      <Text className="mt-4 text-center text-[15px] font-bold tracking-[0.2em] text-red-700">
        OSSS. 🙏🏻
      </Text>
    </BblEmailWrapper>
  )
}

EmailBblTheLongRoad.PreviewProps = {
  to: "ronindojodesign@gmail.com",
  firstName: "Bob",
  claimUrl:
    "https://blackbeltlegacy.com/api/auth/magic-link/verify?token=preview&callbackURL=%2Fpreview",
} satisfies EmailProps

export default EmailBblTheLongRoad
