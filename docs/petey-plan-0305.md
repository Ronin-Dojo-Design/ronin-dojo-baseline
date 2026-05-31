---
title: "Petey Plan 0305 — Lineage Tree Enhancement Epic"
slug: petey-plan-0305
type: plan
status: active
created: 2026-05-29
updated: 2026-05-31
last_agent: claude-session-0314
pairs_with:
  - docs/runbooks/design/motion-system.md
  - docs/sprints/SESSION_0305.md
  - docs/sprints/SESSION_0306.md
  - docs/sprints/SESSION_0307.md
  - docs/sprints/SESSION_0308.md
  - docs/sprints/SESSION_0309.md
  - docs/sprints/SESSION_0310.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0305 — Lineage Tree Enhancement Epic

## Summary

Multi-session epic to transform the lineage tree from a functional org chart into a premium,
animated, mobile-first family-tree experience with gamification. Builds on the motion-system
foundation from SESSION_0304 and the drawer UX fixes from SESSION_0305.



**Design inspiration sources:**

- [bklit.com Studio](https://ui.bklit.com/studio) — motion easing curves, snappy cubic-bezier presets, chart animations
- [bklit.com Charts](https://ui.bklit.com/charts) — animated data visualization patterns (spring physics, crosshair, slot-machine tickers)
- [Balkan OrgChart JS](https://balkan.app/OrgChartJS) — org chart tree layout, pinch-zoom canvas, family tree modes, grouping
- [trophy.so UI Kit](https://ui.trophy.so/) — shadcn/ui-based gamification: achievement badges, streak cards, leaderboards, points/levels, unlock animations

## Desi Design Review — Lineage Tree Audit

### Current state (SESSION_0305)

The lineage tree is a **React-first canvas** (`lineage-tree-canvas.tsx`, 901 lines) replacing the
old d3-org-chart viewer. It renders via recursive `LineageBranch` components with `@dnd-kit` for
editor drag-drop. The profile drawer (`lineage-profile-drawer.tsx`, 578 lines) uses the Base UI
Dialog-based `Drawer` primitive.

### Findings

#### ✅ What's working well

1. **Path highlighting** — `buildSelectedPathMemberIds` traces ancestor path correctly; dimming
   non-path nodes (`opacity-45 grayscale-[15%]`) + highlighting path (`ring-1 ring-primary/40`)
   creates clear visual hierarchy.
2. **Component composition** — cards use `Card`, `Avatar`, `Badge`, `Stack` from the design system.
   No FS-0001 violations in the tree components.
3. **DnD editor** — clean separation of read-only vs. edit mode via `editMode` flag.
4. **Visual groups** — `LineageVisualGroupRow` with promotion dates + labels is a nice data-driven
   grouping mechanism.
5. **Zoom controls** — scale 0.7–1.35 with Reset exists at desktop.

#### 🔴 Bugs fixed this session (SESSION_0305)

| Bug | Root cause | Fix |
| --- | --- | --- |
| Path doesn't light up before drawer | `setSelectedNodeId` immediately opens drawer + highlights path simultaneously | Split into path state (immediate) + drawer state (400ms delayed) |
| Can't swipe drawer to close on mobile | Base UI Dialog has no native swipe gesture | Added touch swipe-down handler to `DrawerContent` (80px threshold) |
| Drawer content overflows viewport on mobile | No width constraint + no `overflow-x-hidden` on tab content | Added `min-w-0`, `overflow-hidden`, `overflow-x-hidden` to header + tab containers |

#### 🟡 Animation opportunities (not built — staged here)

| Surface | Current | Proposed | Priority | Inspiration |
| --- | --- | --- | --- | --- |
| **Node card entrance** | Static render, no animation | Staggered fade-in-up per generation tier (like black-belt-rail), `stagger-base` 60ms | P1 | bklit.com chart point animations |
| **Path highlight trace** | Instant full-path highlight | Animated trace from tapped node up to root (sequential connector-by-connector, `deliberate` 250ms per step) | P1 | Balkan OrgChart expand animation |
| **Connector lines** | Static `div` with `bg-border` | Animated grow (height 0→full) on tree load or expand, `ease-out` 200ms | P2 | bklit.com crosshair spring physics |
| **Node card hover** | `hover:-translate-y-1 hover:shadow-lg` (CSS only) | Add subtle scale(1.02) + belt-color glow on hover, `quick` 150ms | P2 | motion-system.md card hover lift |
| **Drawer entrance** | `slide-in-from-bottom-full` | Snappy cubic-bezier (`0.85, 0, 0.15, 1`) per bklit.com Studio, 300ms | P1 | bklit.com "Snappy" preset |
| **Zoom transition** | `transition-transform duration-300 ease-out` | Spring physics for pinch-zoom (momentum, deceleration) | P2 | Balkan OrgChart pinch-zoom |
| **Group expand/collapse** | Not implemented | Accordion-style expand with staggered children reveal | P3 | Balkan OrgChart grouping |
| **Achievement unlock** | Not implemented | Trophy.so-style badge unlock animation on rank promotion | P3 | trophy.so Achievement Unlocked |

#### 🟡 Mobile UX gaps (staged)

1. **Tree doesn't fit mobile viewport** — `min-w-fit` + `gap-8`/`gap-12` between siblings means
   a 3-wide generation is ~780px+. Mobile users must scroll horizontally. **Fix: pinch-zoom canvas
   with initial auto-fit scale** (like Balkan OrgChart).
2. **No touch gestures on the canvas** — pinch-to-zoom and pan are absent. The zoom buttons exist
   but require precise tapping. **Fix: add touch gesture handlers for pinch-zoom and pan.**
3. **Node cards are too wide for mobile** — `min-w-[200px] max-w-[260px]` is fine at desktop but
   eats viewport on phone. **Fix: responsive card width — smaller on mobile, full on desktop.**

### Design system compliance

- ✅ All components use design system primitives (`Card`, `Avatar`, `Badge`, `Stack`, `Note`, `H6`)
- ✅ Drawer uses the L1 `Drawer` primitive (Base UI Dialog)
- ✅ Colors are token-based (no raw hex except data-driven `Rank.colorHex`)
- ⚠️ The `lineage-profile-drawer.tsx:177` unused param lint warning is pre-existing (not in our changes)

---

## Epic phases

### Phase 1 — Mobile-first tree (1–2 sessions)

**Goal:** Make the lineage tree usable on mobile with pinch-zoom, auto-fit, and responsive cards.

#### TASK: Pinch-zoom canvas wrapper

- Replace the static `overflow-auto` container with a pinch-zoom/pan canvas
- Use `motion/react` or a lightweight gesture lib for touch handlers
- Auto-fit the tree to viewport width on initial load (calculate scale from tree width vs. viewport)
- Keep existing zoom buttons as supplementary controls
- Respect `prefers-reduced-motion` (instant jump, no animated zoom)

#### TASK: Responsive node cards

- Below `md` breakpoint: reduce card width to `min-w-[160px] max-w-[200px]`
- Collapse secondary info (school label) to a single-line truncated badge
- Avatar size: `size-10` on mobile (from `size-12`)
- Reduce gap between siblings: `gap-4` mobile, `gap-8` desktop

#### TASK: Auto-fit initial scale

- On mount, measure the tree container width and the rendered tree width
- Set initial `scale` to fit the tree within the viewport (min 0.5, max 1.0)
- Show a "Scroll to explore" → "Pinch to explore" label swap on touch devices

### Phase 2 — Tree animations + motion language (1–2 sessions)

**Goal:** Apply the motion-system language to the lineage tree — entrance animations, path trace,
connector animations.

Depends on: Phase 1 (mobile-first) and `docs/runbooks/design/motion-system.md` Phase 1 (card/list
micro-interactions formalized).

#### TASK: Node entrance stagger

- On initial render, stagger node cards from root down (generation-by-generation)
- Use `motion/react` `AnimatePresence` + stagger
- Easing: `cubic-bezier(0.85, 0, 0.15, 1)` (bklit.com "Snappy") for the entrance
- Duration: `deliberate` 250ms per node, `stagger-base` 60ms between siblings
- Reduced-motion: all nodes render at once, static

#### TASK: Animated path trace

- When a node is tapped, animate the path highlight connector-by-connector from the tapped node
  up to the root (not all-at-once)

- Each connector segment: color transition `bg-border → bg-primary/60` over `base` 200ms
- Node rings appear sequentially as the trace reaches each ancestor
- Total trace time capped at ~1.2s regardless of depth (scale per-step delay)
- Reduced-motion: instant full highlight (current behavior)

#### TASK: Connector line animations

- On tree load, connector lines grow from parent to child (height 0→full)
- Staggered by generation tier
- Easing: `ease-out` entrance
- Reduced-motion: static connectors

#### TASK: Drawer entrance refinement

- Replace the current `slide-in-from-bottom-full` with a bklit.com-style snappy entrance
- Add `cubic-bezier(0.85, 0, 0.15, 1)` as `--ease-snappy` token in `styles.css`
- Duration: 300ms (from the current default)
- Add subtle backdrop blur intensification during entrance

### Phase 3 — Black-belt-rail integration + family tree templates (2–3 sessions)

**Goal:** Combine the black-belt-rail honor concept with the lineage tree; offer multiple visual
layout templates for different martial arts family trees.

#### Black-belt-rail integration (3 modes with toggles)



**Mode A — Tree header strip:**

- Horizontal honor strip above the tree showing top-ranked members from the tree data
- Clicking a member scrolls/zooms to their node and selects it
- Reuses `BlackBeltRailList` component adapted for horizontal layout

- Toggle: tree-level setting (on/off)


**Mode B — Drawer belt-color bar:**

- In the profile drawer header, add a prominent belt-color accent bar behind the avatar
- Use `Rank.colorHex` data (already available in the drawer via `selectedRankAward`)

- Bar width proportional to rank level within the discipline's rank system
- Toggle: drawer-level setting (on/off)


**Mode C — Node card belt accent:**

- Each node card gets a subtle left-border or top-border in the member's belt color

- Uses `selectedRank.colorHex` from the normalized member data
- Fade intensity based on rank seniority (higher rank = more prominent accent)
- Toggle: tree-level setting (on/off)


**Toggle implementation:**

- Tree-level preferences stored in `LineageTree` model or user preferences (localStorage for MVP)
- UI: settings dropdown in the tree toolbar (next to zoom controls)

#### Family tree templates

**Visual layout variants:**

| Template | Layout | Best for | Inspiration |
| --- | --- | --- | --- |
| **Standard vertical** (current) | Top-down parent→children tree | General martial arts lineage | Current implementation |
| **Radial / fan** | Root at center, generations as concentric rings | Large lineages with many branches (Rigan Machado BJJ network) | Balkan OrgChart fan layout |
| **Horizontal flow** | Left-to-right flow, compact for deep but narrow lineages | Japanese martial arts (single-instructor chains like Kendo) | Balkan OrgChart left-to-right |
| **Timeline** | Vertical timeline with promotion dates driving layout | Historical lineage documentation | bklit.com area chart timeline feel |
| **Org Chart Board** | Multi-person root card + inline expandable child lists + persistent side-panel edit | Large school hierarchies with many instructors under one grandmaster; WEKAF organizational structure | [Balkan OrgChart JS](https://balkan.app/OrgChartJS) — see Playwright capture below |

**Data templates (pre-seeded structures):**

| Template | Discipline | Structure | Seed data |
| --- | --- | --- | --- |

| **BJJ Coral Belt Lineage** | Brazilian Jiu-Jitsu | Helio/Carlos → Red belt holders → Coral → Black | Rigan Machado, Jean Jacques, Carlos Gracie Jr lineages |
| **Muay Thai Kru Lineage** | Muay Thai | Ajarn → Kru → Nak Muay | Traditional Thai camp lineages |
| **Karate Soke Lineage** | Karate | Soke/Hanshi → Shihan → Sensei | Okinawan/Japanese system lineages |
| **WEKAF Arnis Lineage** | Eskrima/Arnis | Grandmaster → Master → Instructor | Filipino martial arts teaching lineage |


**Implementation approach:**

- Template selection at tree creation (admin)
- Templates define: default visual layout, default rank system, suggested visual groups,
  placeholder node labels

- A template is a JSON seed file in `apps/web/lib/lineage/templates/`
- Admin can customize after seeding (templates are starting points, not constraints)

#### Org Chart Board template — feature breakdown (from Balkan OrgChart JS capture)

Captured via Playwright inspection of `https://balkan.app/OrgChartJS`. Key features to adapt:

| Feature | Balkan implementation | Our adaptation |
| --- | --- | --- |
| **Multi-person root card** | Single card with multiple rows (name + role + avatar per person), featured leader has bio blurb + larger photo | Compose with `Card` + `Stack` + `Avatar` rows; featured member gets a larger avatar + `Note` bio |
| **Inline expandable child lists** | Children rendered as sub-rows inside the parent card with expand caret `>` + avatar + role | Compose with nested `Stack` + `Button` rows; expand/collapse toggles child visibility |
| **Persistent side-panel edit** | Right-side panel with form fields (Full Name, Job Title, Phone, Start Date, Country, City, Photo URL) + share/PDF/delete action buttons. Stays open while browsing the tree | Our `LineageProfileDrawer` is a bottom-sheet that closes on deselect. Option: add a desktop side-panel mode (Drawer on mobile, persistent panel on desktop) |
| **3-dot card menu `⋯`** | Per-card top-right action menu | Add `DropdownMenu` trigger to `LineageNodeCard` — Edit, View Profile, Change Promoter |
| **Colored title badges** | Role/title displayed as colored tag within the card | Map to `Badge` with `Rank.colorHex` or discipline-based variant |
| **90° bend connectors** | Clean solid lines with right-angle bends between parent → children | Replace current `div` connectors with SVG path connectors using `M/L` commands for 90° bends |
| **Compact child grouping** | Children of a node shown as a compact list within the parent card, not as separate full cards | New `LineageCompactChildList` component: avatar + name + role inline, expandable to full card on click |

**Playwright capture script:** `scripts/capture-balkan-orgchart.ts` — runs the PWCC pipeline against
the Balkan demo page to capture DOM structure, interactions, responsive behavior, and visual patterns.
See the script for the full inspection checklist.

> **Capture caveat (SESSION_0306):** the automated run only reaches Balkan's *marketing* page — the
> live chart is a lazy-loaded `<canvas>`, so DOM/style scraping returns noise. The canonical Phase-3
> visual reference is the **operator screenshot of the live interactive chart** (see
> `assets/balkan-orgchart-board.png` once dropped in) + the feature table above, not the scrape. Two
> script TODOs for Phase 3: (1) its import is `from "playwright"` which doesn't resolve here — use
> `@playwright/test`; (2) retarget at an interactive demo URL with screenshot-only capture.

#### Org Chart Board — design lock (SESSION_0306 planning: live screenshot + ADR 0016 reconciliation)

PWCC classification: **domain component → rewrite into Next pattern** (not a new primitive). Implement
as a **`layout="board"` mode on the existing `LineageTreeCanvas`**, reusing the normalization, DnD,
path-trace, zoom, and reduced-motion work already shipped (Phases 1–2) — no fork. Composite root reuses
**`LineageVisualGroup`** rendered as one card. Features-not-pixels.

**Data model — already solved by ADR 0016 + `lineage-rank-promotion-sync-rules.md`.** The multi-instructor
reality (Blue ← Prof A, Purple/Brown ← Prof B @ a different school, Black ← Prof C) is a *dual model*:

- **Provenance (truth):** `RankAward` is canonical (per-belt: `awardedBy` promoter, `awardedAt`, rank).
  `LineageRelationship(type=PROMOTED_BY)` mirrors each award via `rankAwardId` (`fromNode`=promoter →
  `toNode`=promoted) — a true multi-parent graph.
- **Display (projection):** `LineageTreeMember.primaryVisualParentMemberId` = the single org-chart parent;
  `selectedRankAward` = which belt the card shows; `isCollapsedDefault` already exists for collapse.

- **Affiliation** is a separate axis: `Membership → Organization` (where they train now), distinct from
  who promoted them.

Grill outcomes (SESSION_0306), reconciled with ADR 0016:

1. **Awarding school (NEW — additive, extends ADR 0016):** add nullable `RankAward.organizationId` (the
   school that awarded the belt), keeping `location` as free-text fallback. This is the one genuine
   schema change; consistent with "RankAward is the canonical promotion fact." Worth an ADR 0016 amendment note.
2. **Card vs panel (already ADR 0016):** node card shows the `selectedRankAward` belt (belt-color); the
   persistent panel shows a **full promotion history** (each belt → promoter → school → date → verification).
   Matches sync-rules "drawer shows all relationships; selected RankAward controls compact display."
3. **Primary-parent default + toggle (extends ADR 0016):** default `primaryVisualParentMemberId` to the
   **highest-rank promoter**, with a per-tree **toggle to current-affiliation/org-head**. Sync-rules already
   require the editor to *warn* when the primary visual parent differs from the linked rank-award promoter —
   the affiliation toggle is exactly that explicit, warned override. Promoter change stays a dedicated modal, never drag/drop.

**Phase 3 session breakdown (re-sequenced SESSION_0314 — belt-rail + design promoted to first-class):**

> **Replan note (SESSION_0314):** the original 3-0→3f breakdown silently dropped the **black-belt-rail
> integration** (the 3 modes specced above) and treated card/design quality as incidental. Operator
> call: belt-rail and design are **first-class**, not polish. The belt-rail's 3 modes are now mapped
> onto concrete slices (Mode C + Mode A in the UX pass; Mode B with the 3d panel), and a dedicated
> **3-UX** slice fixes the real usability debt (unusable discipline page, count-badge noise, card
> inconsistency) before the remaining feature slices.

| Slice | Scope | Notes |
| --- | --- | --- |
| **3-0 (schema)** ✅ | `RankAward.organizationId` nullable FK | Done SESSION_0311 |
| **3a** ✅ | `layout="board"` mode + `LineageCompactChildList` | Done SESSION_0312 |
| **3b** ✅ | Collapse/expand + descendant-count badges (`isCollapsedDefault`), auto-collapse deep tiers | Done SESSION_0314; count badge refined to **collapsed-only** in 3-UX |
| **3-UX** *(NEW, first-class)* | Lineage UX/design pass: (1) **board default on the discipline page** — fixes "tree can't be seen, no horizontal scroll" (tree-mode `transform: scale()` never made a usable scroll area); (2) **count badge collapsed-only** (was noise on small trees); (3) **card consistency** (uniform heights, sane rank display); (4) **belt-rail Mode C** — persistent belt-color accent on node cards + board rows; (5) **belt-rail Mode A** — tree-header honor strip (`LineageHonorStrip`, top-ranked tree members, click-to-select), sharing the `BlackBeltRailList` belt-bar idiom | SESSION_0314 |
| **3c** | Per-card/row `DropdownMenu` (View Profile / Change Promoter), capability-gated | Reuses L1 dropdown |
| **3d** | Persistent panel: responsive `LineageProfileDrawer` (bottom-sheet mobile → fixed right panel `md+`) + **promotion-history** section wired to the node-profile editor + **belt-rail Mode B** (drawer belt-color bar); real storage, no localStorage | Highest-value; admin/dashboard, public stays read-only |
| **3e** *(P2)* | SVG 90° connectors | Polish |
| **3f** *(P2)* | Search-to-highlight + PDF export toolbar | Polish |

**Belt-rail mode → slice map (so it never falls through again):** Mode A (tree-header honor strip) → 3-UX · Mode B (drawer belt-color bar) → 3d · Mode C (node-card/row belt accent) → 3-UX.

#### Phase 4 install strategy — `components.json` + shadcn CLI

When Phase 4 starts, add a minimal `components.json` to `apps/web/`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "tailwind": {
    "config": "",
    "css": "app/styles.css",
    "baseColor": "neutral"
  },
  "aliases": {
    "components": "~/components/vendor",
    "utils": "~/lib/utils"
  }
}
```

This enables `npx shadcn@latest add` for both trophy.so and bklit registries. Components install
to `components/vendor/` (isolated from L1 Dirstarter primitives in `components/common/`). Vet each
component's imports before committing — swap any Radix primitive refs to existing Base UI equivalents.
The `cn()` util alias points to our existing `cx()` in `lib/utils`.

### Phase 4 — Trophy.so gamification proof-of-concept (1–2 sessions)

**Goal:** Integrate trophy.so UI components for a gamification layer — starting simple with
registration/profile/onboarding, then expanding to rank progression.

Depends on: trophy.so components installed (`npx shadcn@latest add @trophyso/...`).

#### Slice 1 — Registration / onboarding gamification

- **Achievement Badge** on profile completion (avatar uploaded, bio filled, school linked)
- **Streak Card** for login/training streaks (if attendance tracking exists)
- **Points Badge** for profile completeness percentage
- Use trophy.so's `AchievementBadge`, `StreakCard`, `PointsBadge` components
- Data: computed from existing user profile fields, no schema change needed for POC

#### Slice 2 — Rank progression gamification

- **Points Levels List** showing belt progression (White → Black) with current position highlighted
- **Achievement Unlocked** animation when a `RankAward` is created (promotion event)
- **Leaderboard Rankings** showing top practitioners by rank/points within a discipline
- Data: `RankAward` + `Rank` models provide the progression data; `Rank.colorHex` for visual theming

#### Slice 3 — Lineage tree gamification overlay

- **Achievement Grid** overlay on the tree showing verified vs. unverified lineage chains
- **Points Chart** (bklit.com-style area chart) showing school growth over time
- **Leaderboard Podium** for schools by member count or verification percentage

#### Trophy.so integration notes

- Trophy.so is **shadcn/ui + Tailwind CSS** — fully compatible with our stack
- Components install into the codebase (not a runtime dependency) — aligns with our L1 principle
- MIT licensed, no vendor lock-in
- Components are composable with our existing `Card`, `Badge`, `Avatar` primitives
- Need to verify Base UI compatibility (trophy.so assumes Radix UI; we use Base UI for some primitives)

---

## Cross-references

- [Motion System Epic Spec](runbooks/design/motion-system.md) — motion tokens, easing curves,
  reduced-motion discipline, per-surface animation catalog

- [Baseline Design System Hub](runbooks/design/baseline-design-system.md) — token architecture
- [UI Library Candidates](runbooks/design/ui-library-candidates.md) — trophy.so flagged here
- [Custom Component Inventory](knowledge/wiki/custom-component-inventory.md) — lineage components
- [ADR 0022 — Brand Chrome Resolution](architecture/decisions/0022-brand-chrome-resolution.md) —
  motion stays brand-neutral

- [SESSION_0305](sprints/SESSION_0305.md) — session executing the drawer fixes + this plan

## Session estimates

| Phase | Sessions | Dependencies |
| --- | --- | --- |
| Phase 1 — Mobile-first tree | 1–2 | None (can start next) |
| Phase 2 — Tree animations | 1–2 | Phase 1 + motion-system Phase 1 tokens |
| Phase 3 — Belt-rail integration + templates | 2–3 | Phase 1 |
| Phase 4 — Trophy.so gamification | 1–2 | Trophy.so install + Phase 1 |
| **Total** | **5–9 sessions** | |

## Open questions

- Should family tree templates be selectable per-tree (admin setting) or per-viewer (user pref)?
  Lean: per-tree (admin sets canonical layout), with a viewer override for personal preference.

- Trophy.so assumes Radix UI — do we need a compatibility shim for Base UI, or do the trophy.so
  components work standalone? Needs a POC install to verify.

- Stagger cap for large trees (50+ nodes): progressive disclosure (show 2 generations, expand on
  demand) vs. render all with capped stagger? Lean: progressive disclosure for performance.

- Should the animated path trace use SVG lines (for curved connectors) or keep the current
