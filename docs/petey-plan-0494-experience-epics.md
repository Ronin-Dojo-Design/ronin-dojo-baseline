---
title: "Petey Plan 0494 — experience epics: hardening loop → lineage journey → mobile shell"
slug: petey-plan-0494
type: petey-plan
status: staged
created: 2026-07-03
updated: 2026-07-03
last_agent: claude-session-0495
pairs_with:
  - docs/sprints/SESSION_0494.md
  - docs/sprints/SESSION_0493.md
  - docs/petey-plan-0493-community-feed-and-profile-timeline.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0042-canonical-blog-surface-post-over-contentatom.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0494 — experience epics

Planned live with the operator (SESSION post-0493, phone-bound / post-surgery), Petey orchestrating.
Grounded by three parallel Explore surveys (apps/web nav+MAB · BBLApp parity source · shipped ancestry
timeline). Operator wants **Fable 5** on the creative A work.

**Execution sequence (operator-ruled): C → A → B.** 0494 = **C** (harden shipped) then **A** (the Lineage
Journey). **B** (mobile shell) follows in 0495. Both A and B run *through* the operating loop below — that
loop is not a third epic, it's the method (the operator's "score the shipped slice" is its pass 0).

═══════════════════════════════════════════════════════════════════════════════════
## ⛔ HARD BOUNDARY (read first)
═══════════════════════════════════════════════════════════════════════════════════

- **Push gate is the operator's.** Build + verify + show, hold for the explicit "go" ([[explicit-push-authorization]]).
- **Schema-touching slices** (A founder data-model, any B model) → **hand-author the migration + `migrate diff`
  shadow-replay to author; NEVER `migrate dev`** (shared local DB auto-reset landmine). Apply via `migrate deploy`
  only when additive + no divergent lane live ([[parallel-session-shared-db-migrate-dev-reset-trap]]).
- **Reuse-first** (Cody pre-flight): the repo already has `motion/react` v12, `lib/haptics.ts`, `BeltSwatch`,
  the polymorphic `Bookmark`, and the `can()` capability system. **Do not build a 5th authz system** — map
  BBLApp's `roleTierMapper` concepts onto `can()`.
- **Reduced-motion is mandatory** on every scroll/animation slice (`useReducedMotion()` fallback), and every
  timeline change must stay **SSR-safe** (ships visible pre-hydration, as the shipped timeline already does).

═══════════════════════════════════════════════════════════════════════════════════
## THE OPERATING LOOP (the method A & B both run through)
═══════════════════════════════════════════════════════════════════════════════════

Petey holds the baton. Doug is held to the end.

```
ROUND = Desi (rubric /10 per page + per component/section → improvement notes)
      → Cody (implements the notes)
      → Giddy (architecture / Dirstarter-compliance score)
      → back to Desi
GATE  = after pass 1 + pass 2 → if aggregate ≥ 9.5 ACCEPT
        else ONE more pass (pass 3) → then report state regardless
FINAL = Doug verifies ONLY once ≥9.5 or 3 passes spent
        (gates + failure-mode + migration rehearsal + live UAT)
```

- Rubric = the repo `code-quality-matrix.md` (/10 + Class A/B/C + hard caps); `/code-quality` +
  `/fallow-fix-loop` feed Desi's evidence. `/pr-fix-loop` = no-op (0 open PRs).
- **Hard cap: 3 passes.** No infinite loop — after pass 3 we ship what we have + log the remainder.
- Desi reviews **live SSR** (headless browser), not just source.

═══════════════════════════════════════════════════════════════════════════════════
## EPIC C — Feed + component-library hardening (FIRST · 0494)
═══════════════════════════════════════════════════════════════════════════════════

**Goal:** run the operating loop on the just-shipped `/posts` community feed **and** the shared component
library, so rubric fixes propagate everywhere at once. Bank the quality wins before new build.

**Scope (operator-ruled "feed + component library"):**
- `/posts` community feed — **full harden** (mobile filter/sticky, empty-state, create flow, vote-ready).
- Shared component library audit against the rubric: `ListingCard` family, buttons, `BeltSwatch`,
  `nav-sheet`, the community-feed FAB, `Section`/card shells.
- Timeline = **baseline score only** (A rebuilds it — do NOT polish twice). Desi's pass-0 score of the
  current timeline becomes A's opening rubric.

**Slices (vertical, each shippable):**

| Slice | Ships |
|---|---|
| **C0** Pass-0 baseline | Desi rubric snapshot of `/posts` + component library + current timeline (the A handoff score) |
| **C1** Feed harden | Fix the P2 batch already logged from 0493 (mobile filter/sticky, hero count, form hints, native-share hide, red-name contrast) + Desi round findings on `/posts` |
| **C2** Component-library sweep | Rubric fixes on shared cards/buttons/`BeltSwatch`/nav — propagate repo-wide; verify no visual regressions on consumers |
| **C3** Loop close | Passes to ≥9.5 (max 3) → Doug verify → report |

