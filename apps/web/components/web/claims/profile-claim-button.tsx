"use client"

import { ClockIcon, UserRoundPlusIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { ProfileClaimForm } from "~/components/web/claims/profile-claim-form"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"

/**
 * "Claim this profile" CTA (SESSION_0525) — the hero-actions claim affordance on an UNCLAIMED
 * placeholder profile, which now renders the FULL profile (hero/about/ranks/ancestry/highlights)
 * with just this button instead of the page-replacing `ProfileClaimTeaser` (deleted).
 *
 * Reuse note (Doug review): the Dirstarter `ToolClaimDialog` is an email-OTP flow bound to a
 * `ToolOne` (`websiteUrl` domain check, `sendToolClaimOtp`/`verifyToolClaimOtp`, tool-slug
 * redirect) — too tool-coupled to adapt for a PERSON claim. So this reuses the standard `Button` +
 * `Dialog` primitives and wires the submit to the EXISTING person/org claim flow: the
 * account-optional `/lineage/join` funnel when one is threaded (`claimFunnelHref`, no sign-in
 * wall), else the inline `ProfileClaimForm` (`submitProfileClaimRequest`). The two claim systems
 * (tool email-OTP vs person `PassportClaimRequest`) stay separate — unifying them is a follow-up
 * decision, flagged in the session report.
 *
 * Viewer states mirror the retired teaser via `claimState`: `PENDING_MINE` → a disabled
 * "Claim pending review" button (no dialog); otherwise the actionable "Claim this profile" CTA.
 */
export function ProfileClaimButton({
  subjectType,
  subjectId,
  subjectLabel,
  claimState,
  claimFunnelHref,
}: {
  subjectType: "PERSON" | "ORGANIZATION"
  subjectId: string
  subjectLabel: string
  claimState?: ClaimViewerState
  claimFunnelHref?: string | null
}) {
  const [open, setOpen] = useState(false)

  // The viewer already has an open claim → non-actionable "pending review" state (teaser parity).
  if (claimState === "PENDING_MINE") {
    return (
      <Button variant="secondary" size="md" prefix={<ClockIcon />} disabled>
        Claim pending review
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="primary"
        size="md"
        prefix={<UserRoundPlusIcon />}
        onClick={() => setOpen(true)}
      >
        Claim this profile
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Claim {subjectLabel}</DialogTitle>
            <DialogDescription>
              Claim it to fill out the rest — bio, photos, schools, schedule, and rank history all
              unlock once it’s yours. An admin reviews every claim before any profile is handed
              over.
            </DialogDescription>
          </DialogHeader>

          {claimFunnelHref ? (
            <Stack direction="column" size="sm">
              <Note>
                No account needed to start — enter your email and we’ll send a one-click link to
                finish claiming.
              </Note>
              <Button
                variant="primary"
                size="md"
                prefix={<UserRoundPlusIcon />}
                render={<Link href={claimFunnelHref} />}
              >
                Claim {subjectLabel}
              </Button>
            </Stack>
          ) : (
            <ProfileClaimForm
              subjectType={subjectType}
              subjectId={subjectId}
              subjectLabel={subjectLabel}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
