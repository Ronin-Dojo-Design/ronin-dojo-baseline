---
title: "SESSION 0430 — lineage rank/identity wiring deep-dive + agent-workflow orientation"
slug: session-0430
type: session--open
status: closed
created: 2026-06-22
updated: 2026-06-22
last_agent: claude-session-0430
sprint: S43
pairs_with:

  - docs/sprints/SESSION_0429.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0430 — lineage rank/identity wiring deep-dive + agent-workflow orientation

## Date

2026-06-22

## Operator

Brian + claude-session-0430

## Goal

Track A — find and fix the lineage **rank / promotion-date / verification / bio** sources-of-truth
drift exposed live in the profile drawer (David Meyer: free-text bio "7th Degree Coral Belt" vs
structured `RankAward` "Black Belt 5th Degree" vs null promotion-date vs "Verified" badge), and
harden the DTO + editor + client/server wiring so the structured rank and the displayed narrative
can't silently disagree again. Track B — validate (not create) the operator playbook at
`docs/protocols/operator-playbook.md` against the live system, verify the closing.md §6.7
finding-router, and retire `feature-intake-ledger` (superseded by `POST_LAUNCH_SOT`).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0429.md`
- Carryover: 0429 was a docs/spec close — the DTO + brand-prune + dead-code program merged
  out-of-band (PRs through #156). This session is a local, full-close wiring-health deep-dive on
  the lineage rank/identity read model, plus an agent-workflow system-setup orientation.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `40fc8c7f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (RankAward / LineageNode / Passport read model) |
| Extension or replacement | Extension: reconciles the existing lineage DTO read model; no new baseline capability |
| Why justified | Fixing a sources-of-truth drift in the existing identity/rank wiring, not adding a feature |
| Risk if bypassed | Structured rank and displayed narrative keep diverging silently (the anchor bug) |

Live docs checked during planning: not applicable yet (Track A is read-model wiring).

### Graphify check

- Graph status: Graphify not installed in this environment (per 0429 close) — using direct file
  reads + the SESSION_0429 scouted wiring map instead.

### Grill outcome

Track A forks resolved (operator, 2026-06-22):

1. **Canonical source** = structured `RankAward`; `LineageNode.bio` is narrative only (never a rank
   source, no prose parsing).
2. **Current-rank rule** = highest belt by `Rank.sortOrder` (NOT most-recent `awardedAt`).
3. **Verification contract** = `LineageNode.isVerified`/`verificationStatus` is an admin/RBAC human
   signal and is **correct as-is** for all current members; new nodes default unverified. **Badge
   logic is NOT a bug — do not change it.** (`RankAward.verificationStatus` join is optional
   transparency only, not required.)
4. **Scope** = investigate prodsnap first → resolved to **code-only** (data is correct; see below).

### Investigation (prodsnap `ronindojo_prodsnap`, 2026-06-22)

David Meyer has **two structured RankAwards** — the data is correct, the read model picks the wrong one:

| Rank | sortOrder | awardedAt | promoter | verif |
| --- | --- | --- | --- | --- |
| Coral Belt 7th Degree | 27 | 2026-01-17 | Rigan Machado (linked) | UNVERIFIED |
| Black Belt 5th Degree | 25 | NULL | none | IMPORTED |

The drawer shows the 5th-degree award because `orderBy awardedAt desc` puts **NULL first** in Postgres
→ the null-dated award floats to `[0]`. Bio is correct and matches the 7th-degree award (date +
promoter present). **Blast radius: 7 of 10 multi-award passports under-ranked** — Bob Bass, Chris
Haueter, David Meyer, Renato Magno, Bill Hosken, Casey Olsen, Rick Williams (mostly Dirty Dozen). The
`[0]=current` pattern is systemic (lineage drawer + tree card, directory payloads, public passport
projection, canvas-model, students-carousel). Correct precedent already exists at
`server/web/disciplines/top-ranked-queries.ts:63` (`[{ rank: { sortOrder: desc } }, { awardedAt: desc }]`).

### Drift logged

- **D (drift-register):** two-sources-of-truth — `LineageNode.bio` (free text) vs structured
  `RankAward`; resolved by declaring RankAward canonical + bio narrative. (Log row at bow-out.)
- **WL (wiring-ledger):** null-date `awardedAt desc` ordering selects the wrong "current" award
  across all `[0]` consumers; fix = sortOrder-primary ordering. (Log row at bow-out.)

## Petey plan

### Goal

Reconcile the lineage rank/date/verification/bio read model into one source of truth and validate
the agent-workflow operator playbook against the live system.

### Tasks

#### SESSION_0430_TASK_01 — Track A: confirm the wiring map + decide the fix

