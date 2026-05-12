---
title: Dirstarter Baseline Index
slug: dirstarter-baseline-index
type: architecture
status: active
created: 2026-05-03
updated: 2026-05-03
last_agent: copilot-session-0039
pairs_with:
  - docs/architecture/program-plan.md
  - docs/knowledge/wiki/drift-register.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0039.md
  - docs/sprints/SESSION_0137.md
---

# Dirstarter Baseline Index

> **Purpose**: Comprehensive inventory of e## 12. Open questions for planning

1. **D-014 resolution**: The `Tool` entity and its ~30 related files — quarantine, repurpose as "Directory Listing", or remove?
2. **L1 drift check**: Which Ronin modifications have diverged from Dirstarter patterns and need realignment?

---

## 13. dirstarter.com/docs — integration patterns reference

> Fetched 2026-05-03. Full docs site sidebar: Introduction → Getting Started → Environment Setup → First Steps → Codebase (Structure, IDE, Linting, Updates) → Integrations (Email, Storage, Payments, Media, Rate Limiting, Analytics) → Features (Auth, Content, Monetization, i18n, Theming, SEO, Cron Jobs).

### 13a. Authentication (`proxy.ts` + `lib/auth.ts`)

- **BetterAuth** with magic link + Google OAuth
- **Route protection** in `proxy.ts` — middleware checks session cookie, redirects unauthenticated users. Admin routes verify `role === "admin"`
- **Action protection** via action client chain (our version: `next-safe-action` clients in `lib/safe-actions.ts`; latest Dirstarter uses `oRPC` in `lib/orpc.ts` — NOT migrating, our version works)
- **Roles**: `admin` and `user` only. Ronin extends with org membership + brand scoping
- **Session config**: `freshAge: 0`, `cookieCache: { enabled: true }`

### 13b. Email (`lib/email.ts` + `services/resend.ts`)

- **Resend** for transactional email, **React Email** for templates
- `sendEmail({ to, subject, react })` — auto-generates text fallback
- `bun run email` to preview templates locally
- **Always use `EmailWrapper`** from `emails/components/wrapper.tsx`
- **Our gap**: `sendEmail()` not wired in `createPublicLead` yet (carried from 0038.5)

### 13c. Storage (`services/s3.ts` + `lib/media.ts`)

- S3-compatible storage (AWS S3, Cloudflare R2, etc.)
- `uploadToS3Storage(file, key)` — auto-detects type, uploads, returns public URL with cache-bust
- `fetchAndUploadMedia(url, path, type)` — downloads + uploads (for screenshots/favicons)
- Media types: `"screenshot"` and `"favicon"` via ScreenshotOne and Google Favicon API

### 13d. Payments (`services/stripe.ts`)

- **Stripe** for one-time and recurring payments
- Three tiers: Free, Standard (one-time), Premium (subscription)
- Webhook at `/api/stripe/webhooks` handles `checkout.session.completed` and `customer.subscription.deleted`
- `scripts/setup-stripe-products.ts` bootstraps Stripe products
- **Ronin adaptation**: Stripe wiring maps to membership tiers, not tool listing tiers

### 13e. Rate limiting (`lib/rate-limiter.ts` + `services/redis.ts`)

- `rate-limiter-flexible` with Redis, auto-fallback to in-memory
- Centralized config in `config/rate-limit.ts` per action type
- `isRateLimited(action, prefix?, identifier?)` — returns boolean
- Fails open (returns `false` on error) to avoid blocking legitimate users
- **Our addition**: `publicActionClient` uses IP-based rate limiting for lead capture

### 13f. Analytics (`lib/analytics.ts` + `services/plausible.ts`)

- **Plausible** for privacy-friendly analytics (no cookies, GDPR-compliant)
- Proxy configured in `next.config.ts` via `withPlausibleProxy()` to bypass ad blockers
- `useTrackEvent()` hook for custom event tracking
- Server-side: `getPlausibleVisitors()`, `getPlausiblePageviews()` for admin dashboard

### 13g. Content management

