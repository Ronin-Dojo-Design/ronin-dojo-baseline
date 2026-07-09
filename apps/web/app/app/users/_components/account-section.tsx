import { PermissionGrantsPanel } from "~/app/app/users/_components/permission-grants-panel"
import { UserForm } from "~/app/app/users/_components/user-form"
import { Stack } from "~/components/common/stack"
import type { UserPermissionGrantState } from "~/server/admin/permissions/queries"
import type { findUserById } from "~/server/admin/users/queries"

type Props = {
  user: NonNullable<Awaited<ReturnType<typeof findUserById>>>
  permissionGrants: UserPermissionGrantState[]
  hasLegacyUploadEntitlement: boolean
}

/**
 * The admin-only account controls for a Person's detail page (WL-P2-35, ADR 0045 D3).
 *
 * Folds the two account-scoped surfaces — the `UserForm` (email + role, plus the ban /
 * revoke-sessions / delete `UserActions` it embeds) and the RBAC `PermissionGrantsPanel`
 * (account-level capability grants) — into ONE section. Rendered ONLY when the Passport
 * has a linked account (`passport.userId != null`); for accountless roster placeholders
 * the page omits it entirely, so the account-only actions hide (ADR 0045 D3). Reuses the
 * existing role/ban/grant server actions unchanged — no new authz.
 */
export function AccountSection({ user, permissionGrants, hasLegacyUploadEntitlement }: Props) {
  return (
    <Stack direction="column" size="lg" className="w-full">
      <PermissionGrantsPanel
        userId={user.id}
        grants={permissionGrants}
        hasLegacyUploadEntitlement={hasLegacyUploadEntitlement}
      />
      <UserForm title="Account" user={user} />
    </Stack>
  )
}
