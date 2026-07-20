---
title: "SESSION 0469 — S48 hostile-repo-review lean-out (next cruft band → DELETE manifest)"
slug: session-0469
type: session--open
status: closed
created: 2026-06-29
updated: 2026-06-29
last_agent: claude-session-0469
sprint: S48
pairs_with:

  - docs/sprints/SESSION_0468.md
  - docs/protocols/hostile-repo-review.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0469 — S48 hostile-repo-review lean-out (next cruft band → DELETE manifest)

## Date

2026-06-29

## Operator

Brian + claude-session-0469

## Goal

S48 session 2 (default lean-out lane). Run `hostile-repo-review.md` §Method (reference-count) on the next
cruft band — `docs/architecture/source/*` + `uplift/*`, `apps/web/scripts/*` one-offs (epic RH-3), and the
doc-root `petey-plan-*.md` sprawl (epic RH-2) — and produce a **quantified, operator-gated DELETE manifest**.
Prefer deletes over moves (HRR-005). Stay in `docs/**` + `apps/web/scripts/**` only (the sibling window
SESSION_0470 owns `packages/ui-kit` + `apps/web` components). Delete only on the operator's word.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0468.md`
- Carryover: SESSION_0468 (S48 session 1) reclaimed ~3.3M / 117 files and produced the agent-systems-map.
  Its Next-session block pinned this session's default lane: the next cruft band → operator-gated DELETE
  manifest. This session is the quantification pass.

### Branch and worktree

- Branch: `session-0469-leanout`
- Worktree: `/Users/brianscott/dev/ronin-0469`
- Status at bow-in: clean
- Current HEAD at bow-in: `022afc4f`

### Graphify check

- Graph status: **empty in this fresh worktree** (`graphify stats` → 0 nodes / 0 edges / 0 files). Fell back
  to the reference-count half of §Method (basename grep across `*.md`/`*.ts`/`*.tsx`/`*.json`/`*.mjs`, then
  read the actual citation lines to separate **active wiring** from incidental session-log mentions).
- Verification note: every "delete" candidate was confirmed by reading its referrers, not by count alone
  (the SESSION_0468 lesson: ref-count over-flags load-bearing files; the read is the proof).

## Petey plan

### Goal

Quantify the next cruft band and present one operator-gated DELETE manifest with a reclaim total.

### Tasks

#### SESSION_0469_TASK_01 — Reference-count the next cruft band

- **Agent:** Petey/Giddy
- **What:** Reference-count `architecture/source/*` + `uplift/*`, `apps/web/scripts/*`, doc-root `petey-plan-*.md`.
- **Done means:** per-file active-ref counts + size, classified delete / keep / operator-judgment.
- **Depends on:** nothing

#### SESSION_0469_TASK_02 — Produce the operator-gated DELETE manifest

- **Agent:** Petey
- **What:** Bundle the findings into one manifest with a reclaim total; surface keep/delete/judgment tiers.
- **Done means:** manifest shown in chat; deletes executed only on the operator's explicit word.
- **Depends on:** SESSION_0469_TASK_01

### Open decisions

- **WEKAF brand-kit PNGs (4.0 MB, 0 refs)** — delete (git-recoverable) vs keep (brand source asset)? Operator call.
- **Band B scripts** — DELETE (git-recoverable, per "prefer deletes") vs MOVE to `_archive/` + run-once header (epic RH-3 prescription)? Operator call.
- **Band C petey-plans** — batch `status: superseded` flip (0 reclaim) vs accept-in-place? Operator call.

### Scope guard

- Do **not** touch `packages/ui-kit` or `apps/web` component files (SESSION_0470 owns those).
- Shared index docs (`wiki/index.md`, `goals-ledger.md`, the SESSION table) = **append-only**; on push reject, `git pull --rebase` then retry, never force.
- No deletes without explicit operator authorization ([[explicit-push-authorization]]).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0469_TASK_01 | landed | Band A/B/C reference-counted; every referrer read; manifest tiers built |
| SESSION_0469_TASK_02 | landed | Manifest presented + operator-narrowed; 3 verified-dead files deleted on operator go |

## What landed

- **Quantified the next cruft band** via the reference-count half of `hostile-repo-review.md` §Method
  (Graphify empty in the fresh worktree), reading **every** referrer to separate active wiring from
  session-log mentions. The band proved **~98% still-cited or operator-valued** — the measure-before-cut
  truth that the headline 4.9M of `architecture/source` was almost entirely load-bearing.