- **Tool statuses**: Draft → Pending → Scheduled → Published (+ Rejected, Deleted)
- Full submission→review→schedule→publish pipeline with email notifications
- Automated: AI content generation, ScreenshotOne screenshots, Google favicons
- Cron job at `/api/cron/publish-tools` for scheduled publishing
- **Soft delete** for published tools (preserves SEO), **hard delete** for everything else

### 13h. Middleware / proxy (`proxy.ts`)

- Matches all routes except Next.js internals and `/api/auth/`
- **Our extension**: Added `resolveBrand()` — resolves hostname to Brand enum, sets `x-brand` header + `brand` cookie
- Auth-gated paths: `/admin/*` (admin role), `/dashboard`, `/submit` (user session)
- Auth page redirect: logged-in users visiting `/auth/*` → redirect to `/`

### 13i. Configuration files

Dirstarter configs (all in `config/`):
- `site.ts` — site name, slug, email, url, domain
- `metadata.ts` — default SEO metadata
- `links.ts` — navigation and footer links
- `ads.ts`, `blog.ts`, `breadcrumbs.ts`, `claims.ts`, `feedback.ts`, `reports.ts`, `submissions.ts`
- `rate-limit.ts` — rate limiting thresholds per action
- `tiers.ts` — pricing tier definitions (referenced by latest docs, may not be in our copy)

### 13j. Environment variables (complete list)

| Category | Variables |
| --- | --- |
| Core | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_EMAIL` |
| Database | `DATABASE_URL`, `DATABASE_PUBLIC_URL` |
| Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Redis | `REDIS_URL` (optional) |
| Email | `RESEND_API_KEY`, `RESEND_SENDER_EMAIL` |
| Storage | `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`, `S3_PUBLIC_URL` |
| Analytics | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_PLAUSIBLE_URL`, `PLAUSIBLE_API_KEY` |
| AI | `AI_GATEWAY_API_KEY`, `AI_CHAT_MODEL`, `AI_COMPLETION_MODEL`, `JINA_API_KEY`, `SCREENSHOTONE_ACCESS_KEY` |
| Payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Cron | `CRON_SECRET` |
| Build | `SKIP_ENV_VALIDATION` (for Docker builds) |

### 13k. Upstream divergence notes

| Area | Our version | Latest Dirstarter | Action |
| --- | --- | --- | --- |
| Action client | `next-safe-action` (`lib/safe-actions.ts`) | `oRPC` (`lib/orpc.ts`) | **No migration** — our version works, stay on it |
| Framework | Next.js 15 | Next.js 16 (per docs) | Monitor, don't upgrade mid-sprint |
| Linting | Biome | OXC (oxlint + oxfmt) | Defer — Biome works fine |
| Config | No `rate-limit.ts` or `tiers.ts` | Has both | Add if needed |

---

## 14. D-014 Decision: Tool entity disposition

### Decision: **Option B — Repurpose as Directory Listing**

**Rationale**: Dirstarter's `Tool` entity provides a complete, battle-tested CRUD pipeline:
- 12 web components (card, list, filters, search, hover-card, entry, etc.)
- 7 admin components (table, form, publish actions, delete dialog)
- Server module with actions, queries, payloads, schema
- Content workflow: submit → review → schedule → publish
- Stripe integration for tiered listings
- Screenshot/favicon automation
- SEO: sitemap, structured data, OG images

This is **exactly** what a martial arts school directory needs. Renaming `Tool` → `Listing` (or `DirectoryEntry`) gives us the full pipeline for free. Building this from scratch would take 3+ sessions.

### Migration plan (future session)

1. **Schema**: Rename `Tool` model → `Listing` (or keep `Tool` as internal name, just relabel in UI)
2. **Admin UI**: Relabel "Tools" → "Listings" in sidebar, breadcrumbs, page titles
3. **Public UI**: Relabel tool-specific copy to directory-appropriate copy
4. **Config**: Update `config/submissions.ts`, `config/claims.ts` for directory context
5. **Routes**: Consider renaming `/admin/tools` → `/admin/listings` (or leave as-is internally)
6. **Stripe tiers**: Map Free/Standard/Premium to directory listing tiers

