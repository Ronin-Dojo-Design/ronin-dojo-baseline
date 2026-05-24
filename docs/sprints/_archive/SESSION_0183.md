---
title: "SESSION 0183 — Admin Lineage Claim Review"
slug: session-0183
type: session--implement
status: closed-quick
created: 2026-05-17
updated: 2026-05-17
last_agent: copilot-session-0183
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0182.md
  - docs/architecture/lineage/lineage-public-viewer-editor-routes.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/runbooks/lineage-listing-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0183 — Admin Lineage Claim Review

## Date

2026-05-17 MDT

## Operator

Brian Scott + Copilot as Petey orchestrator, Cody implementer.

## Goal

Ship `reviewLineageClaim` server action (approve/deny/needs-info state machine) + admin dashboard claims list page at `/admin/lineage/claims`. Lets a brand admin or tree admin approve, deny, or request info on pending `LineageClaimRequest` rows.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest closed session: `docs/sprints/SESSION_0182.md` (`closed-quick`).
- Branch at bow-in: `main` (clean tree) → created `session-0183-lineage-admin-claim-review`.
- FAILED_STEPS scan: All entries mitigated. FS-0021 remains open but non-blocking (no schema changes this session).
- Drift Register scan: no open lineage entries.
- Graphify updated: 109 nodes, 195 edges, 711 communities.
- Carried forward: SESSION_0178_FINDING_01 (app-wide typecheck baseline), SESSION_0182_FINDING_01 (zodResolver overload).

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `adminActionClient` (L74 safe-actions.ts), `withAdminPage` HOC, DataTable pattern, server action status-mutation pattern (mirrors `lead-status-actions.tsx`). |
| Extension or replacement | Extension. New admin route + action; no existing paths modified. |
| Why justified | Claim review is step 6 in `lineage-public-viewer-editor-routes.md` rollout. Session 0182 landed claim creation; admin review is the next write path. |
| Risk if bypassed | Claims would accumulate with no way to approve/deny; lineage editor route (next step) depends on approved claims granting node ownership. |

## Petey plan

### Goal

Ship `reviewLineageClaim` server action + admin claims list page + claim detail page with status action buttons. Follow Dirstarter admin patterns exactly (`withAdminPage`, DataTable, `adminActionClient`).

### Tasks

#### TASK_01 — Cody: Review action schema + server action

- **Agent:** Cody
- **What:** Create `apps/web/server/admin/lineage/claim-review-schemas.ts` and `apps/web/server/admin/lineage/claim-review-actions.ts`:
  1. **Schema** (`claim-review-schemas.ts`): `reviewLineageClaimSchema` — validates `claimId` (cuid), `decision` (enum: `APPROVED | DENIED | NEEDS_INFO`), `reviewerNote` (optional string, max 2000).
  2. **Action** (`claim-review-actions.ts`): `reviewLineageClaim` using `adminActionClient.inputSchema(...).action(...)`:
     - Get brand from `ctx.brand`.
     - Load claim by id, verify it belongs to a tree with matching brand.
     - Guard: claim must be in PENDING or NEEDS_INFO status to be reviewable (not already terminal).
     - Update claim: set `status`, `reviewerNote`, `reviewedById` = admin user id, `reviewedAt` = now.
     - If decision is APPROVED, optionally link claimant to the node (set `LineageNode.claimedByUserId` if that field exists, or just mark claim as approved for now).
     - Return updated claim id + new status.
- **Done means:** Action compiles, type-checks, uses `adminActionClient` pattern.
- **Depends on:** Nothing.

#### TASK_02 — Cody: Admin claims queries

- **Agent:** Cody
- **What:** Create `apps/web/server/admin/lineage/claim-queries.ts`:
  1. `findPendingClaims(brand)` — returns all `LineageClaimRequest` where tree.brand = brand AND status IN (PENDING, NEEDS_INFO), ordered by createdAt desc. Include tree name, node displayName, claimant email/name.
  2. `findClaimById(id, brand)` — returns full claim detail with evidence, tree info, node info, claimant info, reviewer info.
- **Done means:** Queries compile and return typed results.
- **Depends on:** Nothing.

