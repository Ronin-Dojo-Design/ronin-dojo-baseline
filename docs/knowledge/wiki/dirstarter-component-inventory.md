---
title: "Dirstarter Component Inventory"
slug: dirstarter-component-inventory
type: reference
status: active
created: 2026-05-04
updated: 2026-06-04
last_agent: codex-session-0340
pairs_with:
  - docs/architecture/dirstarter-baseline-index.md
  - docs/knowledge/wiki/dirstarter-gap-audit.md
  - docs/sprints/SESSION_0340.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0051.md
  - docs/sprints/SESSION_0208.md
  - docs/sprints/SESSION_0212.md
  - docs/sprints/SESSION_0214.md
  - docs/sprints/SESSION_0215.md
---

# Dirstarter Component Inventory

> **MANDATORY PRE-FLIGHT REFERENCE.** Every Petey plan and every Cody pre-flight MUST consult this document before designing or building any UI. If a component listed here can do the job, USE IT. Do not hand-roll HTML. Violations are FS-0001 class failures.

---

## 1. `components/common/` — UI Primitives

Every component below is in `~/components/common/`. Import from there.

### Layout & Structure

| Component | File | Key Props / Variants | Use For |
|---|---|---|---|
| `Stack` | `stack.tsx` | `size: xs\|sm\|md\|lg`, `direction: row\|column`, `wrap: bool`, `render` | Flex container — replaces raw `<div className="flex ...">`. Use everywhere. SESSION_0213: legacy `asChild` removed; use Base UI `render`. |
| `Card`, `CardHeader`, `CardFooter`, `CardDescription` | `card.tsx` | Standard card layout | Content cards, match cards, any bordered container |
| `boxVariants` | `box.tsx` | `hover`, `focus`, `focusWithin` | Utility classes for interactive borders/focus states. SESSION_0212: upstream deletes the `Box` wrapper; apply `boxVariants` directly to real elements instead of importing `Box`. |
| `Wrapper` | `wrapper.tsx` | Layout wrapper | Page-level content wrapper |
| `Separator` | `separator.tsx` | `orientation: horizontal\|vertical` | Visual dividers |
| `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `accordion.tsx` | Base UI Accordion; `type="multiple"` compatibility; `AccordionContent` wraps Base UI `Panel` | Collapsible sections. SESSION_0214: migrated off Radix; uses `data-open` / `data-closed` state selectors. |
| `Carousel`, `CarouselSlide` | `carousel.tsx` | Embla-backed. `Carousel`: `options`, `className`, optional `emptyState`, `ariaLabel`, `role`, `edgeFades`, `controls: always\|desktop\|none`. `CarouselSlide`: optional `width: 168\|248\|280`; `className` flex-basis overrides still win. | Shared horizontal carousel/rail primitive. SESSION_0340: extended for PORTMAP-0004 dense-rail mode with labelled regions, optional edge fades, desktop-only control mode, empty-state bypass, and ResizeObserver-driven `reInit`; no second carousel component. |
| `AnimatedContainer` | `animated-container.tsx` | `height`, `transition` | Smooth height transitions |
| `Skeleton` | `skeleton.tsx` | — | Loading placeholders |
| `Prose` | `prose.tsx` | — | Long-form text styling |

### Typography

| Component | File | Key Props | Use For |
|---|---|---|---|
| `H3` (+ other headings) | `heading.tsx` | `render` (Base UI polymorphic tag), `size: h1\|h2\|h3\|h4\|h5\|h6` | Section headings — don't use raw `<h3>`. SESSION_0211: legacy `as`/`asChild` removed; use `render={(props) => <h3 {...props}>{props.children}</h3>}` when rendered tag differs from visual size. |
| `Label` | `label.tsx` | `isRequired` | Form labels — don't use raw `<label>` |
| `Hint` | `hint.tsx` | — | Help text below form fields |
| `Note` | `note.tsx` | — | Muted secondary text |
| `Link` | `link.tsx` | Standard Next.js link | Internal navigation — don't use raw `<a>` |
| `Kbd` | `kbd.tsx` | — | Keyboard shortcut display |
| `ShowMore` | `show-more.tsx` | — | Truncated text with expand |

### Forms

| Component | File | Key Props | Use For |
|---|---|---|---|
| `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` | `form.tsx` | React Hook Form `FormProvider` | **ALL forms.** Never use raw `<form>` + manual state. |
| `Field`, `FieldSet`, `FieldGroup`, `FieldLegend`, `FieldLabel`, `FieldContent`, `FieldDescription`, `FieldSeparator`, `FieldError`, `FieldTitle` | `field.tsx` (L5 port from upstream `7e724b6`) | `orientation: vertical\|horizontal\|responsive` on `Field`; `variant: legend\|label` on `FieldLegend`; `errors?` on `FieldError`; `data-required` attribute on `FieldLabel` renders the destructive asterisk marker. | Compose form field rows. `<FieldSet>` is the semantic `<fieldset>`; `<Field>` is the per-row wrapper. Set `data-required` on `<FieldLabel>` to surface the required marker. Used by upstream-derived form patterns; safe to layer on existing `Form*` flows. |
| `Input`, `inputVariants` | `input.tsx` | Standard input + variant classes | Text inputs — never use raw `<input>` |
| `TextArea` | `textarea.tsx` | — | Multi-line text |
| `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | `select.tsx` | Radix-based | Dropdowns — never use raw `<select>` |
| `RadioGroup`, `RadioGroupItem` | `radio-group.tsx` | Base UI `@base-ui/react/radio` + `@base-ui/react/radio-group` (SESSION_0216) | Radio buttons — never use raw `<input type="radio">` |
| `Checkbox` | `checkbox.tsx` | Base UI `@base-ui/react/checkbox` (SESSION_0216). Use `indeterminate` prop for indeterminate state. | Checkboxes — never use raw `<input type="checkbox">` |
| `Switch` | `switch.tsx` | Base UI `@base-ui/react/switch` (SESSION_0216) | Toggle switches |
| `Calendar` | `calendar.tsx` | react-day-picker based | Date pickers |
| `FormMedia` | `form-media.tsx` | Image upload with preview | Media/image upload fields |
| `Search` | `search.tsx` | — | Search input with icon |

### Feedback & Overlays