### What NOT to do

- Don't delete the ~30 Tool files
- Don't build a separate "directory" system from scratch
- Don't rename internal code paths until the public-facing relabel is proven

### Status

**Decided**: Option B (repurpose). Migration is a separate session task, not this session.hing the Dirstarter template provides out of the box. Every Ronin Dojo feature MUST be an extension or modification of these patterns — never invented from scratch. Consult this before writing any new file.

> **Source**: Local copy at `/Users/brianscott/Local Sites/DirStarter /dirstarter_template/` + dirstarter.com/docs. Remote agents without local access use this document as L1 reference.

## Golden rule

**If Dirstarter already has a pattern for it, use that pattern.** If you need something Dirstarter doesn't have, document the gap here first, then build it following the closest existing pattern.

---

## 1. Route structure (`app/`)

### 1a. Public web routes — `app/(web)/`

| Route | File | What it does | Ronin status |
|---|---|---|---|
| `/` (home) | `(home)/page.tsx` | Landing page with hero, count badge | 🟡 Needs brand customization |
| `/about` | `about/page.tsx` | Static about page | 🟡 Needs brand content |
| `/blog` | `blog/page.tsx` | MDX blog listing | ✅ Inherited |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | Single blog post | ✅ Inherited |
| `/categories` | `categories/(categories)/page.tsx` | Category listing | ✅ Inherited |
| `/categories/[slug]` | `categories/[slug]/page.tsx` | Single category view | ✅ Inherited |
| `/tags` | `tags/(tags)/page.tsx` | Tag listing | ✅ Inherited |
| `/tags/[slug]` | `tags/[slug]/page.tsx` | Single tag view | ✅ Inherited |
| `/dashboard` | `dashboard/page.tsx` | User dashboard (listings, table) | 🟡 Needs adaptation |
| `/submit` | `submit/page.tsx` | Tool submission flow | ⚠️ Tool-specific — decide D-014 |
| `/submit/[slug]` | `submit/[slug]/page.tsx` | Edit submission | ⚠️ Tool-specific |
| `/advertise` | `advertise/page.tsx` | Ad purchase flow | ⚠️ Monetization — keep or adapt |
| `/auth/login` | `auth/login/page.tsx` | Login page | ✅ Inherited |
| `/auth/verify` | `auth/verify/page.tsx` | Magic link verify | ✅ Inherited |
| `/[slug]` | `[slug]/page.tsx` | Tool detail page (catch-all) | ⚠️ Tool-specific |
| `/[slug]/badge.svg` | `[slug]/badge.svg/route.tsx` | Embeddable badge | ⚠️ Tool-specific |
| `/directory` | `directory/page.tsx` | Directory listing | 🆕 Ronin added |
| `/organizations/*` | `organizations/*.tsx` | Org CRUD, join, get-started | 🆕 Ronin added |
| `/programs/*` | `programs/*.tsx` | Program + schedule CRUD | 🆕 Ronin added |
| `/me` | `me/page.tsx` | User profile / passport editor | 🆕 Ronin added |

### 1b. Admin routes — `app/admin/`

| Route | Files | What it does | Ronin status |
|---|---|---|---|
| `/admin` | `page.tsx` | Dashboard with metrics (visitors, revenue, subscribers, users) | ✅ Inherited |
| `/admin/tools/*` | `tools/` (7 component files + pages) | Full CRUD: table, form, publish actions, delete dialog | ⚠️ Tool-specific |
| `/admin/categories/*` | `categories/` (6 component files + pages) | Full CRUD | ✅ Inherited |
| `/admin/tags/*` | `tags/` (6 component files + pages) | Full CRUD | ✅ Inherited |
| `/admin/users/*` | `users/` (6 component files + pages) | Full CRUD | ✅ Inherited |
| `/admin/reports/*` | `reports/` (6 component files + pages) | Report management | ✅ Inherited |
| `/admin/schedule` | `schedule/` (calendar + page) | Calendar view | ✅ Inherited |
| `/admin/leads/*` | `leads/` (7 component files + pages) | Lead CRUD + status actions + follow-up | 🆕 Ronin added (S2) |

