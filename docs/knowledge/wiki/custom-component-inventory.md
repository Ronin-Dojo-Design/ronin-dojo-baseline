---
title: "Custom Component Inventory"
slug: custom-component-inventory
type: reference
status: active
created: 2026-05-18
updated: 2026-05-29
last_agent: claude-session-0296
pairs_with:
  - docs/knowledge/wiki/dirstarter-component-inventory.md
  - docs/sprints/SESSION_0287.md
  - docs/sprints/SESSION_0224.md
  - docs/sprints/SESSION_0195.md
  - docs/sprints/SESSION_0196.md
  - docs/sprints/SESSION_0197.md
  - docs/sprints/SESSION_0198.md
  - docs/sprints/SESSION_0199.md
  - docs/sprints/SESSION_0200.md
  - docs/sprints/SESSION_0202.md
  - docs/sprints/SESSION_0248.md
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
| `LineageQuery` | `lineage-query.tsx` | `searchParams`, `brand`, page structured-data metadata, optional listing overrides | SESSION_0248: server query wrapper for `/lineage`. Parses `nuqs` search params, calls `searchPublishedLineageTrees`, renders `ResultsCount`, `LineageListing`, `LineageList`, and page-scoped collection structured data. |
| `LineageListing` | `lineage-listing.tsx` | `pagination`, optional `search`, optional filter-provider options, children | SESSION_0248: client listing shell mirroring Tool/Technique listing architecture. Provides `FiltersProvider` with `lineageFilterParams`, renders `LineageSearch`, children, and shared `Pagination`. |
| `LineageSearch` | `lineage-search.tsx` | Optional placeholder plus `Stack` props | SESSION_0248: client search control composed from shared `Filters` and `Sort`. Sort values are `name.asc`, `name.desc`, and `updatedAt.desc`; filter changes reset `page` through `FiltersProvider`. |
| `LineageList` | `lineage-list.tsx` | `trees: LineageTreeCardRow[]` | SESSION_0248: public card grid. Empty state is explicit for no matching published trees. |
| `LineageCard` | `lineage-card.tsx` | `tree: LineageTreeCardRow` | SESSION_0248: public lineage tree card. Displays only public listing fields plus `memberCount`; count is produced by the server query with `LineageNode.visibility = PUBLIC`, never hidden-member totals. |

### Lineage admin surfaces

Admin lineage editors live under `apps/web/app/admin/lineage/_components/` (claim review, node profile editor, placeholder archival actions). They consume the same payload types as the public viewer but use server actions for mutations — the public viewer remains read-only by contract.

SESSION_0202 added the user-dashboard editor preview surface:

