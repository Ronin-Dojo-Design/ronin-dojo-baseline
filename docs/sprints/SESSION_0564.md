---
title: "SESSION 0564 — Obsidian Dashboard Epic: plan-first grill (vault→repo, dashboard, Hermes, design skills)"
slug: session-0564
type: session--plan
status: in-progress
created: 2026-07-17
updated: 2026-07-17
last_agent: claude-session-0564
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0555.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0564 — Obsidian Dashboard Epic: plan-first grill (vault→repo, dashboard, Hermes, design skills)

## Date

2026-07-17

## Operator

Brian + claude-session-0564 (worktree lane `session-0564-obsidian-epic`; IDs 0556–0563 claimed by
live sibling worktrees — FS-0030 ID-space check done)

## Goal

Petey plan-first session, NO build: produce a fully-grilled `Obsidian_Dashboard_Epic.md` covering
(a) bringing the company branding Obsidian Vault into/alongside the repo, (b) design-system template
skins + quick mockups + client business-showcase uses, (c) a custom dashboard, (d) agentic
automation (Hermes local cron + a Model Option discussion doc with `research-recommend.md`), with
phone+laptop parity. Plus: goals-ledger rows for the Fable-5-window design/planning work, and a plan
to add two new skills (Matt Pocock's `wayfinder`, Nutlope's `hallmark`).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0555.md`
- Carryover: 0555 queued the merge wave (A→B→C→D→F) as next-session default; the operator pinned
  THIS plan-only lane instead — merge wave stays queued and untouched by this session.

### Branch and worktree

- Branch: `session-0564-obsidian-epic` (off `origin/main` @ `f8ac96cd`)
- Worktree: `/Users/brianscott/dev/ronin-0564` (docs-only lane; no bootstrap needed until wiki-lint)
- Status at bow-in: clean
- Current HEAD at bow-in: `f8ac96cd`

### Graphify check

- Queries used: `obsidian vault dashboard automation cron agent` (budget 1500)
- Key hit: the repo ALREADY tracks `ronin_obsidian_starter_vault/` at root (+ the
  `.agents/skills/obsidian-vault` SKILL mirror with a stale WSL `/mnt/d/...` vault path).
- Verification: opened the starter vault, the live Desktop vault, and the skill file directly.

### Recon facts (verified by direct inspection)

- Registered Obsidian vault (obsidian.json, currently open): `/Users/brianscott/Desktop/Baseline_Vault`
  — 1.7 GB, 4,221 md files total. The structured core `RONIN_DOJO-Baseline/` is 3.2 MB / 94 notes
  (00_Inbox…09_Tasks, 12_Content_Engine, 90_Templates, 95_Bases, 98_Admin, 99_Code) — the live
  evolution of the in-repo `ronin_obsidian_starter_vault/` seed. Bulk = WEKAF/WordPress media packs.
- Vault plugins already installed: `obsidian-git`, `obsidian-kanban`, `templater-obsidian`,
  `copilot`, `obsidian-importer`.
- Operator's own design notes found in-vault: `Obsidian Integration and Automation.txt`
  (3-layer model: Obsidian = workbench → Pods/publish → transactional services; note-type taxonomy;
  plugin ladder Tasks→Dataview→Templater→Bases; capture→structure→review→ready_to_publish flow).
- Goals ledger: `docs/knowledge/wiki/goals-ledger.md`, next free ID G-014.
- Skills research (web, this session): `wayfinder` = mattpocock/skills planning/decision-map skill
  (MIT; depends on sibling skills; real-world friction reports); `hallmark` = Nutlope/hallmark
  anti-slop design skill (MIT, ~12k stars; OKLCH tokens, 21 macrostructures/20 themes, slop-test).

### Grill outcome

12 forks resolved across 3 dispatch rounds (D1–D12, recorded in the epic §3): source vault +
"other two" identified as the iCloud RoninDojoDesign/RoninDojoObsidian vaults; two-repo +
vault-kit model; ONE-vault consolidation (13 GB iCloud archive); layered git+Obsidian-Sync;
phased dashboard (Obsidian-native v1 → apps/web); DB-seed-token skins; Hermes v1 = 5 jobs incl.
operator-added email sweep; email lane = plan ALL three phases now, build hands off to Codex/cheap
subagents; program-row + Mammoth-pilot goals shape; wayfinder vendor+conform; hallmark vendor
scoped; never-auto-send invariant.

## Petey plan

### Goal

Lock the Obsidian Dashboard Epic end-to-end via grill, write the epic doc + goals rows + skills
plan, commit on this branch, HOLD at push gate.

### Tasks

#### SESSION_0564_TASK_01 — Research + recon (wayfinder, hallmark, vault survey)

- **Agent:** Petey (+ 2 web-research subagents)
- **What:** locate/understand both candidate skills; survey the vault + in-repo seed; find goals ledger.
- **Done means:** findings recorded above + reported to operator. **Status: landed.**
- **Depends on:** nothing

#### SESSION_0564_TASK_02 — Grill the epic forks with the operator

- **Agent:** Petey
- **What:** dispatch-friendly grill rounds (vault path + import model + sync → dashboard + Hermes +
  Model Option → skins/showcase + skills placement), recommendations attached.
- **Done means:** every fork resolved or explicitly parked; `Grill outcome` + `Decisions resolved` filled.
- **Depends on:** TASK_01

#### SESSION_0564_TASK_03 — Write Obsidian_Dashboard_Epic.md + goals rows + skills plan

- **Agent:** Petey (docs only; no app code)
- **What:** epic doc (location per grill), G-014+ rows in goals-ledger, skills-addition plan section;
  fix the stale `obsidian-vault` skill path as a named epic task (not this session).
- **Done means:** docs committed on `session-0564-obsidian-epic`; wiki-lint green; push HELD.
- **Depends on:** TASK_02

### Parallelism

TASK_01 research subagents ran parallel; TASK_02→03 sequential (grill gates the doc).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0564_TASK_01 | Petey + research subagents | Web research + read-only recon |
| SESSION_0564_TASK_02 | Petey | Grill is the planner's job |
| SESSION_0564_TASK_03 | Petey | Plan/docs deliverable, no build |

### Open decisions

See grill forks — recorded in `Decisions resolved` as they close.

### Risks

- Vault is 1.7 GB — any "import it all" path bloats the repo; plan must split core vs media archive.
- Many live sibling lanes touch `docs/knowledge/wiki/` — goals-ledger edit will need a trivial
  rebase at merge time.
- `wayfinder` has real-world friction reports (Discussion #484) — vendoring plan must account for
  its sibling-skill dependencies or steal-the-structure instead.

### Scope guard

- NO app code, NO build, NO migrations, NO vault mutation this session (read-only vault access).
- FI-001 parked. Merge wave untouched. `../ronin-dojo-monorepo` read-only.
- Skill installs themselves are the EPIC's work, not this session's — this session plans them.

### Dirstarter implementation template

- **Docs read first:** not applicable (docs/governance planning lane; no L1 area touched)
- **Baseline pattern to extend:** n/a
- **Custom delta:** n/a
- **No-bypass proof:** no Dirstarter capability replaced — plan-only session.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0564_TASK_01 | landed | wayfinder + hallmark research, vault survey, goals-ledger recon |
| SESSION_0564_TASK_02 | landed | 12 forks resolved in 3 dispatch rounds (epic §3 D1–D12) |
| SESSION_0564_TASK_03 | landed | Epic doc + G-014..G-017 + skills plan written; committed on lane branch; push HELD |

## What landed

- `docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md` — the full grilled blueprint:
  3-vault inventory, 12 locked decisions, two-repo + vault-kit architecture (mermaid), workstreams
  A–E with stable task IDs (OD-A1..OD-C3, OD-D1..D6, E-P1..E-P4), Model Option matrix with live
  pricing, skills plan (hallmark vendor / wayfinder vendor+conform / obsidian-vault replace),
  sequencing + scope guards.
- Goals ledger G-014 (epic, in-progress P1), G-015 (Hermes + Model Option, P1), G-016 (Email
  Boards program, P2), G-017 (Mammoth pilot, P1) — all project on the loop-board.
- Research: wayfinder (mattpocock/skills — planning/decision-map skill, MIT, friction reports) and
  hallmark (Nutlope/hallmark — anti-slop design skill, MIT, ~12k★) confirmed with sources.

## Decisions resolved

D1–D12 — see epic §3 (single source; not duplicated here).

## Files touched

| File | Change |
| --- | --- |
| `docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md` | NEW — the epic blueprint |
| `docs/knowledge/wiki/goals-ledger.md` | G-014..G-017 appended; frontmatter agent bump |
| `docs/sprints/SESSION_0564.md` | This file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` (worktree) | (run at close — recorded below) |

