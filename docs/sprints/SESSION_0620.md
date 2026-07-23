---
title: "SESSION 0620 — Twin generator (D-053/WL-P2-77) + Codex model + Desi review + /rr slices"
slug: session-0620
type: session--open
status: closed
next_session: docs/sprints/SESSION_0624.md
created: 2026-07-22
updated: 2026-07-22
last_agent: claude-session-0620
sprint: S12
lane: repo
recipe: ""
goal_ids: ["G-023", "G-026", "G-031"]
tickets: ["WL-P2-77", "D-053", "WL-P2-71", "WL-P2-73", "WL-P2-74"]
pairs_with:
  - docs/sprints/SESSION_0619.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0620 — Desi design review + `/rr` on surfaces + ledger/ritual effectiveness

> **Pre-staged stub (ADR 0049), staged 2026-07-22 by SESSION_0619.** Adopt at bow-in: flip
> `staged` → `in-progress`, run the FS-0035 canonical-occupancy check, ask the step-6b bow-in
> questions, then execute. Review/research lane — no code lands unless the `/rr` says build a tiny slice.

## Bow-in (SESSION_0620)

**Adopted the staged stub; operator PIVOTED the lane order at bow-in.** The stub was review-only; the
operator's bow-in brief promotes a **build** to #1:

1. **Twin generator** (closes **D-053** + **WL-P2-77**) — highest-leverage build; makes autonomous Codex
   run `/ggr` + every skill permanently, so the overnight fan-out is safe to launch.
2. **Resolve the Codex model** (CLI upgrade vs supported-model pin — operator: "your call").
3. **Desi `/hallmark`** on the surfaces + the sections wiring/consolidation audit + the `/rr` follow-on
   slices (A4, B1–B5, MBR→Needs-you, docs-nav→SotD).

**Discovery (verified this bow-in):**
- **10** `.claude/skills` lack an `.agents/` twin: `ge ggr gq gu hallmark new-client-recipe pp ppp
  preview-artifacts worktree-setup` (WL-P2-77 named only ggr/pp/ppp).
- The generator must **mirror the whole skill dir**, not just `SKILL.md`: `hallmark` = 107 files
  (`references/**`, `LICENSE`), `worktree-setup` = `SKILL.md` + `bootstrap.sh`. All 46 *existing* twins are
  single-`SKILL.md`, so full-tree mirroring is new ground.
- Pattern to mirror: `scripts/skills-index.ts` (reads `.claude/skills/*/SKILL.md`, has a `--check` mode).
- Codex model line: `scripts/auto-session-codex.sh` `CODEX_MODEL` env → `-m` arg (default unset). D-053
  root: hardlink-ness isn't git-stored → fresh checkout = separate inodes → single-tree edit drifts.

**Canonical-occupancy (FS-0035):** ✅ free → claimed for SESSION_0620.

**Parallel-lane assessment (step 1d, G-023):** 2 genuinely-disjoint candidates exist — the
**generator/scripts + `.agents/` build lane** vs the **Desi `/app`-surfaces review lane** (distinct file
sets). Operator *sequenced* them (generator is the gating prerequisite for the overnight fan-out), so this
runs generator-first as a single coherent inline Cody build (scripts + `.agents/`), **not** a fan-out;
Desi review + `/rr` slices follow. Not fanned out.

## Operator

Brian + <agent>-session-0620

## Goal

Two research/review threads the operator queued (SESSION_0619): a **Desi-led design pass** on the `/app`
surfaces, and a **Petey + Giddy `/rr`** on how to make the screens AND the tickets/lanes/ledgers/rituals work
more effectively and token-efficiently. Recommend, don't build (except a tiny proven slice).

## Next session