| Component | File | Key Props | Use For |
|---|---|---|---|
| `Dialog`, `DialogContent`, `DialogTrigger`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | `dialog.tsx` | Radix-based | Modals — never use inline expansion for forms |
| `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuTrigger`, `DropdownMenuItem`, `DropdownMenuSeparator` | `dropdown-menu.tsx` | Radix-based | Action menus — never use inline buttons for row actions |
| `Popover`, `PopoverContent`, `PopoverTrigger` | `popover.tsx` | Radix-based | Small overlays |
| `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | `hover-card.tsx` | Base UI PreviewCard wrapper; trigger uses `render`; content supports `align`, `side`, `sideOffset` | Hover previews. SESSION_0214: migrated off Radix while preserving Ronin export names. |
| `Command`, `CommandEmpty`, `CommandGroup`, `CommandInput`, `CommandItem`, `CommandList` | `command.tsx` | cmdk-based | Command palettes, searchable lists |
| `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `tooltip.tsx` | Base UI compound parts; trigger uses `render`, content supports `side`, `align`, `sideOffset`, and `size: sm\|md\|lg`; provider uses `delay` | Hover tips for truncated text or icon-only buttons. SESSION_0215: legacy `tooltip=` wrapper and `delayDuration` were removed; compose `Tooltip` + `TooltipTrigger` + `TooltipContent`. |
| `Toaster` | `toaster.tsx` | Sonner-based; variants: default, info, success, error | Toast notifications — use via `toast()` from `sonner` |
| `Ping` | `ping.tsx` | — | Animated dot indicator |

### Data Display

| Component | File | Key Props | Use For |
|---|---|---|---|
| `Badge` | `badge.tsx` | `variant: primary\|soft\|outline\|success\|warning\|info\|danger`, `size: sm\|md\|lg`, `prefix`, `suffix` | Status labels, tags, counts |
| `Avatar`, `AvatarImage`, `AvatarFallback` | `avatar.tsx` | — | User/competitor profile pics |
| `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` | `table.tsx` | Grid-based table | Use via DataTable system, not directly |
| `Button` | `button.tsx` | `variant: primary\|secondary\|destructive\|ghost`, `size: sm\|md\|lg`, `prefix`, `suffix`, `isPending` | All buttons |
| `ButtonGroup` | `button-group.tsx` (L5 port from upstream `7e724b6`) | `<div role="group">` with `*:rounded-none *:first-of-type:rounded-l-md *:last-of-type:rounded-r-md *:not-first-of-type:-ml-px` to fuse adjacent buttons into a single visual cluster. | Cluster adjacent `Button`s into one connected control (segmented controls, paired primary+menu actions). Visual grouping only — not a form `<fieldset>`. |
| `toolStatusBadgeProps`, `toolStatusIcon` | `tool-status.tsx` (L5 port from upstream `7e724b6`) | Two `Record<ToolStatus, …>` maps keyed by the L3 `ToolStatus` enum (`Draft\|Pending\|Scheduled\|Published\|Rejected\|Deleted`). `toolStatusBadgeProps` → `ComponentProps<typeof Badge>`; `toolStatusIcon` → `ReactNode`. | Shared between admin and dashboard tool tables so a status cell renders identically everywhere. Distinct from L4's `listing-tier-badge` (tier = monetization, status = lifecycle). |
| `Slottable` | `slottable.tsx` | — | Composition utility |

### Icons

| Path | Content |
|---|---|
| `components/common/icons/` | Custom icon components |

---

## 2. `components/admin/` — Admin-Specific Components

### Core Admin Components

| Component | File | Purpose | Key Props |
|---|---|---|---|
| `Shell` | `shell.tsx` | Admin page layout (sidebar + content) | `children` |
| `Sidebar` | `sidebar.tsx` | Admin navigation sidebar | — |
| `Nav` | `nav.tsx` | Admin nav items | — |
| `withAdminPage` | `auth-hoc.tsx` | HOC — wraps page component with admin auth check, redirects non-admins | `(Component, redirectPath?)` |
| `DeleteDialog` | `dialogs/delete-dialog.tsx` | **Generic reusable delete confirmation.** Takes `ids`, `label`, `action`, `callbacks`. | See §9 pattern below. |
| `RelationSelector` | `relation-selector.tsx` | Multi-select with search, badges, AI suggestions. Uses `Command` + `Popover` + `Badge`. | `relations`, `selectedIds`, `prompt`, `setSelectedIds` |
| `RowCheckbox` | `row-checkbox.tsx` | Shift-click multi-select for DataTable rows | `table`, `row` |
| `DateRangePicker` | `date-range-picker.tsx` | Date range filter for tables | — |
| `Chart` | `chart.tsx` | Chart component (Recharts-based) | — |

### Admin AI Components (`admin/ai/`)

| Component | File | Purpose |
|---|---|---|
| `AIGenerateDescription` | `ai/generate-description.tsx` | AI-powered description generation for forms |
| `AIGenerateContent` | `ai/generate-content.tsx` | AI-powered content generation |
| `AIGenerate` | `ai/generate.tsx` | Base AI generation component |

### Admin Metrics (`admin/metrics/`)

| Component | File | Purpose |
|---|---|---|
| `MetricChart` | `metrics/metric-chart.tsx` | Dashboard metric chart |
| `MetricHeader` | `metrics/metric-header.tsx` | Metric card header |
| `MetricValue` | `metrics/metric-value.tsx` | Metric value display |

### Admin Tournaments (`admin/tournaments/`)

| Component | File | Purpose | L1 Status |
|---|---|---|---|
| `RegistrationsTable` | `tournaments/registrations-table.tsx` | Registration list for tournament detail | **Custom — needs DataTable audit** |
| `RegistrationsTableColumns` | `tournaments/registrations-table-columns.tsx` | Column defs | **Custom** |

---

## 3. `components/data-table/` — DataTable System

The DataTable system is a **complete, reusable table framework** built on TanStack Table v8. It handles pagination, sorting, filtering, column visibility, row selection, and URL-synced state. **ALL admin list views MUST use this system.**

| Component | File | Purpose |
|---|---|---|
| `DataTable` | `data-table.tsx` | Main table renderer — takes `table` instance from `useDataTable` hook, renders headers/rows/pagination. Props: `table`, `floatingBar`, `emptyState`. |
| `DataTableHeader` | `data-table-header.tsx` | Sticky header with title, total count, and call-to-action slot. Props: `title`, `total`, `callToAction`. |
| `DataTableToolbar` | `data-table-toolbar.tsx` | Search + faceted filters + view options + custom actions. Has hotkey `/` for focus. Props: `table`, `filterFields`, `children` (for toolbar actions). |
| `DataTableColumnHeader` | `data-table-column-header.tsx` | Sortable column header with sort indicators. |
| `DataTableFacetedFilter` | `data-table-faceted-filter.tsx` | Multi-select faceted filter (uses Command component). |
| `DataTablePagination` | `data-table-pagination.tsx` | Page navigation + per-page selector. |
| `DataTableViewOptions` | `data-table-view-options.tsx` | Column visibility toggle dropdown. |
| `DataTableLink` | `data-table-link.tsx` | Clickable cell link for navigating to detail. |
| `DataTableSkeleton` | `data-table-skeleton.tsx` | Loading skeleton for table. |

### Hook: `useDataTable` (`hooks/use-data-table.ts`)

