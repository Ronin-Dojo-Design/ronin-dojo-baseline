---
title: "White-Label Site Runbook"
slug: white-label-site-runbook
type: runbook
status: active
created: 2026-05-28
updated: 2026-05-28
last_agent: claude-session-0284
pairs_with:
  - docs/runbooks/vercel-domain-setup-runbook.md
  - docs/runbooks/bbl-production-runbook.md
  - docs/architecture/decisions/0021-brand-aware-magic-links.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
  - docs/architecture/decisions/0006-multi-domain-hosting.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - white-label
  - brand
  - multi-brand
  - theming
  - seo
  - rdd
  - bbl
  - baseline
  - wekaf
  - dirstarter
---

# White-Label Site Runbook

## Purpose

A **rolling** source of truth for making any brand site fully white-labeled — no hardcoded "Baseline Martial Arts" leaking onto BBL, RDD, or WEKAF surfaces. The immediate driver is `ronindojodesign.com` becoming a true white-label SaaS sales / live-demo site, but every item here applies to all four brands served from the one Vercel deployment (ADR 0006).

This doc is **living**: the audit table below is the backlog. When a surface is converted to brand-aware, flip its row to ✅ and cite the session. When a new hardcoded surface is discovered, add a row.

> This runbook is strategy + checklist + audit ledger. It does not itself ship code. Conversions land in sessions (SESSION_0283 started it; SESSION_0284 continued it) against the brand-resolution layer described below.

---

## The brand-resolution layer (what to reuse — do not reinvent)

All brand-aware reads go through the layer added in SESSION_0282/0283. Do **not** invent a parallel brand lookup.

| Helper | File | Use in | Returns |
| --- | --- | --- | --- |
| `siteConfig` | `apps/web/config/site.ts` | static fallback / build-time only | `{ name, slug, email, url, domain }` — name defaults to "Baseline Martial Arts" |
| `getBrandSiteConfig(brand)` | `apps/web/config/site.ts` | server components / actions / route handlers | `{ name, slug, tagline, description, email, url, domain }` |
| `getRequestBrand()` | `apps/web/lib/brand-context.ts` | server-side (async; reads request host) | `Brand` enum |
| `useBrand()` | `apps/web/contexts/brand-context.tsx` | client components under `BrandProvider` | brand context value |
| `data-brand` + CSS tokens | `apps/web/app/styles.css` | theming | per-brand color tokens via `data-brand="BBL"` etc. |

**Canonical server pattern** (from `apps/web/app/layout.tsx`, SESSION_0283):

```ts
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"

const brand = await getRequestBrand()
const brandConfig = getBrandSiteConfig(brand)
// use brandConfig.name / .tagline / .description / .slug
```

### What varies per brand vs. what does not (important)

`brandConfigs` in `config/site.ts` only varies **`name`, `slug`, `tagline`, `description`** per brand. **`email`, `url`, `domain`** are sourced from shared env (`NEXT_PUBLIC_SITE_EMAIL`, `NEXT_PUBLIC_SITE_URL`) and are **identical across all brands today**.

Consequence: converting `siteConfig.name` is a real win; converting `siteConfig.url/.email/.domain` to `getBrandSiteConfig(...)` is a **no-op** until a per-brand source exists. Making those truly brand-aware is its own work item (see backlog) — it needs either per-brand env, a per-brand row in `brandConfigs`, or host-derivation.

Per-brand brand identity lives in `brandConfigs`:

| Brand enum | name | slug | tagline |
| --- | --- | --- | --- |
| `BASELINE_MARTIAL_ARTS` | Baseline Martial Arts | baseline-martial-arts | Train Smart. Fight Ready. Community First. |
| `RONIN_DOJO_DESIGN` | Ronin Dojo Design | ronin-dojo-design | White-Label Dojo Management, Built for Growth. |
| `BBL` | Black Belt Legacy | black-belt-legacy | Honor the Lineage. Build the Future. |
| `WEKAF` | WEKAF USA | wekaf-usa | World Eskrima Kali Arnis Federation — USA Chapter. |

