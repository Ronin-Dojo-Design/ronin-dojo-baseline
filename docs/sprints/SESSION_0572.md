---
title: "SESSION 0572 — Claude game-on/off port + MMB_SESSION_0002 grill (LLL, CV, BHB, runbook)"
slug: session-0572
type: session--implement
status: closed
created: 2026-07-18
updated: 2026-07-18
last_agent: claude-session-0572
sprint: S0572
pairs_with:

  - docs/sprints/SESSION_0571.md
  - docs/knowledge/wiki/core-values.md
  - docs/runbooks/human-code-runbook.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0572 — Claude game-on/off port + MMB_SESSION_0002 grill (LLL, CV, BHB, runbook)

## Date

2026-07-18

## Operator

Brian + claude-session-0572

## Goal

Port the Codex `game-on`/`game-off` MMB lean-overlay skills to Claude, then run the queued
`MMB_SESSION_0002` lane: grill TASK_01/TASK_04 forks (vault boundary, LLL system, CV values, BHB,
techstack/runbook placement) and build TASK_03 (session template, five recipes, `session_kind`
logs, goals seed) in the Mammoth vault.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0571.md`
- Carryover: 0571 shipped the Codex game-on/off overlays + MMB lean shell/sales tracer (local
  commit `22b9a256`, unpushed). `/game-on` failed in Claude Code (skills only in
  `.agents/skills/`); the 0571 Next-session lane was the MMB_SESSION_0002 grill.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (untracked skill ports created in-session)
- Current HEAD at bow-in: `22b9a256`

### Grill outcome

Nine forks resolved (operator-answered, captured as vault LLL rows `MMB-Q-001…009` →
`MMB-D-001…009` in `MMB_GRILL.md` / `MMB_DECISIONS.md`):

- **D-001 Vault placement:** retain ADR 0048 — live vault stays private/outside; sanitized
  projections + vault-kit in repo. ADR re-ratified.
- **D-002 LLL count:** 5 — DECISIONS · GRILL · GOALS · WIRING · OPS (last two lazy).
- **D-003 Session shape:** one `MMB_SESSION_NNNN.md` (opening → task/evidence → recipe → close).
- **D-004 Todoist:** unnecessary now; MMB_GOALS carries owner/due/Next Action.
- **D-005 Ops vocabulary:** monorepo `UBIQUITOUS_LANGUAGE.md` new "Ops vocabulary" section.
- **D-006 CV ledger:** `docs/knowledge/wiki/core-values.md`; CV-001 EEE + CV-002 TD ratified;
  new/touched docs only.
- **D-007 BHB:** extract per-brand `BRAND_HEART_BEAT.md` — Mammoth (confirmed) + BBL (missing
  rows = Brandon backlog); UL keeps terms, BHB keeps statements.
- **D-008 Techstack home:** `human-code-runbook.md` (CONTEXT.md stays glossary-pure).
- **D-009 human-code-runbook:** `docs/runbooks/human-code-runbook.md`, platform-wide.

Wayfinder ruled session-out (D10 epic-only scope); reserved for the TASK_05/06 epic.

## Petey plan

### Goal

`/game-on`+`/game-off` resolve as Claude skills; MMB_SESSION_0002 TASK_01–04 resolved and built.

### Tasks

#### SESSION_0572_TASK_01 — Port game-on/game-off to `.claude/skills/`

- **Agent:** Cody (inline)
- **What:** Claude ports of the Codex overlays + lean canon pointers + recipe-card step.
- **Done means:** `/game-on`/`/game-off` registered and invoked. ✔

#### SESSION_0572_TASK_02 — Grill MMB_SESSION_0002 TASK_01 + TASK_04 forks

- **Agent:** Petey/Giddy (inline grill, operator-answered MC rows)
- **Done means:** 9 decisions captured in vault LLLs; monorepo docs updated inline. ✔

#### SESSION_0572_TASK_03 — Build MMB_SESSION_0002 TASK_03 vault kit pieces

- **Agent:** Cody (inline)
- **Done means:** one-file session template, 5 recipe templates, MMB_LOGS, MMB_GOALS seed,
  Command Center pointer block. ✔

### Open decisions

None — nine forks closed by operator answers; TASK_05/06 deferred to a fresh session.

### Scope guard

No push; no integration connects; no live-vault CRM data; TASK_05/06 research untouched.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0572_TASK_01 | landed | Claude `game-on`/`game-off` ported + registered; game-on/off invoked this session |
| SESSION_0572_TASK_02 | landed | 9-fork grill → MMB-D-001…009; ADR 0048 re-ratified; CV/BHB/UL/runbook written inline |
| SESSION_0572_TASK_03 | landed | Vault: session template + 5 recipes + MMB_LOGS + MMB_GOALS + Command Center rewire |

## What landed

- `.claude/skills/game-on/` + `.claude/skills/game-off/` — Claude ports (lean canon pointers,
  `session_kind` routing, recipe-card steps).
- `docs/knowledge/wiki/core-values.md` — CV ledger (CV-001 EEE, CV-002 TD) + index row.
- `docs/product/mammoth-build/BRAND_HEART_BEAT.md` + `docs/product/black-belt-legacy/BRAND_HEART_BEAT.md`
  — per-brand BHB pattern proven with two brands; UL Brand-language de-duplicated to pointers.
- `docs/product/mammoth-build/UBIQUITOUS_LANGUAGE.md` — new "Ops vocabulary" section (LLL,
  grill row, session_kind, recipe card, CV, BHB).
- `docs/runbooks/human-code-runbook.md` — human/agent boundary law + techstack home; hub row.
- ADR 0048 re-ratified (SESSION_0572 note → MMB-D-001).
- Vault (outside repo): `MMB_DECISIONS` / `MMB_GRILL` / `MMB_GOALS` / `MMB_LOGS` LLLs,
  `TEMPLATE - MMB Session` + 5 recipe templates, Command Center pointer block,
  MMB_SESSION_0002 task ledger closed for TASK_01–04.

## Decisions resolved

MMB-D-001…009 (see Grill outcome). CV-001/CV-002 ratified. BHB per-brand pattern ratified.

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/game-on/SKILL.md` | New — Claude MMB lean opening overlay |
| `.claude/skills/game-off/SKILL.md` | New — Claude MMB lean closing overlay |
| `docs/knowledge/wiki/core-values.md` | New — CV ledger (CV-001, CV-002) |
| `docs/knowledge/wiki/index.md` | Core Values Ledger row |
| `docs/product/mammoth-build/BRAND_HEART_BEAT.md` | New — Mammoth BHB (statements extracted from UL) |
| `docs/product/black-belt-legacy/BRAND_HEART_BEAT.md` | New — BBL BHB (confirmed + missing rows) |
| `docs/product/mammoth-build/UBIQUITOUS_LANGUAGE.md` | Brand statements → BHB pointer; Ops vocabulary section |
| `docs/runbooks/human-code-runbook.md` | New — human/agent boundary + techstack (MMB-D-008) |
| `docs/runbooks/README.md` | human-code-runbook hub row |
| `docs/architecture/decisions/0048-…-projections.md` | Re-ratified note (SESSION_0572, MMB-D-001) |
| `docs/sprints/SESSION_0572.md` | This file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bash scripts/bow-out-gates.sh` | PASS — wiki:lint 0 err / 60 warn (pre-existing); format 0 code files; build skipped (docs-only); fallow delta 0 |
| Skill registration | `/game-on` + `/game-off` registered; both invoked in-session |
| Graphify | nodes=18733 · edges=35661 · communities=2541 |

## Open decisions / blockers

- BBL BHB `missing` rows (Heartbeat/Motto/Mantra/Voice) — Brandon lane backlog.
- HubSpot rotation still calm/owner-mediated; `MMB_INITIAL_INTAKE` still missing (unchanged).
- Codex↔Claude game-on/off skill bodies intentionally diverge (Claude adds canon pointers +
  recipe step); say the word if byte-parity is wanted.

## Next session

### Goal

Chart the local-agent feasibility lab + HubSpot-replacement roadmap (MMB_SESSION_0002 TASK_05 +
TASK_06) as a wayfinder map — fresh session, epic scope.

### First task

`/game-on`, then run wayfinder "Chart the map": destination = ratified local-first agent stack +
gated integration lanes (read-only-first contracts, owners, approvals, stop conditions). Research
tickets for exact model candidates (confirm names/licenses: Hermes, Kimi, DeepSeek, etc.) before
any benchmark claims; no live integrations.

## Review log

### SESSION_0572_REVIEW_01 — Docs/skills close review

- **Reviewed tasks:** SESSION_0572_TASK_01…03
- **Dirstarter docs check:** not applicable (docs + skills only)
- **Verdict:** Lean and internally consistent: every grill answer landed in exactly one
  authority (vault LLL row ↔ monorepo canonical doc), UL de-duplication removed a real
  two-authority risk (brand statements), and the skill ports are faithful with declared,
  operator-visible divergences. Weakness: Michael-scan/Brian-pickup usability tests of the new
  templates are asserted by construction, not by a real session — first live MMB session on the
  new template is the true test.
- **Score:** 8.5/10
- **Follow-up:** run the next MMB session on `TEMPLATE - MMB Session` and score the friction.

## Hostile close review

- **Giddy:** pass — authority boundaries hold (ADR 0048 respected; statements single-homed;
  CONTEXT.md kept glossary-pure per Pocock law against operator's initial instinct, ratified D-008).
- **Doug:** pass — docs-only diff; gates green; no app code, no e2e surface; vault writes are
  projections, not CRM/goal authorities.
- **Desi:** not applicable — no UI touched.
- **Kaizen aggregate:** 8.5/10 — high decision throughput per token; template usability unproven
  until first live use.

## ADR / ubiquitous-language check

- ADR update: **done** — ADR 0048 re-ratified in place (no new ADR: decision unchanged).
  CV-001/CV-002 deliberately ledgered (CV rows), not ADR'd, per MMB-D-006.
- Ubiquitous language update: **done** — Ops vocabulary section + BHB extraction in
  `UBIQUITOUS_LANGUAGE.md`.

## Reflections

The MC-grill format (options + recommendation, one-letter answers) was the session's discovery:
nine durable decisions cost the operator nine short replies, and every answer landed as a
same-turn LLL row plus an inline canonical-doc edit — no batch capture debt at close. Worth
folding into the monorepo grill skills as a first-class mode.

The near-miss was doc authority: the operator's "techstack in CONTEXT.md" instinct collided with
the repo's own CONTEXT-is-a-glossary law, and the UL Brand-language table was one BHB extraction
away from becoming a second authority. Both were caught because the grill checked each placement
against an existing rule before writing — the "ratify the law then conform" mantra doing real work.

Token discipline held: pointers-not-bodies at bow-in, no ledger scan on a pinned lane, and the
close ran while comfortably under the dumb zone. The recipe card + `session_kind` log loop got its
first real exercise and produced a reusable trail (MMB_LOGS rows) at negligible cost.

## Full close evidence

| Step | Proof |
| --- | --- |
| Gate runner | `bash scripts/bow-out-gates.sh` — all deterministic gates PASS (see Verification) |
| JETTY/frontmatter sweep | touched docs bumped to `updated: 2026-07-18` + `last_agent: claude-session-0572` |
| Backlinks/index sweep | core-values row in wiki index; runbook row in runbooks hub; BHBs cross-paired |
| Wiki lint | 0 errors / 60 pre-existing warnings |
| Kaizen reflection | Reflections above |
| Hostile close review | SESSION_0572_REVIEW_01 + Giddy/Doug pass |
| Review & Recommend | Next session = TASK_05/06 wayfinder epic |
| Memory sweep | `mmb-lll-and-game-skills` memory written |
| Next session unblock check | wayfinder skill present; MMB_SESSION_0002 TASK_05/06 self-contained |
| Git hygiene | local commit on `main` (see below); push held for operator authorization |
| Graphify update | nodes=18733 · edges=35661 · communities=2541 |
