---
title: "SESSION 0076 — Petey Plan: Admin UI for TournamentRole, StaffAssignment, WeighIn, RuleSet"
slug: session-0076-plan
type: plan
status: ready
created: 2026-05-05
updated: 2026-05-05
last_agent: copilot-session-0075
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0075.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan — SESSION_0076: Admin UI for Tournament Staff, WeighIn, RuleSet

## Context

SESSION_0075 delivered server-side CRUD (schemas, actions, queries) for four schema-only model groups:

- **TournamentRole** — lookup table (code, name, isSystem, brand-scoped)
- **TournamentStaffAssignment** — join: tournament × user × role (optional division)
- **WeighInRecord** — per-registration weight recording with official flag
- **RuleSet** — scoring rules (duration, method, config, discipline-linked)

SESSION_0076 builds the admin UI layer. Every page follows the **gold-standard 6-file pattern** from `admin/categories/`.

## Admin Component Deep-Dive (pre-flight)

### `withAdminPage` HOC (`auth-hoc.tsx`)

Simple but critical: wraps page components, calls `getServerSession()`, returns `notFound()` if `role !== "admin"`. Not a redirect — a 404. This prevents revealing admin routes exist. **Every page we create MUST use this.** It's a one-liner wrapper: `export default withAdminPage(async ({ searchParams }) => { ... })`.

### Shell + Sidebar + Nav architecture

- **`Shell`** = `Sidebar` + content area. Already wired in `app/admin/layout.tsx`. We don't touch Shell — our pages render inside it automatically.
- **`Sidebar`** = instantiates `Nav` with a `links[]` array. Currently has NO tournament entry. The sidebar groups links with `undefined` separators. Tournaments should go in the "content entities" group (after Schedule, before Quick Menu).
- **`Nav`** = renders each link as a `Button variant="ghost"` + `Link`. Active state: `pathname.startsWith(href)`, so `/admin/tournaments` highlights for `/admin/tournaments/roles` and `/admin/tournaments/rule-sets` too. Supports optional `suffix` for counts (renders as `Badge variant="outline"`), `label` for badges, and collapsed mode (mobile → `Tooltip` on hover).

### `Tooltip` component (deeper than you'd think)

`Tooltip` is a compound component with two usage modes:

1. **Simple:** `<Tooltip tooltip="text">{children}</Tooltip>` — wraps children in trigger, renders tooltip on hover. Gracefully returns just `children` if `tooltip` is falsy.
2. **Compound:** `<Tooltip.Root>` / `<Tooltip.Trigger>` / `<Tooltip.Content>` for complex cases.

Props include `side`, `sideOffset`, `delayDuration`. Content is styled with `z-50 max-w-60 text-xs bg-foreground text-background rounded-md` and includes an arrow.

**Where we need Tooltip in SESSION_0076:**

- **System role protection:** Wrap the delete button on system roles with `<Tooltip tooltip="System roles cannot be deleted">` — the button itself is `disabled`, tooltip explains why.
- **RuleSet scoring method:** Tooltip on the `Badge` explaining what each scoring method means (e.g., "TEN_POINT_MUST" → "Boxing/Muay Thai/WEKAF 10-point must scoring system").
- **Staff assignment division scope:** Tooltip on division badge explaining "This staff member is scoped to this division only".
- **WeighIn official badge:** Tooltip on the "Official" badge: "This is the official weigh-in used for division eligibility".
- **Truncated names/codes in table cells:** Any cell with `truncate` class should get a `<Tooltip tooltip={fullValue}>`.
- **Icon-only buttons:** Every icon-only `Button` (edit, delete, ellipsis) should have a tooltip per L1 convention.

### `Toaster` / `toast()` from sonner (deeper than you'd think)

The `Toaster` component is already mounted in the app layout. We use `toast()` from `sonner` to trigger notifications. Four variants with distinct styling:

