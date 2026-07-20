---
title: "SESSION 0457 — Operator-gated lineage Phase A: land Brian Truelson (WL-P2-21 clone cleanup → FI-001 send)"
slug: session-0457
type: session--open
status: closed
created: 2026-06-27
updated: 2026-06-27
last_agent: claude-session-0457
sprint: S46
pairs_with:

  - docs/sprints/SESSION_0456.md
  - docs/petey-plan-0457-operator-gated-lineage.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0457 — Operator-gated lineage Phase A: land Brian Truelson

## Date

2026-06-27

## Operator

Brian + claude-session-0457

## Goal

Execute **Phase A** of the operator-gated lineage lane
(`docs/petey-plan-0457-operator-gated-lineage.md`) — land Brian Truelson, the P0 first tester.
**Slice A1 = WL-P2-21:** audit FULL prod published-trees against PROD, remove the 2 leftover
unpublished `rigan-machado-bjj-lineage` clone trees + Brian's redundant clone memberships
(dry-run → operator go → `--apply` with JSON backup), then re-verify the claim resolves. **Slice
A2 = FI-001:** one proven test-send to `ronindojodesign@gmail.com` (teardown: DELETE the
`LineagePendingClaim`, never `--reset`), then the operator-gated real send to `btruelson@gmail.com`.
**NOT autonomous** — operator gates every prod mutation, email send, and push. Verify against PROD,
never the prodsnap.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0456.md`
- Carryover: 0456 authored `petey-plan-0457` and handed off this exact lane. The autonomous
  paydown (`petey-plan-0454`) is done (D-024, WL-P2-5/17/18 merged, flaky tools test fixed → #171).
  This session executes the operator-gated remainder Codex correctly refused to autonomize.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `91fc3090`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None — lineage is a fully custom Ronin domain (no Dirstarter L1 equivalent); A1/A2 are prod-data ops + a transactional email send. |
| Extension or replacement | N/A |
| Why justified | Lineage graph + claim loop is the BBL moat — no boilerplate analogue. |
| Risk if bypassed | N/A |

Live docs checked during planning: not applicable.

### Graphify check

- Graph status: current; stats at bow-in: 15244 nodes, 29901 edges, 2059 communities, 2420 files tracked.
- Queries used:
  - `lineage tree clone published membership prune consolidation` (A1)
- Files selected from graph (confirmed already in the plan):
  - `apps/web/scripts/send-bbl-truelson-thankyou.ts`
  - `apps/web/scripts/consolidate-rigan-machado-tree.ts`
  - `apps/web/server/web/lineage/claim-node-for-user.ts`
  - `apps/web/app/(web)/lineage/[treeSlug]/page.tsx`
- Verification note: opened each file directly; Graphify used as navigation, not proof.

### Grill outcome

2 forks resolved:

- **A1 scope = SURGICAL (operator, 2026-06-27).** The read-only coverage audit
  (`audit-clone-member-coverage.ts`) proved the 2 unpublished `rigan-machado-bjj-lineage` clones are
  NOT pure duplicates: each is the LAST tree placement for 4 founders missing from the canonical
  tree — **Carlos Gracie Sr, Carlos Gracie Jr, Erik Paulson, Rick Minter**. Wholesale tree deletion
  (the plan's literal wording) would orphan them. Operator chose to delete ONLY Brian's 2 redundant
  clone memberships; clones kept as inert unpublished residue. Founders-on-canonical is a separate
  Phase-B data-quality decision (logged below).
- **Removal = `remove-brian-clone-memberships.ts`** (not the planned `remove-residual-lineage-clones.ts`)
  — dynamic resolution, hard guard refusing any published tree, JSON backup + exact rollback.

### Drift logged

- Canonical published `rigan-machado-lineage` (77m) is MISSING the founding ancestors Carlos Gracie
  Sr/Jr, Erik Paulson, Rick Minter (they live only on the retired unpublished clones). Candidate for
  a Phase-B backfill + a drift-register row. Not actioned this session (operator deferred).

## Petey plan

### Goal

Land Brian Truelson as BBL's first non-admin tester: clean the residual clone-tree topology on prod
(A1), then deliver his claim magic-link + lifetime Elite comp (A2) — each prod op operator-gated.

### Tasks

#### SESSION_0457_TASK_01 — A1: audit prod published-trees + Brian's memberships (READ-ONLY)

- **Agent:** Petey → Cody
- **What:** Read-only audit against PROD: enumerate ALL `LineageTree` (BBL), their member counts +
  `isPublished`/`isClaimable`/root, and ALL of Brian's `LineageTreeMember` rows across trees.
- **Steps:** write `scripts/audit-residual-lineage-clones.ts` (no mutations); run vs PROD; show operator.
- **Done means:** audit table shows exactly the 2 unpublished clones + Brian's redundant memberships; operator sees it before any write.
- **Depends on:** nothing

#### SESSION_0457_TASK_02 — A1: remove residual clone trees + memberships (PROD MUTATION, gated)

- **Agent:** Cody (operator gates `--apply`) → Doug
- **What:** `scripts/remove-residual-lineage-clones.ts` — `--dry-run` → JSON backup → `--apply` → `--rollback`.
- **Steps:** dry-run → show operator → explicit "go" → `--apply` → re-run `send-bbl-truelson-thankyou.ts --verify` (PROD, CLAIMED).
- **Done means:** Brian has exactly ONE published membership; 2 clone trees removed; verify returns CLAIMED; WL-P2-21 + D-033 resolved.
- **Depends on:** SESSION_0457_TASK_01

#### SESSION_0457_TASK_03 — A2: FI-001 test-send confirmation + real send (gated)

- **Agent:** Cody (operator gates each send) → Doug
- **What:** one final test-send to `ronindojodesign@gmail.com` (teardown: DELETE the binding, never `--reset`), then real send to `btruelson@gmail.com`.
- **Steps:** `--verify` (PROD) → test `--send --to ronindojodesign@gmail.com` → teardown → real `--backfill` → `--send` → after sign-in `--grant` → Doug E2E.
- **Done means:** Brian receives the claim link; FI-001 → completed; ledger + POST_LAUNCH_SOT updated.
- **Depends on:** SESSION_0457_TASK_02 (clean topology before the real send)

### Parallelism

Fully **sequential** — prod data + live send on a single careful operator-gated thread (plan §
"Worktree / sub-agent parallelization": A1+A2 are not parallelizable). Phase B deferred.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0457_TASK_01 | Petey→Cody | grill prod-verify plan, then read-only audit |
| SESSION_0457_TASK_02 | Cody→Doug | gated prod mutation + re-verify |
| SESSION_0457_TASK_03 | Cody→Doug | gated sends + claim E2E |

### Open decisions

- Whether to **delete** the 2 unpublished clone trees vs keep-but-confirm — operator decides after audit.
- BBL-scoped Resend key for A2 — operator pastes inline one-shot at send time.

### Risks

- Prod data mutation (A1) — mitigated: dry-run + JSON backup + verify-vs-PROD + operator gates `--apply`; delete ONLY `isPublished=false` rows.
- Stale-binding trap (A2) — mitigated: teardown DELETEs the `LineagePendingClaim`, never `--reset` (SESSION_0444).

### Scope guard

- Phase B (WL-P2-22 board refactor, admin branch/subtree CRUD) is OUT — next session.
- Do NOT touch the published canonical `rigan-machado-lineage` tree or its members.
- No admin-CRUD build this session — A1 cleanup is the targeted script, not the chrome.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0457_TASK_01 | landed | Read-only PROD audit: 8 trees, Brian's 3 memberships, clone coverage (4 founders orphan-risk found) |
| SESSION_0457_TASK_02 | landed | Surgical removal of Brian's 2 clone memberships APPLIED to PROD (backup `/tmp/brian-clone-memberships-backup-1782576079629.json`); `--verify` → CLAIMED |
| SESSION_0457_TASK_03 | in-progress | FI-001 test-send DONE (mode B free-signup, from welcome@blackbeltlegacy.com, Resend id `8fe8b411-0896-41ab-87ea-e35e84f748c7`) — awaiting operator review → real send to btruelson (gated) |

## Next session

### Goal

**LEAD (operator, SESSION_0457): shared DB/ledger-backed AdminKanban (Loop-of-Loops P3)** — give Brian +
**Tony Hua** near-realtime *shared* visibility into session/ledger status. Today's board
(`apps/web/app/admin/task-board/`) is **localStorage-only / per-browser** → no sharing, no sync, nothing
flows from sessions. Then the **BBLApp feature-adaptation lane** (N1 verified combobox into the post-claim
wizard, N2 member-dashboard ports — read-and-translate, no Playwright port), and finally the gated FI-001
real send. Lift BBLApp behavior from `/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/`.

### Port approach (operator asked: full Playwright port vs read-and-translate)

**READ-AND-TRANSLATE — no full Playwright/pixel port.** Per the PWCC pipeline
(`component-porting-pipeline-ASCII.md`) the method is **features-not-pixels**: the old app is a React/Vite SPA
hitting a `/bbl/v1/*` Pods/WordPress REST API — an incompatible data layer, so a pixel/Playwright port has
no value. We translate the **features + behaviors + UX** (verified badges, belt-card wizard steps, billing
3-card, privacy toggles) into server-components / server-actions / Prisma. **Playwright/headless is the PROOF
GATE only** (render + behavior-parity in the target route), not the porting mechanism.

### Tasks

#### N0 — Shared DB/ledger-backed AdminKanban (LEAD — Tony + Brian visibility)

- **Why:** the current board (`apps/web/app/admin/task-board/` + `lib/task-board/use-task-board.ts` →
  `localStorageBoardStore`; **no DB model**) is per-browser localStorage — Tony can't see Brian's board and
  nothing syncs from sessions/ledgers. This is the Loop-of-Loops **P3** target
  (`docs/protocols/loop-of-loops-ledger-driven-sessions.md`).
- **Petey grill (decide first):** **(a) read-only ledger-projection MVP** — a server component that runs
  `scripts/ledger-backlog.ts`'s aggregation and renders shared, admin-gated cards grouped by ledger/status
  (ships Tony's visibility fastest, zero new write-model) **vs (b) full DB-backed editable board** — a
  `KanbanCard` Prisma model + server-action drag/drop persistence. **Recommend (a) first, (b) as Phase 2.**
- **Reuse:** `packages/ui-kit/src/kanban/*` (`admin-kanban.tsx`, `use-board.ts`) for UI; admin capability
  gate; surface under `/app`. Data source = the 8 ledgers via `ledger-backlog.ts --json`. Do **not** edit
  `lib/task-board/seed.ts` (demo fixture).
- **Done means:** Brian + Tony (admins) both load the `/app` board and see the **same** near-realtime
  ledger-projected status (open WL/D/FS/FI/MB/TFF/INC/RISK as cards), server-rendered from git.

#### N1 — Verified instructor/school combobox into the profile-enhancement wizard

- **What:** Replace the free-text "Promoted by" / "School name" inputs in
  `components/web/onboarding/profile-enhancement-wizard.tsx` with the EXISTING creatable-combobox
  (`creatable-combobox.tsx`) fed by `server/web/lineage/join-options.ts` (`getInstructorOptions` = PUBLIC
  nodes in a published BBL tree; `getSchoolOptions` = BBL Organizations). Persist `trainedUnderNodeId` /
  `schoolOrgId` typed refs (already in the claim schema).
- **Lift from BBLApp:** `shared/InstructorSelector.jsx` + `shared/SchoolSelector.jsx` — the verified-badge
  (ShieldCheck/CheckCircle), avatar/logo, rank/city metadata, and "add unverified" creatable UX in the dropdown.
- **Already done in the JOIN funnel** (`lineage-step.tsx`) — this is bringing the same pattern to the
  post-claim wizard, not a new build.

#### N2 — Member dashboard ports (BBLApp → `/app/profile`)

- **Belt-by-belt edit cards (MISSING member-side):** port `dashboard/BBLBeltInfoCards.jsx` +
  `profile/BBLBeltInfoWizard.jsx` + `data/beltInfoSchema.js` → member edits own rank/promotion history (one
  card per belt; date/location/promoted-by/photos/cert/competition media) onto our RankAward model + media manager.
- **Per-member privacy toggles (PARTIAL):** we have global `showEmail/showPhone/showOrgs/showRanks` on
  DirectoryProfile but NOT the per-member `showPromotionDatePublic` (schema exists, not exposed) — expose it +
  consider a Privacy Center (lift `profile/BBLPrivacyCenter.jsx`; GDPR export/delete = stretch).
- **Dedicated Billing tab (PARTIAL):** today only a `BillingPortalButton` in the membership summary. Port
  `dashboard/BillingTab.jsx` 3-card layout (current plan + entitlements, payment method, invoices) as a real tab.

### Holdover (from petey-plan-0457 Phase B + this session)

- WL-P2-22 `LineageTreeBoard` refactor (CRAP 1190) → then admin branch/subtree CRUD (B1 before B2).
- **Founders-on-canonical drift:** Carlos Gracie Sr/Jr, Erik Paulson, Rick Minter are missing from the
  published `rigan-machado-lineage` tree (live only on the now-pruned clones). Decide backfill + log a drift row.
- **FI-001 real send to `btruelson@gmail.com`** — still gated; do AFTER N1/N2 land so Brian's claim lands polished.

### First task

**Petey-grill N0 (the lead):** decide read-only ledger-projection MVP vs full DB-backed editable board
(recommend MVP); scope the `/app` surface + admin capability gate + the `ledger-backlog.ts --json` data
shape; then build the MVP projection reusing `packages/ui-kit/src/kanban/*`. Headless render-proof that an
admin sees the shared board. **N1/N2 (BBLApp ports) and the gated FI-001 real send follow.** For N1 when
reached: confirm the profile-enhancement wizard is Brian's post-claim surface, diff its "Promoted by"/"School
name" fields vs `lineage-step.tsx`'s creatable-combobox, swap them in reusing `join-options.ts` +
`creatable-combobox.tsx` (zero new data layer).

## What landed

- **A1 (WL-P2-21) — surgical clone cleanup APPLIED to PROD.** Read-only audit of all 8 prod lineage
  trees + Brian's 3 memberships; a coverage audit caught that wholesale clone-tree deletion (the plan's
  literal wording) would **orphan 4 founders** (Carlos Gracie Sr/Jr, Erik Paulson, Rick Minter) who live
  only on the clones. Operator chose surgical: deleted **only Brian's 2 redundant clone memberships**
  (guarded, JSON backup, reversible). `--verify` vs PROD → **CLAIMED**. Clone trees intentionally KEPT.
- **A2 (FI-001) — test-send re-confirmed; email PASSED operator review.** `--send --to
  ronindojodesign@gmail.com --free-signup` (mode B, click-safe — lands `/me`, no claim) from
  **`welcome@blackbeltlegacy.com`** (BBL key inline), Resend id `8fe8b411-0896-41ab-87ea-e35e84f748c7`.
  Confirmed the accept route (`/lineage/claim/accept/route.ts`) **auto-claims on landing** → mode B is the
  correct test path. **Real send to btruelson NOT sent** (deferred to post-N1/N2 + operator go).
- **Next lane scoped** (graphify + 2 inventory passes across both repos): N1 verified combobox into the
  post-claim wizard, N2 member-dashboard ports (belt cards / privacy / billing). Port approach decided:
  **read-and-translate, no full Playwright port** (PWCC features-not-pixels; old app is an incompatible
  Vite/REST data layer).
- **fallow-fix-loop + security sweep:** 0 fixes warranted (CLI-script false-positives; dup accept-w-reason);
  no secrets committed; no app-runtime/public surface added.

## Decisions resolved

- **A1 scope = surgical** (operator) — remove Brian's 2 clone memberships only; clone trees kept as inert residue.
- **Founders-on-canonical** = separate Phase-B decision → logged as drift **D-034** (not actioned).
- **FI-001 real send deferred** (operator) until N1/N2 land, so Brian's post-claim onboarding is polished.
- **Port approach = read-and-translate, not full Playwright** (Petey rec, operator agreed).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/scripts/audit-residual-lineage-clones.ts` | NEW — read-only PROD tree/membership audit |
| `apps/web/scripts/audit-clone-member-coverage.ts` | NEW — read-only orphan-coverage check (found the 4-founder trap) |
| `apps/web/scripts/remove-brian-clone-memberships.ts` | NEW — guarded surgical removal (dry-run/apply/rollback); **APPLIED to PROD** |
| `apps/web/scripts/check-test-inbox-state.ts` | NEW — read-only FI-001 test-inbox state check |
| `docs/sprints/SESSION_0457.md` | NEW — session ledger |
| `docs/knowledge/wiki/drift-register.md` | +D-034 (founders missing from canonical tree) |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P2-21 → ✅ resolved (surgical scope; trees kept) |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | FI-001 status note (test re-confirmed; real send gated) |
| `docs/knowledge/wiki/index.md` | +SESSION_0457 row |

## Verification

| Command / smoke | Result |
| --- | --- |
| `audit-residual-lineage-clones.ts` + `audit-clone-member-coverage.ts` (PROD) | 8 trees; Brian 3 memberships; **4 founders orphan-risk found** |
| `remove-brian-clone-memberships.ts --apply` (PROD) | 2 rows deleted; canonical survived (in-tx assert); backup `/tmp/brian-clone-memberships-backup-1782576079629.json` |
| `send-bbl-truelson-thankyou.ts --verify` (PROD) | **CLAIMED** (passport unclaimed, published membership, 2 entitlements in-sim) |
| `send-bbl-truelson-thankyou.ts --send --to ronindojodesign --free-signup` | Resend id `8fe8b411…`, from `welcome@blackbeltlegacy.com` |
| Security sweep | No secrets in committed files; `.env.prod` gitignored; env-injected creds only |
| fallow audit (diff) | 4 complexity / 6 dead-code = CLI false-positive; 42-line dup accept-w-reason; **0 fixes warranted** |
| `bun run typecheck` | exit 0 |
| `bun run lint:check` | warnings only (inherited, none in new files) |
| `bun run format:check` | clean (oxfmt reformatted the 4 scripts) |

## Open decisions / blockers

- **FI-001 real send to `btruelson@gmail.com` — BLOCKED ON OPERATOR** (needs explicit "send Brian now" AND N1/N2 landed).
- **Leftover test `User`** (`sgg3rtFN…`, ronindojodesign) on PROD — delete **BLOCKED** by 3 immutable
  `AuditLog` rows (a `lineage.claim.reviewed` + 2 `entitlement.comp.granted` from the **0444** test claim,
  since torn down — account is otherwise 0-activity). Pending operator call: delete the 3 test audit rows +
  user (`scripts/delete-test-inbox-user.ts --apply --with-audit-logs`), or leave the benign account. The
  account is harmless either way (no active claim/entitlement/node).
- **BBL Resend key rotation** — operator to rotate all Resend keys at EOD (key was used inline only, never on disk).
- **Founders missing from canonical tree** (D-034) — backfill decision for Phase B.

## Review log

### SESSION_0457_REVIEW_01 — Phase-A prod ops + FI-001 test

- **Reviewed tasks:** SESSION_0457_TASK_01, _02, _03
- **Dirstarter docs check:** not applicable (lineage is fully custom; no L1 layer touched)
- **Verdict:** Tight, honest, prod-safe. The grill-the-prod-verify-plan discipline paid off: a read-only
  coverage audit caught a tree-deletion orphan trap *before* any mutation, and the scope was narrowed to a
  2-row reversible delete that fully unblocks Brian without touching the founders. Every prod claim verified
  against PROD, not the snapshot. The only data-integrity gap (founders absent from canonical) is logged as
  D-034, not papered over.
- **Score:** 9.3/10
- **Follow-up:** N1/N2 next session; real send still operator-gated; D-034 backfill.

## Hostile close review

- **Giddy (plan sanity / behavior preservation / data integrity):** **pass** — surgical scope was correct;
  coverage check prevented an orphaning incident; removal guarded (refuses published trees / missing
  canonical / cascade refs) + reversible; canonical + founders intact.
- **Doug (verification honesty / security):** **pass** — all prod claims verified vs PROD; secrets swept
  clean; no public/unauth surface or runtime hot-path added; gates green; the founders gap honestly ledgered.
- **Desi:** not applicable — no UI shipped this session (screenshots were diagnosis only).
- **Kaizen aggregate:** **9.3/10** — clean, careful, honest. Minor ding: the founders-missing-from-canonical
  gap could have been caught earlier by auditing canonical completeness up front rather than via the
  deletion-safety check — but it was handled correctly once found.

### Findings (severity ≥ medium)

#### SESSION_0457_FINDING_01 — Founding ancestors absent from the public canonical tree

- **Severity:** medium
- **Task:** SESSION_0457_TASK_01
- **Evidence:** `audit-clone-member-coverage.ts` output (PROD) — Carlos Gracie Sr/Jr, Erik Paulson, Rick
  Minter have `onCanonical:false / lastPlacement:true` on both `rigan-machado-bjj-lineage` clones.
- **Impact:** the published `rigan-machado-lineage` tree omits the Gracie roots above Rigan; the clones
  (now the only home for these 4) are unpublished, so they're invisible publicly.
- **Required follow-up:** backfill the 4 onto the canonical tree (Phase B), then the clones can be retired safely.
- **Status:** open — tracked as drift **D-034**.

## ADR / ubiquitous-language check

- ADR update **not required.** This session executed within the already-accepted **ADR 0037** (the tree
  consolidation that left the clone residue); no new architectural decision. The "keep clones, surgically
  remove memberships" + "founders backfill is separate" choices are operational/data decisions → routed to
  WL-P2-21 + drift D-034, not an ADR.
- Ubiquitous-language update **not required** — no new domain terms.

## Reflections

- **Grilling the prod-verify plan is what prevented an incident.** The plan said "delete the duplicate
  clones"; a read-only coverage audit revealed the clones carry 4 founders absent from canonical. Auditing
  *deletion safety* (does any node lose its last placement?) before mutating turned a potential orphaning
  into a clean 2-row delete. Reinforces `[[clone-diff-and-proof-data-antipatterns]]` + the consolidation memory.
- **Two reusable ops gotchas.** (1) `bun --env-file` is overridden by a shell-prefixed env var (precedence
  test: shell wins) — so `RESEND_API_KEY=… bun --env-file=.env.prod …` correctly feeds the BBL key past the
  Baseline one. (2) `/lineage/claim/accept` is a **GET route handler that auto-claims on landing** (no
  confirm UI) — so a click-through test must use `--free-signup` (mode B) or it claims the node to the test
  inbox.
- **Neon cold-start P2028.** Don't open a transaction as the *first* DB op on a fresh connection — the 2s
  tx `maxWait` times out before the pool warms. Do reads first, then wrap only the mutation in a tx with
  generous `maxWait`/`timeout`. Fixed the dry-run by moving reads out of the tx entirely.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0457 new; bumped `updated`/`last_agent` on drift-register, wiring-ledger, POST_LAUNCH_SOT, wiki/index |
| Backlinks/index sweep | SESSION_0457 ↔ petey-plan-0457 + SESSION_0456 in frontmatter; index row added |
| Wiki lint | `bun run wiki:lint` → 0 errors, 16 warnings (all pre-existing in `SESSION_VIDEO_R001.md` / `petey-plan-0436`; none in touched files) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0457_REVIEW_01 + Giddy/Doug pass (security/scalability lens) |
| Review & Recommend | Next session goal written: yes (N1/N2 + port approach) |
| Memory sweep | updated `[[lineage-branch-heads-and-tree-consolidation]]` with the founders/coverage-check learning |
| Next session unblock check | N1 doable with no user input; real send BLOCKED ON OPERATOR (noted) |
| Git hygiene | single commit; hash reported at bow-out — see git log; **push GATED on operator** (explicit-push rule) |
| Graphify update | 15274 nodes / 30044 edges / 2060 communities / 2425 files (was 15244/29901/2059/2420; run before the close commit) |