---

## Static → dynamic audit (the rolling backlog)

Counts are `siteConfig.*` occurrences at SESSION_0284 (via `grep -rn "siteConfig.<field>" apps/web/`). Re-run the grep when updating this table.

| Token | Occurrences | Brand-varying? | Status | Notes |
| --- | ---: | --- | --- | --- |
| `siteConfig.name` | 48 → **18 remaining** | ✅ yes | 🔶 30 converted (SESSION_0283 + SESSION_0284) | Server components, route handlers (`og`, `badge.svg`), client components (via `useBrand()`), and server actions converted in SESSION_0284. 18 remain: see per-file categorization. |
| `siteConfig.url` | 39 | ❌ env-global | ⛔ blocked | No-op until per-brand URL source exists. |
| `siteConfig.email` | 14 | ❌ env-global | ⛔ blocked | No-op until per-brand email source exists. |
| `siteConfig.domain` | 6 | ❌ env-global | ⛔ blocked | Derived from `NEXT_PUBLIC_SITE_URL`; same for all brands. |
| `siteConfig.slug` | 5 | ✅ yes | ⬜ not started | Lower visibility; convert opportunistically. |
| email templates (`apps/web/emails/**`) | — | ✅ yes (name) | ⬜ not started | Needs a `brand` prop threaded from each caller. |
| JSON-LD (`lib/structured-data.ts`) | (subset of name) | ✅ yes | 🔶 see SESSION_0284 | `getOrganization()`/`getWebSite()` — convert if server context available. |

<!-- SESSION_0284 TASK_01 produces the precise file-level categorization (server | client | email | static). Paste/refine it under "Per-file categorization" below at bow-out. -->

### Per-file categorization (from SESSION_0284_TASK_01)

**Converted (server-context):** all `app/(web)/**/page.tsx` that used `siteConfig.name` (about, advertise, advertise/success, auth/login, auth/verify, blog, categories ×2, cookies, dashboard, posts, privacy, submit ×3, tags ×2, terms) → `await getRequestBrand()` + `getBrandSiteConfig(brand).name`.

**Converted (route handlers):** `app/api/og/route.tsx`, `app/(web)/[slug]/badge.svg/route.tsx` → resolve brand server-side, thread `siteName` as a prop into the satori/OG components.

**Converted (client, via `useBrand()`):** `components/web/nav.tsx`, `components/web/feedback-widget.tsx` (name + slug), `components/web/feature-nudge.tsx`, `components/web/dialogs/tool-claim-dialog.tsx`.

**Converted (server actions):** `server/web/actions/claim.ts`, `server/web/lead/actions.ts` → `getRequestBrand()`; `server/admin/tools/actions.ts` → passes `ctx.brand` into notifications. `lib/notifications.ts` → now takes optional `brand?: Brand`, falls back to `siteConfig.name`.

**Deferred — needs metadata-as-function refactor (HIGHEST VALUE next):** `config/metadata.ts` is a **static module** with no request context, so every page that spreads its `openGraph` still emits `og:site_name="Baseline Martial Arts"`. This is the root cause of the subpage `og:site_name` leak observed on `bbl.local` (the `<title>` is already brand-aware; `og:site_name` is not). Fix = make metadata brand-aware per request (per-page `generateMetadata` calling `getRequestBrand`, or refactor `config/metadata.ts` into a `getBrandMetadata(brand)` function). **STAGED:** `docs/sprints/petey-plan-0285.md` (SESSION_0285, slotted ahead of assets→S3) — both `og:site_name` and JSON-LD funnel through the two `lib/pages.ts` helpers (`getPageMetadata` / `getPageData`), so one async brand-thread + `await` in 46 callers fixes both.

**Deferred — JSON-LD:** `lib/structured-data.ts` `getOrganization()` / `getWebSite()` still emit `name: "Baseline Martial Arts"` in the structured-data `<script>`. Crawler-only, not user-visible. Same fix shape (thread brand).