| Surface | File | Purpose | Notable behavior |
| --- | --- | --- | --- |
| Dashboard lineage tab | `app/(web)/dashboard/lineage-tab.tsx` | Lists lineage trees the current user can preview or edit. | Server component. Uses `getServerSession`, current request brand, `findEditableLineageTrees`, and L1 `Card`/`Badge`/`Button`/`Stack` primitives. Unauthenticated users redirect to `/auth/login?next=/dashboard`. |
| Dashboard lineage editor preview | `app/(web)/dashboard/lineage/[treeId]/page.tsx` | Authenticated read-only editor preview for a single tree. | Uses `getLineageEditorTree` and reuses `LineageTreeBoard`; does not expose mutation controls. Users without global admin, organization admin/owner on organization-scoped trees, or explicit `LineageTreeAccess` capability receive `notFound()`. |
| Lineage editor read queries | `server/web/lineage/editor-queries.ts` | Auth-scoped list/detail read model and capability resolver. | Capability derives from global admin, organization owner/admin for organization-scoped trees, and explicit lineage ACL roles. Public viewer payloads remain unchanged; editor reads are separated from cached public reads. |

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
| Courses | `components/web/courses/course-card.tsx`, `course-list.tsx`, `course-listing.tsx`, `course-query.tsx`, `course-search.tsx`, `course-enrollment-panel.tsx`, `curriculum-completion-list.tsx` | Course browsing + enrollment surface. SESSION_0196: `course-card` adopts the ToolCard hover-reveal description overlay + `ShowMore limit={2}` chip rows; `CourseListing` + `CourseListingSkeleton` + `CourseQuery` + `CourseSearch` mirror the technique trio (search + sort + pagination only; filter axes deferred). SESSION_0197: `course-list` empty state reads from `useTranslations("courses")("empty")`; `course-search` sort labels routed through `useTranslations("courses.sort")` with `title_*` keys (mirrors sort value field); search placeholder routed through `useTranslations("courses.filters")("search_placeholder")`. |
| Programs | `app/admin/programs/_components/program-form.tsx` | Program admin form (Ronin-specific). |
| Schools | `components/web/schools/` (browse surfaces); `school-card.tsx`, `school-list.tsx` | Public school directory and detail. SESSION_0196: `school-card` adopts the ToolCard hover-reveal description overlay + `ShowMore` chip rows; the always-visible `city, region` line remains as the description-empty fallback signal. SESSION_0197: `school-list` empty state reads from `useTranslations("schools")("empty")`; `school-search` sort labels routed through `useTranslations("schools.sort")` with `name_asc` / `name_desc` keys; search placeholder routed through `useTranslations("schools.filters")("search_placeholder")`. SESSION_0198: `SchoolCardData` gains `phoneE164` / `email` / `websiteUrl` (the last was missing from `organizationManyPayload` until SESSION_0198 closed the gap); hover overlay renders three optional contact rows (tel/mailto/external website) wrapped in `<Stack direction="column" size="sm" className="relative z-20">` — the **`relative z-20` is load-bearing**: it lifts contact anchors above the card-wide `<Link>` click-shield at `school-card.tsx:35` (`<span className="absolute inset-0 z-10" />`) so anchors are independently clickable instead of being intercepted by the card-wide link. Description drops to `line-clamp-2` to make room. Conditional render skips the contact Stack entirely when all three fields are null. `school-list.tsx` carries a shadow `SchoolCardData` type that mirrors the card's (duplication flagged as future cleanup). |
| Techniques | `components/web/techniques/` (browse surfaces); `technique-card.tsx` | Public technique library. SESSION_0196: `technique-card` adopts the ToolCard hover-reveal description overlay + `ShowMore` chip rows. SESSION_0197: `technique-list` empty state reads from `useTranslations("techniques")("empty")`; `technique-search` sort labels routed through `useTranslations("techniques.sort")` with `name_asc` / `name_desc` / `curriculum_order` keys; search placeholder routed through `useTranslations("techniques.filters")("search_placeholder")`. |
| Schedules | `components/web/schedules/` | Class/event schedule rendering. |
| Members | `components/web/members/` | Member directory surfaces. |

---

## 3a. Disciplines — `app/(web)/disciplines/_components/`

| Component | File | Public props | Notable behavior |
| --- | --- | --- | --- |
| `DisciplineCard` (+ named export `DisciplineCardSkeleton`) | `app/(web)/disciplines/_components/discipline-card.tsx` | `discipline` (incl. stat counts) | SESSION_0196: flipped from `<Link><Card hover>` to `<Card isRevealed>` + `<CardHeader wrap={false}>` + truncated `<H4 as="h3">` with `<Link>` + `<span className="absolute inset-0 z-10" />` (a11y win — H4 stays the screen-reader landmark while the whole card is clickable). Three-stat row (rank systems / orgs / members) moved behind the hover-reveal description overlay using `ShowMore limit={2}` outline badges. `DisciplineCardSkeleton` named export mirrors `ToolCardSkeleton` for reuse from `discipline-list-skeleton.tsx`. Card lives under `_components/` for now (move to `components/web/disciplines/` flagged as a follow-up). SESSION_0197: count chips render via `useTranslations("disciplines")` + next-intl ICU plural keys `counts.{ranks,orgs,members}` using CLDR-canonical `one`/`other` rules; inline ternary plural strings removed. |
| `DisciplineList` | `app/(web)/disciplines/_components/discipline-list.tsx` | `brand` | SESSION_0196: adopted shared `Grid` primitive + `EmptyList` (replaced hand-rolled grid markup + paragraph empty state). SESSION_0197: async server component; empty literal replaced with `getTranslations("disciplines")` → `t("empty")` (server-async hook, not the client `useTranslations`). |
| `DisciplineListSkeleton` | `app/(web)/disciplines/_components/discipline-list-skeleton.tsx` | none | SESSION_0196: consumes the new `DisciplineCardSkeleton` export inside `Grid` (replaced hand-rolled card skeleton markup). |