### 1c. API routes — `app/api/`

| Route | What it does | Ronin status |
|---|---|---|
| `/api/auth/[...all]` | Better-Auth catch-all | ✅ Inherited |
| `/api/ai/completion` | AI text completion | ✅ Inherited |
| `/api/ai/generate-content` | AI content generation | ✅ Inherited |
| `/api/ai/generate-description` | AI description generation | ✅ Inherited |
| `/api/og` | OpenGraph image generation | ✅ Inherited |
| `/api/cron/publish-tools` | Scheduled tool publishing | ⚠️ Tool-specific |
| `/api/stripe/webhooks` | Stripe webhook handler | ✅ Inherited |

---

## 2. Component library

### 2a. Common UI (`components/common/`) — 34 components

These are the design system primitives. **Always use these, never create alternatives.**

| Component | Purpose |
|---|---|
| `accordion.tsx` | Collapsible sections |
| `animated-container.tsx` | Motion wrapper |
| `avatar.tsx` | User avatar |
| `badge.tsx` | Status/label badge |
| `box.tsx` | Layout box |
| `button.tsx` | Primary button component |
| `calendar.tsx` | Date picker calendar |
| `card.tsx` | Content card |
| `checkbox.tsx` | Form checkbox |
| `command.tsx` | Command palette / cmdk |
| `dialog.tsx` | Modal dialog |
| `dropdown-menu.tsx` | Dropdown menus |
| `form.tsx` | Form wrapper (React Hook Form integration) |
| `form-media.tsx` | Media upload form field |
| `heading.tsx` | Typography heading |
| `hint.tsx` | Helper text |
| `hover-card.tsx` | Hover popover |
| `input.tsx` | Text input |
| `kbd.tsx` | Keyboard shortcut display |
| `label.tsx` | Form label |
| `link.tsx` | Navigation link |
| `note.tsx` | Info/warning note |
| `ping.tsx` | Status ping indicator |
| `popover.tsx` | Popover container |
| `prose.tsx` | Rich text wrapper |
| `radio-group.tsx` | Radio button group |
| `search.tsx` | Search input |
| `select.tsx` | Select dropdown |
| `separator.tsx` | Visual separator |
| `show-more.tsx` | Expand/collapse text |
| `skeleton.tsx` | Loading skeleton |
| `slottable.tsx` | Slot composition |
| `stack.tsx` | Flex stack layout |
| `switch.tsx` | Toggle switch |
| `table.tsx` | Data table |
| `textarea.tsx` | Multi-line input |
| `toaster.tsx` | Toast notifications |
| `tooltip.tsx` | Tooltip |
| `wrapper.tsx` | Page wrapper |
| `icons/brand-*.tsx` | Social media brand icons (9 icons) |

### 2b. Admin components (`components/admin/`) — 14 files

| Component | Purpose | Pattern to follow |
|---|---|---|
| `auth-hoc.tsx` | Admin auth HOC wrapper | **Key pattern** — wrap admin pages |
| `chart.tsx` | Dashboard charts | Reuse for metrics |
| `date-range-picker.tsx` | Date range selection | Reuse in reports |
| `dialogs/delete-dialog.tsx` | Confirmation dialog for deletes | **Key pattern** — all delete flows |
| `metrics/metric-chart.tsx` | Metric visualization | Extend for school ops metrics |
| `metrics/metric-header.tsx` | Metric card header | Reuse |
| `metrics/metric-value.tsx` | Metric display value | Reuse |
| `nav.tsx` | Admin navigation bar | ✅ Inherited |
| `relation-selector.tsx` | Relation picker (e.g. tags→tools) | **Key pattern** — any M:N selector |
| `row-checkbox.tsx` | Table row selection | Used by data-table |
| `shell.tsx` | Admin page shell/layout | **Key pattern** — all admin pages |
| `sidebar.tsx` | Admin sidebar navigation | Modified (added Leads) |
| `ai/generate*.tsx` | AI content generation UI (3 files) | Reuse for content features |