```typescript
const { table } = useDataTable({
  data: items,              // Array of row data
  columns: columnDefs,      // ColumnDef[] from TanStack
  pageCount: number,        // Total pages (server-side)
  filterFields: DataTableFilterField[],  // Search + faceted filters
  shallow: false,           // URL sync mode
  clearOnDefault: true,     // Reset URL params on default values
  initialState: {
    pagination: { pageIndex: 0, pageSize: perPage },
    sorting: sort,
    columnPinning: { right: ["actions"] },
  },
  getRowId: (row) => row.id,
})
```

### Schema pattern for table params

```typescript
// In server/admin/{entity}/schema.ts
import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"

export const entityTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<Entity>().withDefault([{ id: "name", desc: false }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const entityTableParamsCache = createSearchParamsCache(entityTableParamsSchema)
```

---

## 4. `components/web/ui/` — Web UI Primitives

| Component | File | Purpose |
|---|---|---|
| `Container` | `container.tsx` | Content width container |
| `Grid` | `grid.tsx` | Responsive grid layout |
| `Section` | `section.tsx` | Page section wrapper |
| `Intro` | `intro.tsx` | Page intro/hero section |
| `Breadcrumbs` | `breadcrumbs.tsx` | Breadcrumb navigation |
| `Logo` | `logo.tsx` | Brand logo |
| `LogoSymbol` | `logo-symbol.tsx` | Brand logo icon |
| `NavLink` | `nav-link.tsx` | Navigation link with active state |
| `Backdrop` | `backdrop.tsx` | Background overlay |
| `Favicon` | `favicon.tsx` | Favicon display |
| `Hamburger` | `hamburger.tsx` | Mobile menu toggle |
| `Sticky` | `sticky.tsx` | Sticky positioning wrapper |
| `Author` | `author.tsx` | Author attribution |
| `Stat` | `stat.tsx` | Statistic display |
| `Tag` | `tag.tsx` | Tag/label display |
| `Tile` | `tile.tsx` | Grid tile |

---

## 5. `components/web/tools/` — Tool Listing Pattern

This is **Dirstarter's core entity pattern for public-facing listings**. The same pattern should be followed for any public entity listing (tournaments, organizations, directory).

| Component | File | Purpose |
|---|---|---|
| `ToolCard` | `tool-card.tsx` | Card for tool in list view |
| `ToolList` | `tool-list.tsx` | Grid/list of tool cards |
| `ToolListing` | `tool-listing.tsx` | Full listing page (query + filters + list) |
| `ToolQuery` | `tool-query.tsx` | Server component that fetches + passes data |
| `ToolSearch` | `tool-search.tsx` | Search input for tools |
| `ToolFilters` | `tool-filters.tsx` | Filter sidebar/bar |
| `ToolHoverCard` | `tool-hover-card.tsx` | Hover preview card |
| `ToolEntry` | `tool-entry.tsx` | Individual tool detail |
| `ToolPreviewAlert` | `tool-preview-alert.tsx` | Draft/preview alert banner |
| `ToolButton` | `tool-button.tsx` | CTA button for tool |
| `ToolActions` | `tool-actions.tsx` | Admin action buttons on tool |

### Pattern: Query → Listing → List → Card

```
ToolQuery (server) → ToolListing (layout) → ToolList (grid) → ToolCard (item)
                                            ToolSearch + ToolFilters (sidebar)
```

This is the template for all public listing pages. Our `tournaments/`, `directory/`, `organizations/` should follow this pattern.

---

## 6. `components/web/` — All Other Web Components

### Auth (`web/auth/`)

| Component | Purpose |
|---|---|
| `LoginButton` | Trigger login flow |
| `LoginDialog` | Login modal |
| `LoginForm` | Email + magic link form |
| `Login` | Composed login page |

### Categories (`web/categories/`)

| Component | Purpose |
|---|---|
| `CategoryCard` | Category display card |
| `CategoryList` | Grid of category cards |
| `CategoryQuery` | Server component data fetcher |

### Directory (`web/directory/`)

| Component | Purpose | L1 Status |
|---|---|---|
| `DirectoryFilters` | Filter controls | Custom — needs audit |
| `DirectoryList` | Listing grid | Custom — needs audit |
| `DirectoryListing` | Full page | Custom — needs audit |
| `DirectoryQuery` | Server data fetch | Custom — needs audit |

### Organizations (`web/organizations/`)

| Component | Purpose | L1 Status |
|---|---|---|
| `CreateOrganizationForm` | Org creation form | Custom — needs audit |
| `InviteJoinForm` | Join org form | Custom — needs audit |
| `JoinOrganizationButton` | Join CTA | Custom — needs audit |
| `MembershipActions` | Member actions | Custom — needs audit |

### Tournaments (`web/tournaments/`)

| Component | Purpose | L1 Status |
|---|---|---|
| `TournamentCard` | Tournament card | Custom — needs audit |
| `TournamentList` | Tournament grid | Custom — needs audit |
| `TournamentQuery` | Server data fetch | Custom — needs audit |
| `DivisionTable` | Division display | Custom — needs audit |
| `RegisterButton` | Registration CTA | Custom — needs audit |

### Techniques (`web/techniques/`)

| Component | Purpose |
|---|---|
| `TechniqueCard` | Technique display card |
| `TechniqueList` | Grid of technique cards |
| `TechniqueListing` | Full listing page |
| `TechniqueQuery` | Server data fetcher |
| `TechniqueSearch` | Search input |
| `TechniqueFilters` | Filter controls |

### Other Web Components

| Component | File | Purpose |
|---|---|---|
| `Header` | `header.tsx` | Site header |
| `Footer` | `footer.tsx` | Site footer |
| `Nav` | `nav.tsx` | Main navigation |
| `Pagination` | `pagination.tsx` | Page navigation |
| `EmptyList` | `empty-list.tsx` | Empty state display |
| `Markdown` | `markdown.tsx` | Markdown renderer |
| `MDX` | `mdx.tsx` | MDX renderer |
| `MDXComponents` | `mdx-components.tsx` | Custom MDX components |
| `FeatureNudge` | `feature-nudge.tsx` | Feature discovery nudge |
| `FeedbackWidget` | `feedback-widget.tsx` | User feedback form |
| `InlineMenu` | `inline-menu.tsx` | Inline navigation menu |
| `LeadCaptureForm` | `lead-capture-form.tsx` | Email capture form |
| `CtaForm` | `cta-form.tsx` | Call-to-action form |
| `CtaProof` | `cta-proof.tsx` | Social proof section |
| `ExternalLink` | `external-link.tsx` | External link with icon |
| `OverlayImage` | `overlay-image.tsx` | Image with overlay |
| `Listing` | `listing.tsx` | Generic listing layout |
| `Price` | `price.tsx` | Price display |
| `Stats` | `stats.tsx` | Stats display section |
| `StructuredData` | `structured-data.tsx` | JSON-LD structured data |
| `TableOfContents` | `table-of-contents.tsx` | TOC navigation |
| `Testimonial` | `testimonial.tsx` | Testimonial display |
| `ThemeSwitcher` | `theme-switcher.tsx` | Light/dark mode toggle |
| `UserLogout` | `user-logout.tsx` | Logout button |
| `UserMenu` | `user-menu.tsx` | User dropdown menu |
| `VerifiedBadge` | `verified-badge.tsx` | Verified checkmark |
| `BuiltWith` | `built-with.tsx` | Attribution footer |
| `Bottom` | `bottom.tsx` | Bottom section |