---

## 3b. Listings i18n namespaces — `apps/web/messages/en/`

> SESSION_0197 introduced per-domain message namespaces for the four public listing surfaces, mirroring the `tools.json` precedent. Glob loader at `apps/web/lib/i18n.ts:13` auto-loads any `messages/en/*.json` file by basename as the namespace key — no registration code change required when adding a new namespace.

| Namespace | File | Keys |
| --- | --- | --- |
| `disciplines` | `apps/web/messages/en/disciplines.json` | `empty`, `counts.ranks` / `counts.orgs` / `counts.members` (next-intl ICU plural with CLDR `one`/`other` rules). |
| `techniques` | `apps/web/messages/en/techniques.json` | `empty`, `filters.search_placeholder`, `sort.name_asc` / `sort.name_desc` / `sort.curriculum_order`. |
| `schools` | `apps/web/messages/en/schools.json` | `empty`, `filters.search_placeholder`, `sort.name_asc` / `sort.name_desc`. |
| `courses` | `apps/web/messages/en/courses.json` | `empty`, `filters.search_placeholder`, `sort.title_asc` / `sort.title_desc` (`title_*` keys mirror the sort value field; not `name_*`). |

**Conventions for future per-domain namespaces:**

- Keep keys 1:1 with the inline strings the components currently render — no speculative keys.
- Use CLDR-canonical `one`/`other` ICU plural rules over `=1`/`=0`/`other` for any new plural keys (`tools.json` uses the older `=1`/`=0`/`other` style for noun-only tokens; the CLDR form is locale-safe for any plural-rule-rich language).
- Client components consume via `useTranslations("<namespace>")` or `useTranslations("<namespace>.<sub>")`. Async server components must use `getTranslations` from `next-intl/server` instead.
- The `common.empty: "Nothing found."` bridge key (added in SESSION_0196) stays as a fallback; removal is queued for the next listings cleanup session after all four domains are verified migrated in production.

---

## 3c. Organization payload + contact fields — `server/web/organization/` + dashboard `school-form.tsx`

> SESSION_0198 added `phoneE164 String?` + `email String?` columns to the Prisma `Organization` model (migration `20260519000527_add_organization_contact_fields` — column-add only, nullable). The Many + One payloads (`organization/payloads.ts`) now select `phoneE164` / `email` / `websiteUrl` (the last was missing from `organizationManyPayload` pre-SESSION_0198 even though the column already existed). `searchOrganizations` (`directory/search-organizations.ts:54-62`) maps all three to the SchoolCard data shape. The dashboard org-edit form `app/(web)/dashboard/school-form.tsx` had three field names (`contactEmail`, `address`, `region`) that did not exist on the Prisma model and were silently breaking saves — SESSION_0198 renamed them to `email`, `addressLine1`, `state` to match the model and added `phoneE164` in the same commit. The public `create-organization-form.tsx` gained the two new fields in a 2-col grid wrapper after `websiteUrl`, mirroring `lead-form.tsx:115-143` precedent. Validation is intentionally loose (`z.string().email().max(200).optional().or(z.literal(""))` for email; `z.string().max(32).optional().or(z.literal(""))` for phone) — E.164 normalization deferred.

## 3d. Course sort consumption — `server/web/courses/queries.ts`

> SESSION_0198 wired `searchCourses` to consume the URL-tracked `sort` param that SESSION_0196 added to `courseFilterParams`. Pattern mirrors `searchOrganizations` split-by-dot but adds a defensive allowlist `SORTABLE_COURSE_COLUMNS = ["title"] as const` + sortOrder direction defaulting (`rawSortOrder === "desc" ? "desc" : "asc"`). Closes the SESSION_0196 orphan-Sort-UI smell. `course-query.tsx` threads `sort: params.sort` into the `searchCourses` call. SESSION_0199 mirrored this pattern onto `searchOrganizations` via `SORTABLE_ORGANIZATION_COLUMNS = ["name"] as const`; `searchTechniques` still has the matching unsanitized-`sortBy` hole (would need `["name", "curriculum_order"]`) — deferred per the SESSION_0198 reflection on not lifting to a shared helper until a third occurrence surfaces.

