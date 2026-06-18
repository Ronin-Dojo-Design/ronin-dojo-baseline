import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { JoinOrganizationButton } from "~/components/web/organizations/join-organization-button"
import { MembershipActions } from "~/components/web/organizations/membership-actions"
import type { MemberGroup, OrganizationDetailView } from "./organization-detail-data"

type OrganizationMembersProps = Pick<
  OrganizationDetailView,
  "org" | "brand" | "uniqueMembers" | "uniqueMemberCount" | "roles" | "isOwner"
>

type AggregateStatus = { label: string; variant: "success" | "danger" | "warning" }

/**
 * Best status across a person's memberships: ACTIVE wins, then SUSPENDED, else the
 * first membership's raw status. Extracted from the JSX IIFE it replaces (verbatim
 * logic) — no nested ternary, no derivation inside the render.
 */
function deriveAggregateStatus(memberships: MemberGroup["memberships"]): AggregateStatus {
  const hasActive = memberships.some(m => m.status === "ACTIVE")
  const hasSuspended = memberships.some(m => m.status === "SUSPENDED")
  if (hasActive) return { label: "ACTIVE", variant: "success" }
  if (hasSuspended) return { label: "SUSPENDED", variant: "danger" }
  return { label: memberships[0].status, variant: "warning" }
}

/** Deduplicated roles across all of a person's memberships, preserving first-seen order. */
function dedupeRoles(memberships: MemberGroup["memberships"]): { id: string; name: string }[] {
  const seen = new Set<string>()
  const roles: { id: string; name: string }[] = []
  for (const m of memberships) {
    for (const ra of m.roleAssignments) {
      if (seen.has(ra.role.id)) continue
      seen.add(ra.role.id)
      roles.push({ id: ra.role.id, name: ra.role.name })
    }
  }
  return roles
}

/**
 * Members roster: per-discipline join CTAs (the `JoinOrganizationButton` client
 * island) plus one card per unique member, with owner-only `MembershipActions`. Both
 * islands are REUSED from `components/web/organizations/*` — not re-implemented here.
 */
export function OrganizationMembers({
  org,
  brand,
  uniqueMembers,
  uniqueMemberCount,
  roles,
  isOwner,
}: OrganizationMembersProps) {
  return (
    <div className="space-y-3">
      <H4>Members ({uniqueMemberCount})</H4>

      {org.disciplines.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Join a discipline:</p>
          <Stack size="sm" className="flex-wrap">
            {org.disciplines.map(od => (
              <JoinOrganizationButton
                key={od.discipline.id}
                organizationId={org.id}
                disciplineId={od.discipline.id}
                brand={brand}
              />
            ))}
          </Stack>
        </div>
      )}

      <div className="space-y-2">
        {uniqueMembers.map(({ user, memberships }) => {
          const status = deriveAggregateStatus(memberships)
          return (
            <Card key={user.id} hover={false}>
              <CardHeader>
                <span className="text-sm font-medium">{user.name ?? "Unknown"}</span>
                <Badge size="sm" variant={status.variant}>
                  {status.label}
                </Badge>
              </CardHeader>
              <CardDescription>
                <Stack size="sm" className="flex-wrap">
                  {memberships.map(m => (
                    <Badge key={m.id} size="sm" variant="outline">
                      {m.discipline?.name ?? "General"}
                    </Badge>
                  ))}
                  {dedupeRoles(memberships).map(role => (
                    <Badge key={role.id} size="sm" variant="soft">
                      {role.name}
                    </Badge>
                  ))}
                </Stack>
              </CardDescription>
              {isOwner && user.id !== org.ownerId && (
                <MembershipActions
                  membership={memberships[0]}
                  roles={roles}
                  assignedRoleIds={memberships.flatMap(m =>
                    m.roleAssignments.map(ra => ra.role.id),
                  )}
                />
              )}
            </Card>
          )
        })}

        {uniqueMembers.length === 0 && <EmptyList>No members yet.</EmptyList>}
      </div>
    </div>
  )
}
