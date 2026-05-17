---
title: "SESSION 0184 — Lineage Node Profile Editor"
slug: session-0184
type: session--open
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0184
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0183.md
  - docs/architecture/lineage/lineage-public-viewer-editor-routes.md
  - docs/architecture/lineage/lineage-claim-workflow-evidence-review.md
  - docs/runbooks/lineage-listing-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0184 — Lineage Node Profile Editor

## Date

2026-05-17 MDT

## Operator

Brian Scott + Codex as Petey orchestrator, Cody implementer, Doug reviewer.

## Goal

Ship the approved-claim lineage node profile editor: `updateLineageNodeProfile` ownership-gated by an APPROVED claim, plus `/lineage/[treeSlug]/edit/[nodeId]` so an approved claimant can update their lineage profile fields.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest session read: `docs/sprints/SESSION_0183.md`; body status was `closed-quick`, but YAML status still said `in-progress`. Repaired YAML to `closed-quick` before opening this session.
- Branch at bow-in: `session-0183-lineage-admin-claim-review` clean at `ff34826` → created `session-0184-lineage-node-profile-editor`.
- FAILED_STEPS scan: no lineage-specific open blockers found in the loaded section; prior close-step drift pattern acknowledged by repairing SESSION_0183 status and planning full-close proof.
- Drift Register scan: no open lineage entries. D-007 remains deferred and unrelated.
- Graphify update ran at bow-in. Graph stats after update: 6220 nodes, 11762 edges, 720 communities.
- Graphify queries used:
  - `opening.md ritual`
  - `closing.md ritual full-close optional steps`
  - `petey-plan.md tasks slated for next session`
  - `lineage editor route approved claim updateLineageNodeProfile media LineageNode`
  - `lineage node profile edit displayName bio promotionDate media`
- Files selected from Graphify and verified by direct reads:
  - `docs/rituals/opening.md`
  - `docs/rituals/closing.md`
  - `docs/protocols/petey-plan.md`
  - `docs/runbooks/graphify-repo-memory.md`
  - `docs/architecture/lineage/lineage-public-viewer-editor-routes.md`
  - `docs/architecture/lineage/lineage-claim-workflow-evidence-review.md`
  - `docs/runbooks/lineage-listing-runbook.md`
  - `apps/web/server/web/lineage/claim-actions.ts`
  - `apps/web/server/web/lineage/queries.ts`
  - `apps/web/prisma/schema.prisma`

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `userActionClient`, App Router authenticated page pattern, React Hook Form + Zod form pattern, `FormMedia` upload helper, existing lineage query/action shape. |
| Extension or replacement | Extension. Adds a claimant-scoped lineage editor route and action on top of the approved-claim flow from SESSION_0183. |
| Why justified | SESSION_0183 staged the editor route as the next task; approved claim status is currently the proof of node ownership. |
| Risk if bypassed | Approved claimants would have no way to update profile content, and the claim review workflow would stop at an inert status flag. |

## Petey plan

### Goal

Ship an approved-claim node-profile editor that lets the claimant update display name, lineage bio, avatar/media URL, and selected promotion date without granting whole-tree edit rights.

### Tasks

#### TASK_01 — Cody: Node profile schema, query, and server action

- **Agent:** Cody
- **What:** Create lineage node-profile schema/query/action files using `userActionClient`.
- **Steps:**
  1. Add `updateLineageNodeProfileSchema` for `treeId`, `nodeId`, `displayName`, `bio`, `avatarUrl`, and optional `promotionDate`.
  2. Add a claimant-scoped query for `/lineage/[treeSlug]/edit/[nodeId]`.
  3. Add `updateLineageNodeProfile` with brand gate and APPROVED claim ownership check.
  4. Update `Passport.displayName`, `Passport.avatarUrl`, `LineageNode.bio`, and the member's selected `RankAward.awardedAt` when present.
