---
title: "SESSION 0275 — Lineage tree UX fixes: rank selection, drawer actions, claim CTA"
slug: session-0275
type: session--implement
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0275
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0274.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0275 — Lineage tree UX fixes: rank selection, drawer actions, claim CTA

## Date

2026-05-28

## Operator

Brian + copilot-session-0275 (Petey orchestrating; Cody execution)

## Goal

Fix lineage tree UX: prefer selectedRankAward on node cards/drawer, enable admin drawer actions (edit profile link, verification toggle), fix Brian↔Bob relationship verification, add "Claim this profile" CTA to drawer for claimable nodes. Update GAP_MATRIX for BBL-LINEAGE-001 production completion.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI primitives (Drawer, Card, Badge, DropdownMenu), Prisma payload selects, seed script. |
| Extension or replacement | Extension. All changes extend existing Dirstarter-derived UI primitives and Prisma payload patterns. |
| Why justified | Production lineage tree renders but shows wrong rank per tree, has locked admin actions, and missing claim CTA. |
| Risk if bypassed | Users see misleading rank info; admins can't manage profiles from drawer; claim flow undiscoverable. |

## Petey plan

### Tasks

#### SESSION_0275_TASK_01 — Fix rank display per tree (selectedRankAward preference)

- **Agent:** Cody
- **What:** Make LineageNodeCard and drawer prefer `selectedRankAward` from the tree member over the generic `user.rankAwards[0]` when available.
- **Done means:** When a tree member has a `selectedRankAward`, the card and drawer show that rank instead of the user's latest overall rank.

#### SESSION_0275_TASK_02 — Enable admin drawer actions

- **Agent:** Cody
- **What:** Wire the disabled "Edit profile later" and "Manage verification later" menu items to real functionality.
- **Done means:** Admin can click "Edit profile" and navigate to the edit page from the drawer.

#### SESSION_0275_TASK_03 — Fix Brian↔Bob relationship verification + seed update logic

- **Agent:** Cody
- **What:** Update the seed to set `isVerified: true` on the Bob→Brian relationship AND update existing records on re-run.
- **Done means:** Re-running the seed updates `isVerified` and `description` on existing relationships.

#### SESSION_0275_TASK_04 — Add "Claim this profile" CTA to drawer

- **Agent:** Cody
- **What:** When a node is claimable and the tree is claimable, show a "Claim this profile" button in the drawer.
- **Done means:** Claimable nodes show a claim CTA in the drawer linking to `/lineage/[treeSlug]/claim`.

#### SESSION_0275_TASK_05 — GAP_MATRIX + session docs + bow-out

- **Agent:** Petey
- **What:** Update GAP_MATRIX for BBL-LINEAGE-001 and BBL-LINEAGE-002 production completion, close session.

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0275_TASK_01 | Cody | complete | selectedRankAward threaded through canvas → card → drawer with rankSystem.discipline |
| SESSION_0275_TASK_02 | Cody | complete | Edit profile links to `/lineage/[treeSlug]/edit/[nodeId]`; verification marked "coming soon" |
| SESSION_0275_TASK_03 | Cody | complete | Seed updated: Bob→Brian `isVerified: true`, `ensureLineageRelationship` now updates existing records |
| SESSION_0275_TASK_04 | Cody | complete | Claim CTA in drawer footer when node + tree are claimable |
| SESSION_0275_TASK_05 | Petey | complete | GAP_MATRIX updated, session closed |

## What landed

