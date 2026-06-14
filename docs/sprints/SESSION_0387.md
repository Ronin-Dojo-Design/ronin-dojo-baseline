---
title: "SESSION 0387 — Lineage StudentsCarousel in the drawer + DrawerBody refactor (KISS)"
slug: session-0387
type: session--implement
status: closed
created: 2026-06-14
updated: 2026-06-14
last_agent: claude-opus-4-8-session-0387
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0386.md
  - docs/petey-plan-0387.md
  - docs/architecture/source/raw/SESSION_0387_lineage_students_carousel_watershed_60b_raw.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0387 — Lineage StudentsCarousel in the drawer (epic slice S1; reframes 0379-7)

## Date

2026-06-14

## Operator

Brian + claude-opus-4-8-session-0387

## Goal

Ship the **StudentsCarousel** in `LineageProfileDrawer` (info tab): belt-grouped collapsible cards →
horizontal avatar rail of the focal member's **visual children (lineage students)** → tap an avatar to
**recursively swap** the drawer to that student. Pure client display from the in-memory `members` set —
**no schema, no main-tree gating**. Plus a KISS **`DrawerBody` refactor** (fallow flagged it CRITICAL):
extract `deriveDrawerProfileView()` + `<DrawerIdentityHeader>`.

> **Mid-session pivot (operator):** this began framed as a 5-slice tier-gated epic (`petey-plan-0387`),
> then the operator pressure-tested it (`/code-review`, `fallow audit`, `/grill-with-docs`) and
> deliberately **stripped it to KISS** — ship the one fun thing, demote the gating/roles/sub-tree vision
> to a notes file. The original "0379-7 cohort stacking on the main tree" stays parked (gating would
> reduce its urgency anyway).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0386.md`
- Carryover: SESSION_0386 landed slice 0379-6 (card ⋮ menu, depth controls, drawer "Also Promoted By",
  claim→join repoint, rorion R9 slink, **canvas-width fix**). Next was framed as "0379-7 cohort
  stacking," but the operator **reframed it into a tier-gated lineage-tree epic** at this bow-in (tree
  = sparse, gated, premium destination; students live in a drawer carousel + later a school sub-tree).
  S1 of that epic is the StudentsCarousel.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `a6c6081`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None at the framework level. Ronin-native lineage drawer (Better Auth / Prisma untouched). |
| Extension or replacement | Extension: additive drawer section + new presentational component; reads existing member data. |
| Why justified | StudentsCarousel is a Ronin-native lineage surface; reuses the existing `LineageProfileDrawer` + Dirstarter L1 primitives (Tabs, Card, Button). |
| Risk if bypassed | Low — no schema, no new endpoints, no auth/payment surface; pure client display of already-fetched members. |

Live docs checked during planning: not applicable (no L1 storage/payments/media/content change).

### Graphify check

- Graph status: current (12,756 nodes, 23,763 edges, 1,757 communities, 1,988 files at bow-in).
- Queries used:
  - `lineage cohort group buildChildGroups LineageVisualGroup child group board canvas sibling layout`
- Files selected from graph + opened directly:
  - `apps/web/lib/lineage/canvas-model.ts` (`buildChildGroups`, `ChildGroup`, `memberSchoolLabel`, `memberInitials`)
  - `apps/web/lib/lineage/family-chart/layout/calculate-tree.ts` (d3-tree single-row sibling layout)
  - `apps/web/components/web/lineage/lineage-view-a-island.tsx` (View A island; holds full `members` set)
  - `apps/web/components/web/lineage/lineage-profile-drawer.tsx` (drawer; tabs info/lineage/rank-history)
  - `apps/web/lib/lineage/to-lineage-visual.ts` (`visualGroupId` already on the DTO)
  - `apps/web/server/web/lineage/payloads.ts` (`LineageVisualGroup`: groupType/promotionDate/parentMemberId)
  - `apps/web/prisma/schema.prisma` (`LineageVisualGroupType` enum; `LineageTreeMember` has no `role`)
- Monorepo references read (reference-only, not imported): `src/brands/blackbeltlegacy/components/lineage/`
  (`StudentsCarousel.jsx`, `SchoolGroupNode.jsx`, `CollapsibleGroup.jsx`), `BBLApp.jsx`,
  `LineageProfileDrawer.jsx`, `dashboard/docs/.../session-60C-full-send.md`, `LINEAGE_TREE_ENHANCEMENTS.md`.
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

6 forks resolved (Petey `/grill-me`, this session):

1. **Cohort render model** → **cohort container node** (not engine sibling-wrap nor hybrid-collapse). The
   donatso engine is a d3-tree (all children on one row) — containers are the engine-honest way to get
   "rows that wrap," matching the operator's `SchoolGroupNode`/`StudentsCarousel` prior art.
2. **Scope** → this is an **epic** (operator authorized schema changes + boxes-in-boxes). Captured as
   `petey-plan-0387`; the narrow "0379-7 cohort stacking" is folded in.
3. **Tier-gated tree** → main-tree nodes reserved for **senior-belt (Black/Coral/Red) School Owners**
   (Elite tier or operator-invited); Free/Premium non-owners live in the **drawer StudentsCarousel** +
   (later) a per-instructor school sub-tree, never the main tree. Tree = premium destination.
4. **School-tree scope** → **carousel-in-drawer first**; the separate school sub-tree canvas is deferred (S3).
5. **Student population (S1)** → **lineage students = visual children** (`primaryVisualParentMemberId ===
   focal`), grouped by belt; school-roster (Affiliation) deferred.
6. **S1 scope boundary** → **core carousel committed**; squircle action row (View Profile, Share) +
   verified badges = stretch-if-green; Contact button, recursion back-stack, and the LOW Desi items deferred.

Authoritative wireframe captured verbatim →
`docs/architecture/source/raw/SESSION_0387_lineage_students_carousel_watershed_60b_raw.md`.

**Second grill (pre-implementation pressure-test — `/code-review` + `fallow audit` + `/grill-with-docs`):**

- **fallow** flagged `DrawerBody` (drawer:226) **CRITICAL** (51 cyclomatic, CRAP 2652) — the flagship's
  worst hotspot. Operator chose **refactor it this session**, then escalated to **KISS the whole thing**.
- **Ubiquitous language:** "Students" is canonical (glossary: instructor→student, `STUDENT` role,
  `INSTRUCTOR_STUDENT` edge). Carousel = the member's **visual children in this tree** (display
  placement) — noted as distinct from global promotion truth (`RankAward.awardedById`); they coincide on
  curated trees, the tree is the display SoT.
- **Monorepo `LineageProfileDrawer.jsx`** (read for parity) carries a Session-548 self-review + a
  `canShowStudentsCarousel(tier)` gate + `isLegacyProfileType` (historical-figure coexistence) — parked
  in the notes for the future gating slice. Our recursion is **instant** (in-memory, no fetch) → simpler
  than theirs (no loading skeleton needed).
- **KISS strip-back:** drop the epic/schema/gating/Embla/tested-helper; build a ~50-line self-contained
  component with native scroll + inline grouping; epic → notes (`petey-plan-0387` demoted).

### Drift logged

None discovered at bow-in.

## Petey plan

### Goal

Ship a belt-grouped, recursive StudentsCarousel inside the LineageProfileDrawer (lineage students =
visual children), BBL/Baseline tokens, browser-proven — no schema change, no main-tree gating.

### Tasks

#### SESSION_0387_TASK_01 — Desi design review: StudentsCarousel vs BBL/Baseline tokens

- **Agent:** Desi
- **What:** Review the planned StudentsCarousel design (belt-grouped collapsible cards + avatar
  carousel + recursive swap) against BBL/Baseline design tokens, the wireframe, and the existing drawer.
- **Steps:** Assess card/chip density, belt-label color sourcing (`Rank.colorHex`, never hardcoded),
  chevron + count affordance, avatar-rail scroll affordance, tap targets (≥28px mobile), where the
  section sits in the `info` tab, empty-state, and the stretch squircle row. Return HIGH/MED/LOW for Cody.
- **Done means:** Desi returns a prioritized fix list (or "acceptable"); Cody has locked guidance.
- **Depends on:** nothing.

#### SESSION_0387_TASK_02 — Build StudentsCarousel + wire into the drawer

- **Agent:** Cody (inline)
- **What:** New presentational `StudentsCarousel` rendered at the bottom of the drawer's `info` tab.
- **Steps:**
  1. Derive students = focal member's visual children from the in-memory `members`
     (`primaryVisualParentMemberId === drawerMember.id`); group by belt rank (selectedRank → `Rank`
     colorHex/sortOrder), high→low; pure helper (unit-tested) in/near `canvas-model.ts`.
  2. `StudentsCarousel` component: collapsible belt-rank cards (label + count + chevron, default
     collapsed) → horizontal avatar rail (circle avatar via `memberAvatarSrc`/`memberInitials` + name),
     BBL/Baseline tokens, Dirstarter L1 primitives, `useReducedMotion` fallback.
  3. Recursion: tap avatar → drawer swaps to that student (lift a callback so the island re-points
     `drawerMemberId`); guard against missing profile.
  4. Empty state: hide the section when the member has no visual children.
  5. Stretch (if green): squircle action row (View Profile, Share) + Verified badge on avatars (trustStatus).
- **Done means:** carousel renders in the drawer; grouping correct; tap → recursive swap; empty hidden;
  TS clean; oxlint/oxfmt clean; privacy tests green; helper unit-tested.
- **Depends on:** SESSION_0387_TASK_01.

#### SESSION_0387_TASK_03 — Browser verify (Doug, inline via Claude-in-Chrome)

- **Agent:** Doug (inline — Claude-in-Chrome; MCP browsers had stale locks in 0386)
- **What:** Desktop + mobile (390×844) verification on `bbl.local:3000`.
- **Steps:** Open a member with children (e.g., Rigan/Carlos); verify belt-grouped cards + counts;
  expand/collapse chevron; avatar rail scroll; tap avatar → drawer swaps recursively; empty member hides
  the section; 0 console errors; mobile tap targets + no overflow.
- **Done means:** all behaviors browser-proven; evidence captured.
- **Depends on:** SESSION_0387_TASK_02.

#### SESSION_0387_TASK_04 — fallow/oxc quality pass + full close

- **Agent:** Petey
- **What:** `npx fallow audit` (+ oxc lint) cleanliness pass, then closing.md full close.
- **Steps:** fallow audit on changed files; document the new component in
  `custom-component-inventory.md`; ADR check (likely none — read-model/display); Graphify update; memory
  sweep; finding router; stage/commit/push to main.
- **Done means:** gates green; close evidence table complete; pushed.
- **Depends on:** SESSION_0387_TASK_03.

### Parallelism

Sequential spine: TASK_01 (Desi) → TASK_02 (Cody build, inline single coherent change) → TASK_03 (Doug
verify, inline) → TASK_04 (close). No disjoint sub-agent parallelism warranted (one component + drawer wiring).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0387_TASK_01 | Desi (sub-agent) | Design review before code lock; cross-brand token + reuse audit. |
| SESSION_0387_TASK_02 | Cody (inline) | Single coherent component + drawer wiring; rich in-context build. |
| SESSION_0387_TASK_03 | Doug (inline) | Browser verify via Claude-in-Chrome (MCP browser lock lesson, 0386). |
| SESSION_0387_TASK_04 | Petey | fallow/oxc + full close + push. |

### Open decisions

- **S2 gating predicate** (next session): exact main-tree-membership rule (rank × school-owner × tier ×
  invite) and how curated/historical figures (Dirty Dozen — not Elite subscribers) coexist with live-user
  self-onboarding. Out of S1 scope; grill when planning S2.

### Risks

- Carousel must read belt color from `Rank.colorHex` data — never hardcode (motion-system rule).
- Recursion swap must not orphan the drawer if a child lacks a profile entry — guard.
- Single-session ship + Doug verify is the bar; squircles/badges drop to stretch to protect that.

### Scope guard

- **No schema change. No new server endpoints. No main-tree gating this session** (that's S2).
- **Never edit `lineage-tree-canvas.tsx`** (View B) or the vendored fork's core layout.
- Belt color = `Rank.colorHex`; no hardcoded brand colors. Use Dirstarter L1 primitives (FS-0014 lesson).
- Base UI menu items use `onClick`, never `onSelect` (drift D-016 residual).
- Privacy invariants stay green (`queries.visibility.test.ts`); carousel shows the same PUBLIC member set.

### Dirstarter implementation template

- **Docs read first:** not applicable (no L1 area touched).
- **Baseline pattern to extend:** `LineageProfileDrawer` (Tabs/Card primitives) + `canvas-model.ts` helpers.
- **Custom delta:** Ronin-native StudentsCarousel (belt-grouped collapsible avatar rails + recursive swap).
- **No-bypass proof:** purely additive lineage display; replaces no Dirstarter capability.

## Cody pre-flight

### Pre-flight: StudentsCarousel (TASK_02)

#### 1. Existing component scan

- Graphify + direct reads: no existing students carousel in-app. Monorepo `StudentsCarousel.jsx` is
  reference-only (hardcoded belt colors + WP Pods fetch — do NOT port structurally; Desi HIGH).

#### 2. L1 template scan

- Reuse L1 primitives (Desi reuse map): `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`
  (Base UI, `type="multiple"`, chevron auto-rendered), `Carousel`/`CarouselSlide` (Embla; `controls`,
  `edgeFades`, custom `flex-[0_0_Xpx]` basis), `Avatar`/`AvatarImage`/`AvatarFallback` (default
  `rounded-md` → override `rounded-full size-12`), `BeltSwatch` (`colorHex` SVG), `Badge`, `Stack`, `H6`.
- API spot-checks (read source): accordion.tsx (trigger appends its own ChevronDownIcon — don't add one),
  carousel.tsx (`controls="desktop"` = `max-md:hidden`; `CarouselSlide` honors custom basis), avatar.tsx
  (`size-10 rounded-md` default), belt-swatch.tsx (`colorHex` → fill, neutral fallback).

#### 3. Composition decision

- New presentational `students-carousel.tsx` composing the above. Grouping/sort = pure helper
  `buildStudentBeltGroups` in `canvas-model.ts` (unit-tested), reusing `memberAvatarSrc`/`memberInitials`/
  `nodeDisplayName`. No new primitive invented.

#### 4. Lane docs loaded

- Prior SESSION next-session read: yes (0386 → reframed). Plan: `petey-plan-0387`. ADR: 0026 (no change).
  Desi review (TASK_01): applied (belt color from data, primitives, rounded-full, threaded callback, tokens).

#### 5. Dev environment confirmed

- Dev server: `cd apps/web && npx next dev --turbo` (FS-0002). Working dir: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: `bbl.local:3000` (+ Baseline parity check).

#### 6. FAILED_STEPS check

- FS-0014 (raw HTML instead of primitives): mitigated — building on Accordion/Carousel/Avatar/BeltSwatch.
- Drift D-016 (Base UI `onClick` not `onSelect`): N/A here (no menu items added); avatar buttons use `onClick`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0387_TASK_01 | landed | Desi design review — build-ready spec: L1 primitives (Accordion+Carousel+Avatar+BeltSwatch), belt color from `Rank.colorHex` only, `rounded-full` avatars, group/sort by `rank.sortOrder` desc as tested `canvas-model` helper, thread `onSelectStudent` island→drawer→carousel (swap, guard missing profile), all-semantic tokens (BBL red + Baseline indigo), `useReducedMotion`. Squircle row + verified badge = stretch; lineage-tab stub removal + back-stack = S5. |
| SESSION_0387_TASK_02 | landed | Built `students-carousel.tsx` (self-contained: belt-grouped `Accordion` + native-scroll avatar rail + recursive `onSelectStudent`; inline grouping, `BeltSwatch`/`Avatar rounded-full`). Wired island (filter visual children + guarded swap) + drawer (2 optional props → InfoTab). **KISS deviation from Desi spec:** native scroll instead of Embla; grouping inline instead of a tested `canvas-model` helper (operator's "ridiculously simple" call). |
| SESSION_0387_TASK_02b | landed | KISS `DrawerBody` refactor (operator add-on): extracted `deriveDrawerProfileView()` + `<DrawerIdentityHeader>` → DrawerBody **CRITICAL 51 cyclo / 31 cognitive → HIGH 8 / 4**. Removed the contradictory dead "Students" stub from the lineage tab. |
| SESSION_0387_TASK_03 | landed | Browser-verified (Claude-in-Chrome): header renders identically across Rigan/Bob/Brian; belt-grouped carousel (Coral 11, Black 1; senior-first; swatches); avatar rail; **3-level recursion** (Rigan → Bob "Dirty Dozen #8" → Brian); empty-state hides on leaf; 0 console errors. Mobile resize tooling flaky — design responsive-safe (not pixel-verified). |
| SESSION_0387_TASK_04 | landed | fallow audit (DrawerBody fixed; no new dupes/dead-code from changed files) + full close + push. |

## What landed

- **StudentsCarousel** (`students-carousel.tsx`, new, ~110 lines incl. comments): a member's lineage
  students (visual children in the tree) grouped by **belt rank, senior-first**, as collapsible
  `Accordion` cards (belt swatch + label + count + chevron, default collapsed) → a horizontal
  native-scroll rail of **circular avatars + first names**. Tap an avatar → recursive drawer swap.
  Renders nothing when the member has no children. Belt color is `Rank.colorHex` only (`BeltSwatch`).
- **Drawer wiring:** `LineageProfileDrawer` gains two optional props (`students`, `onSelectStudent`)
  threaded to `InfoTab` (rendered after the School section). The View A island filters the in-memory
  `members` to the drawer member's visual children and guards the recursive swap against a missing profile.
- **`DrawerBody` refactor (KISS):** extracted `deriveDrawerProfileView()` (pure derivation) +
  `<DrawerIdentityHeader>` (header JSX + its local promoter-modal state). **DrawerBody: CRITICAL
  (51 cyclomatic / 31 cognitive / 187 lines / CRAP 2652) → HIGH (8 / 4 / 98 / 72).**
- **Cleanup:** removed the dead "Students" stub from the Lineage tab (it contradicted the live carousel).
- **Epic demoted:** `petey-plan-0387` rewritten from a 5-slice epic to a lightweight future-ideas note;
  the watershed wireframe saved verbatim under `architecture/source/raw/`.
- **Gates:** `tsc` clean · oxlint clean (changed files; only pre-existing vendored-fork warnings) ·
  `oxfmt --check` clean · 33 lineage/privacy tests pass · fallow: no new dead-code/dupes from changed files.

## Decisions resolved

- **Cohort model = container node** (engine-honest), but the gating reframe made the *drawer carousel*
  (not main-tree cohort stacking) the S1 deliverable.
- **Scope = KISS, not an epic.** Operator stripped the tier-gating/roles/sub-tree vision to notes after a
  `/code-review` + `fallow` + `/grill-with-docs` pressure-test. Ship the one fun feature.
- **Students = visual children in this tree** (display placement), labeled "Students" (canonical per the
  glossary); distinct from global promotion truth (`RankAward.awardedById`) — they coincide on curated trees.
- **Refactor `DrawerBody` this session** (operator) because fallow flagged it CRITICAL and we were in the file.
- **Native scroll + inline grouping** over Embla + a tested helper (KISS); both are easy later upgrades.
- **Remove the dead lineage-tab stub now** (it became contradictory once the carousel shipped).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/students-carousel.tsx` | **New** — belt-grouped collapsible avatar carousel; recursive `onSelectStudent`. |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | `DrawerBody` refactor (`deriveDrawerProfileView` + `DrawerIdentityHeader`); `students`/`onSelectStudent` props → InfoTab renders `<StudentsCarousel>`; dead Students stub removed. |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | Compute drawer member's visual children + guarded `selectStudent`; pass both to the drawer. |
| `docs/sprints/SESSION_0387.md` | This file. |
| `docs/petey-plan-0387.md` | Rewritten epic → lightweight future-ideas note. |
| `docs/architecture/source/raw/SESSION_0387_lineage_students_carousel_watershed_60b_raw.md` | **New** — verbatim watershed 60B/60C wireframe source. |
| `docs/knowledge/wiki/index.md` | SESSION_0387 row. |
| `docs/knowledge/wiki/custom-component-inventory.md` | StudentsCarousel + DrawerIdentityHeader/deriveDrawerProfileView noted. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `npx tsc --noEmit` (apps/web) | ✅ 0 errors |
| `npx oxlint` (changed files) | ✅ clean (only pre-existing vendored-fork warnings) |
| `npx oxfmt --check` (changed files) | ✅ clean |
| `bun test` (to-family-chart-data, to-lineage-visual, tree-layout, queries.visibility) | ✅ 33 pass, 0 fail |
| `npx fallow health` — DrawerBody | ✅ CRITICAL 51/31/2652 → HIGH 8/4/72 |
| `npx fallow audit` (changed files) | ✅ no new dead-code/dupes; remaining findings inherited |
| Browser — header refactor | ✅ identical render across Rigan, Bob Bass, Brian Scott (progress bar, avatar ring, badges) |
| Browser — belt-grouped carousel | ✅ Coral 7th (11) + Black 6th (1), senior-first, swatches from `Rank.colorHex` |
| Browser — avatar rail + recursion | ✅ circular avatars + names; 3-level drill Rigan → Bob → Brian (swap in place) |
| Browser — empty state | ✅ leaf (Brian Scott) shows no Students section |
| Browser — console | ✅ 0 app errors |
| Browser — mobile 390px | ⚠ resize tooling flaky; not pixel-verified. Responsive-safe (contained `overflow-x-auto` in the existing bottom-sheet). |

