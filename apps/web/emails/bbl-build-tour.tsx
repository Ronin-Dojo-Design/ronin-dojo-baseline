import "dotenv/config"

import { Hr, Link, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"
import { BBL_FOUNDER_EMAILS } from "~/lib/lineage/dirty-dozen"

/** Bob's two known inboxes, shown in the "intended for" footer (display-only). */
const FOUNDER_INTENDED_FOR = BBL_FOUNDER_EMAILS.join(" and ")

const NAVIGATOR_URL = "https://ronin-dojo-design.github.io/ronin-dojo-baseline/navigator.html"
const GRAPH_URL = "https://ronin-dojo-design.github.io/ronin-dojo-baseline/graph.html"
const LANDING_URL = "https://ronin-dojo-design.github.io/ronin-dojo-baseline/"

/**
 * "Explore the Build" — a transparency / wonder follow-up (SESSION_0419).
 *
 * Two interactive maps of the whole codebase, generated from the repo itself and
 * published live: a browsable docs navigator and an interactive knowledge graph.
 * Purely a window into the work — no asks, no account steps. variant "founder" =
 * Bob; variant "tony" = Tony (just a different greeting).
 */
type EmailProps = BblEmailWrapperProps & {
  variant?: "founder" | "tony"
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text className="mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">
    {children}
  </Text>
)

export const EmailBblBuildTour = ({
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
      preview="Explore the build — two live, interactive maps of everything under the hood"
    >
      <BblEmailHeading>Explore the Build</BblEmailHeading>

      <Text className="mt-0">{isTony ? "Tony," : "Mr. Bass,"}</Text>
      <Text>
        Black Belt Legacy isn&apos;t just the site you see — underneath it are thousands of
        decisions, documents, and connections. I made two interactive maps of the whole thing,
        generated from the code itself and published live, so you can wander through it yourself.
      </Text>

      <Eyebrow>The map of everything</Eyebrow>
      <BblEmailButton href={NAVIGATOR_URL}>Open the Docs Navigator →</BblEmailButton>
      <Text className="text-[13px] leading-6 text-neutral-600">
        A browsable index of every product doc, runbook, decision record, and build log.
        <br />
        <Link href={NAVIGATOR_URL} className="break-all text-red-700 underline">
          {NAVIGATOR_URL}
        </Link>
      </Text>

      <Eyebrow>How it all connects</Eyebrow>
      <BblEmailButton href={GRAPH_URL}>Open the Knowledge Graph →</BblEmailButton>
      <Text className="text-[13px] leading-6 text-neutral-600">
        An interactive graph of how the code, docs, and decisions all link together — click any node
        and follow the threads.
        <br />
        <Link href={GRAPH_URL} className="break-all text-red-700 underline">
          {GRAPH_URL}
        </Link>
      </Text>

      <Hr className="my-6 border-neutral-200" />

      <Text>
        It&apos;s all public — poke around, click anything, nothing to sign in for. This is the
        foundation your legacy is built on, laid out in the open.
      </Text>
      <Text className="text-[13px] text-neutral-500">
        Start here:{" "}
        <Link href={LANDING_URL} className="break-all text-red-700 underline">
          {LANDING_URL}
        </Link>
      </Text>

      <Text className="mt-6">— Brian</Text>
    </BblEmailWrapper>
  )
}

EmailBblBuildTour.PreviewProps = {
  to: "bob@example.com",
  variant: "founder",
} satisfies EmailProps

export default EmailBblBuildTour
