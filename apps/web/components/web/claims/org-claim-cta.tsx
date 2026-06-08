import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { ProfileClaimForm } from "~/components/web/claims/profile-claim-form"

/**
 * "Claim this organization" CTA for an owner-less Organization (SESSION_0355).
 *
 * Surfaces the generic profile-claim flow (SESSION_0354) on the public org /
 * school detail pages so an owner-less org gets a discovery → claim funnel
 * (the follow-up the 0354 close flagged). Render only when
 * `Organization.ownerId` is null.
 *
 * Auth follows the lineage-claim SOP (§5 "sign in if needed"): logged-out
 * visitors get a sign-in CTA that returns to this page; the submit action still
 * enforces auth, the owner-less precondition, brand scope, and a per-claimant
 * dedup guard server-side.
 */
export function OrgClaimCta({
  organizationId,
  organizationName,
  returnPath,
  isSignedIn,
  noun = "organization",
}: {
  organizationId: string
  organizationName: string
  /** Where to return after sign-in (e.g. `/schools/[slug]`). */
  returnPath: string
  isSignedIn: boolean
  noun?: "organization" | "school"
}) {
  return (
    <Card className="border-primary/30 bg-primary/5 p-4">
      <Stack direction="column" size="sm">
        <p className="font-medium text-base">Claim {organizationName}</p>
        <Note className="text-sm">
          This {noun} hasn’t been claimed yet. Claim it to manage its profile — members, schedule,
          schools, and rank history all unlock once it’s yours. An admin reviews every claim.
        </Note>
        {isSignedIn ? (
          <ProfileClaimForm
            subjectType="ORGANIZATION"
            subjectId={organizationId}
            subjectLabel={organizationName}
          />
        ) : (
          <Button render={<Link href={`/auth/login?next=${returnPath}`} />} className="self-start">
            Sign in to claim
          </Button>
        )}
      </Stack>
    </Card>
  )
}