- `toast.success("...")` — green bg, white text, check icon
- `toast.error("...")` — red bg, white text, X icon
- `toast.info("...")` — dark bg, light text, help icon
- `toast("...")` — default bg, border, standard text

**Advanced pattern: `toast.promise()`** — used in `category-actions.tsx` and `user-actions.tsx` for async operations. Provides loading/success/error states in a single call:

```typescript
toast.promise(
  async () => {
    const { serverError } = await executeAsync({ id })
    if (serverError) throw new Error(serverError)
  },
  {
    loading: "Duplicating role...",
    success: "Role duplicated successfully",
    error: (err) => `Failed: ${err.message}`,
  },
)
```

**Where we need toast in SESSION_0076:**

- Form `onSuccess` / `onError` (all 4 entity forms) — `toast.success` / `toast.error`
- Delete dialog callbacks — `toast.success("Deleted")` / `toast.error`
- Staff assignment add/remove — `toast.success("Staff assigned")` / `toast.error`
- WeighIn record/mark official — `toast.success("Weight recorded")` / `toast.success("Marked as official")`
- Any duplicate action (if we add one for roles/rulesets) — `toast.promise` pattern

### `RelationSelector` — more useful than I initially said

Looking at the full source, `RelationSelector` is a `Command`-based multi-select inside a `Popover`. The core API without AI:

- `relations: T[]` — list of available relations
- `selectedIds: string[]` — currently selected IDs
- `setSelectedIds: (ids: string[]) => void` — callback to update
- Optional `mapFunction`, `sortFunction` for display customization

The AI suggestion part (`useCompletion`) only triggers when `prompt` is provided AND no selections exist. **Without `prompt`, it's just a searchable multi-select with badges.**

**Where this is useful in SESSION_0076:**

- ~~Staff assignment user picker~~ — Actually NO. `RelationSelector` is for multi-select (many-to-many). Staff assignment is a single user per row. Use `Select` instead.
- **RuleSet form → discipline picker** — Could use `RelationSelector` if a rule set could apply to multiple disciplines. But schema says `disciplineId: String?` (single FK). Use `Select`.
- **Division role picker on staff form** — single FK, use `Select`.

**Verdict:** `RelationSelector` isn't needed this session. It's for many-to-many relations (categories↔tools, tags↔tools). Our models are all single FK relationships.

### `Hint` component

`Hint` renders validation errors as red text (`text-xs font-medium text-red-500/75`). It's distinct from `FormMessage` (which is the RHF-integrated error display). Use `Hint` for standalone hints outside of `FormField` context.

### `Switch` component

Radix-based toggle switch with `Box focusWithin` wrapper. Used for boolean fields. **Use for:** `isSystem` toggle on TournamentRole and RuleSet forms, `isOfficial` toggle on WeighIn form.

### Metrics system

`MetricValue` = `Card` + `Link` + `MetricHeader` (label + count). Used on the admin dashboard for entity counts (Tools, Categories, Users). Each takes a `Promise<number>` query prop and renders inside `Suspense` with `MetricValueSkeleton`.

`MetricChart` = `Card` + `MetricHeader` + `Chart`. The `Chart` component renders a bar chart with Tooltips per bar, optional average line, and date formatting.

**Opportunity:** Add tournament metric cards to the admin dashboard:

- "Tournaments" count → `/admin/tournaments`
- "Rule Sets" count → `/admin/tournaments/rule-sets`

### `DeleteDialog` internals

Uses `useAction` (not `useHookFormAction`) with the `idsSchema`. Renders `Dialog` → `DialogContent` → `DialogHeader` (title + pluralized description using `plur()`) → `DialogFooter` (Cancel + Delete with `isPending`). Entity wrappers are thin: map entity array to `ids[]`, provide toast callbacks.

**System role guard:** For TournamentRole and RuleSet, the delete action already filters `isSystem: false`. But the UI should ALSO prevent the delete button from appearing on system rows — use `row.original.isSystem` check in the actions column, and wrap in `Tooltip` when disabled.

### `category-actions.tsx` — The gold-standard row action pattern

