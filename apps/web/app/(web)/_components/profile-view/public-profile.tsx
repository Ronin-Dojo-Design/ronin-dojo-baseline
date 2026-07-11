import dynamic from "next/dynamic"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { ListingDetail } from "~/components/web/listing/listing-detail"
import { ProfileClaimTeaser } from "~/components/web/claims/profile-claim-teaser"
import { IntroDescription } from "~/components/web/ui/intro"
import { AboutSection } from "~/app/(web)/directory/[slug]/_components/directory-profile/about-section"
import { ProfileCoverBanner } from "~/app/(web)/directory/[slug]/_components/directory-profile/cover-banner"
import { profileInitial } from "~/app/(web)/directory/[slug]/_components/directory-profile/directory-profile-fields"
import { HeroActions } from "~/app/(web)/directory/[slug]/_components/directory-profile/hero-actions"
import { HeroBadges } from "~/app/(web)/directory/[slug]/_components/directory-profile/hero-badges"
import { PassportSection } from "~/app/(web)/directory/[slug]/_components/directory-profile/passport-section"
import { ProfileSidebar } from "~/app/(web)/directory/[slug]/_components/directory-profile/profile-sidebar"
import { RanksSection } from "~/app/(web)/directory/[slug]/_components/directory-profile/ranks-section"
import { VideoIntroSection } from "~/app/(web)/directory/[slug]/_components/directory-profile/video-section"
import type { PublicProfileView } from "~/server/web/directory/profile-view"

/**
 * `/directory/[slug]` arm of the ONE profile renderer — the public member/listing detail
 * (BBL_PARITY_SPEC). Behavior-identical to the retired `DirectoryProfile` orchestrator.
 *
 * Brand note (recipe directory gotcha): `/directory` is a multi-brand, NON-BBL-font-wrapped
 * surface, so there is intentionally NO `BrandTypography` wrapper — wrapping it would force BBL
 * Poppins onto TB/WEKAF. The BBL type seam still reaches here via the reused `BjjPassportCard`
 * credential, which carries the `var(--font-bbl-*, var(--font-…))` fallback idiom itself. Belt
 * colors stay data-driven (`Rank.colorHex` → `BeltSwatch`).
 *
 * Lazy boundaries: the below-the-fold body sections that ship client JS via `next/link` or
 * `motion/react` (Ancestry, Schools/Orgs, Social, Upgrade) are `next/dynamic`-split off the
 * initial bundle with SSR kept. About + Ranks stay eager.
 */

// SESSION_0525: the profile-highlight rails ship the client Embla carousel — same lazy boundary
// as the other client-JS sections (SSR kept, chunk split off the initial bundle). PUBLIC for every
// viewer (freemium); self-hides when the `profileMedia` DTO is empty (no curated member media).
const ProfileHighlightsSection = dynamic(() =>
  import("./profile-highlights-section").then(m => m.ProfileHighlightsSection),
)
const AncestrySection = dynamic(() =>
  import("~/app/(web)/directory/[slug]/_components/directory-profile/ancestry-section").then(
    m => m.AncestrySection,
  ),
)
const OrganizationsSection = dynamic(() =>
  import("~/app/(web)/directory/[slug]/_components/directory-profile/organizations-section").then(
    m => m.OrganizationsSection,
  ),
)
const SocialSection = dynamic(() =>
  import("~/app/(web)/directory/[slug]/_components/directory-profile/social-section").then(
    m => m.SocialSection,
  ),
)
const UpgradeSection = dynamic(() =>
  import("~/app/(web)/directory/[slug]/_components/directory-profile/upgrade-section").then(
    m => m.UpgradeSection,
  ),
)

export function PublicProfile({ view }: { view: PublicProfileView }) {
  const { profile, profileUrl, locationLine, viewerClaimState, claimFunnelHref, ancestry } = view
  const { user } = profile

  // Legacy placeholder (no real account) → show the claim teaser instead of an empty
  // profile. HIDDEN/private already 404'd in the loader; a tier-gated profile still
  // renders its listing preview below. The placeholder maps to UNCLAIMED / PENDING_MINE;
  // the teaser swaps its claim form for a "pending review" note when the viewer already
  // has an open claim (ADR 0036, SESSION_0440).
  if (profile.isClaimablePlaceholder) {
    return (
      <>
        <ProfileClaimTeaser
          subjectType="PERSON"
          subjectId={profile.id}
          claimState={viewerClaimState}
          claimFunnelHref={claimFunnelHref}
          name={user.name}
          avatarUrl={user.image}
          coverPhotoUrl={profile.coverPhotoUrl}
          subtitle={
            [profile.locationCity, profile.locationRegion].filter(Boolean).join(", ") || null
          }
          tags={user.ranks.map(rankAward => rankAward.name).filter(Boolean)}
        />
        {/* SESSION_0525: legend placeholders (bob-bass, david-meyer, chris-haueter…) still showcase
            their curated PUBLIC Highlights — Featured Matches, Podcasts, technique reels — alongside
            the claim teaser. Curated public media, safe on an unclaimed profile; self-hides empty. */}
        <div className="mx-auto w-full min-w-0 max-w-2xl px-4 pb-8 sm:px-6">
          <ProfileHighlightsSection media={view.profileMedia} />
        </div>
      </>
    )
  }

  return (
    <>
      <ProfileCoverBanner coverPhotoUrl={profile.coverPhotoUrl} />
      <ListingDetail
        media={
          <Avatar className="size-12">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? "Directory profile"} />}
            <AvatarFallback>{profileInitial(user.name)}</AvatarFallback>
          </Avatar>
        }
        title={user.name ?? "Directory Profile"}
        badges={<HeroBadges profile={profile} />}
        actions={
          <HeroActions profile={profile} profileUrl={profileUrl} claimState={viewerClaimState} />
        }
        intro={locationLine && <IntroDescription>{locationLine}</IntroDescription>}
        sidebar={<ProfileSidebar profile={profile} ancestry={ancestry} />}
      >
        <AboutSection profile={profile} />
        <VideoIntroSection videoIntroUrl={profile.videoIntroUrl} />
        {/* SESSION_0525: PUBLIC matches/podcasts/technique-reel rails; premium reels lock per-viewer
            (empty → self-hides). */}
        <ProfileHighlightsSection media={view.profileMedia} />
        <RanksSection profile={profile} />
        <AncestrySection ancestry={ancestry} />
        <OrganizationsSection profile={profile} />
        <SocialSection profile={profile} />
        {/* Mobile-only labeled home of the passport credential (SESSION_0501 P0);
            desktop keeps it in the sidebar slot above. */}
        <PassportSection profile={profile} profileUrl={profileUrl} ancestry={ancestry} />
        {!profile.canRenderFullProfile && <UpgradeSection />}
      </ListingDetail>
    </>
  )
}
