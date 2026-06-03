---
title: "SESSION 0337 — Desi-led lineage design review (responsiveness / overflow / toolbar / carousel)"
slug: session-0337
type: session--open
status: in-progress
created: 2026-06-03
updated: 2026-06-03
last_agent: claude-session-0337
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0336.md
  - docs/protocols/review-recommend.md
  - docs/agents/desi.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0337 — Desi-led lineage design review (responsiveness / overflow / toolbar / carousel)

## Date

2026-06-03

## Operator

Brian + claude-session-0337 (Petey orchestration → Desi review-recommend → Cody build → Doug verify)

## Goal

Desi-led lineage design review: fix lineage **responsiveness**, **card text overflow**, and
**toolbar/toggle reachability**, and decide whether to adopt **horizontal carousel rails** for wide
sibling generations (porting the old BBL `CarouselRail` idiom). Run as `review-recommend` intel-gather
→ Petey grill → agreed plan → implement the agreed subset. Pushes 3f-PDF export and Phase 4 leaderboard
back 1–2 sessions (PDF approach already locked: client-side print-to-PDF).

## Status

### Status: in-progress

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0336.md` (closed, type `session--implement`).
- Carryover: SESSION_0336 landed Phase 3e (SVG 90° tree connectors with full animation parity) clean
  and explicitly re-sequenced the lineage epic — the operator inserted this Desi-led responsiveness /
  overflow / carousel design lane ahead of 3f-PDF and Phase 4. The brand-new SVG connector layer
  (`LineageConnectorLayer`) is the key constraint any carousel decision must coexist with.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `92f3963`

### Graphify check

- Graph status: current (rebuilt end of SESSION_0335/0336); stats at bow-in: 9110 nodes, 13816 edges,
  1396 communities, 1555 files tracked.
- Queries used:
  - `grill-me grill petey plan protocol fork decisions`
  - (BBL prior art located by direct path inspection in `ronin-dojo-monorepo`, a separate repo not in
    this graph.)
- Files selected from graph + direct inspection:
  - App: `apps/web/components/web/lineage/{lineage-tree-canvas,lineage-tree-board,lineage-node-card,lineage-compact-child-list,lineage-honor-strip}.tsx`
  - BBL prior art (monorepo): `src/brands/blackbeltlegacy/components/shared/CarouselRail.jsx`,
    `.../lineage/{StudentsCarousel,SchoolCarousel,ResponsiveTreeContainer,MobileLineageList}.jsx`
- Verification note: Graphify used for navigation; files confirmed by direct `ls`/source inspection.

### FAILED_STEPS check

- No open lineage- or responsiveness-specific FS entries. Standing mitigated entries honored:
  FS-0002 (dev server = `npx next dev --turbo` from `apps/web/`), FS-0024 (all git from app cwd; guard
  passed at bow-in).

### Grill outcome

4 forks resolved with the operator at bow-in (before evidence):

1. **Session shape → review + fix the 2 safe bugs + multi-session plan.** THIS session: Desi
   `review-recommend` evidence pass + implement the two low-risk bugfixes (card overflow Q2 + toolbar
   reachability Q1) + write a **multi-session implementation plan** for the bigger work (responsive
   model Q3 + carousel port Q4). The plan is written to be runnable **either autonomously (Claude or
   Codex, like recent autonomous runs) or one session at a time** — operator's choice at execution.
2. **Carousel (Q4) → COMMITTED, not "whether."** Operator decided: port the BBL `CarouselRail` idiom
   for wide sibling generations. The evidence pass + plan resolve **WHERE** (per-generation tier /
   honor strip / board child-lists) and **HOW** it coexists with the new SVG `LineageConnectorLayer`,
   not whether to adopt.
3. **Docker → installed and running** (`docker --version` → 29.5.2; `docker info` → running). NOT
   needed for this client-side responsive/CSS lane. The recurring "needs reinstalling" framing was
   stale boilerplate — corrected in the `docker-local-s3-minio-and-cache` memory so it stops resurfacing.
4. **Tooling → no new MCP.** The already-available Playwright MCP is exactly the tool for the Desi
   live-evidence pass; nothing to install.

**Grill round 2–3 (porting approach — operator wanted to "talk about it"):**

1. **Governing principle → features-not-pixels (adapt, don't copy).** Operator: *"adapt old features to
   the existing ones… take inspiration and feature behavior from old → new."* This is the porting
   runbook's hard rule. Every `PORTMAP` strategy is `adapt`/`wrap`, never `port-verbatim`. Retro-confirms
   the rail-engine pick below.
2. **Rail engine → reuse + extend the existing Embla `components/common/carousel.tsx`** (`Carousel` +
   `CarouselSlide`, chevron-when-scrollable). Runbook-compliant (no duplicate UI), no new dep. We adapt
   BBL's *behaviors* (sizing, snap, empty-state, a11y, scroll-step intent) onto it — not its JSX.
3. **Rail placement → connector-free zones AND inside wide tree generations** (operator chose the
   higher-reward option). Board child-lists + honor strip + mobile fallback are the safe early slices;
   wide connector-bearing tree generations are the hard, spike-gated final slice.
4. **Connector × rail coexistence → adaptive "parent-drop → rail bus + visible-child stubs."** When a
   generation is wide enough to rail, the SVG connector degrades from per-child fan to one horizontal
   bus across the rail viewport + a scroll cue; only visible children get stubs, re-measured on scroll
   (rAF-throttled). Reduced-motion = static. Protects the 3e `LineageConnectorLayer` model.
5. **Sequencing → this session writes ALL per-component port-specs + `PORTMAP-NNNN` records + the
   multi-session epic plan**, runnable autonomously (Claude/Codex) OR one-at-a-time. Specs follow the
   existing `…/component-porting/specs/*` boxed format and the `graphify-component-port-map.md` template.
6. **Product alignment → specs trace to BBL stories `BBL-LINEAGE-001/002/003` (and `-005` for the card
   badges); components stay brand-neutral for all 4 brands** (Baseline / BBL / WEKAF / Ronin) per
   ADR 0022 + `Rank.colorHex` data. Sources: `docs/product/black-belt-legacy/{STORIES,GAP_MATRIX,PRD}.md`.

### Drift logged

- **Graphify stale node (minor):** `graphify query` returns two porting-runbook nodes — `docs/runbooks/
  porting/react-to-next-component-porting-runbook.md` (real) and a top-level
  `docs/runbooks/react-to-next-component-porting-runbook.md` (does NOT exist on disk). Stale index from
  a pre-move rebuild; the close-time `graphify update` clears it. Not a repo drift.

## Petey plan

### Goal

Desi review-recommend + Slice 0 bugfixes + author the multi-session epic plan/specs/PORTMAP for the
lineage responsiveness + carousel work (adapt-not-port).

### Tasks

#### SESSION_0337_TASK_01 — Desi review-recommend (BBL prior art + live evidence)

- **Agent:** Desi (main, holds Playwright MCP) + general-purpose subagent (BBL mechanics extraction).
- **What:** read BBL carousel/responsive prior art for *behavior* + capture live overflow/toolbar
  evidence on `/lineage/[treeSlug]` with measured Playwright.
- **Done means:** root causes for Q1 (toolbar) + Q2 (overflow) confirmed with DOM measurements +
  before/after screenshots. ✓

#### SESSION_0337_TASK_02 — Slice 0 bugfixes (overflow + toolbar)

- **Agent:** Cody (inline) → Doug (verify).
- **What:** `max-w-full` on truncating spans (node card / honor strip / compact list); `w-full min-w-0
  max-w-full` on the canvas card wrapper.
- **Done means:** 0/70 truncate spans overflow; tree horizontally scrollable; toolbar controls in
  viewport; typecheck + biome + lib tests green. ✓

#### SESSION_0337_TASK_03 — Epic plan + PORTMAP + per-component specs

- **Agent:** Petey (plan + PORTMAP) + two general-purpose subagents (per-component specs, parallel).
- **What:** `docs/petey-plan-0337-lineage-responsive-carousel.md` (6-slice epic, autonomous-runnable);
  PORTMAP-0002..0006; five `specs/*.md` port-specs.
- **Done means:** epic + PORTMAP + 5 specs exist, story-aligned, brand-neutral, measured-proof criteria.

### Parallelism

- TASK_01 BBL extraction ran as a background subagent in parallel with the main Playwright pass.
- TASK_03 specs drafted by two background subagents on disjoint files (S1/S2/S4 vs S3/S5).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0337_TASK_01 | Desi + subagent | Live Playwright (main) + disjoint BBL code archaeology (subagent). |
| SESSION_0337_TASK_02 | Cody → Doug | One-class flex-constraint fixes; measured verification. |
| SESSION_0337_TASK_03 | Petey + 2 subagents | Spine authored by Petey; mechanical specs fanned out. |

### Open decisions

None — grill resolved 10 forks (see Grill outcome). Slice 5 (adaptive connector) is spike-gated in the
epic, not this session.

### Scope guard

- This session ships ONLY Slice 0 code; Slices 1–5 are planned/spec'd, not built.
- No schema/Prisma/server. No new dependency. No hardcoded belt colours. No duplicate components.

### Dirstarter implementation template

- **Docs read first:** porting runbook (`docs/runbooks/porting/…`) + the existing `specs/*` examples;
  not a Dirstarter L1 layer (custom lineage visualization + the Embla `Carousel` primitive already owned).
- **Baseline pattern to extend:** Embla `components/common/carousel.tsx`; `Stack`/`Card`/`Avatar`; the
  SESSION_0336 `LineageConnectorLayer`.
- **Custom delta:** Slice 0 flex-constraint fixes now; rail/responsive/mobile adaptations staged.
- **No-bypass proof:** reuse-before-port — we extend the existing Embla carousel rather than porting a
  second rail (runbook §"no duplicate UI").

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0337_TASK_01 | landed | Desi review-recommend: BBL behavior synthesized; Q1/Q2 root causes confirmed with measured Playwright + before/after screenshots. |
| SESSION_0337_TASK_02 | landed | Slice 0 bugfixes (overflow + toolbar) — measured-verified (0/70 spans overflow; tree scrollable; toolbar reachable). |
| SESSION_0337_TASK_03 | landed | Epic plan `petey-plan-0337` + PORTMAP-0002..0006 + 5 per-component port-specs. |

## What landed

- **Desi design review with measured evidence.** Diagnosed both reported bugs to their real
  constraint (not guesses): Q2 overflow = `Stack direction="column"`'s `items-start` (align-items:
  flex-start) makes truncating spans shrink-to-content and overflow their column (measured: a long rank
  label exceeded its column by **166px** with truncation OFF); Q1 toolbar = the lineage card is a flex
  item with `min-width:auto` in a `flex-col items-start` ancestor, so it blows out to the tree's
  intrinsic width (**3672px desktop / 2893px mobile**), defeating the canvas `overflow-x-auto`, and the
  app-shell `overflow-clip` then clips the right half incl. the right-justified controls.
- **Slice 0 bugfixes shipped + verified.** `max-w-full` on the truncating spans across node card /
  honor strip / compact child-list; `w-full min-w-0 max-w-full` on the canvas card wrapper. Live-measured
  after: **0 of 70** truncate spans overflow, tree is horizontally scrollable, toolbar controls sit
  within the viewport.
- **Multi-session epic authored** (`petey-plan-0337`): 6 slices (S0 done → S5 spike), runnable
  autonomously (Claude/Codex) or one-at-a-time, with measured-proof done-criteria, story alignment
  (`BBL-LINEAGE-001/002/003/005`), and the connector×rail coexistence design.
- **Porting records:** `PORTMAP-0002..0006` in the port map + **5 per-component port-specs** (Slices 1–5)
  in `…/component-porting/specs/`, all `adapt`-strategy, brand-neutral, `Rank.colorHex` only.

## Decisions resolved

- **Adapt, never port-verbatim** is the governing rule for the whole epic (operator's "features +
  behaviors from old → new").
- **Reuse the Embla `components/common/carousel.tsx`**, do not port a second rail (runbook no-duplicate-UI).
- **Rails go in connector-free zones AND (spike-gated) inside wide tree generations**; the connector
  **adapts** to a "parent-drop → rail bus + visible-child stubs (rAF re-measure)" when a generation rails.
- **Specs + PORTMAP + plan authored this session**; implementation deferred to the staged slices.
- **Docker is installed + running** (v29.5.2) — corrected the stale "needs reinstalling" memory.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | `max-w-full` on the displayName + rankLabel truncating spans (Q2 fix). |
| `apps/web/components/web/lineage/lineage-honor-strip.tsx` | `max-w-full` on the two truncating spans + `flex-1` on the text column (Q2 fix). |
| `apps/web/components/web/lineage/lineage-compact-child-list.tsx` | `max-w-full` on name + rank spans + `min-w-0` on the inner rank row (Q2 fix, board mode). |
| `apps/web/components/web/lineage/lineage-tree-canvas.tsx` | `w-full min-w-0 max-w-full` + explanatory comment on the canvas card wrapper (Q1 containment fix). |
| `docs/petey-plan-0337-lineage-responsive-carousel.md` | New — the 6-slice epic plan (autonomous-runnable). |
| `docs/knowledge/wiki/component-porting/graphify-component-port-map.md` | Added PORTMAP-0002..0006 active records. |
| `docs/knowledge/wiki/component-porting/specs/lineage-responsive-switch-port-spec.md` | New — Slice 1 spec. |
| `docs/knowledge/wiki/component-porting/specs/lineage-mobile-list-port-spec.md` | New — Slice 2 spec. |
| `docs/knowledge/wiki/component-porting/specs/lineage-carousel-rail-port-spec.md` | New — Slice 3 spec. |
| `docs/knowledge/wiki/component-porting/specs/lineage-generation-rail-port-spec.md` | New — Slice 4 spec. |
| `docs/knowledge/wiki/component-porting/specs/lineage-adaptive-connector-port-spec.md` | New — Slice 5 (spike) spec. |
| `docs/sprints/SESSION_0337.md` | This ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | Pass (route types generated, tsc clean). |
| `bun biome ci` (4 lineage files) | Exit 0 after formatter wrapped the long span lines. |
| `bun test lib/lineage/` | 19 pass / 0 fail (4 files). |
| Playwright — Q2 (overflow) | Before: long rank label exceeded its column by **166px**, truncation OFF. After: **0/70** truncate spans overflow; ellipsis engaged. |
| Playwright — Q1 (toolbar/containment) | Before: card **3672px**, canvas not scrollable, toolbar **3640px** (controls clipped). After: card **670px** ≤ viewport, canvas horizontally scrollable, toolbar **638px**, controls within viewport. |
| Playwright — screenshots | `/tmp/session-0337-desi/desi-0337-01-lineage-desktop-1280.png` (before), `…-02-lineage-mobile-390.png` (mobile clip), `…-03-lineage-desktop-AFTER.png` (toolbar reachable + honor strip scrolls + rank truncates). Ephemeral (not committed), per the SESSION_0175 capture-artifact precedent. |

## Open decisions / blockers

- **Slice 5 (adaptive connector) is spike-gated, not decided to ship.** The coexistence design is locked
  (parent-drop → rail bus + visible-child stubs), but a throwaway perf spike must validate rAF re-measure
  before committing; fallback (connector-free-when-railed) is documented. Escalate to operator if the
  spike is janky.
- **Lineage content column is narrow (~672px on a 1280 viewport)** — a pre-existing page-layout choice
  (constrained content width), not a Slice-0 bug. The fix makes the wide tree *scrollable* within it
  instead of clipped; whether to widen the lineage page's content column is a Slice-1 consideration.
- 3f-PDF export + Phase 4 leaderboard remain deferred behind this epic (PDF: client-side print-to-PDF).

## Next session

### Goal

Execute **petey-plan-0337 Slice 1 — responsive mode switch** (default board < md, tree ≥ md; viewer
toggle persists), the lowest-risk highest-value slice — OR kick off an autonomous Claude/Codex run of
Slices 1→2 per the epic's autonomous-run protocol.

### First task

Bow in against `docs/petey-plan-0337-lineage-responsive-carousel.md` (Slice 1) +
`docs/knowledge/wiki/component-porting/specs/lineage-responsive-switch-port-spec.md` + PORTMAP-0002. Cody
pre-flight, then add a viewport-aware default to `lineage-tree-canvas.tsx`'s initial `layout` state
(`board` < 768px, `tree` ≥ 768px) without fighting the `autoFittedRef` zoom seed, preserving the explicit
user toggle. Verify with measured Playwright at 390 / 768 / 1280 (card ≤ viewport at every width; correct
default mode; toggle persists), typecheck + biome + lib tests green. Update PORTMAP-0002 → `proven`.

## Review log

### SESSION_0337_REVIEW_01 — Desi review + Slice 0 + epic authoring

- **Reviewed tasks:** `SESSION_0337_TASK_01` / `_02` / `_03`.
- **Dirstarter docs check:** not applicable — custom lineage visualization + the already-owned Embla
  `Carousel` primitive (no Dirstarter L1 storage/auth/payments/Prisma/theming layer touched). The
  reuse-before-port rule (runbook) was honored: the epic extends `carousel.tsx`, no duplicate rail.
- **Verdict:** Strong session. Both reported bugs were diagnosed to their *real* constraint with live DOM
  measurements (not symptom-patched) and the fixes were proven by injecting candidate CSS on the live page
  and re-measuring *before* any code was written — then re-verified after. The diagnosis that Q1 and Q2
  are the same flex-constraint class, and that Q1 is actually the responsive-model core (not a cosmetic
  toolbar tweak), is the kind of root-cause read the design lane existed to produce. The epic is genuinely
  autonomous-runnable: every slice has measured-proof done-criteria, story alignment, and a PORTMAP record.
- **Score:** 9/10.
- **Follow-up:** Slice 5 spike remains the one real unknown (rAF connector re-measure perf). −1 because the
  honor-strip needing the same fix wasn't predicted from static reading — the live measurement caught it.

## Hostile close review

- **Giddy:** Pass. Every fix claim is backed by a measured DOM probe (166px overflow → 0; card 3672→670;
  toolbar 3640→638; 0/70 spans overflow), not assertion. The "fix proven before code" injections are in the
  transcript. The epic's reuse-before-port call is justified against the existing `carousel.tsx`.
- **Doug:** Pass. typecheck + biome ci (4 files, after the formatter wrap) + `bun test lib/lineage` (19/0)
  all green; no schema/server/DB surface touched. The 4 edits are one-class flex-constraint changes.
- **Desi:** Pass. Card-contract overflow fixed consistently across node-card + honor-strip + compact-list
  (tree + board + honor surfaces); toolbar controls reachable; honor strip scrolls; rank labels truncate
  with ellipsis. Brand-neutral (`Rank.colorHex`), ADR 0022 respected. The deeper responsive/mobile debt
  (390px clips 2544px with no scroll) is now a staged, spec'd epic rather than an open wound.
- **Kaizen aggregate:** 9/10 — measured, dogfooded, honest about the spike unknown.

### Findings (severity ≥ medium)

None ≥ medium. (The honor-strip straggler was caught + fixed in the same verification pass; no debt remains.)

## ADR / ubiquitous-language check

- ADR **not required this session.** Slice 0 is a CSS flex-constraint fix (no architecture/schema change).
  The epic's design decisions (reuse Embla over a ported rail; the adaptive connector×rail coexistence
  model) are captured in `petey-plan-0337` + the PORTMAP records — the canonical home for a multi-session
  plan. **Flag:** when **Slice 5 (adaptive connector)** is built, a dedicated ADR is likely warranted (it's
  a genuine architecture choice with a documented fallback). ADR 0022 (brand-neutral chrome) was confirmed
  valid: all fixes + specs keep belt colour as `Rank.colorHex` data.
- Ubiquitous language **not required.** "Rail", "bus", "stub" are internal render vocab; "generation",
  "honor strip", "board" already exist.

## Reflections

- **Prove the fix on the live DOM before writing code.** For both bugs I injected the candidate CSS via
  `browser_evaluate`, re-measured the geometry, and confirmed `fix_worked: true` *before* touching a file —
  then re-verified after. For layout/constraint bugs this is dramatically higher-signal than reading
  Tailwind and guessing; it should be the default idiom for the whole responsive epic (it's baked into
  every slice's done-criteria as measured Playwright proof).
- **Diagnose the constraint, not the symptom.** The operator reported "toolbar scrolls out of view" and
  "text clips." The real causes were one class of bug — flex `min-width:auto` blowout (Q1) and
  `align-items:flex-start` shrink-to-content defeating `truncate` (Q2). Naming the constraint turned a
  "cosmetic toolbar tweak" into the recognition that Q1 *is* the responsive-model core, which reshaped the
  epic.
- **The existing primitive saves a duplicate.** "Port BBL CarouselRail" almost became a second carousel —
  but `graphify` + an `ls components/common` surfaced the existing Embla `carousel.tsx`. The runbook's
  reuse-before-port rule + the operator's "adapt features, not pixels" framing converged on extending it.
  Cheap discovery (one `ls`) prevented an expensive mistake.
- **Process friction worth fixing:** the bow-in args carried stale "Docker needs reinstalling" boilerplate
  that contradicted reality *and* the existing memory — corrected the memory file so it stops resurfacing.
  Graphify also returned a stale duplicate porting-runbook node (file moved into `porting/`); the close-time
  rebuild clears it. Quick win: the subagent fan-out (BBL mechanics + 5 spec drafts on disjoint files) was
  genuinely parallel and the measured-proof done-criteria make the epic runnable headless.

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log SESSION_0337_TASK_01/02/03 (all landed). |
| JETTY/frontmatter sweep | This file stamped `last_agent: claude-session-0337` / `updated: 2026-06-03`; `petey-plan-0337` + 5 specs carry full spec frontmatter; port-map updated. Code files carry no doc frontmatter. |
| Backlinks/index sweep | `wiki/index.md` gets 5 spec rows + `petey-plan-0337` + the SESSION_0337 row; specs cross-ref the epic + their PORTMAP. |
| Wiki lint | `bun run wiki:lint` → ✅ No lint violations found (orphans cleared). |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | Present; no findings ≥ medium (honor-strip straggler fixed in-session). |
| Review & Recommend | Next-session goal + first task written (Slice 1, autonomous-run option). |
| ADR / ubiquitous-language | None needed now; Slice 5 ADR flagged (recorded above). |
| Memory sweep | Docker memory corrected (installed + running); lineage memory updated with the flex-constraint + epic pointer. |
| New-component documentation | No new runtime components this session (Slice 0 = edits); new components arrive in Slices 1–5 and are spec'd. `custom-component-inventory.md` unchanged. |
| Next session unblock | Unblocked — epic + specs + PORTMAP authored; Slice 1 is a clean first task. |
| Git hygiene | FS-0024 guard passed; on `main`; single close push — hash reported at bow-out. |
| Graphify update | Ran before the close commit; stats in bow-out chat. |
