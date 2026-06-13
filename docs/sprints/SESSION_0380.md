---
title: "SESSION 0380 — Lineage View A engine path: lock + build 0379-1"
slug: session-0380
type: session--plan
status: closed
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0380
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0379.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0380 — Lineage View A engine path: lock + build 0379-1

## Date

2026-06-13

## Operator

Brian + claude-session-0380

## Goal

Fresh chat, fresh eyes. Grill the SESSION_0379 candidate-A plan (fork `donatso/family-chart` for a
focal View A explorer) against the real lineage code, the lineage-hub data model, and the Dirstarter
listing boilerplate; lock the engine path among the three options in runbook §0b; then begin the chosen
build (petey-plan-0379 slice 0379-1 — vendor the fork + IoC review). Mutual understanding **before** any
implementation, per operator directive.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0379.md`
- Carryover: SESSION_0379 was a planning/decision pivot — dropped the "build a tidy-tree engine from
  scratch" plan, committed **candidate-A** (fork donatso/family-chart, View A focal explorer) as the
  front-runner, captured **candidate-B** (ChatGPT/Balkan visual-parity spike) verbatim, and deferred the
  final engine-path decision to a fresh chat. This session is that fresh chat.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `043d04d`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (lineage is a Ronin-native surface; not a Dirstarter L1 area). The Dirstarter `Tool`/listing substrate is the *funnel* lineage feeds (claim/verify/lead), reviewed as a grill lens — see `baseline-listings-runbook.md`. |
| Extension or replacement | Extension: View A is additive — vendors a third-party MIT engine into a Ronin-owned module; reuses the existing materialized public payload + privacy guards. No Dirstarter capability replaced. |
| Why justified | Lineage genealogy visualization has no Dirstarter primitive; the listing engine governs monetization/claim, not tree rendering. |
| Risk if bypassed | None — claim/verify/lead still route through the existing listing + lineage-claim stacks; View A is read-only display. |

Live docs checked during planning: not applicable (local SoT — runbook §0/§0a + lineage-hub).

### Graphify check

- Skipped per ritual (focused single-area lane with a known file map). Grounded directly via the
  lineage-hub file map + targeted greps against the real code (recorded under Grill outcome). Graph last
  refreshed SESSION_0378 (~11,865 nodes).

### Grill outcome

<!-- Filled live as the grill resolves each fork. -->

Grounding pass before grilling (verifying load-bearing runbook/plan claims against the real code):

- ✅ **`bucketByDepth` is dead** — referenced only in `tree-layout.ts` (def) + `tree-layout.test.ts`.
  No production caller. (Confirms 0379 finding.)
- ✅ **`donatso/family-chart` not yet vendored**; `d3` is **not** in `apps/web/package.json` deps.
  0379-1 starts clean.
- ✅ **`lineage-tree.tsx` exists but is orphaned** (1.6KB, May 20, zero importers). The live renderer is
  `lineage-tree-canvas.tsx` (53KB) = View B.
- ⚠ **Finding (sharpens 0379-4 + petey-plan §6 of runbook):** the public payload **already carries the
  multi-parent secondary edges** — `payloads.ts` materializes `relationshipsTo`/`relationshipsFrom`
  (`LineageRelationshipRow[]`), and `queries.ts` builds an `edgeMap` from them. Runbook §4 assumed
  "the data is there but we add it to the public payload"; in fact the *edges are already in the payload*.
  Secondary-overlay (slink/clink) has a real client-side data source **today** — server scope shrinks.
- ⚠ **Finding (one cherry-pick is already built):** candidate-B's "trust-status visual vocabulary" exists
  as `lib/lineage/trust-status.ts` — `resolveLineageTrustStatus()` → `disputed | verified | claimed |
  claim-pending | imported | unverified` (richer than B's 4-state enum). The adapter should **reuse** it,
  not invent a new enum.

**Grill Q1 — engine path (RESOLVED → Hybrid lean):**

- Operator correction (supersedes my grounding "runtime-dep" finding): candidate-B is **not Balkan code
  and involves no Balkan license/purchase**. The types/DTO/semantics (`pid/ppid/stpid/slinks/clinks`,
  trust + grouped-cohort vocabulary) are **original work** Brian + ChatGPT authored, using Balkan's
  *naming* only as a design language. The `bun add balkan-orgchart-js-community` line in candidate-B
  File 4 is aspirational/mislabeled — we will **not** add the Balkan package. So candidate-B's value =
  its **design**, to be rendered by an engine **we own**.
- Direction: **Hybrid** (operator lean) — adopt candidate-B's design language + the two complementary
  views, render via owned engine(s). Exact shape being sharpened in Q2.

**Grill Q2 — hybrid shape (RESOLVED → two engines):** Operator chose **two distinct owned engines**:
View A = new focal explorer (donatso fork); View B = the overview, our own engine (not donatso-powers-both).

**Grill Q3 — what "own B engine" means (RESOLVED → extend the canvas):**

- Grounding finding that reframed it: **grouped cohorts already exist in View B.** `LineageVisualGroup`
  model (`groupType`/`showPublicLabel`/`promotionEvent` link) + `canvas-model.ts` `ChildGroup` bucketing
  by `visualGroupId` + the board island already render them through `LineageTreeCanvas`. Candidate-B's
  "grouped student cohort / `stpid`" maps **directly onto already-built schema + read-model**.
- So View B's "own engine" = **extend the existing `LineageTreeCanvas`** (keeps grouping + dnd editor +
  privacy guards), adding only what's genuinely missing vs candidate-B: **partner/assistant placement** +
  the **slink/clink secondary-link overlay** (also runbook §3 priority #2). **No** from-scratch layout
  math, **no** second vendored engine, **no** discarding the working 53KB canvas. Two genuinely distinct
  owned engines: donatso genealogy (A) + the canvas org-chart (B).

**Grill Q4 — shared DTO + View B mechanics (RESOLVED):**

- **Shared DTO: YES.** One engine-agnostic model `LineageVisualNode[] + LineageSecondaryLink[]` (role,
  trust via existing `resolveLineageTrustStatus`, group, partner/assistant, secondary links) derived once
  from the materialized public payload. donatso (A) projects it → `Datum[]`; the v2 canvas (B) reads it
  for the new partner/assistant + secondary overlay. This cycle does **not** re-platform the existing
  `canvas-model` onto it.
- **View B mechanics — operator refinement (important):** leave the existing tree **completely alone**.
  Do **not** edit `lineage-tree-canvas.tsx`. Instead **copy** it to
  `apps/web/components/web/lineage/lineage-tree-canvas-v2.tsx` and build View B's additions on the copy.
  If View B work goes sideways, the original is a perfectly intact fallback. (Accepted trade-off: two
  canvas files diverge — tracked debt, justified by the zero-risk mandate.)

### Locked architecture (post-grill)

- **View A** = NEW focal genealogy explorer on a vendored **donatso/family-chart** fork (MIT, owned).
- **View B (v2)** = a **copy** of `lineage-tree-canvas.tsx` → `lineage-tree-canvas-v2.tsx`, extended with
  partner/assistant + slink/clink secondary overlay. Original canvas untouched.
- **Shared DTO** = `LineageVisualNode[] + LineageSecondaryLink[]` from the materialized payload (reuses
  `resolveLineageTrustStatus`); donatso projects → `Datum[]`; v2 canvas reads new surfaces from it.
- No Balkan package; candidate-B contributes its **design**, not code/license.

**Grill Q5 — engine count (RESOLVED → one DTO, two engines):**

- Operator floated collapsing to a single engine. Push-back accepted: "one source of visual truth" is
  delivered by the **shared DTO**, not by one layout engine; focal genealogy (donatso's sweet spot) and
  whole-tree org-chart-with-cohorts+dnd-editor (the canvas's job) are **different layout problems**.
  Forcing donatso to be the overview engine = rebuilding cohort grouping + dnd editor + privacy that the
  canvas already has, on a tool fighting its shape.
- **Decision:** one shared DTO, **two layout engines** — donatso (focal A) + existing canvas (overview B,
  left completely alone). Collapsing to one engine is a **later evidence-based gate**, informed by the
  0379-1 smoke-test (whole bjj tree rendered in donatso, `main_id`=root) + how View A feels. The DTO keeps
  that door open cheaply.
- **Consequence for this session:** the View B v2-copy is **not** done now — the canvas isn't touched at
  all this cycle. The earlier Q4 "copy to `lineage-tree-canvas-v2.tsx`" rule still governs **when View B
  work actually begins** (a later slice), per the operator's zero-risk mandate.

### Mutual understanding — verified facts grounding the build

- donatso/family-chart (web-verified, read-only): **MIT** (repo); ⚠ `package.json` license field is the
  non-SPDX `"SEE LICENSE IN LICENSE.txt"` → must read `LICENSE.txt` to confirm MIT before commit. TS
  (82.7%), real `src/`, only runtime dep `d3 ^7.9.0`, **no install/postinstall/prepare scripts**,
  `sideEffects:false`. Vendoring the TS `src/` (compiled by our Next build, not theirs) is low-risk.

### Drift logged

<!-- TBD during grill. -->

## Petey plan

### Goal

Lock the lineage View A engine path via grill, ratify it in an ADR, and re-point the build plan + runbook
to the locked shape. No code (operator-chosen scope: ADR + plan only).

### Tasks

#### SESSION_0380_TASK_01 — Grill candidate-A vs hybrid; lock the path

- **Agent:** Petey
- **What:** Fresh-chat grill of candidate-A against the real code + lineage-hub + Dirstarter listing lens;
  resolve the engine path (5 forks) to mutual understanding.
- **Done means:** path locked — one shared DTO, two engines (donatso focal A + existing canvas overview B,
  untouched); operator-confirmed at each fork.
- **Depends on:** nothing.

#### SESSION_0380_TASK_02 — Engine ADR

- **Agent:** Cody (docs)
- **What:** Write `docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md` ratifying the
  decision + alternatives + grounding consequences.
- **Done means:** ADR 0026 created, status accepted, alternatives recorded.
- **Depends on:** TASK_01.

#### SESSION_0380_TASK_03 — Re-point plan + runbook to the locked shape

- **Agent:** Cody (docs)
- **What:** Rewrite `petey-plan-0379` to two-engine/shared-DTO (slices 0379-2 → two-step DTO, 0379-4 +
  grounding note, new 0379-B1 View B track, decisions 7–9); stamp runbook §0/§0b LOCKED + ADR link.
- **Done means:** plan + runbook reflect the lock; no stale "deferred to fresh chat" / "candidate-A
  baseline" language; cross-refs to ADR 0026 added.
- **Depends on:** TASK_02.

### Parallelism

Sequential — TASK_02 records what TASK_01 locked; TASK_03 points the docs at TASK_02's ADR. One coherent
docs change, built inline (no subagents — they would re-derive this grill context cold).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0380_TASK_01 | Petey | Decision-lock grill; operator sign-off per fork. |
| SESSION_0380_TASK_02 | Cody (docs) | New ADR. |
| SESSION_0380_TASK_03 | Cody (docs) | Plan + runbook re-point. |

### Open decisions

- None at close. The engine path is locked (ADR 0026). The **one-engine-vs-two** question is intentionally
  open as a later **evidence-based gate** (decision 9), not a blocker.

### Risks

- The donatso vendor (next session) must pass IoC + LICENSE.txt review before commit (supply-chain).
- Two canvas files will diverge once View B work begins (accepted, tracked in ADR 0026).

### Scope guard

- No code this session (operator scope = ADR + plan only).
- Do not vendor donatso yet (0379-1 is next session).
- Do not touch `lineage-tree-canvas.tsx`.

### Dirstarter implementation template

- **Docs read first:** baseline-listings-runbook, lineage-hub, lineage-tree-runbook §0/§0a/§0b,
  petey-plan-0379, candidate-B raw, SESSION_0379 (local SoT; no live Dirstarter URL needed).
- **Baseline pattern to extend:** lineage pure libs (`lib/lineage/*`) + the materialized public payload;
  the Dirstarter `Tool`/listing substrate governs claim/verify/lead (the funnel), not tree rendering.
- **Custom delta:** a vendored MIT genealogy engine (donatso) for a focal View A + a shared engine-agnostic
  visual DTO. No Dirstarter L1 capability replaced.
- **No-bypass proof:** additive read-only display; claim/verify/lead still route through the existing
  listing + lineage-claim stacks.

## Cody pre-flight

Not applicable — docs/planning session, no code written. (Vendoring pre-flight runs next session at 0379-1.)

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0380_TASK_01 | landed | Grilled candidate-A → locked: one shared DTO, two engines (donatso View A + existing canvas View B untouched). 5 forks resolved, operator-confirmed. |
| SESSION_0380_TASK_02 | landed | Wrote ADR 0026 (lineage View A engine = vendored donatso fork; one DTO, two engines). |
| SESSION_0380_TASK_03 | landed | Re-pointed petey-plan-0379 + stamped runbook §0/§0b to the locked shape; cross-linked ADR 0026. |

## What landed

- **Engine path LOCKED** (the SESSION_0379 deferred decision): View A = vendored **donatso/family-chart**
  fork; **one shared engine-agnostic DTO, two layout engines** — donatso (focal A) + existing canvas
  (overview B, untouched). Candidate-B = design contribution only; no Balkan package/license.
- **ADR 0026** created and accepted.
- **petey-plan-0379** re-pointed: two-step DTO (0379-2), grounding note on 0379-4, new **0379-B1** View B
  engine track (copy → `lineage-tree-canvas-v2.tsx`), decisions 7–9 (shared DTO / no-Balkan / one-engine
  gate), scope guard hardened.
- **runbook §0/§0b** stamped LOCKED with the two grounding corrections.
- **Two grounding corrections verified in code** (sharpen future slices): secondary multi-parent edges are
  **already materialized** in the public payload; the trust vocabulary **already exists**
  (`trust-status.ts`) and is richer than candidate-B's — reuse, don't reinvent.

## Decisions resolved

- **View A engine = vendored donatso/family-chart fork** (MIT/TS/d3). (ADR 0026 §1)
- **One shared DTO, two layout engines** — donatso focal A + existing canvas overview B (untouched;
  copy-first when extended). (ADR 0026 §2–3)
- **Candidate-B is original code, not Balkan** — adopt its design (two-step DTO + trust/cohort vocabulary),
  no Balkan package or license. (ADR 0026 §5)
- **Mapping** = single-primary-line + secondary-overlay; privacy/brand invariants unchanged. (ADR 0026 §4,§6)
- **Collapsing to one engine is deferred** to a later evidence-based gate (donatso whole-tree smoke + View A
  feel). (ADR 0026 §7)
- **This-session scope** = ADR + plan only; vendor donatso (0379-1) next session.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md` | **New** ADR — ratifies the locked decision + alternatives + grounding consequences. |
| `docs/petey-plan-0379.md` | Re-pointed to two-engine/shared-DTO; LOCKED banner + ADR link; 0379-2 two-step DTO; 0379-4 grounding note; new 0379-B1 View B track; decisions 7–9; scope guard + cross-refs updated; frontmatter restamped. |
| `docs/runbooks/domain-features/lineage-tree-runbook.md` | §0 baseline banner → LOCKED; §0b "deferred" → RESOLVED; frontmatter + ADR cross-ref; grounding corrections noted. |
| `docs/sprints/SESSION_0380.md` | Session ledger + full close. |
| `docs/knowledge/wiki/index.md`, `docs/knowledge/wiki/log.md` | SESSION_0380 row + log entry. |

## Verification

| Command / smoke | Result |
| --- | --- |
| Grounding greps (`bucketByDepth`, payload edges, `trust-status.ts`, schema `LineageVisualGroup`) | ✅ ran — claims verified/ corrected (see Grill outcome). |
| donatso/family-chart web verify (license/lang/deps/scripts) | ✅ MIT, TS, `d3 ^7.9.0`, no install scripts. |
| Code gates (typecheck/lint/test/oxc) | n/a — planning session, **no code touched**. |
| `bun run wiki:lint` | result reported in Full close evidence. |
| `graphify update` | count reported in Full close evidence (run before the close commit). |

## Open decisions / blockers

- **One-engine-vs-two** is an intentional later **evidence-based gate** (ADR 0026 §7) — not blocking.
- Next session's first action (vendor donatso) is a supply-chain step — needs the IoC + LICENSE.txt review
  before commit (operator caution); not blocked on user (operator pre-authorized the clone/IoC mechanics
  path in the grill, pending the LICENSE.txt confirm).

## Next session

### Goal

Build **petey-plan-0379 slice 0379-1** — vendor the `donatso/family-chart` fork into a Ronin-owned module.

### First task

Bow in; read ADR 0026 + petey-plan-0379 §0379-1 + runbook §0/§0a. Then: clone `donatso/family-chart` to
`/tmp`, run a read-only **IoC sweep** + **confirm `LICENSE.txt` = MIT** (the `package.json` license field
is non-SPDX), copy the TS `src/` into `apps/web/lib/lineage/family-chart/` (keep upstream `LICENSE`, record
the forked commit SHA), add `d3@7` + `@types/d3` to `apps/web`, then typecheck + a trivial smoke render
(render the whole bjj tree with `main_id`=root — this doubles as the one-engine evidence per ADR 0026 §7).
Not blocked on user.

## Review log

### SESSION_0380_REVIEW_01 — Lineage View A engine path lock

- **Reviewed tasks:** SESSION_0380_TASK_01, _02, _03.
- **Dirstarter docs check:** not applicable — no Dirstarter L1 baseline code touched (docs/planning only);
  the listing runbook was used as a grill *lens*, confirming lineage rendering is orthogonal to the
  `Tool`/listing monetization substrate.
- **Verdict:** Clean decision-lock. The candidate-A plan was confirmed but materially sharpened by
  grounding in the real code: two doc claims were corrected (secondary edges already in the payload; trust
  vocabulary already built), the "one engine vs two" temptation was correctly separated from "one source
  of truth" (the DTO delivers the latter), and the operator's zero-risk instinct (copy canvas → v2, never
  edit) was encoded into the plan + ADR. No code, no schema, privacy invariants untouched.
- **Score:** 9/10 (−1: I initially mis-framed candidate-B as a proprietary-Balkan runtime dep; the operator
  corrected it — a reminder to read the *intent* of an operator-authored source, not just its literal
  `bun add` line).
- **Follow-up:** next session vendors donatso (0379-1) with IoC + LICENSE.txt review; the whole-tree smoke
  feeds the one-engine gate.

## Hostile close review

- **Giddy:** Pass. No schema, code, Prisma, DNS, Vercel-prod, or Stripe changes — docs/planning only.
  Privacy invariants explicitly preserved (View A consumes the existing materialized payload; non-PUBLIC
  dropped). Supply-chain posture encoded (IoC + LICENSE.txt + SHA gate before any vendor commit). Scope
  stayed in the lineage planning lane.
- **Doug:** Pass. No code → no test/verification claims made beyond grounding greps + a read-only web
  verify, both honestly recorded. `wiki:lint` result recorded in evidence. ADR 0026 created; plan + runbook
  re-pointed with no stale "open decision" language left behind.
- **Desi:** Pass (light). No UI shipped; card/visual specs remain documented, belt color stays
  `Rank.colorHex` data in the locked design.
- **Kaizen aggregate:** 9/10 — strong source-grounded decision lock; one source-intent mis-read caught by
  the operator early and corrected.

## ADR / ubiquitous-language check

- ADR **created**: [ADR 0026 — Lineage View A engine (donatso fork; one DTO, two engines)](../architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md).
  Accepted. No Dirstarter baseline layer touched, so no Dirstarter proof table required.
- Ubiquitous language: candidate terms used descriptively (**View A / View B**, **focal explorer**,
  **shared visual DTO**, **secondary-overlay**, **slink/clink**). Not yet promoted to
  `ubiquitous-language.md` — they become canonical when the build lands; flagged for the 0379-1 close.

## Reflections

- **Read the operator's *intent*, not just the literal code.** I flagged candidate-B as a proprietary
  Balkan runtime dependency because File 4 does `bun add balkan-orgchart-js-community`. The operator's
  intent was the opposite — the code is their own, Balkan was only borrowed *vocabulary*. The literal line
  was misleading; the design was the point. Mirrors the SESSION_0379 lesson (read the source fully).
- **Grounding beat the doc, again.** Two load-bearing runbook claims were stale/wrong against the real
  code (secondary edges already materialized; trust vocabulary already built). Verifying before grilling
  turned a "build it" into "you already have it — reuse it," shrinking future slices.
- **Separate "one engine" from "one source of truth."** The operator's instinct to unify was right about
  the *goal* (no duplicated visual truth) but the lever is the shared DTO, not collapsing two genuinely
  different layout problems onto one engine. Naming that dissolved the dilemma without over-scoping.
- **Encode the zero-risk instinct into the plan, not just the session.** "Copy the canvas to v2, never
  edit the original" is now a scope-guard line + an ADR clause — so a future autonomous session can't
  accidentally rewire the working overview.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | ADR 0026 new (`last_agent` claude-session-0380); petey-plan-0379 + runbook restamped `claude-session-0380`, dates 2026-06-13; SESSION_0380 frontmatter complete. |
| Backlinks/index sweep | `pairs_with` cross-links added (ADR↔plan↔runbook↔SESSION); `wiki/index.md` SESSION_0380 row + `log.md` entry appended. |
| Wiki lint | `bun run wiki:lint` → result reported at bow-out (see chat). |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0380_REVIEW_01 + Giddy/Doug/Desi present. |
| Review & Recommend | Next session goal written (vendor donatso 0379-1). |
| Memory sweep | Lineage-pivot memory updated: path LOCKED (donatso, two engines), grounding corrections, next = 0379-1 vendor. |
| Next session unblock check | Unblocked — 0379-1 inputs all in-repo; clone/IoC mechanics pre-agreed (pending LICENSE.txt confirm). |
| Git hygiene | On `main`; docs-only; single `git add -A` commit + push; hash reported at bow-out — see git log (FS-0025, no second evidence commit). |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before the close commit; count reported at bow-out. |
