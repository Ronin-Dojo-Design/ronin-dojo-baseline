---
title: "Giddy review-recommend — Stage 1 close-out + next-order"
slug: giddy-review-recommend
type: review
status: active
created: 2026-06-22
updated: 2026-06-22
author: Giddy (codebase-quality reviewer)
reviewed_at_sha: 50d73fe4
pairs_with:
  - docs/petey-plan-brand-harness-prune.md
  - docs/knowledge/wiki/files/m-card-pattern.md
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Giddy review-recommend — Stage 1 close-out

Codebase-quality review at `main@50d73fe4`, immediately after **brand-harness prune Stage 1**
(PRs #152–#155) merged + deployed to prod. Tooling: `fallow health` / `audit` / `dead-code`
(v2.91), scoped to the 242 files changed since the session-start commit `63a75a93`.

## Verdict

**Maintainability 89.5 (good). Stage 1 is a clean, behavior-preserving refactor — ship-quality.**

- **Zero new dead code introduced.** No orphaned `getRequestBrand` helpers, imports, or dangling
  brand types remain — the prune cleaned up after itself.
- **No filters dropped.** Every removed `where:{ brand }` was re-added as `brand: Brand.BBL`
  (32 removed → 32+ re-added; net brand-filter count *increased*). The constant was inlined; no
  filter was silently stripped.
- **Isolation coverage intact.** The `*.brand-isolation.test.ts` canaries flip only the *matching*
  brand to BBL and keep a non-BBL `FOREIGN_BRAND` — so "BBL query excludes the foreign row" stays
  meaningful, and they pass.
- All findings below are **pre-existing tech debt in files we touched**, not regressions. fallow's
  gate excluded **263 inherited findings** from our diff.

## Findings (attribution: pre-existing, not this session's)

### Dead code — safe quick-wins (auto-fixable via `fallow fix`)
| Target | Issue | Effort |
| --- | --- | --- |
| `apps/web/components/common/field.tsx` | 10 unused exports (100% dead) | low |
| `apps/web/lib/i18n.ts` | 3 unused exports (100% dead) | low |
| `apps/web/server/web/entitlement/manage-entitlements.ts` | 3 unused exports | low |
| `apps/web/app/api/og/route.tsx` | 3 unused exports | low |
| + 9 unused **type** exports (incl. `BblGalaxySelectedNode`, galaxy merge) | type surface | low |

### Unused dependencies (0 import sites in `apps/web`)
`d3`, `@paralleldrive/cuid2`, `tailwind-merge`, devDep `@react-email/preview-server`.
→ Verify `tailwind-merge` isn't re-exported via `packages/ui-kit` before dropping; the other three
are safe to remove from `apps/web/package.json`.

### Complexity — low priority
Real offenders are **one-off scripts** (`import-bbl-wp-media.ts` cognitive 49,
`setup-merch-stripe-products.ts`, `backfill-bbl-avatars.ts`) — run-once tooling, not hot paths.
The 115 app-code "findings" are mostly trivial cyclomatic-5 page components (noise).

### Duplication
179 clone groups, overwhelmingly inherited. Nothing the wave fanout newly duplicated stood out.

## Recommended order

Principle: **cheapest-and-safest first → feature lane → riskiest-irreversible last.** Shrink the
surface before bigger changes build on it; finish features on a clean base; run the prod migration
on a lean, stable tree.

### 1. Dead-code sweep — DO FIRST

- **Scope:** `fallow fix` the unused exports/types above + remove the 3–4 verified-unused deps.
- **Why first:** mechanical, high-confidence, docs-tier risk; *reduces surface* for everything
  after — notably removes dead exports from `common/field.tsx` **before** m-card slice 3 touches
  the shared component layer.
- **Risk:** low. **Effort:** low. **Gate:** typecheck + lint + format + touched tests + `next build`.
  No prod-behavior change → docs-tier deploy.
- **Deliverable:** one focused "dead-code sweep" PR.

### 2. m-card slice 3 — SECOND

- **Scope:** `task`/`loop` kinds + migrate remaining roster surfaces (`/me`, `/directory/[slug]`
  sidebars, wrap `lineage-node-card`) + deprecate `facet-result-card`/`bjj-passport-card`/
  `listing-card` as re-exports for one release.
- **Why second:** feature momentum, low risk, unblocked now (it was staged behind the prune),
  builds on a now-leaner base. Independent of the schema work.
- **Risk:** low–med. **Effort:** med. **Gate:** full proof gate (Vitest mappers + Playwright
  desktop/390px/dark-light/brand-swap). Pause-on-merge.
- **Note:** churns `components/**` — must not overlap with any concurrent component sweep.

### 3. Brand-prune Stage 2 (schema drop) — LAST, gated, own session

- **Scope:** drop the 43 `brand` columns + `enum Brand` + `User.brand`; remove the now-literal
  `brand: Brand.BBL` filters Stage 1 left; resolve the BASELINE comp-fixture; settle `BrandSettings`.
- **Why last:** highest risk (prod migration on a live DB), irreversible, needs Phase-0 decisions
  and a backup/rollback plan. Not a fanout — one careful session. Run it on a lean, stable tree
  after the above settle.
- **Risk:** HIGH. **Gate:** backup prod + rollback plan; migrate-only deploy; browser-verify theme +
  directory + lineage + claims; **explicit operator go before the migration push.**

#### Phase-0 decisions to settle before Stage 2 (from the prune plan)
1. Confirm prod is single-brand BBL only (no live non-BBL rows depend on `brand:` filters).
2. BASELINE comp-fixture test seed — keep (re-stamp BBL) or delete? (fold issue #8).
3. `BrandSettings` — collapse to one row/env or keep the table? (drives live theme — don't blind-drop).
4. `User.brand` — drop the column or keep nullable for audit? (no writer left after Stage 1).

## Out of scope / parking lot

- Script-complexity extractions (run-once tooling) — park unless a script is actively re-edited.
- The bulk of inherited dupes — revisit only if a clone group lands in a hot path.
