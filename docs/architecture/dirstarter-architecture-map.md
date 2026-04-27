---
title: "Dirstarter → Ronin Dojo Architecture Map"
slug: dirstarter-architecture-map
type: file
status: active
created: 2026-04-27
updated: 2026-04-27
last_agent: copilot-session-0016
health: 8
pairs_with:
  - docs/architecture/program-plan.md
  - docs/architecture/plan-vs-current.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Dirstarter → Ronin Dojo Architecture Map

This document is the **master translation guide** from Dirstarter's "tool directory" domain to our martial arts platform domain. Every feature we build follows these proven patterns — we never invent new structural patterns, only apply ours to the existing ones.

---

## 1. Dirstarter's Architecture (what we bought)

Dirstarter is a **tool directory SaaS template**. Its domain: users submit tools, admins publish them, visitors browse/filter/search them. Our domain is different but the *architectural machinery* is identical.

### File structure convention

```
app/
  (web)/              ← public-facing routes (marketing + user features)
    auth/             ← login, verify
    dashboard/        ← authenticated user's submitted tools
    submit/           ← tool submission form
    [slug]/           ← individual tool detail page
    blog/             ← MDX content
    categories/       ← filter dimension
    tags/             ← filter dimension
  admin/              ← admin panel (data tables, CRUD)
  api/                ← API routes (auth, stripe, cron, OG images, AI)

components/
  common/             ← design primitives (button, card, dialog, input, etc.)
  web/                ← domain-specific components (tool-card, tool-list, filters, etc.)
  admin/              ← admin-specific components
  data-table/         ← reusable data table with sorting/filtering/pagination

config/               ← static config objects (site, links, claims, etc.)

lib/                  ← utility/framework wiring
  auth.ts             ← Better-Auth server config (betterAuth + plugins)
  auth-client.ts      ← Better-Auth browser client (createAuthClient)
  auth-hoc.ts         ← withAuth / withAdminAuth HOCs for API routes
  safe-actions.ts     ← next-safe-action client chain (base → user → admin)
  pages.ts            ← page metadata helper
  email.ts            ← Resend email sending
  rate-limiter.ts     ← rate limiting
  media.ts            ← S3 media upload

server/               ← server-side domain logic (THE key pattern)
  web/                ← public domain
    tools/            ← one folder per entity
      queries.ts      ← Prisma read queries (with caching)
      payloads.ts     ← Prisma select shapes (type-safe projections)
      schema.ts       ← Zod schemas + nuqs search param parsers
    actions/          ← server actions (use safe-actions client)
      submit.ts       ← actionClient.inputSchema(...).action(...)
    categories/
    tags/
    shared/
  admin/              ← admin domain (same pattern)
    tools/
    categories/
    tags/
    users/

services/             ← external service clients
  db.ts               ← Prisma client singleton + extensions
  redis.ts            ← Redis/Upstash
  stripe.ts           ← Stripe client
  resend.ts           ← Resend client
  s3.ts               ← S3 client
  plausible.ts        ← Analytics

prisma/
  schema.prisma       ← data model
  extensions/         ← Prisma client extensions (e.g. unique-slugs)
  seed.ts             ← seed data

emails/               ← React Email templates
messages/             ← i18n translation JSON (next-intl)
content/              ← MDX content collections
hooks/                ← React hooks
contexts/             ← React context providers
types/                ← shared TypeScript types
```

---

## 2. The Pattern Stack (how features are built)

Every feature in Dirstarter follows a **5-layer vertical slice**:

### Layer A: Data (Prisma schema + payloads)

```
prisma/schema.prisma          → model definition
server/web/<entity>/payloads.ts → select shapes (what fields to return)
```

### Layer B: Server Logic (queries + actions)

```
server/web/<entity>/queries.ts  → cached read queries (findMany, findOne, search)
server/web/<entity>/schema.ts   → Zod validation + nuqs search param parsers
server/web/actions/<action>.ts  → write mutations via safe-actions chain
```

### Layer C: Components (display + interaction)

```
components/web/<entity>-card.tsx    → list item display
components/web/<entity>-list.tsx    → list container
components/web/<entity>-filters.tsx → search/filter controls
components/web/<entity>-listing.tsx → orchestrator (fetches + renders list + filters)
```

### Layer D: Pages (routes)

```
app/(web)/<route>/page.tsx     → getData() + generateMetadata() + render
app/(web)/<route>/listing.tsx  → searchParams → query → list component
app/admin/<entity>/page.tsx    → admin data table view
```

### Layer E: Config + i18n

```
config/<entity>.ts             → static config (if needed)
messages/en.json               → page titles, descriptions, form labels
```

---

## 3. Domain Translation Table