### Web Dialogs (`web/dialogs/`)

| Component | Purpose |
|---|---|
| `ToolClaimDialog` | Claim ownership dialog |
| `ToolEmbedDialog` | Embed code dialog |
| `ToolReportDialog` | Report tool dialog |

### Products (`web/products/`)

| Component | Purpose |
|---|---|
| `Product` | Product display |
| `ProductList` | Product grid |
| `ProductQuery` | Server data fetch |
| `ProductFeatures` | Feature list |
| `ProductIntervalSwitch` | Monthly/yearly toggle |

### Ads (`web/ads/`)

| Component | Purpose |
|---|---|
| `AdBanner` | Banner ad |
| `AdBase` | Base ad component |
| `AdCard` | Card ad |
| `AdsCalendar` | Ad date picker |
| `AdsPicker` | Ad type selector |

### Filters (`web/filters/`)

| Component | Purpose |
|---|---|
| `Filters` | Filter controls |
| `Sort` | Sort selector |

### Posts (`web/posts/`)

| Component | Purpose |
|---|---|
| `PostCard` | Blog post card |
| `PostList` | Blog post grid |

### Schedules (`web/schedules/`)

| Component | Purpose | L1 Status |
|---|---|---|
| `CreateScheduleForm` | Schedule creation | Custom |
| `MaterializeScheduleButton` | Generate schedule | Custom |
| `ScheduleInstructorList` | Instructor list | Custom |

### Programs (`web/programs/`)

| Component | Purpose | L1 Status |
|---|---|---|
| `CreateProgramForm` | Program creation | Custom |

### Listings (`web/listings/`)

| Component | Purpose |
|---|---|
| `FeaturedTools` | Featured tools section |
| `FeaturedToolsIcons` | Icon grid |
| `RelatedTools` | Related tools section |

### Tags (`web/tags/`)

Follows same Query → List → Card pattern as categories.

### OG (`web/og/`)

Open Graph image generation components.

---

## 7. Hooks (`hooks/`)

| Hook | File | Signature | Purpose |
|---|---|---|---|
| `useDataTable` | `use-data-table.ts` | `({ data, columns, pageCount, filterFields, ... }) => { table }` | TanStack Table setup with URL-synced pagination, sorting, filtering. **Use for ALL admin tables.** |
| `useComputedField` | `use-computed-field.ts` | `({ form, sourceField, computedField, callback, enabled }) => void` | Auto-compute one form field from another (e.g., name → slug). Use in all forms with derived fields. |
| `useMediaAction` | `use-media-action.ts` | `({ form, path, fieldName, fetchType }) => { fetch, upload, handleFileChange, isPending }` | Media upload/fetch for forms. |
| `useMagicLink` | `use-magic-link.ts` | `({ onSuccess, onError }) => { form, handleSignIn, isPending }` | Magic link auth flow. |
| `useAuthCallbackUrl` | `use-auth-callback-url.ts` | `() => string` | Get post-auth redirect URL. |
| `useTrackEvent` | `use-track-event.ts` | `() => (eventName, properties?) => void` | Plausible analytics event tracking. |
| `useAds` | `use-ads.ts` | `(spots) => { selections, findAdSpot, updateSelection, clearSelection, ... }` | Ad booking state management. |
| `useProductPrices` | `use-product-prices.ts` | `(prices, coupon, interval) => { price, isSubscription, ... }` | Stripe price calculation. |

---

## 8. `lib/safe-actions.ts` — Action Client Chain

Three-tier action client chain. **ALL server actions MUST use one of these.**

```typescript
// 1. Base — no auth, has db + revalidate in context
actionClient

// 2. User — requires authenticated session
userActionClient    // extends actionClient, adds ctx.user

// 3. Admin — requires admin role
adminActionClient   // extends userActionClient, checks role === "admin"
```

### Usage pattern

```typescript
// server/admin/{entity}/actions.ts
"use server"
import { adminActionClient } from "~/lib/safe-actions"
import { entitySchema } from "./schema"

export const upsertEntity = adminActionClient
  .inputSchema(entitySchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    // Prisma operation
    const entity = parsedInput.id
      ? await db.entity.update({ where: { id: parsedInput.id }, data: parsedInput })
      : await db.entity.create({ data: parsedInput })

    revalidate({ paths: ["/admin/entities"], tags: ["entities"] })
    return entity
  })
```

### `withAdminPage` HOC (`components/admin/auth-hoc.tsx`)

```typescript
// Wrap any admin page component
export default withAdminPage(async function EntityPage(props) {
  // Guaranteed admin user
})
```

---

## 9. Gold Standard Admin CRUD Pattern

Reference: `app/admin/categories/` + `server/admin/categories/`

### File structure (per entity)

```
app/admin/{entity}/
  page.tsx                              # List page (server component)
  new/page.tsx                          # Create page
  [slug]/page.tsx                       # Edit page
  _components/
    {entity}-form.tsx                   # Form (uses useHookFormAction)
    {entity}-actions.tsx                # Row action dropdown (DropdownMenu)
    {entities}-table.tsx                # DataTable wrapper
    {entities}-table-columns.tsx        # Column definitions
    {entities}-table-toolbar-actions.tsx # Bulk actions (delete selected)
    {entities}-delete-dialog.tsx        # Thin wrapper around DeleteDialog

server/admin/{entity}/
  actions.ts                            # Server actions (adminActionClient)
  queries.ts                            # Prisma queries
  schema.ts                             # Zod schemas + table params
```

### Form pattern (`useHookFormAction`)

```typescript
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"

const { form, action, handleSubmitWithAction } = useHookFormAction(
  serverAction,           // from server/admin/{entity}/actions.ts
  zodResolver(schema),    // from server/admin/{entity}/schema.ts
  {
    formProps: { defaultValues: { ... } },
    actionProps: {
      onSuccess: ({ data }) => { toast.success("..."); router.push("...") },
      onError: ({ error }) => { toast.error(error.serverError) },
    },
  }
)

// In JSX:
<Form {...form}>
  <form onSubmit={handleSubmitWithAction}>
    <FormField control={form.control} name="fieldName" render={({ field }) => (
      <FormItem>
        <FormLabel isRequired>Label</FormLabel>
        <FormControl><Input {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```

### Row actions pattern (`DropdownMenu`)

