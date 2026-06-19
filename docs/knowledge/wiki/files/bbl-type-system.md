---
title: "BBL type system (fonts.ts + styles.css + brand-theme.ts)"
slug: bbl-type-system
type: file
status: active
created: 2026-06-19
updated: 2026-06-19
author: Brian + Claude
last_agent: claude-session-0416
backlinks:
  - sprints/SESSION_0416
wiring:
  - "apps/web/lib/fonts.ts — fontSans=Geist (var: --font-geist), bblHeadingFont=Poppins, bblBodyFont=Inter"
  - "apps/web/app/layout.tsx — loads fontSans + bblHeadingFont + bblBodyFont .variable on <html> (global)"
  - "apps/web/app/styles.css — @theme: --font-display=Poppins, --font-sans=Inter (Geist fallback)"
  - "apps/web/lib/brand-theme.ts — brandThemeCss(scope, settings) HSL-guarded token injection (one helper)"
  - "apps/web/app/(web)/organizations/[slug]/layout.tsx — [data-org] uses brandThemeCss"
tags: [bbl, fonts, theme, tokens, design-system, s6]
---

# BBL type system — fonts + tokens

**Paths:** `apps/web/lib/fonts.ts` · `apps/web/app/layout.tsx` · `apps/web/app/styles.css` ·
`apps/web/lib/brand-theme.ts`

The **single-brand BBL type system** (SESSION_0416): **Poppins** headings + **Inter** body
site-wide, with **Geist** as the neutral fallback.

## How it works (the right way)

1. `app/layout.tsx` loads all three font `.variable` classes on `<html>` — so
   `--font-bbl-heading` / `--font-bbl-body` resolve on **every** page, not just inside a
   `<BrandTypography>` scope (that was the bug: off-holding-page headings were Geist/system-ui).
2. `lib/fonts.ts` renames the Geist var to **`--font-geist`** (NOT `--font-sans`) so the theme
   tokens can point at the BBL fonts without a self-referential cycle.
3. `styles.css` `@theme`: `--font-display: var(--font-bbl-heading, var(--font-geist))` (headings)
   and `--font-sans: var(--font-bbl-body, var(--font-geist))` (body).

## Gotchas

- Tailwind v4 caches `@theme` in Turbopack — a `@theme` edit needs a full `rm -rf .next` in dev
  (prod `next build` compiles fresh).
- `brand-theme.ts` is the ONE guarded `brandThemeCss()` helper used by both the `[data-brand]`
  (root) and `[data-org]` injections — closes the previously-unguarded brand inject seam. The
  BrandSettings table is empty on prod, so the static `[data-brand="BBL"]` block in styles.css
  is the live color SoT; the injection is the deploy-free admin-edit path.
