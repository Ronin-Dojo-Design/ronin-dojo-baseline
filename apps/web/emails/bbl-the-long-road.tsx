import "dotenv/config"

import { Hr, Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

/**
 * "The Long Road" — the founder's testament (SESSION_0418).
 *
 * Brian Scott's 8-year reflection (RoninDashboard/philosophy/THE_LONG_ROAD.md),
 * rendered as a cinematic, mobile-first BBL letter. Sent to the founder, Bob
 * Bass, on the eve of / on the moment of his profile claim — "founder to
 * founder." Every block is fluid + generously spaced so it reads beautifully on
 * a narrow phone (Galaxy / iPhone) and scales up cleanly to desktop.
 *
 * The copy is faithful to the source document, trimmed only where email length
 * demanded; the structure, the dates, and the voice are preserved.
 */

type EmailProps = BblEmailWrapperProps & {
  /** Greeting name — defaults to Bob (the founder this letter honors). */
  firstName?: string | null
  /** Optional claim CTA — when present, the letter doubles as the founder's claim link. */
  claimUrl?: string | null
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
  { when: "2020–2021", what: "The Tennessee hiatus. H2 Marketing, then ManageVisors — honing the craft." },
  { when: "2022–2024", what: "Return to Colorado. Back in Bob's good graces. The WordPress iteration." },
  { when: "Oct 2025", what: "The revelation: it was finally time to learn React." },
  { when: "Nov 2025", what: "Iteration #15 succeeds. The finish line comes into view." },
  { when: "Dec 2025", what: "“The Crazy Week” — all three sites carried to staging." },
  { when: "Jan 2026", what: "The final touches. Production-ready. Black Belt Legacy launches first." },
]

export const EmailBblTheLongRoad = ({ firstName, claimUrl, ...props }: EmailProps) => {
  const greetingName = firstName?.trim() || "Bob"

  return (
    <BblEmailWrapper
      {...props}
      preview="The Long Road — a founder's reflection, on the eve of the launch"
    >
      <Eyebrow>A Warrior&apos;s Reflection</Eyebrow>
      <BblEmailHeading>The Long Road</BblEmailHeading>

      <Text className="mb-1 mt-0 text-[13px] uppercase tracking-[0.14em] text-neutral-500">
        From Brian Scott — Founder &amp; CEO, Ronin Dojo Design
      </Text>
      <Text className="mb-5 mt-0 text-[13px] text-neutral-500">
        On the eve of the Black Belt Legacy production launch.
      </Text>

      <Hr className="my-5 border-neutral-200" />

      <Text className="mt-0">{greetingName},</Text>

      <PullQuote>
        “This one is about reflection, gratitude, and documenting what was — and showing what will
        be.”
      </PullQuote>

      {/* The Testament */}
      <Eyebrow>The Testament — 8 Years</Eyebrow>
      <Text>
        Eight years of struggle. Eight years of falling, failing, flailing, fighting. Eight years of
        getting knocked down, knocked around, and almost knocked out. Eight years of you calling,
        checking in — and me hiding, avoiding the calls, letting you down.
      </Text>
      <Text>
        Eight years of struggling with code — Google, Stack Overflow, course after course — gaining
        knowledge and failing with it, building page after page, form after form, trying to convey
        how complex it is to build a directory worthy of a worldwide BJJ icon in Rigan Machado, and
        worthy of the man who dreamed up Black Belt Legacy in the first place: <strong>you</strong>.
      </Text>

      {/* Bob — The Man Who Believed */}
      <Eyebrow>The Man Who Believed</Eyebrow>
      <Text>
        My teacher. My BJJ instructor and mentor. The one who taught me so much — not just in Jiu
        Jitsu, but in life. The one who gave me my most important Black Belt, earned over{" "}
        <strong>19 years</strong> on the mats with you.
      </Text>
      <Text>
        My childhood idol, now my friend and business partner, who gifted me the opportunity of a
        lifetime and — unknowingly, to both of us — burdened me with{" "}
        <strong>Glorious Purpose</strong>.
      </Text>
      <PullQuote>We now stand on the precipice of greatness.</PullQuote>

      {/* The Cost */}
      <Eyebrow>The Cost</Eyebrow>
      <Text>
        Sleepless nights. Worry and anxiety. Imposter-syndrome panic. But also: growth in code,
        design, and development that would never have happened without the pressure of this purpose.
      </Text>
      <PullQuote>Diamonds are forged under pressure.</PullQuote>
      <Text>
        It is time to deliver to you, to Rigan, and to the world the BJJ version of the Hope Diamond.
        Finally.
      </Text>

      {/* Bob's Faith */}
      <Eyebrow>Your Faith</Eyebrow>
      <Text>
        You stuck by me through all of it — the login complaints, the broken pages, the people who
        said they could do it better, helped for a moment, then quit under the weight. You heard, for
        years, that you should replace me with “someone better.”
      </Text>
      <Text className="font-bold text-neutral-950">And you stuck with me.</Text>

      {/* The Journey Back + Timeline */}
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

      {/* The Transformation */}
      <Eyebrow>The Transformation</Eyebrow>
      <Text>
        From an eager part-time web developer at the junior level — to the battle-hardened, React- and
        AI-fueled senior developer, designer, and architect that stands before you now. Humbled by
        defeat, honored with victories, and ready for the rewards of the long road it took to get
        here.
      </Text>

      {claimUrl ? (
        <>
          <Text className="mb-1">
            Your place at the head of the lineage is waiting. One click claims your profile — Elite,
            on us, for life.
          </Text>
          <BblEmailButton href={claimUrl}>Claim your profile</BblEmailButton>
          <Text className="text-[13px] text-neutral-500">
            If the button doesn&apos;t work, paste this link into your browser:
            <br />
            <span className="break-all text-neutral-700">{claimUrl}</span>
          </Text>
        </>
      ) : null}

      <Hr className="my-6 border-neutral-200" />

      {/* The Declaration */}
      <Eyebrow>The Declaration</Eyebrow>
      <Text className="my-1 font-bold text-neutral-950">Planned Passion Produces Purpose.</Text>
      <Text className="my-1 font-bold text-neutral-950">Design by Discipline.</Text>
      <Text className="my-1 font-bold text-neutral-950">Disciplined by Design.</Text>
      <Text className="my-1 font-bold text-neutral-950">Developed with Determination.</Text>
      <Text className="mt-3">This is the way of the Ronin. Master yourself.</Text>

      <Text className="mt-6 text-[15px] text-neutral-700">
        With honor, respect, and love —
        <br />
        <strong className="text-neutral-950">Brian Scott</strong>
      </Text>

      <Text className="mt-4 text-center text-[13px] italic text-neutral-500">
        “Every black belt was once a white belt who refused to quit.”
      </Text>
      <Text className="mt-2 text-center text-[15px] font-bold tracking-[0.2em] text-red-700">
        OSSS. 🙏🏻
      </Text>
    </BblEmailWrapper>
  )
}

EmailBblTheLongRoad.PreviewProps = {
  to: "bob@example.com",
  firstName: "Bob",
  claimUrl: "https://blackbeltlegacy.com/api/auth/magic-link/verify?token=preview",
} satisfies EmailProps

export default EmailBblTheLongRoad
