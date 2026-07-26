---
title: "SESSION 0564 — Obsidian Dashboard Epic: plan-first grill (vault→repo, dashboard, Hermes, design skills)"
slug: session-0564
type: session--plan
status: closed
created: 2026-07-17
updated: 2026-07-18
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
| `bash scripts/bow-out-gates.sh` | All gates PASS (task log 6 rows; wiki:lint 0 err/54 pre-existing warn; build skipped docs-only; git clean) |
| `bun run scripts/wiki-lint.ts` (after every commit) | 0 errors / 54 warnings (baseline held across 7 commits) |
| Web research (2 subagents) | wayfinder + hallmark sources verified; video URL confirmed (youtube.com/watch?v=7ixrbVKX7bk) |
| Vault filesystem verification | 5-vault constellation verified by direct inspection (obsidian.json, sync.json absence, Spotlight + find) |

## Open decisions / blockers

- Push of `session-0564-obsidian-epic` — HELD for operator authorization (docs-only; no deploy
  via `ignoreCommand`).
- Obsidian Sync subscription state unverified (OD-A5 step 1 checks it; fallback obsidian-git).
- Michael Flores video meeting 2026-07-18: showcase the Obsidian/Hermes plan; collect Mammoth
  OAuth + possible Google Calendar / Todoist API keys. (Email pilot pivoted to BBL — D9 amended
  by operator post-grill; Mammoth = first follower.)
- E-P4 approval-UX grill — operator, before any send-flow build.
- Dashboard inspiration pack: 15 screenshots RECEIVED + filed to
  `Baseline_Vault/10_Design/_inspiration/obsidian-dashboard/` with PACK.md manifest (source:
  TheEricMichaud "Obsidian Customization Is Getting Out of Hand", URL verified; design DNA
  distilled into epic OD-B2/B4/D5 incl. Metrics/Content-tab anatomy + Impeccable mechanics).
- Thoughts-To-Text transcript RECEIVED (pasted; the "Obsidian Design System" share had routed
  to Todoist via the "Ronin" capture destination). Filed: verbatim raw →
  `docs/product/obsidian-dashboard/raw/2026-07-18-brian-thoughts-to-text.md`; BBL-side
  distillation → `docs/product/black-belt-legacy/gi-brand-experience-and-content-atoms.md`
  (PROPOSED input); epic amended (OD-B2 skin roster, OD-C1 offline-mirror, OD-D7 trend radar,
  OD-D5 capture shortcut, folder-promotion note).
- Bow In/Bow Out ritual UX + Sensei greeter — needs its OWN grill (Petey + operator → Desi)
  before any build; BBL input doc §2 carries the fork list.

## Next session

### Goal

Execute epic Phase 1: vault consolidation + sync (OD-A1..A5, operator-assisted) and vendor the
two skills (hallmark; wayfinder + 4 deps, conformed) — then ratify the vault-kit ADR.

### First task

Read `docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md` §5-A. Order (operator,
0564 close): (1) **skills vendor first** (hallmark; wayfinder + 4 deps, conformed — OD §7);
(2) **wayfinder maiden run**: chart the "Mammoth CRM ↔ dashboard integration" map — the CRM
panel/tab is an identified OD-B4 gap and crosses the per-product DB boundary (ADR 0038), so
resolve the fog as decision tickets BEFORE dashboard build (fallback: quick /grill-me if
wayfinder's out-of-box friction bites); (3) OD-A1/A2 vault consolidation with the operator
present. Note: merge-wave remnants (lanes A/B/E) may still be landing — check origin/main first.

## Review log

### SESSION_0564_REVIEW_01 — Plan-lane close review

- **Reviewed tasks:** SESSION_0564_TASK_01..03 (+ mid-session amendments)
- **Dirstarter docs check:** not applicable (docs/governance lane; no L1 area touched)
- **Verdict:** The epic survived contact with reality repeatedly in one session — 3 grill rounds,
  a pilot pivot, 15 inspiration frames, a dictated brain-dump, and two vault-forensics reversals —
  and absorbed all of it as amendments to the same 12-decision skeleton. Plan quality is proven by
  amendment cost staying low. Weakness: Workstream A remains estimate-heavy until the operator is
  at the laptop; Sync subscription still unverified.
- **Score:** 9.0/10
- **Follow-up:** first build session executes Phase 1 + ratifies the vault-kit ADR.

## Hostile close review

- **Giddy:** pass — lane isolation held (own worktree/branch; merge wave untouched; one
  goals-ledger conflict resolved at merge with both sides preserved); binaries kept out of the
  monorepo per doctrine; folder promotion follows existing product-folder conventions.
- **Doug:** pass — docs-only diff; all gates green at every commit; claims in the epic §2
  inventory are each backed by direct filesystem verification recorded in-session; no app code,
  no migrations, no vault content in repo.
- **Desi:** not applicable (no UI touched; design DNA captured as inputs only).
- **Kaizen aggregate:** 9/10 — high-throughput plan session with verified inputs; deducted for
  the two inference reversals (phone-vault Sync pairing, "other two files") that direct
  verification later corrected — verify-before-inferring earlier next time.

## ADR / ubiquitous-language check

- ADR update **not required this session** (plan-only). The epic explicitly stages ratification:
  the two-repo vault-kit model + the D12 never-auto-send invariant → ADR in the first build
  session (epic §9).
- Ubiquitous language: "vault-kit", "Hermes" (local cron agent — note friendly name collision
  with Eric Michaud's agent), "skin playground", "inspiration pack", "Email Boards" introduced;
  all defined in the epic/PACK.md at first use.

## Reflections

The grill format earned its keep: three AskUserQuestion rounds with recommendations attached
resolved 12 forks from a phone, and every later input (screenshots, dictation) amended rather
than broke the plan — cheap-to-amend is the real test of a plan's shape.

Verification beat inference twice: the phone vault "obviously" paired via Obsidian Sync until
sync.json's absence proved otherwise, and the "other two files" guess (iCloud vaults) was right
only by luck of the operator's confirmation. The pattern to keep: state the inference, then
verify on disk before writing it into canon — both corrections were one command away.

The session also demonstrated the capture-path problem it plans to solve: a note shared from the
phone routed to Todoist, a vault duplicate appeared mid-session, and the transcript arrived by
paste — five vault copies and three capture destinations is exactly why Workstream A ships
first. The epic's best property may be that its planning session doubled as its evidence base.

## Full close evidence

| Step | Proof |
| --- | --- |
| Gate runner | `bow-out-gates.sh` all PASS (see Verification) |
| JETTY/frontmatter sweep | All new docs carry full frontmatter; goals-ledger bumped to 2026-07-18/claude-session-0564 |
| Backlinks/index sweep | New docs pair epic ↔ raw ↔ BBL input ↔ session |
| Wiki lint | 0 errors / 54 pre-existing warnings |
| Kaizen reflection | Reflections above |
| Hostile close review | SESSION_0564_REVIEW_01 + hostile block above |
| Review & Recommend | Next session staged (epic Phase 1; first task = OD-A1 + skills vendor) |
| Ledger routing | No new FS/D/INC rows (no SOP misses; epic tracks the stale-skill fix as OD-B5); G-014..G-017 added |
| Memory sweep | `obsidian-vault-constellation` memory written + MEMORY.md index line |
| Git hygiene | 7 commits on `session-0564-obsidian-epic`; PR #217 squash-merged on operator's word |
| Graphify update | Refreshed on canonical main post-merge (stats in close report) |