### 2c. Data table (`components/data-table/`) — 9 files

Complete reusable data table system. **Never build a custom table — always use this.**

| File | Purpose |
|---|---|
| `data-table.tsx` | Main table component |
| `data-table-column-header.tsx` | Sortable column headers |
| `data-table-faceted-filter.tsx` | Faceted filtering |
| `data-table-header.tsx` | Table header with title/actions |
| `data-table-link.tsx` | Clickable row links |
| `data-table-pagination.tsx` | Pagination controls |
| `data-table-skeleton.tsx` | Loading state |
| `data-table-toolbar.tsx` | Toolbar (search, filters, view options) |
| `data-table-view-options.tsx` | Column visibility toggle |

### 2d. Web components (`components/web/`) — Dirstarter originals

| Category | Files | Purpose |
|---|---|---|
| **Auth** | `auth/login-button.tsx`, `login-dialog.tsx`, `login-form.tsx`, `login.tsx` | Complete login UI |
| **Ads** | `ads/ad-banner.tsx`, `ad-base.tsx`, `ad-card.tsx`, `ads-calendar.tsx`, `ads-picker.tsx` | Ad display + purchase |
| **Categories** | `categories/category-card.tsx`, `category-list.tsx`, `category-query.tsx` | Category browsing |
| **Tags** | `tags/tag-card.tsx`, `tag-filters.tsx`, `tag-list.tsx`, `tag-listing.tsx`, `tag-query.tsx`, `tag-search.tsx` | Tag browsing + filtering |
| **Tools** | `tools/tool-*.tsx` (12 files) | Tool display, filtering, search |
| **Listings** | `listings/featured-tools.tsx`, `featured-tools-icons.tsx`, `related-tools.tsx` | Featured/related content |
| **Posts** | `posts/post-card.tsx`, `post-list.tsx` | Blog post display |
| **Products** | `products/product.tsx`, `product-features.tsx`, `product-interval-switch.tsx`, `product-list.tsx`, `product-query.tsx` | Stripe product display |
| **Dialogs** | `dialogs/tool-claim-dialog.tsx`, `tool-embed-dialog.tsx`, `tool-report-dialog.tsx` | Tool-specific dialogs |
| **Filters** | `filters/filters.tsx`, `sort.tsx` | Generic filter/sort UI |
| **UI primitives** | `ui/author.tsx`, `backdrop.tsx`, `breadcrumbs.tsx`, `container.tsx`, `favicon.tsx`, `grid.tsx`, `hamburger.tsx`, `intro.tsx`, `logo-symbol.tsx`, `logo.tsx`, `nav-link.tsx`, `section.tsx`, `stat.tsx`, `sticky.tsx`, `tag.tsx`, `tile.tsx` | Page layout building blocks |
| **Layout** | `header.tsx`, `footer.tsx`, `nav.tsx`, `bottom.tsx`, `inline-menu.tsx` | Site chrome |
| **Content** | `markdown.tsx`, `mdx.tsx`, `mdx-components.tsx`, `structured-data.tsx`, `table-of-contents.tsx` | Content rendering |
| **Misc** | `listing.tsx`, `empty-list.tsx`, `external-link.tsx`, `feature-nudge.tsx`, `feedback-widget.tsx`, `overlay-image.tsx`, `pagination.tsx`, `price.tsx`, `stats.tsx`, `testimonial.tsx`, `theme-switcher.tsx`, `cta-form.tsx`, `cta-proof.tsx`, `verified-badge.tsx`, `built-with.tsx`, `user-logout.tsx`, `user-menu.tsx` | Various utilities |

### 2e. Ronin-added web components

