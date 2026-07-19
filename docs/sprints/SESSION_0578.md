---
title: "SESSION 0578 — Petey plan: technique graph out of beta (GA gap list + 3-lane fan-out + recipe template)"
slug: session-0578
type: session--plan
status: closed
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
- **Three paste-ready lane prompts** (0579 data / 0580 progress / 0581 design+flip) — committed
  verbatim in this file's "Fan-out lane prompts" section (Giddy close must-fix: launch artifacts
  never live only in chat), with the Doug/Giddy close-findings integrated.

## Decisions resolved

- Grill outcome (4 forks) — see Bow-in §Grill outcome: audit-now/build-in-lanes; GA bar incl.
  Wave 3; **grappling-arts scope amendment (BJJ+judo+wrestling takedowns, no striking/weapons)**;
  progress flip-blocking; merge order strictly C→B→A.
- AUD2-5 (progress display channel) + AUD2-6 (multi-art identity model) = named pre-build
  decision gates encoded in the lane prompts — Cody builds nothing against them until grilled at
  lane bow-in.
- WL-row creation routed through `scripts/ledger-id-next.ts` at lane closes — Giddy's close
  review PROVED 0575 already merged locally (`25940eb9`), never touched goals-ledger, and its one
  WL renumber (WL-P3-37→55) misses every row this plan cites; audit findings tracked as G-022
  children meanwhile.
- Giddy close conditions applied: grappling-scope ADR is a **blocking merge-gate on Lane C**
  (not a soft check); the port epic stamped with the supersession note; prompts committed
  in-file.
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

- **Push gate:** RELEASED — operator "Push go" received; docs-only diff (no prod deploy —
  `ignoreCommand` skips build); single push at close per FS-0025 order.
- **E2 Combo Flows**: left post-GA (sequenced after E1) — operator may veto into the GA bar.
- **Wrestling takedowns**: no source dataset — authoring task tracked under G-022 Lane C; not a
  lane blocker.
- AUD2-5 / AUD2-6 decision gates resolve at lane bow-ins (encoded in prompts).
- Sibling coordination RESOLVED by Giddy's close evidence: 0575 merged locally without touching
  goals-ledger; 0577 = `clients/mammoth-build-crm/*` only; local canonical main is 2 unpushed
  commits ahead — zero file overlap, append-merge at their push.

## Next session

### Goal

Launch the G-022 fan-out: paste the three lane prompts (0579 data → 0580 progress → 0581
design+flip) into fresh sessions; lanes run in parallel and merge C→B→A.

### First task

Paste the Lane C prompt (SESSION_0579, `session-0579-grappling-data`) — it lands first and
feeds Lane A's layout expansion. Each lane re-runs the FS-0030 ID-space check at its bow-in.

## Review log

### SESSION_0578_REVIEW_01 — Desi hallmark audit (technique GA surfaces)

- **Reviewed tasks:** SESSION_0578_TASK_08 (audit of the GA target surfaces, not of session code)
- **Dirstarter docs check:** not applicable (audit-only; doctrine + 0546/0569 canon as law)
- **Verdict:** surfaces craft-solid and doctrine-conformant at component level; GA risk = three
  ledgered P1 defects (already flip-blocking), an unowned flip surface (AUD2-4), and two
  channel-budget decisions (AUD2-5/6) that must precede builds. Multi-art: not ready as-is;
  foundation holds under spatial+filter-axis art identity.
- **Score:** n/a (audit, not a diff review)
- **Follow-up:** AUD2-1..12 routed to lanes via the fanout doc; corrections folded into G-022.

### SESSION_0578_REVIEW_02 — Hostile close (Giddy structure + Doug proof-verification)

- **Reviewed tasks:** the full docs diff + the disjointness proof + prompt safety
- **Verdict:** see Hostile close review section.

## Hostile close review

- **Giddy:** pass (one must-fix, applied) — placement correct (epics/protocols idiom); recipe
  EXTENDS §5b + loop-of-loops, no ritual contradiction; G-022 append clean, 0575 collision
  disproven with evidence; ADR deferral correct at authority level but upgraded to a **blocking
  Lane C merge-gate**; trunk shape clean. Must-fix executed: the three prompts committed into
  this file; port epic stamped.