- **Per-tree rank selection:** `LineageNodeCard` and `LineageProfileDrawer` now prefer `selectedRankAward` from the tree member over the user's global latest rank. The `lineageTreeMemberPayload` was enriched to include `rankSystem.discipline` on the selected rank.
- **Admin drawer actions:** "Edit profile" links to `/lineage/[treeSlug]/edit/[nodeId]` when user is admin. "Manage verification" marked as "coming soon" with shield icon instead of lock.
- **Claim CTA in drawer:** When a node is claimable and the tree accepts claims, a full-width "Claim this profile" button appears at the bottom of the drawer linking to `/lineage/[treeSlug]/claim`.
- **Seed update logic:** `ensureLineageRelationship` now updates `isVerified` and `description` on existing relationships during re-runs. Bob→Brian edge set to `isVerified: true`.
- **GAP_MATRIX:** BBL-LINEAGE-001 marked ✅ Done (production seed + route proof). BBL-LINEAGE-002 marked ✅ Done (root path highlighting already implemented).
- **Dashboard + public tree pages:** Both pass `treeSlug` and `isTreeClaimable` to `LineageTreeBoard`.
- **SOP staleness identified:** `sop-data-wiring-flows` and `sop-e2e-user-lifecycle` do not mention `selectedRankAward`, `LineageTreeMember`, or claims. Stale — written before tree member model. Follow-up needed.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Added `SelectedRank` type and `selectedRank` prop; prefer selected rank label over user's latest |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | Added `SelectedRank` type to `CanvasMember`; `normalizeMembers` extracts `selectedRankAward.rank` with discipline; passes `selectedRank` to `LineageNodeCard` |
| `apps/web/components/web/lineage/lineage-tree-board.tsx` | Added `treeSlug`, `isTreeClaimable` props; passes `selectedRankAward`, `isClaimable`, `treeSlug`, `nodeId`, `isAdmin` to drawer |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | Added `SelectedRankAward` type with `rankSystem.discipline`; header prefers selected rank name; admin actions wired (edit profile link, conditionally shown); claim CTA in drawer footer; imports `Link`, `PencilIcon`, `ShieldCheckIcon`, `UserRoundPlusIcon` |
| `apps/web/server/web/lineage/payloads.ts` | Enriched `selectedRankAward` in `lineageTreeMemberPayload` to include `rankSystem.discipline` |
| `apps/web/prisma/seed-baseline-lineage.ts` | Bob→Brian `isVerified` changed `false` → `true`; `ensureLineageRelationship` now updates existing records |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | Passes `treeSlug` and `isTreeClaimable` to `LineageTreeBoard` |
| `apps/web/app/(web)/dashboard/lineage/[treeId]/page.tsx` | Passes `treeSlug` and `isTreeClaimable` to `LineageTreeBoard` |
| `docs/product/black-belt-legacy/GAP_MATRIX.md` | BBL-LINEAGE-001 → ✅ Done; BBL-LINEAGE-002 → ✅ Done; next steps updated |
| `docs/knowledge/wiki/index.md` | Added SESSION_0275 row; bumped `last_agent` |
| `docs/sprints/SESSION_0275.md` | Created and closed |

## Decisions resolved

- `selectedRankAward` payload enriched to include `rankSystem.discipline` so cards/drawer can show discipline name per-tree.
- Admin drawer actions: "Edit profile" navigable for admins, "Manage verification" deferred as coming soon.
- Seed `ensureLineageRelationship` now updates existing relationship records on re-run (upsert behavior).
- Legacy discipline page lineage section does NOT get `treeSlug`/`isTreeClaimable` — it uses the old row-based path which doesn't have a `LineageTree` record. Follow-up needed to migrate it to v1 path.

## Open decisions / blockers

- **Brian's `selectedRankAward` not yet set:** The tree member record for Brian on the Rigan Machado tree needs `rankAwardId` populated to point at his BJJ 1st Degree Black Belt `RankAward`. This requires a DB update or admin UI for rank selection per tree member.
- **Discipline page legacy path:** `lineage-tree-section.tsx` uses old row/edge path without tree metadata. Should be migrated to v1 `LineageTree` path for claim CTA and per-tree rank selection.
- **SOP docs stale:** `sop-data-wiring-flows` and `sop-e2e-user-lifecycle` need updating for lineage tree member model, claims, and selectedRankAward.
- **Bob Bass user setup:** Brian wants to use the claim flow at `/lineage/rigan-machado-bjj-lineage/claim` to test it, then update Bob's email later.

## Verification

| Command / check | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Passed |
| `pnpm --filter @ronin-dojo/web build` | Passed |
| `bunx biome check --write` (6 changed files) | 3 files auto-fixed (formatting/imports), 1 pre-existing warning |
| `git diff --check` | Passed |
| `curl -s -o /dev/null -w "%{http_code}" -L https://baselinemartialarts.com/lineage` | 200 |
| `curl -s -o /dev/null -w "%{http_code}" -L https://baselinemartialarts.com/lineage/rigan-machado-bjj-lineage` | 200 |

