---
title: "ADR 0022 — Brand Chrome Resolution"
slug: adr-0022-brand-chrome-resolution
type: decision
status: accepted
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0281
pairs_with:
  - docs/architecture/decisions/0021-brand-aware-magic-links.md
  - apps/web/lib/brand-context.ts
  - apps/web/contexts/brand-context.tsx
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0022 — Brand Chrome Resolution

## Status

Accepted

## Context

The Ronin Dojo platform serves multiple brands (Baseline Martial Arts, Black Belt Legacy, WEKAF USA) from a single Next.js deployment. Middleware already resolves `host → Brand` via `proxy.ts` → `brand-context.ts` and surfaces the brand as an `x-brand` header and cookie.

However, shell chrome components (Header, Footer, Logo) used the static `siteConfig` import which always returned "Baseline Martial Arts." When visiting `bbl.local`, the header incorrectly displayed "Baseline Martial Arts" instead of "Black Belt Legacy" (observed in SESSION_0280 browser smoke).

## Decision

### 1. BrandProvider context

A React context (`contexts/brand-context.tsx`) wraps the app in the root server layout. The server layout calls `getRequestBrand()` and passes the `Brand` enum to `<BrandProvider brand={brand}>`. Client components access the resolved brand via `useBrand()`.

### 2. Brand-aware shell components

- `Logo` reads `useBrand().name` instead of `siteConfig.name`
- `generateMetadata()` in the root layout uses `getBrandSiteConfig(brand)` for `<title>` and `<meta description>`

### 3. CSS theme tokens via `data-brand`

The root `<html>` element receives a `data-brand` attribute (e.g., `data-brand="BBL"`). CSS custom property overrides in `styles.css` target `[data-brand="BBL"]` to swap the primary color to gold, and `[data-brand="WEKAF"]` to swap to red. Both light and dark modes are covered.

### 4. Brand config lives in `config/site.ts`

`brandConfigs` (already existed) holds per-brand `name`, `slug`, `tagline`, `description`. `getBrandSiteConfig(brand)` merges these with env-provided `email`, `url`, `domain`. This is the single source of truth — no duplication in i18n JSON or hardcoded strings.

## Consequences

- Every brand domain now renders the correct name in header, footer, browser tab, and meta tags
- Adding a new brand requires: (1) add to `Brand` enum in Prisma, (2) add host mapping in `brand-context.ts`, (3) add config in `config/site.ts`, (4) optionally add CSS tokens in `styles.css`
- The `siteConfig` static export remains for backward compatibility in contexts where brand isn't resolved yet (build-time, static imports)
- No breaking changes — `siteConfig` still works everywhere it was used before

## Alternatives considered

- **i18n namespace per brand:** Rejected — brand name is data, not localization. Adding BBL strings to `messages/en/brand.json` would conflate language with brand identity.
- **Cookie-based client detection:** Rejected — the `x-brand` header is already set by trusted middleware and the provider pattern is cleaner than cookie parsing in every component.
- **Separate deployments per brand:** Rejected — contradicts the multi-tenant single-deploy architecture (ADR 0006).
