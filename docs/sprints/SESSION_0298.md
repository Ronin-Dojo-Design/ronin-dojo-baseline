---
title: "SESSION 0298 — Org-scoped invite links + general-info settings section"
slug: session-0298
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: claude-session-0298
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0297.md
  - docs/sprints/petey-plan-0298.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0298 — Org-scoped invite links + general-info settings section

## Date

2026-05-29

## Operator

Brian + claude-session-0298 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Member-management lane slice 3: org-scoped invite-link flow (generate/revoke under org
settings on the existing `Invite` model) + a general-info settings section
(`updateOrgGeneralInfo` + reused school-form fields). Both gated by `hasOrgAdminAccess`.

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0297 (closed). Org-scoped role assignment + reject-as-delete (F-0296-1). Left the
  invite-link / general-info lane staged.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (HEAD `37aa419`)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `server/web/organization/` (new invite + general-info actions/queries), `settings/` (new pages + index cards) |
| Extension or replacement | **Extension** — org-scoped invite surface + general-info section |
| Why justified | Org admins must use platform `/admin/invites` to invite members; no org-scoped general-info edit exists under settings. |
| Risk if bypassed | Org self-service onboarding depends on platform staff. |

### Graphify check

- Graph current (7458 nodes / 11982 edges, updated end of SESSION_0297).
- Queries: invite lane → surfaced `server/{admin/invites,invites}/`, `/invite/[code]`,
  `invite-join-form`; runbook query → `docs/runbooks/invites.md`; filter primitive →
  `ButtonGroup` (`components/common/button-group.tsx`) + `DataTableFacetedFilter`.

### Grill outcome (4 forks resolved)

1. **Scope** = invite flow + general-info (both).
2. **Invite create UX** = generate + optional maxUses/expiresAt.
3. **List** = active+claim-count default, `ButtonGroup` Active|All filter rail to show all.
4. **General-info auth** = new org-scoped `updateOrgGeneralInfo` (assertOrgAdminAccess);
   legacy `updateOrganization` (OWNER-role auth) left untouched — drift logged.

### Drift logged

`updateOrganization` (`server/web/school/actions.ts`) gates on an OWNER role-assignment,
diverging from `hasOrgAdminAccess` (ownerId OR ORG_ADMIN). Not fixed this session; new
general-info action uses the consistent model. Future auth-consolidation follow-up.

## Petey plan

See [`petey-plan-0298.md`](petey-plan-0298.md).

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0298_TASK_01 | done | `getOrganizationInvites` query | Cody |
| SESSION_0298_TASK_02 | done | `createOrgInvite` / `revokeOrgInvite` actions | Cody |
| SESSION_0298_TASK_03 | done | Invites settings page (filter rail, copy, revoke, generate) + index card | Cody |
| SESSION_0298_TASK_04 | done | `updateOrgGeneralInfo` + general-info settings section + index card | Cody |
| SESSION_0298_TASK_05 | done | Typecheck + biome | Doug |

## Task log

### SESSION_0298_TASK_01 — Org invite query

`getOrganizationInvites(organizationId, includeAll)` in `queries.ts` — `type: ORGANIZATION`
invites for the org, default PENDING-only, `includeAll` returns every status; selects
`_count.claims`, ordered newest-first. Uncached (generate/revoke reflect immediately).

### SESSION_0298_TASK_02 — Org invite actions

New `server/web/organization/invite-actions.ts`. `createOrgInvite`: `userActionClient` +
`assertOrgAdminAccess`; forces `type: ORGANIZATION` + org, brand sourced from the org row,
`createdById = user.id`, optional `maxUses`/`expiresAt`. `revokeOrgInvite`: asserts access +
**cross-org guard** (`invite.organizationId === organizationId`) → `status: REVOKED`. The
public `/invite/[code]` claim flow is unchanged — it already creates an ACTIVE Membership.

### SESSION_0298_TASK_03 — Invites settings page

`settings/invites/page.tsx` — `hasOrgAdminAccess` gate, `GenerateInviteForm` (button + optional
maxUses/expiry, copies the new link on success), a `ButtonGroup` Active | All filter rail wired
to a `?status=` searchParam (server reads it → `getOrganizationInvites(..., showAll)`), and per-
invite rows showing `/invite/{code}`, status badge, `claims claimed · used/max · expires`, plus
`InviteRowActions` (copy-link via `navigator.clipboard`, revoke for PENDING). Reused the L5
`ButtonGroup` primitive and the platform copy-link idiom. Added Invite Links card to the index.

### SESSION_0298_TASK_04 — General-info section

New `updateOrgGeneralInfo` (`general-info-actions.ts`): `userActionClient` +
`assertOrgAdminAccess`, same field set as the legacy `updateOrganization`. New
`settings/general/page.tsx` + `OrgGeneralInfoForm` (mirrors school-form fields, pointed at the
new action). `getOrganizationBySlug` already returns all general-info fields (no new query).
Added General Info card to the index. Legacy `updateOrganization` left untouched (drift logged).

### SESSION_0298_TASK_05 — Verification

`npm run typecheck` → 0 errors. `biome check` on 9 touched files → clean (fixed a label-control
a11y error by associating the generate-form date/number inputs with `htmlFor`/`id`).

## What landed