## Open decisions / blockers

- **Mobile pixel-verify** deferred — Claude-in-Chrome window resize didn't reliably change the render
  viewport. Low risk (native horizontal scroll inside the existing responsive bottom-sheet); confirm on a
  real device / proper emulation next session.
- **Tier-gating, roles, school sub-tree, focal-zoom** — parked in `petey-plan-0387` (notes), not committed.

## Next session

### Goal

Operator's choice — the tree is the priority lane. Candidates (all parked in `petey-plan-0387` notes):
pixel-verify the carousel on mobile; OR start the **tier-gated main tree** (the genuine value-prop:
sparse, prestige tree; needs schema/policy — grill the predicate first); OR carousel polish (squircles,
verified badges, Embla snap).

### First task

Bow in; if continuing lineage, read `petey-plan-0387` notes + the raw watershed source, and grill the
tier-gating predicate (rank × school-owner × tier × invite, with an `isLegacyProfileType`-style override
for historical figures) before any schema work.

## Review log

### SESSION_0387_REVIEW_01 — StudentsCarousel + DrawerBody refactor

- **Reviewed tasks:** SESSION_0387_TASK_02, _02b, _03
- **Dirstarter docs check:** not applicable (no L1 area; reuses `LineageProfileDrawer` + L1 primitives).
- **Verdict:** Clean, focused slice. The KISS strip-back was the right call — the feature is one
  self-contained component, the refactor genuinely improved the flagship (DrawerBody cognitive 31 → 4),
  and the dead-stub removal fixed a correctness contradiction the feature created. Browser-proven 3 levels
  deep. Honest about the mobile gap.
