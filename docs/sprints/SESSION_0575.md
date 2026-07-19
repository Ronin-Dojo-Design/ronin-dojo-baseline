---
title: "SESSION 0575 — Governance hygiene: ledger-ID mechanization + multi-brand supersession sweep"
slug: session-0575
type: session--implement
status: closed
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0575
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0573.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0575 — Governance hygiene: ledger-ID mechanization + multi-brand supersession sweep

## Date

2026-07-19

## Operator

Brian + claude-session-0575

## Goal

Parallel overnight docs/governance lane (operator goal election C — session number pinned to 0575;
SESSION_0574/0576/0577 and `docs/product/mammoth-build/*` are other lanes' territory, untouched).
Bundle the top-3 coherent docs/governance backlog items on one axis (ledger hygiene, docs-only,
no deploy): mechanize the FS-0030 ledger-ID uniqueness rule, close the WL-P2-9 / ADR 0008 / MB-003
multi-brand supersession chain, and sweep remaining open WL rows against the four ratified
supersessions (single-brand collapse, RankAward→RankEntry, /admin retirement, oRPC full adoption).
Commit locally on `main`; NO push (hold for morning go).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0573.md`
- Carryover: 0573 charted the MMB wayfinder epics and pointed next-session at MMB ticket #233 —
  that lane belongs to the parallel MMB sessions; this session takes the ledger-backlog
  docs/governance lane instead (operator election C in the bow-in args, which wins per precedence).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app` (canonical checkout)
- Status at bow-in: clean, in sync with `origin/main`
- Current HEAD at bow-in: `37718d13`

### Graphify check

- Graph status: current; stats at bow-in: 18746 nodes, 35683 edges, 2527 communities.
- Queries used:
  - `wiring ledger superseded brand switcher ADR 0008 single-brand collapse manual boundary MB-003`
- Files selected from graph:
  - `docs/architecture/decisions/0008-brand-switcher.md` (status still `accepted`)
  - `docs/security/brand-scope-hardening-plan.md` (already carries "SUPERSEDED — single-brand collapse, ADR 0034" markers)
  - `docs/knowledge/wiki/manual-boundary-registry.md` (MB-003 still open)
- Verification note: all three opened and read after Graphify; the supersession is ratified
  (ADR 0034) but never conformed onto ADR 0008 / MB-003 / WL-P2-9 — Graphify used as
  navigation, confirmation by direct inspection.

### Ledger scan (opening.md §1b)

- `bun scripts/ledger-backlog.ts` — 82 open items (GL 15 · WL 51 · FI 4 · RISK 9 · FS 1 · D 1 · TFF 1).
- `bun scripts/board-backlog.ts --top=10` — board top is FI-001 / G-002 / RISK #2, all app-code
  lanes excluded by the operator's docs-only pin; fell through to ledger rank for docs/governance
  candidates per the pinned election.
- Excluded candidates: WL-P2-6 / WL-P2-7 (both need product decisions — grill lanes, operator not
  present), D-025 (script *code* fix, not docs), TFF-006 (needs local repro).

## Petey plan

### Goal

Land the top-3 docs/governance backlog items as one coherent ledger-hygiene lane: FS-0030
mechanization, the WL-P2-9 supersession close, and the superseded-WL-row sweep.

### Tasks

#### SESSION_0575_TASK_01 — FS-0030 mechanization: `scripts/ledger-id-next.ts`

- **Agent:** Cody (inline)
- **What:** Build the read-only ledger-ID helper FS-0030 names as its open mechanization.
- **Steps:**
  1. `scripts/ledger-id-next.ts` (bun/TS, sibling of `ledger-backlog.ts`): `--prefix=FI` prints the
     first ID with zero hits across `docs/` (the FS-0030 corrective rule, mechanized);
     `--check` scans all known prefixes for IDs defined in more than one ledger-authority location.
  2. Read-only guarantee: the script never writes; output is advisory.
  3. Update FS-0030 status: mitigated (manual rule) → mitigated (mechanized) with the script path.
  4. Pointer in `docs/protocols/llm-wiki-schema.md` ID-assignment guidance (if such a section exists — do not invent one).
- **Done means:** script runs green on the current docs tree; FS-0030 row updated; no writes performed by the tool.
- **Depends on:** nothing

#### SESSION_0575_TASK_02 — WL-P2-9 supersession close (ADR 0008 + MB-003)

- **Agent:** Cody (inline)
- **What:** Conform the ratified single-brand collapse (ADR 0034) onto the three stale authorities.
- **Steps:**
  1. ADR 0008 frontmatter `status: accepted` → `superseded`; Status section notes supersession by
     ADR 0034 (single-brand collapse) with a one-line why; body preserved (append-only history).
  2. MB-003 in `manual-boundary-registry.md`: open → closed-superseded with the same pointer.
  3. WL-P2-9 row in `wiring-ledger.md`: open → resolved-superseded (ADR 0034; SESSION_0575).
- **Done means:** all three authorities agree; no doc still claims a multi-brand switcher is pending proof.
- **Depends on:** nothing

#### SESSION_0575_TASK_03 — Superseded-WL-row sweep (four ratified deaths)

- **Agent:** Cody (inline), Giddy lens at close
- **What:** Audit remaining open WL rows against the four ratified supersessions — single-brand
  collapse (ADR 0034), RankAward→RankEntry (0523 KISS mandate), /admin retirement, oRPC full
  adoption (SOT-ADR D3) — and close what is dead with pointers.
- **Steps:**
  1. Grep open WL rows for brand-enum / RankAward / `/admin/` / next-safe-action dependencies.
  2. For each hit, verify against the ratifying decision doc before closing (no close on keyword match alone).
  3. Close as resolved-superseded with decision pointer + SESSION_0575 stamp; ambiguous rows stay open with a note.
- **Done means:** every closed row carries a decision pointer; ambiguous rows explicitly annotated, not closed.
- **Depends on:** SESSION_0575_TASK_02 (same file; sequential to avoid conflicting edits)

### Parallelism

All inline and sequential — TASK_02 and TASK_03 edit `wiring-ledger.md` (same file), and TASK_01
is a single small script; fan-out unjustified (CLAUDE.md one-file rule; operator pinned inline
execution, personas only where genuinely disjoint — none are).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0575_TASK_01 | Cody (inline) | single read-only script + two doc rows |
| SESSION_0575_TASK_02 | Cody (inline) | three-file docs conform of a ratified decision |
| SESSION_0575_TASK_03 | Cody (inline) | same-file sweep, sequential after TASK_02 |

### Open decisions

None — the supersessions being conformed are already ratified (ADR 0034, SOT-ADR D3, 0523 mandate);
this session records them, it does not decide them.

### Risks

- Over-closing in TASK_03: a row that *mentions* a dead system may still carry a live obligation —
  mitigated by verify-before-close (step 2) and annotate-don't-close for ambiguity.
- Parallel-session collision: 0574/0576/0577 may also touch ledgers — mitigated by scope pin
  (this session touches only the files listed here; no mammoth-build, no other SESSION files).

### Scope guard

- No app code, no schema, no deploys — docs + one read-only script only.
- Do NOT touch `docs/sprints/SESSION_0574/0576/0577*` or `docs/product/mammoth-build/*`.
- Do NOT prune the ~170 `getRequestBrand` sites (that is the separate app-code prune epic).
- Do NOT decide WL-P2-6 / WL-P2-7 product questions — they stay open for a grill session.
- NO push — commit locally and hold for the morning go.

## Cody pre-flight

Abbreviated per template rule (pure docs/governance work; the one script is repo tooling, not app code).

### Pre-flight: all tasks

- Existing tooling scan: `scripts/ledger-backlog.ts` read — `ledger-id-next.ts` mirrors its
  conventions (bun, read-only, docs-tree scan) rather than inventing a new pattern.
- Lane docs loaded: FS-0030 (failed-steps-log), WL-P2-9 row, ADR 0008, MB-003,
  `agent-systems-map.md` §1 router + §4 allowed-vs-never (named read done at bow-in).
- FAILED_STEPS check: FS-0030 is itself the lane; FS-0033 (false-negative filesystem assertion)
  acknowledged — every "row is stale" claim verified by opening the ratifying doc, never from
  grep silence.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0575_TASK_01 | landed | `scripts/ledger-id-next.ts` (next-free + `--check` dup/phantom detector, pad-tolerant `0*` matching); FS-0030 → mitigated (mechanized); closing.md §6.7 read-path hook |
| SESSION_0575_TASK_02 | landed | ADR 0008 → superseded (ADR 0034, mirrors ADR 0026 convention); MB-003 closed-superseded (row + narrative); WL-P2-9 → ✅ resolved; loop-board card moved to done |
| SESSION_0575_TASK_03 | landed | WL-P3-37 dup collision fixed (0534 row → WL-P3-55, provenance note); WL-P2-8 paths conformed `/admin`→`/app`; WL-P2-43 fix-direction conformed to SOT-ADR D3; WL-P2-33/47 verified live, untouched |

## What landed

- **FS-0030 mechanized:** `scripts/ledger-id-next.ts` — `--prefix=<X>` prints the next safe ledger ID
  (max+1 over every occurrence in `docs/`, references count, archives included, `0*` pad-tolerant);
  `--check` flags IDs defined in >1 place (exit 1) + phantom references (informational). Wired into
  the bow-out read-path at closing.md §6.7 (where IDs get minted). Read-only by design.
- **The tool caught a live collision on first run:** WL-P3-37 was defined twice in the wiring ledger
  (SESSION_0520 certificates row vs SESSION_0534 memberships/invites row). Second-minted row
  renumbered to WL-P3-55 with a provenance note; sprint history untouched (append-only).
- **Multi-brand supersession chain conformed:** ADR 0008 (brand switcher) `accepted` → `superseded`
  by ADR 0034 (single-brand collapse), following the ADR 0026 supersession format; MB-003
  closed-superseded in the manual-boundary registry (row + narrative); WL-P2-9 flipped to
  ✅ resolved; the `WL:WL-P2-9` loop-board card moved to done (`board-mark-done.ts`, 1 of 1).
- **Sweep of open WL rows vs the four ratified deaths** (single-brand collapse, RankAward→RankEntry,
  `/admin` retirement, oRPC full adoption): WL-P2-8's monitor paths conformed to `/app/*` (verified
  by `find` — `/admin` route tree is gone, `app/app/{billing,storage}/monitoring` exist); WL-P2-43's
  fix redirected from "extend the retiring safe-actions seam" to "migrate the 2 bypass files to oRPC"
  (SOT-ADR D3 verified); WL-P2-33 and WL-P2-47 mention dead-system names but carry live obligations —
  verified against their sources and left open.