```typescript
<DropdownMenu modal={false}>
  <DropdownMenuTrigger asChild>
    <Button variant="secondary" size="sm" prefix={<EllipsisIcon />} />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" sideOffset={8}>
    <DropdownMenuItem asChild><Link href={editPath}>Edit</Link></DropdownMenuItem>
    <DropdownMenuItem asChild><Link href={viewPath} target="_blank">View</Link></DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={handleDuplicate}><CopyIcon /> Duplicate</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Delete pattern (`DeleteDialog`)

```typescript
// Thin entity-specific wrapper:
<DeleteDialog
  ids={entities.map(({ id }) => id)}
  label="entity"
  action={deleteEntities}        // Server action using adminActionClient + idsSchema
  callbacks={{
    onExecute: () => { toast.success("Deleted"); onExecute?.() },
    onError: ({ error }) => toast.error(error.serverError),
  }}
/>
```

### Table pattern

```typescript
// In {entities}-table.tsx:
const { table } = useDataTable({
  data, columns, pageCount, filterFields,
  shallow: false, clearOnDefault: true,
  initialState: { pagination, sorting, columnPinning: { right: ["actions"] } },
  getRowId: (row) => row.id,
})

<DataTable table={table}>
  <DataTableHeader title="Entities" total={total}
    callToAction={<Button asChild prefix={<PlusIcon />}><Link href="/admin/entities/new">New</Link></Button>}
  />
  <DataTableToolbar table={table} filterFields={filterFields}>
    <DateRangePicker />
    <DataTableViewOptions table={table} />
    <EntityTableToolbarActions table={table} />
  </DataTableToolbar>
</DataTable>
```

---

## 9b. Server-Side Pattern: `server/web/` (Public Actions)

The `server/web/` tree mirrors the admin pattern but uses `userActionClient` (or `actionClient`) instead of `adminActionClient`. Each entity domain follows:

```
server/web/{entity}/
  actions.ts      # Server actions (userActionClient or actionClient)
  queries.ts      # Prisma queries (often with brand scoping)
  schema.ts       # Zod schemas + filter params
  payloads.ts     # Prisma select/include payloads (type-safe projections)
  errors.ts       # Domain-specific error classes (optional)