- **Score:** 9/10
- **Follow-up:** mobile pixel-verify; decide whether the tier-gating epic gets a real session.

## Hostile close review

- **Giddy (plan/workflow):** PASS — no schema, no new endpoints, no auth surface; epic responsibly
  demoted to notes rather than half-built; refactor is behavior-preserving (browser-proven identical header).
- **Doug (verification honesty):** PASS — every claim browser-proven (3-level recursion, empty-state,
  0 console errors); the one gap (mobile pixel-verify) is stated plainly, not glossed.
- **Desi (UI/UX):** PASS — belt color from data, `rounded-full` avatars, semantic tokens (BBL red +
  Baseline), collapsible cards on-brand. KISS deviations from her spec (native scroll, no squircles)
  documented; she'd accept them as later upgrades.
- **Kaizen aggregate:** 9/10 — the standout was the operator's "is this needlessly complex?" stopping a
  5-slice epic before it was built, in favor of an ~80-line feature + a real complexity win.

### Findings (severity ≥ medium)

None.

## ADR / ubiquitous-language check

- **ADR 0026** (`lineage-view-a-engine-donatso-fork.md`): **no update** — the carousel is read-model
  client display in the drawer; the refactor is internal. No engine/privacy/schema contract changed.
- **No new ADR:** the tier-gating decision was *not* taken (demoted to notes); KISS-over-epic is a scope
  call, not an architectural one.