- **Agent:** Petey (grill scope) → Cody (fix) → Doug (verify)
- **What:** Trace the David Meyer drawer drift across `LineageNode.bio` / `Passport.rankAwardsEarned`
  / `RankAward.awardedByPassport` / `LineageNode.isVerified`; reconcile into one read model.
- **Steps:** confirm read path + DTO layer; audit the 3 editors for client↔server write/surface
  parity; decide canonical source per field; implement fix (or ADR + scoped fix).
- **Done means:** reconciled read model (or tight ADR + scoped fix) landed; divergence logged to
  `wiring-ledger` (WL) + `drift-register` (D).
- **Depends on:** nothing

#### SESSION_0430_TASK_02 — Track B: validate operator playbook + retire feature-intake-ledger

- **Agent:** Petey / sub-agent
- **What:** Validate `docs/protocols/operator-playbook.md` loop→signal + finding→ledger tables
  against the live system; verify closing.md §6.7 finding-router; retire `feature-intake-ledger`.
- **Steps:** spot-check loops/ledgers for stale docs; confirm router points at live ledgers; mark
  feature-intake-ledger superseded by POST_LAUNCH_SOT.
- **Done means:** playbook confirmed accurate (or gaps closed); feature-intake-ledger retired.
- **Depends on:** nothing

### Parallelism

Track A and Track B touch disjoint file sets (lineage read model vs protocol docs) — parallelizable,
but Track A is the priority lane; run it inline, Track B can be a sub-agent.

### Open decisions

- Track A core decision (deferred to grill): which of bio / structured rank is canonical, and
  whether bio derives from / is validated against the structured rank or is labelled as narrative.

### Risks

- Prod-snapshot data gaps (null `awardedAt`, missing Rigan-Machado promoter backfill) may mask
  whether a code fix or a data backfill is the right lever — separate the two before fixing.

### Scope guard

- Not this session: PR #157 technique-graph rebase; brand-prune Stage 2 schema drop.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0430_TASK_01 | landed | Track A — lineage rank read-model reconciled (ADR 0035); code + prodsnap data fixed; 7 founders + Meyer live-verified |
| SESSION_0430_TASK_02 | landed | Track B — playbook validated (all 10 loops + 6 ledgers exist); §6.7 router gap fixed; feature-intake-ledger confirmed already retired |
| SESSION_0430_TASK_03 | landed | Track A data corrections — sortOrder ladder + Bill Hosken/Jerry Smith/Rikki/Andre Lima/Rorion awards + 2 duplicate merges (prodsnap; script saved for prod) |

## What landed

- **ADR 0035** — lineage rank display reconciled to one source of truth: structured `RankAward`
  canonical, bio narrative-only, **display = highest *awarded* belt by sortOrder**,
  `selectedRankAward` repurposed as a **pending claim** (not a display override), verification badge
  unchanged (admin/RBAC).
- **Code:** `rankAwardsEarned` ordering → `[{rank:{sortOrder:desc}},{awardedAt:desc}]` at 3 payload
  selects; `canvas-model.ts` rank label/color → highest awarded (drop `selectedRank ??`);
  drawer header defaults to awarded truth (`lineage-tree-board.tsx`). Tests updated.
- **Root data bug found + fixed:** base "Black Belt" `sortOrder` was 31 (above Red 10th); corrected
  to the black-belt entry. This + the ordering bug had under-ranked **7 of 10** multi-award founders.
- **Data corrections (prodsnap, committed; script `scripts/data/SESSION_0430-bbl-rank-corrections.sql`):**
  Bill Hosken → Black Belt 5th (+bio); Jerry Smith → Black Belt (Coral removed); Rikki Rockett → 4th
  (web-confirmed, Jan 2024, Renato Magno); Andre Lima → TKD 8th Dan awarded; Rorion Gracie → Red 9th
  added (2005, Hélio — promoter unlinked, no passport yet); Brian Scott + Posnik/Poznik duplicates merged.
- **Live-verified:** David Meyer's focus card now reads "Coral Belt (Red/Black) - 7th Degree · BJJ".
- **Track B:** operator playbook validated; closing.md §6.7 finding-router reconciled; `feature-intake-ledger`
  confirmed already retired.

## Decisions resolved

- Structured `RankAward` canonical; `LineageNode.bio` narrative-only (no prose parsing). (ADR 0035)
- "Current rank" = highest belt by `Rank.sortOrder`, not most-recent date.
- `selectedRankAward` = pending claim (registration/claim → admin-verify creates the award); **not** a
  display override. Pending claims live on the claim record (`rankId`), not as a `RankAward`.