- **Doug:** GO-WITH-NOTE 9.2/10, no cap — disjointness proof held under adversarial import-graph
  checks (A↔B no edges; importer read-only on the JSON; router registration B-only); ALL five
  fact-checks CONFIRMED; 0579–0581 collision-free. Note applied: `server/web/curriculum/queries.ts`
  assigned to Lane A + Lane C parse-contract constraint; Lane B additive-only pins;
  WL-P3-53 split constraint recorded in the Lane A prompt.
- **Desi:** pass — delivered the AUD2 audit (SESSION_0578_REVIEW_01); no UI touched this session.
- **Kaizen aggregate:** 9.2/10 — Doug's verified score stands as the session floor; every
  reviewer finding was either applied in the close commit or ledgered; the one bow-in factual
  error (entry links) was caught by the session's own review chain before ratification.

## ADR / ubiquitous-language check

- ADR update **not required this session**: plan/docs-only; no architectural decision ratified in
  code. The **grappling-arts scope amendment is ADR-worthy** — the ADR check is explicitly owed
  at Lane C's (SESSION_0579) close, the first build lane to act on it (recorded in G-022 + the
  Lane C prompt). ADR 0044 (motion posture, no Lenis) and ADR 0046 (authoring/ownership axes)
  confirmed valid and load-bearing in the lane prompts.
- Ubiquitous language update **not required**: "fan-out lane", "owned file set", "shared-by-rule
  files" are defined in `fan-out-session-recipe.md` (protocol vocabulary, not domain terms);
  no new domain nouns entered the model.

## Reflections

- **The audit falsified the plan's premise before it shipped.** The bow-in claim "nothing links
  to the graph" survived my own spot-check (I grepped the wrong tree) and died only when Desi
  read the actual index component. The fan-out recipe now encodes proof-by-listing for file
  claims; the deeper lesson repeats 0546/0569 — measure before scoping, and route a reviewer at
  the surface you're about to change, not just the one you think you're changing.
- **The grill changed the product, not just the plan.** Two of four forks came back different
  from the recommendation (Wave 3 in the GA bar; progress flip-blocking) and one came back as a
  scope amendment nobody had on the table (grappling arts). Grilling before finalizing is where
  operator intent actually enters the system — a plan ratified without it would have shipped a
  smaller, wrong GA.
- **ID-space discipline under parallel lanes worked, then immediately got tested.** 0575's live
  ledger-mechanization lane forced the additive-only rule AND the WL-row deferral — the first
  real exercise of the recipe's shared-by-rule-files section, written hours earlier.
- **Model note:** discovery + audit ran as four sub-agent dispatches (2 Explore scouts, Desi,
  Giddy+Doug close pair) with Petey verification of every load-bearing claim; one scout claim
  was corrected (entry links), zero unverified claims entered the ledger.

## Full close evidence