- **Done means:** Action and query compile, enforce brand + approved-claim ownership, and revalidate the public/editor lineage paths.
- **Depends on:** Nothing.

#### TASK_02 — Cody: Claimant editor route and form

- **Agent:** Cody
- **What:** Create `/lineage/[treeSlug]/edit/[nodeId]` page plus a client form.
- **Steps:**
  1. Auth-gate the page with existing session redirect pattern.
  2. Load the editable profile by brand, slug, node id, and current user.
  3. Render Dirstarter primitives for display name, bio, avatar/media URL, and promotion date.
  4. Submit through `updateLineageNodeProfile`, show toast feedback, and refresh.
- **Done means:** Approved claimant can open the route and save profile updates.
- **Depends on:** TASK_01.

#### TASK_03 — Cody: Integration tests

- **Agent:** Cody
- **What:** Add DB-backed tests for ownership and field update behavior.
- **Steps:**
  1. Happy path: APPROVED claimant updates display name, bio, avatar URL, and selected promotion date.
  2. Guard: PENDING claim does not authorize editing.
  3. Guard: brand mismatch does not authorize editing.
  4. Guard: node must belong to the requested tree.
- **Done means:** Focused lineage node-profile tests pass.
- **Depends on:** TASK_01.

#### TASK_04 — Doug: Verification and close review

- **Agent:** Doug
- **What:** Run focused lineage tests, scoped typecheck, wiki lint, hostile close review, and full-close evidence.
- **Steps:**
  1. Run new node-profile tests.
  2. Run existing lineage claim/review/query tests touched by the flow.
  3. Run scoped typecheck for lineage/profile files.
  4. Run `bun run wiki:lint` during close.
  5. Record findings in project log and SESSION file.
- **Done means:** Verification is recorded with exact commands/results and unresolved findings.
- **Depends on:** TASK_01, TASK_02, TASK_03.

### Parallelism

TASK_01 is the critical path. TASK_02 can start from the agreed action/query contract after TASK_01 shape is known. TASK_03 can proceed in parallel with TASK_02 once the action contract is fixed. TASK_04 is sequential after implementation.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Backend/action work with clear auth and data contracts. |
| TASK_02 | Cody + Desi review | Form route uses existing Dirstarter primitives; UX must stay utilitarian. |
| TASK_03 | Cody | Direct DB-backed lineage test pattern already exists. |
| TASK_04 | Doug + Giddy | Verification, hostile close review, git hygiene, and protocol compliance. |

### Open decisions

- Promotion date maps to `LineageTreeMember.selectedRankAward.awardedAt` when the member has a selected rank award. This session will not create rank awards or promotion records.
- Media in this slice maps to `Passport.avatarUrl` through the existing `FormMedia` URL/upload helper. This session will not create `Media` database rows.
- Approved claim remains the ownership proof. This session will not add `claimedByUserId` to `LineageNode`.

### Risks

- SESSION_0183 did not transfer placeholder node ownership on approval, so every authorization check must use `LineageClaimRequest.status = APPROVED`.
- The architecture route spec also names a broader `/dashboard/lineage/[treeId]` editor. This session intentionally implements only the claimant node-profile route staged by SESSION_0183.
- Existing lineage action tests often exercise direct DB logic rather than the full safe-action middleware chain; verification must be honest about that boundary.

### Scope guard

No whole-tree editor, no visual group controls, no promotion modal, no ACL grant/revoke UI, no Stripe tiering, no email notifications, no schema changes.

### Dirstarter implementation template

- **Docs read first:** Dirstarter live docs not required; this touches local Dirstarter-derived form/action patterns, not a new upstream-owned integration layer.
- **Baseline pattern to extend:** `userActionClient`, `/lineage/[treeSlug]/claim` auth gate, `PassportEditor` + `FormMedia`, lineage query/action/test files.
- **Custom delta:** Approved lineage claim gates claimant edit rights for one node.
- **No-bypass proof:** Uses existing safe-action/session/brand primitives and existing media URL upload helper; no parallel auth, upload, or admin system.

