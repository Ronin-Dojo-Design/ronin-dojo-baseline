---
title: "SESSION 0540 — belt-lane cleanup + design pass, then FI-006 claim→award rank lifecycle (plan-first)"
slug: session-0540
type: session--open
status: in-progress
created: 2026-07-15
updated: 2026-07-15
last_agent: claude-session-0540
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0539.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0540 — belt-lane cleanup + design pass, then FI-006 claim→award rank lifecycle (plan-first)

## Date

2026-07-15

## Operator

Brian + claude-session-0540

## Goal

Tidy + harden the belt lane (the SESSION_0539 belt-rendering redesign that landed as PR #208): run the
review loops (`/fallow-fix-loop` + `/code-quality` on `belt-swatch.tsx`), apply the deferred hostile-close
follow-ups (WL-P3-41/42/43 · D-044 · F04 dead-branch · FI-006 board badge), then a design pass (spacing,
rhythm, type sizing, layout & flow) across the belt-bearing surfaces with before/after `/preview-artifacts`
proof — and finally begin **FI-006** (the claim→award rank lifecycle) on the structured rank data 0539
shipped, plan-first with an operator grill on the open forks.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0539.md` (belt-rendering redesign + `Rank` belt-family/degree
  data foundation; landed as PR #208).
- Carryover: 0539 shipped the operator-locked `BeltSwatch` `belt` variant + additive `beltFamily`/`degree`
  data + ~14-surface consolidation, and **deferred** its review loops, hostile-close fixes, design pass, and
  the FI-006 lifecycle to this session (its `Next session` block = this session's task list).

### PR #208 state (Task 1 correction)

- **PR #208 (`session-0539-fi006-belts`) is ALREADY MERGED** — merged 2026-07-15T16:22:24Z; it is the HEAD
  of `origin/main` (`819a7fed`). **Zero open PRs** in the repo. 0539 pushed it merge-HELD; it was merged
  before this session opened. Task 1 (`/pr-review-fix` + hold-merge) is therefore moot — the belt code is
  reviewed instead by Tasks 2/4/5 (the fallow loop + code-quality + design pass exercise the same diff).

### Branch and worktree

- Branch: `session-0540-belt-fi006`
- Worktree: `/Users/brianscott/dev/ronin-0540` (fresh, off `origin/main`; bootstrapped via `/worktree-setup`)
- Status at bow-in: clean (SESSION_0540.md is the only new file)
- Current HEAD at bow-in: `819a7fed` (the #208 belt merge)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming/UI (`BeltSwatch` — ADR 0026 data-driven belt colors); Prisma (`Rank`/`RankEntry` — FI-006 rank lifecycle). |
| Extension or replacement | Extension: cleanup + design refinement of the existing app-custom `BeltSwatch`; FI-006 extends the existing claim (ADR 0036) + rank (RankEntry) models. |
| Why justified | Behavior-preserving tidy of a landed lane + a claim→award flow on already-shipped rank data — no new capability, no replacement. |
| Risk if bypassed | Logged tidy debt (WL/D rows) rots; FI-006 lifecycle re-derived from scratch instead of the 0539 rank foundation. |

Live docs checked during planning: Theming (ADR 0026 + design-system doctrine), Prisma (RankEntry migration state).

### Grill outcome

**FI-006 was a PHANTOM LANE — the claim→award lifecycle is already shipped + SOT-resolved** (the
SESSION_0500 phantom-lane trap; 0539 propagated a stale "FI-006 next" framing without re-verifying
`main`). Proof: `PassportClaimRequest.claimedRankId` (schema:3039 "@added SESSION_0432 FI-006") +
`claim-finalize.ts:221` `mintAssertedRankAward` (VERIFIED RankAward + `syncRankEntryFromAward`) +
`POST_LAUNCH_SOT.md:75` "resolved (SESSION_0500 — verified already-done)… No work needed." The board's
`in-progress` badge is stale (0500 called `markCardDone`; it didn't stick).

**Operator repoint (grill answer):** FI-006 slot → **make the member-facing claim/registration rank
picker render the rich 0539 `BeltSwatch variant="belt"` (bars/degrees) instead of the plain color dot.**
Scope confirmed = the claim funnel picker, NOT the admin editor. This is a small, contained RENDER SWAP:
the query already carries the belt-render fields (`getBjjRanksForClaimPicker` selects
`beltFamily`/`degree`/`secondaryColorHex`, 0539); only `claim-form.tsx:209-214` (the `h-3 w-3` color
chip) needs to become `<BeltSwatch variant="belt" {...belt} size="sm" />`. Touches the moat's claim
loop → before/after `/preview-artifacts` + Desi + operator sign-off before ship. **Merges with the
design pass (TASK_04) into one design-driven lane.**

Second decision: the operator-locked belt geometry is **back in play** for the design pass (the cleanup
TASK_02/03 stays behavior-preserving; only the design pass may propose geometry changes, via artifact).

**Belt-verification model (NEW lane — operator grill, locked).** The operator raised that members can't
edit promotion facts on some belts/stripes (the ceiling gate + the authority fact-lock) and proposed a
trust-then-flag-exceptions backfill model. Locked decisions:

- **Anchor** = the member's current/highest rank + its promoter (human-verified via the existing claim/
  promotion flow) — the trust root.
- **Backfilling below the anchor is loosened** — members freely add/edit their belt history at/below the
  ceiling. Above-ceiling stays "request promotion" (no self-award — ceiling gate unchanged).
- **Verification state per backfill** (reuse `RankEntryStatus` — NOT a new state; operator caught the
  redundancy): same **registered** promoter as anchor → `VERIFIED` (auto); same **freetext** promoter
  (coach not on BBL) → `UNVERIFIED` (shown, editable, no review task); **different** promoter →
  `UNVERIFIED` + `RankEntryReview{ status: PENDING, reason: PROMOTER_CHANGED }` (instructor review task).
- **Auto-verified & unverified backfills stay member-EDITABLE** (don't lock like a formal promotion).
- **Any freetext promoter not in the registry → emit a promoter-lead** (mirror `emitSchoolLead`) — the
  recruitment engine. The promoter picker (`CreatableCombobox`) surfaces the member's prior-named
  promoters + registry so "same promoter" is a reliable reused pick (+ one lead per distinct coach).
- **Phase 2 (deferred goal):** register-later bind + "confirm these promotions?" loop (leaded promoter
  registers → belts bind FK → promoter confirms → UNVERIFIED→VERIFIED). Needs claim-binding infra.

Infra reuse (grounded): `RankEntryStatus.UNVERIFIED` + the `UNVERIFIED→VERIFIED` path (`verify-rank-entry.ts`)
+ `RankEntryReview`/`RankEntryReviewReason.PROMOTER_CHANGED` all EXIST. **But** `verify-rank-entry.ts:15`
notes the `RankEntryReview` **workflow is UNWIRED** (nothing creates reviews; no instructor queue) → the
different-promoter review path is a genuine build (create + queue UI), not just wiring. No live sibling
lane owns belt/rank-entry (worktree/branch check clean).

**Sequencing (operator: DESIGN-FIRST across all threads).** Desi design pass → before/after Artifact →
operator sign-off → Cody build → Doug verify → push gate. Session scope = all four: belt-edit/verification
model (C), rich picker (FI-006), stepper de-truncation (B), broader join/claim form UX.

## Petey plan

### Goal

Behavior-preserving belt-lane cleanup + a proven design pass, then a plan-first start on FI-006.

### Tasks

#### SESSION_0540_TASK_01 — PR #208 verdict (moot — already merged)

- **Agent:** Petey
- **What:** Confirm #208 merged; fold its review into Tasks 02/04/05 rather than a formal `/pr-review-fix`.
- **Done means:** Verdict recorded (this file, "PR #208 state") + operator informed.
- **Depends on:** nothing

#### SESSION_0540_TASK_02 — `/fallow-fix-loop` + `/code-quality` on `belt-swatch.tsx`

- **Agent:** Cody (build) → Doug (re-verify behavior + fallow delta)
- **What:** Run the fallow loop on the belt diff (CRAP/dupes/dead-code/complexity), then `/code-quality` on
  the Class-A `belt-swatch.tsx`; apply behavior-preserving fixes; prove fallow deltas DOWN.
- **Done means:** fallow before/after deltas recorded; `/code-quality` /10 + fixes; 0 behavior change (unit + live).
- **Depends on:** nothing

#### SESSION_0540_TASK_03 — Deferred hostile-close follow-ups (WL-P3-41/42/43 · D-044 · F04 · FI-006 badge)

- **Agent:** Cody
- **What:** WL-P3-41 (beltless fallback → explicit neutral fill, `belt-swatch.tsx:160`); WL-P3-42 (grouped
  `belt: BeltRenderData` idiom on ~8 enumerating projections); WL-P3-43 (`organizations-section.tsx:21`
  duplicate-`key`); D-044 (repo-wide ADR 0022→0026 belt-color citation fix); F04 (`BAR_NEUTRAL` dead branch);
  FI-006 board-badge correction (FINDING_02).
- **Done means:** each ledger row flipped to resolved w/ commit evidence; live re-verify unchanged.
- **Depends on:** TASK_02 (same file — sequence to avoid churn)

#### SESSION_0540_TASK_04 — Design pass across belt surfaces (spacing/rhythm/type/layout/flow)

- **Agent:** Desi (review) → Cody (apply) → Desi re-verify
- **What:** Design pass on the belt-bearing surfaces; before/after via `/preview-artifacts` (published HTML
  artifact — the proven operator-review channel, per the 0539 reflection). Prove the visual improvement.
- **Done means:** published before/after artifact link; operator sign-off on the visual delta.
- **Depends on:** TASK_02/03 (clean base)

#### SESSION_0540_TASK_05 — FI-006 rich claim-picker belt render (REPOINTED — lifecycle already shipped)

- **Agent:** Desi (mock review) → Cody (wire) → Doug verify
- **What:** the claim→award lifecycle is DONE (grill outcome above). Repointed slot = swap the claim/
  registration rank picker's plain color chip (`claim-form.tsx:209-214`) for `<BeltSwatch variant="belt"
  {...belt} size="sm" />`. Query already carries the belt-render fields (0539). Merges with TASK_04 as one
  design-driven lane, reviewed via before/after `/preview-artifacts` + operator sign-off before wire.
- **Done means:** before/after artifact signed off; picker renders rich belts; claim flow behavior unchanged
  (still writes `claimedRankId`); Doug-verified live.
- **Depends on:** TASK_02/03 (WL-P3-42 grouped `BeltRenderData`) + operator artifact sign-off

### Parallelism

Tasks 02→03 sequential (same file). 04 after 03 (clean base). 05 gated on the operator grill. FI-006 touches
rank/claim/award surfaces adjacent to live siblings (G-002 shared-DB, belt-verify history) — coordinate/flag
before touching a file a live lane owns; belt-swatch + belt surfaces are this session's.

### Open decisions

- Task 1 moot (#208 merged) — fold review into 02/04/05? (Petey recommendation: yes.)
- FI-006 open forks (grill) — claim model, rank-entity choice mid-migration, picker home. To operator before build.

### Scope guard

- No FI-006 build before the grill sign-off. No push before the operator's explicit "go" (build → verify →
  show → HOLD). `../ronin-dojo-monorepo` READ-ONLY. FI-001 / Brian Truelson email STAYS PARKED. Preserve
  no-leak invariants on any touched claim/profile surface.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0540_TASK_01 | landed | PR #208 verdict: already merged; review folded into cleanup + design lanes |
| SESSION_0540_TASK_02 | landed | belt-lane cleanup: WL-P3-41/43 · D-044 (ADR 0022→0026) · F04 note · BeltSwatch/BeltVariant extract (`513d2e1f`) |
| SESSION_0540_TASK_03 | landed | deferred hostile-close follow-ups folded into TASK_02 (WL/D/F04); FI-006 board badge = genuinely in-progress |
| SESSION_0540_TASK_04 | landed | DESIGN-FIRST pass (Desi) → published before/after Artifact → operator sign-off (2 mobile iterations) |
| SESSION_0540_TASK_05 | landed | FI-006 (phantom lane — lifecycle already shipped) REPOINTED to rich claim-picker belt render (`ce615258`) |
| SESSION_0540_TASK_06 | landed | Belt-verification model: loosened editing + auto-verify tree + placeholder-Passport promoter + linked Lead + mint-UNVERIFIED (`0d1bc025`→`79ec2b50`) |
| SESSION_0540_TASK_07 | landed | Stepper vertical chips + 2-col wizard grid (`ce615258`) |
| SESSION_0540_TASK_08 | landed | Verify wave: Doug GO 9.2 · Desi conform + fix · Giddy hostile-close · fix pass (`79ec2b50`); PR #209 opened, CI = e2e gate, merge HELD |

## What landed

- **Belt-lane cleanup** (behavior-preserving): WL-P3-41 (beltless fallback → explicit `BELTLESS_FILL`), WL-P3-43
  (`organizations-section` composite key), D-044 (26 belt-color citations ADR 0022→0026 across 25 files), F04
  (`BAR_NEUTRAL` retained + documented), `BeltSwatch` 142→53 lines via `BeltVariant` extract (render byte-identical).
- **FI-006 caught as a PHANTOM lane** — claim→award lifecycle already shipped + SOT-resolved (sessions 0432/0492/0500).
  Repointed to the **rich claim-picker belt render** (color dot → `BeltSwatch size="sm"`).
- **Design pass** across the join/claim funnel + belt surfaces, operator-approved via a published before/after
  Artifact (2 mobile iterations): stepper vertical chips (de-truncated), 2-col wizard grid, rich picker,
  belt-card name-top + footer trust badge.
- **Backfill-verification model:** loosened `isFactEditable` (own UNVERIFIED backfills editable); auto-verify
  decision tree (same registered promoter → VERIFIED · fresh free-typed coach → claimable **placeholder Passport**
  + linked recruitment **Lead** · existing person ≠ anchor → `RankEntryReview{PROMOTER_CHANGED}`); backfills mint
  `UNVERIFIED` directly; `trustState` on the belt read-model; live promoter-picker feedback note.
- **PR [#209](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/209)** opened (7 commits), CI = the
  e2e gate, **merge HELD** for operator's prod-deploy go.

## Files touched

See `git diff 5f45da74..HEAD --stat` — ~24 files. New: `server/identity/promoter-placeholder.ts`,
`server/web/promoter-lead/emit-promoter-lead.ts`. Belt-swatch geometry frozen (0 changes).

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` | 0 errors |
| `next build` | exit 0 (2.8min) |
| `oxfmt --check .` / `oxlint .` | clean / 0 errors |
| belt unit suites (belt-gate 31 · view-model 18 · promoter-placeholder 4 · emit-promoter-lead 3 · router.integration 35) | green |
| full `bun run test` | 1440 pass / 5 fail (all cold-engine tx-timeout flakes OUTSIDE the diff; warm re-run 99/0) |
| affected e2e | deferred to CI (worktree not e2e-provisioned; `belt-journey` is a manual-only `describe.skip` smoke); local run confirmed the failures were env (unseeded e2e DB), not code |
| Doug data-integrity (adversarial) | ALL HELD — fact-lock, auto-verify, mint-UNVERIFIED, placeholder-leak |

## Open decisions / blockers

None blocking. Merge of #209 held for operator go (prod deploy). Follow-ups ledgered below.

## Next session

### Goal

Clean up + verify this session's belt-verification lane and keep the PR queue merge-ready.

### First task

In order (operator-set at bow-out):

1. **`/fallow-fix-loop`** on this session's diff (belt-verification + funnel-redesign files) — prove CRAP/dupes/
   dead-code/complexity down, behavior-preserving.
2. **`/pr-fix-loop`** (pr-review-score-fix) on open PRs — #209 first if still open (triage → score → fix
   mechanical blockers → verdict, pause-on-merge).
