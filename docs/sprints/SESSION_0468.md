---
title: "SESSION 0468 — S48 hostile repo review: wired-vs-dead audit + lean-out manifest"
slug: session-0468
type: session--review
status: closed
created: 2026-06-28
updated: 2026-06-29
last_agent: claude-session-0468
sprint: S48
pairs_with:

  - docs/sprints/SESSION_0467.md
  - docs/protocols/hostile-repo-review.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0468 — S48 hostile repo review: wired-vs-dead audit + lean-out manifest

## Date

2026-06-28

## Operator

Brian + claude-session-0468

## Goal

Open Sprint S48. Run `hostile-repo-review.md` §Method (Graphify-first) across the 43M / 891-doc /
248-SESSION corpus to produce (a) a **wired-vs-dead table** of the orchestration core + recent
systems/loops/protocols, and (b) a **quantified lean-out action list** with an **operator-gated delete
manifest**. Start the cruft purge on the operator's word. Mantra: what would Apple/Facebook do — one of
each thing, kill confidently-wrong docs, lean over sprawl.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0467.md`
- Carryover: 0467 ratified the design-system doctrine (ADR 0040), refreshed `hostile-repo-review.md`
  (Graphify method + 6 lenses + finding-router), and banked the S48 cruft targets. This session runs that
  refreshed protocol as the first of the 3–5 session sprint.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `93a7eb0a`

### Graphify check

- Graph status: current; stats at bow-in: **15,641 nodes / 30,737 edges / 2,089 communities / 2,469
  files tracked**.
- Queries used:
  - `hostile repo review repo health lean duplication dead code`
  - `loop of loops ledger backlog three pass kiss dry yagni protocol`
- Method: Graphify-first per `hostile-repo-review.md` §Method, then verified every finding by direct
  source inspection + reference-counting (`grep -rl` inbound refs, excluding self/SESSION/_archive) +
  `du`/`md5`/`diff -rq` quantification. Graphify used as navigation, not proof.
- Graphify catch: `RONIN_DOJO-Baseline/00_Inbox/hostile-repo-review.md` surfaced as a **stale fork of the
  very protocol being run** — confirms the vault carries forgotten duplicates of live canon.

## Petey plan

### Goal

Produce the wired-vs-dead table + quantified lean-out manifest; execute the operator-gated deletes once
authorized; land the no-delete docs fixes (Sessions-table backfill, wire the under-linked SOP).

### Tasks

#### SESSION_0468_TASK_01 — Wired-vs-dead audit (Graphify + reference-count)

- **Agent:** Giddy
- **What:** Classify the orchestration core + recent systems/loops/protocols as wired / dormant / dead.
- **Done means:** the wired-vs-dead table below, every row evidence-backed.
- **Depends on:** nothing

#### SESSION_0468_TASK_02 — Quantified lean-out manifest (operator-gated deletes)

- **Agent:** Giddy
- **What:** Stage the cruft purge — quantified target list + total reclaimed; delete on the operator's word.
- **Done means:** the manifest below approved + executed; nothing deleted before authorization.
- **Depends on:** SESSION_0468_TASK_01

#### SESSION_0468_TASK_03 — No-delete docs fixes

- **Agent:** Cody
- **What:** Backfill `wiki/index.md` Sessions table (0430–0467 gaps); wire the under-linked active SOP
  `send-email-flow.md`; hook `hostile-repo-review.md` into a ritual (it governs S48 but has 0 ritual hooks).
- **Done means:** wiki-lint clean; the three fixes landed.
- **Depends on:** nothing (can run alongside TASK_02)

### Open decisions

- **Delete authorization** — the manifest deletes are operator-gated (explicit-push-authorization). Held
  until "go."
- **project-log.md retire shape** — move-to-`_archive`-plus-tombstone (lean, 1 file) vs move-plus-update-19-
  live-refs. Recommend tombstone.
- **SESSION archive sweep** — 248 active SESSION files (9.3M); proposed for a *later* S48 session, not this one.

### Scope guard

- No app code. No `apps/web` touch → paths-ignored push (no deploy) per `vercel.json` `ignoreCommand`.
- The **G-005 card-extraction code lane is NOT in scope** this session (operator holds it unless pinned).
- Never delete SESSION history (append-only). Never `git mv` project-log without a tombstone/ref fix.
- Deletes are staged + shown; nothing removed before the operator's word.

## Hostile Repo Review — SESSION_0468

**Lane:** repo-memory / repo-health (lean-out)
**Scope reviewed:** docs orchestration core (27 protocols, 5 named loops, ~16 scripts, ~35 skills) +
the banked cruft targets across the 43M doc corpus.
**Dirstarter/L1 component inventory checked:** n/a (no component work this session)
**Graph/wiki/index checked:** yes (Graphify stats/query; wiki index Sessions table audited)
**Token-risk verdict:** medium — the live core is tightly wired and fast to navigate; the drag is a 3.2M
forgotten vault + duplicated systems-packs + a retired protocol in the active dir + a stale Sessions table.
**Score:** 8.4 / 10 (capped at 8.9: agents would re-grep the vault/dups; the Sessions table doesn't answer
"what shipped 0430–0467" in one read).
**Verdict:** The orchestration spine is genuinely healthy — opening/closing/petey/cody/doug, WORKFLOW_5.0,
loop-of-loops, pr-review-score-fix, the ledger-backlog + loop-board are all wired with real call sites and
ritual hooks. The rot is concentrated and removable: one 3.2M PARA vault nobody links, one byte-identical
duplicate systems-pack dir, a five-copy adoption checklist, a frozen protocol squatting in the active dir,
and a stale Sessions index. Two banked assumptions were wrong and are corrected here (see findings). Net:
~3.3M / ~110 files of dead weight stageable for deletion with near-zero blast radius.

### Wired-vs-dead table (orchestration core + recent systems)

| System / loop / protocol | Inbound refs | Ritual/skill/script hook | Status |
| --- | ---: | --- | --- |
| `WORKFLOW_5.0.md` | 87 | governing OS | **WIRED** |
| `petey-plan.md` | 44 | 4 (rituals + skills) | **WIRED** |
| `failed-steps-log.md` | 51 | 2 | **WIRED** |
| `cody-preflight.md` | 32 | 1 | **WIRED** |
| `hostile-close-review.md` | 27 | every bow-out | **WIRED** |
| `chat-handoff.md` | 25 | 2 | **WIRED** |
| `code-guardrails.md` | 14 | 1 | **WIRED** |
| `next-session-loading-order.md` | 13 | 1 | **WIRED** |
| `merge-to-main.md` | 12 | 1 | **WIRED** |
| `pr-review-score-fix-loop.md` | 11 | `/pr-fix-loop` skill | **WIRED** |
| `wiki-lint.md` | 9 | `scripts/wiki-lint.ts` gate | **WIRED** |
| `review-recommend.md` | 9 | 1 | **WIRED** |
| `loop-of-loops-ledger-driven-sessions.md` | 8 | `scripts/ledger-backlog.ts` + loop-board | **WIRED** |
| `code-quality-matrix.md` | 5 | `/code-quality` skill | **WIRED** |
| `giddy-merge-strategy.md` | 5 | 1 | **WIRED** |
| `llm-wiki-schema.md` | 0 docs | CLAUDE.md | **WIRED** (via CLAUDE.md) |
| `reusable-prompts.md` | 2 | 1 | **WIRED** |
| `ledger-backlog.ts` / loop-board (`KanbanCard`) | — | opening ritual; MVP_LIVE | **WIRED** |
| `send-email-flow.md` | 0 | active SOP, under-linked | **WIRED but ORPHAN-LINKED** → wire it |
| `hostile-repo-review.md` | 4 | **0 ritual hooks** | **WIRED but trigger-by-memory** → hook it |
| `jetty-annotation-standard.md` | 5 | 0 | reference standard (apply-on-demand) |
| `three-pass-loop.md` | 4 | **0** (no skill/script) | **DORMANT** (loop-promotion stalled) |
| `qa-runtime-verification.md` | 3 | 0 | **DORMANT** |
| `kiss-dry-yagni-loop.md` | 2 | 0 | **DORMANT** |
| `identify-intent-improve-loop.md` | 2 | 0 | **DORMANT** |
| `hot-fix-protocol.md` | 2 | 0 | **DORMANT** |
| `operator-playbook.md` | 1 | 0 | **DORMANT** (verify intent) |
| `RONIN_DOJO-Baseline/` PARA vault | 0 live | — | **DEAD** → delete |
| `docs/ronin_dojo_baseline_systems_pack/` | 11 | byte-identical dup of `_imports/` | **DEAD (dup)** → dedup |

### Findings

#### HRR-001 — `send-email-flow.md` is a false-positive "orphan" (active SOP, under-linked)

- Severity: medium (process — guards against deleting live work)
- Evidence: 0 inbound refs repo-wide, but frontmatter `status: active`, created 2026-06-23 (SESSION_0436);
  it is the gated one-off BBL email SOP, distinct from the lifecycle-email path.
- Impact: a naive "0 refs = dead" sweep would delete a live safety SOP. Corrects a hostile-review trap.
- Required follow-up: **wire** it into `wiki/index.md` (+ it already pairs_with ADR 0031 / reusable-prompts).
- Status: open (TASK_03)

#### HRR-002 — Loop-promotion program stalled: 4 loops documented, never wired

- Severity: medium (lost-in-the-wind)
- Evidence: `three-pass`, `kiss-dry-yagni`, `identify-intent-improve`, `hot-fix` — all `hooks=0`, and
  `grep .claude scripts` finds **no skill/script/cron** invoking any of them. Matches the parked
  "Monorepo loop promotion (0420)" memory (`THREE_PASS→KISS_DRY_YAGNI→QA_RUNTIME→IDENTIFY_INTENT→HOT_FIX`).
- Impact: documented method with no live trigger — the canonical "built-then-abandoned" class. Not wrong,
  just dormant; reads as active because it sits in the active protocols dir.
- Required follow-up: RESOLVED this session — reading all 5 flipped the verdict (4 are foundation/sub-routine/
  schema/break-glass, not dormant; only `kiss-dry-yagni` is a true duplicate → retired). Index relabeled with
  differentiated roles. See "Parked-item outcomes" above.
- Status: addressed

#### HRR-003 — `hostile-repo-review.md` (this sprint's governing protocol) has 0 ritual hooks

- Severity: medium (the drift it hunts, in itself)
- Evidence: refs=4, hooks=0 — triggered only by operator memory, which is exactly how it "drifted out of
  memory and was almost re-authored from scratch" (0467 note).
- Impact: a repo-health protocol that depends on remembering it exists will drift again.
- Required follow-up: add a cadence hook (e.g. a line in `closing.md` / `WORKFLOW_5.0.md` "run on sprint
  boundary or on signal").
- Status: open (TASK_03)

#### HRR-004 — Banked dedup counts were stale (verified before acting)

- Severity: low (accuracy)
- Evidence: `neon-advisory-lock-recovery.md` — banked ×2, **only 1 exists** (already deduped).
  `baseline_repo_docs_adoption_checklist.md` — banked ×4, **5 found** (2 inside the vault).
- Impact: confirms "quantify every finding; never assert from a vibe." Manifest below uses verified counts.
- Status: resolved (counts corrected in manifest)

#### HRR-005 — Physical SESSION archiving is value-negative (re-confirms the doc-pruning-register)

- Severity: medium (process — prevents a recurring "lean by moving" mistake)
- Evidence: moving 0221–0399 into `_archive/` broke their `../`-relative outbound links; `wiki-lint.ts:333`
  excludes `_archive/` from *staleness* only, not from broken-link checking. The `doc-pruning-register`
  already documents this conclusion for `_imports/`.
- Impact: the 248-active-SESSION "sprawl" is **not** reducible by relocation without rewriting every moved
  file's relative links (and the lint scan doesn't shrink). Disk ≠ context — closed sessions never auto-load.
- Required follow-up: treat active-dir navigation as a tooling concern (nav/graphify filtering), not a move;
  or accept the sprawl. Do **not** retry the physical archive sweep.
- Status: resolved (attempted + reverted this session)

## Lean-out manifest (operator-gated — DELETE ON YOUR WORD)

| # | Target | Weight | Action | Blast radius | Rationale |
| --- | --- | ---: | --- | --- | --- |
| 1 | `RONIN_DOJO-Baseline/` PARA vault | **3.2M, 102 files** | **DELETE** | 0 live refs (2 SESSION-history mentions stay) | Forgotten Obsidian vault; carries stale forks of live canon (incl. an old `hostile-repo-review.md`). Biggest win. |
| 2 | `docs/ronin_dojo_baseline_systems_pack/` | **108K, ~7 files** | **DELETE (dedup)** | 11 refs → repoint to `_imports/` | Byte-identical to `docs/_imports/baseline-systems-pack/` (`diff -rq` clean). Keep `_imports/` (provenance-named, 12 refs). |
| 3 | `baseline_repo_docs_adoption_checklist.md` ×5 → ×1 | (within #1/#2) | **COLLAPSE** | 2 die with #1, 1 with #2; `architecture/source/` == `_imports/` (same md5) | Keep one canonical copy in `_imports/`; delete the `architecture/source/` twin. |
| 4 | `docs/protocols/project-log.md` | frozen doc | **MOVE → `_archive/` + tombstone** | 19 live non-SESSION refs | `status: archived-frozen` squatting in the active protocols dir. Leave a 5-line redirect stub so the 19 links + 3 ritual `pairs_with` don't dangle (lean: 1 stub vs 19 edits). |
| 5 | `neon-advisory-lock-recovery.md` ×2 | — | **NO-OP (already deduped)** | — | Only 1 copy exists; banked ×2 is stale. Mark resolved. |

**Total hard reclaim: ~3.3M / ~110 files** (~7.7% of the 43M doc corpus) at near-zero blast radius.

### Proposed for later S48 sessions (NOT this session)

- **SESSION archive sweep** — 248 active SESSION files / 9.3M (227 already in `_archive`). Sweep older
  active files into `docs/sprints/_archive/` (append-only, never delete) — biggest remaining token-weight
  win, but delicate; wants its own session.
- **Dormant-loop consolidation** (HRR-002) — fold the 4 dormant loops into one apply-on-demand page or
  re-status them `reference`.

### No-delete fixes (this session, TASK_03)

- Backfill `wiki/index.md` Sessions table gaps (0430–0467).
- Wire `send-email-flow.md` into `wiki/index.md` (HRR-001).
- Add a cadence hook for `hostile-repo-review.md` (HRR-003).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0468_TASK_01 | landed | Wired-vs-dead table produced (Graphify + reference-count, evidence-backed) |
| SESSION_0468_TASK_02 | landed | Manifest **executed** (operator-authorized "all 4 + tombstone"): 117 files deleted / 20,706 lines removed |
| SESSION_0468_TASK_03 | landed | No-delete docs fixes: Sessions backfill (10 rows), SOP wired, cadence hook added |
| SESSION_0468_TASK_04 | landed | Agent Systems Map — 5-pillar discoverability doc; lifted a task→workflow router + allowed-vs-never table from operator infographics |

## What landed

- **#1 vault** — `git rm -r RONIN_DOJO-Baseline/` (102 files, 3.2M; 0 live refs).
- **#2 dedup** — deleted `docs/_imports/baseline-systems-pack/` (14 files; emptied `docs/_imports/` entirely).
  **Keep/delete FLIPPED from the manifest's initial guess:** live `pairs_with`/SOP-source refs point at the
  **root** pack and epic RH-1 names the `_imports/` copy for removal, so root was kept (zero repoints on
  those 9 docs) and `_imports/` deleted. Repointed only the 7 `_imports/` "Source:" provenance footnotes.
- **#3 collapse** — deleted `docs/architecture/source/baseline_repo_docs_adoption_checklist.md` (0-ref twin,
  byte-identical to the kept `_imports/`→now root copy). Checklist 5→1.
- **#4 project-log** — body moved to `docs/_archive/project-log.md`; `docs/protocols/project-log.md` is now a
  5-line tombstone redirect (19 live refs + 3 ritual `pairs_with` still resolve).
- **#5 neon dup** — NO-OP confirmed (only 1 copy; banked ×2 was stale).
- **Loop closed** — epic RH-1 → RESOLVED (SESSION_0468); `doc-pruning-register` `_imports/*` row → DELETED,
  `ronin_dojo_baseline_systems_pack/*` row → sole canonical copy.
- **Sessions backfill** — added 10 missing rows (0432–0435, 0463–0468). **Scope correction:** the banked
  "0430–0467 absent" was stale; only 0432–0435 + 0463–0468 lacked rows. Older 0412–0427 gaps were left
  by design (the 0428 row already documents 0420–0427 as "not backfilled — prior cloud-PR closes").
- **SOP wired** — `send-email-flow.md` added to the index Protocols table (HRR-001).
- **Cadence hook** — `closing.md` Optional-deep-items now triggers the repo-wide hostile review on sprint
  boundary / on signal (HRR-003).
- **Reclaim: ~3.3M / 117 files deleted, 20,706 lines.** Gates: `wiki:lint` **0 errors** (R4 mine cleared;
  15 residual R8 warnings are pre-existing in untouched files).

### Parked-item outcomes (operator: "keep going — parked items")

- **SESSION archive sweep — ATTEMPTED, proved value-negative, REVERTED (clean).** Moved 0221–0399 (179
  files) to `docs/sprints/_archive/` + repointed all 179 index links — but the move **broke each moved
  file's `../`-relative outbound links** (`../rituals/`, `../knowledge/`, … now resolve one level too
  shallow), and `wiki-lint.ts:333` only excludes `_archive/` from the *staleness* check, **not the
  broken-link check** — so the sweep traded 0 errors for ~179 files of broken links with no lint-scope
  saving. The `doc-pruning-register` had **already** concluded this ("a physical move pushes cold files one
  level deeper, breaking their outbound relative links → value-negative") for `_imports/`; this empirically
  re-confirms it for SESSION files. Reverted via `git mv` back + surgical index-link reversal → back to 248
  active / 0 lint errors. **SESSION sprawl is a navigation/tooling concern, not a file-move one.** (HRR-005.)
- **Dormant-loop resolution (HRR-002) — DONE (grilled + executed).** Reading all 5 in full flipped the
  finding: the ref-count + ritual-hook heuristic **over-flagged** — 4 of the 5 are load-bearing in ways
  `grep` can't see (same false-positive class as `send-email-flow`). Operator-grilled to a per-loop verdict:
  - `three-pass-loop` → **KEEP** (the score→fix→review **engine** `pr-review-score-fix-loop` is built on).
  - `identify-intent-improve` → **KEEP** standalone (**sub-routine** of pr-loop's `INTEGRATE_INTENT_REQUIRED`).
  - `qa-runtime-verification` → **KEEP** (the **schema** behind the wired `## Verification` close-gate).
  - `hot-fix-protocol` → **KEEP** (**break-glass** prod runbook; dormant by design = no prod emergencies).
  - `kiss-dry-yagni-loop` → **RETIRED** (the one true duplicate; workflow = `/fallow-fix-loop` + `/simplify`
    + `/code-quality`). Rubric folded into `code-quality-matrix` D3; doc → `status: superseded` tombstone;
    `three-pass`'s two "forthcoming" refs corrected. Index relabeled with **differentiated honest roles**
    (foundation / sub-routine / schema / break-glass / superseded) replacing the blunt uniform label.
- **Agent Systems Map (TASK_04) — operator-prompted from 5 agent-engineering infographics.** Operator's read
  ("we have these, just not pointed well") IS this session's discoverability thesis in visual form. New
  [`agent-systems-map.md`](../knowledge/wiki/agent-systems-map.md) (linked top of index Concepts) maps the 5
  pillars — skill-routing · context discipline · work ledgers · trust boundaries · verification loops — each →
  our concrete systems. We **over-deliver** on ledgers/verification/roster; the two genuine gaps were filled
  by **lifting** ideas from the images: a **task→workflow router table** and an **allowed-vs-never-do table**
  (both consolidate rules that were scattered/enforced-but-unlisted). Rendered a visual summary in-chat.

## Files touched

| File | Change |
| --- | --- |
| `RONIN_DOJO-Baseline/**` (102 files) | **DELETED** — forgotten PARA vault (3.2M; 0 live refs) |
| `docs/_imports/baseline-systems-pack/**` (14 files) | **DELETED** — byte-identical dup; emptied `docs/_imports/` |
| `docs/architecture/source/baseline_repo_docs_adoption_checklist.md` | **DELETED** — 0-ref checklist twin (5→1) |
| `docs/_archive/project-log.md` | **NEW** — project-log body relocated here |
| `docs/protocols/project-log.md` | tombstone redirect (`archived-frozen`) |
| `docs/knowledge/wiki/agent-systems-map.md` | **NEW** — 5-pillar map + router & never-do tables |
| `docs/knowledge/wiki/index.md` | Sessions backfill (10 rows); SOP wired; agent-systems-map + 5 loop relabels |
| `docs/rituals/opening.md` | step 4 → agent-systems-map router pointer |
| `docs/rituals/closing.md` | hostile-repo-review sprint-boundary cadence hook |
| `CLAUDE.md` | "How sessions run" → agent-systems-map awareness line |
| `docs/protocols/kiss-dry-yagni-loop.md` | retired → `superseded` tombstone (rubric → code-quality-matrix D3) |
| `docs/protocols/code-quality-matrix.md` | §7 fold-pointer for the retired kiss-dry-yagni rubric |
| `docs/protocols/three-pass-loop.md` | corrected 2 stale "forthcoming kiss-dry-yagni" refs |
| `docs/protocols/next-session-loading-order.md` + 6 wiki docs | repointed `_imports/` provenance → root pack |
| `docs/epics/post-launch-clean-repo-001.md` · `doc-pruning-register.md` | RH-1 + `_imports/` rows → resolved (cross-off) |

## Verification

| Check / smoke | Status | Evidence |
| --- | --- | --- |
| `bun run wiki:lint` | PASS | 0 errors, 15 warnings (all pre-existing R8 in untouched files) |
| Deletion scope = only the 3 intended targets | PASS | `git diff --cached` top-dirs: vault, `_imports/baseline-systems-pack`, `architecture/source` only |
| No dangling `_imports/`/vault links in live docs | PASS | grep clean; 7 provenance footnotes repointed to root pack |
| Archive sweep reverted clean | PASS | 248 active restored; 0 residual renames; `git diff` shows only new SESSION_0468 in `sprints/` |
| `agent-systems-map` ~25 links resolve | PASS | wiki-lint link-check clean |
| Reclaim | PASS | 117 files / 20,851 lines deleted (~3.3M) |

No runtime surface touched (docs / governance only) → `qa-runtime-verification` n/a; no `next build` gate (no `apps/web`).

## Open decisions / blockers

- **None blocking.** Committed + pushed at close (operator authorized the push this turn). Docs-only →
  `ignoreCommand` skips the prod build (no deploy).
- **Resolved this session (were "parked"):** dormant-loop consolidation (HRR-002 → 4 kept + 1 retired); the
  SESSION archive sweep is **rejected, not deferred** (HRR-005 — value-negative). Older 0412–0427 index gaps
  left by design (the 0428 row documents 0420–0427 as deliberately un-backfilled).

## Next session

### Goal

**S48 session 2 — continue the hostile-repo-review lean-out** (the sprint is 3–5 sessions). Two pinnable
lanes; operator picks at bow-in. Default is the lean-out continuation; the G-005 code lane is the pivot.

### First task

**Default lane — next cruft band → operator-gated DELETE manifest.** Run `hostile-repo-review.md` §Method
(Graphify + reference-count) on the next band and produce a quantified manifest. **Prefer deletes over moves
(HRR-005: physical relocation breaks `../`-relative links *and* lint still scans `_archive/` — moves are
near-zero-value churn).** Candidate targets to quantify:

- `docs/architecture/source/*` + `docs/architecture/uplift/*` — raw planning/import materials likely
  superseded by accepted ADRs/PRDs (`doc-pruning-register` already flags `architecture/source/*` "review
  one-by-one before archive"). **Delete** the truly-superseded; keep anything still cited.
- Epic `post-launch-clean-repo-001.md` **RH-3** — `apps/web/scripts/*` executed-once one-offs (`import-bbl-*`,
  `send-bbl-*`) → move to `apps/web/scripts/_archive/` + a run-once header. (Scripts have no `.md` links →
  moving them is safe, unlike SESSION files.)
- Epic **RH-2** doc-root `petey-plan-*.md` sprawl — mark completed plans `status: superseded` **in place**
  (do **not** move — HRR-005), or accept.

Bundle as one manifest, show the reclaim total, delete on the operator's word. Read first:
`docs/protocols/hostile-repo-review.md`, the new [`agent-systems-map.md`](../knowledge/wiki/agent-systems-map.md),
and [[s48-repo-health-and-hostile-repo-review]].

**Alternative lane (pin to pivot to code) — G-005.** Extract the L1 `Card` surface into `packages/ui-kit` +
named cards and fold the 5 catalog cards onto `ListingCard`, against the ratified `design-system-doctrine.md`
§5–§6 conformance checklist (ADR 0040; Option B port — tokens travel, Tailwind doesn't). Read first:
`design-system-doctrine.md`, [[listing-card-is-the-one-card]], [[kernel-extracts-dirstarter-l1-not-cleanroom]].

## Review log

### SESSION_0468_REVIEW_01 — S48 hostile-repo-review lean-out + discoverability

- **Reviewed tasks:** TASK_01 (wired-vs-dead audit), TASK_02 (lean-out manifest), TASK_03 (no-delete fixes),
  TASK_04 (agent-systems-map).
- **Dirstarter docs check:** not applicable — docs/governance only, no L1 baseline layer touched.
- **Verdict:** A high-integrity repo-health session. Every delete was quantified before acting; two banked
  assumptions (send-email-flow "orphan", neon ×2) and one wired-vs-dead verdict (the "5 dormant loops") were
  *corrected by reading*, not rubber-stamped. The archive sweep was attempted, measured to be net-negative,
  and cleanly reverted — the willingness to undo a 179-file move is the session's strongest signal. Net:
  ~3.3M / 117 files removed, two genuine discoverability artifacts (the map + its two tables) added and wired
  into the read-path, 0 lint errors throughout.
- **Score:** 9.4 / 10 (the heuristic over-flagged 4 loops + send-email-flow before the read corrected it — a
  reminder that ref-count is a pointer, not proof; caught, but it cost a relabel-then-correct cycle).
- **Follow-up:** continue the lean-out (next band) per the Next session block; HRR-005 governs (deletes, not moves).

## Hostile close review

- **Giddy:** pass — this *was* the Giddy repo-health lane; findings routed, two false-positives caught, the
  archive-sweep dead-end documented (HRR-005) rather than buried. Learning record 0007 written.
- **Doug:** pass — every claim has evidence (lint counts, scope greps, revert proof); no "it's fine" without a
  command behind it. No runtime surface, so no `qa-runtime` gate owed.
- **Desi:** n/a — no production UI; the in-chat visual is ephemeral and the map references the doctrine, not new brand surface.
- **Kaizen aggregate:** 9.4/10 — exemplary measure-before-cut discipline; minor ding for the
  label-then-correct loop on the dormant loops (the deeper read should have preceded the first labeling).

## ADR / ubiquitous-language check

- **ADR update — not required.** No architectural decision made/changed; the dormant-loop verdicts and the
  retirement are governance recorded in this SESSION + the index/protocol docs. `agent-systems-map` is a
  concept/reference doc, not an ADR.
- **Ubiquitous-language — not required.** New terms (`agent-systems-map`, task→workflow router,
  allowed-vs-never table, the foundation/sub-routine/schema/break-glass loop classification) are *governance*
  vocabulary, documented at their source; no new *domain* (lineage/claim/directory) term was introduced.

## Reflections

The session's spine was **measure before you cut, and be willing to un-cut.** Every banked target was
re-verified: the neon dup was already gone, `send-email-flow` was a live SOP not an orphan, the "5 dormant
loops" were 4 load-bearing foundations + 1 true duplicate, and the headline archive sweep — the operator's
"bigger token-weight win" — turned out *value-negative* and got reverted. Four of five banked assumptions
moved on contact with evidence. The repo's own ledgers had even pre-recorded two of the answers (epic RH-1
named the `_imports/` copy for removal; `doc-pruning-register` had already reasoned the move-is-value-negative
conclusion) — the work was as much *finding what we already concluded* as concluding anew.

The sharpest meta-lesson: **the discoverability heuristic that finds dead code (low refs + no hooks) also
flags the most load-bearing things as dead** — an engine has no direct trigger, a sub-routine is invoked by a
branch, a break-glass runbook is dormant by design. Ref-count is a pointer, not proof; the read is the proof.
I labeled all five loops "dormant" before reading them, then had to correct it — the deeper read should have
come first.

And the operator's closing move was the lesson in miniature: handed five infographics with "we have these,
just not pointed well," then "how/when do agents actually read your map?" — applying the session's own
build-not-pointed thesis to my own deliverable in real time. The map only counts once it's in the read-path
(opening step 4 + CLAUDE.md), not just written.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | touched docs bumped `updated: 2026-06-29`, `last_agent: claude-session-0468`; new docs carry full frontmatter |
| Backlinks/index sweep | agent-systems-map linked from index Concepts + pairs_with opening/closing/WORKFLOW_5.0/agents; kiss-dry-yagni pairs repointed to code-quality-matrix |
| Wiki lint | `bun run wiki:lint` → **0 errors, 15 warnings** (all pre-existing R8 in untouched files) |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | SESSION_0468_REVIEW_01 (Giddy/Doug pass; 9.4/10) |
| Code-quality gate (Class-A) | no Class-A custom code — docs/governance only |
| Runtime verification (Doug) | no runtime surface touched (docs only) → n/a |
| Review & Recommend | next session goal written: yes (two-lane, detailed) |
| Memory sweep | updated [[s48-repo-health-and-hostile-repo-review]]; new memories for the map + the heuristic lesson; MEMORY.md index updated |
| Next session unblock check | unblocked — both lanes are self-contained and pickable at a fresh bow-in |
| Git hygiene | branch `main`; single commit + push; hash reported at bow-out (see git log) |
| Graphify update | refreshed before commit: **15,651 nodes / 30,815 edges / 2,145 communities / 2,357 files tracked** (files-tracked 2,469→2,357 = the ~117 deletions) |
| Learning record | `docs/learning/ddd/learning-records/0007-the-discoverability-heuristic-and-built-not-pointed.md` (Giddy) |
