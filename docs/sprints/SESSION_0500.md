---
title: "SESSION 0500 — Petey pipeline: G-004 N1 + belt-rebase strategy + WL-P2-22 (Wave 1 fan-out)"
slug: session-0500
type: session--open
status: closed
created: 2026-07-05
updated: 2026-07-05
last_agent: claude-session-0500
sprint: S49
pairs_with:

  - docs/sprints/SESSION_0499.md
  - docs/knowledge/wiki/goals-ledger.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0500 — Petey pipeline: G-004 N1 + belt-rebase strategy + WL-P2-22 (Wave 1 fan-out)

## Date

2026-07-05

## Operator

Brian + claude-session-0500

## Goal

Petey planning + orchestration pass. Read the ledgers, de-conflict the live lanes, grill the open
forks, lock a collision-free pipeline, and dispatch Wave 1 as three disjoint sub-agent lanes toward the
FI-001 (Truelson, P0) unblock. Primary lane = **G-004 N1** (post-claim wizard creatable-combobox) which
gates the FI-001 real send; sequential/gated = **0491 belt-rebase reconciliation** (17 behind + a
pre-dated migration); parallel/disjoint = **WL-P2-22** LineageTreeBoard CRAP refactor.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0499.md`
- Carryover: 0499 shipped the preset cropper + `ImageFieldUploader` (killed the storyboard URL field) and
  set founder hero images on prod; **Epic A spine is fully LANDED** (0498+0499 merged, `#192`/`#193`). 0499's
  Next-session pick = FI-001. This session opens that lane the ledger-correct way: build the G-004 polish
  that gates the real send.

### Branch and worktree

- Branch: `session-0500-pipeline` (this planning doc only)
- Worktree: `/Users/brianscott/dev/ronin-0500-pipeline`
- Status at bow-in: clean (canonical `main` had only 2 untracked prod screenshots)
- Current HEAD at bow-in: `24737a19`

### Grill outcome

De-confliction correction to the operator's live-lane list first: **0496/0497 became 0498/0499 → both
MERGED**; Epic A is landed, not in-flight. **Zero open PRs** → G-007 `/pr-fix-loop` default lane does not
apply this cycle. Only genuinely-held lane = 0491 belt-rebase.

5 forks resolved:

1. **FI-001 (P0) fork → polish-first.** The real send is double-gated (N1/N2 land + operator "go"), so the
   buildable work is **G-004 N1+N2**, then the operator fires the magic-link. (Rejected: send-now on the
   current onboarding.)
2. **Belt lane → rebase + land 0491.** It is not push-ready: **14 ahead / 17 behind** `main` and carries
   migration `20260701000000_add_rank_milestone` that now predates 5 merged migrations. Giddy strategy →
   Cody execute → Doug, held at the push gate. This precedes FI-006 (same belt DB domain).
3. **Fan-out → yes, one disjoint parallel lane (WL-P2-22).** Not FI-017 (claim-core, collides with N1).
4. **N2 ↔ belt collision → N1 now, N2 in Wave 2.** G-004 N2 ports belt-by-belt edit cards that *consume*
   0491's `BeltEditCard`/Belts tab, so N2's belt portion must build on 0491 after it lands. N1 (claim
   funnel) is belt-independent → runs in Wave 1.
5. **Dispatch → spawn Wave 1 now** (3 disjoint sub-agents, background), SESSION doc written in parallel.

### Drift logged

