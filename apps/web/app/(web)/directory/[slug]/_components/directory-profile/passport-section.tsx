import { H4 } from "~/components/common/heading"
import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"
import type { DirectoryProfile } from "./directory-profile-data"
import { ProfilePassportCard } from "./profile-sidebar"

/**
 * "Share your passport" — the MOBILE home of the passport credential (SESSION_0501 P0).
 * Below md the `ListingDetail` sidebar slot is `max-md:contents`, so the card used to slam
 * into the body flow unframed after the lineage timeline (the operator's "out of nowhere").
 * This frames it with the exact sibling-section rhythm (`Section` + `H4` + one-line muted
 * microcopy — see `about-section` / `ranks-section` / `ancestry-section`), with the existing
 * `QrShareButton` as the section CTA (same gate + props as the hero cluster's).
 *
 * `md:hidden` ↔ `ProfileSidebar`'s `max-md:hidden`: desktop keeps the card in the sticky
 * sidebar; exactly ONE render of the credential is visible per viewport.
 */
export function PassportSection({
  profile,
  profileUrl,
  ancestry,
}: {
  profile: DirectoryProfile
  profileUrl: string
  ancestry: LineageAncestryEntry[]
}) {
  return (
    <Section className="md:hidden">
      <Stack direction="column" size="xs">
        <H4>Share your passport</H4>
        <p className="text-muted-foreground text-sm">
          Your belt, school, and lineage on one shareable credential.
        </p>
      </Stack>

      <ProfilePassportCard profile={profile} ancestry={ancestry} />

      {profile.canRenderFullProfile && (
        <QrShareButton
          url={profileUrl}
          title="Profile QR Code"
          description="Scan to open this public directory profile."
          fileName={`directory-${profile.slug}`}
        />
      )}
    </Section>
  )
}
