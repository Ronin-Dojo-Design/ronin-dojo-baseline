import { BjjPassportCard } from "~/components/web/profile/bjj-passport-card"
import type { MyProfile } from "~/server/web/directory/profile-projection"
import { AffiliationsCard } from "./affiliations-card"
import { IdentityCard } from "./identity-card"
import { SocialCard } from "./social-card"

/**
 * Right-rail sidebar for `/me`. Leads with the shareable `BjjPassportCard` credential
 * (reused, not re-implemented — it consumes the BBL type tokens the surrounding
 * `BrandTypography` scope exposes), then the Identity / Schools / Social cards, each of
 * which self-hides when it has no data.
 */
export function ProfileSidebar({ profile }: { profile: MyProfile }) {
  return (
    <>
      <BjjPassportCard
        name={profile.name ?? "Member"}
        rank={profile.currentRank}
        school={profile.schoolLabel}
        avatarUrl={profile.avatarUrl}
        disciplineLabel={profile.currentRank?.disciplineLabel ?? undefined}
      />

      <IdentityCard profile={profile} />
      <AffiliationsCard affiliations={profile.affiliations} />
      <SocialCard socialLinks={profile.socialLinks} />
    </>
  )
}
