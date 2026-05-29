---
title: "SESSION 0300 — Security hostile review (0287–0298) + SOP hardening + D-017 auth consolidation"
slug: session-0300
type: session--review
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0300
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0299.md
  - docs/sprints/SESSION_0298.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0300 — Security hostile review (0287–0298) + SOP hardening + D-017 auth consolidation

## Date

2026-05-29

## Operator

Brian + copilot-session-0300

## Goal

Three-task session: (1) hostile security review of sessions 0287–0298 (media CRUD, brand settings,
org management — the security-relevant implementation sessions), (2) enrich existing SOPs with
security hardening annotations, (3) close drift D-017 by consolidating `updateOrganization` onto
`assertOrgAdminAccess`.

## Status

### Status: closed

## Task plan

| ID | Agent | Task | Done criteria |
|---|---|---|---|
| SESSION_0300_TASK_01 | Doug + Giddy | Hostile security review of SESSION_0287–0298 | 8 review questions + Kaizen answered, findings logged |
| SESSION_0300_TASK_02 | Petey | Security hardening annotations in sop-data-wiring + sop-e2e-user-lifecycle + runbook hub Security section | Annotations merged, hub updated |
| SESSION_0300_TASK_03 | Cody | D-017: consolidate `updateOrganization` onto `assertOrgAdminAccess` | Action uses shared helper, typecheck passes, D-017 closed in drift register |

## Task log

### SESSION_0300_TASK_01 — Hostile security review of SESSION_0287–0298

**Agent:** Doug + Giddy

#### 1. Plan sanity

Plans across 0287–0298 were sound. Each session had a scoped task plan, addressed one
slice, and linked back to prior decisions. The media CRUD epic (0287–0290) had a formal
Petey plan (`petey-plan-0287.md`). The org management arc (0295–0298) built incrementally
on the `assertOrgAdminAccess` shared helper. No session tried to boil the ocean.
**Dirstarter layer contact:** media upload (S3/storage), auth (Better Auth sessions),
Prisma (schema changes). Live docs were not re-checked in sessions 0291–0298 per the
session files — Dirstarter docs were last checked in 0288. This is marginal since the
touched layers (org CRUD, membership actions) are Ronin L2 extensions, not L1 baseline
overrides. **Verdict: pass.**

#### 2. Dirstarter compliance

All sessions extended Dirstarter, never replaced it:

- Auth: Better Auth sessions via `userActionClient` / `adminActionClient` chain throughout.
- Prisma: standard `schema.prisma` with migrations, `services/db.ts` singleton.
- Forms: existing form patterns used (no raw HTML inputs observed).
- Storage: S3 via `lib/media.ts` helper, not a custom stack.

**Verdict: pass — no bypass.**

#### 3. Security

**Strengths found:**

- SESSION_0288 closed a real public-write-to-S3 exposure with `mediaUploadActionClient`.
- All org-scoped mutations (0295–0298) use `assertOrgAdminAccess` + cross-org guards.
- Membership transitions have optimistic version locking (0296).
- Invite brand is server-derived from org row, never client-trusted (0298).
- Audit log entries written for status transitions, role changes, rejections (0296–0298).

**Gaps found:**

- **F-0300-1 (medium):** `getOrganizationMembers` and `getOrganizationInvites` queries have no auth gate — they rely on the calling page to check `hasOrgAdminAccess`. A direct import from another surface could leak the roster. Mitigated by the page-level gate, but the query itself is auth-unaware.
- **F-0300-2 (low):** `assignOrgRole` allows any org admin to grant any system role, including `OWNER`. There's no privilege escalation guard preventing an ORG_ADMIN from granting OWNER to themselves via a second membership. Mitigated by the role-assignment being on *memberships*, not *users*, and OWNER semantics flow from `org.ownerId`, not role-assignments — but the role-code confusion is a latent risk.
- **F-0300-3 (low):** No rate limiting on `createOrgInvite`. An org admin could generate thousands of invite codes. Mitigated by auth gate (must be admin), but rate limiting per Dirstarter baseline would be defense-in-depth.

