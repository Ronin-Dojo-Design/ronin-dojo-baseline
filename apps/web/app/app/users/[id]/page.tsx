import { notFound } from "next/navigation"
import { AccountSection } from "~/app/app/users/_components/account-section"
import { Wrapper } from "~/components/common/wrapper"
import { PassportEditor } from "~/components/web/passport/passport-editor"
import { Brand } from "~/.generated/prisma/client"
import { findPersonByPassportId } from "~/server/admin/people/queries"
import { findUserPermissionGrantStates } from "~/server/admin/permissions/queries"
import { findUserById } from "~/server/admin/users/queries"
import type { DirectoryProfileOne } from "~/server/web/passport/payloads"
import { hasEntitlement } from "~/server/web/entitlements/queries"

/**
 * Placeholder DirectoryProfile shape for an accountless roster Passport that never got
 * a persisted profile (only the sign-up hook / add-person-with-account paths create one).
 * Mirrors the `schema.prisma` `@default`s so the editor renders sensible initial values;
 * `updateDirectoryProfileAsAdmin` upserts the real row on first save.
 */
function emptyDirectoryProfile(passportId: string): DirectoryProfileOne {
  return {
    id: "",
    slug: null,
    visibility: "MEMBERS_ONLY",
    locationCity: null,
    locationRegion: null,
    locationCountry: null,
    showEmail: false,
    showPhone: false,
    showOrgs: true,
    showRanks: true,
    coverPhotoUrl: null,
    videoIntroUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    passportId,
  }
}

export default async ({ params }: PageProps<"/app/users/[id]">) => {
  const { id } = await params
  const person = await findPersonByPassportId(id)

  if (!person) {
    return notFound()
  }

  const { user, directoryProfile, ...passport } = person

  // Account-only surfaces load ONLY when the Passport has a linked account (ADR 0045 D3);
  // accountless placeholders skip them entirely.
  const [account, permissionGrants, hasLegacyUploadEntitlement] = user
    ? await Promise.all([
        findUserById(user.id),
        findUserPermissionGrantStates(user.id),
        hasEntitlement(user.id, "S3_UPLOAD", Brand.BBL),
      ])
    : [null, [], false]

  return (
    <Wrapper size="md" gap="lg">
      <PassportEditor
        passport={passport}
        directoryProfile={directoryProfile ?? emptyDirectoryProfile(passport.id)}
        // Media-upload path namespace: the real account id when linked, else the passport id.
        userId={user?.id ?? passport.id}
        canUploadVideo={false}
        adminPassportId={passport.id}
      />

      {account && (
        <AccountSection
          user={account}
          permissionGrants={permissionGrants}
          hasLegacyUploadEntitlement={hasLegacyUploadEntitlement}
        />
      )}
    </Wrapper>
  )
}
