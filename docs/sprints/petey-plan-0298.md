---
title: "Petey Plan 0298 — Org-scoped invite links + general-info settings section"
slug: petey-plan-0298
type: plan
status: in-progress
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0298
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0298.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0298

## Goal

Member-management lane slice 3: org-scoped **invite-link flow** (generate/revoke invite
links under org settings, on the existing `Invite` model) **and** a **general-info** settings
section (org-scoped `updateOrgGeneralInfo` + reuse of `school-form` fields). Both gated by
`hasOrgAdminAccess`, consistent with theme + members.

## Grill outcome (4 forks resolved)

1. **Scope** = invite flow **+** general-info (both this session).
2. **Invite create UX** = generate button + **optional** `maxUses` / `expiresAt`.
3. **List scope** = active (PENDING) + claim count by default, with a **filter rail**
   (`ButtonGroup` segmented Active | All) to switch to all-with-status. Reuse the L5
   `ButtonGroup` primitive (`components/common/button-group.tsx`), not the heavy DataTable.
4. **General-info auth** = new org-scoped `updateOrgGeneralInfo` (userActionClient +
   `assertOrgAdminAccess`), NOT the legacy `updateOrganization` (which gates on an OWNER
   role-assignment — divergent from the settings surface; see Drift below). Reuse
   `school-form` field set, point at the new action.

## Context (bow-in findings)

- The invite system is **fully built**: `Invite`/`InviteClaim` models, platform-admin
  `createInvite`/`revokeInvite`/`deleteInvites` (`server/admin/invites/`), public
  `claimInvite` (`server/invites/actions.ts`) which creates an ACTIVE Membership in a
  transaction (TOCTOU re-validated), public `/invite/[code]` claim page, and
  `notifyUserOfInvite` email. Documented in `docs/runbooks/invites.md`.
- **The only gap is an org-scoped surface** — today org admins must use platform
  `/admin/invites`. Claim side needs ZERO changes.
- Auth/guard pattern to mirror: `loadOrgMembership` + `assertOrgAdminAccess` from
  SESSION_0297 (`server/web/organization/membership-actions.ts`).

## Drift logged (do NOT fix this session — scope guard)

`updateOrganization` (`server/web/school/actions.ts`, dashboard `school-form`) authorizes on
a Membership with role code `OWNER`, which diverges from the `hasOrgAdminAccess` model
(`ownerId` OR `ORG_ADMIN`) used across org settings. This session does not touch it; the new
`updateOrgGeneralInfo` uses the consistent model. Flagged for a future auth-consolidation pass.

## Tasks

### TASK_01 — Org invite query

- **Agent:** Cody
- **What:** `getOrganizationInvites(organizationId, includeAll?)` in
  `server/web/organization/queries.ts` — invites for the org, default PENDING-only, `includeAll`
  returns every status; include `_count.claims`, order newest-first.

- **Done means:** Returns the org's invites with claim counts; callable from the page.

### TASK_02 — Org invite actions

- **Agent:** Cody
- **What:** `createOrgInvite` + `revokeOrgInvite` in a new
  `server/web/organization/invite-actions.ts`.
- **Steps:**
  1. `userActionClient` + `assertOrgAdminAccess(user.id, organizationId)`.
  2. `createOrgInvite`: force `type: "ORGANIZATION"`, `organizationId`, brand (from org row /
     `getRequestBrand`), `createdById = user.id`; optional `maxUses`/`expiresAt`.
  3. `revokeOrgInvite`: load invite, **guard `invite.organizationId === organizationId`**,
     set `status: "REVOKED"`.
  4. Revalidate `/organizations/[slug]/settings/invites`.
- **Done means:** Org admin can generate + revoke invites for their org only; cross-org revoke
  rejected.

### TASK_03 — Invites settings page + components

- **Agent:** Cody
- **What:** `/organizations/[slug]/settings/invites/page.tsx` + client bits.
- **Steps:**
  1. `hasOrgAdminAccess` gate (mirror members/theme), breadcrumbs, Intro.
  2. Filter rail: `ButtonGroup` Active | All as links setting `?status=` searchParam; server
     reads it and calls `getOrganizationInvites` accordingly.
  3. List rows: full `/invite/{code}` link, status badge, claim/use count (`x/maxUses` or
     `x` if unlimited), expiry; **copy-link** button (client) + **revoke** button (client).
  4. **Generate** form (client): button + optional maxUses/expiresAt → `createOrgInvite`.
  5. Add **Invites** card to settings index.
- **Done means:** Org admin sees their invites, filters Active/All, copies links, revokes, and
  generates new links with optional limits.

- **Depends on:** TASK_01, TASK_02.

### TASK_04 — General-info action + settings section

- **Agent:** Cody
- **What:** `updateOrgGeneralInfo` (org-scoped) + `/organizations/[slug]/settings/general/page.tsx`.
- **Steps:**
  1. `updateOrgGeneralInfo` in `server/web/organization/` — userActionClient +
     `assertOrgAdminAccess`; same field set as `updateOrganization` (name, slug, description,
     websiteUrl, email, phoneE164, addressLine1, city, state, country); revalidate org + settings.
  2. Settings page: gate + a form reusing `school-form`'s field set pointed at the new action
     (new `org-general-info-form.tsx` to avoid coupling the dashboard form's hardcoded action).
  3. Add **General info** card to settings index.
- **Done means:** Owner/ORG_ADMIN edits org general info from settings; saves succeed for the
  same users who can see the page.

- **Depends on:** nothing (disjoint from invites except the shared index card).

### TASK_05 — Verification

- **Agent:** Doug
- **What:** `npm run typecheck` + `biome check` on touched files.
- **Done means:** 0 type errors, biome clean.
- **Depends on:** TASK_01–04.

## Parallelism

Invite lane (01–03) and general-info (04) are largely disjoint, but share
`settings/page.tsx` (index cards) and the same org-scoped-action idiom. Single coherent
inline Cody pass — coordinating a parallel subagent + index merge exceeds the benefit at this
size.

## Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01–04 | Cody | Mirror established patterns; shared index file |
| TASK_05 | Doug | Verification gate |

## Open decisions

None — four forks resolved at bow-in.

## Risks

- **Cross-org guard** on revoke is load-bearing (don't revoke another org's invite by ID).
- **Brand** on create: source from org row or `getRequestBrand`, consistent with theme-actions.
- **ButtonGroup** is a visual grouping primitive — use links inside for the filter rail; the
  active option styled `primary`.

## Scope guard

`updateOrganization` auth-drift fix, invite detail/claims page, bulk invite ops,
PROGRAM/TOURNAMENT/EVENT invite types, QR codes, invite email-compose UI → future. Note in
SESSION `Open decisions / blockers`, don't build inline.

## Dirstarter implementation template

- **Docs read first:** `docs/runbooks/invites.md` (internal); not a Dirstarter baseline layer.
- **Baseline pattern to extend:** platform `createInvite`/`revokeInvite`, `claimInvite`
  (unchanged), `loadOrgMembership` auth/guard, `theme-actions` self-service pattern,
  `ButtonGroup` primitive, `school-form` field set.
- **Custom delta:** org-scoped invite create/revoke/list surface + org-scoped general-info action.
- **No-bypass proof:** Dirstarter has no org-scoped invite or org-settings general-info; Ronin
  domain logic on Invite/Organization.
