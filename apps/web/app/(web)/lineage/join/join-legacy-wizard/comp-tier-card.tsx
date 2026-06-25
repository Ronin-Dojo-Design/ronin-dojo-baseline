import { CheckIcon, CrownIcon, LockKeyholeIcon } from "lucide-react"
import { StepShell } from "./step-shell"

/**
 * The locked "complimentary Elite" card shown on the Path step for a granted-comp
 * claim (SESSION_0445 #1). Replaces the Free/Premium/Elite picker when someone
 * arrives via a "Claim this profile" link (`?node=`): the claimant gets comp Elite
 * at claim-finalize (lifetime for Dirty Dozen, else a complimentary first year), so
 * a tier choice is confusing — and picking Elite would route them to Stripe. The
 * wizard keeps `membershipPath` at its FREE default under the hood, so the server
 * routes them to the claim magic link, never checkout.
 */
export function CompTierCard({
  active,
  compIsLifetime,
  claimProfileName,
}: {
  active: boolean
  compIsLifetime: boolean
  claimProfileName?: string
}) {
  return (
    <StepShell
      active={active}
      icon={CrownIcon}
      eyebrow="Step 1"
      title="Your complimentary membership"
      description={
        claimProfileName
          ? `You're claiming ${claimProfileName}'s profile — your Black Belt Legacy Elite membership is on us.`
          : "Your Black Belt Legacy Elite membership is on us — no payment needed."
      }
    >
      <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-500">
            <CrownIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-red-500">
              Complimentary membership
            </span>
            <p className="mt-1 font-bold">
              Black Belt Legacy Elite — {compIsLifetime ? "for life" : "first year on us"}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Your Elite membership is complimentary
              {compIsLifetime ? ", for life" : " for your first year"} — no payment needed. Just
              confirm your profile and lineage on the next steps.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-background px-3 py-1 text-xs font-semibold text-red-500">
              <LockKeyholeIcon className="size-3.5" aria-hidden="true" /> Elite — locked in
            </span>
          </div>
        </div>
        <ul className="mt-4 grid gap-2 text-xs text-muted-foreground">
          {[
            "Full Elite profile & lineage features",
            compIsLifetime ? "Yours for life — never billed" : "Complimentary first year",
            "Priority steward review",
          ].map(bullet => (
            <li key={bullet} className="flex items-center gap-2">
              <CheckIcon className="size-3.5 shrink-0 text-red-500" aria-hidden="true" />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </StepShell>
  )
}
