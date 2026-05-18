---
title: "Custom Component Inventory"
slug: custom-component-inventory
type: reference
status: active
created: 2026-05-18
updated: 2026-05-18
last_agent: claude-session-0196
pairs_with:
  - docs/knowledge/wiki/dirstarter-component-inventory.md
  - docs/sprints/SESSION_0195.md
  - docs/sprints/SESSION_0196.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Custom Component Inventory

> Ronin-specific (non-Dirstarter) UI components. Companion to [`dirstarter-component-inventory.md`](dirstarter-component-inventory.md). Consult both before designing or building new UI: if a Dirstarter primitive can do the job, use it; if a Ronin custom component already exists for the domain, reuse it before forking a new one.

Conventions:

- Components live under `apps/web/components/web/<domain>/` for public surfaces and `apps/web/components/admin/<domain>/` for admin surfaces.
- Internal sub-components (not exported from a barrel) are listed in parentheses next to their parent.
- "Notable behavior" highlights non-obvious rules a future agent must respect (timezone pinning, cycle guards, visibility rules, etc.).
- When a component changes in a way that affects its public contract or notable behavior, update its row in the same session and bump `updated:` on this file.

---

## 1. Lineage (public viewer + admin) — `components/web/lineage/`

| Component | File | Public props | Notable behavior |
| --- | --- | --- | --- |
| `LineageTreeCanvas` (+ internal `GroupLabel`, `LineageBranch`) | `lineage-tree-canvas.tsx` | `members?`, `visualGroups?`, `defaultRootMemberId?`, `rows?`, `rootId?`, `edges?`, `selectedNodeId?`, `onSelect` | React-first lineage viewer that replaced the d3-org-chart wrapper. Supports v1 `LineageTreeMember` data and a legacy `rows + edges` fallback. Cycle-guarded recursive `LineageBranch`. Selected-node path highlighting via `buildSelectedPathMemberIds`. Promotion dates pass through `formatPromotionDate` which pins `Intl.DateTimeFormat` to `timeZone: "UTC"` — date-only ISO timestamps must render the saved calendar day for all viewers, including west-of-UTC. Zoom range `MIN_SCALE` 0.7 to `MAX_SCALE` 1.35 in `SCALE_STEP` 0.1 increments. |
| `LineageNodeCard` | `lineage-node-card.tsx` | Node + selection callback | Card surface for each practitioner in the tree. Hover lifts and ring states are owned by the parent canvas; the card itself should stay style-light. |
| `LineageProfileDrawer` | `lineage-profile-drawer.tsx` | Selected node + open/close | Drawer that opens on canvas selection. Reads only from the public lineage payload — never from admin-only fields. |
| `LineageTreeBoard` | `lineage-tree-board.tsx` | Tree + selection state | Layout shell that wires the canvas, drawer, and selection state. Owns the `selectedNodeId` source of truth for the public viewer surface. |
| `LineageTree` | `lineage-tree.tsx` | Legacy entry | Older entry kept for fallback compatibility with the discipline detail section. Prefer `LineageTreeCanvas` directly for new surfaces. |

### Lineage admin surfaces

Admin lineage editors live under `apps/web/app/admin/lineage/_components/` (claim review, node profile editor, placeholder archival actions). They consume the same payload types as the public viewer but use server actions for mutations — the public viewer remains read-only by contract.

---

## 2. Tournaments — `components/admin/tournaments/`

| Surface | File pattern | Purpose |
| --- | --- | --- |
| Bracket viewer | `app/admin/tournaments/_components/bracket-viewer.tsx` | Bracket rendering and seed/score editing for admin tournament runs. |
| Weigh-in panel | `app/admin/tournaments/_components/weigh-in-panel.tsx` | Day-of weigh-in capture surface. |
| Divisions editor | `app/admin/tournaments/_components/divisions-editor.tsx` | Division setup for a tournament. |
| Registrations table | `components/admin/tournaments/registrations-table.tsx` (+ columns/toolbar) | TanStack-based registrations list with row actions. |
| Rule sets table | `app/admin/tournaments/rule-sets/_components/rule-sets-table.tsx` (+ delete-dialog/columns/toolbar) | Admin CRUD for rule sets. |

---

## 3. Courses, programs, schools, schedules — `components/web/`

| Surface | File pattern | Purpose |
| --- | --- | --- |
| Courses | `components/web/courses/course-card.tsx`, `course-list.tsx`, `course-listing.tsx`, `course-query.tsx`, `course-search.tsx`, `course-enrollment-panel.tsx`, `curriculum-completion-list.tsx` | Course browsing + enrollment surface. SESSION_0196: `course-card` adopts the ToolCard hover-reveal description overlay + `ShowMore limit={2}` chip rows; `CourseListing` + `CourseListingSkeleton` + `CourseQuery` + `CourseSearch` mirror the technique trio (search + sort + pagination only; filter axes deferred). |
| Programs | `app/admin/programs/_components/program-form.tsx` | Program admin form (Ronin-specific). |
| Schools | `components/web/schools/` (browse surfaces); `school-card.tsx` | Public school directory and detail. SESSION_0196: `school-card` adopts the ToolCard hover-reveal description overlay + `ShowMore` chip rows; the always-visible `city, region` line remains as the description-empty fallback signal. |
| Techniques | `components/web/techniques/` (browse surfaces); `technique-card.tsx` | Public technique library. SESSION_0196: `technique-card` adopts the ToolCard hover-reveal description overlay + `ShowMore` chip rows. |
| Schedules | `components/web/schedules/` | Class/event schedule rendering. |
| Members | `components/web/members/` | Member directory surfaces. |

