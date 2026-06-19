import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { ListingDetail } from "~/components/web/listing/listing-detail"
import { BrandTypography } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { IntroDescription } from "~/components/web/ui/intro"
import { AboutSection } from "./about-section"
import { BeltHistorySection } from "./belt-history-section"
import { GallerySection } from "./gallery-section"
import { HeroActions } from "./hero-actions"
import { HeroBadges } from "./hero-badges"
import { MeProfileEmpty } from "./me-profile-empty"
import { profileInitial } from "./me-profile-fields"
import type { MeProfileProps } from "./me-profile-types"
import { ProfileSidebar } from "./profile-sidebar"

/**
 * `/me` — the authenticated member's own Passport profile (BBL_PARITY_SPEC §2).
 *
 * Thin orchestrator (the colocated folder module's public barrel): it wires the reused
 * `ListingDetail` chrome to the extracted section/sidebar/hero parts and the lazy
 * `BeltHistorySection`, owning no section presentation itself. `Breadcrumbs` stays
 * outside the brand-font scope (neutral nav chrome); the profile body is wrapped in
 * `BrandTypography` so — under BBL — the `BjjPassportCard` credential and the section
 * headings (`bblHeadingFontClass`) resolve the BBL type tokens and the page reads
 * correctly under the brand. Belt colors stay data-driven (`Rank.colorHex` → `BeltSwatch`).
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function MeProfile({ brand, profile, lineageProfile, galleryImages }: MeProfileProps) {
  return (
    <>
      <Breadcrumbs items={[{ url: "/me", title: "My Passport" }]} />

      <BrandTypography brand={brand}>
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
            <BeltHistorySection lineageProfile={lineageProfile} />
            {galleryImages.length > 0 && <GallerySection images={galleryImages} />}
          </ListingDetail>
        ) : (
          <MeProfileEmpty />
        )}
      </BrandTypography>
    </>
  )
}