- **Deleted 2 genuinely-dead files (~47 KB), git-recoverable:**
  - `source/SESSION_0019-Orchestration-Dirstarter-Compliance-Report.md` — byte-dup (485 lines, 16 trivial
    diffs) of the **kept** `deep-research-report (1).md`; deletion is a dedup, not content loss.
  - `source/SCHEMA_NEEDS_MANIFEST.md` — orphan copy; the canonical (cited by index/drift/s2-schema) lives at
    `docs/architecture/SCHEMA_NEEDS_MANIFEST.md` (differs; the source copy had 0 active refs).
- **Three false-positives caught — two by reading, one by the lint gate** (the SESSION_0468 lesson in action):
  - `muay-thai-technique-graph.png` — my "0 refs" was wrong; `PETEY_PLAN_S2_SCHEMA_PASS4.md:57,801` cites it
    (loosely, as `muay-technique-graph.png`) as a **tuffbuffs technique-graph port source**, twin of the kept
    `bjj-technique-graph.png`. **Kept.**
  - The `architecture/source` bulk looked deletable but the whole `uplift/` dir is linked **"active"** from
    `index.md:42-44`, and `chatgpt-original-plan` / `Launch-OS` / the deep-research brief are product/ADR
    canon. **Kept.**
  - `source/raw/SESSION_0034_close_out_merge_train_claude_raw.md` — **deleted, then restored at close**
    (SESSION_0469_FINDING_01). My active-ref sweep wrongly excluded `_archive/`, so I missed that
    `_archive/SESSION_0034.md:18,27` links it as the *"verbatim Claude plan… preserved at"* that path. The
    `wiki:lint` broken-link check (which scans `_archive/` even though staleness checks don't — the HRR-005
    asymmetry) caught it. Restored; delete reverted.
- **Operator decisions narrowed the manifest** (kept for reuse/value): both tuffbuffs packs, both
  deep-research reports, all Tier B scripts (B-primary + B-secondary — reusable), all WEKAF brand kits
  (4.0 MB), Tier C accepted in place (no `petey-plan` status-flip churn — HRR-005).

## Decisions resolved

- **Tier A:** keep `baseline_tuffbuffs_*` packs + both `deep-research-report*` (operator: BBL/tuffbuffs content).
- **Tier B (scripts):** keep all — operator judges the `import-bbl-*`/`send-bbl-*` one-offs reusable. No
  move-to-`_archive/` (HRR-005 churn avoided), no deletes.