| Step | Proof |
| --- | --- |
| Gate runner (`bow-out-gates.sh`) | Task log PASS (11 rows) · format-fix 0 code files · wiki:lint 0 err / 54 warn · build skipped (docs-only) · graphify nodes=14786 edges=32031 · git clean · secret scan PASS |
| JETTY/frontmatter sweep | SESSION_0578 frontmatter closed, `type: session--plan`, dated 2026-07-19, `claude-session-0578`; new docs carry full frontmatter (fanout epic doc is a docs/epics hand-off doc, no frontmatter by idiom). |
| Backlinks/index sweep | G-022 cites SESSION_0578; agent-systems-map cross-references the recipe; recipe pairs_with the map + loop-of-loops + rituals. |
| Ledger cross-off | No rows flipped by design: G-022 newly opened (in-progress); G-013 unchanged (design waves fold into Lane A); WL-P2-65/66/67 + WL-P3-53/54 stay open (assigned to lanes); FI-001 parked; FS-0030 already mitigated. Gate-runner candidates confirmed as mentions, not resolutions. |
| Finding router | AUD2-1..12 → G-022 children + fanout-doc routing table (WL-row creation deferred to lane closes — 0575 ID-mechanization collision avoidance). No new FS/D/INC rows: the bow-in entry-link error was caught and corrected in-session by the review chain working as designed. |
| Deferral guard | Every deferred item is ledgered: Wave 3 slices, wrestling authoring gap, E2 Combo Flows (post-GA), AUD2-10 continuation — all under G-022 / the fanout doc. |
| Kaizen reflection | Present — falsified premise, grill-changed-product, ID-space discipline. |
| Hostile close review | Giddy + Doug dispatched on the close diff; verdicts in section above. |
| Review & Recommend | Next-session block = launch the fan-out (Lane C first); prompts delivered. |
| Memory sweep | `technique-graph-g022-fanout.md` memory + MEMORY.md index line written. |
| Next session unblock check | Unblocked — prompts self-contained; lanes re-run FS-0030 at bow-in; no dependency on this chat. |
| Git hygiene | `76670149` (deliverables) + close commit on `session-0578-technique-ga-plan`; single push at close (operator "Push go" received). |
| Graphify update | Gate runner recorded stats; canonical-checkout refresh happens post-merge per 0569 precedent (worktree graph is by-design partial; canonical tree hosts live sibling 0575 — not mutated from this session). |

## Fan-out lane prompts (launch artifact — paste verbatim)

> Committed per Giddy's close must-fix (recipe §6: a lane whose work lives only in chat dies at
> session end). These versions INTEGRATE the Doug close-findings (curriculum parser ownership,
> additive-only pins) and Giddy's conditions (ADR = blocking Lane C gate; WL IDs via
> `scripts/ledger-id-next.ts` — SESSION_0575's mechanization is merged). The epic doc
> `docs/epics/technique-graph-ga-fanout.md` remains the plan of record on any conflict.

### LANE C — SESSION 0579 (lands first)