---

## 3e. Listing UI primitives — `components/web/ui/`

> Cross-domain primitives that compose any listing surface. Server-renderable by default; no `"use client"`. Companion to the existing primitive set (`Stat`, `Intro`, `Grid`, `Breadcrumbs`).

| Component | File | Public props | Notable behavior |
| --- | --- | --- | --- |
| `ResultsCount` | `apps/web/components/web/ui/results-count.tsx` | `total: number`, `label: string`, plus any `<p>` attributes | SESSION_0199: generic server-renderable count line. Renders `label` (consumer is expected to pre-localize via `t("results", { count: total })` — see per-namespace ICU plural keys at `apps/web/messages/en/{courses,schools,techniques,disciplines}.json:results`). `total` is kept required in the public API for forward parity with a future animated variant (NumberFlow / `<Stat>` integration) even though the static render delegates the count to the plural inside `label`. Adopted in `course-query.tsx`, `school-query.tsx`, `technique-query.tsx` above each `*Listing`, and in `discipline-list.tsx` above `<Grid>` (both empty + populated branches via a single fragment). Use `<ResultsCount>` rather than a hand-rolled `<p>` whenever a listing surfaces a total count; this keeps cross-domain parity and gives the animated variant a single replacement point. |

---

## 3f. Server-side utilities — `server/web/_shared/`

> Cross-domain server-side helpers consumed by `server/web/**` query and action files. Not UI; not Prisma extensions; not Dirstarter L1 — these are app-internal utilities that consolidate in-repo patterns once they reach a third occurrence.

| Utility | File | Public API | Notable behavior |
| --- | --- | --- | --- |
| `parseSort` | `apps/web/server/web/_shared/sortable.ts` | `parseSort<T extends readonly string[]>(sort: string \| undefined, columns: T, defaultOrder?: "asc" \| "desc"): { sortBy: T[number] \| undefined; sortOrder: "asc" \| "desc" }` | SESSION_0200: generic URL-injection-safe sort parser. Splits `<column>.<direction>` from the query string, narrows `sortBy` to a member of the caller's `as const` allowlist (or `undefined` for unknown/missing), sanitizes `sortOrder` to `"asc" \| "desc"` with a configurable default. Type-safe via `T extends readonly string[]` so Prisma `orderBy: { [sortBy]: sortOrder }` stays sound at every call site. Consolidates the SESSION_0198 (`searchCourses`) + SESSION_0199 (`searchOrganizations`) precedents into one helper at the third occurrence (`searchTechniques`); rule-of-three lift. Adopted in `apps/web/server/web/{courses,directory,techniques}/queries.ts` + `search-organizations.ts`. New callers should: (1) declare `const SORTABLE_<DOMAIN>_COLUMNS = [...] as const` in their query file, (2) call `parseSort(sort, SORTABLE_<DOMAIN>_COLUMNS)`, (3) keep their existing `orderBy` fallback for the `sortBy === undefined` branch. |

---

## 4. Directory, listings, ads, tools, posts — `components/web/`

| Surface | File pattern | Purpose |
| --- | --- | --- |
| Directory | `components/web/directory/directory-*.tsx`, `components/web/filters/` | Directory list, filters, sort. |
| Listings | `components/web/listings/` | Listing detail and card surfaces. |
| Ads | `components/web/ads/ad-banner.tsx`, `ad-base.tsx`, `ad-card.tsx`, `ads-calendar.tsx`, `ads-picker.tsx` | Ad placement, browsing, and admin scheduling. |
| Tools | `components/web/tools/` (+ `app/admin/tools/_components/`) | Tool catalog admin + public. |
| Posts | `components/web/posts/` (+ `app/admin/posts/_components/`) | Blog/post surfaces. |
| Content posts | `components/web/content-posts/content-post-*.tsx` | ContentAtom/ContentVariant-backed public post cards, list, and SESSION_0224 media carousel wrapper. `ContentPostMediaCarousel` composes `Carousel`/`CarouselSlide` and renders inherited atom media for IMAGE, VIDEO, YOUTUBE, and document fallback cases. |

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