#### 4. Data integrity

- DB enforces `@@unique([userId, organizationId, disciplineId])` on Membership — no duplicate joins.
- `VALID_TRANSITIONS` state machine prevents illegal status jumps.
- Optimistic locking (`version` column) prevents lost-update on concurrent transitions.
- Foreign key relations on MediaAttachment (8 FK columns) fully wired with Prisma relations (0289).
- BrandSettings has `brand Brand @unique` — one settings row per brand.
- **Verdict: strong — business rules are DB-enforced, not just documented.**

#### 5. Lifecycle proof

The 0295–0298 arc serves the org admin lifecycle: settings → members → roles → invites → general info. Each step maps to a real user journey (org owner managing their school). The invite flow (0298) completes the join-via-link path. **Verdict: pass.**

#### 6. Verification honesty

- SESSION_0288: 5-case safe-action test proving the media auth gate.
- SESSION_0289: 4-case DB-backed test for attach/detach + unauth/non-admin rejection.
- SESSION_0292: Playwright e2e for brand-settings admin.
- SESSION_0296–0298: No automated tests for org membership/invite actions. Page-level manual verification only.
- **Verdict: partial.** The media epic has credible test coverage. The org management arc (0295–0298) has zero automated action-level tests — it's manually verified via the UI. This is the largest gap.

#### 7. Workflow honesty

WORKFLOW 5.0 followed: session files created with JETTY frontmatter, task IDs used, single-lane focus per session, decisions logged, reflections written. No worktree violations (all on `main` as expected for single-track work). **Verdict: pass.**

#### 8. Merge readiness

All sessions are already merged to `main`. The code is live. The question is whether it's *safe* live:

- Media upload auth: safe (tested).
- Brand settings admin: safe (admin-gated, e2e tested).
- Org management: functionally safe (auth-gated), but untested at the action level.

**Verdict: safe with caveats (see F-0300-1, F-0300-2, F-0300-3).**

#### Kaizen reflection

**1. Is this safe and secure? What tests would prove me right?**

Provably safe: media upload auth (tested), brand settings (admin + e2e), cross-org guards (code review). Documented but not behaviorally proven: org membership/invite actions. Tests that would close the gap: safe-action tests for `transitionOrgMembershipStatus`, `assignOrgRole`, `removeOrgRole`, `rejectOrgJoinRequest`, `createOrgInvite`, `revokeOrgInvite` — proving unauth rejection, cross-org rejection, and happy paths. ~12 test cases.

**2. How many failed steps could we have prevented?**

One process slip this session: agent didn't know the typecheck command (`bun run typecheck`). Root cause: verification commands were undocumented in an accessible location. Fix applied this session: verification commands table added to `dev-environment.md`, cross-referenced in `cody-preflight.md` field 5, and added as a HARD RULE in `copilot-instructions.md`.

**3. Confidence 1–10 at scale:**

- 100 users: **9** — all auth gates proven by code structure, cross-org guards solid.
- 1,000 users: **8** — missing rate limiting on invite generation, no action-level tests for org mutations.
- 10,000 users: **7** — query-level auth gaps (F-0300-1) become higher risk with more orgs/admins; need action-level test suite before scaling.

**Kaizen aggregate: 7.** Remediation: write safe-action tests for org management actions (SESSION_0301 or 0302).

#### Findings

**SESSION_0300_FINDING_01 — Org queries lack auth enforcement**

- **Severity:** medium
- **Task:** SESSION_0296_TASK_01, SESSION_0298_TASK_01
- **Evidence:** `server/web/organization/queries.ts` — `getOrganizationMembers` and `getOrganizationInvites` have no auth check
- **Impact:** If imported from an unguarded surface, roster/invite data leaks
- **Required follow-up:** Either inline auth check in the queries, or add a JSDoc `@auth` annotation enforcing page-level gating
- **Status:** accepted-risk (page-level gate exists)

