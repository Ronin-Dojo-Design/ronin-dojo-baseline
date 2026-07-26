---
title: "SESSION 0573 — Wayfinder epic: local-agent lab + HubSpot-replacement roadmap (MMB_SESSION_0002 TASK_05/06)"
slug: session-0573
type: session--open
status: closed
created: 2026-07-18
updated: 2026-07-18
last_agent: claude-session-0573
sprint: S0573
pairs_with:

  - docs/sprints/SESSION_0572.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0573 — Wayfinder epic: local-agent lab + HubSpot-replacement roadmap (MMB_SESSION_0002 TASK_05/06)

## Date

2026-07-18

## Operator

Brian + claude-session-0573

## Goal

Chart the local-agent feasibility lab + HubSpot-replacement roadmap (MMB_SESSION_0002 TASK_05 +
TASK_06) as a wayfinder map — grill the destination + breadth-first frontier with the operator,
create the map + decision tickets on the ratified tracker, and fire research subagents for the
exact model-candidate facts (names/licenses/offline/cost) before any benchmark claims. No live
integrations; charting hand-resolves nothing (wayfinder chart mode).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0572.md`
- Carryover: 0572 ratified the MMB lean operating system (9 forks → MMB-D-001…009, CV/BHB/runbook
  homes, vault LLLs + templates) and pinned this lane: fresh-session wayfinder epic for
  MMB_SESSION_0002 TASK_05/06. Local commits `9cf590f1..e52d644b` remain unpushed (push held).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `e52d644b`

### Graphify check

- Graph status: current; stats at bow-in: 18733 nodes, 35683 edges, 2537 communities, 2845 files tracked.
- Queries used:
  - `local-first agent lab HubSpot replacement integration roadmap wayfinder`
- Files selected from graph:
  - `docs/business/leads/hubspot-integration-best-practices.md` (TASK_06 canonical HubSpot doc)
  - `docs/business/leads/project-mammoth-build-crm.md` · `docs/product/mammoth-build/PRD.md`
  - `docs/architecture/decisions/0038-per-product-database-separation.md`
- Verification note: HubSpot best-practices doc + Mammoth CRM cluster confirmed as the TASK_06
  inputs; wayfinder skill present at `.claude/skills/wayfinder/SKILL.md` (D10 preamble = tracker
  mapping). Graphify used as navigation, not proof.

### Grill outcome

Volley 1 resolved (vault rows MMB-Q-012…014 → MMB-D-013…015):

- **D-013 Destination:** as-0572, ONE map — "ratified local-first agent stack + gated integration
  lanes (read-only-first contracts, owners, approvals, stop conditions)."
- **D-014 Tracker:** GitHub issues per wayfinder D10 mapping; pointer-only bodies, no CRM/PII.
- **D-015 Reach:** full chart mode — grill frontier → create issues → fire research subagents.

Volley 2 (frontier) approved as proposed; judgment calls accepted (QuickBooks research → fog;
prototype ticketed-but-blocked). Operator ruled: **no extra ledger docs — the SESSION record is
the ticket index** (no G-row); research findings land as ticket resolution comments only.

### Map + tickets (tracker index)

Map: [#228](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/228) `wayfinder:map`.
Tickets: #229 R1 model facts · #230 R2 runtime×hardware · #231 R3 HubSpot read-only (research, fired) ·
#232 G1 scorecard · #233 G2 gate-contract template · #234 G3 lane inventory (⊣#233) ·
#235 G4 stack home + benchmark (⊣#229/230/232) · #236 P1 sanitized pilot (⊣#232/229/230).
Hardware fact recorded on the map: Intel i7-4980HQ · 16 GB · macOS 12.7.6 (no Apple Silicon).

### Mid-session additions (operator-driven)

- **Goal sharpened (operator /goal):** Brian goal #1 = replace HubSpot **Pro** (≥$418/mo) for
  Michael + cover old dev Tim's duties → `MMB_GOALS` MMB-G-004, `MMB_DECISIONS` D-018; map #228
  Notes + fog updated (Tim-coverage inventory, Pro-tier delta). Source: vault "Michael's Notes —
  Meeting" (2026-07-18 TTT capture).
- **Petey talk modes codified** in `.claude/agents/petey.md`: token-lean default (CV-001/002) ·
  `/pp` planning prose (lean Master_Chat handoff pointer only) · `/caveman`.
- **TTT pipeline epic (Q-015/016 → D-016/017):** second wayfinder map charted same-session;
  ONE `TEMPLATE - TTT Capture` created in the vault; per-type family = taxonomy grill deliverable.
- **Map 2:** [#237](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/237)
  `wayfinder:map` — tickets #238 taxonomy · #239 timesheet · #240 capture-tooling research
  (resolved + closed same-session: $0 stack = iOS on-device dictation → Obsidian mobile /
  Shortcuts → 00_Inbox; Mac = whisper.cpp source build) · #241 landing zones (⊣#238) ·
  #242 dry-run prototype (⊣#238).
- **Ticket weight/agent system (Q-018 → D-019, A):** `Weight: full|quick` + `Agent: <route>`
  body fields; full = persona HITL one-per-session, quick = subagent fan-out; Wave/Phase
  headings allowed on map checklists. Encoded in the wayfinder D10 preamble (`.claude` +
  `.agents` twins, byte-identical) and retro-stamped on all 9 open tickets.
- **D-020 rule-home law:** skill file = body (pull-path), agent file = one pointer line
  (petey.md Source-of-truth), never cody-preflight.md (LR 0007 didn't-load trap).
- **D-021 grill goal election (operator-fixed):** first question of every grill = session
  /goal — A as-is · B pivot · C repo Loop-of-Loops triage top-3 · D vault-dashboard triage
  top-3 (one goal · one risk · one ledger lane). RDD-local preamble added to
  grill-me / grilling / grill-with-docs SKILL.md. **Discovery:** `.agents/skills/*` are
  HARDLINKS of `.claude/skills/*` (same inode) — one edit serves both runtimes.
- **Grill-with-docs consolidation (D-023…026):** MMB five-pointer load-set law (CONTEXT · BHB ·
  STORIES-Solutions · owners · template/recipes; PRD/OS/runbooks backlink-only) ·
  `UBIQUITOUS_LANGUAGE.md` → `docs/product/mammoth-build/CONTEXT.md` (git mv, 8 living refs
  updated) + root `CONTEXT-MAP.md` (Pocock multi-context; BBL context lazy) · OS + recovery
  manifest kept backlink-only (YAGNI) · wiring conform: design-an-interface gained the
  DESIGN.md/CONTEXT-MAP preamble (hallmark already wired), game-on canon list conformed to the
  five-pointer set. Deferred fog: PRD-content merge into STORIES (separate slice, on demand).
- **D-022 (operator burst, TTT-captured + triaged):** goal election gains **F) fix/fail lane**
  (route to /fallow-fix-loop · /pr-fix-loop · /code-quality); petey.md gains the Orchestration
  doctrine (/pp first → lightweight subagent sweep; Petey owns handoffs/lanes from the SESSION
  file). Bigger forks ticketed on map 2: [#243](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/243)
  recipe-card-driven orchestration · [#244](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/244)
  /teach integration (**skill found already installed** — no npx add) · #238 scope comment
  (MMB-branded PDF/email outputs for Michael). Burst archived as the second live TTT capture
  in vault 00_Inbox.

## Petey plan

### Goal

The wayfinder map for MMB_SESSION_0002 TASK_05/06 exists with destination, frontier tickets, and
fog recorded; research tickets fired; nothing hand-resolved.

### Tasks

#### SESSION_0573_TASK_01 — Chart the map (grill destination + frontier)

- **Agent:** Petey/Giddy (inline MC-grill, operator-answered)
- **What:** Wayfinder "Chart the map" steps 1–2: confirm/sharpen the destination named by 0572,
  then breadth-first frontier grill (decision tickets, fog, out-of-scope).
- **Done means:** Destination sentence ratified + ticket list with types (research / grilling /
  prototype / task), blocking edges, and fog patches captured in this file.
- **Depends on:** nothing

#### SESSION_0573_TASK_02 — Create the map + tickets on the tracker

- **Agent:** Cody (inline, `gh`)
- **What:** Map issue (`wayfinder:map`) + child tickets (`wayfinder:<type>`, `Part of #<map>`,
  `Blocked by:` lines) per the D10 GitHub mapping — non-secret bodies only (no CRM/PII).
- **Done means:** Map + tickets live on the tracker; checklist lines on the map; frontier queryable.
- **Depends on:** SESSION_0573_TASK_01 + operator authorization (outward-facing issue creation).

#### SESSION_0573_TASK_03 — Fire research subagents

- **Agent:** research subagents (AFK)
- **What:** One per `research` ticket — exact local-model candidates (Hermes, Kimi, DeepSeek, etc.):
  confirmed names, licenses, offline capability, cost, tool support. No benchmark claims without
  these facts; no live integrations.
- **Done means:** Findings captured and linked from each research ticket.
- **Depends on:** SESSION_0573_TASK_02

### Parallelism

TASK_01 → TASK_02 sequential (grill feeds tickets). TASK_03 research subagents run in parallel
once tickets exist.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0573_TASK_01 | Petey/Giddy inline | HITL MC-grill needs the operator; epic mapping is the ratified wayfinder lane (D10) |
| SESSION_0573_TASK_02 | Cody inline | Mechanical `gh` issue creation from the ratified ticket list |
| SESSION_0573_TASK_03 | research subagents | AFK fact-gathering, genuinely disjoint per candidate |

### Open decisions

- Destination confirm/sharpen (one map vs two; exact destination sentence).
- Tracker/privacy: GitHub issues per D10 vs vault-local map for MMB business content.
- Charting scope this session (tickets + research fire vs chart-only).

### Risks

- MMB content on a GitHub tracker must stay non-secret (game-on rule 6) — mitigation: pointer-only
  ticket bodies, grill Q2.
- Wayfinder is token-hungry (upstream #484) — mitigation: epic-only use, MC-grill, one volley at a time.

### Scope guard

- No live integrations (HubSpot/Todoist/QuickBooks/email/scraping) — roadmap lanes only.
- No hand-resolving tickets this session (chart mode); no benchmark claims ahead of research facts.
- No push without explicit authorization; 0572 unpushed commits ride along until the word.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0573_TASK_01 | landed | Volleys 1+2 resolved → MMB-D-013…015; frontier approved |
| SESSION_0573_TASK_02 | landed | Map #228 + tickets #229–236 created, checklist + blocking wired |
| SESSION_0573_TASK_03 | landed | All 3 research tickets resolved + closed (#229/#230/#231); map Decisions-so-far updated |

## What landed

- **Two wayfinder maps charted** on the tracker: [#228](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/228)
  local-first agent stack + gated integration lanes; [#237](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/237)
  TTT capture→promote + timesheet. 16 tickets total; **4 research tickets resolved + closed
  same-session** (#229 model facts · #230 runtime×hardware · #231 HubSpot read-only · #240 capture
  tooling), findings as resolution comments, maps' Decisions-so-far updated.
- **MMB-D-013…027** ratified (15 vault decision rows): destination/tracker/reach, HubSpot-Pro goal
  #1 + Tim coverage (D-018, MMB-G-004), weight/agent ticket system (D-019) + rule-home law (D-020),
  grill goal-election (D-021) + F fix-lane (D-022), five-pointer load-set (D-023), glossary
  singularity (D-024), OS/manifest disposition (D-025), skill-wiring conform (D-026),
  Desktop/Baseline_Vault routing (D-027, proposed).
- **Doc-canon consolidation:** `UBIQUITOUS_LANGUAGE.md` → `docs/product/mammoth-build/CONTEXT.md`
  (git mv + 8 living refs), new root `CONTEXT-MAP.md`, game-on canon conformed, design-an-interface
  wired to `DESIGN.md`.
- **Skill/persona law:** Petey talk modes + orchestration doctrine + wayfinder pointer;
  goal-election + F-lane preambles in all three grill skills; weight/agent in the wayfinder D10
  preamble; 9 open tickets retro-stamped. **Discovery: `.agents/skills/*` are hardlinks of
  `.claude/skills/*`** — one edit serves both runtimes.
- **MMB_INITIAL_INTAKE rescued** (missing since 0571): landed + triaged in the vault; Michael goal
  G-003 real; fog graduated to ticket [#245](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/245);
  Hermes naming collision + fact discrepancies flagged; Obsidian Bases promoted to #238 as
  schema-vehicle candidate. SOT_Vault located (`~/Desktop/Baseline_Vault`); search false-negative
  logged as **FS-0033**.
- Vault: `MMB_SESSION_0003` (first live run of the session template), `TEMPLATE - TTT Capture`,
  two triaged TTT inbox captures.

## Decisions resolved

MMB-D-013…027 (see Grill outcome + Mid-session additions). No repo ADR: D-rows deliberately
ledgered; the CONTEXT rename is reversible doc structure under existing Pocock law, and the
replacement architecture (ADR-worthy) is exactly what map #228's open grills produce.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0573.md` | This file |
| `docs/product/mammoth-build/CONTEXT.md` | Renamed from `UBIQUITOUS_LANGUAGE.md` (D-024); frontmatter retitled |
| `CONTEXT-MAP.md` | New — bounded-context index (platform · MMB · BBL-lazy) |
| `docs/product/mammoth-build/{PRD,STORIES,BRAND_HEART_BEAT,OPERATING_SYSTEM}.md` | UL→CONTEXT reference updates (+frontmatter bumps) |
| `docs/business/leads/mammoth-build-michael-flores.md` · `docs/knowledge/wiki/{core-values,index}.md` | Reference updates; index gains 0572+0573 session rows |
| `.claude/agents/petey.md` | Talk modes · orchestration doctrine · wayfinder pointer · EEE/TD style law |
| `.claude/skills/{grill-me,grilling,grill-with-docs}/SKILL.md` | Goal-election + F-lane RDD preambles (hardlinked twins covered) |
| `.claude/skills/wayfinder/SKILL.md` | Weight/agent + Wave/Phase preamble (D-019) |
| `.claude/skills/game-on/SKILL.md` | Canon list conformed to D-023 five-pointer set |
| `.claude/skills/design-an-interface/SKILL.md` | DESIGN.md + CONTEXT-MAP preamble (D-026) |
| `docs/protocols/failed-steps-log.md` | FS-0033 — filesystem false-negative entry |
| Vault (not in repo) | MMB_SESSION_0003 · LLL rows Q-012…023/D-013…027/G-003·G-004 · TTT template · 3 inbox captures |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bash scripts/bow-out-gates.sh` | PASS — wiki:lint 0 err / 60 pre-existing warn; format 0 code files; build skipped (docs-only, 15 files docs=15 app=0); secret scan clean |
| Tracker state | Maps #228/#237 wired; #229/#230/#231/#240 closed with resolution comments; #245 created; frontier = 6 full grills + 2 quick |
| Vault secret scan (game-off §7) | run pre-commit — see Full close evidence |
| Graphify | nodes=18746 · edges=35683 · communities=2527 |

## Open decisions / blockers

- **Phone-local vault divergence — RESOLVED for the intake file:** `MMB_INITIAL_INTAKE_RVT.md`
  rescued via chat paste → landed in `Mammoth_Vault/00_Inbox` with TTT frontmatter and
  **triaged same-turn** (first real capture→triage→promote run): Michael goal row G-003 made
  real, G-004 evidence linked, fog graduated to ticket
  [#245](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/245) (predecessor
  transition — access/continuity, neutral wording, candor vault-side), `/grill-01`
  frontmatter-schema requirement commented onto #238, **Hermes naming collision** flagged on
  map #228 ("Hermes" = built email-automation deliverable ≠ Nous Hermes model). Fact
  discrepancies ($1,500 vs $1,700 leads; HubSpot ~$718 vs ≥$418) flagged UNCONFIRMED in the
  intake. The phone's `RONIN_DOJO-Baseline` vault itself remains local-only/diverged —
  vault-level sync stays a D-012 routing decision.
- **SOT_Vault located + search-miss owned (FS candidate):** `~/Desktop/Baseline_Vault` (the ONE
  vault registered in desktop Obsidian) held `MMB_INITIAL_INTAKE.md` since Jul 18 13:45 —
  content-identical to the paste; my earlier "doesn't exist anywhere" was a **false negative
  from a silently-failing find** (Desktop sweep produced no error and no match; asserted a
  negative from it — the exact anti-pattern the discovery memory warns about). Log as FS entry
  at bow-out. Also found `Untitled.base` — operator experimenting with **Obsidian Bases** as
  the frontmatter-DB; promoted to #238 as the schema vehicle candidate. Desktop vault = staging;
  canonical copy = `Mammoth_Vault/00_Inbox` (D-012 routing for the Desktop vault itself = open).

## Next session

### Goal

Work map #228's frontier toward goal #1 (HubSpot Pro replacement): resolve ONE full grill —
[#233 gate-contract template](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/issues/233)
(it unblocks #234 lane inventory, the HubSpot lane's front door).

### First task

`/game-on`, goal election (A — pinned), claim #233, run the MC-grill to ratify the reusable
gated-lane contract (owner · read-only-first scope · approval trigger · stop conditions ·
data-retention · escalation), record the answer as the resolution comment + human-code-runbook
rows, graduate any fog. Alt pick if the operator pivots: #238 taxonomy (unblocks #241/#242 +
the Bases/frontmatter schema). Prep #245's Michael-sync checklist only if the fire-week starts.

## Review log

### SESSION_0573_REVIEW_01 — Epic-charting + doc-canon close review

- **Reviewed tasks:** SESSION_0573_TASK_01…03 + mid-session additions (D-016…027 lanes)
- **Dirstarter docs check:** not applicable (docs + skills + tracker only; no L1 area touched)
- **Verdict:** Very high decision throughput (15 D-rows, 2 maps, 16 tickets, 4 research
  resolutions) with every decision landing in exactly one authority and every read-path
  conformed in the same session. The TTT pipeline proved itself twice on real payloads,
  including rescuing the artifact that had been missing for 2 sessions. Honest weaknesses:
  one false-negative filesystem assertion reached the operator before correction (FS-0033),
  and the session ran far past one coherent lane — operator-driven, but the close has to
  verify 14 distinct threads.
- **Score:** 8.5/10 (cap: breadth of lane; FS-0033)
- **Follow-up:** next session = ONE ticket (#233), one-lane discipline restored.

## Hostile close review

- **Giddy:** pass — authority boundaries held under pressure (candor vault-side vs neutral
  tracker bodies; goals in GOALS, decisions in rows, no ADR minted below the ADR bar; two-glossary
  risk killed via the Pocock-native pattern rather than a bespoke one).
- **Doug:** pass — docs-only diff, gates green, secret scans clean (repo + vault), no runtime
  surface touched; research claims carry sources + UNVERIFIED flags; FS-0033 self-reported with
  corrective recipe applied in-session.
- **Desi:** not applicable — no UI touched.
- **Kaizen aggregate:** 8.5/10 — throughput and traceability excellent; lane sprawl and the
  search false-negative are the deductions.

## ADR / ubiquitous-language check

- ADR update: **not required** — recorded explicitly: D-013…027 are deliberately ledgered
  (MMB-D-006 pattern); the hard-to-reverse replacement-architecture decision is still open on
  map #228 and gets its ADR when ratified. ADR 0048 boundary re-verified (vault candor never
  entered the tracker).
- Ubiquitous language update: **done structurally** — the MMB glossary itself moved to
  `docs/product/mammoth-build/CONTEXT.md` under root `CONTEXT-MAP.md`; no new domain terms
  ratified (Hermes collision flagged for disambiguation on #238/#228, deliberately NOT added
  to the glossary until resolved).

## Reflections

The session's discovery is that the operating system now compounds: the goal-election preamble,
weight/agent routing, and five-pointer load-set were each ratified mid-session and then
immediately consumed by the very next interaction — law → conform → use inside one sitting.
The hardlink find (`.agents` = `.claude` same-inode) explains past "twin already amended"
mysteries and halves future skill-law maintenance.

FS-0033 is the lesson worth keeping: a suppressed-stderr `find` that returns nothing is not
evidence of absence — and the authoritative registry (Obsidian's `obsidian.json`) answered in
one call what three sweeps missed. Registries before raw sweeps.

The TTT pipeline earned its keep before it was even ratified: two real captures triaged
same-turn, and the rescued initial intake surfaced a naming collision ("Hermes" the deliverable
vs Hermes the model) that would have silently corrupted the stack research downstream. Capture
systems pay off at the seams between sessions — exactly where this one was lost.

## Full close evidence

| Step | Proof |
| --- | --- |
| Gate runner | `bash scripts/bow-out-gates.sh` — task-log PASS (6 rows) · format 0 code files · wiki:lint 0 err/60 pre-existing warn · build skipped (docs-only) · secret scan PASS · 15 files touched (all docs) |
| JETTY/frontmatter sweep | 7 touched docs bumped to `updated: 2026-07-19` + `last_agent: claude-session-0573`; skill files carry no JETTY frontmatter by convention |
| Backlinks/index sweep | wiki index: missing 0572 row filled + 0573 row added; CONTEXT-MAP ↔ CONTEXT cross-refs; mammoth pairs_with intact through rename |
| Wiki lint | via gate runner: 0 errors / 60 warnings, all pre-existing |
| Kaizen reflection | Reflections above |
| Hostile close review | SESSION_0573_REVIEW_01 + Giddy/Doug pass |
| Code-quality gate (Class-A) | no Class-A custom code this session (docs/skills/tracker only) |
| Runtime verification (Doug) | no runtime surface touched |
| Review & Recommend | Next session = #233 gate-contract grill (pinned to goal #1 lane) |
| Memory sweep | `mmb-lll-and-game-skills` memory updated (D-013…027, hardlinks, five-pointer law, goal #1) |
| Ledger cross-off | Gate-10 candidates dismissed as false positives: detected `D-0NN`/`G-00N` are vault MMB-LLL row IDs cited in this file, not repo drift-register/goals-ledger rows; no repo ledger rows resolved this session; FS-0033 ADDED (outbound) |
| Deferral guard | run pre-commit — result in bow-out chat line |
| Next session unblock check | unblocked — #233 open, unassigned, unblocked; no operator input required to start |
| Git hygiene | branch=main · single push at close (authorized this session) — hash reported at bow-out |
| Graphify update | nodes=18746 · edges=35683 · communities=2527 (gate runner, pre-commit per FS-0025) |