**Forks to grill:** none blocking — C mechanics are locked (loop above, 3-pass, 9.5 gate). Desi decides
component-audit depth within the pass budget.

═══════════════════════════════════════════════════════════════════════════════════
## EPIC A — "The Lineage Journey" (scrollytelling · 0494, after C)
═══════════════════════════════════════════════════════════════════════════════════

**Goal:** transform the shipped `/directory/[slug]` ancestry timeline into a scroll-driven cinematic
sequence. **Enhance, don't rip-and-replace** (it shipped 2026-07-03): scroll mode layers on; reduced-motion
falls back to today's stagger.

### The sequence — universal prologue + conditional bridge + the member (operator-refined)
Each scene: image starts **large** → shrinks + slides to **top-left** as it becomes the timeline node.

```
UNIVERSAL PROLOGUE (seeded; renders for everyone — the shared roots):
  Carlos Gracie Sr → Carlos Gracie Jr → Rorion Gracie → Rigan Machado
       (quote)          (quote)         (April-10 promo    (quote / coral-belt
                                         VIDEO: Rorion       ceremony clips)
                                         promotes Rigan)
                                            ↓
CONDITIONAL BRIDGE (driven by the member's walk — NOT always Bob):
  • descends from Bob Bass → Bob Bass scene (first American coral belt)
  • is/descends from another "dirty dozen" (April-10 crew, e.g. Erik Paulson)
      → that member's cinematic bridge scene (same treatment as Bob)
                                            ↓
                        RED full-screen wipe → shrinks to overlay
                                            ↓
            THE MEMBER — their pic · their instructor · a quote (from the walk)
```

- **Rorion Gracie added** to the universal prologue (he promoted Rigan); the operator's phone clip of the
  **April 10th Rorion→Rigan promotion** is that scene's video.
- **Rigan presenting coral belts to Erik Paulson + the April-10 crew** — pics (min) / clips feed the bridge
  scenes. (`prod-live-dirty-dozen.jpeg` in repo root may be a crew asset — confirm.)
- **Bridge is conditional on the walk:** prologue is universal; the bridge scene (Bob Bass or the relevant
  dirty-dozen member) renders only when the member descends from them — the ancestry walk already knows.
- Curated quotes (source-verify before ship): Carlos Sr — *"There is no losing in jiu-jitsu. You either win
  or you learn."* · Carlos Jr — *"My students are an extension of my family."* · Rigan — *"You have to put
  your sweat and blood to be honored to have the belt."* (Rorion + bridge quotes TBD.)

### Data model — FULLY DATA-DRIVEN + a storyboard admin CRUD (operator-ruled)
Whole chain editable; seed the founders, but the backend is **reusable so admin can add any instructor as a
scene**. Editorial scene fields on a **1:1 story record per node** (recommend a dedicated
`LineageStoryScene` table keyed by nodeId — keeps `LineageNode`/`Passport` lean). **Schema-touching →
hand-authored migration.**

- Fields per scene: `quote`, `quoteAttribution` (default = displayName), `heroImageUrl` (cinematic),
  `heroVideoUrl?`, `posterUrl?`, `storyBio?`, `sceneOrder?`, `isBridge?` + `bridgeCondition` (conditional
  render), `enabled?`.
- **Storyboard admin CRUD** (`/app`) — the fun part, **premium but lean**: a board of scene **cards**, each a
  compact field set (image/video drop, quote, bio, order); **duplicate-card** + **plus-button** to add scenes;
  drag to reorder. Simple, powerful, lightweight. A real slice, not a form.
- Founder chain nodes already exist (Tony Hua renders a 5-gen chain; 0493 backfilled 64 provenance edges).
- Project the fields into `LineageAncestryEntry` + `lineageNodeRowPayload`; extend the walk read-model
  (`server/web/lineage/ancestry.ts`) with the conditional-bridge selection — the walk algorithm is unchanged.

### Scroll engine — PROGRESSIVE VERSIONS (operator-ruled, bake-off)
- **v1 — `motion/react useScroll`** (reuse; no new dep; SSR-safe; reduced-motion idiom exists). Build first.
- **v2 — motion + basic Lenis** (one small dep for smooth-scroll momentum; evaluate vs v1).
- **v3 — GSAP ScrollTrigger** (heavier; lane stays open; richest pin/scrub, build when desired).
- Keep versions toggleable to compare, not bet.

### Slices (vertical, each shippable):