**SESSION_0300_FINDING_02 — No privilege escalation guard on role assignment**

- **Severity:** low
- **Task:** SESSION_0297_TASK_01
- **Evidence:** `server/web/organization/membership-actions.ts` — `assignOrgRole` accepts any `isSystem` role
- **Impact:** ORG_ADMIN could assign OWNER role-code to a membership (though `ownerId` semantics are separate)
- **Required follow-up:** Evaluate whether OWNER role-assignment should be excluded from org-admin self-service
- **Status:** accepted-risk

**SESSION_0300_FINDING_03 — No rate limiting on invite generation**

- **Severity:** low
- **Task:** SESSION_0298_TASK_01
- **Evidence:** `server/web/organization/invite-actions.ts` — `createOrgInvite` has no rate limit
- **Impact:** Abuse vector for invite spam (mitigated by auth gate)
- **Required follow-up:** Add rate limiting per Dirstarter `config/rate-limit.ts` pattern
- **Status:** open

## What landed

- **TASK_01:** Hostile security review of SESSION_0287–0298. 8 review questions answered, 3 findings
  logged (F-0300-1 medium, F-0300-2 low, F-0300-3 low). Kaizen aggregate: 7. Remediation staged:
  safe-action test suite for org management actions.
- **TASK_02:** Security hardening annotations added to `sop-data-and-wiring-flows.md` (auth flow §3,
  invite flow §14) and `sop-e2e-user-lifecycle.md` (org shell §2). Runbook domain hub `README.md`
  enriched with Security & Data Integrity section including hardening ledger (0287–0300).
  Verification commands table added to `dev-environment.md`. `cody-preflight.md` field 5 hardened
  with explicit commands and cross-reference. `copilot-instructions.md` HARD RULE added for
  verification commands.
- **TASK_03:** D-017 closed. `updateOrganization` in `server/web/school/actions.ts` now uses
  `assertOrgAdminAccess` instead of the legacy OWNER role-assignment check. `bun run typecheck`
  passes clean. Drift register updated.

## Hostile close review

### Dirstarter docs check

Dirstarter docs check: not applicable — this session is review + docs + auth-gate consolidation.
No Dirstarter-owned layer was modified (the `assertOrgAdminAccess` helper is Ronin L2).

### Review

**SESSION_0300_REVIEW_01 — Security review + SOP hardening + D-017**

- **Reviewed tasks:** SESSION_0300_TASK_01, TASK_02, TASK_03
- **Dirstarter docs check:** not applicable
- **Sources:** code review of `server/web/organization/*.ts`, `server/web/school/actions.ts`
- **Verdict:** The hostile review is honest — it found real gaps (query-level auth, privilege
  escalation, rate limiting) and scored the Kaizen aggregate at 7, which is below the 9 threshold.
  The D-017 fix is clean and type-safe. The SOP annotations add load-bearing security context to
  existing flows. The verification commands addition addresses a real process failure (agent didn't
  know `bun run typecheck`). Session scored below 9 on Kaizen — remediation (org action tests)
  staged for follow-up.

### Kaizen

1. **Safe and secure?** D-017 fix is safe (uses the proven shared helper). SOP annotations are
   documentation. The hostile review itself is not code. Remaining gaps: no action-level tests for
   org management (F-0300-1/2/3 findings). Tests needed: ~12 safe-action test cases.
2. **Failed steps prevented?** One: the typecheck command fumble. Fixed by adding the verification
   commands to three locations (dev-environment, cody-preflight, copilot-instructions HARD RULE).
   This class of failure should not recur.
3. **Confidence at scale:** 100→9, 1000→8, 10000→7. **Aggregate: 7.**

### Score gate

Aggregate 7 → **stage a remediation session** covering org management action tests before next
implementation session in the org management lane.

## Files touched