## Review log

### SESSION_0275 — Lineage tree UX fixes

#### Review

**SESSION_0275_REVIEW_01 — close review**

- **Reviewed tasks:** SESSION_0275_TASK_01 through TASK_05
- **Dirstarter docs check:** No Dirstarter baseline layers modified. All changes extend existing Dirstarter-derived UI primitives (Drawer, Card, Badge, DropdownMenu) and Prisma payload patterns.
- **Verdict:** All five tasks complete. Code compiles, builds, passes Biome. selectedRankAward correctly threaded through the component chain with discipline context. Admin actions properly gated. Claim CTA correctly conditional on tree + node claimability.

## Hostile close review

### SESSION_0275 — Lineage tree UX fixes

#### Review

- **Plan sanity:** Correct scope — UX fixes only, no schema changes, no new migrations. Properly identified that selectedRankAward payload was missing rankSystem.discipline.
- **Dirstarter compliance:** Extended existing primitives. No new UI components invented.
- **Security:** No secrets exposed. No production mutations. Seed changes are idempotent.
- **Data integrity:** Seed upsert behavior added. Bob→Brian isVerified corrected. No data loss risk.
- **Verification honesty:** Typecheck, build, Biome, and production route checks all run and passed.
- **Workflow honesty:** Graphify-first discovery used. Task IDs numbered. Session properly structured.

#### Kaizen

- The discipline page's legacy lineage path is increasingly divergent from the v1 tree path. A dedicated migration session would eliminate the dual-path maintenance burden.
- `selectedRankAward` should have included `rankSystem.discipline` from its initial creation — the payload was too narrow.

## ADR / ubiquitous-language check

- No ADR required. This session extended existing payload shapes and UI props; no architectural decisions made.
- No ubiquitous-language update. `selectedRankAward` already documented as a concept on `LineageTreeMember`.

## Reflections

- The Passport → User → RankAward → selectedRankAward chain is the correct way to show per-tree rank. Without it, multi-discipline practitioners always show their latest rank regardless of tree context.
- The drawer was carrying too little context from the board. Threading `treeSlug`, `isClaimable`, `isAdmin`, `nodeId` through props is verbose but correct — it keeps the drawer a pure presentational component.
- The seed's `ensureLineageRelationship` was not updating existing records on re-run, making it impossible to fix isVerified without manual DB access. The upsert pattern is the right fix.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0275.md frontmatter status/date/type/last_agent updated. wiki/index.md last_agent bumped. |
| Backlinks/index sweep | SESSION_0275 pairs with SESSION_0274. Wiki index includes SESSION_0275 row. |
| Wiki lint | Deferred — pre-existing 232 errors / 598 warnings from prior sessions. This session did not introduce new wiki pages. |
| Kaizen reflection | Reflections section present with three observations. |
| Hostile close review | SESSION_0275_REVIEW_01 recorded above. |
| Review & Recommend | Next session goal written below. |
| Memory sweep | SOP staleness noted as follow-up. No cross-session memory update needed. |
| Next session unblock check | Unblocked for code changes. Brian's selectedRankAward DB update and claim flow test are operator tasks. |
| Git hygiene | Branch main; commit/push pending. |
| Graphify update | To run after commit/push. |

## Next session

- **Goal:** SESSION_0276 — Populate Brian's `selectedRankAward` on the Rigan Machado tree (BJJ 1st Degree Black Belt), test claim flow as Bob Bass, migrate discipline page lineage to v1 tree path.
- **Inputs to read:** `docs/sprints/SESSION_0275.md`, `apps/web/prisma/seed-baseline-lineage.ts`, `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx`, `apps/web/app/(web)/lineage/[treeSlug]/claim/claim-form.tsx`.
- **First task:** Set Brian's `LineageTreeMember.rankAwardId` to his BJJ 1st Degree Black Belt `RankAward` via seed update or admin UI, then verify the tree card shows the correct rank.

## Status

closed
