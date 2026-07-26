---
title: "SESSION 0712 — Phase C: trim-to-brand fan-out (five-repo era)"
slug: session-0712
type: session--open
status: in-progress
created: 2026-07-26
updated: 2026-07-26
last_agent: claude-session-0712
sprint: S13
lane: repo
recipe: "epic-plan"
goal_ids: []
pairs_with:
  - docs/sprints/_archive/monorepo-era/SESSION_0711.md
  - docs/sprints/plans/petey-plan-0711-brand-repo-separation.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0712 — Phase C: trim-to-brand fan-out

> **Staged by SESSION_0711** (the fork session — Phases A+B complete, five repos live at
> `ecefd008`). Adopt: flip `status:` → `in-progress`. Sprint S13 = the post-cleanup era marker
> (N1 call: monotonic numbers, era via `sprint:`).

## Goal

Execute **Phase C** of `docs/sprints/plans/petey-plan-0711-brand-repo-separation.md` (operator
go given at 0711 for the phase sequence; per-phase checkpoint still applies): per brand repo
(BBL · Baseline-Martial-Arts · Mammoth-Metal-Buildings · USA-Stickfighting — RDD-Monorepo
untouched): C1 delete other brands' apps/clients (ordinary commits) · C2 brand-doc trim ·
C3 CI matrix prune · C4 ~150-line CLAUDE.md router · C5 fresh SESSION era
(spine → `_archive/<era>/`, restart 0001) · C6 per-repo `docs/adr/` subset. Plus: per-repo
`settings.json` (bow-in-gates hook registration is gitignored — copy at bootstrap) and extend
the `main-pr-only` server ruleset to all four siblings. Then Phase D validation
(install/typecheck/build/preview/smoke per repo).

**Law reminder (ADR 0059):** session = one repo — Phase C lanes run as separate sessions or
sequential lanes in each repo's own checkout, NOT worktrees of one repo.

## First task