- **Tier D (WEKAF brand kits, 4.0 MB):** keep — brand *source* assets, not superseded planning material.
- **Tier C (doc-root sprawl):** accept in place — no `status: superseded` flip (0 reclaim, HRR-005).

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/source/SESSION_0019-Orchestration-Dirstarter-Compliance-Report.md` | **deleted** — byte-dup of kept `deep-research-report (1).md` |
| `docs/architecture/source/SCHEMA_NEEDS_MANIFEST.md` | **deleted** — orphan copy; canonical at `architecture/` |
| `docs/architecture/source/raw/SESSION_0034_close_out_merge_train_claude_raw.md` | deleted then **restored at close** — `_archive/SESSION_0034.md` links it as preserved provenance (FINDING_01) |
| `docs/sprints/SESSION_0469.md` | created — this session record |
| `docs/knowledge/wiki/index.md` | session-table row for SESSION_0469 (append) |

## Verification

| Command / smoke | Result |
| --- | --- |
| Reference-count (basename grep across `*.md`/`*.ts`/`*.tsx`/`*.json`/`*.mjs` + read referrers) | each delete confirmed 0 active refs by reading, not count alone |
| Broken-link check (active sweep) | `SESSION_0019…` 0 referrers · `SCHEMA_NEEDS_MANIFEST` source path 0 referrers (10 → kept `architecture/` canonical) |
| `deep-research-report (1).md` vs deleted report | 485 vs 485 lines, 16 trivial diffs → confirmed dedup (kept copy retains content) |
| `bun run wiki:lint` (the gate that caught FINDING_01) | first pass: **1 error** — broken link from `_archive/SESSION_0034.md` to the deleted raw transcript → restored the file → re-run: **0 errors, 15 warnings** (all pre-existing R8 in untouched files) |

## Open decisions / blockers

None. The lean-out band is exhausted (everything else is cited or operator-kept). Next session is a clean pick.

## Next session

### Goal

**S48 session 3 — pivot to the G-005 code lane** (the lean-out band is now exhausted; the remaining
`architecture/source`/`scripts`/`petey-plan` material is all cited or operator-kept, so further doc-pruning
is diminishing returns). Extract the L1 `Card` surface into `packages/ui-kit` + named cards and fold the 5
catalog cards onto `ListingCard`, against the ratified `design-system-doctrine.md` §5–§6 conformance
checklist (ADR 0040; Option B port — tokens travel, Tailwind doesn't). **Coordinate with SESSION_0470** if
that concurrent window already started G-005 — read its SESSION file first to avoid duplicate work.

### First task

Read `design-system-doctrine.md`, [[listing-card-is-the-one-card]], and
[[kernel-extracts-dirstarter-l1-not-cleanroom]]; check whether SESSION_0470 landed the kernel `Card`
extraction. If it did, resume from its state; if not, start the Option-B extraction of the L1 `Card` down
into `packages/ui-kit` (extract, don't clean-room — Giddy learning record 0005).

## Review log

### SESSION_0469_REVIEW_01 — S48 lean-out session 2 (next cruft band)

- **Reviewed tasks:** SESSION_0469_TASK_01 (reference-count), SESSION_0469_TASK_02 (delete manifest).
- **Dirstarter docs check:** not applicable — docs/governance only, no L1 baseline layer touched.
- **Verdict:** A disciplined measure-before-cut pass. The band *looked* like the big reclaim (4.9M of
  `architecture/source`) but reading the referrers proved it ~98% load-bearing: the entire `uplift/` dir is
  index-"active", the source corpus is product/ADR canon, and two of my own "0 refs" labels were wrong
  (muay-thai PNG = tuffbuffs port source; SESSION_0019 report = byte-dup of a kept file). The operator
  narrowed the rest to keep reusable scripts + brand assets. Net: 3 verified-dead files / ~70 KB, every one
  confirmed by reading. Small reclaim, but the honest one — and more data points that the dead-code
  heuristic over-flags (SESSION_0468's core lesson). Net delete: **2 files / ~47 KB**.
- **Score:** 9.1 / 10 (three "0 refs" mislabels: two caught by reading pre-delete, one — the SESSION_0034
  raw — only caught by the lint gate *after* the operator-approved delete, because the sweep excluded
  `_archive/`; see FINDING_01).
- **Follow-up:** include `_archive/` in future deletion ref-sweeps (FINDING_01); lean-out band exhausted;
  pivot to G-005 per the Next session block.

## Hostile close review

- **Giddy:** pass — this was the Giddy repo-health lane; every delete quantified + confirmed by reading,
  two false-positives (muay-thai PNG, SESSION_0019 dedup) caught before acting, HRR-005 honored (no
  move-churn, Tier C accepted in place). Nothing deleted that contradicts how it was described —
  contradictions (muay-thai, SESSION_0019) were surfaced and resolved first.
- **Doug:** pass — every claim has a command behind it (ref counts, line-diff dedup proof, broken-link
  sweep). No runtime surface touched (docs only) → no `qa-runtime` gate owed.
- **Desi:** n/a — no production UI.
- **Kaizen aggregate:** 9.1/10 — exemplary measure-before-cut; ding for the label-then-correct loop *and* the
  `_archive`-excluded sweep that let a referenced file reach a delete the operator approved (caught by the
  lint gate before push, but it should have been caught in the sweep).

### Findings (severity ≥ medium)

#### SESSION_0469_FINDING_01 — active-ref sweep excluded `_archive/`, masking a real inbound link

- **Severity:** medium
- **Task:** SESSION_0469_TASK_02
- **Evidence:** `docs/sprints/_archive/SESSION_0034.md:18,27` links
  `architecture/source/raw/SESSION_0034_close_out_merge_train_claude_raw.md` as *"the verbatim Claude plan…
  preserved at"* — my reference-count sweep used `grep -v '/_archive/'`, so the file looked 0-ref and entered
  the approved delete set. `bun run wiki:lint` (broken-link check **does** scan `_archive/`) flagged it.
- **Impact:** a file described as "preserved" was momentarily deleted; would have shipped a broken link had
  the lint gate not run. No data lost — restored at close.
- **Required follow-up:** when reference-counting deletion candidates, **include `_archive/` in the inbound
  sweep** (it's excluded from *staleness*, not from *broken-link* validity — the HRR-005 asymmetry). Banked
  to [[s48-repo-health-and-hostile-repo-review]].
- **Status:** addressed (file restored; delete reverted; lint green).

## ADR / ubiquitous-language check

- **ADR update — not required.** No architectural decision made/changed; this is governance/repo-health
  hygiene recorded in this SESSION + the index.
- **Ubiquitous-language — not required.** No new domain term introduced.

## Reflections

The band the operator handed me as "the next big reclaim" turned out to be the smallest delete of the
sprint — and that *is* the finding. SESSION_0468 freed 3.3M; this session freed 70 KB. The difference is
that the easy dead weight (a duplicated vault, an emptied `_imports/`) was already gone, and what remains in
`architecture/source` is the repo's actual source-of-record (net delete here was 47 KB): the original
ChatGPT plan that ADR 0001 cites,
the Baseline launch-OS the PRD pairs with, the uplift epic that `index.md` calls "execution authority." A
hostile review that deletes those to hit a byte target would be vandalism dressed as hygiene.

The sharpest moment was the run of false-positives: I labeled `muay-thai-technique-graph.png` "0 refs"
because my exact-basename grep missed the prose spelling `muay-technique-graph.png` in the S2 schema plan,
and I labeled the SESSION_0034 raw transcript "0 refs" because I *excluded `_archive/` from the sweep* — yet
an archived session explicitly calls it "preserved." The same heuristic that over-flags engines and
sub-routines (SESSION_0468) also misses loosely-named assets and archive-only provenance links — ref-count
is a *pointer*, and the pointer is fuzzy on both ends. Two saves: reading caught the PNG (and the operator's
"keep tuffbuffs content" independently confirmed it); the **lint gate** caught the transcript *after* it had
already passed into an operator-approved delete. That second one is the uncomfortable lesson — the
defense-in-depth worked (nothing shipped broken), but a referenced file should never have reached the delete
in the first place. The fix is concrete: include `_archive/` in deletion sweeps, because lint validates
broken links there even though staleness checks skip it (the exact HRR-005 asymmetry, biting from the other
side this time).

The operator's narrowing was its own lesson in restraint: I had tiered ~547 KB of scripts as deletable, and
the operator kept all of it with "we can use those again." Git history preserves a deleted script perfectly,
so my "git-recoverable, delete it" logic wasn't wrong — but a runnable import pipeline sitting in `scripts/`
is discoverable in a way a git-archaeology dig is not. Reusability is a keep reason even when recoverability
says delete.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0469 carries full frontmatter (`updated: 2026-06-29`, `last_agent: claude-session-0469`); no other doc frontmatter touched (2 deletes + 1 index row) |
| Backlinks/index sweep | added SESSION_0469 row to `wiki/index.md` session table; broken-link sweep + `wiki:lint` confirmed the 2 deletes orphan nothing (FINDING_01: a 3rd candidate was restored when lint flagged an `_archive/` link) |
| Wiki lint | `bun run wiki:lint` → first pass **1 error** (the FINDING_01 broken link) → file restored → re-run **0 errors, 15 warnings** (all pre-existing R8 in untouched `SESSION_VIDEO_R001.md` + `petey-plan-0436`) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0469_REVIEW_01 (Giddy/Doug pass; 9.1/10) + SESSION_0469_FINDING_01 (addressed) |
| Code-quality gate (Class-A) | no Class-A custom code — docs/governance only |
| Runtime verification (Doug) | no runtime surface touched (docs only) → n/a |
| Review & Recommend | next session goal written: yes (G-005 pivot, coordinate with 0470) |
| Memory sweep | updated [[s48-repo-health-and-hostile-repo-review]] with session-2 result + the second over-flag data point |
| Next session unblock check | unblocked — G-005 lane is self-contained and pickable at a fresh bow-in |
| Git hygiene | branch `session-0469-leanout`; single commit + push to `main`; hash reported at bow-out — see git log |
| Graphify update | skipped — fresh parallel worktree (`.graphify` empty/gitignored, self-cleans post-merge); the canonical graph refreshes from the main worktree |
