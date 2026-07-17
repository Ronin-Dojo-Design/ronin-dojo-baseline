---
title: "SESSION 0541 — belt-verification lane cleanup + hardening + promoter-as-placeholder ADR (plan-first)"
slug: session-0541
type: session--implement
status: complete
created: 2026-07-15
updated: 2026-07-16
last_agent: claude-session-0541
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0540.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0541 — belt-verification lane cleanup + hardening + promoter-as-placeholder ADR (plan-first)

## Date

2026-07-15

## Operator

Brian + claude-session-0541

## Goal

Clean up + harden the belt-verification lane that shipped in SESSION_0540 (PR #209, now on prod): run the
review loops (`/fallow-fix-loop` on the belt-verification + claim-funnel diff, `/code-quality` on the
Class-A modules), apply the SESSION_0540 hostile-close follow-ups (WL-P3-44/45/46/47 · D-045 · FINDING_01–07),
and land the deferred moat-governance work — headlined by the **promoter-as-placeholder ADR**. Keep the PR
queue merge-ready. Plan-first (grill + plan before building) on the ADR + the G-010 review-queue, per the
operator's standing rule.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0540.md` (its `Next session` + `Hostile close review` blocks
  ARE this session's brief).
- Carryover: 0540 shipped the belt-verification model (loosened backfill editing · auto-verify decision tree ·
  free-typed promoter → claimable placeholder Passport + linked recruitment Lead · mint-UNVERIFIED) via PR #209,
  and **deferred** its fallow loop, code-quality, hostile-close fixes (FINDING_01–07), the promoter ADR, and the
  G-010 review queue to this session.

### PR #209 state

- **PR #209 (`session-0540-belt-fi006`) is MERGED** — it is `27dd34a4` on `origin/main`, closed by the
  SESSION_0540 bow-out docs commit `917ee15b`. **Zero open PRs** in the repo (`gh pr list --state open` = `[]`).
  Task 2 (`/pr-fix-loop`) is therefore a **NO-OP** this session — noted, skipped.

### Branch and worktree

- Branch: `session-0541-belt-followups`
- Worktree: `/Users/brianscott/dev/ronin-0541` (fresh, off `origin/main`; bootstrapped via `/worktree-setup`)
- Status at bow-in: clean (SESSION_0541.md is the only new file)
- Current HEAD at bow-in: `917ee15b`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (`RankAward`/`RankEntry`/`Passport`/`Lead` — belt-verification identity + CRM); Auth/RBAC (`belt.admin` for the G-010 queue); Theming/UI (`BeltSwatch` — join-wizard picker parity). |
| Extension or replacement | Extension: behavior-preserving cleanup + hardening of the landed SESSION_0540 lane; new ADR ratifies an existing (already-shipped) identity sub-shape; G-010 conforms to the existing `AdminCollection` pattern. |
| Why justified | Hardening + governance of an already-live moat-adjacent lane — no new capability; the ADR ratifies a shape that shipped ahead of it (Giddy's 9.0 merge-condition). |
| Risk if bypassed | Orphan-stub + false-merge identity debt rots on the moat's provenance graph; PROMOTER_CHANGED reviews sit unactioned forever; "claimable" overstatement misleads future sessions. |

Live docs checked during planning: Prisma (`RankAward`/`RankEntry`/`Lead` state), Auth (RBAC `belt.admin`),
ADR 0025 (Passport-as-SoT), ADR 0036 (Passport claim), ADR 0034/0040 (platform/kernel).

### Grill outcome

4 forks resolved (operator grill, SESSION_0541 bow-in):

1. **Tx boundary (WL-P3-44)** → **fold into the award tx.** Placeholder-resolution + lead-emit move INSIDE the
   award `$transaction`; a fill-once fail-closed rolls them back atomically. Identity + CRM + award commit-or-fail
   together. `ensurePromoterPlaceholder`/`emitPromoterLead`/`createPassport` take a `tx` client.
2. **Admin path (WL-P3-47/FINDING_02)** → **split resolver + recruit on BOTH paths + honest rename.** Extract the
   pure FK-resolver (`resolvePromoterFk`: freetext → find-or-create placeholder → `passportId`) from the side-effect;
   keep the recruitment Lead firing on both the member AND admin belt-fact paths (operator's recruit-broadly intent);
   rename `buildFactUpdateData` → `resolveFactUpdateWithCapture` so the capture is intentional + named, not silent.
   Recruit fires **only on freetext** (a picked registered promoter never emits a Lead). **Ledger follow-up:**
   "add person / add user" admin flow → promoter-lead is a SEPARATE recruitment-flywheel surface, out of scope this
   session (→ new ledger row).
3. **Dedup precision (D-045/FINDING_03)** → **tighten matcher now (bias to duplicates) + ADR documents the tradeoff
   + phase-2 MERGE tool as the escape.** For a provenance graph a duplicate is the safe error (mergeable), a
   false-merge is the dangerous one (must split). Tighten `ensurePromoterPlaceholder` toward exact-normalized match;
   leave `emit-school-lead.ts`'s matcher untouched (not provenance-critical the same way). Phase-2 escape = admin
   MERGE, not split.
4. **G-010 scope** → **full min-viable queue.** AdminCollection review surface (list member/belt/reason/note +
   approve → `verifyRankEntry`/APPROVED, dismiss → DENIED, RBAC `belt.admin`, conform to `/app/techniques`). Splits
   to a follow-on only if the identity lane exhausts the budget (flag at push gate).

## Petey plan

### Goal

Behavior-preserving cleanup + code-quality on the SESSION_0540 belt-verification diff, then ratify (ADR) and
harden the promoter-as-placeholder identity model, then land the G-010 review queue — plan-first on the forked
items.

### Tasks

#### SESSION_0541_TASK_01 — `/fallow-fix-loop` on the belt-verification + funnel diff

- **Agent:** Cody (build) → Doug (re-verify behavior + fallow delta)
- **What:** fallow audit + health on the SESSION_0540 diff (`server/belt/*`, `server/identity/promoter-placeholder.ts`,
  `server/web/promoter-lead/*`, `components/web/belt/*`); apply behavior-preserving fixes; prove CRAP/dupes/dead-code/complexity DOWN.
- **Done means:** fallow before/after deltas recorded; 0 behavior change (unit + live).
- **Depends on:** nothing

#### SESSION_0541_TASK_02 — `/code-quality` on the Class-A modules

- **Agent:** Cody
- **What:** score + close-the-gap on `server/identity/promoter-placeholder.ts`, `server/belt/belt-gate.ts`
  (`decideBackfillTrust`), `server/belt/router.ts` (auto-verify tree), `components/web/belt/belt-edit-card.tsx`.
- **Done means:** /10 per module + behavior-preserving fixes applied.
- **Depends on:** TASK_01 (clean base — same files)

#### SESSION_0541_TASK_03 — promoter-as-placeholder ADR (PLAN-FIRST)

- **Agent:** Giddy (scope) → Petey (author) → Giddy re-verify
- **What:** ratify the doorless-placeholder sub-shape · the "BBL Coach Outreach" bucket-org + `Lead.meta.passportId`
  link · the fuzzy-dedup precision tradeoff + admin split/merge escape · the identity+CRM-emit transactional
  boundary. CONSTRAIN "not claimable until phase-2". D-045 + FINDING_01/03.
- **Done means:** ADR authored + numbered; `ubiquitous-language.md` terms added; D-045 fix-direction linked.
- **Depends on:** operator grill sign-off (Open decisions #1–#3)

#### SESSION_0541_TASK_04 — Doc-fix: soften "claimable" (FINDING_01)

- **Agent:** Cody
- **What:** soften "claimable" → "recruited-coach placeholder (claim door = phase-2)" in `promoter-placeholder.ts`
  + `docs/architecture/ubiquitous-language.md`. Fast, alongside the ADR.
- **Done means:** overstatement removed in code comments + ubiquitous language; D-045 (1) resolved.
- **Depends on:** TASK_03 (same wording decision)

#### SESSION_0541_TASK_05 — WL-P3-47: gate the side-effecting builder (FINDING_02)

- **Agent:** Cody → Doug
- **What:** `buildFactUpdateData` (`router.ts:178`) mints placeholder + emits Lead on the ADMIN path (`:535`) too.
  Gate the placeholder/Lead emit to the member funnel, or rename (`resolveFactUpdateWithCapture`) + document.
- **Done means:** admin free-typing a promoter no longer silently recruits (or is explicitly documented as intended);
  WL-P3-47 resolved.
- **Depends on:** TASK_03 (boundary decision), TASK_01

#### SESSION_0541_TASK_06 — WL-P3-44: fold placeholder + lead emit inside the award tx (FINDING_04)

- **Agent:** Cody → Doug
- **What:** `ensurePromoterPlaceholder` + `emitPromoterLead` run BEFORE the award `$transaction`; a fill-once
  fail-closed leaves an orphan stub. Fold the identity/CRM emit INSIDE the award tx (or compensating sweep).
- **Done means:** no orphan placeholder/Lead on a failed fill-once write; unit test for the fail-closed path.
- **Depends on:** TASK_03 (boundary decision), TASK_05 (same function)

#### SESSION_0541_TASK_07 — WL-P3-45: concurrent-dedup race (FINDING_05)

- **Agent:** Cody
- **What:** two members free-typing the same coach before either award FK commits → duplicate placeholders.
  Accept-with-note (bounded/harmless) or add a guard, per the ADR escape-hatch decision.
- **Done means:** decision recorded; guard added or WL-P3-45 accepted with a documented rationale.
- **Depends on:** TASK_03 (dedup tradeoff decision)

#### SESSION_0541_TASK_08 — G-010: instructor review queue for PROMOTER_CHANGED (PLAN-FIRST)

- **Agent:** Cody → Doug (+ Desi conform)
- **What:** admin surface that ACTIONS `RankEntryReview{PROMOTER_CHANGED, PENDING}`. Conform to the
  `AdminCollection` pattern (`/app/techniques` reference); RBAC = `belt.admin`; approve → `verifyRankEntry`, dismiss → `DENIED`.
  MIN = an operator-visible PENDING count.
- **Done means:** operator-visible PENDING count at minimum; full queue if scope allows.
- **Depends on:** operator grill sign-off (Open decisions #4 — scope)

#### SESSION_0541_TASK_09 — WL-P3-46: join-wizard rank-picker rich-belt parity

- **Agent:** Cody → Desi
- **What:** `lineage-step.tsx:103-114` still renders `dot` BeltSwatch; upgrade to `variant="belt" size="sm"` to
  match the claim picker (SESSION_0540 parity).
- **Done means:** both rank pickers render the rich belt; WL-P3-46 resolved.
- **Depends on:** nothing (disjoint file)

#### SESSION_0541_TASK_10 — Ledger + doc notes (FINDING_06 + e2e-DB)

- **Agent:** Petey
- **What:** log `decideBackfillTrust`/`applyBackfillTrustDecision` as RankAward-keyed logic the RankAward→RankEntry
  table-drop epic must relocate (FINDING_06 → `rankaward-retire-to-rankentry-only`); fold the e2e-DB-vs-prodsnap
  explanation into `docs/runbooks/dev-environment/verification-and-testing.md` (no new doc).
- **Done means:** both notes land; no new doc created.
- **Depends on:** nothing

### Parallelism

TASK_01 → TASK_02 sequential (same files). TASK_03 (ADR) gates 04/05/06/07 (all depend on its boundary/dedup
decisions). TASK_05 → TASK_06 sequential (same `buildFactUpdateData`). TASK_08 (G-010) gated on the operator
scope grill; disjoint from the identity files so it can run in parallel with 04–07 once scoped. TASK_09 + TASK_10
are disjoint (join-wizard / docs) — parallel anytime.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody → Doug | fallow loop = build + re-verify |
| TASK_02 | Cody | code-quality close-the-gap |
| TASK_03 | Giddy → Petey | architecture ADR |
| TASK_04–07 | Cody → Doug | app-code hardening on the identity/CRM boundary |
| TASK_08 | Cody → Doug + Desi | new admin surface, AdminCollection conform |
| TASK_09 | Cody → Desi | UI parity |
| TASK_10 | Petey | ledger/doc notes |

### Open decisions

Grill the operator BEFORE building TASK_03–08 (plan-first per standing rule). Forks:

1. **Identity+CRM-emit transactional boundary (WL-P3-44):** fold the placeholder + lead emit INSIDE the award tx
   (atomic — Petey recommend) vs emit-after-commit vs compensating sweep.
2. **WL-P3-47 admin path:** gate the recruitment Lead emit to the member funnel only (admin writes freetext `notes`,
   no recruit — Petey recommend) vs keep on both + rename/document. (Placeholder-identity resolution: member-only, or both?)
3. **Fuzzy-dedup precision (D-045/FINDING_03):** accept fuzzy dedup + an admin split/merge escape as phase-2
   (Petey recommend — blast radius is bounded to off-tree accountless placeholders) vs tighten the matcher now.
4. **G-010 scope this session:** minimum operator-visible PENDING count only (defer full queue) vs full
   AdminCollection review queue (approve/dismiss). Petey recommend: build the full min-viable queue if scope allows
   after the identity lane; else the count + defer.

### Risks

- Session is large (10 tasks). Honest close may split G-010 (TASK_08) to a follow-on if the identity lane
  consumes the budget — flag at the push gate.
- Moat-adjacent identity files; coordinate before touching any file a live G-002 sibling owns (none active in a
  worktree at bow-in).

### Scope guard

- No TASK_03–08 build before the operator grill sign-off. No push before the operator's explicit "go"
  (build → verify → show → HOLD). The MERGE is the separate prod-deploy trigger. `../ronin-dojo-monorepo`
  READ-ONLY. FI-001 / Brian Truelson email STAYS PARKED. Preserve no-leak invariants — bare placeholder
  Passports must NOT surface publicly.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0541_TASK_01 | landed | fallow cleanup: shared lead-meta-helpers (kills 53-line clone), findOwnMilestone (self-dup), dead BELT_STATUS_LABEL removed (`f0c83c48`); non-identity complexity assessed in TASK_02 |
| SESSION_0541_TASK_02 | in-progress | `/code-quality` on 4 Class-A modules — belt-edit-card CRAP is presentational (no churn); router/promoter-placeholder/belt-gate assessed |
| SESSION_0541_TASK_03 | landed | ADR 0047 authored + accepted (`promoter-as-placeholder-recruited-coach-identity`) + ubiquitous-language terms |
| SESSION_0541_TASK_04 | landed | "claimable" softened in promoter-placeholder.ts + emit-promoter-lead.ts + ubiquitous-language.md (`f0c83c48`) |
| SESSION_0541_TASK_05 | landed | WL-P3-47: rename `resolveFactUpdateWithCapture` + resolver split + recruit-on-both intentional (`f0c83c48`) |
| SESSION_0541_TASK_06 | landed | WL-P3-44: fold placeholder+lead emit inside the award tx, fail-closed throws inside tx (`f0c83c48`) |
| SESSION_0541_TASK_07 | landed | WL-P3-45: accepted (ADR 0047 D3 — duplicates are the safe error, phase-2 MERGE escape) + exact-normalized dedup |
| SESSION_0541_TASK_08 | landed | G-010 instructor review queue: AdminCollection belt-reviews page + inline approve/dismiss actions (`031b73fa`) |
| SESSION_0541_TASK_09 | landed | WL-P3-46 join-wizard rich-belt parity: `variant="belt" size="sm"` BeltSwatch (`e6ef5ff1`) |
| SESSION_0541_TASK_11 | landed | F1: threshold=1 in `findMatchedOpenLead` + John/Jon coherence test (Cody, `cc42aa03`) |
| SESSION_0541_TASK_12 | landed | F2: `verifyRankEntryInTransaction` → `verify-rank-entry-core.ts` (server-only, Cody, `cc42aa03`) |
| SESSION_0541_TASK_13 | landed | F3: inline binary-moderation ratified in ADR 0047 Consequences (Petey) |
| SESSION_0541_TASK_14 | landed | F4/F5/F6: ADR 0047 D4 tx-coupling note + D5 admin-skips-trust note + epic G relocate entry (Petey) |
| SESSION_0541_TASK_10 | landed | FINDING_06 → RankAward-retire epic task G; e2e-DB-vs-prodsnap → verification-and-testing.md; ledger rows resolved |

## What landed

All 14 tasks landed. Summary by area:

**Belt-funnel hardening (TASK_01–07 / f0c83c48):**
- Fallow cleanup: extracted `lead-meta-helpers.ts` (killed 53-line clone in both lead emitters), removed dead
  `findOwnMilestone` self-dup + `BELT_STATUS_LABEL` dead export.
- ADR 0047 authored: ratifies promoter-as-placeholder as a legitimate doorless identity sub-shape (doorless
  until phase-2), exact-normalized dedup (bias to duplicates + admin MERGE escape), tx-fold boundary, and the
  recruit-on-both-paths + honest-rename decision.
- Promoter capture folded inside the award `$transaction` (no orphan stub on fail-closed); `resolveFactUpdateWithCapture`
  is the named seam; "claimable" overstatement removed; WL-P3-44/45/47 resolved.
- `ubiquitous-language.md` updated with "recruited-coach placeholder" and "doorless placeholder" terms.

**G-010 review queue (TASK_08 / 031b73fa):**
- `/app/belt-reviews` AdminCollection queue for `PENDING PROMOTER_CHANGED` reviews.
- Inline Approve (verifies RankEntry → APPROVED) / Dismiss (DENIED) with `adminActionClient` authz + audit.
- `beltReviews` permission added to roles.ts + admin-sections.ts + sidebar.

**Join-wizard rich-belt parity (TASK_09 / e6ef5ff1):**
- `lineage-step.tsx` rank picker upgraded to `variant="belt" size="sm"` BeltSwatch — matches claim picker.

**Giddy follow-ups F1–F6 (TASK_11–14 / cc42aa03 + c3da2512):**
- F1: `findMatchedOpenLead` threshold raised to 1 (exact-normalized, coherent with placeholder side); John/Jon
  near-miss coherence test added to `emit-promoter-lead.test.ts`.
- F2: `verifyRankEntryInTransaction` extracted to `verify-rank-entry-core.ts` (`import "server-only"`, not
  `"use server"`); `rank-reviews/actions.ts` imports from core directly.
- F3: inline binary-moderation ratified as a sanctioned AdminCollection sub-pattern in ADR 0047 Consequences
  (exempt from D2 row→detail rule when: single status enum, reversible, RBAC-gated).
- F4/F5: ADR 0047 D4 tx-coupling tradeoff noted + D5 admin-skips-trust note added (intentional).
- F6: `verifyRankEntryInTransaction` added to `rankentry-unification-epic.md` G relocate list.

**Gates:** typecheck clean · format:check clean · lint warnings pre-existing (not in diff) · unit tests 4/4 +
5/5 · next build in CI (e2e in CI).

## Next session

### Goal

Open PR #210 merge + quality loops: run `/pr-fix-loop` on PR #210 (`session-0542-belt-review-remediation`),
verify CI green, close the merge. Then ledger sweep: close the SESSION_0541 resolved WL/D/G ledger rows, check
the `rankentry-unification-epic.md` epic D milestone.

### First task

Check PR #210 CI status (`gh pr checks 210`). If green: push this branch + open PR for the SESSION_0541
work, then merge PR #210. If CI is red on #210: run `/pr-fix-loop` on #210 first. The SESSION_0541 work is
ready to push (gates passed) — operator "go" needed.
