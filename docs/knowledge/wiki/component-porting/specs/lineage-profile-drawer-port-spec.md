---
title: Lineage Profile Drawer Port Spec
slug: lineage-profile-drawer-port-spec
type: spec
status: draft
created: 2026-05-16
updated: 2026-06-05
last_agent: codex-session-0348
pairs_with:
  - docs/sprints/SESSION_0175.md
  - docs/sprints/SESSION_0348.md
  - docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/component-port-spec.md
  - docs/knowledge/wiki/component-porting/specs/lineage-family-tree-port-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - component-porting
  - lineage
---

# Lineage Profile Drawer — Port Spec

> Doug / TASK_01 / SESSION_0175. Hard rule: features-not-pixels. Capture what the drawer DOES; rebuild with Dirstarter primitives.

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: Lineage Profile Drawer                              │
│ Old URL:        https://blackbeltlegacy.local/#/bbl/lineage         │
│ Old state:      visible after clicking a tree-node card (right-     │
│                  anchored off-canvas slide-in)                      │
│ Old source ref: ronin-dojo-monorepo/src/brands/blackbeltlegacy/     │
│                  components/LineageProfileDrawer.jsx (2,157 LOC)    │
│ Target route:   /disciplines/[slug] (Baseline) — drawer mounts at   │
│                  the discipline page; opens from a tree-node click  │
│ Target file:    apps/web/components/web/lineage/                    │
│                  lineage-profile-drawer.tsx (client island per      │
│                  TASK_03; state lives in lineage-tree-section.tsx)  │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Visual Structure                                           │
├─────────────────────────────────────────────────────────────────────┤
│ - Off-canvas Sheet/Drawer panel, anchored right (~360-420px wide    │
│   on desktop; full-width / bottom sheet on mobile)                  │
│ - Header row:                                                       │
│     * Belt-rank progress bar (thin gradient stripe across the top)  │
│     * Close "X" (top-right)                                         │
│ - Identity block:                                                   │
│     * Avatar (circular, ~80px)                                      │
│     * Name (H4) + Rank label                                        │
│     * Sub-line: discipline · location                               │
│     * Verified ✓ badge                                              │
│     * Quick-action chips: "Photos", "Videos" (legacy uses a count;  │
│       MVP can render as count-only or hide if zero)                 │
│ - Tab bar (segmented):                                              │
│     * Info  (default)                                               │
│     * Belt Story (legacy "belt-info")                               │
│     * Tournaments                                                   │
│     * Achievements                                                  │
│ - Tab body (Info tab — the default + MVP scope):                    │
│     * Bio (optional — `LineageNode.bio` in new schema)              │
│     * **Current Rank row** — from `RankAward` (most-recent per      │
│       rankSystem): rank name + shortName + colorHex stripe + the    │
│       awarding discipline name (e.g. "Black Belt 1st Dan — BJJ").   │
│     * **Awarded By row (REQUIRED)** — `RankAward.awardedBy`         │
│       (User { id, name, image }). If null, render "Awarded by:      │
│       lineage-unverified" with the lineage `notes` (often carries   │
│       the awarding instructor's name as text). Cody payloads        │
│       already select this — surface it in the drawer.               │
│     * **Promoted On** — `RankAward.awardedAt` (formatted date).     │
│     * "Instructor" row — derived from `LineageRelationship`         │
│       (type=INSTRUCTOR_STUDENT, this node = toNode → list           │
│       fromNode.user.name). Optional "Unverified" pill when          │
│       `LineageRelationship.isVerified=false`.                       │
│     * "School" block — SchoolCard or fallback text from the latest  │
│       active Membership's organization.                             │
│ - Tab body (Belt Story / Tournaments / Achievements):               │
│     * Repeating Card list per entry (medal emoji + title + division │
│       + result for tournaments)                                     │
│     * Empty-state copy when collection is empty                     │
│ - Footer (sticky bottom):                                           │
│     * "Copy Link" (Button, ghost)                                   │
│     * "Open Full Viewer" / share menu (Button, primary)             │
│     * "Students" mini-search list above the footer (count-gated by  │
│       membership tier on legacy — descope for MVP)                  │
│ - Mobile: full-width bottom sheet OR full-screen drawer;            │
│   tab bar sticks to top; footer sticks to bottom.                   │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Interactions                                               │
├─────────────────────────────────────────────────────────────────────┤
│ - Drawer opens from any tree-node card click OR practitioners-grid  │
│   card click; opens with the clicked node's data (or skeletons      │
│   while server data loads).                                         │
│ - Close: top-right X, Escape key, or clicking the page backdrop —   │
│   primitive's responsibility.                                       │
│ - Tab switch: clicking a tab in the segmented bar swaps the body;   │
│   selected tab is visually highlighted.                             │
│ - "Photos" / "Videos" pill: opens a media gallery overlay in        │
│   legacy. Descoped for MVP — render as count badge only or hide.    │
│ - "Copy Link" → clipboard copy of `/me/{slug}` or                   │
│   `/disciplines/[slug]?lineageNode={id}` deep link; toast success.  │
│ - "Open Full Viewer" → routes to a standalone viewer page;          │
│   descope for MVP (no standalone /lineage route this session).      │
│ - "Students" search list: filters the visible students of the       │
│   current node. Descope for MVP.                                    │
│ - Loading: tab body shows Skeleton lines for ~250ms then renders.   │
│ - Empty data for a tab: render the tab body's empty-state copy      │
│   ("No tournament records for this belt level").                    │
│ - Missing avatar: AvatarFallback shows initials.                    │
│ - Error: not observed; surface as toast + close drawer.             │
│ - Visibility + tier gating: a node/profile without public access or │
│   without a premium/elite owner/listing tier renders a redacted      │
│   body (avatar/initials + name + rank summary only; no bio, school, │
│   links, tournaments, achievements, QR, or full rank history).       │
│   SESSION_0348 makes this an active launch rule, not future polish. │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Dirstarter primitives (all in dirstarter-component-inventory.md):   │
│   - Dialog OR Popover (common/dialog, common/popover) — confirm     │
│     with Petey whether a Sheet/Drawer primitive should be added to  │
│     the inventory (see backend/primitive gap list in SESSION).      │
│     SHORT-TERM: use `Dialog` + custom side-anchored CSS class to    │
│     produce a right-anchored panel without inventing a primitive.   │
│     This is a known FS-0001-watch — Cody MUST escalate before       │
│     building a hand-rolled Drawer.                                  │
│   - DialogContent / DialogHeader / DialogTitle / DialogClose        │
│   - Avatar + AvatarImage + AvatarFallback (common/avatar)           │
│   - Badge (common/badge) — verified, rank, photo/video counts       │
│   - Button (common/button) — Copy Link, Open Full Viewer, Close     │
│   - Card (common/card) — each tab-body list entry                   │
│   - Stack (common/stack) — every flex row/column                    │
│   - H4 / Note (common/heading, common/note) — name + sub-line       │
│   - Separator (common/separator) — between identity block and tabs  │
│   - Skeleton (common/skeleton) — loading state                      │
│   - Tabs primitive — INVENTORY GAP: no `Tabs` listed in the         │
│     inventory. Cody MUST audit `components/common/` before          │
│     building; if missing, escalate to Petey (FS-0001 mitigation).   │
│     Workaround: render a `Stack` of `Button` toggles + conditional  │
│     body — function over polish, MVP-acceptable.                    │
│                                                                     │
│ Custom delta (NOT a new primitive — composition only):              │
│   - components/web/lineage/lineage-profile-drawer.tsx (client)      │
│     props: { open, onOpenChange, nodeId }                           │
│   - Drawer fetches profile via a tRPC-style client call or via      │
│     server action wrapping `getLineageProfile(nodeId)` from         │
│     server/web/lineage/queries.ts (Cody's TASK_02 contract).        │
│                                                                     │
│ Strategy: adapt with Dirstarter primitives; features-not-pixels.    │
│                                                                     │
│ Source inspection needed? Reference only — used legacy source       │
│   ONCE to confirm tab labels (Info / Belt Story / Tournaments /     │
│   Achievements). New backend is LineageNode / LineageRelationship   │
│   via new server/web/lineage/* (Cody, TASK_02).                     │
│                                                                     │
│ Proof: render on Baseline /disciplines/[slug]; click a tree-node    │
│   card → drawer opens with avatar / name / rank / school / org;     │
│   Info tab renders fully; other tabs render with seeded data OR     │
│   their empty state.                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Data shape this component consumes (target — new schema only)

```ts
// Conceptual — Cody owns server/web/lineage/payloads.ts shape
type LineageProfile = {
  id: string                         // LineageNode.id
  slug: string | null                // LineageNode.slug
  visibility: 'PUBLIC' | 'UNLISTED'  // RESTRICTED/PRIVATE filtered out for unauth viewer
  isVerified: boolean                // LineageNode.isVerified
  bio: string | null                 // LineageNode.bio
  user: { name: string; image: string | null }
  // The following are joins Cody scaffolds; each is a BACKEND GAP if the
  // payload can't be populated from the current schema (see SESSION findings):
  currentRank: { name: string; awardedAt: Date | null } | null   // RankAward (most recent)
  promotedBy: { name: string; isVerified: boolean } | null        // RankAward.promotedBy
  instructor: { name: string; isVerified: boolean } | null        // LineageRelationship INSTRUCTOR_STUDENT, fromNode
  school: { name: string; city: string | null; state: string | null } | null  // Membership.organization
  tournaments: { name: string; division: string; result: string; date: Date }[]  // BACKEND GAP — no tournament-result model wired to lineage yet
  achievements: { label: string; date: Date | null }[]            // BACKEND GAP — no achievement model
  beltStory: { label: string; promotedAt: Date | null; promotedBy: string | null; location: string | null }[]  // derivable from RankAward history per discipline
}
```

## Responsive behavior

- **Desktop ≥ md:** Right-anchored slide-in panel, ~360-420px wide; backdrop dims the page.
- **Mobile (< md):** Full-screen overlay or bottom sheet — whichever the chosen primitive supports natively. The legacy goes full-screen on the smallest viewport.
- **Tab bar:** Stays sticky at the top of the panel; footer (Copy Link / Open Full Viewer) sticky at the bottom.

## Accessibility / keyboard

- Drawer trigger must be a `Button` so the trigger element is keyboard-reachable.
- The chosen primitive (`Dialog`-derived) MUST trap focus inside the drawer while open and return focus to the trigger on close.
- Escape closes the drawer.
- Tab bar uses `role="tablist"` + `role="tab"` + `aria-selected`; if the inventory `Tabs` primitive doesn't exist, the `Stack`-of-`Button` workaround must still set `aria-pressed`.

## Behavior states

| State | Render |
| --- | --- |
| Closed | Drawer not in DOM (per primitive default). |
| Opening (loading data) | `Skeleton` rows in the identity block + tab body. |
| Loaded — PUBLIC node | Full Info tab; other tabs render data or empty state. |
| Loaded — free owner/listing tier | Redacted preview only: avatar/initials, name, rank summary, and upgrade/claim CTA. |
| Loaded — premium/elite owner/listing tier | Full Info tab, still bounded by profile privacy flags and public visibility. |
| Loaded — UNLISTED node, no viewer ACL | Default to PUBLIC-only filter in queries unless an authenticated ACL path is explicitly implemented. |
| Loaded — RESTRICTED/PRIVATE | Treat as 404 → drawer doesn't open; toast "Profile not available". |
| No data for a tab | Tab-body empty state copy (e.g. "No tournaments recorded"). |
| Error fetching profile | Close the drawer + toast error; do NOT show a broken drawer body. |

## What is NOT in MVP scope (rolls to SESSION_0176)

- Belt-rank gradient stripe header.
- Belt Story tab body — needs RankAward history join + per-belt media.
- Tournaments tab body — needs tournament-result-to-LineageNode join (NOT in current schema; backend gap P2).
- Achievements tab body — needs an Achievement model (NOT in current schema; backend gap P3).
- Photos / Videos pills and media gallery.
- Students mini-search list.
- "Open Full Viewer" route.
- Full tournament/achievement body for free listings; free tier renders the compact preview only.
- Mobile bottom-sheet polish; primitive default is acceptable.

## Cross-references

- Tree pairing: [Lineage Family Tree port spec](./lineage-family-tree-port-spec.md)
- Source-of-last-resort (used only for tab labels):
  `ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/LineageProfileDrawer.jsx:1293-1298`
- Inventory: `docs/knowledge/wiki/dirstarter-component-inventory.md`
- Capture artifacts: `/tmp/session-0175-doug/11-lineage-desktop-drawer-open.png`,
  `/tmp/session-0175-doug/21-lineage-mobile-drawer-open.png`,
  `/tmp/session-0175-doug/02-lineage-desktop-probes.json`