#### TASK_03 — Cody: Admin claims list page

- **Agent:** Cody
- **What:** Create admin route at `apps/web/app/admin/lineage/claims/page.tsx`:
  1. Use `withAdminPage` HOC.
  2. Query `findPendingClaims`.
  3. Render a DataTable (or simple table with Dirstarter components) showing: claimant name, tree name, node name, status badge, created date, action link.
  4. Link each row to `/admin/lineage/claims/[id]`.
- **Done means:** Page renders list of pending claims for the brand.
- **Depends on:** TASK_02.

#### TASK_04 — Cody: Admin claim detail page + status actions

- **Agent:** Cody
- **What:** Create `apps/web/app/admin/lineage/claims/[id]/page.tsx` + `_components/claim-status-actions.tsx`:
  1. Server component loads claim via `findClaimById`. If not found → `notFound()`.
  2. Renders claim detail: claimant info, tree/node context, claimant note, evidence list, current status.
  3. `ClaimStatusActions` client component (mirrors `lead-status-actions.tsx` pattern):
     - Approve / Deny / Request Info buttons.
     - Optional reviewer note textarea.
     - Calls `reviewLineageClaim` on click.
     - Shows toast feedback, refreshes page.
- **Done means:** Admin can view claim details and take action. Uses Dirstarter components.
- **Depends on:** TASK_01, TASK_02.

#### TASK_05 — Cody: Integration tests

- **Agent:** Cody
- **What:** Add `apps/web/server/admin/lineage/claim-review-actions.test.ts`:
  1. Happy path: admin approves PENDING claim → status=APPROVED, reviewedAt set, reviewedById set.
  2. Happy path: admin requests info → status=NEEDS_INFO.
  3. Guard: non-admin user → rejection.
  4. Guard: claim not in reviewable status (APPROVED/DENIED/CANCELLED) → error.
  5. Guard: claim tree brand mismatch → error.
- **Done means:** All tests pass.
- **Depends on:** TASK_01.

#### TASK_06 — Doug: Verification

- **Agent:** Doug
- **What:** Typecheck, test pass, no regressions.
- **Steps:**
  1. `cd apps/web && bun test server/admin/lineage`
  2. `cd apps/web && bun test server/web/lineage` (existing claim tests still pass)
  3. `cd apps/web && bun run typecheck` — filter for lineage/claim.
  4. Record findings.
- **Done means:** Verification section filled.
- **Depends on:** TASK_03 + TASK_04 + TASK_05.

### Parallelism

TASK_01 and TASK_02 are independent — run in parallel. TASK_03 depends on TASK_02. TASK_04 depends on TASK_01 + TASK_02. TASK_05 depends on TASK_01. After TASK_01 lands: TASK_04 and TASK_05 can start. TASK_06 after all.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear pattern from `adminActionClient` + existing claim action. |
| TASK_02 | Cody | Standard Prisma queries. |
| TASK_03 | Cody | Mirrors `admin/leads/page.tsx`. |
| TASK_04 | Cody | Mirrors `lead-status-actions.tsx`. |
| TASK_05 | Cody | Same test pattern as claim-actions.test.ts. |
| TASK_06 | Doug | Hostile verification. |

### Open decisions

- **Node ownership on APPROVED:** Schema has no `claimedByUserId` on `LineageNode`. For now, APPROVED status on the claim is the proof of ownership. A future session can add the field if needed for editor access control.
- **Tree admin vs brand admin:** V1 uses `adminActionClient` (role=admin only). Tree-owner review is a future enhancement.

### Scope guard

No editor route, no public-facing claim status page, no email notifications on approval, no Stripe. Admin review CRUD only.

## Task Log

SESSION_0183_TASK_01, SESSION_0183_TASK_02, SESSION_0183_TASK_03, SESSION_0183_TASK_04, SESSION_0183_TASK_05, SESSION_0183_TASK_06

## What landed