```text
/bow-in Act as PETEY→CODY→DOUG. This is LANE C of the G-022 fan-out ("Technique graph out of
beta"), planned at SESSION_0578. Read FIRST: docs/epics/technique-graph-ga-fanout.md +
goals-ledger G-022 + docs/sprints/SESSION_0578.md (harvest inventory + AUD2 audit). Do not
re-plan the fan-out; execute this lane. Merge order C→B→A — this lane lands FIRST.

SESSION NUMBER: pinned 0579. Re-run the FS-0030 ID-space check at bow-in (0574–0578 burned/live;
0580/0581 reserved for lanes B/A); if 0579 is taken, go above and note it. Never renumber or
touch sibling files.

WORKTREE: fresh /Users/brianscott/dev/ronin-0579 off latest origin/main, branch
session-0579-grappling-data. Run /worktree-setup FIRST. Graphify reads 0 nodes in a fresh
worktree = not-built, NEVER "no matches" — query the canonical checkout for discovery.

GOAL: grappling curriculum data at scale. Adopt from the READ-ONLY monorepo
(/Users/brianscott/dev/ronin-dojo-monorepo): (1) tuffbuffs bjj.js — 98-technique trunk, 15-level
ladder; (2) Kodokan 20-throws seed + judo.js (grappling now IN scope per the SESSION_0578
amendment: BJJ + judo + wrestling takedowns only — NO striking, NO weapons, ever). Write a
node/TS transform (SHOW it to the operator before running — never Python) producing new payload
files under apps/web/prisma/data/; extend apps/web/prisma/import-bbl-bjj-curriculum.ts; backfill
the ~14 graph slugs present in bbl-bjj-graph.json but missing published DB rows; seed
disciplines/styles, curriculum links, belt linkage. AUD2-11: live-verify curriculum level tab
titles — if they render as codes (W0/BL0), retitle the CurriculumLevel seed rows to human names
(data-side fix). AUD2-6 (your share): add a zero-AABB-overlap guard to the seed/verify path and
do NOT extend Bjj* naming into new seed code. HARD CONSTRAINT (Doug): seeded notes/key-point
data must PRESERVE the keyPointsFromNotes parse contract in server/web/curriculum/queries.ts
(Lane A's file — both the graph and curriculum surfaces parse it; do not edit that file).

BOW-IN GRILL (resolve with the operator before building): (1) small additive hand-authored
migration (nativeName/aliases for judo japanese names) vs mapping into existing fields/tags;
(2) judo discipline/style row modeling; (3) whether judo rows get the graph tag now — recommend
NO: new techniques land Library-dark for the graph until Lane A adds layout slots; the importer
must not require JSON presence for new rows.

OWNED FILES (the disjointness contract): apps/web/prisma/import-bbl-bjj-curriculum.ts · NEW
apps/web/prisma/data/* payloads · apps/web/prisma/schema.prisma + ONE new migration dir (only if
grill-ratified) · the new transform script · the new grappling-scope ADR.
NON-GOALS (other lanes' territory): components/*, lib/*, app/(web) pages, server/web/* (Lane A
owns curriculum/queries.ts + the graph server modules) · bbl-bjj-graph.json (Lane A — you READ
it, never write it) · server routers, dashboard, technique-detail (Lane B) · the beta flip ·
wrestling authoring (no dataset exists — keep it ledgered under G-022) · striking/weapons/PII
data (REJECTED).

GATES: bun run typecheck · bun run lint:check (bun run lint WRITES files) · repo-wide bun run
format:check (you are ADDING files) · bun run test (NEVER bare multi-file bun test) · npx next
build off git diff origin/main..HEAD · importer idempotency proof (run twice, identical result) ·
record counts vs source (98 BJJ / 20 judo) in the SESSION Verification table · **BLOCKING
merge-gate (Giddy): write the grappling-arts scope ADR (BJJ+judo+wrestling takedowns, no
striking/weapons — supersedes the port epic's BJJ-only line) at this lane's close; the lane
does not push without it.**

PUSH POLICY: commit locally at close; HOLD at the push gate for the operator's explicit go.

GOTCHAS (floor — never trim): hand-authored migrations ONLY, NEVER prisma migrate dev (worktrees
share ONE local DB) · ../ronin-dojo-monorepo is READ-ONLY · technique-media NO-LEAK invariant is
law (locked ⇒ no url AND no media-id-bearing poster) — technique-media-gate.ts is out of your
scope, leave it untouched · Rank.brand is NULLABLE — never scope rank/belt queries by rank.brand ·
Prisma never in "use client" modules · unit tests can fire REAL Resend emails (0551 seam
unmerged) — add no tests touching email paths · sibling lanes are LIVE — coordinate, never
clobber · on any limit/config/sandbox error STOP and paste the EXACT error verbatim · unknown =
"I don't know", never theorize.

BOW-OUT: full close per closing.md. Flip/annotate G-022 Lane C children (additive ledger edits
only). Mint any new ledger IDs via scripts/ledger-id-next.ts (0575's mechanization, merged).
Next-session block = lane state per fan-out-session-recipe.md §6.
```

### LANE B — SESSION 0580 (lands second)

