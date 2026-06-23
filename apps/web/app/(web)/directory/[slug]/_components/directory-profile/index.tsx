import dynamic from "next/dynamic"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { ListingDetail } from "~/components/web/listing/listing-detail"
import { ProfileClaimTeaser } from "~/components/web/claims/profile-claim-teaser"
import { IntroDescription } from "~/components/web/ui/intro"
import { AboutSection } from "./about-section"
import { ProfileCoverBanner } from "./cover-banner"
import type { DirectoryProfileView } from "./directory-profile-data"
import { profileInitial } from "./directory-profile-fields"
import { HeroActions } from "./hero-actions"
import { HeroBadges } from "./hero-badges"
import { ProfileSidebar } from "./profile-sidebar"
import { RanksSection } from "./ranks-section"
import { VideoIntroSection } from "./video-section"

/**
 * `/directory/[slug]` — the public member/listing detail (BBL_PARITY_SPEC).
 *
 * Thin orchestrator (the colocated folder module's public barrel): it wires the reused
 * `ListingDetail` chrome to the extracted hero / sidebar / body parts, owning no section
 * presentation itself. The `loadDirectoryProfile` server loader does all the fetching +
 * derivation (`directory-profile-data.ts`).
 *
 * Brand note (recipe directory gotcha): `/directory` is a multi-brand, NON-BBL-font-wrapped
 * surface, so there is intentionally NO `BrandTypography` wrapper — wrapping it would force
 * BBL Poppins onto TB/WEKAF. The BBL type seam still reaches here where it belongs, via the
 * reused `BjjPassportCard` credential, which carries the `var(--font-bbl-*, var(--font-…))`
 * fallback idiom itself. Belt colors stay data-driven (`Rank.colorHex` → `BeltSwatch`).
 *
 * Lazy boundaries: the below-the-fold body sections that ship client JS via `next/link`
 * (Schools/Orgs, Social, Upgrade) are `next/dynamic`-split off the initial bundle with SSR
 * kept (no `ssr: false` — illegal in a Server Component anyway). About + Ranks stay eager.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */

const OrganizationsSection = dynamic(() =>
  import("./organizations-section").then(m => m.OrganizationsSection),
)
const SocialSection = dynamic(() => import("./social-section").then(m => m.SocialSection))
const UpgradeSection = dynamic(() => import("./upgrade-section").then(m => m.UpgradeSection))

export function DirectoryProfile({
  profile,
  profileUrl,
  locationLine,
  viewerClaimState,
  claimFunnelHref,
}: DirectoryProfileView) {
  const { user } = profile

  // Legacy placeholder (no real account) → show the claim teaser instead of an empty
  // profile. HIDDEN/private already 404'd in the loader; a tier-gated profile still
  // renders its listing preview below. The placeholder maps to UNCLAIMED / PENDING_MINE;
  // the teaser swaps its claim form for a "pending review" note when the viewer already
  // has an open claim (ADR 0036, SESSION_0440).
  if (profile.isClaimablePlaceholder) {
    return (
      <ProfileClaimTeaser
        subjectType="PERSON"
        subjectId={profile.id}
        claimState={viewerClaimState}
        claimFunnelHref={claimFunnelHref}
        name={user.name}
        avatarUrl={user.image}
        coverPhotoUrl={profile.coverPhotoUrl}
        subtitle={[profile.locationCity, profile.locationRegion].filter(Boolean).join(", ") || null}
        tags={user.ranks.map(rankAward => rankAward.name).filter(Boolean)}
      />
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
        sidebar={<ProfileSidebar profile={profile} />}
      >
        <AboutSection profile={profile} />
        <VideoIntroSection videoIntroUrl={profile.videoIntroUrl} />
        <RanksSection profile={profile} />
        <OrganizationsSection profile={profile} />
        <SocialSection profile={profile} />
        {!profile.canRenderFullProfile && <UpgradeSection />}
      </ListingDetail>
    </>
  )
}
