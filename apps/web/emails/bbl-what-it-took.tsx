import "dotenv/config"

import { Hr, Link, Section, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"
import { BBL_FOUNDER_EMAILS } from "~/lib/lineage/dirty-dozen"

/** Bob's two known inboxes, shown in the "intended for" footer (display-only). */
const FOUNDER_INTENDED_FOR = BBL_FOUNDER_EMAILS.join(" and ")

const MONOREPO_URL = "https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo"
const APP_REPO_URL = "https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline"

/**
 * "What It Took" — the by-the-numbers follow-up to The Long Road (SESSION_0418).
 *
 * A short, factual, emotional accounting of the build: commit counts across the
 * monorepo + this repo, hours at the keyboard, and the 56-day no-days-off final
 * stretch — with public GitHub links so Bob (and Tony) can see it for themselves.
 *
 * variant "founder" = Bob's letter. variant "tony" = the same letter shown to
 * Tony verbatim, prefaced by a short "this is what I just sent Bob" note.
 */
type EmailProps = BblEmailWrapperProps & {
  variant?: "founder" | "tony"
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">
    {children}
  </Text>
)

const STATS: Array<{ label: string; value: string; sub: string }> = [
  {
    label: "The monorepo",
    value: "1,610 commits",
    sub: "Dec 20, 2025 → May 6, 2026 · 114 days at the keyboard",
  },
  {
    label: "This repo (live now)",
    value: "822 commits",
    sub: "Apr 25 → Jun 19, 2026 · 56 days — every single one",
  },
  {
    label: "End to end",
    value: "2,432 commits",
    sub: "from the first line to the one that launched",
  },
  {
    label: "At the keyboard",
    value: "~1,400 hours",
    sub: "and that's the floor — commits don't count the nights learning React",
  },
]

export const EmailBblWhatItTook = ({
  variant = "founder",
  intendedFor,
  to,
  ...props
}: EmailProps) => {
  const isTony = variant === "tony"
  return (
    <BblEmailWrapper
      {...props}
      to={to}
      intendedFor={intendedFor ?? (isTony ? to : FOUNDER_INTENDED_FOR)}
      preview="What it took — by the numbers, with the receipts"
    >
      <BblEmailHeading>What It Took</BblEmailHeading>

      {isTony && (
        <>
          <Text className="mt-0">Tony,</Text>
          <Text>
            Black Belt Legacy is live. Below — word for word — is the note I just sent Bob: the
            build, counted, with public links to both codebases so you can see it for yourself.
            I&apos;m at the computer the rest of the night if anything looks off.
          </Text>
          <Hr className="my-6 border-neutral-200" />
          <Text className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">
            The note I sent Bob
          </Text>
        </>
      )}

      <Text className="mt-0">Mr. Bass,</Text>
      <Text>You asked what it took. So I counted it.</Text>

      <Section className="my-4 overflow-hidden rounded-lg border border-solid border-neutral-200">
        {STATS.map((row, index) => (
          <Section
            key={row.label}
            className={`px-4 py-3 ${index % 2 === 0 ? "bg-neutral-50" : "bg-white"}`}
          >
            <Text className="my-0 text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
              {row.label}
            </Text>
            <Text className="my-0 mt-1 text-[18px] font-extrabold text-neutral-950">
              {row.value}
            </Text>
            <Text className="my-0 mt-1 text-[13px] leading-6 text-neutral-600">{row.sub}</Text>
          </Section>
        ))}
      </Section>

      <Text className="font-bold text-neutral-950">Fifty-six days. Not one off.</Text>
      <Text>
        I went back and checked every day of this final stretch — there&apos;s a commit on every
        single one. And the hours are a floor: they don&apos;t count the reading, the debugging, the
        dead ends, or the nights teaching myself React. The real number is higher — and you of all
        people know it, because you were on the other end of the calls I couldn&apos;t answer.
      </Text>

      <Eyebrow>See it for yourself — both are public now</Eyebrow>
      <BblEmailButton href={APP_REPO_URL}>This repo — what&apos;s live now</BblEmailButton>
      <Text className="text-[13px] text-neutral-500">
        <Link href={APP_REPO_URL} className="break-all text-red-700 underline">
          {APP_REPO_URL}
        </Link>
      </Text>
      <Text className="mt-3 text-[13px] text-neutral-500">
        The monorepo — where it began:
        <br />
        <Link href={MONOREPO_URL} className="break-all text-red-700 underline">
          {MONOREPO_URL}
        </Link>
      </Text>

      <Hr className="my-6 border-neutral-200" />

      <Text>
        From the WordPress years, to the monorepo, to the app in your hand: I didn&apos;t take the
        days off. Not because I couldn&apos;t — because this one was <strong>yours</strong>, and it
        had to be right.
      </Text>

      <Text className="my-1 font-bold text-neutral-950">Planned Passion Produces Purpose.</Text>
      <Text className="mt-3">We&apos;re here.</Text>

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

EmailBblWhatItTook.PreviewProps = {
  to: "ronindojodesign@gmail.com",
} satisfies EmailProps

export default EmailBblWhatItTook