```text
/bow-in Act as PETEY→CODY→DOUG. This is LANE B of the G-022 fan-out ("Technique graph out of
beta"), planned at SESSION_0578. Read FIRST: docs/epics/technique-graph-ga-fanout.md +
goals-ledger G-022 + AUD2-5 in docs/sprints/SESSION_0578.md + prisma TechniqueProgress model +
apps/web/server/belt/router.ts (the oRPC domain-router idiom). Do not re-plan; execute. Merge
order C→B→A — this lane lands SECOND (rebase over origin/main after Lane C merges).

SESSION NUMBER: pinned 0580 (FS-0030 re-check at bow-in; 0579/0581 belong to lanes C/A; if taken
go above). WORKTREE: fresh /Users/brianscott/dev/ronin-0580 off latest origin/main, branch
session-0580-technique-progress. Run /worktree-setup FIRST (graphify 0 nodes there = not-built,
never "no matches").

GOAL: wire member technique progress — FLIP-BLOCKING for GA. The TechniqueProgress model EXISTS
(NOT_STARTED/LEARNING/DRILLING/SPARRING/MASTERED, @@unique[userId,techniqueId], verifiedBy) with
ZERO write paths today (read-projected only in directory profile payloads). Build: (1) a new
oRPC domain router apps/web/server/techniques/router.ts (FULL-oRPC direction — do NOT add
next-safe-action surfaces) registered with one line in apps/web/server/router.ts — own-user
upsert/clear of status + lastDrilledAt + notes; verifiedBy/instructor-verification is OUT of v1;
(2) apps/web/server/web/techniques/progress.ts + .test.ts (query/write layer, mocked-Prisma
query-shape test per the WL-P2-64 idiom); (3) a NEW technique-progress-control.tsx mounted in
app/(web)/techniques/[slug]/_components/technique-detail/index.tsx near the Save row; (4)
dashboard wiring via server/web/dashboard/queries.ts (findUserTechniques) +
app/(web)/dashboard/techniques-tab.tsx / techniques-table.tsx. Any signed-in member tracks their
OWN progress (free tier included — engagement driver); no entitlement gate on own-progress
writes.

BOW-IN GRILL (decision gate — build NOTHING before it): AUD2-5 — ratify ONE progress display
channel used identically everywhere. Desi's constraint: the badge/tint budget is SPENT (graph
node: fill=type, bottom bar=belt, ring=focus; cards carry Premium/Video/Foundational + belt).
Candidates: a leading glyph/checkmark in the identity cluster, or ONE dedicated progress badge
that REPLACES Foundational in the trailing row. NEVER a third color channel on graph nodes. You
implement the ratified channel on detail page + dashboard ONLY; Lane A applies the same channel
to cards/graph in its later slices. Record the decision in G-022. GRILL INPUT (Doug): the first
progress WRITE lights up the existing directory rich-profile READ surface
(profile-projection.ts:214, canRenderRichMedia-gated) — decide whether that projection is
desired at v1 or filtered.

OWNED FILES: NEW server/techniques/router.ts + its one registration line in server/router.ts ·
NEW server/web/techniques/progress.ts + test · server/web/techniques/permissions.ts
(ADDITIVE-ONLY — 9 existing importers incl. nav; new predicates beside existing, no refactors) ·
server/web/dashboard/queries.ts (+ test; ADDITIVE-ONLY — billing/school/membership tabs consume
it; new queries beside existing, no refactors) · app/(web)/dashboard/techniques-tab.tsx +
techniques-table.tsx · app/(web)/techniques/[slug]/_components/technique-detail/* + NEW
technique-progress-control.tsx.
NON-GOALS: technique-graph.tsx and ALL components/web/techniques|curriculum shared components
(Lane A) · server/web/curriculum/queries.ts (Lane A) · prisma schema/data/importer (Lane C) —
the model needs NO migration; if a schema gap appears STOP and flag, do not migrate · the beta
flip · graph progress overlay (post-GA, Lane A).

GATES: bun run typecheck · bun run lint:check · repo-wide bun run format:check (adding files) ·
bun run test (never bare multi-file bun test) · npx next build off git diff origin/main..HEAD ·
RUNTIME proof of the write path: dev server via Bash `cd apps/web && npx next dev --turbo`
(preview_start CANNOT serve a worktree — Browser pane reads :3000, or isolated Playwright),
exercise upsert→render→clear live · no-leak regression check: profile projection keeps
techniqueProgress behind canRenderRichMedia.

CACHE TRAP: technique content reads are cached (broad "techniques" cacheTag WL-P2-50 +
"bjj-technique-graph" tag). Progress writes must NOT bust technique content caches — keep
own-user progress reads uncached or under their own user-scoped tag.

PUSH POLICY: commit locally; HOLD for the operator's explicit go; lands after Lane C.

GOTCHAS (floor — never trim): hand-authored migrations only, NEVER prisma migrate dev (shared
local DB — and you need no migration) · ../ronin-dojo-monorepo READ-ONLY · technique-media
NO-LEAK invariant untouched (locked ⇒ no url AND no media-id poster) · Prisma never in
"use client" modules · unit tests can fire REAL Resend emails — no tests through email paths ·
bun run lint WRITES files · sibling lanes LIVE — coordinate, never clobber · on limit/config/
sandbox errors STOP and paste the EXACT error verbatim · unknown = "I don't know".

BOW-OUT: full close; Desi in the review wave (member-facing UI); flip G-022 Lane B children;
mint new ledger IDs via scripts/ledger-id-next.ts; Next-session block = lane state per
fan-out-session-recipe.md §6.
```

