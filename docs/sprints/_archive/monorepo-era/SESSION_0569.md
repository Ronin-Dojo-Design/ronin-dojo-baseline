---
title: "SESSION 0569 — Technique-graph lane recovery + WL-P2-64 + G-013 Wave 2 staging"
slug: session-0569
type: session--implement
status: closed
created: 2026-07-18
updated: 2026-07-18
last_agent: claude-session-0569
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0546.md
  - docs/epics/technique-graph-curriculum-port.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0569 — Technique-graph lane recovery + WL-P2-64 + G-013 Wave 2 staging

## Date

2026-07-18

## Operator

Brian + claude-session-0569

## Goal

Continue the BBL technique-graph lane (G-013) in parallel with the 0568 Obsidian/Mammoth lane. First
recover the true lane state from SESSION_0546 (which closed clean after its session-limit recovery —
more landed than the bow-in prompt assumed), then close the one open quality remainder (WL-P2-64
staff-predicate query-shape test) and stage the G-013 Wave 2 report + fork list for the operator's
grill before building anything that depends on the Desi spec.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0567.md` (G3-stack integration lane; its Next-session
  block targets CSP/CI promotion — a different lane, not this one). Operator directive pins THIS
  session: continue the technique-graph lane (SESSION_0546 → G-013).
- Lane-state recovery: SESSION_0546 was NOT left mid-flight — it recovered from the session-limit
  interruption and closed full (Desi GO, Doug 9.7/10, Giddy pass). Its quality lane (WL-P2-63
  UpgradePanel, WL-P2-49 sortable-media-grid + `findActiveStaffMembership`, WL-P2-52 remainder) AND
  Wave 1 polish are merged and pushed (`823d94e7` reachable from `origin/main`; files verified
  present on `origin/main`). The 5 design forks (F1–F5, incl. Lenis) were grilled and resolved by
  the operator at 0546 bow-in.
- Session number note: 0568 is claimed by the live Obsidian/Mammoth sibling lane (bow-in prompt
  staged in `3d3f7c55`); FS-0030 ID-space check run (sprints dir + worktrees + remote branches) →
  took 0569.

### Branch and worktree

- Branch: `session-0569-technique-graph`
- Worktree: `/Users/brianscott/dev/ronin-0569` (bootstrapped: canonical `.env` copied, `bun install`,
  Prisma client generated)
- Status at bow-in: clean
- Current HEAD at bow-in: `3d3f7c55` (= `origin/main`)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (techniques), monetization (premium gating) — test-only this wave |
| Extension or replacement | Extension: regression coverage on the shipped `findActiveStaffMembership` seam |
| Why justified | Ledger-mandated (WL-P2-64); no new surface or L1 replacement |
| Risk if bypassed | Shared staff-predicate query shape can silently drift across its six consumers |

Live docs checked during planning: not applicable (test-only; shipped seams unchanged).

### Graphify check

- Graph status: current in canonical checkout only (worktree reads 0 nodes — expected, not a
  negative signal). Canonical stats at 0546 close: 17,494 nodes / 34,407 edges.
- Queries used:
  - `technique graph node tooltip filter pill zoom easing neighborhood glow empty state curriculum journey` (budget 1500, run in canonical)
- Files selected from graph: epic doc + `technique-filters.tsx` / `use-technique-filters.ts`
  (Wave 2 C2 surface); `technique-graph.tsx` + `bjj-curriculum-browser.tsx` already known from 0546.
- Verification note: lane state verified by direct `git ls-tree origin/main` + ledger reads, not
  graph output.

### Grill outcome

Operator grill (grill-with-docs, 2026-07-18; merged /grill-me + /grill-with-docs into one flow) —
4 forks resolved:

- **Q1 Hallmark × D11:** audit-only on `apps/web`, D11 narrowly amended — read-only `hallmark audit`
  allowed on product surfaces; `redesign`/default builds stay banned; punch list routes through Desi
  + design-system doctrine (tokens stay law). Amendment lives in the hallmark preamble + epic §7 note.
  ⚠ Sibling-lane touch: those two files belong to the 0568 Obsidian/Mammoth lane family — minimal
  one-line edits, flagged for coordination at merge.
- **Q2 0546 forks:** all five stand — F1 Lenis stays REJECTED (motion-only E1, no new dep),
  F2 Combo Flows after E1, F3 derive-only content, F4/F5 shipped outcomes unchanged.
- **Q3 Sequencing:** audit FIRST, merged batch — hallmark audit → Desi merges punch list with the
  locked Wave 2 spec (Desi wins conflicts) → Cody builds B1+C2 + accepted audit items as ONE batch →
  Desi+Doug review gates before C4/C5.
- **Q4 Wayfinder:** skipped — G-013 already mapped (locked waves + ledger row); revisit only if the
  audit reveals multi-session fog.

Second grill (operator /grill-me, post-build) — 4 more forks resolved:

- **Fix gate:** both reviews first → ONE batched Cody fix resume (their P1/P2 + accepted smalls);
  PLUS selected deferred items.
- **Defer picks:** D-2 (node-overlap coordinate nudge) + D-5 (roving tabindex over the node layer).
  D-1/D-3/D-4/D-6 stay routed as before.
- **Consistency scope:** technique-only tonight; QUEUE a new goals-ledger row — Desi-driven hallmark
  audit program across BBL public surfaces, wayfinder-mapped when that lane starts (its proper
  epic-scale use).
- **Close plan:** fix batch → Doug delta → /code-quality on the diff → fallow delta (full
  /fallow-fix-loop only if regressed) → full bow-out + hostile close → HOLD at gate → **direct push
  to main** on the operator's word (no PR). /pr-fix-loop skipped (zero open PRs).

### Fallow baseline (pre-implementation)

- `npx fallow health`: 702 above threshold · 12,261 analyzed · maintainability 89.5 (good)
- `npx fallow dupes`: 22,445 lines (9.4%) duplicated across 497 files
- Diff both at bow-out.

## Petey plan

### Goal

Close WL-P2-64, then hold at the operator grill gate with the G-013 Wave 2 report + fork list.

### Tasks

#### SESSION_0569_TASK_01 — Lane-state recovery (shipped vs open)

- **Agent:** Petey (inline)
- **What:** Establish exactly what SESSION_0546 landed vs left open, vs the bow-in prompt's
  assumptions.
- **Done means:** landed/open report delivered to operator (see Task log).
- **Depends on:** nothing

#### SESSION_0569_TASK_02 — WL-P2-64 staff-predicate query-shape test

- **Agent:** Cody (build) → Doug (verify)
- **What:** Mocked-Prisma query-shape unit test for `findActiveStaffMembership` covering brand
  scope, organization scope, ACTIVE status, OWNER/INSTRUCTOR roles, and the
  `findUserTechniques` dashboard consumer. No behavior change.
- **Done means:** test file lands, one commit, full local gates green, ledger row flippable.
- **Depends on:** nothing

#### SESSION_0569_TASK_03 — G-013 Wave 2 report + fork list for operator grill

- **Agent:** Petey (inline)
- **What:** Surface the Desi spec waves + the F1–F5 fork outcomes recorded at 0546 (esp. F1
  Lenis → REJECTED, motion-only) and hold: Wave 2 build (B1 tooltips + C2 filter pill first)
  starts only on the operator's word.
- **Done means:** report in chat; explicit HOLD at the build gate for anything spec-dependent.
- **Depends on:** SESSION_0569_TASK_01

#### SESSION_0569_TASK_04 — D11 amendment (audit-only carve-out)

- **Agent:** Petey (inline)
- **What:** One-line amendment to the hallmark D11 preamble + epic §7 note: read-only `hallmark
  audit` allowed on `apps/web`; `redesign`/default stays banned. Own commit.
- **Done means:** both files carry the amendment; commit cites the SESSION_0569 grill.
- **Depends on:** grill Q1 (resolved)

#### SESSION_0569_TASK_05 — Hallmark audit + Desi merge into Wave 2 brief

- **Agent:** Desi
- **What:** Run `hallmark audit` (per vendored SKILL.md, context-gated: BBL seed tokens + doctrine
  read first) over the technique graph / curriculum / watch surfaces (source + 0546 route captures),
  then merge the ranked punch list with the locked Wave 2 spec into one build brief. Desi's spec wins
  conflicts; no edits.
- **Done means:** merged Wave 2 build brief (B1 + C2 + accepted audit items) with explicit
  reject/defer list.
- **Depends on:** SESSION_0569_TASK_04

#### SESSION_0569_TASK_06 — Wave 2 build (B1 + C2 + accepted audit items)

- **Agent:** Cody → Doug (verify) → Desi (design gate)
- **What:** B1 graph-node tooltips (~250ms delay, no-media data contract, keyboard/reduced-motion
  parity) + C2 animated filter-chip layoutId pill + accepted audit P1s, one batch in this worktree.
- **Done means:** commits land, no-leak invariant re-proven, full local gates green, Desi+Doug GO.
- **Depends on:** SESSION_0569_TASK_05

### Parallelism

TASK_02 ran while TASK_03's report was composed. TASK_04 → TASK_05 → TASK_06 sequential (audit-first
merged-batch, grill Q3). C4/C5 and later Wave 2 items stay out of this batch per the 0546 gate order.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0569_TASK_01 | Petey | read-only state recovery, conclusion-only |
| SESSION_0569_TASK_02 | Cody → Doug | clear ledger-scoped build → verify per router |
| SESSION_0569_TASK_03 | Petey | operator-facing fork surfacing |

### Open decisions

- Do the 0546 fork resolutions (F1 Lenis rejected → motion-only; F2 ComboBuilder deferred to
  post-E1; F3 derive-only content; F4 dual tint channels; F5 default beta copy) still stand, or does
  the operator want to re-open any (esp. F1 Lenis) before Wave 2?
- Wave 2 go/no-go: first slice = B1 graph-node tooltips + C2 animated filter pill (per 0546
  Next-session block), Desi+Doug review before C4/C5.

### Risks

- Technique-media no-leak invariant (locked ⇒ no url AND no media-id-bearing poster) — hard gate;
  this session's build task is test-only and does not touch gate types.
- Sibling lanes live (0568 Obsidian/Mammoth + held G3-stack lanes) — disjoint files expected;
  coordinate/flag rather than clobber.

### Scope guard

- No push / PR / merge / deploy without the operator's explicit word (standing rule).
- No Wave 2/3 building before the operator grill outcome.
- FI-001 PARKED. `../ronin-dojo-monorepo` READ-ONLY. Hand-authored migrations only (none expected).
- No new dependencies (Lenis stays out unless the operator re-opens F1).

### Dirstarter implementation template

- **Docs read first:** SESSION_0546 close record, wiring-ledger WL-P2-64 row, goals-ledger G-013
- **Baseline pattern to extend:** existing mocked-Prisma unit-test idiom in `server/web/**` tests
- **Custom delta:** query-shape assertions for the shared staff predicate
- **No-bypass proof:** test-only; no runtime surface added or replaced

## Cody pre-flight

### Pre-flight: WL-P2-64 query-shape test

Completed by Cody sub-agent before writing code (existing test-idiom scan, lane docs WL-P2-64 +
SESSION_0546 Doug P2, FS-0027 mitigation: `bun run test` only, never bare multi-file `bun test`).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0569_TASK_01 | landed | Lane state recovered: 0546 closed FULL — quality lane (WL-P2-63/49/52) + Wave 1 + beta treatment all pushed on `origin/main`; forks F1–F5 resolved at 0546; open remainder = WL-P2-64 + G-013 Waves 2/3 + Combo Flows. |
| SESSION_0569_TASK_02 | landed | Cody `2b19a957` (2 test files, 222 ins, zero prod code); gates green (52/0 focused); Doug GO-WITH-NOTE 9.7/10 — note = flip WL-P2-64 ledger row at bow-out. |
| SESSION_0569_TASK_03 | landed | Lane report delivered; operator grill resolved 4 forks (see Grill outcome). |
| SESSION_0569_TASK_04 | landed | D11 amendment committed `ce7dd46e` (hallmark preamble + epic §7 row; audit-only carve-out, redesign stays banned). Sibling-lane touch flagged for 0568 coordination. |
| SESSION_0569_TASK_05 | landed | Desi hallmark audit: 1 critical (broken PNG export type/crop) · 5 major · 4 minor · 2 tells overruled by 0546 canon; verdict "close; not AI-slop". Merged brief = B1 + C2 + AUD-1..4; D-1..D-6 deferred to G-013 waves; R-1..R-4 rejected. |
| SESSION_0569_TASK_06 | landed | Wave 2 batch built (4 commits: `f68b0248` B1 · `8860c875` C2 · `47a68859` AUD-1 · `ab6e5f2c` AUD-2/3/4); Cody gates green; **Doug GO 9.6/10 (zero P1/P2**, 4 P3s, no-leak proven 4 layers, runtime smoke :3010) · **Desi GO-WITH-CHANGES (zero P1**, 1 MEDIUM = tooltip L1 reduced-motion consolidation, 6 LOWs, 3 deviations accepted). |
| SESSION_0569_TASK_07 | landed | Fix batch (4 commits: `23a6f4ff` tooltip L1 consolidation · `f0409909` review smalls + select-shape test · `5c7e6574` 47-node re-pitch, 67→0 overlaps · `b279942f` roving tabindex). **Doug delta GO-WITH-NOTE 9.6/10, zero batch P1/P2**; re-pitch independently verified (live-DOM AABB 0 pairs both viewports); real export bytes incl. negative-pan clamp proof; 3 PRE-EXISTING P2s surfaced → routed to ledger (export label clip · motion-reduce cascade loss in `popoverAnimationClasses` · mobile ZOOM_MIN fit-view). |
| SESSION_0569_TASK_08 | landed | /code-quality 9.4 (REVIEW_04); fallow delta flat-or-better (no fallow-fix-loop escalation); Giddy hostile-close PASS; full close executed; HOLD at push gate (direct-push-to-main on operator word). |

Incident note: a session-limit interruption hit mid-turn between TASK_05 delivery and TASK_06
dispatch (operator resumed after reset). Second occurrence in this lane (first: SESSION_0546) —
route to incidents ledger at bow-out per the 0546 note.

## What landed

- **WL-P2-64 closed:** mocked-Prisma query-shape tests for `findActiveStaffMembership` + the
  `findUserTechniques` consumer (`2b19a957`); extended with a graph-query scalar-only select-shape
  test (`f0409909`).
- **D11 amended** (`ce7dd46e`): read-only `hallmark audit` allowed on product surfaces; punch lists
  route through Desi + doctrine; `redesign`/default builds stay banned. Recorded in the hallmark
  preamble + epic §7 row.
- **Hallmark audit of the technique surfaces** (first D11-amended use): 1 critical + 5 major +
  4 minor, 2 tells overruled by 0546 canon; verdict "close; not AI-slop".
- **G-013 Wave 2 first batch** (`f68b0248` B1 · `8860c875` C2 · `47a68859` AUD-1 · `ab6e5f2c`
  AUD-2/3/4): graph-node tooltips with a type-encoded no-media DTO on the L1 tooltip (250ms hover /
  instant focus); animated layoutId filter pill; PNG-export font-await + content-crop; count-badge
  accent demotion; readable curriculum belt tabs; ctrl/⌘-gated wheel zoom.
- **Fix batch** (`23a6f4ff` · `f0409909` · `5c7e6574` · `b279942f`): shared tooltip L1 consolidated
  onto `popoverAnimationClasses` (restores `motion-reduce:animate-none`); eight review smalls;
  47-node coordinate re-pitch (67→0 AABB overlaps, x/y-only); APG roving tabindex over the node
  layer (one tab stop, arrows in reading order).
- **Evidence assets:** `SESSION_0569-graph-repitch-{desktop,mobile}.png` + `SESSION_0569-graph-export.png`
  (real 326,874-byte export; negative-pan clamp proven).

## Decisions resolved

- Eight operator grill forks across two grills — see `### Grill outcome` (hallmark×D11 audit-only
  amendment; 0546 forks F1–F5 stand incl. no-Lenis; audit-first merged batch; wayfinder skipped;
  fix gate = both reviews + D-2 + D-5; consistency queued as G-020; close = direct push to main).
- Desi's spec wins hallmark-conflict calls; 3 Cody deviations accepted (modal tooltip-suppress,
  pill `overflow-visible`/`z-10`, label-in-name aria); FIX-3's 47-node structured re-pitch accepted
  over the planned 6-node nudge (premise was wrong by an order of magnitude — 67 real overlaps).
- Doug's three pre-existing P2s routed as WL-P2-65/66/67, not fixed in-batch (no-new-scope lock).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/techniques/permissions.test.ts` + `server/web/dashboard/queries.test.ts` | WL-P2-64 query-shape recorder tests (new). |
| `apps/web/server/web/techniques/node-tooltip.ts` + `.test.ts` | No-media tooltip DTO + derivation (word-boundary clamp) + exact-key-set tests (new). |
| `apps/web/server/web/techniques/graph-query.ts` + `graph-query.test.ts` | Scalar `notes` select + shared parser reuse; select-shape pin test (new). |
| `apps/web/server/web/curriculum/queries.ts` | Export `keyPointsFromNotes` (ONE parser). |
| `apps/web/components/web/techniques/technique-graph.tsx` | B1 tooltips, C2 pill, export font/crop, wheel gate, badge demotion, memoized DTOs, roving tabindex. |
| `apps/web/components/web/curriculum/bjj-curriculum-browser.tsx` | Readable level-tab labels + hoisted const. |
| `apps/web/components/common/tooltip.tsx` | Fork deleted → shared `popoverAnimationClasses`. |
| `apps/web/prisma/data/bbl-bjj-graph.json` | 47-node x/y re-pitch (structure/ids/edges byte-identical). |
| `.claude/skills/hallmark/SKILL.md` + `docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md` | D11 audit-only amendment (⚠ 0568-lane files — flagged). |
| `docs/knowledge/wiki/{wiring,goals}-ledger.md`, `incidents.md`, `index.md` | WL-P2-64 flip; WL-P2-65/66/67; G-013 progress; G-020; incident row; index row. |
| `docs/sprints/SESSION_0569.md` + `_assets/SESSION_0569-*.png` | Session record + visual evidence. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (run after every batch; final post-fix-batch run clean). |
| `bun run lint` / `lint:check` | PASS — exit 0, zero rewrites of session files; pre-existing warnings only. |
| `bun run format:check` (repo-wide) | PASS — all matched files (1970–1971). |
| `bun test --parallel=1` (8 lane suites incl. no-leak gate) | **56 pass / 0 fail** (113 expects, final run). |
| `npx next build` | PASS (exit 0, run three times across batches; `/techniques/graph` builds). |
| No-leak invariant | PASS — gate file untouched across all 10 commits (git-proven); DTO exact-key-set test; render-layer text-only; runtime SSR sweep found zero media-key strings. |
| Runtime verification (isolated Playwright, dev servers :3010/:3012/:3013, killed after) | PASS — live-DOM AABB 0 overlaps (1280×800 + 375×812); keyboard traces 9/9 (Cody) + 10/10 (Doug independent); tooltip ~322ms vs 250ms delay w/ no media elements; real PNG exports 326,874 bytes + negative-pan clamp proof; `motion-reduce:animate-none` present in live DOM. |
| Fallow delta (bow-in → close) | Maintainability 89.5→89.5 · dupes abs unchanged (ratio 9.4%→9.3%) · diff-scope MI 91.2, dead files/exports 0.0% · +2 named threshold findings. |
| Full repo suite | NOT RUN (standing: shared-prodsnap cascade + open live-Resend issue) — CI is the authoritative e2e gate on push. |

## Open decisions / blockers

- **Push gate:** direct-push-to-main ratified in principle at the grill; awaiting the operator's
  explicit "go" (apps/web diff ⇒ push fires CI + BBL prod deploy). No other blocker.
- **0568-lane coordination:** the D11 amendment touches two files the Obsidian/Mammoth lane family
  owns (hallmark SKILL.md, epic doc) — one-line edits; flag at merge if 0568 has in-flight changes.
- WL-P2-65/66/67 routed (pre-existing; WL-P2-67 belongs to the C4 batch).

## Next session

### Goal

Continue G-013 with the second Wave 2 batch, preserving beta posture and the no-leak law.

### First task

Build C4 zoom/fit easing together with WL-P2-67 (viewport-aware `ZOOM_MIN` so mobile fit-view frames
all nodes) and D-4 cooperative touch gestures as one slice; add C5 selected-neighborhood glow and
D-3 pill parity on curriculum rows if the slice stays reviewable; route through Desi + Doug before
D3 empty states / B2 difficulty tooltips. Also good first-pick candidates: WL-P2-66 reduced-motion
cascade fix (one line in `lib/utils.ts`, heals four surfaces, needs CI e2e) and WL-P2-65 export
label clip (disambiguation experiment first).

## Review log

### SESSION_0569_REVIEW_01 — Doug, WL-P2-64 diff

- **Reviewed tasks:** SESSION_0569_TASK_02
- **Verdict:** GO — containment exact, assertions provably non-vacuous, hermetic; gates green.
- **Score:** 9.7/10 (no cap)
- **Follow-up:** flip WL-P2-64 ledger row at close (done in this bow-out).

### SESSION_0569_REVIEW_02 — Doug + Desi, Wave 2 batch

- **Reviewed tasks:** SESSION_0569_TASK_06
- **Verdict:** Doug GO 9.6/10 (zero P1/P2; no-leak proven at select/DTO/test/render layers + runtime
  SSR sweep; runtime smoke on :3010). Desi GO-WITH-CHANGES (zero P1; 1 MEDIUM + 6 LOWs; all three
  Cody deviations accepted). All findings either fixed in TASK_07 or routed.
- **Follow-up:** consumed by TASK_07.

### SESSION_0569_REVIEW_03 — Doug delta, fix batch

- **Reviewed tasks:** SESSION_0569_TASK_07
- **Verdict:** GO-WITH-NOTE 9.6/10, zero batch P1/P2. Re-pitch independently re-verified (own AABB
  recompute: 0 overlapping pairs at 1280×800 and 375×812); export crop clamp proven with real bytes
  (326,874-byte export; negative-pan capture 0px trailing white); FIX-4 keyboard model re-traced
  10/10; tooltip carries `motion-reduce:animate-none` live. Three PRE-EXISTING P2s handed forward
  (export font-pin label clip · `popoverAnimationClasses` reduced-motion cascade loss · `ZOOM_MIN`
  mobile fit-view) — routed to wiring-ledger, not batch blockers.
- **Evidence:** `docs/sprints/_assets/SESSION_0569-graph-repitch-{desktop,mobile}.png`,
  `SESSION_0569-graph-export.png`.

### SESSION_0569_REVIEW_04 — Code-quality score (code-quality-matrix)

**Roll-up (weakest first):**

| Unit | Class | Composite | Verdict |
| --- | --- | ---: | --- |
| U2 — technique graph feature diff (B1/C2/AUD/re-pitch/roving) | B (ref: ADR 0046 + 0546 Desi spec + L1 primitives) | **9.3** | Strong — ship with follow-ups logged |
| U1 — WL-P2-64 + select-shape test suite | B (hermetic recorder idiom) | **9.7** | Gold |
| U3 — shared tooltip L1 consolidation | A (theming/UI primitive conformance) | **9.7** | Gold with routed follow-up |

**U2 detail (dominant unit):** D1 9.5 (headless keyboard traces ×2, live-DOM AABB, real export
bytes ×2, runtime smoke — matrix §2 "run/render, not compiles") · D2 10 (no new exposed path;
no-leak type-encoded + banned-key tests, select pinned scalar-only) · D3 8.5 (fallow: `TechniqueGraph`
539 lines, node-render arrow 84 lines — named split candidate; changed-scope avg cyclomatic 1.9) ·
D4 9 (precedent citations; comments only where non-obvious) · D5 8.5 (changed-scope MI 91.2 > repo
89.5; single-file concern accumulation named) · D6 9.5 (derive memoized off the pan hot path;
single query) · D7 9.5 (L1 tooltip reused not forked; layoutId precedent mirrored; no uninventoried
primitive). Weighted 9.25; **no cap applies** (§4 — behavior proven unchanged, verification
credible). Session-diff composite ≈ **9.4 — Strong** (§5: ship with named follow-ups logged).
**Apple/Facebook verdict:** defensible in review; the one gap to gold is `TechniqueGraph` component
size/coverage debt — a split refactor is its own future lane, out of tonight's no-new-scope lock.
**Fallow delta (bow-in → close):** maintainability 89.5→89.5 · dupes 22,445 abs unchanged
(9.4%→9.3%) · +2 threshold findings (the new code, all named) · dead files/exports in diff scope
0.0%/0.0% · the 2 audit "dead-code" hits are repo-inherited dependency flags (`react-email`,
`react-dom`), untouched by this diff. No fallow-fix-loop escalation needed (delta flat-or-better,
per the locked close plan).

## Hostile close review

- **Giddy:** pass — module placement follows repo shape; D11 amended at the correct authority level
  (no ADR; watch: a second amendment makes hallmark governance ADR-worthy); trunk shape clean, all
  10 messages conventional, nothing to squash/split; merge-tree vs advanced origin/main
  (`5528c0c9`-era 0568 docs closes) = zero conflicts, zero file overlap with 0568 or the held
  G3-stack lanes; the batch strengthens the L1 layer (deleted a tooltip fork). Routed: WL-P3-53
  (export-subsystem extraction on next touch), WL-P3-54 (AABB layout-invariant unit test).
- **Doug:** pass — GO 9.7 (tests) · GO 9.6 (Wave 2, zero P1/P2) · GO-WITH-NOTE 9.6 (fix batch,
  zero batch P1/P2; three pre-existing P2s routed as WL-P2-65/66/67).
- **Desi:** pass — GO-WITH-CHANGES (zero P1; MEDIUM + accepted LOWs consumed by the fix batch;
  3 Cody deviations accepted; remaining live-verify items covered by Doug's browser pass or routed).
- **Kaizen aggregate:** 9.4/10 — code-quality composite (weakest unit 9.3, no caps); the gap to
  gold is the named `technique-graph.tsx` size/coverage debt, routed not hidden.

## ADR / ubiquitous-language check

- ADR update **not required**: ADR 0046 remains the authoring/gating canon (untouched); the D11
  amendment is a scoped governance edit recorded where D11 lives (hallmark preamble + epic §7 row),
  not a new architectural decision — Giddy's ruling folded below. ADR 0044 (scrollytelling/motion
  posture) confirmed valid (no Lenis; motion/react only).
- Ubiquitous language update **not required**: no new domain terms — `TechniqueNodeTooltip` is a
  DTO name inside the existing technique vocabulary.

## Reflections

- **The audit premise was wrong by 10×** — the "~6 colliding nodes" estimate from screenshots became
  67 real AABB pairs once measured. The lesson repeats 0546's ("real data invalidated the first
  assumption"): measure before scoping a data fix, and give Cody detector-driven done-means
  ("detector proves zero") rather than counts — that's what let him escalate honestly instead of
  silently under-delivering.
- **Class presence is not behavior.** `motion-reduce:animate-none` sat in the shared array and in
  the live DOM while the animation still ran — only Doug's emulated-reduce computed-style probe
  caught it. Conformance greps and class assertions are necessary but not sufficient for a11y
  claims; the WL-P2-66 row encodes the computed-style verification requirement.
- **The D11 collision was the grill working as designed.** The operator asked for something a
  ratified rule banned; surfacing the rule + its why (palette leakage) produced a narrow amendment
  (audit-only) instead of either silent obedience or silent violation — rules-carry-their-why paying
  off in one question.
- **Second session-limit interruption in this lane, second lossless recovery** — both because work
  was committed before the wave started. Commit-early discipline is the real mitigation; recorded in
  incidents.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0569 frontmatter closed + dated 2026-07-18, `claude-session-0569`; ledgers stamped in-row (SESSION_0569 citations). |
| Backlinks/index sweep | SESSION_0569 row added to wiki index; G-013/G-020, WL-P2-64–67, WL-P3-53/54, incidents row all cite SESSION_0569. |
| Wiki lint | `bun run wiki:lint`: 0 errors / 56 warnings (warnings pre-existing). |
| Kaizen reflection | Present — 10× measurement lesson, class-presence≠behavior, D11 grill, commit-early. |
| Hostile close review | Giddy pass · Doug pass (9.7/9.6/9.6) · Desi pass — section above. |
| Code-quality gate | 9.4/10 composite (REVIEW_04); no cap triggered. |
| Runtime verification | Live-DOM AABB, keyboard traces ×2, real PNG exports ×2, tooltip timing/no-media probe, SSR sweeps — REVIEW_02/03 + Verification table. |
| Review & Recommend | Next-session block written (C4 + WL-P2-67 + D-4 slice; WL-P2-65/66 candidates). |
| Memory sweep | `skills-vendor-and-brand-skins` memory + MEMORY.md hook updated (D11 amendment, G-020). |
| Next-session unblock check | Unblocked — no blocker beyond the push gate; 0568 already closed on main, zero overlap. |
| Git hygiene | 10 lane commits + this docs-close commit on `session-0569-technique-graph`; worktree clean after; NOTHING pushed (gate held). |
| Graphify update | Deferred to the canonical checkout post-merge (worktree graph reads 0 nodes by design; canonical refresh at merge time). |