| File | Purpose | Added in |
|---|---|---|
| `lead-capture-form.tsx` | Public lead capture | S2 |
| `organizations/create-organization-form.tsx` | Org creation | S1–S2 |
| `organizations/invite-join-form.tsx` | Join by invite code | S2 |
| `organizations/join-organization-button.tsx` | Join org CTA | S2 |
| `organizations/membership-actions.tsx` | Membership management | S2 |
| `programs/create-program-form.tsx` | Program creation | S2 |
| `schedules/create-schedule-form.tsx` | Schedule creation | S2 |
| `schedules/materialize-schedule-button.tsx` | Generate sessions | S2 |
| `schedules/schedule-instructor-list.tsx` | Instructor assignment | S2 |
| `directory/directory-*.tsx` (4 files) | Directory browsing | S2 |
| `og/og-base.tsx` | OG image base | S2 |

---

## 3. Server layer

### 3a. Dirstarter original server modules

| Module | Files | Pattern |
|---|---|---|
| `server/admin/categories/` | `actions.ts`, `queries.ts`, `schema.ts` | **Canonical admin CRUD pattern** |
| `server/admin/tags/` | `actions.ts`, `queries.ts`, `schema.ts` | Same pattern |
| `server/admin/tools/` | `actions.ts`, `queries.ts`, `schema.ts` | Same pattern |
| `server/admin/users/` | `actions.ts`, `queries.ts`, `schema.ts` | Same pattern |
| `server/admin/reports/` | `actions.ts`, `queries.ts`, `schema.ts` | Same pattern |
| `server/admin/shared/` | `schema.ts` | Shared Zod schemas for admin |
| `server/web/actions/` | `claim.ts`, `filters.ts`, `media.ts`, `report.ts`, `search.ts`, `submit.ts`, `subscribe.ts` | **Canonical web action pattern** |
| `server/web/ads/` | `actions.ts`, `payloads.ts`, `queries.ts` | With payloads pattern |
| `server/web/categories/` | `payloads.ts`, `queries.ts` | Read-only with payloads |
| `server/web/tags/` | `payloads.ts`, `queries.ts`, `schema.ts` | Read + schema |
| `server/web/tools/` | `payloads.ts`, `queries.ts`, `schema.ts` | Read + schema |
| `server/web/products/` | `actions.ts`, `queries.ts`, `schema.ts` | Stripe products |
| `server/web/shared/` | `schema.ts` | Shared web schemas |

**Key pattern**: Every server module follows `actions.ts` (mutations) + `queries.ts` (reads) + `schema.ts` (Zod validation) + optional `payloads.ts` (Prisma select shapes).

### 3b. Ronin-added server modules

| Module | Files | Added in |
|---|---|---|
| `server/admin/leads/` | `actions.ts`, `queries.ts`, `schema.ts` | S2 |
| `server/web/attendance/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `errors.ts` + tests | S2 |
| `server/web/enrollment/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `errors.ts` | S2 |
| `server/web/entitlement/` | `check-entitlement.ts`, `grant-entitlement.ts`, `revoke-entitlement.ts`, `expire-entitlements.ts`, `manage-entitlements.ts` | S2 |
| `server/web/family/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `errors.ts` | S2 |
| `server/web/lead/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `errors.ts`, `public-actions.ts` + tests | S2 |
| `server/web/organization/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `discipline-queries.ts` | S1–S2 |
| `server/web/passport/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts` | S2 |
| `server/web/program/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts` | S2 |
| `server/web/schedule/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `errors.ts`, `audit.ts`, `session-generator.ts` + tests | S2 |
| `server/web/school-ops/` | `audit.ts` | S2 |
| `server/web/waiver/` | `actions.ts`, `queries.ts`, `schemas.ts`, `payloads.ts`, `errors.ts` | S2 |
| `server/web/directory/` | `queries.ts`, `payloads.ts`, `schema.ts` | S2 |

---

## 4. Lib / infrastructure