## Pre-flight: Backend — Lineage node profile editor

### 1. Auth predicates planned

- [x] Session auth required
- [ ] Org membership verified
- [x] Brand column filtered (ADR 0004)
- Authorization approach: `userActionClient` session + request brand + tree brand/slug + node membership + APPROVED `LineageClaimRequest` for current user.

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: no; existing local action patterns were sufficient and directly loaded.
- Searched via Graphify for: `lineage editor route approved claim updateLineageNodeProfile media LineageNode`
- Related existing actions: `submitLineageClaimRequest`, `reviewLineageClaim`, `updatePassport`
- L1 pattern match: Dirstarter safe-action client chain through `userActionClient`.

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: Auth + brand context flow (web)
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage: claim approved → profile ownership/editing

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0006/FS-0007 protocol enforcement, FS-0008 schema spot-check rigor, close-step drift pattern.
- Manual Boundary Registry entries: not loaded; no known active boundary blocks this node-profile slice.

## Pre-flight: LineageNodeProfileForm

### 1. Existing component scan

- Searched with Graphify for: `lineage node profile edit displayName bio promotionDate media`
- Found: `apps/web/app/(web)/lineage/[treeSlug]/claim/claim-form.tsx`, `apps/web/app/(web)/me/passport-editor.tsx`, `apps/web/components/common/form-media.tsx`, `apps/web/app/(web)/dashboard/profile-form.tsx`

### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: no, Graphify/direct local form patterns selected the component set.
- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md` alignment URLs: no live docs needed for local form composition.
- Searched Dirstarter template: no, existing repo forms already use Dirstarter primitives.
- Closest L1 pattern: `PassportEditor` + `LineageClaimForm`.
- Primitive API spot-check:
  - `Button`: supports `type`, `variant`, `size`, `isPending`, `disabled`, `prefix`, children.
  - `Input`: standard input props.
  - `TextArea`: standard textarea props plus `rows`.
  - `FormMedia`: props `form`, `field`, `path`, optional `fetchType`, optional `websiteUrl`.

### 3. Composition decision

- [ ] Extending existing component: none
- [x] Composing existing components: `Form`, `FormField`, `Input`, `TextArea`, `FormMedia`, `Button`, `Stack`, `Note`
- [ ] New component, no L1 match exists: N/A

### 4. Lane docs loaded

- [x] Prior SESSION "Next session" section read
- [x] Wiki entries for target area read: lineage route spec and claim workflow spec
- [x] Runbook consulted: `docs/runbooks/lineage-listing-runbook.md`

### 5. Dev environment confirmed

- Dev server command: not started; server not needed for DB-backed implementation tests.
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: `BASELINE_MARTIAL_ARTS` via mocked `getRequestBrand`

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0001/FS-0008 L1/component and enum inspection skips.
- Mitigation acknowledged: yes — exact schema snippets and existing form primitives were read before writing code.

## Task Log

SESSION_0184_TASK_01, SESSION_0184_TASK_02, SESSION_0184_TASK_03, SESSION_0184_TASK_04

## What landed

1. **TASK_01 — Node profile schema/query/action:** Added `updateLineageNodeProfileSchema`, claimant-scoped editable-profile query, and `updateLineageNodeProfile` server action. The action uses `userActionClient`, request brand, tree membership, and APPROVED claim proof before updating the lineage node profile.
2. **TASK_02 — Claimant editor route + form:** Added `/lineage/[treeSlug]/edit/[nodeId]` with auth redirect, `notFound()` on unauthorized/no profile, and a compact form for display name, lineage bio, avatar/media URL, and selected promotion date.
3. **TASK_03 — Integration tests:** Added DB-backed node-profile tests covering approved-claim update, PENDING claim denial, brand mismatch denial, and node-not-in-tree denial.
4. **TASK_04 — Verification and full-close review:** Ran focused lineage tests, scoped typecheck filter, hostile close review, wiki index sweep, and full-close evidence.
5. **Bow-in hygiene:** Repaired SESSION_0183 YAML status from `in-progress` to `closed-quick` to match its body status and restore the closing atomicity contract.

## Files touched

- `apps/web/server/web/lineage/node-profile-schemas.ts` — new Zod schema for approved-claim node profile edits.
- `apps/web/server/web/lineage/node-profile-queries.ts` — new claimant-scoped editable profile read query.
- `apps/web/server/web/lineage/node-profile-actions.ts` — new server action and testable helper for profile updates.
- `apps/web/server/web/lineage/node-profile-actions.test.ts` — new DB-backed tests for the node-profile edit boundary.
- `apps/web/app/(web)/lineage/[treeSlug]/edit/[nodeId]/page.tsx` — new authenticated claimant editor page.
- `apps/web/app/(web)/lineage/[treeSlug]/edit/[nodeId]/_components/lineage-node-profile-form.tsx` — new client form using existing Dirstarter-derived primitives.
- `docs/sprints/SESSION_0183.md` — repaired YAML status to `closed-quick`.
- `docs/sprints/SESSION_0184.md` — current session record.
- `docs/protocols/project-log.md` — added SESSION_0184 task plan/review; corrected SESSION_0183 task statuses to complete.
- `docs/knowledge/wiki/index.md` — added SESSION_0181 through SESSION_0184 rows and bumped metadata.

## Decisions resolved

- Promotion date in this slice maps to the selected `LineageTreeMember.rankAwardId` record's `RankAward.awardedAt`; the action does not create a new rank award.
- Media in this slice maps to `Passport.avatarUrl` through the existing `FormMedia` URL/upload helper; no `Media` database row is created.
- Approved claim status remains the interim ownership proof for node-profile editing. Whole-tree editor rights and durable grants remain out of scope.

## Open decisions / blockers

- **SESSION_0184_FINDING_01:** Multiple APPROVED claims on the same tree/node can currently confer edit rights to multiple users. Next session should harden claim approval into a durable ownership/access model.
- **SESSION_0184_FINDING_02:** Tests exercise the exported helper and claimant query, not the full `next-safe-action` middleware wrapper. This matches nearby lineage tests but remains weaker than a true action invocation harness.
- Carried forward: SESSION_0178_FINDING_01 (app-wide typecheck baseline), SESSION_0182_FINDING_01 (zodResolver overload), SESSION_0180_FINDING_01 (sequential DB reads in viewer), SESSION_0180_FINDING_02 (LineageTreeAccess unused).

## Verification

| Check | Command | Result |
| --- | --- | --- |
| New node-profile tests | `cd apps/web && bun test --timeout 60000 server/web/lineage/node-profile-actions.test.ts` | 4 pass / 0 fail / 19 expect() |
| Combined lineage regression suite | `cd apps/web && bun test --timeout 60000 server/web/lineage server/admin/lineage` | 35 pass / 0 fail / 89 expect() |
| Scoped typecheck filter | `cd apps/web && set -o pipefail; bunx tsc --noEmit 2>&1 \| awk 'BEGIN{found=0} /node-profile\|lineage\\/\\[treeSlug\\]\\/edit\|lineage\\/node-profile/ { found=1; print } END { if (!found) print "NO_MATCHING_ERRORS" }'` | `NO_MATCHING_ERRORS`; full command exited 2 because the broader app typecheck baseline remains nonzero |
| Wiki lint | `bun run wiki:lint` | 0 errors / 501 warnings; warnings are repo-wide pre-existing lint debt |

## Task log

- SESSION_0184_TASK_01 — complete
- SESSION_0184_TASK_02 — complete
- SESSION_0184_TASK_03 — complete
- SESSION_0184_TASK_04 — complete

## Review log

- SESSION_0184_REVIEW_01 — hostile close review recorded in `docs/protocols/project-log.md`.
- SESSION_0184_FINDING_01 — medium, open: approved-claim-as-edit-right can produce multiple editors for one node.
- SESSION_0184_FINDING_02 — low, accepted-risk: helper/query tests do not invoke the full safe-action middleware wrapper.

## Hostile close review

- **Giddy verdict:** Plan was coherent for the staged task and stayed off the broader dashboard/tree editor. Branching from SESSION_0183 was correct because this work depends on the claim-review commit. The main merge risk is not code shape; it is the still-interim ownership model.
- **Doug verdict:** Focused DB-backed tests prove the new helper/query boundary and regression lineage suite is green. The verification is honest that safe-action middleware itself is not directly invoked and full app typecheck still has an existing nonzero baseline.
- **Dirstarter docs check:** live docs checked.
- **Sources:** <https://dirstarter.com/docs/codebase/structure>, <https://dirstarter.com/docs/integrations/media>, <https://dirstarter.com/docs/integrations/storage>, <https://dirstarter.com/docs/database/prisma>, plus local `docs/architecture/dirstarter-baseline-index.md`.
- **WORKFLOW score:** 9.5/10. Dirstarter/local pattern alignment, lifecycle coverage, and tests are credible; score is held at 9.5 rather than higher because durable ownership/access semantics remain staged for the next session.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. This session did not change schema or introduce a new domain term; it implemented the already-staged approved-claim node-profile editor slice.

## Reflections

- The useful constraint was refusing to expand into the full dashboard editor. That kept the slice small enough to verify.
- The risky assumption is still "APPROVED claim equals ownership." It is workable for this editor slice, but it should not become the long-term access model without a grant/transfer decision.
- Subagents wrote useful code but did not return final status before shutdown. The practical fix was to review their files directly and integrate locally; future delegations should ask for smaller intermediate checkpoints.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked touched docs: `SESSION_0183.md`, `SESSION_0184.md`, `project-log.md`, `wiki/index.md`. Updated SESSION_0183 status; SESSION_0184 has JETTY frontmatter; wiki index metadata bumped to 2026-05-17 / `codex-session-0184`. |
| Backlinks/index sweep | Added SESSION_0181 through SESSION_0184 rows to `docs/knowledge/wiki/index.md`; no new cross-reference pairs needed beyond SESSION_0184 frontmatter. |
| Wiki lint | `bun run wiki:lint` returned 0 errors / 501 warnings; warnings are repo-wide pre-existing lint debt, not introduced as blocking errors by this session. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0184_REVIEW_01 recorded in project log with two findings. |
| Review & Recommend | Next session goal written below. |
| Memory sweep | No operator memory update needed; session-scoped ownership caveat is captured as SESSION_0184_FINDING_01 and next-session goal. |
| Next session unblock check | Unblocked: next session can start from `claim-review-actions.ts`, `node-profile-actions.ts`, and lineage claim workflow docs. |
| Git hygiene | Final branch/status/commit proof reported in bow-out response after git hygiene. |
| Graphify update | Final node/edge/community count reported in bow-out response after git hygiene. |

## Next session

- **Goal:** Harden lineage claim approval into durable node ownership/access rights.
- **Inputs to read:** `docs/architecture/lineage/lineage-claim-workflow-evidence-review.md`, `docs/runbooks/lineage-listing-runbook.md` §Approval rule + §Editor flow, `apps/web/server/admin/lineage/claim-review-actions.ts`, `apps/web/server/web/lineage/node-profile-actions.ts`, `apps/web/prisma/schema.prisma` (`LineageClaimRequest`, `LineageTreeAccess`, `LineageNode`).
- **First task:** Petey plan whether APPROVED `LINEAGE_NODE` claims should transfer `LineageNode.userId`, create a `LineageTreeAccess` `NODE_EDITOR` grant, or both; then update `reviewLineageClaim` and editor authorization accordingly with tests.

## Status

closed-full