| Slice | Ships |
|---|---|
| **A0.5** StudentsCarousel V2 (FIRST · operator-added 0495) | Additive bake-off variant of `students-carousel.tsx` — see the dedicated section below. Builds the reusable **card + embla swiper + `layoutId` grow-into-drawer** that A's scenes AND the post-A featured-blog carousel both consume. |
| **A0** Story data model | 1:1 `LineageStoryScene` table + hand-authored migration; project into `LineageAncestryEntry`; conditional-bridge select in the walk; seed founders (Carlos Sr/Jr/Rorion/Rigan) + Bob |
| **A1** Storyboard admin CRUD | board of scene cards + duplicate + plus-button + reorder in `/app`; premium-lean; image/video drop |
| **A2** v1 scene scaffold | `motion/react useScroll`: node → scroll scene (large → shrink → slide top-left); reduced-motion = today's stagger |
| **A3** Red-wipe transition | full-screen red shrinks to overlay between prologue → member |
| **A4** Member finale scene | member pic + instructor + quote |
| **A5** Video scenes | Rorion→Rigan April-10 promo clip (self-hosted via media pipeline) + crew clips; muted autoplay + poster; ffmpeg web-prep |
| **A6** Conditional bridge | Bob Bass / dirty-dozen bridge renders per the member's walk |
| **A7** v2 Lenis pass | add Lenis; A/B vs v1 |
| **A8** Mobile perf + reduced-motion | simplified mobile variant; Safari jank pass; the loop's rounds |
| **A9** *(open lane)* v3 GSAP | ScrollTrigger version when desired |

### Slice A0.5 — StudentsCarousel V2 (operator-added SESSION_0495; Epic A opener)

An **additive bake-off variant** — the existing `apps/web/components/web/lineage/students-carousel.tsx`
stays untouched; V2 is a second option to compare live. **Parity target =** BBLApp
`ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/StudentsCarousel.jsx`. Port its
**gesture · behavior · feature**, NOT its chrome. (Captured in memory `epic-a05-students-carousel-v2-scope`.)

**IN — the operator's "baseball-card / ESPN-Fantasy-for-BJJ" treatment:**

- Bigger student **player cards**: avatar photo + full name + `BeltSwatch`/rank + **country flag** +
  **school logo** + **verified badge**. **NO premium badge** (dropped). Metaphor: photo + name + belt (position)
  + flag (nationality) + school logo (team) — like studying players in a fantasy app, for BJJ.
- Real **swiper** via our embla `Carousel`/`CarouselSlide` (`components/common/carousel.tsx`), not the current
  flat `overflow-x-auto` row.
- **Behavior:** tap a card → BBLApp's inline mini-preview → card **grows/morphs into the lineage profile
  drawer** via `motion/react` `layoutId` shared-element; **reduced-motion falls back to today's instant swap**.

**OUT — "not the content tabs":**

- ❌ BBLApp's search bar / belt-rank filter dropdown / Expand-All-Collapse-All (BBLApp Tier 3).
- ❌ No restructuring the drawer's internal content tabs — the morph lands in the EXISTING drawer, unchanged.
- ❌ No BBLApp `getStudentsByInstructor` client fetch — our students are server-loaded props.

**Keep our foundations:** awarded-truth `memberTopRank` (ADR 0035) over BBLApp's `rank.includes()` string-match;
`BeltSwatch` tokens; server-loaded data.