3. **Hostile-close fixes** from this bow-out's `## Hostile close review` (Giddy `SESSION_0540_FINDING_*`).
4. **`/code-quality`** on this session's Class-A modules (`promoter-placeholder.ts`, `belt-gate.ts`
   `decideBackfillTrust`, `belt-edit-card.tsx`, the auto-verify tree in `router.ts`).
5. **Queued follow-ups** (ledgered): the **promoter-as-placeholder ADR** (Giddy scoped it — ratify the doorless
   placeholder sub-shape · bucket-org + `meta.passportId` link · fuzzy-dedup tradeoff + escape · the tx boundary;
   constrain "not claimable until phase-2") + the **fast doc-fix: soften "claimable"** → "recruited-coach
   placeholder (claim door = phase-2)" in `promoter-placeholder.ts` + `ubiquitous-language.md` (D-045, FINDING_01);
   **WL-P3-47** (side-effecting builder on the admin path, FINDING_02); the **instructor review-QUEUE** admin
   surface (**G-010** — add "min = operator-visible count"; Phase 5); **WL-P3-44/45** (orphan-stub tx / dedup race);
   **WL-P3-46** (join-wizard picker parity); log the RankAward-keyed trust logic to the RankAward-retire epic
   (FINDING_06); and fold the e2e-DB-vs-prodsnap note into `verification-and-testing.md`.