> **This block is the autonomous-Codex smoke-test lane's task (SESSION_0620 operator-directed).** After the
> twin-symlink + Codex-model fixes landed, the operator launched **one attended `auto-session-codex.sh 1`
> lane** (isolated worktree, gpt-5.6-sol on CLI 0.145.0) to prove an autonomous Codex session runs `/ggr`
> end-to-end. It creates SESSION_0621 and executes the single automatable slice below. (The Desi `/hallmark`
> + `/rr` review is **this** session's foreground work — see Petey plan Lane B / TASK_04-05 — not next.)

**Task — WL-P3-54: promote the AABB-overlap invariant to a co-located unit test (test-only, self-contained).**

- **Context:** the technique-graph zero-AABB-overlap invariant (node box `168×64`, fixed in `5c7e6574`, 67→0
  overlapping pairs) currently lives only in a throwaway scratchpad detector — so `apps/web/prisma/data/bbl-bjj-graph.json`
  node coordinates and the `technique-graph.tsx` constants can silently drift back into overlap.
- **Do:** export `NODE_WIDTH` (168) + `NODE_HEIGHT` (64) from
  [`apps/web/components/web/techniques/technique-graph.tsx`](../../apps/web/components/web/techniques/technique-graph.tsx) (lines 48–49),
  then add a co-located unit test (mirror the `apps/web/server/web/techniques/*.test.ts` convention) that
  loads `bbl-bjj-graph.json`, computes every node-pair AABB using the **exported** constants, and asserts **zero
  overlap**. The test must FAIL on any future coordinate/constant drift.
- **Done means:** `bun run test` (the new test passes), `bun run typecheck`, and the read-only Oxc gates
  `(cd apps/web && bun run lint:check && bun run format:check)` all green; `/ggr` scores the diff ≥9.0 (or
  auto-loops per the gate); WL-P3-54 flipped to resolved. Behavior-preserving (only exports 2 constants +
  adds a test) — no runtime change, no schema, no migration.
- **Inputs:** `technique-graph.tsx`, `apps/web/prisma/data/bbl-bjj-graph.json`,
  `apps/web/server/web/techniques/graph-belt-level.test.ts` (nearest test pattern),
  [WL-P3-54](../knowledge/wiki/wiring-ledger.md).

## Petey plan (executed — pivot order)

Operator elected **generator-first as a Cody subagent while we review in parallel** — two disjoint lanes:

- **Lane A (Cody subagent, background) — Twin generator + `--check` gate + mint twins.** Closes **D-053** +
  **WL-P2-77**. Full-tree mirror `.claude/skills/<name>/**` → `.agents/skills/<name>/**`; `--check` mode wired
  into a gate so drift can't recur; run it to mint the 10 missing twins (`ge ggr gq gu hallmark
  new-client-recipe pp ppp preview-artifacts worktree-setup`).
- **Lane A′ (inline, Petey) — Codex model.** Probe the installed `codex` CLI + available models; pin a working
  one in `auto-session-codex.sh` (or recommend a CLI upgrade). WL-P2-77 secondary blocker. Operator: "your call."
- **Lane B (inline/Desi/Giddy, foreground while A runs) — review.** Publish frozen SotD Artifact; Desi
  `/hallmark` on `/app` (PL-020/021/023); sections wiring/consolidation audit + `/rr` slices (A4, B1–B5,
  MBR→Needs-you WL-P2-75, docs-nav→SotD WL-P2-76). Recommend, don't build.
- **Lane C (autonomous Codex, background worktree) — the /ggr smoke test.** After A + A′ landed, the operator
  authorized pushing the 0620 core and launching **one `auto-session-codex.sh 1`** lane (isolated worktree off
  clean `main`, gpt-5.6-sol/CLI 0.145.0) to prove an autonomous Codex session runs `/ggr` end-to-end. Its task =
  the WL-P3-54 slice in `## Next session`; it creates SESSION_0621 + opens a reviewable PR (not auto-merged).
  Numbering safety: I do **not** bow-out 0620 (mint 0622) until Lane C's 0621 is done — sequential closers.

## Task log

| Task | Status | Owner | Done means |
| --- | --- | --- | --- |
| SESSION_0620_TASK_01 | ✅ done | Cody + Petey | Symlink-conform (operator's design, not a generator): all 22 outliers → `.agents` real home + `.claude` symlink. Cody did 14 (10 moved + 4 clean); Petey resolved the 8 diverged pairs (`.claude`-authoritative) + fixed a code-quality broken doc-link. D-053 RESOLVED, WL-P2-77 resolved. 55/55 symlinks, 0 broken, hashes unchanged, skills-index/wiki:lint green. |
| SESSION_0620_TASK_02 | ✅ done | inline (Petey) | Codex model resolved — `gpt-5.5` pinned in both auto-session-codex scripts; smoke-tested (SMOKE_OK, no 400). Upgrade path documented. |
| SESSION_0620_TASK_03 | ✅ done | inline | Frozen SotD snapshot published: artifact `0673ebcb…`; URL in `## Artifacts`. |
| SESSION_0620_TASK_04 | ✅ done | Desi (subagent) | `/hallmark` code-grounded audit of `/app` surfaces returned — prioritized Cody fix-list (below). All 3 tickets confirmed rooted in code. No prod code written (review lane). |
| SESSION_0620_TASK_05 | 🟡 partial | Petey/Giddy `/rr` | Headline finding landed → **WL-P2-78** (Gate 12d documented in closing.md §6.5 but ABSENT from bow-out-gates.sh — the "invoked ≠ executed" gap made concrete). Remaining slices scoped below, routed to existing WL rows (not prose). |
| SESSION_0620_TASK_06 | 🔄 running | autonomous Codex (worktree) | Lane C smoke test — `auto-session-codex.sh 1` on gpt-5.6-sol proving `/ggr` end-to-end; creates SESSION_0621 + a PR for WL-P3-54. Launched; awaiting completion. |
| SESSION_0620_TASK_07 | ✅ done | inline (Petey) | **Gate 12d BUILT** (operator: "handle now", not just recommend). `bow-out-gates.sh` now blocks a code-touching session (apps/web\|clients\|packages) that has no `/ggr` composite in `## Review log`. Validated: syntax ✓, matches a real score → PASS, absent → BLOCKS. Closes WL-P2-78. |
| SESSION_0620_TASK_08 | ✅ done (needs `/ggr` + live-verify) | Cody (subagent) | Two HIGH Desi fixes landed, gates green (typecheck/oxlint/oxfmt). input.tsx `text-base sm:text-[0.8125rem]` (16px mobile→no iOS zoom; textarea inherits); phase.ts belts theme-invariant (dropped `dark:` inversions on white/black/**brown**). **Flag:** brown/held made invariant too (judgment call — 1-line revert `dark:bg-[#a9784f]` if operator wants dark-mode contrast back). apps/web → 0620 is now a code session → **Gate 12d requires a `/ggr` composite before push** (run at close). Live-verify (mobile 16px + dark belts) pending. |
| SESSION_0620_TASK_09 | 🔄 launching | autonomous Codex (worktree, gpt-5.5) | Lane 2 — batch-clear low-risk WL items (staged SESSION_0622, risk-capped: skip WL-P3-54/77/78, no schema/auth/>60LOC). Cap 3–6 (operator), self-perpetuating chain (each success launches next via harness brake). |
| SESSION_0620_TASK_10 | ✅ done | inline (Petey) | **Fixed the flaky `courses/queries.integration.test.ts`** (the blocker Lane C surfaced). Root: `beforeAll` 5s default timeout too tight under multi-lane DB contention → undefined IDs → `afterAll` `deleteMany({in:[undefined]})` crash. Fix: 30s fixture timeout + undefined-guarded cleanup. Verified **11/11 pass, 1.73s**. Unblocks the full-suite gate for all autonomous lanes. |

### Desi `/hallmark` findings (TASK_04) — prioritized Cody fix-list, all root-caused in code

**HIGH**

1. **PL-023(a) — iOS input zoom, app-wide root cause.** [`components/common/input.tsx:6`](../../apps/web/components/common/input.tsx) base `text-[0.8125rem]` = **13px** (textarea reuses it); iOS Safari zooms any focused input < 16px → **every form** zooms. Fix: floor mobile to 16px (`text-base sm:text-[0.8125rem]`). One primitive fixes the whole app. *(live-verify iOS)*
2. **PL-020 — white/black belt invert.** [`_kernel/phase.ts:40-46`](../../apps/web/components/app/state-of-dojo/_kernel/phase.ts): `planned`(white)=`bg-background` darkens in dark mode; `done`(black)=`dark:bg-neutral-100` whitens → belts read backwards on mobile dark. Fix: make belt hues **theme-invariant** (belt color is physical), drop the `dark:` inversions, keep white legible via `border`. *(dark-mode check)*
3. **PL-021 — no `/app` back/header.** [`app/app/layout.tsx:26-43`](../../apps/web/app/app/layout.tsx) mounts sidebar + bottom-nav but **no top bar / back affordance**; deep pages render bare. Fix: persistent `/app` top bar with contextual back + title (esp. mobile).

**MEDIUM** — PL-021 mobile admin-nav dead-end (`bottom-nav.tsx:51-76` points only at public routes; `sidebar.tsx:201` `max-md:hidden` with no mobile replacement) · PL-020 action-verb labels (`phase.ts:18-33`, needs **Brandon/operator copy** sign-off) · new **`AppPageHeader`** L1 primitive (removes 11 hand-rolled backs) · PL-023(b) `image-field-uploader.tsx:100` `onError` fallback + **Doug live-verify R2 public-serve** for the `planning-intake/` prefix (markup is correct → break is runtime).

**LOW** — board-vs-ladder order mismatch (`projection.tsx:104-110`) · ladder stop legibility at 375px · `/app` footer · two mobile FABs + bottom-nav crowding · heavy 5-panel landing attention strip.

**Cross-cutting:** component reuse is otherwise clean (SotD kernel composes L1 Card/Badge/Tabs; FeatureWidget reuses the R2 uploader seam — no forks); the gap is a *missing* header primitive, not a duplicated one.

### `/rr` findings (TASK_05, recommend-only)

- **A4 → WL-P2-78 (NEW, headline):** `closing.md` §6.5 promises "Gate 12d verifies the `/ggr` composite in `## Review log`," but `bow-out-gates.sh` has **no such gate**. Recommend implementing it (code-diff-triggered grep for a `/ggr` composite line → block if absent). This is the enforcement that makes the ADR-0052 gate real rather than honor-system.
- **B / WL-P2-73 (wiring-net orphan-detector):** confirmed the right shape — a `bow-out-gates` convention check that every `state-of-dojo/*-panel.tsx` is imported by an aggregator (`attention-panels.tsx` / `buildCatalogPanels`); grep/graph in-degree, routes misses to WL. Reuse `deferral-guard.ts`. Pairs with WL-P2-78 (both are bow-out enforcement).
- **WL-P2-75 (MBR → Needs-you feed):** recommend — mount open Manual-Boundary-Registry rows into the SotD Needs-you feed via self-fetch (mirror the existing Risk-watch feed). Small once the read-shape is confirmed.
- **WL-P2-76 (docs-nav → SotD) + WL-P2-71 (Wayfinder):** recommend the **lighter** mechanism for both (operator's token-efficiency ask) — a persistent **link card** to the on-demand `docs:nav` / `wayfinder:map` output, NOT a live self-fetching SotD panel. A panel adds per-render cost + a new orphan-risk surface for a discovery aid that changes rarely.

## Artifacts

- **Frozen State-of-Dojo snapshot (bow-in, 2026-07-22):**
  <https://claude.ai/code/artifact/0673ebcb-62db-4d97-9aef-04d0e4732d7a> — deterministic projection of
  `docs/sprints/*` + `goals-ledger` (390 sessions, 31 goals) via `bun scripts/state-of-project.ts`, published
  body-fragment through `/preview-artifacts`. Live always-current equivalent: `/app/state`.
- **Frozen State-of-Dojo snapshot (bow-out, 2026-07-23):**
  <https://claude.ai/code/artifact/04ee930d-0f16-417e-a897-9d7f39d1c7cc> — end-of-session projection
  (19,789 graph nodes) via the bow-out gate runner's Gate 7b render.

## Codex model resolution (TASK_02 — evidence)

- **Root cause confirmed:** `~/.codex/config.toml` sets `model = "gpt-5.6-sol"`; the 0.144.0 models cache shows
  the 5.6 line carries newer-protocol keys (`tool_mode`, `multi_agent_version`) the installed **CLI 0.135.0**
  can't speak → **API 400**, which silently killed the launched lanes (zero commits). Auth is `auth_mode=chatgpt`
  (no API key), so the ChatGPT-account model set applies.
- **Fix (operator asked to update the CLI):** **upgraded `@openai/codex` 0.135.0 → 0.145.0** (`npm i -g
  @openai/codex@0.145.0 --prefix ~/.local`; reversible). Re-verified the three flags the harness uses survive
  (`-m`, `--dangerously-bypass-approvals-and-sandbox`, `-C/--cd`). **`gpt-5.6-sol` then smoke-tested clean**
  (`SMOKE_OK`, exit 0, no 400; the prior `unknown variant 'max'` cache error is also gone). Pinned
  **`gpt-5.6-sol`** explicitly as the harness default in both `auto-session-codex*.sh`
  (`CODEX_MODEL="${CODEX_MODEL:-gpt-5.6-sol}"` + `-m`; env-overridable, e.g. `CODEX_MODEL=gpt-5.5`).
- **Interim step recorded:** first pinned `gpt-5.5` (worked on 0.135.0) before the operator opted to upgrade;
  now superseded by the 0.145.0 + gpt-5.6-sol end state. The global `config.toml` (`model = "gpt-5.6-sol"`) now
  matches the working CLI — interactive `codex` works again too.

## Overnight watch (active goal — SESSION_0620)

**`/goal`: clean green Codex sessions for the AM coffee merge-review.** Petey watches both autonomous
lanes and drives them to green PRs the operator reviews in the morning. **Protocol per lane completion/exit:**

- **Success (clean PR):** record the PR # for the AM review; the Lane 2 chain self-perpetuates.
- **Gate failure (brake trip, dirty tree):** read the lane log, **diagnose → fix the blocker in canonical →
  commit + push `main` → reset the worktree to new `main` → relaunch**. (First instance: flaky `courses`
  test → fixed in `5c3f80ac`.)
- **Codex usage/rate-limit early-exit (operator ask):** do NOT just relaunch — **pick up the remainder and
  land it myself** (finish the in-flight task, run gates, commit to the lane branch, push, open/update the
  PR) so the session lands green.

Lanes: **Lane C** `../ronin-codex-smoke` (gpt-5.6-sol) · **Lane 2 chain** `../ronin-wl-lane` (gpt-5.5, N=3
self-perpetuating). Each background process's completion notifies Petey (covers gate-fail / limit-exit /
success); a long fallback wakeup guards a true hang.

**Watch log:**

- **Cycle 1 (both lanes) — gate fail, self-inflicted → fixed + relaunched.** Both lanes did *sound* work
  (Lane C: WL-P3-54, full suite **1,689/1,689** — the courses-timeout fix WORKS; Lane 2: WL-P3-37 +
  WL-P3-41/46 stale-ledger cleanup, typecheck/lint green) but **both stopped on the same blocker: my
  SESSION_0620 courses-test fix wasn't oxfmt-formatted** (Vercel skips `format:check`, so it slipped to
  main in `5c3f80ac`). Fix: `oxfmt` the file → `414a433f` (cosmetic line-wrap; test still 11/11). Both
  worktrees reset to `414a433f` + relaunched. **Lesson:** run `format:check`, not just typecheck/lint, on
  any hand-edited file before push — Vercel is not an oxfmt gate.
- **Cycle 2 (both lanes again) — systemic format gate → root-fixed + Lane C landed.** Both relaunched lanes
  stopped again on `format:check`, this time on **their OWN new files** — the harness prompt made agents
  *check* formatting but forbade *all* write-mode formatting, so an agent that wrote a not-oxfmt-perfect
  file couldn't fix it. **Root fix (`fbf2d5d9`):** the prompt now requires scoped `bunx oxfmt <changed
  files>` on the agent's own diff before `format:check` (only the repo-wide format script stays forbidden).
  **Lane C landed → [PR #255](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/255)**
  (WL-P3-54; the agent's work, scoped-formatted + gates-verified + rebased by Petey — done 2× already, so
  landed rather than redone a 3rd time). Lane 2 chain still running on the old prompt; will relaunch it with
  the fixed prompt (self-completing) when it stops. **AM review queue: PR #255.**
- **Cycles 3–7 (morning, operator awake) — 3 PRs delivered, then diminishing returns → banked.** Landed
  **PR #256** (WL-P3-24/37/55) + **PR #257** (WL-P3-41/46/61); Lane C's WL-P3-54 = **PR #255**. Total **3
  clean PRs, ~7 WL items**, all gates green, opened-not-merged. Along the way, **6 harness fixes** hardened
  `auto-session-codex.sh` (self-format · courses flaky test · PR-base fallback · ≥1-commit · branch-collision
  skip · dropped flaky `ls-remote`). Then hit an **undiagnosed empty-log early-exit** on repeated relaunch
  that isn't reproducible (codex smoke-passes, pre-session logic passes by hand) → **operator banked the 3
  PRs** rather than keep whack-a-moling. Follow-up: **WL-P2-79** (live-debug the relaunch; consider a leaner
  codex-exec path). **Lesson:** the harness wasn't built for repeated fresh relaunches off a staging base;
  overnight/background is the wrong place to debug an intermittent early-exit — needs a live foreground session.

## What landed (SESSION_0620)

A very large mixed session — build + review + governance + an autonomous-lane saga:

- **D-053 RESOLVED** — all 22 skill-twin outliers conformed to the git-stored symlink law (`.agents`=one real
  home, `.claude` symlinks in); Codex reads `ggr`/`pp`/`ppp` + current rituals. Chosen over a copy-generator
  after finding 33 skills already symlinked. Fixed a `code-quality` broken doc-link in passing.
- **Codex model resolved** — upgraded CLI `0.135.0 → 0.145.0`, pinned + smoke-tested `gpt-5.6-sol`.
- **Gate 12d built** (WL-P2-78) — `bow-out-gates.sh` blocks a code session with no `/ggr` composite.
- **Flaky `courses` integration test fixed** — 30s fixture timeout + undefined-guarded cleanup (11/11).
- **2 Desi UI fixes SHIPPED to BBL prod** — belt theme-invariance + 16px mobile input (kills iOS zoom).
- **`/caveman` wired** into the auto-lanes; **6 harness robustness fixes** on `main`.
- **3 autonomous WL-clearing PRs** (#255/#256/#257, ~7 items) banked for the AM review.
- **`Client_Meeting_Intake` recipe card synthesized** (generalized from the MMB/Michael-notes pattern).
- **Desi `/hallmark`** + **`/rr`** reviews captured (fix-lists → PL/WL rows, not prose).
- **SotD Artifact** published (bow-in).
- **Staged the parallel next pair:** SESSION_0624 (AM merge) + SESSION_0625 (MMB intake).

## Review log

**`/ggr` gate — SESSION_0620 code diff (dogfoods the Gate 12d built this session).** Primary unit = the
shippable-code changes: the two Desi UI fixes (`input.tsx` mobile-16px floor; `phase.ts` theme-invariant belt
hues) + the `courses/queries.integration.test.ts` robustness fix. **Class A/B** (design-system CSS + test
infra). Metric-backed (not eyeballed — `fallow audit --changed-since 1ee6ad14` run):
- **Objective:** maintainability **90.6 (good)**, avg cyclomatic 1.5; the diff introduces **no new
  complexity, no new clones, no new dead code**. Gates green: typecheck ✓ · oxlint 0 err ✓ · oxfmt ✓
  (Cody) · courses test **11/11 pass, 1.73s** (verified) · wiki:lint 0 err.
- **D1 9** (behavior-preserving — CSS-class-only UI + test-cleanup guard; `text-base`=16px & no-`dark:` belts
  are deterministic) · **D2 9** (no authz/exposed-surface change) · **D3 9** (minimal diffs; `present()` is a
  clean 1-line guard) · **D4 9** (doc comments updated to match; guard documents its SESSION_0620 why) ·
  **D5 9** (test made *more* robust) · **D6 9** (30s timeout absorbs multi-lane DB contention) · **D7 9**
  (reuses `inputVariants` / existing belt classes; no new component).
- **No hard caps** (no regression, no Dirstarter bypass, no new god-component). **Composite ≈ 9.2/10 → CLEARS.**
- **Inherited (surfaced by fallow, NOT introduced this session, NOT adopted):** `phaseBadgeVariant` CRAP-30
  (untouched — I edited `PHASE_STOP_CLASS` strings, a different symbol) · test↔source clone families (73 lines,
  `queries.integration.test.ts` mirrors `queries.ts` — inherent test pattern). Logged as pre-existing, not this
  session's debt.

## Status

Single source of truth is the frontmatter `status:` field.