- `apps/web/server/web/school/actions.ts` — D-017: `assertOrgAdminAccess` replaces OWNER role check
- `docs/knowledge/wiki/drift-register.md` — D-017 closed
- `docs/runbooks/README.md` — Security & Data Integrity section added
- `docs/runbooks/sops/sop-data-and-wiring-flows.md` — security gate annotations (§3, §14)
- `docs/runbooks/sops/sop-e2e-user-lifecycle.md` — security gate annotation (§2)
- `docs/runbooks/dev-environment/dev-environment.md` — verification commands table added
- `docs/protocols/cody-preflight.md` — field 5 hardened with explicit commands + cross-ref
- `.github/copilot-instructions.md` — HARD RULE: Verification Commands; step 9: cp template
- `.github/prompts/bow-in.prompt.md` — step 9: cp template instead of inline YAML
- `docs/sprints/_template/SESSION_TEMPLATE.md` — reordered sections, added Grill/Drift, H3 task log hint
- `docs/rituals/opening.md` — step 6: cp template instead of inline YAML
- `docs/agents/cody.md` — SOP display text fixed (sops/ path prefix)
- `docs/sprints/SESSION_0300.md` — this session file

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (from `apps/web/`) | 0 errors |
| `bun run lint` (from `apps/web/`) | pass |
| `bun run wiki:lint` (from repo root) | 0 errors, 58 warnings (pre-existing staleness) |

## Decisions resolved

- **D-017 (drift register):** `updateOrganization` consolidated onto `assertOrgAdminAccess`. Closed.
- **Verification commands location:** Added to `dev-environment.md` (canonical), cross-referenced in
  `cody-preflight.md` and `copilot-instructions.md`. No new document needed.

## Open decisions / blockers

- **D7:** S3 bucket provisioning — deferred, needs AWS creds (carried from SESSION_0299).
- **F-0300-1:** Org queries lack inline auth enforcement — accepted-risk, page-level gate exists.
- **F-0300-2:** No privilege escalation guard on role assignment — accepted-risk, evaluate later.
- **F-0300-3:** No rate limiting on invite generation — open, should be addressed.
- **Kaizen aggregate 7:** Remediation required — safe-action test suite for org management actions.

## Reflections

- **The typecheck fumble was a documentation gap, not a knowledge gap.** The command existed in
  `cody.md` line 69 but was never in a location that agents load at bow-in. Adding it as a HARD RULE
  in `copilot-instructions.md` (which is in every agent's system prompt) is the strongest possible
  gate. The dev-environment table is the canonical reference; the copilot-instructions rule is the
  enforcement layer.
- **The SESSION file was generated freehand when a template already existed at
  `docs/sprints/_template/SESSION_TEMPLATE.md`.** 295 lines of validated structure, sitting in the
  repo since SESSION_0228, and the agent never looked for it — because `copilot-instructions.md`
  step 9 described the format inline instead of pointing to the template. Fixed: step 9 now says
  `cp SESSION_TEMPLATE.md SESSION_NNNN.md`. This is the same class as the typecheck miss — the
  answer is in the repo, the agent doesn't look.
- **Hostile reviews produce more value as security audits than as session-close rituals.** Reviewing
  12 sessions at once revealed cross-session patterns (consistent auth model, incremental cross-org
  guard adoption) that individual session reviews would miss. The 3 findings are low/medium severity
  but real — they wouldn't have surfaced in a single-session hostile close.

## Next session

- **Goal:** Remediation session — write safe-action test suite for org management actions
  (SESSION_0295–0298 surfaces: transition, assign/remove role, reject, invite create/revoke,
  general-info update). ~12 test cases. Then Desi design review mini-sprint + Brandon branding audit.

- **Inputs to read:** SESSION_0300 findings (F-0300-1/2/3), existing test patterns in
  `media.safe-action.test.ts` and `media-attachment.safe-action.test.ts`.
- **First task:** Write `org-management.safe-action.test.ts` covering `transitionOrgMembershipStatus`,
  `assignOrgRole`, `removeOrgRole`, `rejectOrgJoinRequest` — proving unauth rejection, cross-org
  rejection, and happy paths.
