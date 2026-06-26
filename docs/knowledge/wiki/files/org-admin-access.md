---
title: "server/web/organization/org-admin-access.ts"
slug: org-admin-access
type: file
status: active
created: 2026-06-26
updated: 2026-06-26
author: Brian + claude-session-0449
last_agent: claude-session-0449
pairs_with:
  - knowledge/wiki/files/organization-detail-page
  - architecture/auth
parent: architecture/auth
backlinks:
  - sprints/SESSION_0449
  - docs/architecture/auth.md
wiring:
  - "apps/web/server/web/organization/org-admin-access.ts — hasOrgAdminAccess / assertOrgAdminAccess"
  - "imported by the org settings/* pages + the org self-service server actions (theme/general-info/invites/membership/school)"
tags: [organization, authz, security, server-action]
---

# server/web/organization/org-admin-access.ts

**Path:** `apps/web/server/web/organization/org-admin-access.ts`

The single choke point for **org-settings authorization**. A `"use server"` module exporting two
functions; every org self-service surface routes through it.

## Contract

`hasOrgAdminAccess(userId, organizationId): Promise<boolean>` returns `true` when the user is **any** of:

1. a **platform admin** — `User.role === "admin"` (short-circuits first; grants access to **every** org,
   incl. WP-imported orgs whose `ownerId` is `null`). Added SESSION_0448.
1. the org **`ownerId`**.
1. a member with an **`ORG_ADMIN`** role assignment in that org.

`assertOrgAdminAccess(userId, organizationId): Promise<void>` wraps it and throws `Error("ACCESS_DENIED")`
when not authorized. Use it in server actions that must abort on unauthorized.

## Consumers

- **Read gates (settings pages):** `app/(web)/organizations/[slug]/settings/{,general,theme,members,invites}/page.tsx`
  (render `OrgAccessDenied` when `!hasOrgAdminAccess`) + `organization-detail-data.ts` (sets `canManage`).
- **Write gates (server actions, via `assertOrgAdminAccess`):** `theme-actions.ts` (`updateOrgThemeSelfService`),
  `general-info-actions.ts` / `school/actions.ts` (`updateOrganization`), `invite-actions.ts`
  (`createOrgInvite` / `revokeOrgInvite`), `membership-actions.ts` (`transitionOrgMembershipStatus`,
  `assignOrgRole`, `removeOrgRole`, `rejectOrgJoinRequest`).

## Notes

- **Privilege-escalation carve-out:** only the org **owner** can grant `ORG_ADMIN`
  (`membership-actions.ts assignOrgRole` re-checks `org.ownerId === userId` directly, not via this helper).
  So a platform admin can do every member op on any org **except** promote to `ORG_ADMIN` unless they own it.
  Fail-safe (denies, not grants).
- **Security note:** the platform-admin short-circuit means the 2 prod platform admins (Brian, Tony Hua)
  have write access to every org's settings. Tracked in
  [`ronin-security-risk-register`](../../../security/ronin-security-risk-register.md) (#11). Keep the
  platform-admin set minimal; confirm `AuditLog` records cross-org admin writes.
- Authorization is enforced here at the page/action layer, not in the cached read queries
  (`getOrganizationBySlug` is `"use cache"` and viewer-agnostic). See [auth.md](../../../architecture/auth.md).
