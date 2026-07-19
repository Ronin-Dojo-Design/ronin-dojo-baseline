---
title: "SESSION 0578 — Petey plan: technique graph out of beta (GA gap list + 3-lane fan-out + recipe template)"
slug: session-0578
type: session--plan
status: in-progress
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0578
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0569.md
  - docs/sprints/SESSION_0546.md
  - docs/epics/technique-graph-curriculum-port.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0578 — Petey plan: technique graph out of beta (GA gap list + 3-lane fan-out + recipe template)

## Date

2026-07-19

## Operator

Brian + claude-session-0578

## Goal

PLAN-FIRST lane (no feature build). Establish what "out of beta" requires for the technique graph on
two axes — (a) design/GA-interaction, drawing on the 0546 Desi spec + the G-013 Wave 2 batch landed
at 0569, and (b) backend schema wiring for real curriculum at scale (entities, prerequisites,
belt/rank gating, per-member progress, media linkage) — plus a READ-ONLY harvest inventory of the
old monorepo's curriculum data. Then decompose into three genuinely disjoint parallel sessions with
a disjointness proof, write three paste-ready gotcha-encoded prompts, and commit a reusable fan-out
session recipe template to docs. Open G-022 on the goals-ledger. Grill before finalizing.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0569.md` (technique-graph lane; closed full, push-gate
  held then released — Wave 2 first batch on `origin/main` at `37718d13` lineage). Its Next-session
  block names C4 zoom/fit easing + WL-P2-67 ZOOM_MIN + D-4 cooperative touch as one slice, with
  WL-P2-66 and WL-P2-65 as strong first picks — those become fan-out lane inputs here, not builds.
- Operator directive pins THIS session: PLAN-FIRST — GA gap list, monorepo harvest inventory,
  3-lane fan-out plan + prompts, recipe template. F1 Lenis stays REJECTED (motion-only) — not
  re-opened.
- Session number: FS-0030 ID-space check run (sprints dir committed max = 0573; canonical holds
  untracked live 0575/0576; operator names 0574/0577 as live siblings) → took **0578**, above the
  live block.
- Sibling coordination flags: **SESSION_0575 is a ledger-hygiene lane** (FS-0030 mechanization +
  open-WL sweep + `scripts/ledger-id-next.ts`) — this session's ledger edits are **additive-only**
  (new G-022 row; no row rewrites) and flagged for merge-time coordination. 0576 is vault-only
  (no repo overlap). 0574/0577 own `docs/product/mammoth-build/*` territory per 0575's note.

### Branch and worktree

- Branch: `session-0578-technique-ga-plan`
- Worktree: `/Users/brianscott/dev/ronin-0578` (bootstrapped via `/worktree-setup`: canonical `.env`
  copied, `bun install` 756 packages, Prisma client generated)
- Status at bow-in: clean
- Current HEAD at bow-in: `37718d13` (= `origin/main`)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None this session (plan/docs-only); the planned lanes touch Content (techniques), Media, Monetization, Prisma |
| Extension or replacement | Extension: lanes extend the shipped technique/curriculum seams (ADR 0046 axes, no-leak gate) |
| Why justified | Plan-first session; build lanes will each run their own Dirstarter alignment at their bow-ins |
| Risk if bypassed | Fan-out prompts could silently authorize new parallel primitives — prompts pin reuse-first + non-goals instead |

Live docs checked during planning: not applicable (docs/plan-only).

### Graphify check

- Graph status: worktree reads 0 nodes by design (graph lives in the canonical checkout — not a
  negative signal). Canonical graph used read-only for discovery.
- Queries used: discovery delegated to two read-only Explore scouts (repo technique-surface survey
  with graphify-first instruction; monorepo harvest survey), per the fan-out-for-disjoint-reads rule.
- Verification note: every scout claim to be verified against exact files before it enters the plan;
  graph/scout output used as navigation, not proof.

### Grill outcome

Operator grill (/grill-me via structured questions, 2026-07-19) — 4 forks resolved, plus one
mid-turn directive folded in:

- **Q1 Desi/hallmark + build-now:** "Audit now, build in lanes" — Desi runs the hallmark AUDIT
  this session (audit-only per the D11 amendment; redesign/builds stay banned); every accepted
  item becomes a ledgered task (>3 required) distributed into the lane prompts; the PLAN-FIRST
  pin holds — no Cody build this session.
- **Q2 GA design bar:** "Everything incl. Wave 3" — the flip waits for Wave 2 remainder
  (C4/C5/D3/B2) AND Wave 3 (E1/B3/C3/G2), plus WL-P2-65/66/67 + D-4 + entry wiring. Lane A is
  explicitly a multi-session lane with ledgered continuation. E2 Combo Flows stays post-GA
  (sequenced after E1; flagged for operator veto).
- **Q3 Graph content scope (custom answer):** **"BJJ and judo and wrestling takedowns grappling
  arts only no striking or weapons"** — product-scope amendment: the technique system covers
  grappling arts (BJJ + judo + wrestling takedowns), never striking (boxing/muay thai/kajukenbo)
  or weapons (eskrima). Flips judo harvest verdicts to ADAPT (data included); wrestling has NO
  dataset in the monorepo → named content-gap/authoring task. Supersedes the epic's BJJ-only
  line for this system; ADR check owed at the first build lane's close.
- **Q4 Progress lane:** **flip-blocking** — GA waits for member technique tracking
  (TechniqueProgress writes + UI). Merge order strictly C → B → A.
- **Mid-turn directive:** harvest adoption stands "in addition" to new scope — bjj.js trunk +
  bjjCanvasData lineage adopted; grappling additions layer on top.

## Petey plan

### Goal

Deliver the ratified GA gap list (design + schema), the monorepo harvest inventory with verdicts,
three disjoint lane definitions with proofs + paste-ready prompts, a committed fan-out recipe
template, and G-022 on the goals-ledger — commit locally, HOLD at the push gate.

### Tasks

#### SESSION_0578_TASK_01 — Current-state recon (beta convention + graph surface + schema)

- **Agent:** Explore scout (read-only) + Petey verification
- **What:** Map feature-log.ts beta convention, /app/beta gating, technique-graph files, Prisma
  technique models (prerequisites, rank gating, media, progress), server layer + no-leak gate, and
  the graph's current data source.
- **Done means:** verified file-level map usable for the disjointness proof.
- **Depends on:** nothing

#### SESSION_0578_TASK_02 — Monorepo harvest inventory (READ-ONLY)

- **Agent:** Explore scout (read-only) + Petey verification
- **What:** Inventory BBLApp BJJ curriculum JSON, TuffBuffs judo/BJJ JSON, member/progress schemas,
  generator scripts — path, shape, record count, quality, BJJ-only flag, provenance, verdict.
- **Done means:** SALVAGE/ADAPT/REJECT table delivered; nothing copied into this repo.
- **Depends on:** nothing

#### SESSION_0578_TASK_03 — Out-of-beta gap list (design axis + schema axis)

- **Agent:** Petey (inline)
- **What:** Synthesize the GA bar from the 0546 Desi waves (open: C4/C5/D3/B2 + Wave 3) + open WL
  rows (WL-P2-65/66/67, WL-P3-53/54) + schema gaps surfaced by TASK_01/02.
- **Done means:** two-axis gap list in this file + chat, ratified at the grill.
- **Depends on:** TASK_01, TASK_02

#### SESSION_0578_TASK_04 — Grill (/grill-me) on scope forks

- **Agent:** Petey ↔ operator
- **What:** Resolve: what "out of beta" includes (design-only vs design+schema+data), which
  harvested data is adopted, lane boundaries, merge order.
- **Done means:** forks recorded under Grill outcome; plan locked.
- **Depends on:** TASK_03

#### SESSION_0578_TASK_05 — Three disjoint lanes + proofs + paste-ready prompts

- **Agent:** Petey (inline)
- **What:** Three lane definitions with owned-file sets (empty intersection shown), merge order,
  and three self-contained gotcha-encoded prompts for fresh Fable 5 sessions.
- **Done means:** prompts delivered verbatim-pasteable in chat + stored in this SESSION file.
- **Depends on:** TASK_04

#### SESSION_0578_TASK_06 — Fan-out session recipe template (docs commit)

- **Agent:** Petey (inline)
- **What:** Reusable fill-in-the-blanks template committed to docs/protocols/, cross-checked against
  agent-systems-map §5b + loop-of-loops so it extends the house style.
- **Done means:** template file committed; agent-systems-map cross-reference added (additive).
- **Depends on:** TASK_04

#### SESSION_0578_TASK_07 — G-022 goals-ledger entry + finding routing + full close

- **Agent:** Petey (inline)
- **What:** Add G-022 "Technique graph out of beta" (design axis, schema-wiring axis,
  monorepo-harvest axis as tracked children; additive-only edit). Route findings per closing.md
  §6.7. Full bow-out; HOLD at push gate.
- **Done means:** ledger row added; session closed clean; NOTHING pushed.
- **Depends on:** TASK_05, TASK_06

### Parallelism

TASK_01 ∥ TASK_02 (two read-only scouts, disjoint trees). TASK_03 → TASK_04 → (TASK_05 ∥ TASK_06)
→ TASK_07 sequential.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0578_TASK_01 | Explore | read-only fan-out search; conclusion-only |
| SESSION_0578_TASK_02 | Explore | read-only survey of a foreign tree |
| SESSION_0578_TASK_03–07 | Petey | planning/synthesis lane; no build |

### Open decisions

- Out-of-beta scope: design-polish-only vs design + schema + real-data adoption (grill).
- Which harvested datasets are adopted (grill, post-inventory).
- Lane boundaries + merge order sign-off (grill).

### Risks

- Sibling 0575 edits the same ledger files (additive-only discipline + merge flag mitigates).
- Scout claims entering the plan unverified (Petey verifies exact files first).
- Prompt drift: paste-ready prompts must carry the gotcha block verbatim or the child sessions
  re-incur known failures.

### Scope guard

- NO feature build, NO schema migration, NO writes to `../ronin-dojo-monorepo`, NO push/PR/deploy
  without the operator's explicit word. FI-001 PARKED. F1 Lenis stays REJECTED — not re-opened.
- Ledger edits additive-only (0575 coordination).
- No new beta convention — reuse `FeatureStatus: "beta"` + /app/beta as-is in the plan.

### Dirstarter implementation template

- **Docs read first:** SESSION_0569 (close + Next-session), SESSION_0546 (Desi waves + forks),
  goals-ledger G-013, wiring-ledger WL-P2-63/49/52/64/65/66/67 + WL-P3-53/54,
  technique-graph-curriculum-port epic, agent-systems-map §1/§4/§5b, loop-of-loops protocol
- **Baseline pattern to extend:** §5b epic-lane recipe + loop-of-loops ledger-driven bundling
- **Custom delta:** parallel-session fan-out recipe (disjointness proof + paste-ready prompt shape)
- **No-bypass proof:** template extends the ratified recipe canon; no parallel process invented

## Cody pre-flight

Not applicable — plan/docs-only session; no Cody coding task. The three child lanes each run their
own pre-flight at their bow-ins (encoded in their prompts).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0578_TASK_01 | landed | Survey delivered + Petey-verified (feature-log.ts:94 beta entry; graph PUBLIC at `/techniques/graph` with Badge+Note only — NOT mounted in gated `/app/beta`; JSON layout 61 nodes/75 edges vs ~47 DB-rendered; `TechniqueProgress` model exists with ZERO write paths; no technique oRPC router; no-leak gate type-encoded in `technique-media-gate.ts`). |
| SESSION_0578_TASK_02 | landed | Harvest inventory delivered + counts Petey-verified read-only (bjj.js 98 techniques; bjjCanvasData.js 61 nodes/75 edges = ancestor of the app's bbl-bjj-graph.json 61/75; Kodokan judo seed = schema exemplar, data REJECT for BBL; tb_member/bbl_member/gamification pods = progress-schema references; generators + canvas adapter SALVAGE/ADAPT; PII exports REJECT). Nothing copied. |
| SESSION_0578_TASK_03 | landed | Two-axis gap list delivered (design: Wave 2 remainder + Wave 3 + WL rows + entry wiring; schema: wiring-not-schema — TechniqueProgress write path, ~14 dark graph slugs, hybrid JSON/DB source mapped). |
| SESSION_0578_TASK_04 | landed | 4 forks resolved — see Grill outcome (audit-now/build-in-lanes; GA bar incl. Wave 3; grappling-arts scope amendment; progress flip-blocking). |
| SESSION_0578_TASK_05 | landed | Three lanes defined with owned-file sets + empty pairwise-intersection proof (`docs/epics/technique-graph-ga-fanout.md`); merge order C→B→A; three paste-ready prompts delivered in the close report. |
| SESSION_0578_TASK_06 | landed | `docs/protocols/fan-out-session-recipe.md` committed (extends agent-systems-map §5b cross-session + loop-of-loops bundling; §6 ledgered lane-continuation per operator directive); cross-referenced from the map. |
| SESSION_0578_TASK_07 | landed | G-022 added to goals-ledger (additive-only; 0575 merge-coordination flagged; WL-row creation deferred to lane closes to avoid ID collision with 0575's mechanization). |
| SESSION_0578_TASK_08 | landed | Desi hallmark AUDIT (audit-only per D11): 12 items — 4 P1 (AUD2-1..4) · 4 P2 · 4 P3, routed A/B/C/CONTINUATION; conforms-list recorded; multi-art verdict "not ready as-is — foundation holds if art = spatial+filter-axis, never a third color channel". Desi CORRECTED the bow-in claim: Library index + Curriculum page DO link the graph (verified `techniques-index/index.tsx:58`, `curriculum/page.tsx:40`) — GA gap is affordance/naming (AUD2-4), not link existence. |

## What landed

- **G-022 opened** on the goals-ledger — "Technique graph out of beta" with the three lanes as
  tracked children (design / schema-wiring / monorepo-harvest axes) + ratified GA bar + the
  grappling-arts scope amendment.
- **Two-axis out-of-beta gap list** (design: Wave 2 remainder + Wave 3 + WL-P2-65/66/67 + D-4 +
  AUD2 flip surface; schema: wiring-not-schema — `TechniqueProgress` write path, ~14 dark graph
  slugs, hybrid JSON/DB source mapped).
- **Monorepo harvest inventory** with verdicts (bjj.js 98-trunk SALVAGE; bjjCanvasData 61/75 =
  verified ancestor of the app JSON; judo data ADAPT under the new grappling scope; wrestling =
  named content gap, NO dataset exists; striking/weapons/PII REJECT). Nothing copied.
- **`docs/epics/technique-graph-ga-fanout.md`** — lane definitions, owned-file sets, empty
  pairwise-intersection proof, merge order C→B→A, AUD2 punch-list routing table.
- **`docs/protocols/fan-out-session-recipe.md`** — reusable fan-out template (prompt skeleton,
  disjointness proof, shared-by-rule files, merge order, §6 ledgered lane continuation);
  read-path wired from agent-systems-map cross-references.
- **Desi hallmark audit** (SESSION_0578, audit-only per D11): AUD2-1..12 + conforms-list +
  multi-art readiness verdict; >3 tasks wired to the ledger as G-022 children.
- **Three paste-ready lane prompts** (0579 data / 0580 progress / 0581 design+flip) delivered in
  the close report.

## Decisions resolved

- Grill outcome (4 forks) — see Bow-in §Grill outcome: audit-now/build-in-lanes; GA bar incl.
  Wave 3; **grappling-arts scope amendment (BJJ+judo+wrestling takedowns, no striking/weapons)**;
  progress flip-blocking; merge order strictly C→B→A.
- AUD2-5 (progress display channel) + AUD2-6 (multi-art identity model) = named pre-build
  decision gates encoded in the lane prompts — Cody builds nothing against them until grilled at
  lane bow-in.
- WL-row creation deferred to lane closes (0575 ID-mechanization collision avoidance); audit
  findings tracked as G-022 children meanwhile.
- Bow-in "nothing links to the graph" claim corrected by the Desi audit (links exist; gap =
  affordance/naming).

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0578.md` | Session record (this file, new). |
| `docs/knowledge/wiki/goals-ledger.md` | G-022 appended (additive-only; 0575 flag). |
| `docs/epics/technique-graph-ga-fanout.md` | New — lane definitions, disjointness proof, AUD2 routing. |
| `docs/protocols/fan-out-session-recipe.md` | New — reusable fan-out session recipe template. |
| `docs/knowledge/wiki/agent-systems-map.md` | One cross-reference line to the new recipe (additive). |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` (worktree) | PASS — 0 errors / 55 warnings (all pre-existing classes; none in new files). |
| Scout claims spot-checked | PASS — feature-log.ts:94 · graph page Badge/Note · TechniqueProgress zero writes · bjj.js=98 · app JSON 61/75 · entry links exist (Desi correction verified by grep). |
| Monorepo write-guard | PASS — read-only survey; zero writes/copies from `../ronin-dojo-monorepo`. |
| Push gate | HELD — commits local only; no push/PR/deploy. |

## Open decisions / blockers

- **Push gate:** docs-only diff (no prod deploy — `ignoreCommand` skips build); awaiting the
  operator's explicit go.
- **E2 Combo Flows**: left post-GA (sequenced after E1) — operator may veto into the GA bar.
- **Wrestling takedowns**: no source dataset — authoring task tracked under G-022 Lane C; not a
  lane blocker.
- AUD2-5 / AUD2-6 decision gates resolve at lane bow-ins (encoded in prompts).
- Sibling 0575 merge coordination: ledger edits here are additive-only; re-check at merge.

## Next session

### Goal

Launch the G-022 fan-out: paste the three lane prompts (0579 data → 0580 progress → 0581
design+flip) into fresh sessions; lanes run in parallel and merge C→B→A.

### First task

Paste the Lane C prompt (SESSION_0579, `session-0579-grappling-data`) — it lands first and
feeds Lane A's layout expansion. Each lane re-runs the FS-0030 ID-space check at its bow-in.

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