| File | Purpose | Ronin status |
|---|---|---|
| `lib/safe-actions.ts` | next-safe-action client chain (auth + rate limiting) | Modified (added `publicActionClient`) |
| `lib/auth.ts` | Better-Auth server config | ✅ Inherited |
| `lib/auth-client.ts` | Better-Auth client | ✅ Inherited |
| `lib/auth-hoc.ts` | Auth HOC utility | ✅ Inherited |
| `lib/authz.ts` | Authorization helpers | 🆕 Ronin added |
| `lib/brand-context.ts` | Brand resolution from request | 🆕 Ronin added |
| `lib/data-table.ts` | Data table utilities | ✅ Inherited |
| `lib/email.ts` | Email sending via Resend | ✅ Inherited |
| `lib/fonts.ts` | Font configuration | ✅ Inherited |
| `lib/i18n.ts` | Internationalization config | ✅ Inherited |
| `lib/mdx.ts` | MDX processing | ✅ Inherited |
| `lib/media.ts` | S3 media upload | ✅ Inherited |
| `lib/notifications.ts` | Notification helpers | ✅ Inherited |
| `lib/opengraph.ts` | OG image utilities | ✅ Inherited |
| `lib/pages.ts` | Page utilities | ✅ Inherited |
| `lib/parsers.ts` | URL/query parsers (nuqs) | ✅ Inherited |
| `lib/products.ts` | Stripe product helpers | ✅ Inherited |
| `lib/rate-limiter.ts` | Rate limiting | ✅ Inherited |
| `lib/scraper.ts` | Web scraping for tool submissions | ⚠️ Tool-specific |
| `lib/structured-data.ts` | JSON-LD structured data | ✅ Inherited |
| `lib/tools.ts` | Tool-specific utilities | ⚠️ Tool-specific |
| `lib/utils.ts` | General utilities | ✅ Inherited |
| `lib/ai.ts` | AI integration | ✅ Inherited |
| `lib/ads.ts` | Ad utilities | ✅ Inherited |
| `lib/analytics.ts` | Analytics integration | ✅ Inherited |

---

## 5. Services

| File | Purpose | Ronin status |
|---|---|---|
| `services/db.ts` | Prisma client singleton | ✅ Inherited (extended with brand scoping) |
| `services/plausible.ts` | Plausible analytics | ✅ Inherited |
| `services/redis.ts` | Redis client | ✅ Inherited |
| `services/resend.ts` | Resend email service | ✅ Inherited |
| `services/s3.ts` | S3 storage client | ✅ Inherited |
| `services/stripe.ts` | Stripe client | ✅ Inherited |

---

## 6. Hooks

| Hook | Purpose | Ronin status |
|---|---|---|
| `use-ads.ts` | Ad display logic | ✅ Inherited |
| `use-auth-callback-url.ts` | Auth redirect URL | ✅ Inherited |
| `use-computed-field.ts` | Computed form fields | ✅ Inherited |
| `use-data-table.ts` | Data table state | ✅ Inherited |
| `use-magic-link.ts` | Magic link auth flow | ✅ Inherited |
| `use-media-action.ts` | Media upload action | ✅ Inherited |
| `use-product-prices.ts` | Stripe price display | ✅ Inherited |
| `use-track-event.ts` | Analytics event tracking | ✅ Inherited |

---

## 7. Config

| File | Purpose | Ronin status |
|---|---|---|
| `config/site.ts` | Site name, URL, description | Modified per brand |
| `config/metadata.ts` | Default SEO metadata | Modified per brand |
| `config/links.ts` | Navigation links | Modified per brand |
| `config/ads.ts` | Ad configuration | ✅ Inherited |
| `config/blog.ts` | Blog settings | ✅ Inherited |
| `config/breadcrumbs.ts` | Breadcrumb config | ✅ Inherited |
| `config/claims.ts` | Tool claim config | ⚠️ Tool-specific |
| `config/feedback.ts` | Feedback widget config | ✅ Inherited |
| `config/reports.ts` | Report config | ✅ Inherited |
| `config/submissions.ts` | Submission settings | ⚠️ Tool-specific |

---

## 8. Emails

