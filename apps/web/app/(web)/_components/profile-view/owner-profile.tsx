import dynamic from "next/dynamic"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { ListingDetail } from "~/components/web/listing/listing-detail"
import { ProfileEditProvider } from "~/components/web/passport/profile-edit-drawer"
import { BrandTypography } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { IntroDescription } from "~/components/web/ui/intro"
import { AboutSection } from "~/app/(web)/me/_components/me-profile/about-section"
import { BeltHistorySection } from "~/app/(web)/me/_components/me-profile/belt-history-section"
import { GallerySection } from "~/app/(web)/me/_components/me-profile/gallery-section"
import { HeroActions } from "~/app/(web)/me/_components/me-profile/hero-actions"
import { HeroBadges } from "~/app/(web)/me/_components/me-profile/hero-badges"
import { MeProfileEmpty } from "~/app/(web)/me/_components/me-profile/me-profile-empty"
import { profileInitial } from "~/app/(web)/me/_components/me-profile/me-profile-fields"
import { ProfileSidebar } from "~/app/(web)/me/_components/me-profile/profile-sidebar"
import type { OwnerProfileView } from "~/server/web/directory/profile-view"

// FI-024 H3: same lazy boundary the public arm uses — the ancestry timeline/story ships client JS
// (motion) via `next/dynamic`, SSR kept, so the sequence still server-renders. Reused verbatim, not
// rebuilt (the ONE timeline the directory arm renders).
const AncestrySection = dynamic(() =>
  import("~/app/(web)/directory/[slug]/_components/directory-profile/ancestry-section").then(
    m => m.AncestrySection,
  ),
)

/**
 * `/me` arm of the ONE profile renderer — the authenticated member's own Passport
 * (BBL_PARITY_SPEC §2). Behavior-identical to the retired `MeProfile` orchestrator: it wires
 * the reused `ListingDetail` chrome to the extracted section/sidebar/hero parts and the lazy
 * `BeltHistorySection`, owning no section presentation itself. `Breadcrumbs` stays outside the
 * brand-font scope (neutral nav chrome); the profile body is wrapped in `BrandTypography` so —
 * under BBL — the `BjjPassportCard` credential and the section headings resolve the BBL type
 * tokens. Belt colors stay data-driven (`Rank.colorHex` → `BeltSwatch`).
 */
export function OwnerProfile({ view }: { view: OwnerProfileView }) {
  const { brand, profile, lineageProfile, galleryImages, ancestry, editor } = view

  return (
    <>
      <Breadcrumbs items={[{ url: "/me", title: "My Passport" }]} />

      <BrandTypography brand={brand}>
        {/* FI-024 H1: every edit affordance below opens the inline `PassportEditor` drawer via
            context (or degrades to `/app/profile` when the profile isn't provisioned). */}
        <ProfileEditProvider editor={editor}>
          {profile ? (
            <ListingDetail
              media={
                <Avatar className="size-12">
                  {profile.avatarUrl && (
                    <AvatarImage src={profile.avatarUrl} alt={profile.name ?? "My profile"} />
                  )}
                  <AvatarFallback>{profileInitial(profile.name)}</AvatarFallback>
                </Avatar>
              }
              title={profile.name ?? "My Passport"}
              badges={<HeroBadges profile={profile} />}
              actions={<HeroActions profile={profile} />}
              intro={
                profile.locationLine && <IntroDescription>{profile.locationLine}</IntroDescription>
              }
              sidebar={<ProfileSidebar profile={profile} />}
            >
              <AboutSection bio={profile.bio} />
              {/* FI-024 H3: the lineage timeline gets prominence near top-of-body (under hero) —
                  self-gates to nothing when there's no public up-chain. */}
              <AncestrySection ancestry={ancestry} />
              <BeltHistorySection lineageProfile={lineageProfile} />
              {galleryImages.length > 0 && <GallerySection images={galleryImages} />}
            </ListingDetail>
          ) : (
            <MeProfileEmpty />
          )}
        </ProfileEditProvider>
      </BrandTypography>
    </>
  )
}