```

### Domains in `server/web/`

| Domain | Files | Notes |
| --- | --- | --- |
| `tools/` | payloads, queries, schema | Dirstarter core — tool directory listings |
| `categories/` | payloads, queries | Read-only queries for public category pages |
| `tags/` | payloads, queries, schema | Tag listing + search |
| `techniques/` | actions, payloads, queries, schema, tests | Custom — technique CRUD + search |
| `tournaments/` | payloads, queries, register, schema | Custom — public tournament listing + registration |
| `directory/` | payloads, queries, schema | Custom — public directory search |
| `organization/` | actions, discipline-queries, payloads, queries, schemas | Custom — org create/join/membership |
| `passport/` | actions, payloads, queries, schemas | Custom — user passport editing |
| `schedule/` | actions, audit, errors, payloads, queries, schemas, session-generator, tests | Custom — class schedule management |
| `program/` | actions, payloads, queries, schemas | Custom — program/curriculum CRUD |
| `enrollment/` | actions, errors, payloads, queries, schemas | Custom — student enrollment |
| `attendance/` | actions, errors, payloads, queries, schemas, tests | Custom — attendance tracking |
| `entitlement/` | check, expire, grant, manage, revoke | Custom — entitlement/belt system |
| `family/` | actions, errors, payloads, queries, schemas | Custom — family account linking |
| `lead/` | actions, errors, payloads, public-actions, queries, schemas, tests | Custom — lead capture/lifecycle |
| `waiver/` | actions, errors, payloads, queries, schemas | Custom — digital waivers |
| `school-ops/` | audit | Custom — school operations audit |
| `ads/` | actions, payloads, queries | L1 — ad booking |
| `products/` | actions, queries, schema | L1 — Stripe product display |
| `actions/` | claim, filters, media, report, search, submit, subscribe | L1 — shared web actions (tool claim, report, subscribe, media upload) |
| `shared/` | schema | Shared schemas (file upload, tool submission) |

---

## 9c. Services Layer (`services/`)

| Service | File | Purpose | L1 Status |
| --- | --- | --- | --- |
| `db` | `db.ts` | Prisma client singleton with `PrismaPg` adapter + `uniqueSlugsExtension` | L1 |
| `s3Client` | `s3.ts` | S3-compatible storage client (AWS/R2) | L1 |
| `stripe` | `stripe.ts` | Stripe SDK instance | L1 |
| `redis` | `redis.ts` | Upstash Redis REST client | L1 |
| `resend` | `resend.ts` | Resend email client + `createResendContact` | L1 |
| `plausible` | `plausible.ts` | Plausible analytics API client | L1 |

---

## 9d. Library Utilities (`lib/`)

| File | Purpose | L1 Status |
| --- | --- | --- |
| `safe-actions.ts` | Action client chain (§8 above) | L1 |
| `auth.ts` | Better-Auth server config (magic link + Google OAuth + admin plugin) | L1 |
| `auth-client.ts` | Better-Auth browser client (`signIn`, `signOut`, `useSession`, `admin`) | L1 |
| `auth-hoc.ts` | `withAuth` HOC for API routes — checks session, returns 401 | L1 |
| `authz.ts` | Authorization helpers — `isAdmin`, brand-scope checks, membership role checks | Custom |
| `brand-context.ts` | `HOST_TO_BRAND` map + `resolveBrand` + `getRequestBrand` — single source of truth for host→brand | Custom |
| `utils.ts` | `cva`, `cx`, `compose` (Tailwind class merging) — use `cx()` for class composition | L1 |
| `parsers.ts` | `getSortingStateParser`, `isDefaultState` — nuqs URL param parsers for DataTable | L1 |
| `data-table.ts` | `getColumnPinningStyle` — column pinning CSS helper | L1 |
| `pages.ts` | `getPageData` — creates metadata + breadcrumbs + structured data for pages | L1 |
| `email.ts` | `sendEmail` — sends via Resend with React Email templates | L1 |
| `media.ts` | `uploadToS3Storage`, `fetchAndUploadMedia` — S3 media operations | L1 |
| `notifications.ts` | `notifySubmitterOfToolSubmitted` etc. — email notification helpers | L1 |
| `products.ts` | Stripe product/pricing helpers | L1 |
| `rate-limiter.ts` | Upstash rate limiting (submission, report, newsletter, feedback) | L1 |
| `analytics.ts` | Plausible analytics queries | L1 |
| `ai.ts` | AI model config, `CONTENT_SYSTEM_PROMPT` — martial-arts-specific system prompt | Custom |
| `i18n.ts` | `next-intl` locale loader | L1 |
| `mdx.ts` | MDX heading extraction, TOC generation | L1 |
| `fonts.ts` | Google Fonts config (Geist) | L1 |
| `opengraph.ts` | OG image URL generation | L1 |
| `structured-data.ts` | JSON-LD structured data generators | L1 |
| `scraper.ts` | Jina.ai web scraper for tool submissions | L1 |
| `ads.ts` | Ad pricing calculator | L1 |
| `tools.ts` | Tool status helpers (`isToolPublished`, `isToolScheduled`) | L1 |

---

## 9e. Contexts (`contexts/`)

| Context | File | Purpose | L1 Status |
| --- | --- | --- | --- |
| `FiltersProvider` / `useFilters` | `filter-context.tsx` | URL-synced filter state with `nuqs` — wraps web listing pages. Use this for any public listing with filters. | L1 |
| `SearchProvider` / `useSearch` | `search-context.tsx` | Open/close state for search dialog | L1 |

---

## 9f. Config (`config/`)

| File | Purpose |
| --- | --- |
| `site.ts` | `siteConfig` — name, slug, email, URL, domain |
| `metadata.ts` | Default metadata for pages |
| `links.ts` | Navigation links |
| `breadcrumbs.ts` | Breadcrumb config |
| `blog.ts` | Blog config |
| `ads.ts` | Ad spot config |
| `claims.ts` | Tool claim config |
| `feedback.ts` | Feedback widget config |
| `reports.ts` | Report types config |
| `submissions.ts` | Tool submission config |

---

## 9g. API Routes (`app/api/`)

| Route | Purpose | L1 Status |
| --- | --- | --- |
| `auth/[...all]/` | Better-Auth catch-all handler | L1 |
| `ai/completion/` | AI text completion endpoint (for `RelationSelector` suggestions) | L1 |
| `ai/generate-content/` | AI content generation | L1 |
| `ai/generate-description/` | AI description generation | L1 |
| `og/route.tsx` | Open Graph image generation | L1 |
| `cron/publish-tools/` | Cron job — auto-publish scheduled tools | L1 |
| `stripe/webhooks/` | Stripe webhook handler | L1 |

---

## 9h. Email Templates (`emails/`)

| Template | Purpose |
| --- | --- |
| `magic-link.tsx` | Magic link login email |
| `submission.tsx` | Tool submission confirmation |
| `submission-premium.tsx` | Premium submission confirmation |
| `submission-published.tsx` | Tool published notification |
| `submission-scheduled.tsx` | Tool scheduled notification |
| `admin-submission-premium.tsx` | Admin notification of premium submission |
| `lead-capture-confirmation.tsx` | Lead capture confirmation |
| `verify-domain.tsx` | Domain verification |
| `components/wrapper.tsx` | **EmailWrapper** — always use this to wrap email templates |
| `components/button.tsx` | Email CTA button |
| `components/action-nudge.tsx` | Action nudge component |
| `components/feature-nudge.tsx` | Feature nudge component |
| `components/expedite-nudge.tsx` | Expedite nudge component |

---

## 9i. Infrastructure (`infra/`)

| File | Purpose |
| --- | --- |
| `infra/postgres/init.sql` | Bootstrap SQL for Docker Postgres — creates `citext` + `pg_trgm` extensions |

---

## 9j. Packages (`packages/`)

| Package | Purpose | L1 Status |
| --- | --- | --- |
| `@ronin-dojo/api-client` | Mobile auth client for future Expo app. Mirrors `lib/auth-client.ts` pattern. Exports `createMobileAuthClient`. | Custom — ADR 0009 |

---

## 9k. Prisma Extensions (`prisma/extensions/`)

| Extension | File | Purpose |
| --- | --- | --- |
| `uniqueSlugsExtension` | `unique-slugs.ts` | Auto-generates unique slugs on create/update for models with `slug` + `name` fields. Applied via `db.$extends()` in `services/db.ts`. |

---

## 9l. Scripts (`scripts/`)

| Script | Purpose | L1 Status |
| --- | --- | --- |
| `setup-stripe-products.ts` | Bootstrap Stripe products/prices | L1 |
| `smoke-attendance.ts` | Smoke test — attendance flow | Custom |
| `smoke-entitlements.ts` | Smoke test — entitlement flow | Custom |
| `smoke-lead-lifecycle.ts` | Smoke test — lead lifecycle | Custom |
| `smoke-org.ts` | Smoke test — organization flow | Custom |
| `smoke-passport.ts` | Smoke test — passport flow | Custom |
| `smoke-program.ts` | Smoke test — program flow | Custom |
| `smoke-schedule.ts` | Smoke test — schedule flow | Custom |
| `smoke-school-ops-extended.ts` | Smoke test — school ops | Custom |

---

## 9m. Admin Entity Scaffolding Audit

Every admin entity below was audited for gold-standard compliance (6-file pattern: form + actions + delete-dialog + table + columns + toolbar-actions).

| Entity | Files | Form Pattern | Table Pattern | L1 Status |
|---|---|---|---|---|
| `admin/categories/` | 6 | `useHookFormAction` + `FormField` + `useComputedField` + `RelationSelector` | `useDataTable` + `DataTable` + `DataTableColumnHeader` + `DataTableLink` | ✅ **GOLD STANDARD** |
| `admin/users/` | 6 | `useHookFormAction` + `FormField` | `useDataTable` + full pattern | ✅ **GOLD STANDARD** |
| `admin/tools/` | 7 (incl. `relation-selector.tsx`) | `useHookFormAction` + `FormField` + `FormMedia` + `useComputedField` | `useDataTable` + full pattern | ✅ **GOLD STANDARD** |
| `admin/tags/` | 6 | `useHookFormAction` + `FormField` + `useComputedField` + `RelationSelector` | `useDataTable` + full pattern | ✅ **GOLD STANDARD** |
| `admin/reports/` | 6 | `useHookFormAction` + `FormField` | `useDataTable` + full pattern | ✅ **GOLD STANDARD** |
| `admin/leads/` | 6 | `useHookFormAction` + `FormField` | `useDataTable` + full pattern | ✅ **GOLD STANDARD** |
| `admin/tournaments/` | 6 (+ bracket-viewer, score-forms, divisions-editor, registrations-table) | `useHookFormAction` + `useComputedField` | `useDataTable` + full pattern | ✅ **COMPLIANT** (core); ⚠️ sub-components have violations — see §10 |
| `admin/certificates/` | 3 (form + table + columns) | `useHookFormAction` + `FormField` | `DataTable` columns defined | ⚠️ **PARTIAL** — missing delete-dialog, actions, toolbar-actions |
| `admin/courses/` | 4 (form + table + columns + curriculum-items-editor) | `useHookFormAction` + `useComputedField` | `DataTable` columns defined | ⚠️ **PARTIAL** — missing delete-dialog, actions, toolbar-actions |
| `admin/schedule/` | 2 (page + calendar) | N/A — calendar display only | N/A — manual `<table>` grid | ⚠️ **CUSTOM** — raw `<td>`, `<h6>` in calendar grid |

### Notable Patterns in Courses

- `curriculum-items-editor.tsx` uses `useOptimistic` + `useTransition` for inline CRUD — **same violation class as `divisions-editor.tsx` (P1).** `passport-editor.tsx` proves `useHookFormAction`/`useAction` works for multi-field mutations. Both editors need refactoring.

---

## 9n. `(web)/` Route Pages Audit

| Route | Page Components Used | L1 Status |
|---|---|---|
| `(home)/page.tsx` | `ToolQuery`, `Hero`, `StructuredData` | ✅ |
| `(home)/hero.tsx` | `Intro`, `CTAForm`, `CTAProof` | ✅ |
| `(home)/count-badge.tsx` | `Badge`, `Ping`, `Link` | ✅ |
| `about/page.tsx` | `Intro`, `Prose`, `ExternalLink`, `StructuredData` | ✅ |
| `advertise/page.tsx` | `Wrapper`, `Intro`, `Stats`, `Testimonial`, `ExternalLink` | ✅ |
| `submit/page.tsx` | `Intro`, `Section`, `SubmitForm` — uses `getPageData`/`getPageMetadata` i18n pattern | ✅ |
| `dashboard/page.tsx` | `Intro`, `DataTableSkeleton`, `Suspense` | ✅ |
| `dashboard/table.tsx` | `DataTable` + `useDataTable` + full column/toolbar pattern | ✅ **GOLD STANDARD** |
| `categories/page.tsx` | `Intro`, L1 listing pattern | ✅ |
| `directory/page.tsx` | `DirectoryQuery`, `Intro`, `Section` | ✅ |
| `tournaments/page.tsx` | `TournamentQuery`, `Intro` | ⚠️ Raw `<div className="animate-pulse h-96">` fallback — should use `Skeleton` |
| `tournaments/[slug]/page.tsx` | `Intro`, `Section`, `Badge`, `Stack`, `H4`, `DivisionTable`, `RegisterButton` | ✅ (uses L1 components well; raw success banner `<div>` is minor) |
| `organizations/page.tsx` | `Intro`, `Section`, `Grid`, `Card`, `H4`, `Link`, `Badge`, `Button` | ✅ |
| `organizations/[slug]/page.tsx` | `Intro`, `Section`, `Badge`, `Stack`, `H4`, `Card`, `JoinOrganizationButton`, `MembershipActions` | ✅ (uses raw `<dl>`/`<dt>`/`<dd>` for details — acceptable semantic HTML) |
| `organizations/[slug]/get-started/page.tsx` | `Wrapper`, `H2`, `LeadCaptureForm` | ✅ |
| `programs/page.tsx` | `Intro`, `Section`, `Grid`, `Card`, `H4`, `Link`, `Badge`, `Button` | ✅ |
| `techniques/page.tsx` | `Intro`, `TechniqueQuery`, `TechniqueListingSkeleton`, `Suspense` | ✅ |
| `tags/page.tsx` | `Intro`, L1 listing pattern | ✅ |
| `blog/page.tsx` | `Intro`, L1 listing pattern | ✅ |
| `auth/login/page.tsx` | Auth flow — L1 | ✅ |
| `[slug]/page.tsx` | Full L1 tool detail page — `Intro`, `Section`, `Badge`, `Nav`, `Markdown`, `OverlayImage`, `ToolActions`, `ToolButton`, `RelatedTools`, `AdCard`, `FeaturedToolsIcons`, `StructuredData`, `Sticky`, `Backdrop`, `Favicon`, `Tag`, `VerifiedBadge` | ✅ **GOLD STANDARD** |
| `me/page.tsx` | `Intro`, `Section`, `PassportEditor` — redirects if no session | ✅ |
| `me/passport-editor.tsx` | `useHookFormAction` + `Form` + `FormField` + `Input` + `TextArea` + `Button` — two sub-forms (Passport + DirectoryProfile) | ✅ **COMPLIANT** |

---

## 10. L1 Violation Audit — Custom Code Gap Analysis

### Tournament Admin Code

| File | Pattern Used | L1 Pattern Required | Violation |
|---|---|---|---|
| `tournament-form.tsx` | ✅ `useHookFormAction` + `Form` + `FormField` + `Stack` + `useComputedField` | — | **COMPLIANT** |
| `tournaments-table.tsx` | ✅ `DataTable` + `DataTableHeader` + `DataTableToolbar` + `useDataTable` | — | **COMPLIANT** |
| `tournaments-table-columns.tsx` | ✅ `DataTableColumnHeader` + `DataTableLink` + `Badge` | — | **COMPLIANT** |
| `bracket-viewer.tsx` | ✅ `Dialog` + `Form` + `RadioGroup` + `Select` + `Card` + `Avatar` + `Badge` + `Tooltip` (refactored SESSION_0050) | — | **COMPLIANT** (after SESSION_0050) |
| `score-forms.tsx` | ✅ `FormField` + `Input` + `Card` + `Badge` + `Tooltip` + `Label` | — | **COMPLIANT** (created SESSION_0050) |
| `divisions-editor.tsx` | ⚠️ Uses `Stack` + `Badge` + `Button` but raw `<div>` for division rows, `useTransition` + direct action calls instead of `useAction`/`useHookFormAction` | `Card` for division rows, `useAction` for mutations, `DropdownMenu` for actions | **PARTIAL — needs refactor** |
| **Missing** | No `tournaments-delete-dialog.tsx` | `DeleteDialog` wrapper | **MISSING** |
| **Missing** | No `tournament-actions.tsx` (row actions) | `DropdownMenu` row actions | **MISSING** |
| **Missing** | No `tournaments-table-toolbar-actions.tsx` | Bulk delete toolbar | **MISSING** |

### Tournament Server Code

| File | Pattern Used | L1 Pattern Required | Status |
|---|---|---|---|
| `server/admin/tournaments/actions.ts` | ✅ `adminActionClient.inputSchema().action()` | — | **COMPLIANT** |
| `server/admin/tournaments/schema.ts` | ✅ Zod schemas + table params + `createSearchParamsCache` | — | **COMPLIANT** |
| `server/admin/tournaments/queries.ts` | ✅ Standard Prisma queries | — | **COMPLIANT** |
| `server/admin/tournaments/bracket-queries.ts` | ✅ Prisma queries with enriched includes | — | **COMPLIANT** |

### Organization Web Code

| File | Pattern Used | Status |
|---|---|---|
| `create-organization-form.tsx` | ✅ `useHookFormAction` + `Form` + `FormField` + `Select` + `Checkbox` + `Stack` + `Input` | **COMPLIANT** |
| `invite-join-form.tsx` | ✅ `useAction` + `Badge` + `Stack` + `Button` (simple selection, not a form) | **COMPLIANT** |
| `join-organization-button.tsx` | ✅ `useAction` + `Button` | **COMPLIANT** |
| `membership-actions.tsx` | ✅ `useAction` + `Button` + `Stack` + `Badge`. ⚠️ Uses raw `<div className="px-4 pb-3 space-y-2">` | **MINOR — use Stack** |

### Directory Web Code

| File | Pattern Used | Status |
|---|---|---|
| `directory-list.tsx` | ✅ `Card` + `CardHeader` + `CardDescription` + `H4` + `Stack` + `Badge` + `Link`. ⚠️ Uses raw `<img>` instead of `Avatar` | **MINOR — use Avatar** |
| `directory-listing.tsx` | ✅ `FiltersProvider` + `Filters` + `Sort` — follows L1 listing pattern | **COMPLIANT** |
| `directory-query.tsx` | ✅ Server component → `DirectoryListing` → `DirectoryList` — follows Query pattern | **COMPLIANT** |
| `directory-filters.tsx` | ⚠️ Uses `Select` + `Stack` + `Input` but manual `useSearchParams` + `useRouter` URL updates instead of `FiltersProvider`/`useFilters` | **PARTIAL — should use FiltersContext** |

### Schedule/Program Web Code

| File | Pattern Used | Status |
|---|---|---|
| `create-schedule-form.tsx` | ✅ `useHookFormAction` + `Form` + `FormField` + `Select` + `Checkbox` + `Input` + `TextArea` + `Stack` + `Label` + `Link` | **COMPLIANT** |
| `materialize-schedule-button.tsx` | ✅ `useAction` + `Button` | **COMPLIANT** |
| `schedule-instructor-list.tsx` | ✅ `useAction` + `Avatar` + `Badge` + `Button` + `Select` + `Stack` | **COMPLIANT** |
| `create-program-form.tsx` | ✅ `useHookFormAction` + `Form` + `FormField` + `Select` + `Input` + `TextArea` + `Stack` + `useComputedField` + `Link` | **COMPLIANT** |

### Admin Registrations Table

| File | Pattern Used | Status |
|---|---|---|
| `registrations-table.tsx` | ⚠️ Uses `DataTable` + `DataTableHeader` + `Button` but manual `useReactTable` instead of `useDataTable` hook. Uses `useTransition` + direct action calls instead of `useAction`. Raw `<div>` error display instead of toast. No `DataTableToolbar`. | **PARTIAL — needs `useDataTable` + `useAction` + `DataTableToolbar`** |
| `registrations-table-columns.tsx` | Needs full pattern compliance review | **NEEDS REVIEW** |

### Tournament Web Code

| File | Pattern Used | Status |
|---|---|---|
| `tournament-card.tsx` | ⚠️ Raw `<h3>` instead of `H3`, raw `<div>` instead of `Card` + `Stack`, raw `<p>` tags. Uses `Badge` + `Link`. | **PARTIAL — use Card + H3 + Stack** |
| `tournament-list.tsx` | ⚠️ Raw `<div>` grid, `any[]` type annotation. | **PARTIAL — use Grid, fix typing** |
| `tournament-query.tsx` | ✅ Server component pattern. ⚠️ Raw `<p>` empty state instead of `EmptyList`. | **MINOR** |
| `division-table.tsx` | ✅ `Table` + `TableHeader` + `TableRow` + `Badge` + `Note` | **COMPLIANT** |
| `register-button.tsx` | ⚠️ Uses `Button` + `Badge` + `Checkbox` + `Note` but raw `useState` + direct action calls instead of `useAction`. Raw `confirm()` instead of `Dialog`. | **PARTIAL — needs `useAction` + `Dialog`** |

---

## 11. Refactoring Priority Queue

Based on the gap analysis, these are the files that need L1 alignment, ordered by impact:

| Priority | File | Work Needed |
|---|---|---|
| P1 | `divisions-editor.tsx` | Use `Card` for division rows, `useAction` for mutations, `DropdownMenu` for division/discipline actions |
| P1 | Tournament admin scaffolding | Add missing `tournaments-delete-dialog.tsx`, `tournament-actions.tsx`, `tournaments-table-toolbar-actions.tsx` |
| P1 | `registrations-table.tsx` | Replace manual `useReactTable` with `useDataTable` hook, replace `useTransition` + direct calls with `useAction`, add `DataTableToolbar`, replace raw error div with toast |
| P2 | `tournament-card.tsx` | Replace raw `<h3>` with `H3`, raw `<div>` wrapper with `Card`, use `Stack` for layout |
| P2 | `tournament-list.tsx` | Fix `any[]` typing, use `Grid` or proper responsive layout |
| P2 | `register-button.tsx` | Replace raw `confirm()` with `Dialog`, replace direct action calls with `useAction` |
| P2 | `directory-list.tsx` | Replace raw `<img>` with `Avatar` + `AvatarImage` + `AvatarFallback` |
| P2 | `directory-filters.tsx` | Replace manual `useSearchParams` + `useRouter` with `FiltersProvider`/`useFilters` context |
| P3 | `membership-actions.tsx` | Replace raw `<div>` wrapper with `Stack` |
| P3 | `tournament-query.tsx` | Replace raw `<p>` empty state with `EmptyList` component |
| P3 | `(web)/tournaments/page.tsx` | Replace raw `<div className="animate-pulse h-96">` with `Skeleton` component |
| P2 | `admin/certificates/` scaffolding | Add missing `delete-dialog`, `actions`, `toolbar-actions` (3 files) |
| P2 | `admin/courses/` scaffolding | Add missing `delete-dialog`, `actions`, `toolbar-actions` (3 files) |
| P3 | `admin/schedule/calendar.tsx` | Raw `<td>`, `<h6>` — acceptable for calendar grid, low priority |
| ~~P2~~ | ~~All `web/organizations/`~~ | ✅ **COMPLIANT** — uses `useHookFormAction` + L1 components |
| ~~P3~~ | ~~`web/schedules/`~~ | ✅ **COMPLIANT** — uses `useHookFormAction` + L1 components |
| ~~P3~~ | ~~`web/programs/`~~ | ✅ **COMPLIANT** — uses `useHookFormAction` + `useComputedField` + L1 components |
| ~~P2~~ | ~~`web/me/passport-editor.tsx`~~ | ✅ **COMPLIANT** — `useHookFormAction` + full L1 form pattern |
| ~~P2~~ | ~~`admin/users/`, `admin/tags/`, `admin/reports/`, `admin/leads/`~~ | ✅ **GOLD STANDARD** — full 6-file pattern |

---

## 12. Pre-Flight Checklist (for Petey + Cody)

Before planning or building ANY UI:

- [ ] Check this inventory for an existing component that does the job
- [ ] If building a form: use `useHookFormAction` + `Form` + `FormField` + Zod resolver
- [ ] If building a table: use `DataTable` + `useDataTable` + column defs
- [ ] If building a modal: use `Dialog` + `DialogContent`
- [ ] If building row actions: use `DropdownMenu`
- [ ] If building delete: use `DeleteDialog` wrapper
- [ ] If building a list page: follow Query → Listing → List → Card pattern
- [ ] No raw `<input>`, `<select>`, `<label>`, `<form>`, `<table>` — EVER
- [ ] No raw `<div className="flex">` — use `Stack`
- [ ] No raw `<div className="border rounded">` — use `Card`

---

*Document created SESSION_0051. Last updated 2026-05-04 (third sweep: admin entities + (web) routes). This is the mandatory pre-flight reference for all UI work.*