| Template | Purpose | Ronin status |
|---|---|---|
| `magic-link.tsx` | Magic link login email | ✅ Inherited |
| `submission.tsx` | New submission confirmation | ⚠️ Tool-specific |
| `submission-premium.tsx` | Premium submission upsell | ⚠️ Tool-specific |
| `submission-published.tsx` | Tool published notification | ⚠️ Tool-specific |
| `submission-scheduled.tsx` | Scheduled publication notice | ⚠️ Tool-specific |
| `admin-submission-premium.tsx` | Admin premium submission alert | ⚠️ Tool-specific |
| `verify-domain.tsx` | Domain verification email | ✅ Inherited |
| `components/wrapper.tsx` | Email layout wrapper | ✅ Inherited — **always use this** |
| `components/button.tsx` | Email CTA button | ✅ Inherited |
| `components/action-nudge.tsx` | Action nudge block | ✅ Inherited |
| `components/expedite-nudge.tsx` | Expedite upsell block | ⚠️ Tool-specific |
| `components/feature-nudge.tsx` | Feature nudge block | ✅ Inherited |
| `lead-capture-confirmation.tsx` | Lead capture confirmation | 🆕 Ronin added |

---

## 9. Infrastructure files (root)

| File | Purpose |
|---|---|
| `biome.json` | Linting/formatting (NOT ESLint) |
| `content-collections.ts` | ~~MDX content collection definitions~~ — **Removed (SESSION_0137).** Blog now DB-backed via Post model. |
| `env.ts` | Environment variable validation |
| `next.config.ts` | Next.js configuration |
| `postcss.config.mjs` | PostCSS for Tailwind |
| `prisma.config.ts` | Prisma config |
| `proxy.ts` | Dev proxy |
| `tsconfig.json` | TypeScript config |
| `vercel.json` | Vercel deployment config |
| `next-sitemap.config.cjs` | Sitemap generation |

---

## 10. Key patterns to follow (not files — conventions)

### Admin CRUD pattern

For any new admin entity, follow `admin/tools/` as the canonical example:

```text
app/admin/{entity}/
  page.tsx                              ← list page (uses shell HOC)
  new/page.tsx                          ← create page
  [id-or-slug]/page.tsx                 ← edit page
  _components/
    {entity}-table.tsx                  ← DataTable wrapper
    {entity}-table-columns.tsx          ← Column definitions
    {entity}-table-toolbar-actions.tsx   ← Toolbar buttons
    {entity}-form.tsx                   ← Create/edit form
    {entity}-actions.tsx                ← Row action dropdown
    {entity}-delete-dialog.tsx          ← Delete confirmation

server/admin/{entity}/
  actions.ts                            ← Server actions (mutations)
  queries.ts                            ← Server queries (reads)
  schema.ts                             ← Zod validation schemas
```

### Web entity pattern

For any new public-facing entity, follow `web/tools/` as the example:

```text
server/web/{entity}/
  actions.ts     ← Mutations (via userActionClient or publicActionClient)
  queries.ts     ← Cached reads
  payloads.ts    ← Prisma select shapes
  schema.ts      ← Zod schemas
  errors.ts      ← (optional) Custom error classes
```

### Action client chain

```text
actionClient          ← base (rate limiting, error handling)
  → userActionClient  ← adds auth (session required)
  → adminActionClient ← adds admin role check
  → publicActionClient ← no auth (for public forms like lead capture)
```

### Page shell pattern

Every admin page wraps in `<Shell>` from `components/admin/shell.tsx`. Auth is enforced via HOC from `components/admin/auth-hoc.tsx`.

---

## 11. Status legend

| Symbol | Meaning |
|---|---|
| ✅ Inherited | Unchanged from Dirstarter — use as-is |
| 🟡 Needs work | Inherited but needs brand/domain customization |
| ⚠️ Tool-specific | Dirstarter's "tool directory" concept — decide via D-014 |
| 🆕 Ronin added | New to Ronin Dojo, not in Dirstarter |

---

## 12. Open questions for planning

1. **D-014 resolution**: The `Tool` entity and its ~30 related files — quarantine, repurpose as "Directory Listing", or remove?
2. **dirstarter.com/docs**: What additional patterns (caching, middleware, deployment) should we document from their docs site?
3. **L1 drift check**: Which Ronin modifications have diverged from Dirstarter patterns and need realignment?