This is the pattern to copy exactly:

1. `DropdownMenu modal={false}` — prevents scroll lock
2. `DropdownMenuTrigger` with `Button variant="secondary" size="sm" prefix={<EllipsisIcon />}`
3. `DropdownMenuContent align="end" sideOffset={8}`
4. Menu items: Edit (link), View (external link), Separator, Duplicate (`toast.promise` + `useAction`)
5. Separate `DeleteDialog` button outside the dropdown (in a `Stack` wrapper)
6. Both the DropdownMenu trigger and delete button are in a `Stack size="sm" wrap={false}`

### What about Tags, Categories, Content/Posts features?

- **Tags/Categories** on our models: TournamentRole has `code` (like a tag) and RuleSet has `disciplineId` (a category-like relationship). But these are NOT the same as the L1 tag/category system. The L1 Tags and Categories are for the Tool entity (Dirstarter's core listing). Our tournament entities don't need tags or categories.
- **Content/Posts:** Not relevant for tournament ops admin. MDX content collections are for the blog. We don't need content admin features.
- **AI features (`AIGenerateDescription`, `AIGenerateContent`):** Could be useful for RuleSet descriptions (auto-generate from name + scoring method + discipline). Low priority but worth noting as a future enhancement. Don't add in SESSION_0076.

## Architecture Decisions

### Where these pages live

| Model | Admin Route | Rationale |
|---|---|---|
| **TournamentRole** | `/admin/tournaments/roles/` (list) + `/admin/tournaments/roles/new` + `/admin/tournaments/roles/[id]` | Sub-entity of tournaments domain; not its own top-level nav item. |
| **RuleSet** | `/admin/tournaments/rule-sets/` (list) + `/admin/tournaments/rule-sets/new` + `/admin/tournaments/rule-sets/[id]` | Same — belongs under tournament ops. |
| **TournamentStaffAssignment** | Tab/section on `/admin/tournaments/[id]` page | Staff is always in context of a specific tournament. Embedded table, not a standalone page. |
| **WeighInRecord** | Tab/section on registrations detail (or inline on tournament detail) | Weigh-ins are always in context of a specific registration. Inline widget, not a standalone page. |

### Navigation

Add a sub-nav or link group on the tournaments list page header pointing to:
- `/admin/tournaments` (main list — existing)
- `/admin/tournaments/roles` (new)
- `/admin/tournaments/rule-sets` (new)

## Task Breakdown

### TASK_01 — TournamentRole admin CRUD pages (gold standard)

**6 files:**

```
app/admin/tournaments/roles/
  page.tsx                                    # List page (server component)
  new/page.tsx                                # Create page
  [id]/page.tsx                               # Edit page
  _components/
    tournament-role-form.tsx                   # Form (useHookFormAction)
    tournament-role-actions.tsx                # Row action dropdown (DropdownMenu)
    tournament-roles-table.tsx                 # DataTable wrapper
    tournament-roles-table-columns.tsx         # Column defs
    tournament-roles-table-toolbar-actions.tsx  # Bulk delete
    tournament-roles-delete-dialog.tsx         # DeleteDialog wrapper
```

**Schema additions needed** (in `server/admin/tournaments/schema.ts`):

```typescript
export const tournamentRolesTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<TournamentRole>().withDefault([{ id: "name", desc: false }]),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const tournamentRolesTableParamsCache = createSearchParamsCache(tournamentRolesTableParamsSchema)
```

**Query update** (`queries.ts`): `findTournamentRoles` needs pagination support (currently returns all). Add `findTournamentRolesPaginated(search)` following `findTournaments` pattern.

**Form fields:**

| Field | Component | Notes |
|---|---|---|
| `code` | `Input` | Required. Auto-computed from name via `useComputedField` (slugify/uppercase). |
| `name` | `Input` | Required. |
| `description` | `TextArea` | Optional. |
| `isSystem` | `Switch` | Default false. Disabled on system roles. |

**Table columns:**

| Column | Component | Notes |
|---|---|---|
| select | `RowCheckbox` | Multi-select |
| `name` | `DataTableLink` → `/admin/tournaments/roles/[id]` | Primary link |
| `code` | `Badge` variant="outline" | Visual code tag |
| `isSystem` | `Badge` variant="soft" or "info" | System vs custom indicator |
| `_count.staffAssignments` | `Badge` with HashIcon | Usage count |
| `createdAt` | `Note` + `formatDate` | Standard |
| actions | `TournamentRoleActions` dropdown | Edit, delete (disabled if isSystem) |

**Delete guard:** System roles (`isSystem: true`) cannot be deleted. The `deleteTournamentRoles` action already filters this. UI should disable delete button and show tooltip "System roles cannot be deleted".

### TASK_02 — RuleSet admin CRUD pages (gold standard)

**6 files:**

```
app/admin/tournaments/rule-sets/
  page.tsx
  new/page.tsx
  [id]/page.tsx
  _components/
    rule-set-form.tsx
    rule-set-actions.tsx
    rule-sets-table.tsx
    rule-sets-table-columns.tsx
    rule-sets-table-toolbar-actions.tsx
    rule-sets-delete-dialog.tsx
```

**Schema additions:** `ruleSetsTableParamsSchema` + cache (same pattern as roles).

**Query update:** Add `findRuleSetsPaginated(search)` with pagination/search/sort.

**Form fields:**

| Field | Component | Notes |
|---|---|---|
| `name` | `Input` | Required. |
| `description` | `TextArea` | Optional. |
| `matchDurationSec` | `Input` type="number" | Optional. Label: "Match Duration (seconds)". |
| `overtimeSec` | `Input` type="number" | Optional. Label: "Overtime (seconds)". |
| `scoringMethod` | `Select` | Enum values: POINTS, SUBMISSION, DECISION, DISQUALIFICATION, TIME, CUSTOM. |
| `disciplineId` | `Select` | Optional. Populated from disciplines query. Label: "Discipline (optional)". |
| `isSystem` | `Switch` | Default false. |

**Table columns:**

| Column | Component | Notes |
|---|---|---|
| select | `RowCheckbox` | |
| `name` | `DataTableLink` | |
| `scoringMethod` | `Badge` variant="outline" | Color-coded by method |
| `matchDurationSec` | `Note` | Display as "3:00" formatted, or "—" if null |
| `discipline.name` | `Note` or `Badge` | Linked discipline, or "All" if null |
| `isSystem` | `Badge` | |
| `_count.tournamentDisciplines` | `Badge` + HashIcon | Usage count |
| `createdAt` | `Note` | |
| actions | `RuleSetActions` | |

### TASK_03 — TournamentStaffAssignment embedded panel on tournament detail

**Not a standalone page.** This is an inline `Card`-based panel on the tournament `[id]/page.tsx`.

**New components:**

```
app/admin/tournaments/_components/
  staff-panel.tsx               # Card with embedded staff table + add form
  staff-assignment-form.tsx     # Dialog-based add/edit form
```

**Staff panel design:**

- Wrapped in `Card` + `CardHeader` with title "Staff Assignments" + `Button` "Add Staff"
- Uses a simple `Table` (not full DataTable — staff lists are typically <20 rows per tournament)
- Each row: user name, role badge, division badge (if scoped), notes, actions dropdown (edit, remove)
- "Add Staff" opens a `Dialog` with:
  - `userId` → `Select` or searchable `Command` (populated from users query)
  - `tournamentRoleId` → `Select` (populated from `findTournamentRoles`)
  - `divisionId` → `Select` (optional, populated from tournament's divisions)
  - `notes` → `TextArea`
- Form uses `useHookFormAction` with `upsertTournamentStaffAssignment`

**Query needed:** `findTournamentStaff(tournamentId)` already exists.

**Tournament detail page update:** Add `<StaffPanel tournamentId={tournament.id} />` below `<DivisionsEditor>`.

### TASK_04 — WeighInRecord inline widget on registration detail

**Not a standalone page.** Weigh-ins appear in context of a registration.

**New components:**

```
app/admin/tournaments/_components/
  weigh-in-panel.tsx            # Card with weigh-in history + add form
```

**WeighIn panel design:**

- Wrapped in `Card` + `CardHeader` with title "Weigh-Ins" + `Button` "Record Weight"
- Simple table: weight (formatted as "XX.XX kg"), recorded by, date/time, official badge, actions
- Official weigh-in gets a `Badge` variant="success" with "Official"
- "Record Weight" opens a `Dialog`:
  - `weightKg` → `Input` type="number" step="0.01"
  - `isOfficial` → `Switch`
  - `notes` → `TextArea`
- Row actions: "Mark Official" (calls `markWeighInOfficial`), "Delete"
- Form uses `useHookFormAction` with `createWeighInRecord`

**Query:** `findWeighInRecords(registrationId)` already exists.

**Integration point:** This panel will be added to a future registration detail view. For now, create the component standalone — it accepts `registrationId` as prop and can be dropped in anywhere.

### TASK_05 — Sidebar nav + dashboard metrics + sub-nav wiring

**Sidebar update** (`components/admin/sidebar.tsx`):

Add a "Tournaments" entry with `SwordsIcon` (or `TrophyIcon`) between the existing "Schedule" separator and the "Quick Menu" separator. The `Nav` component's `pathname.startsWith(href)` logic means `/admin/tournaments` will stay highlighted for all sub-routes.

```typescript
{
  title: "Tournaments",
  href: "/admin/tournaments",
  prefix: <TrophyIcon />,
},
```

**Dashboard metrics** (`app/admin/page.tsx`):

Add tournament-related metric cards to the counters array:

```typescript
{ label: "Tournaments", href: "/admin/tournaments", query: db.tournament.count() },
{ label: "Rule Sets", href: "/admin/tournaments/rule-sets", query: db.ruleSet.count() },
```

These use the existing `MetricValue` + `MetricValueSkeleton` + `Suspense` pattern — zero new components needed.

**Sub-navigation on tournament pages:**

Add a `Stack` with `Button` links at the top of the tournament list page (`app/admin/tournaments/page.tsx`) pointing to Roles and Rule Sets. Use `Badge` with counts for each. Pattern:

```tsx
<Stack size="sm">
  <Button variant="ghost" size="sm" asChild>
    <Link href="/admin/tournaments">Tournaments</Link>
  </Button>
  <Button variant="ghost" size="sm" suffix={<Badge variant="outline">{rolesCount}</Badge>} asChild>
    <Link href="/admin/tournaments/roles">Roles</Link>
  </Button>
  <Button variant="ghost" size="sm" suffix={<Badge variant="outline">{ruleSetsCount}</Badge>} asChild>
    <Link href="/admin/tournaments/rule-sets">Rule Sets</Link>
  </Button>
</Stack>
```

## Component Inventory Compliance Check

| Component Used | From | Compliance |
|---|---|---|
| `useHookFormAction` | `@next-safe-action/adapter-react-hook-form` | ✅ Gold standard form |
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | `components/common/form` | ✅ |
| `Input` | `components/common/input` | ✅ |
| `TextArea` | `components/common/textarea` | ✅ |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | `components/common/select` | ✅ |
| `Switch` | `components/common/switch` | ✅ |
| `DataTable` + full system | `components/data-table/` | ✅ |
| `useDataTable` | `hooks/use-data-table` | ✅ |
| `DataTableHeader`, `DataTableToolbar`, `DataTableColumnHeader`, `DataTableLink` | `components/data-table/` | ✅ |
| `DataTableViewOptions`, `DataTableSkeleton` | `components/data-table/` | ✅ |
| `RowCheckbox` | `components/admin/row-checkbox` | ✅ |
| `DateRangePicker` | `components/admin/date-range-picker` | ✅ |
| `DeleteDialog` | `components/admin/dialogs/delete-dialog` | ✅ |
| `Badge` | `components/common/badge` | ✅ |
| `Button` | `components/common/button` | ✅ |
| `Card`, `CardHeader` | `components/common/card` | ✅ |
| `Stack` | `components/common/stack` | ✅ |
| `H3` | `components/common/heading` | ✅ |
| `Note` | `components/common/note` | ✅ |
| `Link` | `components/common/link` | ✅ |
| `Dialog` + family | `components/common/dialog` | ✅ |
| `DropdownMenu` + family | `components/common/dropdown-menu` | ✅ |
| `Tooltip` | `components/common/tooltip` | ✅ (system role disable hint) |
| `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` | `components/common/table` | ✅ (staff + weighin inline tables) |
| `MetricValue`, `MetricValueSkeleton` | `components/admin/metrics/metric-value` | ✅ (dashboard counters) |
| `MetricHeader`, `MetricHeaderSkeleton` | `components/admin/metrics/metric-header` | ✅ (used by MetricValue) |
| `Shell` | `components/admin/shell` | ✅ (admin layout — already wired) |
| `Sidebar` | `components/admin/sidebar` | ✅ (add tournament nav entry) |
| `Nav` | `components/admin/nav` | ✅ (link array with active state detection) |
| `Chart` | `components/admin/chart` | Available but not needed this session |
| `RelationSelector` | `components/admin/relation-selector` | Available for staff user picker upgrade (future) |
| `useComputedField` | `hooks/use-computed-field` | ✅ (name → code auto-gen) |
| `withAdminPage` | `components/admin/auth-hoc` | ✅ |
| `Wrapper` | `components/common/wrapper` | ✅ |
| `adminActionClient` | `lib/safe-actions` | ✅ |
| `cx` | `lib/utils` | ✅ (class composition — never raw template literals) |

**Raw HTML usage: ZERO.** All layout via `Stack`, all containers via `Card`, all headings via `H3`, all forms via `Form`/`FormField`.

## Estimated Effort

| Task | Files | Estimate |
|---|---|---|
| TASK_01 — TournamentRole pages | 9 + schema/query additions | ~45 min |
| TASK_02 — RuleSet pages | 9 + schema/query additions | ~45 min |
| TASK_03 — Staff panel | 2 components + tournament detail wiring | ~30 min |
| TASK_04 — WeighIn panel | 1 component | ~20 min |
| TASK_05 — Sidebar + dashboard + sub-nav | Sidebar entry + MetricValue cards + sub-nav links | ~20 min |
| **Total** | | **~2.5 hours** |

## Execution Order

1. TASK_01 (TournamentRole) — establishes the sub-route pattern under `/admin/tournaments/`
2. TASK_02 (RuleSet) — mirrors TASK_01 structure
3. TASK_05 (Sub-nav) — wire both pages into navigation
4. TASK_03 (Staff panel) — embedded on existing tournament detail
5. TASK_04 (WeighIn panel) — standalone component, drop in when registration detail page exists

## Open Decisions

- **Staff user selector:** Use basic `Select` (simple, works for <100 users) or `Command`-based search (better for scale)? **Recommendation:** Start with `Select`, upgrade to `Command` + search when user count demands it.
- **Registrations detail page:** Doesn't exist yet. WeighIn panel (TASK_04) will be a standalone component ready to be placed. Should we create a basic registration detail page in this session? **Recommendation:** No — keep scope tight. Create the component, wire it in a follow-up session.

## Pre-flight Passed

- [x] Component inventory consulted (this plan)
- [x] No raw HTML planned
- [x] All forms use `useHookFormAction` + `Form` + `FormField`
- [x] All tables use `DataTable` + `useDataTable`
- [x] All modals use `Dialog`
- [x] All row actions use `DropdownMenu`
- [x] All deletes use `DeleteDialog`
- [x] All pages use `withAdminPage` HOC