### LANE A — SESSION 0581 (multi-session; lands last; owns the flip)

```text
/bow-in Act as PETEY→CODY→DOUG with Desi IN the review wave. This is LANE A of the G-022
fan-out ("Technique graph out of beta") — the GA design lane; it lands LAST and owns the
beta→GA flip. Read FIRST: docs/epics/technique-graph-ga-fanout.md + goals-ledger G-022 +
SESSION_0578 (full AUD2-1..12 audit + conforms-do-not-touch list) + SESSION_0546 (Desi spec
waves + forks F1–F5) + SESSION_0569 (Wave 2 first batch + Next-session block) + wiring-ledger
WL-P2-65/66/67, WL-P3-53/54. Do not re-plan the fan-out; execute. This is a MULTI-SESSION lane:
work in ledgered slices per fan-out-session-recipe.md §6 — remaining tasks live under G-022,
each continuation session is a fresh full-citizen session continuing from the row's next open
child.

SESSION NUMBER: pinned 0581 for slice 1 (FS-0030 re-check at bow-in; 0579/0580 belong to lanes
C/B; if taken go above; continuations take the next free number at their own bow-ins).
WORKTREE: fresh /Users/brianscott/dev/ronin-0581 off latest origin/main, branch
session-0581-technique-ga-design. Run /worktree-setup FIRST (graphify 0 nodes = not-built).
REBASE RULE: before the layout-expansion and progress-channel slices, rebase over origin/main so
merged Lanes C (content) and B (progress channel decision) are present.

SLICE PLAN (ledgered; one reviewable slice per session, §5b chain each):
S1: C4 zoom/fit easing (never during drag) + WL-P2-67 viewport-aware ZOOM_MIN (mobile fit must
frame all nodes at 375px) + D-4 cooperative touch gestures + AUD2-3 mobile toolbar density (one
decision with the clamp fix, not two) + AUD2-8 dead-token fix (bg-[radial-gradient(...hsl(var(
--border))...)] never paints — live-verify computed style FIRST, then var(--color-border), and
grep for other hsl(var(-- survivors) + AUD2-9 demote PNG export to secondary.
S2: C5 selected-neighborhood glow + D3 empty states — scope explicitly INCLUDES the curriculum
browser's silent-empty topic-filter grid (AUD2-7: EmptyList + "Show all topics" reset) + B2
difficulty-term tooltips (graph-side) + WL-P2-65 export label clip (run the ledger's
disambiguation experiment first, then fix the winning variable, prove with real export bytes) +
WL-P2-66 reduced-motion cascade fix in lib/utils.ts popoverAnimationClasses (fix ONCE, prove
computed animation-name: none on ≥2 consumer surfaces under emulated reduce — class presence is
NOT behavior; shared-primitive change ⇒ affected e2e per the standing gate).
S3: Wave 3 — E1 CurriculumJourney scrollytelling (motion-only: useScroll + motion/react +
useReducedMotion fallback = today's browser; F1 Lenis is REJECTED, never re-open) + B3 key-point
hover peek + C3 grid stagger + G2 node-modal ellipsis menu (fold AUD2-12: "View technique"
becomes the dialog's primary).
S4: multi-art layout expansion — judo cluster coordinates into bbl-bjj-graph.json (you are the
ONLY lane that writes this file), zero-AABB-overlap proof live at 1280×800 AND 375×812,
formalize WL-P3-54 as a layout-invariant unit test, WL-P3-53 export-subsystem extraction on
touch (SPLIT CONSTRAINT, Doug: unowned techniques/tags/[slug] + categories/[slug] pages import
technique-listing/technique-query — split-outs must preserve export paths/props or ride-along
those pages explicitly) — THEN AUD2-4 the flip surface: ONE name everywhere (not "BJJ"-bound —
multi-art constraint), remove Beta Badge + Note from graph/page.tsx, upgrade the Library entry
to the TechniquesCrossLinks card idiom (fourth card, zero new components), update the export
filename, and FLIP feature-log.ts beta→live (+ FEATURES.md mirror) as the lane's LAST commit —
only when G-022's flip-blocking children (incl. Lane B) are ALL closed.

BOW-IN GRILL (before S1; blocks S4): AUD2-6 multi-art identity model — Desi's constraint: art
identity = spatial cluster/region + a second filter axis, NEVER a third color channel; type
tints stay the one fill language; make type→style maps exhaustive (compile-time Record, no
silent ?? transition fallback that renders new types amber in exports); plan the de-Bjj* naming
(queries, component names, page titles, export filename). Ratify with the operator; record in
G-022.

OWNED FILES: components/web/techniques/* (incl. technique-graph.tsx + WL-P3-53 split-outs) ·
components/web/curriculum/* · server/web/techniques/graph-query.ts, node-tooltip.ts,
graph-belt-level.ts (+ tests) · server/web/curriculum/queries.ts (the keyPointsFromNotes parse
contract — Doug close-finding) · prisma/data/bbl-bjj-graph.json · lib/utils.ts ·
lib/feature-log.ts + FEATURES.md · app/(web)/techniques/page.tsx, graph/page.tsx,
app/(web)/curriculum/page.tsx · app/(web)/techniques/_components/techniques-index/*.
NON-GOALS: prisma schema/importer/seed payloads (Lane C) · server routers, dashboard,
technique-detail, progress files (Lane B — apply the AUD2-5-ratified progress channel to cards/
graph only in a post-B slice) · E2 Combo Flows (post-GA, after E1) · nav promotion beyond the
ratified entry affordance · any new dependency (NO Lenis).

CONFORMS — DO NOT TOUCH (Desi, SESSION_0578): F4 dual tint channels · D-5 roving tabindex
composite · B1 tooltip no-media DTO contract · C2 layoutId pill · AUD-4 ctrl/⌘ wheel gate ·
export snapshot/restore machinery (keep rgb() literals in lockstep with nodeTypeClass) ·
ListingCard composition + ListingSaveButton · locked-media zero-prop tile + UpgradePanel ·
curriculum belt rail · page scaffolding.

GATES per slice: bun run typecheck · bun run lint:check · repo-wide bun run format:check ·
bun run test (never bare multi-file bun test) · npx next build off git diff origin/main..HEAD ·
NO-LEAK re-proof whenever graph-query/node-tooltip change (scalar-only select pinned by test;
DTO closed key set; SSR sweep for media-key strings) · runtime verification headless (dev server
via Bash — preview_start cannot serve a worktree; isolated Playwright for live-DOM AABB /
computed styles; qlmanage -t -s N for SVG→PNG) · real export bytes for any export change ·
Desi + Doug review the SAME commit before the next slice.

PUSH POLICY: commit locally; HOLD at the push gate each slice for the operator's explicit go;
this lane lands LAST — the flip commit never pushes before Lanes C and B are merged and the
operator says go.

GOTCHAS (floor — never trim): hand-authored migrations only, NEVER prisma migrate dev (shared
local DB; you should need none) · ../ronin-dojo-monorepo READ-ONLY · technique-media NO-LEAK is
law (locked ⇒ no url AND no media-id-bearing poster) · class presence ≠ behavior (computed-style
probes for every reduced-motion claim) · unit tests can fire REAL Resend emails — no tests
through email paths · bun run lint WRITES files · sibling lanes LIVE — coordinate, never
clobber · on limit/config/sandbox errors STOP and paste the EXACT error verbatim · unknown =
"I don't know".

BOW-OUT per session: full close; flip G-022 Lane A children; mint new ledger IDs via
scripts/ledger-id-next.ts; hostile close; Next-session block names the lane's next open child
per fan-out-session-recipe.md §6.
```
