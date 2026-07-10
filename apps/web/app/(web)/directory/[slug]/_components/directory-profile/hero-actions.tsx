import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * Hero actions cluster: persisted Save (any rendered profile — the subject is the
 * Passport, the identity SoT) + QrShare, which stays gated to a fully-rendered profile.
 *
 * When the viewer owns this Passport (`CLAIMED_MINE`, ADR 0036 / SESSION_0440), a
 * "This profile is yours" manage link leads to `/app/profile` — the canonical authenticated
 * member workspace (SESSION_0522 step 5, `/me` retired) — the claimed-by-me arm of the shared
 * claim-state machine (no Claim CTA on a profile you already own). It routes to the workspace
 * (not into this public page) so the public read and the owner write surface stay separate.
 */
export function HeroActions({
  profile,
  profileUrl,
  claimState,
}: {
  profile: DirectoryProfile
  profileUrl: string
  claimState?: ClaimViewerState
}) {
  return (
    <Stack size="sm">
      {claimState === "CLAIMED_MINE" && (
        <Button variant="secondary" size="md" render={<Link href="/app/profile" />}>
          This profile is yours →
        </Button>
      )}
      {/* Labeled (not icon-only) — parity with the labeled QR button beside it; the
          cluster is full-width on mobile (SESSION_0501 P1). */}
      <ListingSaveButton subjectType="PERSON" subjectId={profile.passportId} size="md" />
      {profile.canRenderFullProfile && (
        <QrShareButton
          url={profileUrl}
          title="Profile QR Code"
          description="Scan to open this public directory profile."
          fileName={`directory-${profile.slug}`}
        />
      )}
    </Stack>
  )
}