---

## 3a. Disciplines — `app/(web)/disciplines/_components/`

| Component | File | Public props | Notable behavior |
| --- | --- | --- | --- |
| `DisciplineCard` (+ named export `DisciplineCardSkeleton`) | `app/(web)/disciplines/_components/discipline-card.tsx` | `discipline` (incl. stat counts) | SESSION_0196: flipped from `<Link><Card hover>` to `<Card isRevealed>` + `<CardHeader wrap={false}>` + truncated `<H4 as="h3">` with `<Link>` + `<span className="absolute inset-0 z-10" />` (a11y win — H4 stays the screen-reader landmark while the whole card is clickable). Three-stat row (rank systems / orgs / members) moved behind the hover-reveal description overlay using `ShowMore limit={2}` outline badges. `DisciplineCardSkeleton` named export mirrors `ToolCardSkeleton` for reuse from `discipline-list-skeleton.tsx`. Card lives under `_components/` for now (move to `components/web/disciplines/` flagged as a follow-up). |
| `DisciplineList` | `app/(web)/disciplines/_components/discipline-list.tsx` | `brand` | SESSION_0196: adopted shared `Grid` primitive + `EmptyList` (replaced hand-rolled grid markup + paragraph empty state). |
| `DisciplineListSkeleton` | `app/(web)/disciplines/_components/discipline-list-skeleton.tsx` | none | SESSION_0196: consumes the new `DisciplineCardSkeleton` export inside `Grid` (replaced hand-rolled card skeleton markup). |

---

## 4. Directory, listings, ads, tools, posts — `components/web/`

| Surface | File pattern | Purpose |
| --- | --- | --- |
| Directory | `components/web/directory/directory-*.tsx`, `components/web/filters/` | Directory list, filters, sort. |
| Listings | `components/web/listings/` | Listing detail and card surfaces. |
| Ads | `components/web/ads/ad-banner.tsx`, `ad-base.tsx`, `ad-card.tsx`, `ads-calendar.tsx`, `ads-picker.tsx` | Ad placement, browsing, and admin scheduling. |
| Tools | `components/web/tools/` (+ `app/admin/tools/_components/`) | Tool catalog admin + public. |
| Posts | `components/web/posts/` (+ `app/admin/posts/_components/`) | Blog/post surfaces. |

---

## 5. Admin shell + dialogs — `components/admin/`

| Component | File | Purpose |
| --- | --- | --- |
| `Shell` | `admin/shell.tsx` | Admin layout shell. |
| `Sidebar` | `admin/sidebar.tsx` | Admin sidebar nav. |
| `Nav` | `admin/nav.tsx` | Admin top nav. |
| `DateRangePicker` | `admin/date-range-picker.tsx` | Date range picker used across admin tables. |
| `ComboboxSelector`, `RelationSelector` | `admin/combobox-selector.tsx`, `admin/relation-selector.tsx` | Admin form selectors with async relation lookup. |
| `RowCheckbox` | `admin/row-checkbox.tsx` | Selection cell for admin tables. |
| `AuthHOC` | `admin/auth-hoc.tsx` | Admin route gating HOC. |
| `Generate*` (AI) | `admin/ai/generate*.tsx` | Admin AI assist surfaces (content/description generation). |
| `MetricChart`, `MetricHeader`, `MetricValue` | `admin/metrics/*.tsx` | Admin metric tiles + charts. |
| `Chart` | `admin/chart.tsx` | Shared chart wrapper. |
| `DeleteDialog` | `admin/dialogs/delete-dialog.tsx` | Generic destructive-action confirm dialog. |

---

## 6. Auth, dialogs, lead capture — `components/web/`

| Component | File | Purpose |
| --- | --- | --- |
| `Login`, `LoginButton`, `LoginDialog`, `LoginForm` | `components/web/auth/login*.tsx` | Public login surfaces. |
| Tool claim/embed/report dialogs | `components/web/dialogs/tool-*.tsx` | Public tool-action dialogs. |
| `LeadCaptureForm` | `components/web/lead-capture-form.tsx` | Public lead capture. |
| `CTAForm`, `CTAProof` | `components/web/cta-form.tsx`, `cta-proof.tsx` | Public CTA surfaces with social proof. |

---

## How to update this file

- When a new custom component lands: add a row to the appropriate section in the same session that adds the file. If no section fits, create a new H2 with a one-line scope sentence and add the first row.
- When a notable behavior changes (visibility rules, timezone pinning, cycle guards, side-effects): edit the "Notable behavior" cell so future agents see the constraint without reading the file.
- When a component is removed: delete the row; do not leave tombstones. Git history is the audit trail.
- Bump `updated:` and `last_agent:` in this file's frontmatter on every change.