- Backlog deltas: WL 51 → 50 open; FS 1 → 0 open; board 84 → 83 open cards.

## Decisions resolved

- None ratified here — this session *conformed* already-ratified decisions (ADR 0034, SOT-ADR D3,
  the 0523 RankEntry mandate, admin retirement) onto stale rows. WL-P2-6 / WL-P2-7 deliberately left
  for an operator grill (product decisions).

## Files touched

| File | Change |
| --- | --- |
| `scripts/ledger-id-next.ts` | NEW — FS-0030 mechanization (next-free ID + dup/phantom check, read-only) |
| `docs/protocols/failed-steps-log.md` | FS-0030: mechanization recorded, status → mitigated (mechanized) |
| `docs/rituals/closing.md` | §6.7 finding router: ID-assignment rule now points at the script |
| `docs/architecture/decisions/0008-brand-switcher.md` | status → superseded by ADR 0034 (ADR 0026 format) |
| `docs/knowledge/wiki/manual-boundary-registry.md` | MB-003 → closed-superseded (row + narrative) |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P2-9 ✅ resolved; WL-P3-37 dup → WL-P3-55; WL-P2-8 path conform; WL-P2-43 direction conform |
| `docs/sprints/SESSION_0575.md` | this file |
| `docs/knowledge/wiki/index.md` | SESSION_0575 row added |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun scripts/ledger-id-next.ts --prefix=FI\|FS\|WL-P2\|WL-P3` | runs green; FI-030 / FS-0343 / WL-P2-68 / WL-P3-55 |
| `bun scripts/ledger-id-next.ts --check` | 0 duplicate definitions (was 1 — WL-P3-37, fixed); 36 phantoms (informational — resolved-row deletions + citation typos like FS-0342) |
| `bun scripts/ledger-backlog.ts` | WL 50 · FS 0 (was WL 51 · FS 1); WL-P2-9 gone from open rows |
| `bun scripts/board-mark-done.ts WL:WL-P2-9` | moved → done (1 of 1) |
| `bunx oxlint scripts/ledger-id-next.ts` | clean |
| `bun run wiki:lint` | 0 errors; all warnings pre-existing (none in touched files after frontmatter bumps) |
| oxfmt | n/a — root `scripts/` are outside the apps/web oxfmt gate (sibling `ledger-backlog.ts` also fails default-config check); style mirrors sibling |
| App gates (typecheck/tests/build) | n/a — no `apps/web` source touched (`ledger-parse.ts` untouched); docs + root script only, no deploy trigger |

## Open decisions / blockers

- **Push held for the morning go** (operator directive) — one local commit on `main`, nothing pushed.
- Phantom-reference cleanup (36 IDs cited but defined nowhere, e.g. `FS-0342`/`FS-0186` in
  0345–0349-era sprints) left alone: sprints are append-only history and the numbers stay retired;
  fix only if a citation actively misleads. No ledger row needed — `--check` reports them on demand.

## Next session

### Goal

Morning: review the SESSION_0575 diff, give (or withhold) the push word; then resume the operator's
board order (FI-001 / G-002 / RISK #2) or the lane the parallel 0574/0576/0577 sessions surface.

### First task

`git show --stat HEAD` on the canonical checkout to review this session's single commit, then the
explicit push decision. Optional follow-on in the same governance lane: grill WL-P2-6 / WL-P2-7
(the two legacy-doc product decisions this session deliberately did not make).

## Review log

### SESSION_0575_REVIEW_01 — Governance-lane close review

- **Reviewed tasks:** SESSION_0575_TASK_01…03
- **Dirstarter docs check:** not applicable — docs + repo tooling only; no L1 area touched
- **Verdict:** Tight, in-lane session: three coherent ledger-hygiene items, each conforming an
  already-ratified decision rather than minting a new one. The new tool proved itself immediately
  (live WL-P3-37 collision found and fixed in the same session). Honest limits: `--check`'s
  definition matchers are convention-bound (em-dash headings, first-cell table rows) so a ledger
  that breaks convention would evade it; phantom output is deliberately advisory to avoid
  false-alarm fatigue.
- **Score:** 8.5/10 (cap: matcher convention-coupling; no runtime surface to prove beyond CLI runs)
- **Follow-up:** WL-P2-6/7 grill queued as the natural next governance slice.

## Hostile close review

- **Giddy:** pass — supersession follows the ADR 0026 house format; append-only history respected
  (sprints untouched, renumber carries provenance); the closing.md edit is a one-paragraph read-path
  hook explicitly anticipated by FS-0030's own corrective-action text, not a new rule minted from
  nowhere. Flag for the operator: a ritual doc was edited without a live sign-off — surfaced here
  and in the morning summary rather than buried.
- **Doug:** pass — docs + one read-only script; all three script modes smoke-run on the real tree;
  every close/annotation verified against its ratifying source (ADR 0034, SOT-ADR D3 §128–130,
  `find` on the route tree) — no negative asserted from grep silence (FS-0033 discipline); gates
  green (wiki:lint 0 errors, oxlint clean); no push.
- **Desi:** not applicable — no UI touched.
- **Kaizen aggregate:** 8.5/10 — small, verified, self-proving lane; value concentrated in the tool
  catching real debt on first run.

## ADR / ubiquitous-language check

- ADR update required and done: ADR 0008 → superseded (ADR 0034). No new ADR minted — nothing here
  reached the ADR bar; every change conforms existing decisions.
- Ubiquitous language update not required — "phantom reference" introduced only as CLI output
  vocabulary, defined in the script header and FS-0030 entry.

## Reflections

The session's thesis held: mechanizing a governance rule pays back immediately. The dup detector
found a real, live ID collision (WL-P3-37) on its first run against the tree — the exact FS-0030
failure class, sitting undetected in the canonical ledger since SESSION_0534. Rules enforced by
"remember to grep" decay; rules enforced by a script in the ritual read-path don't.

Second lesson: the first version of the matcher produced 45 phantoms, 9 of which were my own bug
(pad-variant mismatch — `WL-P2-06` vs `WL-P2-6`). FS-0030's original corrective text already
contained the answer (`grep "<PREFIX>-0*NNN"`); reading the ledger entry *carefully* before
implementing would have saved an iteration. The remaining 36 phantoms taught something real about
the ledger lifecycle: resolved wiring rows get *deleted*, not just flipped, so "referenced but
defined nowhere" is the normal fossil record of closed work — which is why phantom output is
informational, never a failing check.

Scope discipline held under temptation: WL-P2-33 and WL-P2-47 both name dead systems (RankAward,
safe-actions) and would have been easy over-closes; opening their sources showed live obligations.
The sweep's rule — close only what the ratifying doc proves dead, annotate the rest — is the right
default for autonomous ledger work.

## Full close evidence

| Step | Proof |
| --- | --- |
| Gate runner | `bash scripts/bow-out-gates.sh` — run pre-commit; result in bow-out chat line |
| JETTY/frontmatter sweep | 5 touched docs bumped to `updated: 2026-07-19` + `last_agent: claude-session-0575` (ADR 0008, wiring-ledger, manual-boundary-registry, closing.md, this file) |
| Backlinks/index sweep | wiki index: SESSION_0575 row added; pairs_with → SESSION_0573 (0574 belongs to a parallel lane, not this file's chain) |
| Wiki lint | 0 errors; touched-file warnings cleared by frontmatter bumps |
| Kaizen reflection | Reflections above |
| Hostile close review | SESSION_0575_REVIEW_01 + Giddy/Doug pass above |
| Code-quality gate (Class-A) | `scripts/ledger-id-next.ts` is repo tooling (Class-C lane), oxlint clean, read-only by design |
| Runtime verification (Doug) | CLI smoke: all three modes run green on the real docs tree; no app runtime surface touched |
| Review & Recommend | Next session = morning push decision, then board order / WL-P2-6+7 grill |
| Memory sweep | nothing memory-worthy beyond what the repo now records (FS-0030 entry + closing.md carry the mechanism; no new memory files) |
| Ledger cross-off | WL-P2-9 ✅ + board card done; FS-0030 → mitigated (mechanized); MB-003 closed-superseded — all stamped SESSION_0575 |
| Deferral guard | run pre-commit — result in bow-out chat line |
| Next session unblock check | unblocked — push decision needs only the operator's word; WL-P2-6/7 grill needs only operator presence |
| Git hygiene | single local commit on `main`, NO push (operator hold) — hash in bow-out chat line |
| Graphify update | run post-commit — stats in bow-out chat line |