This is the Rosetta Stone. Dirstarter's "Tool" is our primary entity in each sprint:

| Dirstarter concept | Ronin Dojo equivalent | Sprint |
|---|---|---|
| `Tool` | `Organization` (S3), `DirectoryProfile` (S4), `Course` (S6), `Tournament` (S8) |
| `Category` | `Discipline` | S1 (done) |
| `Tag` | `RankSystem`, `Rank` | S1 (done) |
| `Tool submission` | Org create (S3), Course create (S6), Tournament create (S8) |
| `Tool listing/search` | Directory search (S4), Tournament browse (S8) |
| `Tool detail page` | DirectoryProfile detail, Org detail, Tournament detail |
| `Dashboard (user's tools)` | Passport dashboard (my orgs, my ranks, my registrations) |
| `Admin panel` | Brand admin (manage orgs, approve memberships, review submissions) |
| `ToolStatus enum` | `MembershipStatus`, `TournamentStatus`, `RegistrationStatus` |
| `isFeatured` flag | `DirectoryProfile.visibility`, featured orgs/practitioners |
| `User + session` | `User + Passport + DirectoryProfile` |
| `Stripe integration` | Tournament registration fees (S10) |

---

## 4. Feature Build Playbook

When building any new feature, follow this exact sequence. No improvisation.

### Step 1: Schema (if not already done)
- Add/modify models in `prisma/schema.prisma`
- Run migration
- Update `prisma/seed.ts` with test data

### Step 2: Payloads
- Create `server/web/<entity>/payloads.ts`
- Define `<entity>OnePayload` and `<entity>ManyPayload` (Prisma select objects)
- Export inferred types: `type EntityOne = Prisma.EntityGetPayload<...>`

### Step 3: Schema (validation)
- Create `server/web/<entity>/schema.ts`
- Define filter params with `nuqs` parsers + `createSearchParamsCache`
- Define form validation schemas with Zod

### Step 4: Queries
- Create `server/web/<entity>/queries.ts`
- Use `"use cache"` + `cacheTag` + `cacheLife` pattern
- Return paginated results: `{ items, total, page, perPage }`

### Step 5: Actions (for writes)
- Create `server/web/actions/<action>.ts`
- Use `actionClient.inputSchema(...).action(...)` or `userActionClient` for auth-gated
- Call `revalidate({ tags: [...] })` after mutations

### Step 6: Components
- Create listing component (fetches data, renders list)
- Create card component (displays one item)
- Create filter component (search/filter UI)
- Use existing `components/common/*` primitives — never rebuild button/card/dialog/etc.

### Step 7: Page
- Create `app/(web)/<route>/page.tsx`
- Follow the pattern: `getData()` (cached) → `generateMetadata()` → default export renders `<Intro>` + `<Suspense fallback={<Skeleton>}><Listing /></Suspense>`

### Step 8: Admin (if applicable)
- Create `app/admin/<entity>/page.tsx` with data table
- Use `components/data-table/*` patterns

---

## 5. Sprint Execution Map

Each sprint maps to specific Dirstarter patterns:

| Sprint | Primary pattern to follow | Reference file in Dirstarter |
|---|---|---|
| **S3** (Org CRUD) | Tool submission + admin tools | `server/web/actions/submit.ts`, `app/admin/tools/` |
| **S4** (Directory) | Tool listing + search + filters | `server/web/tools/queries.ts`, `components/web/tool-listing.tsx` |
| **S6** (Courses) | Tool detail + categories | `app/(web)/[slug]/`, `server/web/categories/` |
| **S7** (Progress) | Server action + notification | `server/web/actions/`, `lib/notifications.ts` |
| **S8** (Tournaments) | Tool submission (complex) | `server/web/actions/submit.ts` (multi-step) |
| **S9** (Registration) | Stripe + write action | `services/stripe.ts`, `app/api/stripe/` |
| **S10** (Payments) | Stripe full wiring | `app/api/stripe/`, `config/claims.ts` |
| **S11** (Brand rollout) | Site config + theming | `config/site.ts`, `app/styles.css` |
| **S12** (Ronin Bar) | Header/nav components | `components/web/header.tsx`, `components/web/nav.tsx` |

---

## 6. Anti-Patterns (what NOT to do)