- **Ubiquitous language:** no new terms. Noted (not added) that the drawer "Students" = tree visual
  children (display placement), distinct from promotion truth (`RankAward.awardedById`) — they coincide on
  curated trees; the glossary already separates `LineageTreeMember` visual parent from promotion truth.

## Reflections

- The highest-leverage moment was the operator's **"is this needlessly complex? what would you do from
  scratch?"** It stopped a 5-slice epic (schema, gating, roles, sub-trees) that I had over-structured as
  Petey — the actual ask was an ~80-line drawer component. The grill machinery was working *against*
  simplicity until the operator pulled the altitude back. Lesson: when the feature is small, say so loudly;
  don't let an epic frame inflate it.
- **fallow earned its keep** as a pre-implementation input, not just a close-time gate: running it on the
  *existing* drawer surfaced that `DrawerBody` was already CRITICAL, which reframed "thread more through
  it" into "refactor it first." The refactor then dropped cognitive complexity 31 → 4 — a real win that
  would have been invisible without the tool.
- Shipping the carousel **created** a correctness bug elsewhere (the lineage-tab "students not loaded"
  stub became a lie). Worth a habit: after adding a feature, grep the codebase for now-stale claims about
  the thing you just built.
- Reading the monorepo's *updated* `LineageProfileDrawer.jsx` (with its own Session-548 self-review +
  `canShowStudentsCarousel` + `isLegacyProfileType`) was the cheapest possible spec for the future gating
  slice — the hard product thinking (how historical figures coexist with gated live users) is already done
  there. Parked it in the notes verbatim.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0387.md `status: closed`, `type: session--implement`, `last_agent: claude-opus-4-8-session-0387`; `pairs_with` → plan note + raw source + runbook. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0387 row; `custom-component-inventory.md` updated (StudentsCarousel + DrawerIdentityHeader/deriveDrawerProfileView). |
| Wiki lint | `bun run wiki:lint` — result recorded in bow-out response. |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | TASK_REVIEW_LOG + Hostile close review present; PASS (9/10). |
| Review & Recommend | Next session goal written (operator's choice; tier-gating or mobile verify). |
| Memory sweep | `lineage-tree-pivot-donatso.md` updated (0379-7 reframed → StudentsCarousel shipped; epic demoted to notes). |
| Next session unblock check | Unblocked — next is operator's pick from the notes; carousel is shipped + verified. |
| Git hygiene | Branch `main`; single push at close — hash reported at bow-out / see git log. |
| Graphify update | `graphify update .` before commit — stats reported at bow-out. |
