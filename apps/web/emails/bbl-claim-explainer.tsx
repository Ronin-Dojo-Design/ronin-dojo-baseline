import "dotenv/config"

import { Hr, Link, Text } from "@react-email/components"
import {
  BblEmailButton,
  BblEmailHeading,
  BblEmailWrapper,
  type BblEmailWrapperProps,
} from "~/emails/components/bbl-wrapper"

const ADMIN_URL = "https://blackbeltlegacy.com/admin"

/**
 * Technical heads-up to Tony (SESSION_0419) so he's in the loop if Bob mentions the
 * claim links. Explains the Google-vs-magic-link claim gap, that it's fixed, that
 * Bob hasn't actually signed in yet (so he hasn't hit it), and that the claim
 * "happy path" was verified before any founder email went out. Internal/co-founder
 * tone — not a marketing send.
 */
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text className="mb-1 mt-0 text-[11px] font-bold uppercase tracking-[0.2em] text-red-700">
    {children}
  </Text>
)

export const EmailBblClaimExplainer = ({ to, ...props }: BblEmailWrapperProps) => {
  return (
    <BblEmailWrapper
      {...props}
      to={to}
      preview="A technical heads-up on the claim links — in case Bob asks"
    >
      <BblEmailHeading>A Quick Heads-Up</BblEmailHeading>

      <Text className="mt-0">Tony,</Text>
      <Text>
        A short technical rundown so you&apos;re in the loop — and can back me up if Bob mentions
        anything about signing in.
      </Text>

      <Eyebrow>The setup</Eyebrow>
      <Text className="mt-0">
        Each founder&apos;s email had two ways in — &ldquo;Continue with Google&rdquo; (recommended)
        and a magic link. The magic link carries a hidden pointer to your specific profile, so one
        click both signs you in <strong>and</strong> claims your profile in a single step.
      </Text>

      <Eyebrow>The wrinkle</Eyebrow>
      <Text className="mt-0">
        Google sign-in doesn&apos;t carry that pointer. So signing in with Google authenticated you
        correctly, but didn&apos;t run the claim — the profile could look unclaimed even though you
        were logged in. That was our wiring, not anyone&apos;s account.
      </Text>

      <Eyebrow>Two things worth knowing about Bob</Eyebrow>
      <Text className="mt-0">
        <strong>He hasn&apos;t actually signed in yet</strong> — not with Google, not with the magic
        link. I can see his link is still unused, and there&apos;s no account on file. So he
        hasn&apos;t hit any error at all; at most he&apos;s seen the screenshots.
      </Text>
      <Text>
        And the claim flow itself — the <strong>happy path</strong> — was tested and verified
        working <strong>before</strong> either of your emails ever went out. The only gap was the
        Google detour, and that&apos;s now closed.
      </Text>

      <Eyebrow>The fix (live now)</Eyebrow>
      <Text className="mt-0">
        The system now checks an email→profile binding on <strong>every</strong> sign-in — Google,
        magic link, or email — so any method claims automatically. Yours (tony-hua) is already
        claimed, and you&apos;ve got <strong>admin access</strong>:
      </Text>
      <BblEmailButton href={ADMIN_URL}>Open the Admin Panel →</BblEmailButton>
      <Text className="text-[13px] text-neutral-500">
        <Link href={ADMIN_URL} className="break-all text-red-700 underline">
          {ADMIN_URL}
        </Link>
      </Text>
      <Text>
        For Bob, I&apos;ve pre-wired <strong>both</strong> of his email addresses, so the moment he
        signs in any way, he&apos;s claimed — no new link needed.
      </Text>

      <Hr className="my-6 border-neutral-200" />

      <Text>
        Net: whatever Bob does — Google or the link, either of his emails — it just works now. If he
        hits a snag, it&apos;s almost certainly something else, and I&apos;m on it. Appreciate you
        having my back on this.
      </Text>
      <Text className="mt-4">— Brian</Text>
    </BblEmailWrapper>
  )
}

EmailBblClaimExplainer.PreviewProps = {
  to: "tony@example.com",
} satisfies BblEmailWrapperProps

export default EmailBblClaimExplainer