1. **Don't create new `lib/` files** unless Dirstarter has an equivalent. If it doesn't exist in the template, you probably don't need it.
2. **Don't make custom API routes** for things that should be server actions. Dirstarter uses API routes only for: auth callbacks, Stripe webhooks, cron jobs, OG image generation.
3. **Don't build custom form components.** Use `components/common/form.tsx` (React Hook Form) + `components/common/input.tsx`, `select.tsx`, etc.
4. **Don't invent a new data fetching pattern.** Use the `server/web/<entity>/queries.ts` → `"use cache"` → component pattern.
5. **Don't build custom auth middleware.** Use `lib/auth-hoc.ts` (`withAuth`, `withAdminAuth`) for API routes. Use `userActionClient` for server actions. Use `getServerSession()` for pages.
6. **Don't restructure the component hierarchy.** `common/` = primitives, `web/` = domain, `admin/` = admin. That's it.
7. **Don't skip the payloads file.** Every entity needs typed Prisma select shapes. No `select: { ... }` inline in queries.

---

## 7. Current State Audit

What we've built so far vs. what the Dirstarter pattern demands:

| Entity | Schema ✅ | Payloads | Queries | Actions | Components | Pages | Status |
|---|---|---|---|---|---|---|---|
| Organization | ✅ | ⚠️ check | ⚠️ check | ✅ (create/join) | ⚠️ check | ✅ (list/create/detail) | S3 done |
| DirectoryProfile | ✅ | ⚠️ check | ⚠️ check | — | ⚠️ check | ✅ (/directory) | S4 verify |
| Passport | ✅ | ⚠️ check | ⚠️ check | — | ⚠️ check | ✅ (/me) | S2 done |
| Course | ✅ (schema) | ❌ | ❌ | ❌ | ❌ | ❌ | S6 planned |
| Tournament | ✅ (schema) | ❌ | ❌ | ❌ | ❌ | ❌ | S8 planned |

**Action item:** Before S6 begins, audit S2–S4 code to confirm it follows the full 5-layer pattern. If any shortcuts were taken (inline selects, missing payloads files, etc.), fix them as part of the next sprint's opening.

---

## 8. File Naming Conventions

Follow Dirstarter exactly:

- **Entity folder:** `server/web/<entity-plural>/` (e.g. `server/web/organizations/`)
- **Payloads:** `payloads.ts` — select shapes + exported types
- **Queries:** `queries.ts` — cached reads
- **Schema:** `schema.ts` — Zod + nuqs params
- **Actions:** `server/web/actions/<verb-noun>.ts` (e.g. `create-organization.ts`)
- **Components:** `components/web/<entity>-<variant>.tsx` (e.g. `organization-card.tsx`)
- **Pages:** `app/(web)/<route>/page.tsx` + optional `listing.tsx` for search pages

---

## 9. Key Dirstarter Utilities We Must Use

| Utility | Location | Use for |
|---|---|---|
| `actionClient` / `userActionClient` / `adminActionClient` | `lib/safe-actions.ts` | All server actions |
| `getServerSession()` | `lib/auth.ts` | Session access in pages/actions |
| `withAuth()` / `withAdminAuth()` | `lib/auth-hoc.ts` | API route protection |
| `createSearchParamsCache` | `nuqs/server` | URL search param parsing |
| `getPageData()` / `getPageMetadata()` | `lib/pages.ts` | Page metadata pattern |
| `Intro` / `IntroTitle` / `IntroDescription` | `components/web/ui/intro` | Page headers |
| `Section` / `Section.Content` | `components/web/ui/section` | Page sections |
| `DataTable` + skeleton | `components/data-table/` | Admin tables |
| `db.$transaction([...])` | Prisma | Multi-query atomicity |
| `"use cache"` + `cacheTag` + `cacheLife` | Next.js | Query caching |

---

## 10. What This Means for Remaining Sprints

**S6 (Courses):** Create `server/web/courses/` with payloads + queries + schema. Action at `server/web/actions/create-course.ts`. Components: `course-card.tsx`, `course-list.tsx`. Page: `app/(web)/courses/page.tsx` + `app/(web)/courses/[slug]/page.tsx`. Admin: `app/admin/courses/page.tsx`.

**S7 (Progress):** Action at `server/web/actions/award-rank.ts` using `userActionClient`. Notification via `lib/notifications.ts` pattern.

**S8 (Tournaments):** Same as S6 but for tournaments. Multi-step creation wizard follows the submit form pattern but with more steps.

**S9 (Registration):** Action: `server/web/actions/register-tournament.ts`. Stripe: follow `app/api/stripe/` pattern.

**S10 (Payments):** Extend existing Stripe wiring — don't build a new payment system.

**S11 (Brand):** Update `config/site.ts` to be brand-aware. Theme tokens in `app/styles.css`. No structural changes.

**S12 (Ronin Bar):** New component at `components/web/ronin-bar.tsx`. Wired into layout. Uses existing primitives.

---

*This document is the execution contract. Every PR should be reviewable against it: "does this follow the Dirstarter pattern?" If the answer is no, the code doesn't ship.*