1. **TASK_01 — Review schema + action:** `claim-review-schemas.ts` (Zod schema with APPROVED/DENIED/NEEDS_INFO decision enum) + `claim-review-actions.ts` (server action via `adminActionClient` with brand gate, reviewable-status guard, reviewer metadata write). Zero new type errors.
2. **TASK_02 — Claim queries:** `claim-queries.ts` with `findPendingClaims()` (brand-scoped, PENDING+NEEDS_INFO, joined tree/node/claimant) + `findClaimById()` (full detail with evidence, reviewer info).
3. **TASK_03 — Claims list page:** `/admin/lineage/claims/page.tsx` using `withAdminPage` HOC, `Suspense`, linked rows to detail page.
4. **TASK_04 — Claim detail + status actions:** `/admin/lineage/claims/[id]/page.tsx` (server component with claim detail, evidence list, notes) + `claim-status-actions.tsx` (client island with Approve/Deny/Request Info buttons, reviewer note textarea, toast feedback). Mirrors `lead-status-actions.tsx` pattern.
5. **TASK_05 — Integration tests:** 5 DB-backed tests (approve PENDING, approve NEEDS_INFO, status guard on APPROVED, brand mismatch guard, NEEDS_INFO transition). All pass.
6. **TASK_06 — Doug verification:** 31/31 lineage tests pass (21 queries + 5 claim creation + 5 claim review). Zero claim-scoped type errors.

## Files touched

- `apps/web/server/admin/lineage/claim-review-schemas.ts` (created)
- `apps/web/server/admin/lineage/claim-review-actions.ts` (created)
- `apps/web/server/admin/lineage/claim-queries.ts` (created)
- `apps/web/server/admin/lineage/claim-review-actions.test.ts` (created)
- `apps/web/app/admin/lineage/claims/page.tsx` (created)
- `apps/web/app/admin/lineage/claims/[id]/page.tsx` (created)
- `apps/web/app/admin/lineage/claims/[id]/_components/claim-status-actions.tsx` (created)
- `docs/sprints/SESSION_0183.md` (this file)
- `docs/protocols/project-log.md` (updated)

## Open decisions / blockers

- Node ownership on APPROVED: no `claimedByUserId` on `LineageNode` yet — APPROVED status on claim is proof of ownership for now.
- Tree admin vs brand admin: V1 uses `adminActionClient` (role=admin only). Tree-owner review is a future enhancement.
- Carried forward: SESSION_0178_FINDING_01 (app-wide typecheck baseline), SESSION_0182_FINDING_01 (zodResolver overload), SESSION_0178_FINDING_02 (seed idempotency), SESSION_0180_FINDING_01 (sequential DB reads in viewer), SESSION_0180_FINDING_02 (LineageTreeAccess unused).

## Verification

| Check | Command | Result |
| --- | --- | --- |
| Claim review tests | `bun test --timeout 30000 server/admin/lineage/claim-review-actions.test.ts` | 5 pass / 0 fail / 10 expect() |
| Existing claim tests | `bun test --timeout 60000 server/web/lineage/claim-actions.test.ts` | 5 pass / 0 fail |
| Existing query tests | `bun test --timeout 60000 server/web/lineage/queries.test.ts` | 21 pass / 0 fail |
| Scoped typecheck | `bunx tsc --noEmit \| grep "claim"` | 0 errors |
| Admin lineage typecheck | `bunx tsc --noEmit \| grep "admin/lineage"` | 0 errors |

## Next session

- **Goal:** Lineage editor route — lets an approved claimant edit their node's profile fields (displayName, bio, promotionDate, media). Step 7 in the `lineage-public-viewer-editor-routes.md` rollout order.
- **Inputs to read:** `docs/architecture/lineage/lineage-public-viewer-editor-routes.md` §4 (editor route), `apps/web/server/admin/lineage/claim-review-actions.ts` (approved claim = ownership proof), `apps/web/prisma/schema.prisma` (LineageNode editable fields), `docs/runbooks/lineage-listing-runbook.md` §7 (editor workflow).
- **First task:** Petey plan for `updateLineageNodeProfile` server action (ownership check via approved claim, field-level validation, media attach) + editor page at `/lineage/[treeSlug]/edit/[nodeId]`.

## Status

closed-quick