Open the fork plan Phase C section; start with **Black-Belt-Legacy** (this checkout — trim
baseline/rdd apps + mammoth client out of it). Riders: WL-P3-69 (a) ui-kit oxfmt pin+normalize
(ratified 0711 decision #9, fell through the wave) + (c) upstream repro · FS-0042 doc sweep
(`bunx fallow` in executed docs) · Desktop vault copy deletion (pending operator word) ·
PL-030 explorer epic queued behind the fork work.

## Bow-in

- Adopted the staged stub (ADR 0049 flip). Canonical claimed for 0712; githooks doctor PASS.
- Operator answers (Petey's three + SotD ask): **lane = Phase C BBL trim** (no pivot) · riders
  elected: **WL-P3-69 (a)+(c)** + **FS-0042 doc sweep** (Desktop-vault deletion NOT elected —
  stays pending) · **SotD frozen snapshot: YES** (published, see Artifacts).
- Parallel-lane assessment (1d): Phase C is 4-repo disjoint, but ADR 0059 (session = one repo)
  ⇒ single-lane in Black-Belt-Legacy today; sibling repos get their own sessions.
- Trim survey: this repo carries `apps/{baseline,rdd,web}` + `clients/mammoth-build-crm` +
  `packages/{api-client,ui-kit}`. BBL keeps `apps/web` + `packages/*`.

## Petey plan

| ID | Task | Maps to |
| --- | --- | --- |
| SESSION_0712_TASK_01 | C1: `git rm` `apps/baseline`, `apps/rdd`, `clients/mammoth-build-crm`; repo builds with `apps/web` only | Phase C1 |
| SESSION_0712_TASK_02 | C2: delete other brands' docs/seeds; wiki-lint green | Phase C2 |
| SESSION_0712_TASK_03 | C3: CI matrix prune to surviving app; one green CI run | Phase C3 |
| SESSION_0712_TASK_04 | C4: ~150-line CLAUDE.md router (pointers, no duplicated rule text) | Phase C4 |
| SESSION_0712_TASK_05 | C5: sprints spine → `docs/sprints/_archive/<era>/`; restart SESSION_0001 | Phase C5 |
| SESSION_0712_TASK_06 | C6: `docs/adr/` subset — only ADRs binding BBL | Phase C6 |
| SESSION_0712_TASK_07 | settings.json bootstrap note + `main-pr-only` ruleset on the four siblings | 0712 goal extras |
| SESSION_0712_TASK_08 | Rider: WL-P3-69 (a) ui-kit oxfmt pin+normalize + (c) upstream repro | WL |
| SESSION_0712_TASK_09 | Rider: FS-0042 `bunx fallow` doc sweep | FS |

## Task log

| ID | Result |
| --- | --- |
| TASK_01 (C1) | ✅ `698d8628..6d2e1571` — 3 app trees removed, lockfile refreshed, tsc + `next build` green |
| TASK_02 (C2) | ✅ `f401a402..8b3c4f83` — 62 other-brand doc files removed, wiki-lint 0 errors |
| TASK_03 (C3) | ✅ `8ee5fdad..bbbccf81` — clients-ci.yml deleted, ci/playwright pruned + YAML-validated (green CI run lands at push) |
| TASK_04 (C4) | ✅ `e1bce0de` — CLAUDE.md → 79-line router; all 34 cited paths verified to exist |
| TASK_05 (C5) | ✅ `de2c…/82f9` — spine 0304–0711 (282 files) → `_archive/monorepo-era/`; **operator-ratified: monotonic numbering + `sprint: S13` era marker** (supersedes plan C5 "restart 0001") |
| TASK_06 (C6) | ✅ call: live `docs/adr/` (0055–0059) already IS the BBL-binding subset — all five reference live surfaces; legacy 0001–0054 stays intact per the README freeze law. Cleanup: `a654233f` dropped squash-reintroduced 0001–0004 duplicates + finished the renumber (H1s/titles/README) — **drift finding from the #342 squash close** |
| TASK_07 | ✅ `main-pr-only` ruleset created ACTIVE on all four siblings (ids 19777563–66); `b5f97e17` tracked `.claude/settings.shared.json` + bootstrap copy step (cherry-pick to RDD-Monorepo per ADR 0059) |
| TASK_08 (WL-P3-69) | ✅ `4a31dbaf`/`fad078db` — (a) ui-kit oxfmt pinned zero-diff; (b) moot (C1 deleted the script); (c) comment-reorder REPRODUCED (worse: one line hoisted per pass, converges N+1) → G10 guardrail + scratchpad repro + DRAFT upstream issue (unposted, operator-gated) |
| TASK_09 (FS-0042) | ✅ `03d89b88`/`d92992ba`/`d2dd66ee` — bunx-fallow doc sweep (6 executed docs), minter phantom-filter fix, + the Doug-caught self-burn evidence line fixed |

## Verification

- Doug full-diff verify (`1a513d43..HEAD`, 26 commits): **GO, 9.2/10** — tsc ✅ · `next build` ✅ ·
  `bun run test` 1923 pass / 0 fail ✅ · format:check root+ui-kit ✅ · wiki-lint 0 errors ✅ ·
  arch-gate 4/4 ✅ · executable-reference sweep to deleted paths clean. Diff shape:
  548 files, +379/−27278.
- Doug P3 residue (routed to Next session): on-disk gitignored leftovers (`apps/rdd/` node_modules,
  `clients/mammoth-build-crm/.env` — move secrets to RDD-Monorepo then delete), 6 stale pre-fork
  worktrees + 1 stale agent worktree (ADR 0059 prune), pre-0304 petey-plans/lanes archive sweep,
  WEKAF brand-kit PNG disposition (→ USA-Stickfighting), ADR 0055/0059 missing frontmatter,
  api-client missing format/test scripts.

## /rr — kepano/obsidian-skills (research-recommend, operator-requested)

- **Graph query:** `graphify query "obsidian vault skills CLI sync"` → prior art: vendored
  `.agents/skills/obsidian-vault/SKILL.md` (**broken-foreign — points at a WSL
  `/mnt/d/…` vault that doesn't exist on this Mac**), `ronin_obsidian_starter_vault/`, ADR 0048,
  G-014 epic, and the 0566 **skills-CLI over-sync incident** (memory: `npx skills add` treats
  itself as owner of the whole skill set — tried ~15 unrequested installs + refresh/delete of
  every existing skill; keep-list revert + `skills-lock.json` rebuild was the recovery).
- **Upstream:** kepano/obsidian-skills = 5 Agent-Skills-spec skills (obsidian-markdown ·
  obsidian-bases · json-canvas · obsidian-cli · defuddle), by Obsidian's CEO, 43K★, active.
  Directly serves G-014 (Bases/Canvas are the dashboard formats) + the RDD_Master_Vault system.
- **Recommendation (ONE):** vendor at **user level, manually pinned** — clone to
  `~/.claude/vendor/obsidian-skills` + symlink the 5 skill dirs into `~/.claude/skills/` —
  NOT `npx skills add` into this repo. Why: every repo + vault session on this machine sees
  them; sidesteps the 0566 CLI over-sync against this repo's 40+ custom skills +
  `skills-lock.json`; keeps freshly-trimmed BBL lean; if repo-vendoring is later wanted it
  lands RDD-Monorepo-first per ADR 0059. Alternatives considered: (a) literal `npx skills add`
  in-repo — known over-sync trap + bloat ×5 repos; (b) vault-root `.claude/` — invisible to
  repo sessions; (c) RDD-Monorepo vendor+sync — the eventual home if in-repo is ever needed.
- **Rider routed:** replace the broken `obsidian-vault` skill with a thin RDD-vault pointer
  (live vault path + conventions), delegating format knowledge to the kepano set.

## Artifacts

- State-of-Dojo frozen snapshot (bow-in): <https://claude.ai/code/artifact/77fd25bb-4dd6-4f34-98f0-98dea93adbfd>

## Next session

### Goal

Phase C fan-out continues per ADR 0059 (session = one repo): run the trim-to-brand C1–C6 in the
NEXT sibling checkout (Baseline-Martial-Arts or Mammoth-Metal-Buildings — Mammoth first if the
2026-08-05 cutover pressure says so), reusing this session's recipe (this file's Task log +
`docs/sprints/plans/petey-plan-0711-brand-repo-separation.md`). Then Phase D validation per repo.

### First task

In the sibling checkout: bootstrap (`/worktree-setup` equivalent — settings.shared.json copy now
exists), then C1 `git rm` the non-brand apps. Riders queued for a BBL hygiene lane: Doug P3
residue list (SESSION_0712 §Verification), oxfmt upstream issue post (draft in 0712 scratchpad —
needs operator word), Desktop vault copy deletion (still pending operator word), PL-030 explorer
epic behind the fork work.