## Review log

### SESSION_0540_REVIEW_01 — Doug release gate + data-integrity

- **Verdict:** **CONDITIONAL GO 9.2/10** — data-integrity core launch-safe; every adversarial case held (fact-lock
  can't be bypassed on authority belts; auto-verify can't wrongly verify; mint-UNVERIFIED zero public/tree
  regression, `mintAssertedRankAward` untouched; bare placeholder Passport can't leak). tsc/build/lint/format/
  belt-unit green. Blockers resolved: oxfmt on `router.ts` (fixed `79ec2b50`); affected e2e → CI.

### SESSION_0540_REVIEW_02 — Desi design conformance

- **Verdict:** 4/5 surfaces conform to the approved artifact; no new god-component; no new BeltSwatch preset.
  One MEDIUM (promoter-note reload flip) FIXED (`79ec2b50`); 2 LOW deferred (card belt `sm` applied; join-wizard
  parity → follow-up).

## Hostile close review

### SESSION_0540_REVIEW_03 — Giddy hostile close (architecture / moat / merge-shape lens)

- **Verdict:** **PROCEED to merge #209** — structurally sound + disciplined: additive-only (zero migration), no
  god-component / `kind`-union, reuses `createPassport`/`Badge`/`BeltSwatch`, every RankAward write routes through
  the one `syncRankEntryFromAward` seam. **WORKFLOW 5.0: 9.0** (Dirstarter PASSES; held off 9.4 by shipping a
  moat-adjacent identity change *before* its ratifying ADR + the "claimable" overstatement). **Kaizen ~9.0 GO**
  (Doug 9.2 · Desi 4/5+fix · Giddy 9.0). Conditions are ALL follow-up, none pre-merge.
- **Doug:** GO 9.2 (REVIEW_01). **Desi:** conform + fix (REVIEW_02).

### Findings (severity ≥ medium) — 7, all follow-up

- **FINDING_01 (MED, →ADR+D):** the "claimable placeholder" Passport is claimable IN NAME ONLY — bare Passport
  (no User/email/node/profile) has no ADR 0036 claim door + no ADR 0032 email-reconcile hook, so no claim path
  reaches it today; pollution is live, mitigation is phase-2. Soften "claimable" → "recruited-coach placeholder
  (claim door = phase-2)" in `promoter-placeholder.ts`, this file, `ubiquitous-language.md`. → **D-045**.
- **FINDING_02 (MED, →WL):** `buildFactUpdateData` (`router.ts:178`) is a side-effecting "builder" (mints Passport
  + emits Lead) called on the ADMIN path (`:535`) too — an admin free-typing a promoter silently recruits a coach.
  Gate to the member funnel or rename+document. → **WL-P3-47**.
- **FINDING_03 (MED, →ADR+D):** fuzzy name-match dedup (`fuzzyMatchSchool` over `Passport.displayName`, non-unique)
  can FALSE-MERGE two coaches → a phase-2 claimant inherits the wrong promoter edges (moat provenance). ADR must
  bound the tradeoff + escape hatch. → **D-045**.
- **FINDING_04 (MED, accepted, already WL-P3-44):** orphan-leak (identity/CRM emit outside the award tx) — confirmed.
- **FINDING_05 (MED, accepted, already WL-P3-45):** concurrent-first-type dedup race → duplicate placeholders.
- **FINDING_06 (MED, →GL+D):** mixed-spine debt — trust writes on `RankAward.verificationStatus`, reviews on
  `RankEntry`; this session ADDS RankAward-keyed decision logic → net-new port surface for the RankAward-retire
  epic. Log `decideBackfillTrust`/`applyBackfillTrustDecision` as relocate-to-RankEntry.status. → **D-045** +
  [[rankaward-retire-to-rankentry-only]].
- **FINDING_07 (MED, accepted, already G-010):** `PROMOTER_CHANGED` reviews have a display-consumer (badge) but no
  resolution-consumer (no queue) → unbounded invisible PENDING. G-010 scope: add "min = operator-visible count".
- **Merge-shape note:** one PR fuses low-risk presentation + high-blast-radius moat identity; commits are
  concern-tagged so revert is commit-level. **Future moat work: split presentation from identity at PR granularity.**

## ADR / ubiquitous-language check

- **ADR REQUIRED (new):** promoter-capture-as-placeholder-person — a free-typed promoter mints a claimable
  placeholder Passport (mirrors/extends the ADR 0036 claim placeholder flow) + a linked recruitment Lead. Moat-
  adjacent (ADR 0025 Passport-as-SoT). To author next session (Giddy hostile-close will scope what it must ratify).
- **Ubiquitous-language:** new terms **backfill** (a member-added lower belt), **trust state**
  (verified/unverified/pending-review on a belt), **anchor promoter** (the promoter of the member's authority rank),
  **placeholder promoter** (a recruited-coach placeholder Passport). Add to `ubiquitous-language.md` at close.

## Reflections

- **Verify the lane before building it.** FI-006 was already shipped + SOT-resolved (0500) but propagated as
  "next" by 0539 — the SESSION_0500 phantom-lane trap. Checking `main` first turned a from-scratch lifecycle build
  into a small render swap. The grill's premise flipped from "how to build" to "it's built — what do you want."
- **The operator reviews artifacts on MOBILE.** The first artifact rendered broken on the operator's phone
  (stepper still truncated, a hardcoded 3-col that didn't collapse). Design + verify Artifacts at phone width first.
- **The e2e DB is a hermetic fixture, not a mirror.** The worktree isn't e2e-provisioned; `setup-e2e-db.ts` does
  migrate-only, and the BJJ ladder needs a separate `db:seed` that CI runs. Local e2e is a provisioning yak-shave;
  CI is the authoritative gate. (→ `verification-and-testing.md`.)
- **Operator design decisions ripple into the moat.** "Placeholder Passport for the promoter" + "keep the lead too"
  turned a leaf lead-emit into an identity-graph pattern — surfaced + ADR'd rather than silently built.

## Full close evidence

<!-- Finalized after #209 merges (git hash, board cross-off, graphify). -->

| Step | Proof |
| --- | --- |
| Task log | 8 tasks, all landed |
| Review & Recommend | Next-session goal + 5 first-tasks written (operator-set) |
| Hostile close review | Giddy SESSION_0540_REVIEW_03 (dispatched) |
| ADR check | promoter-as-placeholder ADR required (next session) |
| Memory sweep | mobile-artifact-review + e2e-provisioning lessons (below) |
| Git hygiene | branch `session-0540-belt-fi006`, 7 commits, PR #209; **merge held for operator go** |
| Ledger routing | pending (WL/D/GL rows below) |