- `server/web/organization/queries.ts` — `getOrganizationInvites` (new export)
- `server/web/organization/invite-actions.ts` — **new** `createOrgInvite` + `revokeOrgInvite`
- `server/web/organization/general-info-actions.ts` — **new** `updateOrgGeneralInfo`
- `settings/invites/page.tsx` + `_components/generate-invite-form.tsx` + `_components/invite-row-actions.tsx` — **new** invite surface
- `settings/general/page.tsx` + `_components/org-general-info-form.tsx` — **new** general-info section
- `settings/page.tsx` — added General Info + Invite Links cards
- Drift logged: `updateOrganization` OWNER-role auth divergence ([drift-register](../knowledge/wiki/drift-register.md))

## Decisions resolved

- **Invite surface = thin org-scoped wrapper** over the existing Invite system; claim flow untouched.
- **Invite create UX** = generate + optional maxUses/expiry; list defaults to active, `ButtonGroup` Active|All filter to show all.
- **General-info auth** = new org-scoped `updateOrgGeneralInfo` (assertOrgAdminAccess), consistent with theme/members; legacy `updateOrganization` left as-is.

## Review log

### TASK_REVIEW_LOG — SESSION_0298 (Giddy + Doug)

- **Scope reviewed:** TASK_01–05.
- **Doug (verification):** PASS. Typecheck 0 errors; biome clean. Invite actions reuse the proven create/update shapes; claim flow unchanged so no membership-creation regression.
- **Giddy (hostile):** PASS. `revokeOrgInvite` cross-org guarded; `createOrgInvite` forces org + type (no client-supplied organizationId trust beyond the asserted org); `updateOrgGeneralInfo` uses `assertOrgAdminAccess` (consistent gating). No Dirstarter baseline layer touched. **Auth drift surfaced and logged** (`updateOrganization`) rather than silently worked around.
- **Open follow-ups:** auth-consolidation of `updateOrganization` (OWNER-role → hasOrgAdminAccess) — deferred, in drift register.

## Hostile close review

- **Verdict:** PASS (no score cap). Guards consistent with the SESSION_0297 pattern; reused existing primitives (`ButtonGroup`, copy-link idiom, claim flow, school-form fields) rather than re-implementing.
- **Not run this session:** live browser smoke (needs dev server + auth) and unit tests — carried, non-blocking. Stated honestly.

## ADR / ubiquitous-language check

- **ADR:** None needed. Org-scoped invite/general-info surfaces extend established patterns; no new architectural decision. The auth divergence is recorded as **drift** (lighter than an ADR) pending a consolidation decision.
- **Ubiquitous language:** No new terms. Invite, InviteClaim, Organization, ORG_ADMIN already in glossary.

## Reflections

- **The whole invite subsystem already existed** — the runbook (`docs/runbooks/invites.md`) + Graphify made that obvious fast, turning a "build invite flow" task into a thin org-scoped wrapper. Reading the runbook before coding saved re-implementing the claim transaction.
- **Auth drift caught at plan time, not build time.** Checking `updateOrganization`'s auth during the grill (not after writing the page) surfaced the OWNER-role vs hasOrgAdminAccess mismatch before it became a runtime "see-but-can't-save" bug. Cheap check, expensive miss avoided.
- **biome doesn't see custom `<Input>` as a label control** — wrapping a custom component in `<label>` fails `noLabelWithoutControl`; associate with `htmlFor`/`id` instead.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Code files (no frontmatter). Docs: SESSION_0298 + petey-plan-0298 created with JETTY 3.0 frontmatter; wiki index + component inventory + drift register `last_agent`→claude-session-0298. |
| Backlinks/index sweep | SESSION_0298 `pairs_with` SESSION_0297 + petey-plan-0298; index row added; component inventory §7 updated; drift-register entry links back to this session. |
| Wiki lint | `bun run wiki:lint` → started 232 errors / 699 warnings. **Post-close cleanup (operator request): fixed all 232 broken-link errors → 0.** Root cause: files moved into `_archive/` without updating relative link depth (and `index.md` omitting the `_archive/` segment). Resolved via a basename resolver (`/tmp/fix_wiki_links2.py`) — 232 link-path swaps across 23 docs, all 1:1 (232 ins / 232 del), no content edits. 699 cosmetic markdown-style warnings (blank-line-around-lists) intentionally left. Final: **0 errors**. |
| Kaizen reflection | Yes — Reflections present. |
| Hostile close review | PASS; TASK_REVIEW_LOG above; one deferred follow-up (auth consolidation, in drift register). |
| Review & Recommend | Yes — Next session goal below. |
| Memory sweep | No new memory file — the auth drift is recorded in the drift register (project doc), the right home; existing membership memory still accurate. |
| Next session unblock check | Unblocked — next slice (auth consolidation or invite polish) is self-contained. |
| Git hygiene | Branch `main`; staged/committed/pushed per standing authorization — proof in bow-out response. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` after git hygiene — counts in bow-out response. |

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, needs AWS creds (carried)
- **DRIFT-updateOrganization-auth**: `updateOrganization` gates on OWNER role-assignment, divergent from `hasOrgAdminAccess`. Logged in drift register; consolidate in a future session.

## Next session

- **Goal**: Either (a) **auth consolidation** — migrate the legacy dashboard `updateOrganization` onto `hasOrgAdminAccess`/`assertOrgAdminAccess` and retire the OWNER-role check (resolve the drift), or (b) **invite polish** — invite detail/claims view + email-compose option, or (c) proceed to the next sprint deliverable.
- **Inputs to read**: SESSION_0298, drift register entry, `server/web/school/actions.ts`, `org-admin-access.ts`.
- **First task**: If (a) — point `updateOrganization` at `assertOrgAdminAccess`, verify the dashboard school-form still authorizes correctly for owners, and remove the duplicate auth model.
