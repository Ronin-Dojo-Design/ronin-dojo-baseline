---
title: "SESSION 0620 — Twin generator (D-053/WL-P2-77) + Codex model + Desi review + /rr slices"
slug: session-0620
type: session--open
status: in-progress
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
| SESSION_0620_TASK_04 | ⏳ queued | Desi (subagent) | `/hallmark` review of `/app` surfaces (PL-020/021/023) → prioritized fix list for Cody. No prod code. |
| SESSION_0620_TASK_05 | ⏳ queued | Petey/Giddy `/rr` | Sections wiring/consolidation audit + `/rr` slices (A4, B1–B5, WL-P2-75/76) → WL rows, not prose. |

## Artifacts

- **Frozen State-of-Dojo snapshot (bow-in, 2026-07-22):**
  <https://claude.ai/code/artifact/0673ebcb-62db-4d97-9aef-04d0e4732d7a> — deterministic projection of
  `docs/sprints/*` + `goals-ledger` (390 sessions, 31 goals) via `bun scripts/state-of-project.ts`, published
  body-fragment through `/preview-artifacts`. Live always-current equivalent: `/app/state`.

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

## Status

Single source of truth is the frontmatter `status:` field.
