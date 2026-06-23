import { Card } from "~/components/common/card"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { ProfileClaimForm } from "~/components/web/claims/profile-claim-form"
import { ProfileHero } from "~/components/web/profile/profile-hero"
import { initialsOf } from "~/lib/directory/facet-result"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"

/**
 * Public "mock profile" claim teaser (SESSION_0354).
 *
 * Shown for a legacy placeholder DirectoryProfile (or an owner-less org) instead
 * of a 404 / empty profile: a hero preview of what the real profile will look
 * like + skeleton sections + a "claim it" CTA. Facebook-group-creation-style
 * excitement. Renders ONLY already-public display values passed in by the
 * caller — no data fetch, so it can never leak a private profile.
 */

function SkeletonLine({ className }: { className?: string }) {
  return <div className={`h-3 rounded bg-muted ${className ?? "w-full"}`} aria-hidden="true" />
}

export function ProfileClaimTeaser({
  subjectType,
  subjectId,
  claimState,
  name,
  avatarUrl,
  coverPhotoUrl,
  subtitle,
  tags = [],
}: {
  subjectType: "PERSON" | "ORGANIZATION"
  subjectId: string
  /**
   * The viewer's claim state for a PERSON subject (ADR 0036, SESSION_0440). Only
   * `PENDING_MINE` changes the teaser — it swaps the claim form for a "pending review"
   * note. Org subjects (a different claim system) leave this undefined.
   */
  claimState?: ClaimViewerState
  name: string | null
  avatarUrl?: string | null
  coverPhotoUrl?: string | null
  subtitle?: string | null
  tags?: string[]
}) {
  const label =
    name?.trim() || (subjectType === "ORGANIZATION" ? "this organization" : "this profile")
  const hasPendingClaim = claimState === "PENDING_MINE"

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-6 px-4 py-6 sm:px-6">
      <ProfileHero
        name={name}
        subtitle={subtitle}
        avatarUrl={avatarUrl}
        coverPhotoUrl={coverPhotoUrl}
        initials={initialsOf(name)}
        tags={tags}
        badges={[
          hasPendingClaim
            ? { label: "Claim pending", variant: "soft" }
            : { label: "Unclaimed", variant: "soft" },
        ]}
      />

      <Note>
        {hasPendingClaim ? (
          <>
            Your claim on this {subjectType === "ORGANIZATION" ? "organization" : "profile"} is in
            review. We’ll email you once it’s approved — then bio, photos, schools, schedule, and
            rank history all unlock.
          </>
        ) : (
          <>
            This {subjectType === "ORGANIZATION" ? "organization" : "profile"} hasn’t been claimed
            yet. Claim it to fill out the rest — bio, photos, schools, schedule, and rank history
            all unlock once it’s yours.
          </>
        )}
      </Note>

      {/* Skeleton "above the fold" preview of the real profile sections. */}
      <Card className="p-4" aria-label="Profile preview">
        <p className="mb-3 font-medium text-base text-muted-foreground">
          A preview of your future profile
        </p>
        <Stack direction="column" size="sm">
          <SkeletonLine className="w-3/4" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="h-16 rounded-md bg-muted" aria-hidden="true" />
            <div className="h-16 rounded-md bg-muted" aria-hidden="true" />
            <div className="h-16 rounded-md bg-muted" aria-hidden="true" />
          </div>
        </Stack>
      </Card>

      <Card className="p-4">
        {hasPendingClaim ? (
          <>
            <p className="mb-1 font-medium text-base">Claim pending review</p>
            <p className="text-muted-foreground text-sm">
              You already have an open claim on {label}. An admin will review it shortly — there’s
              nothing more to do right now.
            </p>
          </>
        ) : (
          <>
            <p className="mb-3 font-medium text-base">Claim {label}</p>
            <ProfileClaimForm
              subjectType={subjectType}
              subjectId={subjectId}
              subjectLabel={label}
            />
          </>
        )}
      </Card>
    </div>
  )
}