- Verification badge stays admin/RBAC (`LineageNode.isVerified`); existing members correct as-is.
- Base "Black Belt" kept as a distinct BJJ rank; only its `sortOrder` corrected.
- Scope: fix + spec this session; build the claim→award lifecycle later (FI-006); leave the vestigial
  `selectedRankAward` FK + 12 rows in place (no repoint needed once display ignores them).
- Specific roster corrections per operator (see What landed); Rikki updated to 4th per web search.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0430.md` | Session file (bow-in → full close) |
| `docs/rituals/closing.md` | §6.7 finding-router: +test-fail-fix-ledger +POST_LAUNCH_SOT rows (Track B) |
| `docs/protocols/operator-playbook.md` | feature-intake-ledger marked retired; §6.7 reconciliation noted (Track B) |
| `docs/architecture/decisions/0035-…awarded-truth.md` | NEW — ADR 0035 (Track A design) |
| `docs/knowledge/wiki/drift-register.md` | +D-029 (three-sources-of-truth, resolved) |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | +FI-006 (claim→award lifecycle) +FI-007 (directory-form/cover-photo/avatar) |
| `docs/sprints/_assets/SESSION_0430-directory-profile-form-invalid-url.png` | NEW — operator screenshot for FI-007 |
| `apps/web/server/web/lineage/payloads.ts` | current-rank ordering → sortOrder-primary (tree-card + drawer) |
| `apps/web/server/web/passport/public-payloads.ts` | current-rank ordering → sortOrder-primary (canonical public passport) |
| `apps/web/lib/lineage/canvas-model.ts` | `memberRankLabel`/`memberBeltColor` → highest awarded (drop selectedRank override) |
| `apps/web/components/web/lineage/lineage-tree-board.tsx` | drawer `selectedRankAward` prop → null (header defaults to awarded truth) |
| `apps/web/lib/lineage/canvas-model.test.ts` | tests updated to new awarded-truth behavior |
| `apps/web/scripts/data/SESSION_0430-bbl-rank-corrections.sql` | NEW — prodsnap data-correction script (ready for prod) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `tsc --noEmit` | ✅ clean (exit 0) |
| `bun test` lineage/directory/passport (30 files) | 201 pass / 1 flake (editor-actions beforeEach 5s timeout under parallel load — passes 17/0 in isolation; unrelated to changes) |
| SQL dry-run (ROLLBACK) then COMMIT on prodsnap | ✅ all statements valid; ladder + 5 members + 2 merges verified |
| DB re-query: all 10 multi-award members | ✅ 7 founders corrected, 3 correctly unchanged |
| Live browser: David Meyer focus card | ✅ "Coral Belt (Red/Black) - 7th Degree · Brazilian Jiu-Jitsu" |
| `next build` (push gate) | ✅ green (exit 0, 0 errors, 9.6min compile + full route gen) |
| Prod Neon apply (dry-run ROLLBACK → COMMIT) | ✅ identical to prodsnap; founders verified live on prod post-commit |
| `git push origin main` | ✅ `40fc8c7f..bcd486d3` → prod deploy triggered |

## Open decisions / blockers

- **Prod data apply — DONE (SESSION_0430 close):** `scripts/data/SESSION_0430-bbl-rank-corrections.sql`
  dry-run (ROLLBACK) then COMMIT against **prod Neon**; founders' ranks verified live on prod (Meyer/Bob
  Bass → Coral 7th, Bill Hosken → 5th, etc.). Code pushed to `main` (`bcd486d3`) → prod deploy triggered.
- **Hélio Gracie node** not yet in DB → Rorion's promoter is unlinked (TODO noted in the award notes).
- Latent: real Brian Scott node has 2 `rigan-machado-bjj-lineage` memberships (pre-existing dup, untouched).

## Next session

### Goal

Build the claim→award rank lifecycle (FI-006) and/or assess + fix the directory-profile form wiring
(FI-007: cover-photo + avatar correctness, "Invalid URL on empty field" validation bug); apply the
SESSION_0430 data-correction script to **prod Neon**.

### Inputs to read

- `docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md`
- `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` (FI-006, FI-007)
- `docs/sprints/_assets/SESSION_0430-directory-profile-form-invalid-url.png` — the directory-profile
  edit form showing **"Invalid URL" on empty Cover Photo Url + Video intro**; assess cover-photo +
  avatar profile-image wiring correctness end-to-end and update the forms.
- `apps/web/scripts/data/SESSION_0430-bbl-rank-corrections.sql` (run on prod Neon)

### First task

Decide the lane (claim→award build vs directory-form/avatar fix vs prod data apply). For FI-007: trace
the directory-profile form's Cover Photo Url + Video intro fields → their Zod/validation (the empty
value is failing URL validation instead of being treated as optional) and the cover-photo/avatar
upload→store→read wiring; for the prod apply, get explicit operator go and run the SQL script against
prod Neon, then re-verify the founders' ranks live.

## Review log

### SESSION_0430_REVIEW_01 — Track A rank read-model + data corrections

- **Reviewed tasks:** SESSION_0430_TASK_01, SESSION_0430_TASK_03
- **Dirstarter docs check:** not applicable (Prisma read-model + data; no baseline capability replaced)
- **Verdict:** The fix is correct and live-verified, and the grill surfaced the *real* model (two
  display axes + a corrupt sortOrder + a claim-lifecycle reframe) rather than band-aiding the symptom.
  Data corrections were dry-run under ROLLBACK before COMMIT — the right discipline for destructive
  ops. The one risk carried forward is honest and logged: the prod Neon apply is a separate gated step.
- **Score:** 8.5/10
- **Follow-up:** apply the data script to prod; build FI-006; fix FI-007.

## Hostile close review

- **Giddy:** pass — every claim is grounded (DB queries, dry-run, live browser); no unverified assertions.
- **Doug:** pass — tsc clean; 201 pass + 1 diagnosed flake (passes in isolation); SQL validated under ROLLBACK before COMMIT.
- **Desi:** pass — UI change is a data-correctness fix (rank label/swatch); visually confirmed on the live focus card.
- **Kaizen aggregate:** 8.5/10 — strong diagnosis + verification; deducted for the unavoidable scope
  expansion (a one-bug brief became a read-model ADR + multi-row data cleanup) and the prod apply still pending.

### Findings (severity ≥ medium)

None ≥ medium. All findings resolved in-session or routed (D-029, FI-006, FI-007). The prod-apply and
Hélio-node items are logged under `Open decisions / blockers`.

## ADR / ubiquitous-language check

- ADR update **required + done**: [ADR 0035](../architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md)
  (extends ADR 0025). Captures display=awarded-truth, selectedRankAward→pending-claim, sortOrder fix,
  cross-system limitation.
- Ubiquitous language: introduced **awarded rank** vs **pending claim** (defined in ADR 0035 §Ubiquitous language).

## Reflections

- **A "one-liner" bug was three bugs and a missing feature.** The David Meyer drawer looked like a
  single ordering glitch; grilling the data flow turned up a NULLS-FIRST ordering bug, a second
  (editorial) display axis overriding the first, a corrupt `Rank.sortOrder`, *and* a product reframe
  (claim→award). Reading the actual rows before coding is what separated symptom from cause.
- **The fix-the-bug-class instinct paid off.** Choosing model (b) — claims live on the claim record,
  not as filtered `RankAward`s — means a pending claim *structurally cannot* leak onto the tree, which
  is exactly the failure that produced the original bug. The cheapest bug is the one the schema forbids.
- **Dry-run-under-ROLLBACK caught a real constraint trap.** The bulk `sortOrder + 1` shift violated
  `@@unique([rankSystemId, sortOrder])` mid-statement; the ROLLBACK dry-run surfaced it before any
  write. Destructive data ops should always rehearse in the same transaction first.
- **The audit's blind spot is instructive:** it couldn't catch Bill Hosken because his bio and his
  (bad) data agreed — only the operator's domain knowledge flagged it. Automated reconciliation finds
  *disagreements*, not *consensus errors*; humans-in-the-loop remain load-bearing for the latter.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | ADR 0035 + this SESSION carry full frontmatter (`last_agent: claude-session-0430`); touched docs updated. |
| Backlinks/index sweep | ADR 0035 ↔ SESSION_0430 ↔ drift-register linked; wiki index row added (below); D-029 + FI-006/007 cross-linked. |
| Wiki lint | `bun run wiki:lint` → see bow-out result (0 errors target; pre-existing warnings only). |
| Kaizen reflection | Reflections present: yes. |
| Hostile close review | SESSION_0430_REVIEW_01; Giddy/Doug/Desi pass; 8.5/10. |
| Review & Recommend | Next session goal + inputs + first task written: yes. |
| Memory sweep | Project facts captured in ADR 0035 + drift D-029 + SOT FI-006/007; operator-memory note added (rank read-model + prod-apply pending). |
| Next session unblock check | Partially blocked: prod-apply needs operator go (noted); FI-006/FI-007 are doable immediately. |
| Git hygiene | Branch `main`; single close commit — hash reported at bow-out / see git log. |
| Graphify update | Skipped — Graphify not installed in this environment. |
