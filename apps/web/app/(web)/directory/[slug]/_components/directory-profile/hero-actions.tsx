import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * Hero actions cluster: persisted Save (any rendered profile — the subject is the
 * Passport, the identity SoT) + QrShare, which stays gated to a fully-rendered profile.
 */
export function HeroActions({
  profile,
  profileUrl,
}: {
  profile: DirectoryProfile
  profileUrl: string
}) {
  return (
    <Stack size="sm">
      <ListingSaveButton
        subjectType="PERSON"
        subjectId={profile.passportId}
        size="md"
        showLabel={false}
      />
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