**Data dependency (read-model extension — NOT a schema migration):** project onto `LineageTreeMemberRow`
(`server/web/lineage/payloads.ts`): `isVerified` (have it), `countryOfOrigin` (→ flag; BBLApp uses a
`data/countries` + `getCountryByCode` util to port or match), and current school `name` + `logoUrl` (the
drawer's `InfoTab` already resolves `school.logoUrl` — project it onto the row). Lands with Epic A's planned
walk-read-model work.

**Reuse dividend:** the card + swiper + morph built here is consumed by A2–A6 scenes AND by the **featured-blog
posts carousel** (operator: YES, but AFTER Epic A so it reuses this swiper — blog has card+list today, no
carousel; the embla primitive already exists).

**Desi/Cody hand-off:** pass-0 Desi baselines the current `students-carousel.tsx` + scores V2 against the
"player-card" rubric; Cody builds V2 as the variant behind a toggle; runs the operating loop to ≥9.5.

### Assets (operator: images live in BBLApp / ronin-dojo-monorepo — Graphify available there)
- **Founder images (inventoried; monorepo `public/brand/blackbeltlegacy/images/`; canonical map =
  `lineageDataSource.js`):** Carlos Sr (`carlos-gracie-sr.jpg`), Carlos Jr (`carlos-gracie-jr.jpg`), Rigan
  (`Rigan-Machado.jpg`), Bob Bass (headshot + `Bob-Bass-Coral-Belt.png` + `Carlos-Bob-black-belts.jpg`) — all
  PRESENT → copy into `apps/web/public`. Dirty-dozen portraits present: Rick Williams, David Meyer, Chris
  Haueter, John Will, Renato Magno, Bill Hosken. **Rorion Gracie = the ONE gap** (no portrait) → extract a
  poster frame from the April-10 clip (ffmpeg) or operator supplies. Erik Paulson = school logo only.
- **Dirty Dozen content already exists** as a published blog `Post` ("The Dirty Dozen…", Tony Hua) with the
  group photo (R2 hero) + a "Bob Bass: Rigan's First Black Belt" section → bridge scenes **deep-link it**.
- **Video:** landing "Rigan video" is a YouTube embed; the 45 monorepo `.webm` are session-evidence, not
  lineage clips. The operator's **April 10th Rorion→Rigan promotion clip** is the only real founder video →
  self-hosted scene + Rorion poster frame.
- **ffmpeg APPROVED** (`brew install ffmpeg`) → Cody web-preps clips headlessly (trim/crop/compress/mute/
  poster/loop). Creative cuts still via CapCut / Rush if the operator prefers.

### Forks to grill (remaining)
1. **A-story-table shape** — confirm dedicated 1:1 `LineageStoryScene` keyed by nodeId (rec) vs columns-on-node.
2. **Storyboard CRUD depth** — MVP card set + duplicate + plus now, drag-reorder + media-drop fast-follow? (rec).
3. **Dirty-dozen roster + assets** — who in the April-10 crew needs a bridge scene; what pics/clips exist
   (is `prod-live-dirty-dozen.jpeg` the roster?).
4. **Rorion / bridge quotes** — source or operator-supplied.

═══════════════════════════════════════════════════════════════════════════════════
## EPIC B — Mobile shell: bottom nav + MAB (0495, after A)
═══════════════════════════════════════════════════════════════════════════════════

**Goal:** net-new mobile chrome — an always-on 5-tab **bottom nav** + a **floating movable radial MAB** —
wired to the logged-in user via `can()`. Feel informed by BBLApp (5-tab bottom nav + center-create →
bottom-sheet; **no** radial MAB — that's net-new). apps/web today has only a right-side hamburger drawer
(`nav-sheet.tsx`) + a single create-post FAB.

**Decisions (operator):** bottom nav **always on**; the radial MAB is **movable** (drag + persist position),
**Reddit-style**, and **user-toggle-able off**. Radial fan = **4 actions**, each role-gated via `can()`
(hidden if not permitted): **Claim/verify a person · Create Post · Upload photo/media · Log a promotion**.

**Slices:**

| Slice | Ships |
|---|---|
| **B0** Bottom nav bar | mobile-only 5-tab (Home · Lineage · Directory · Posts · Profile — creation lives in the MAB, not a center tab), session-aware, mounted in `(web)/layout`; hamburger drawer demoted to overflow/"More" |
| **B1** Floating radial MAB | net-new movable FAB, radial fan-out of the 4 actions (thumb-right); drag + persist position; toggle-off setting; role-gated actions |
| **B2** Bottom-sheet fallback | actions needing a form open a BBLApp-style bottom-sheet (port `CreateOverlayMenu` feel) |
| **B3** Haptics | wire `lib/haptics.ts` to nav/MAB taps; iOS Safari degrades silently |

**Remaining B forks (0495):** exact 5-tab set + icons · MAB default corner + snap zones · toggle-off
persistence (per-device vs per-account) · fan-vs-sheet host per action.

═══════════════════════════════════════════════════════════════════════════════════
## SEQUENCING & HAND-BACK
═══════════════════════════════════════════════════════════════════════════════════

- **0494:** Epic C (harden) → Epic A (Journey v1, +A0/A1 data model, through the loop). A6 (v2 Lenis) and A8
  (v3 GSAP) may spill to a follow-up.
- **0495:** Epic B (mobile shell + MAB).
- Each epic runs the operating loop; Doug verifies at each epic's end; hold at the push gate for the operator.

**Still-open forks before build:** story-table shape (rec `LineageStoryScene`) · storyboard CRUD depth ·
dirty-dozen roster + assets · Rorion/bridge quotes · (B round deferred to 0495). Then Cody pre-flight → build.

**Resolved (operator):** sequence C→A→B · fully data-driven + storyboard CRUD · whole-chain editable (seed
founders) · prologue Carlos Sr→Jr→Rorion→Rigan · Bob + dirty-dozen = conditional bridge scenes · progressive
v1 motion → v2 Lenis → v3 GSAP · ffmpeg approved · assets from BBLApp/monorepo · B = always-on bottom nav +
movable Reddit-style radial MAB (toggle-off), fan = Claim/verify · Create Post · Upload · Log promotion.