### Media library admin — `app/admin/media/_components/`

| Component | File | Purpose |
| --- | --- | --- |
| `MediaUploader` | `media-uploader.tsx` | Upload button + hidden file input → `uploadMediaToLibrary` admin action (S3 upload + `Media` record); `router.refresh()` on success. SESSION_0287. |
| `DeleteMediaButton` | `delete-media-button.tsx` | Thin wrapper over the generic `DeleteDialog`, wired to `deleteMedia` (S3 object + DB row cleanup). Reuses — does not fork — the confirm dialog. SESSION_0287. |

---

## 6. Auth, dialogs, lead capture — `components/web/`

| Component | File | Purpose |
| --- | --- | --- |
| `Login`, `LoginButton`, `LoginDialog`, `LoginForm` | `components/web/auth/login*.tsx` | Public login surfaces. |
| Tool claim/embed/report dialogs | `components/web/dialogs/tool-*.tsx` | Public tool-action dialogs. |
| `LeadCaptureForm` | `components/web/lead-capture-form.tsx` | Public lead capture. |
| `CTAForm`, `CTAProof` | `components/web/cta-form.tsx`, `cta-proof.tsx` | Public CTA surfaces with social proof. |

---

## 7. Org self-service settings — `app/(web)/organizations/[slug]/settings/`

> Owner + ORG_ADMIN gated surface (auth via `hasOrgAdminAccess` on pages, `assertOrgAdminAccess` in actions — `server/web/organization/org-admin-access.ts`). Distinct from the platform-admin `/admin/memberships` area: org-scoped, exposed to org admins, not platform staff.

| Component | File | Purpose |
| --- | --- | --- |
| Settings index | `settings/page.tsx` | Section-card hub (Members, Theme & Branding). `hasOrgAdminAccess` gate; non-admins get `OrgAccessDenied`. SESSION_0295 (Theme), SESSION_0296 (Members). |
| `SelfServiceThemeForm` | `settings/theme/_components/self-service-theme-form.tsx` | Org owner/ORG_ADMIN theme editor → `updateOrgThemeSelfService`. SESSION_0294. |
| Members page | `settings/members/page.tsx` | Roster + approval queue. Partitions PENDING into an approval-queue section (Approve/Reject cards) and a read-only roster (status + role badges). Vertical layout uses plain `flex flex-col` — **not `Stack`** — because `Stack` defaults to `direction="row"` and `column` mode applies `items-start` (shrink-wraps full-width Cards). SESSION_0296. |
| `MemberApprovalActions` | `settings/members/_components/member-approval-actions.tsx` | Client approve/reject for a PENDING join request → `transitionOrgMembershipStatus` (Approve→ACTIVE, Reject→CANCELLED). sonner toasts + `router.refresh()`. Mirrors platform `MembershipStatusActions` conventions. SESSION_0296. |

> Server: `transitionOrgMembershipStatus` (`server/web/organization/membership-actions.ts`) mirrors the platform-admin transition contract (VALID_TRANSITIONS guard, optimistic lock, audit + email notify) but re-asserts org access and **guards `membership.organizationId === organizationId`** so an org admin cannot transition another org's member by ID. Brand sourced from the membership row (userActionClient ctx has no brand). Roster query: `getOrganizationMembers` in `server/web/organization/queries.ts` (uncached — approvals must reflect immediately).

---

## How to update this file

- When a new custom component lands: add a row to the appropriate section in the same session that adds the file. If no section fits, create a new H2 with a one-line scope sentence and add the first row.
- When a notable behavior changes (visibility rules, timezone pinning, cycle guards, side-effects): edit the "Notable behavior" cell so future agents see the constraint without reading the file.
- When a component is removed: delete the row; do not leave tombstones. Git history is the audit trail.
- Bump `updated:` and `last_agent:` in this file's frontmatter on every change.