- D-041 (0499): local `apps/web/.env` S3 endpoint dead (`:3000` should be MinIO `:9000`) + Docker down.
  Not blocking this session — no Wave-1 lane touches uploads. Fix deferred to a media-touching lane
  (operator's call: restore runbook values + `docker compose up -d minio minio-init`).

## Petey plan

### Goal

Unblock FI-001 by landing G-004 N1 (Wave 1) then N2 (Wave 2), reconcile+land the held belt subsystem, and
cut LineageTreeBoard complexity — all collision-free across a shared local DB and the claim/belt domains.

### Tasks

#### SESSION_0500_TASK_01 — G-004 N1: post-claim wizard creatable-combobox (Wave 1)

- **Agent:** Cody → Doug
- **What:** swap the verified instructor/school creatable-combobox into the post-claim
  profile-enhancement wizard; store typed ref-ids + text like the lead/registration path (no migration).
- **Steps:** pre-flight → confirm the real post-claim wizard surface → port the combobox from
  `lineage-step.tsx`/`lead-lineage-selections.tsx` into `components/web/claims/profile-claim-form.tsx` →
  gates → browser round-trip on :3500.
- **Done means:** claimant enhances profile with verified lineage selections (not free text); gates green;
  browser-verified; committed, NOT pushed.
- **Depends on:** nothing.

#### SESSION_0500_TASK_02 — 0491 belt-rebase reconciliation STRATEGY (Wave 1)

- **Agent:** Giddy (strategy only; Cody executes after) → Doug
- **What:** produce the executable rebase + migration-reconciliation plan for `session-0491-belt-rebase`
  (17 behind; migration pre-dates 5 merged ones) without mutating the branch.
- **Steps:** non-mutating conflict forecast (`git merge-tree` / scratch rebase) → migration re-timestamp
  decision → step-by-step Cody plan with shadow-replay verify (never `migrate dev`) → risk verdict → blast
  radius (belt UI on main; N2 consumers).
- **Done means:** a concrete, ordered plan + risk verdict returned; no branch mutation, no push.
- **Depends on:** nothing (gates FI-006 + N2 belt cards).

#### SESSION_0500_TASK_03 — WL-P2-22: LineageTreeBoard CRAP refactor (Wave 1)

- **Agent:** Cody (fallow-fix-loop pattern) → Doug
- **What:** behavior-preserving refactor of `components/web/lineage/lineage-tree-board.tsx` (CRAP ~1190);
  prove the drop with fallow before→after; zero behavior change.
- **Steps:** baseline fallow audit → extract pure geometry/connector helpers + shell/sub-part split → kill
  real dupes/dead code → re-audit → browser verify dnd/zoom/connectors/belt-colors identical.
- **Done means:** fallow metrics demonstrably lower; behavior byte-identical (browser-verified); gates
  green; committed, NOT pushed.
- **Depends on:** nothing.

#### SESSION_0500_TASK_04 — G-004 N2: member-dashboard ports (Wave 2, gated on TASK_02 land)

- **Agent:** Cody → Doug
- **What:** port belt-by-belt edit cards + per-member privacy toggles + dedicated Billing tab onto the
  member dashboard, consuming the merged belt subsystem.
- **Done means:** deferred spec — kicks off after 0491 lands on `main`. Any column-add migrates here (after
  the belt migration is on main → one-migration-at-a-time honored).
- **Depends on:** SESSION_0500_TASK_02 (0491 merged).

### Parallelism

- **Wave 1 (concurrent, disjoint file/DB sets):** TASK_01 (claim funnel, no migration) · TASK_02 (git
  analysis only, no branch mutation) · TASK_03 (lineage canvas, no migration). No shared files; only
  TASK_02's domain touches belt DB and it does not apply a migration this wave.
- **Wave 2 (sequential):** TASK_04 after TASK_02's rebase lands on `main`.
- **Gated tail:** FI-001 real send (operator "go") → FI-006 (belt FK deprecation, belt DB now clear).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0500_TASK_01 | Cody → Doug | scoped build against a known port pattern |
| SESSION_0500_TASK_02 | Giddy → (Cody) → Doug | delicate rebase + migration order = architecture/git-strategy |
| SESSION_0500_TASK_03 | Cody (fallow loop) → Doug | behavior-preserving refactor with measured before→after |
| SESSION_0500_TASK_04 | Cody → Doug | Wave 2, consumes the merged belt subsystem |

### Open decisions

- Held for operator: FI-001 real send · Rorion portrait (image vs A5 ffmpeg) · FI-018 V1/V2 carousel pick
  · G-002 phase-2 cloud half (Neon + Vercel).

### Risks

- Belt-rebase migration order: `add_rank_milestone` predates 5 applied migrations — TASK_02 must confirm
  additive-safe or re-timestamp (its core deliverable).
- 1 CRITICAL pre-push finding noted in the 0491 bow-out — TASK_02 confirms open/closed.
- Shared local DB: only TASK_02's domain is belt-DB and it applies no migration this wave; N2 migration
  waits for Wave 2.

### Scope guard

- NO push / PR / merge / deploy in any lane — hold at the push gate for the operator.
- NO `prisma migrate dev` anywhere (shared-DB auto-reset trap); belt migration verified via shadow-replay.
- NO N2 build in Wave 1 (belt collision). NO FI-017 this cycle (claim-core collides with N1).
- `../ronin-dojo-monorepo` READ-ONLY; each lane stays in its own worktree.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0500_TASK_02 | resolved — RETIRE | Giddy: 0491 SUPERSEDED by #186 (migration byte-identical, SELF_REVIEW guard on main / absent on branch, RankMilestone on main). NOT rebased. Operator GO → archive-tagged `archive/session-0491-belt-rebase` @ `e19653a9` + worktree/branch removed. Rebasing would re-open the CRITICAL self-approval hole. |
| SESSION_0500_TASK_03 | landed — Doug SHIP 9.7 | WL-P2-22 — CRAP 1190→240 (−80%), cyc 34→15; 5 pure fns → `lineage-tree-board-model.ts` + 19 unit tests; e2e 12/12. Doug: faithful extraction, zero behavior delta, 272/272 unit + 12/12 serial e2e; the 2 parallel-run fails = shared-DB fixture-teardown FK trap (env, not diff). `a0ec954d`. Held for push-go. Nit: `.fallow/` → `.gitignore`. |
| SESSION_0500_TASK_01 | landed — Doug SHIP-nits 9.6 | G-004 N1 — combobox swapped, typed refs persist (`trainedUnderNodeId`/`claimedSchoolId`), no migration @ `78aa43e2`. Doug ruled: id-spaces proven never cross (no P2003); finalize steward-display intentional; Dialog-UAT gap acceptable (P3 post-merge smoke). Held for push-go. |
| SESSION_0500_TASK_04 | landed (Doug running) | G-004 N2 — 2/3 surfaces (belt cards + privacy fields) ALREADY on main via #186; real work = NEW Billing tab (`billing-tab.tsx`, entitlements+enrollments+Stripe portal, billing now single-home) + privacy discoverability polish. Passport-keyed picker untouched (WL-P1-8 held). No migration. Gates green (24 tests) @ `f81f0d46`. Held. |
| SESSION_0500_TASK_05 | resolved — STALE | FI-006 already DONE on main: `selectedRankAward` FK removed in 0475 (schema:2931 comment only); claim rank picker + `currentRankId`/`claimedRankId` shipped. SOT row is stale → close at bow-out. No dispatch. |
| SESSION_0500_TASK_06 | v1 built+reviewed; v2 fix running | Epic B mobile shell B0–B3 @ `70578858`. Doug **SHIP-nits 9.7** (admin boundary airtight — server-gated, `next build` clean, non-admin DOM has no MAB; no two-FAB regression; localStorage SSR-safe; 1103/0, e2e 2/2). Desi ship-quality on primitives/motion/tokens but **2 HIGH** on account tabs. `/dashboard` "404" was FALSE — it 308s→`/app/profile` (Doug). **v2 fix (operator): collapse Dashboard+Profile→1 tab (4 tabs total); nav always-on for logged-in users across `(web)` AND `/app`, hidden for logged-out; fix Posts label ("Community"→"Posts"); fix stale comment.** Then Desi/Doug re-verify. **v2 built @ `ce8e05ac`:** 4 tabs (Dashboard dropped), logged-in-gated, nav always-on across `(web)`+`/app` (dual-mount into `app/app/layout.tsx`; Sidebar `max-md:hidden`; off legacy `/admin` by design), `?tab` useEffect sync, Posts label + comment fixed. Gates green, 1103/0, `next build` clean, e2e 3/3. Doug re-verify **SHIP-nits 9.5** @ `ce8e05ac` — all 4 rulings clean (admin boundary intact at new mount, one nav/surface, `/app` navigable, nav-off-`/admin` right). Copy P2 fixed inline `f6a2e5e0`. Open: admin-CRUD-mobile-reachability (sidebar demote exposed ~30 sections with no mobile entry — operator decision) + dead `BblMemberRail` branch (P3). |

## Open decisions / blockers

- **REVERSAL (mid-session, verified):** TASK_02 belt-rebase → RETIRE, not land. 0491 is superseded by
  #186; the Wave-2 gate on N2 is dissolved and FI-006 is unblocked (belt subsystem already on main). N2 +
  FI-006 pulled into this cycle (operator call), dispatched after N1 returns.
- **Follow-up flagged:** 5 more dead belt-verify branches (`session-0477/0487/0488/0489/0490-belt-verify*`
  — the #178–181 iteration series #186 superseded) are cruft; not touched (need operator GO to prune).
- Operator-held: FI-001 send · Rorion portrait · FI-018 pick · G-002 cloud half.

## Next session

### Goal

Land Wave-1 results (N1 + WL-P2-22 merges; belt-rebase executed per Giddy's plan), then Wave 2 (G-004 N2),
then FI-001 real send on operator "go".

### First task

Review the three Wave-1 sub-agent reports; dispatch Doug verify per lane; on green + operator push-go,
merge N1 + WL-P2-22, then execute the belt rebase per TASK_02's plan.

## ADR / ubiquitous-language check

- ADR update not required for the shipped code — G-004/ADR 0040 one-primitive×variants + ADR 0035/0044
  conformed-to; Epic B is net-new chrome, no decision changed.
- **ADR 0002 (Expo-for-mobile) flagged for a reconciliation amendment** (operator ratification): the
  `native-api-contract-research-review.md` produced this session found ADR 0002's `api/v1` premise is dead
  (never built; oRPC only ~4/140 modules; the repo already models the `Source="rpc"|"openapi"|"rsc"` hybrid).
  Recommendation = Option C hybrid (oRPC internal + a generated `/api/v1` OpenAPI facade when native ships).
  Not ratified here — decision-input only.
- Ubiquitous language: MAB (Multi-Action Button), mobile shell — inventoried in the component inventory.

## What landed (shipped to prod `5cfdcf4f`, Vercel ● Ready)

- **G-004 N1+N2** (Doug 9.6) — post-claim wizard creatable-combobox (typed refs); member Billing tab + privacy polish. G-004 → done; **FI-001's onboarding-polish gate cleared** (only operator "send Brian" remains).
- **WL-P2-22** (Doug 9.7) — LineageTreeBoard CRAP 1190→240 (−80%), 5 pure fns extracted + 19 tests, behavior-preserving.
- **Epic B mobile shell** (Doug 9.5) — 4-tab bottom nav + admin radial MAB, always-on for logged-in users across `(web)`+`/app`; server-resolved admin-gate; localStorage persistence.
- **Retired without wasted build:** 0491 belt-rebase (superseded by #186 — would've re-opened a self-approval hole; archive-tagged) + 5 dead `belt-verify` branches pruned. **FI-006** closed (already done).
- **Docs/research:** `native-api-contract-research-review.md` (oRPC vs api/v1 options). **Queued:** PWA lane + mobile-admin-reachability (FI-021).

## Reflections

- **The sharpest work this session was NOT building — it was killing phantom lanes.** Three "open" belt-lane items (0491 rebase, FI-006, 2/3 of N2) were already shipped by #186; the ledgers/branches predated the consolidation and were never crossed off. Verifying against `main` before dispatching saved a wasted rebase (which would have regressed a security fix) and two no-op builds. Memory saved so the next belt lane checks first.
- **Fan-out paid off because the work was genuinely disjoint** — three Wave-1 lanes (claim funnel / lineage canvas / git analysis) touched zero shared files, so they ran fully parallel and merged clean. The one collision (N2↔belt) was surfaced in planning and sequenced, not discovered at merge.
- **Operator delegation on the "what would Apple/FB do" fork** (persistence) resolved to the lean call: per-device localStorage for a 2-admin v1 shell still being designed, with a documented per-account promotion path — not a premature DB column.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | 6 tasks: 3 shipped (N1+N2 · WL-P2-22 · Epic B), 1 retired (belt-rebase), 1 stale-closed (FI-006), 1 planning |
| Combined gates (pre-push, `5cfdcf4f`) | typecheck 0 · oxfmt 1804 files · `bun run test` **1122/0** · `next build` exit 0 (197 pages) · wiki-lint 0 errors |
| Reviews | Doug ×4 (9.6 g004 · 9.7 WL-22 · 9.7→9.5 Epic B v1/v2) + Desi (Epic B 2-HIGH → fixed) + Giddy (belt-rebase retire strategy + native-contract research) |
| Deploy | Vercel ● Ready (3m); prod smoke 200 on `/` · `/posts` · `/lineage` |
| Ledger routing | G-004→done · WL-P2-22→done · FI-006→resolved · FI-021 added · WL-P3-29/30/31 logged · board `markCardDone` ×3 |
| Memory sweep | `186-superseded-belt-lane-ledger-items` + `epic-b-mobile-shell-shipped` saved; MEMORY.md indexed + compacted (19.7→18.5KB) |
| Inventory | Epic B mobile-shell nav family added |
| Git hygiene | 4 branches merged (1 push, 1 deploy) + deleted; 0491 archive-tagged; 5 belt-verify branches pruned |
| Follow-ups queued | PWA lane (task) · mobile-admin affordance (task/FI-021) |