**Deferred — emails (need a `brand` prop threaded from callers):** `lib/email.ts`, `emails/components/wrapper.tsx`, `emails/components/action-nudge.tsx`, `emails/invite-notification.tsx`, `emails/magic-link.tsx`, `emails/submission-published.tsx`, `emails/submission-scheduled.tsx`, `emails/verify-domain.tsx`.

Verified at SESSION_0284 via `bun run typecheck` (0 errors), `biome check` (clean), and `bbl.local:3000` smoke: `/about` + `/terms` `<title>` = "… Black Belt Legacy"; residual "Baseline Martial Arts" hits = `og:site_name` (config/metadata.ts) + JSON-LD (structured-data.ts), both deferred above.

---

## White-label surface checklist

When standing up or auditing a brand, confirm each surface resolves the brand (not a hardcoded default):

- [ ] **Page metadata** — `<title>` template, description, `og:site_name`, `og:title` (layout + per-page `generateMetadata`).
- [ ] **OG images** — `app/api/og/route.tsx` brand name/colors.
- [ ] **Favicon / logo / wordmark** — brand asset, not a shared default (depends on S3 asset pipeline — see roadmap).
- [ ] **JSON-LD structured data** — `lib/structured-data.ts` organization + website name/url.
- [ ] **Navigation / header** — `components/web/nav.tsx` wordmark text.
- [ ] **Emails** — transactional templates (`emails/**`): from-name, signature, brand name in copy.
- [ ] **Ads / CTAs** — "Advertise on `{brand}`" labels (done SESSION_0283).
- [ ] **Legal pages** — privacy / terms / cookies brand name + contact email.
- [ ] **Auth surfaces** — login / verify / magic-link copy.
- [ ] **Social links / contact email** — per-brand (currently env-global — blocked, see audit).
- [ ] **Theme tokens** — `data-brand` CSS custom properties (primary/accent) render per brand.

---

## What's left for the RDD live-demo (`ronindojodesign.com`)

For RDD to be a credible white-label sales demo, in priority order:

1. **Finish `siteConfig.name` tail** — client components + the email templates (brand prop threading).
2. **Per-brand `url`/`email`** — decide the source (per-brand env vs `brandConfigs` rows vs host-derivation), then convert the 39 `.url` + 14 `.email` refs. This is the biggest remaining structural item.
3. **Brand assets** — logo/wordmark/OG per brand from S3 (depends on the assets→S3 + media-upload work).
4. **Demo content** — a believable seeded brand so the demo isn't empty.
5. **Domain live** — `ronindojodesign.com` attached + verified per [vercel-domain-setup-runbook](vercel-domain-setup-runbook.md) (brand-rollout section already lists it → `ronin-dojo-design` Vercel project).

---

## Adding a brand domain (delegated to the domain runbook)

Do not re-derive DNS/Vercel steps here. Per ADR 0006 all brands share one Vercel deployment; per ADR 0015 Bluehost stays the DNS registrar. Follow [vercel-domain-setup-runbook](vercel-domain-setup-runbook.md) → "Brand Rollout". For the BBL-specific WordPress→Vercel cutover, see [bbl-production-runbook](bbl-production-runbook.md).

---

## Cross-references

- [Vercel Domain Setup Runbook](vercel-domain-setup-runbook.md) — Bluehost→Vercel domain attach for each brand.
- [BBL Production Runbook](bbl-production-runbook.md) — BBL-specific cutover from WordPress/Flywheel.
- [ADR 0006 — Multi-domain hosting on one Vercel deployment](../architecture/decisions/0006-multi-domain-hosting.md)
- [ADR 0021 — Brand-aware magic links](../architecture/decisions/0021-brand-aware-magic-links.md)
- [ADR 0022 — Brand Chrome Resolution](../architecture/decisions/0022-brand-chrome-resolution.md)

**Planned Passion Produces Purpose.**
**OSSS.**
