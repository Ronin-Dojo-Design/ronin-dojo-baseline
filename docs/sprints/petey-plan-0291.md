---
title: "Petey Plan 0291 — BrandSettings model + admin brand-settings CRUD + runtime CSS injection"
slug: petey-plan-0291
type: plan
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0291
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0291.md
  - docs/sprints/petey-plan-0287.md
  - docs/sprints/SESSION_0290.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0291 — BrandSettings + OrgSettings theme fields + admin CRUD

## Context

SESSION_0290 landed per-brand asset paths in `config/site.ts` and `resolvePublicMediaUrl`.
The CSS theme tokens (`--color-primary`, `--color-accent`) are still hardcoded in
`styles.css` via `[data-brand="BBL"]` selectors. D5 (admin brand-settings page) is
the next step: make colors + asset URLs **DB-driven** so admins can customize
without code deploys.

This is the foundation for the white-label wizard (WORKFLOW 5.0 backlog).

## Decisions resolved in grilling

- **D5 — Model strategy**: Two-tier cascade. New `BrandSettings` model (per-brand,
  `brand Brand @unique`) + extend existing `OrgSettings` with same nullable theme
  fields (per-org override). Resolution order:
  `styles.css defaults → BrandSettings → OrgSettings override`.
- **D6 — Color naming**: `primaryColor`, `primaryFgColor`, `accentColor`,
  `accentFgColor` — maps 1:1 to CSS custom properties `--color-primary`,
  `--color-primary-foreground`, `--color-accent`, `--color-accent-foreground`.
- **D7 — S3 provisioning**: Deferred to next session (operator task, needs AWS creds).
- **D8 — Org-level admin UI**: OrgSettings theme override admin UI deferred to next
  session. This session builds the BrandSettings admin page + the schema for both.

## Architecture

### Cascade

```text
styles.css (compile-time defaults)
  → BrandSettings row (DB, per-brand — admin override)
    → OrgSettings theme fields (DB, per-org — white-label override)
```

Null fields at any level mean "inherit from the level above."

### BrandSettings model (new)

```prisma
model BrandSettings {
  id                  String   @id @default(cuid())
  brand               Brand    @unique
  primaryColor        String?  // HSL string, e.g. "1 79% 51%"
  primaryFgColor      String?
  accentColor         String?
  accentFgColor       String?
  logoUrl             String?
  faviconUrl          String?
  ogImageUrl          String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### OrgSettings extension (same fields, nullable)

Add to existing `OrgSettings`:

```prisma
  // Theme overrides (null = inherit from BrandSettings)
  primaryColor        String?
  primaryFgColor      String?
  accentColor         String?
  accentFgColor       String?
  logoUrl             String?
  faviconUrl          String?
  ogImageUrl          String?
```

### Runtime CSS injection

In `app/layout.tsx`, after resolving brand, query `BrandSettings` (cached).
Emit a `<style>` tag with CSS custom property overrides:

```html
<style>{`[data-brand="${brand}"] {
  --color-primary: hsl(${primaryColor});
  --color-primary-foreground: hsl(${primaryFgColor});
  --color-accent: hsl(${accentColor});
  --color-accent-foreground: hsl(${accentFgColor});
}`}</style>
```

The static `styles.css` `[data-brand]` selectors remain as fallbacks.

## Tasks — this session

| ID | Description | Agent | Depends |
| --- | --- | --- | --- |
| SESSION_0291_TASK_01 | Add `BrandSettings` model to schema + extend `OrgSettings` with theme fields + migration | Cody | — |
| SESSION_0291_TASK_02 | Server queries + actions for BrandSettings CRUD (`server/admin/brand-settings/`) | Cody | TASK_01 |
| SESSION_0291_TASK_03 | Admin brand-settings page (`app/admin/brand-settings/page.tsx`) with form | Cody | TASK_02 |
| SESSION_0291_TASK_04 | Runtime CSS injection in `layout.tsx` — read BrandSettings, emit `<style>` override | Cody | TASK_01 |
| SESSION_0291_TASK_05 | Seed BrandSettings rows from current `styles.css` values (BBL + WEKAF) | Cody | TASK_01 |
| SESSION_0291_TASK_06 | Verification — typecheck + biome clean | Doug | all |

## Next session (staged)

- Org-level theme admin UI (extend existing org settings page with theme fields)
- S3 bucket provisioning (operator task)
- Wire `logoUrl`/`faviconUrl`/`ogImageUrl` from BrandSettings into layout (currently
  served from `config/site.ts` — add DB-override layer)

## Scope guard

- No S3 provisioning this session
- No org-level admin UI this session
- No changes to `resolvePublicMediaUrl` or `config/site.ts` brand asset paths —
  those keep working as-is; DB asset URLs are an override layer for later

**Planned Passion Produces Purpose. OSSS.**