## Open decisions / blockers

- Push of `session-0564-obsidian-epic` — HELD for operator authorization (docs-only; no deploy
  via `ignoreCommand`).
- Obsidian Sync subscription state unverified (OD-A5 step 1 checks it; fallback obsidian-git).
- Michael Flores video meeting 2026-07-18: showcase the Obsidian/Hermes plan; collect Mammoth
  OAuth + possible Google Calendar / Todoist API keys. (Email pilot pivoted to BBL — D9 amended
  by operator post-grill; Mammoth = first follower.)
- E-P4 approval-UX grill — operator, before any send-flow build.
- Dashboard inspiration pack: 10 screenshots RECEIVED + filed to
  `Baseline_Vault/10_Design/_inspiration/obsidian-dashboard/` with PACK.md manifest (source:
  TheEricMichaud "Obsidian Customization Is Getting Out of Hand"; design DNA distilled into epic
  OD-B2/B4/D5). Still pending from phone: the Talk-To-Text transcript notes (cleaned + raw) →
  same folder. Video URL lookup in flight → PACK.md field.

## Next session

### Goal

Execute epic Phase 1: vault consolidation + sync (OD-A1..A5, operator-assisted) and vendor the
two skills (hallmark; wayfinder + 4 deps, conformed) — then ratify the vault-kit ADR.

### First task

Read `docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md` §5-A. Start OD-A1 (split the
canonical core; media → `_archive/`) with the operator present, then OD-A2 (vault → private git
repo). Skills vendor (OD §7) can run in parallel as a disjoint lane. Note: the 0555 merge wave
may still be queued — it takes precedence if the operator says so.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

- ADR update: TBD at bow-out (epic may warrant an ADR for the vault↔repo model — grill decides).
- Ubiquitous language: "Hermes" (local cron agent) + "vault-kit" candidates — confirm at doc time.

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
