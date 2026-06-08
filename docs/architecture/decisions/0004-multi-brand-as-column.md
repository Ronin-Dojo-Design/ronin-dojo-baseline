---
title: "ADR 0004 — Multi-brand encoded as brand column"
slug: adr-0004-multi-brand-as-column
type: decision
status: accepted
created: 2026-04-25
updated: 2026-06-06
last_agent: codex-session-0351
pairs_with:
  - docs/architecture/decisions/0006-multi-domain-hosting.md
  - docs/architecture/decisions/0008-brand-switcher.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0004 — Multi-brand encoded as `brand` column

**Status:** Accepted
**Date:** 2026-04-25

## Context

The legacy monorepo at [Ronin-Dojo-Design/ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) runs four brands (Ronin Dojo, TuffBuffs, Black Belt Legacy, WEKAF USA) as **four near-identical PHP plugins** plus four WordPress themes plus four Vite entry points. Same logic copy-pasted four times. Bug fixes happen in 1 of 4 places.

## Decision

Encode brand as a **`brand` column** on every brand-scoped Prisma model. One schema, one app, one deploy. Brands differ in theming and content, not in code paths or API surfaces.

```prisma
enum Brand {
  RONIN_DOJO_DESIGN       // umbrella / admin-facing
  BASELINE_MARTIAL_ARTS   // rebrand/rebuild of TuffBuffs
  BBL                     // Black Belt Legacy
  WEKAF                   // WEKAF USA
}

model School {
  id      String @id @default(cuid())
  brand   Brand
  // ...
  @@index([brand])
}
```

`TUFFBUFFS` is intentionally **not** in the new enum. Legacy TuffBuffs continues to run unchanged at `tuffbuffs.com` on the legacy WP stack — see [ADR 0005](0005-legacy-coexistence.md). Add `TUFFBUFFS` to the enum later only if/when those users migrate to the new platform.

Promote `Brand` from enum to a table when brand-level metadata (logo, primary color, custom domain, billing entity) becomes non-trivial.

## Consequences

### Positive

- One query path serves all brands; impossible to diverge.
- Cross-brand reporting / migration / analytics is trivial (one DB).
- Multi-tenant boundaries enforced declaratively via `lib/authz.ts` + a Prisma client extension that requires a `brandId` filter on authenticated queries.

### Negative

- Cross-brand data leakage is a critical bug class — must be hard-prevented (Prisma extension, integration tests with seed data per brand).
- If a brand demands radically different behavior, a column flag won't suffice; that's when the brand becomes a tenant table with feature flags.

## Authorization implications

Every API route handler must:

1. Resolve the user's session via Better-Auth.
1. Determine the user's `brand` (from their primary `Membership` or active brand context).
1. Pass that `brand` to Prisma queries either explicitly or via the client extension.
1. Reject cross-brand requests via `lib/authz.ts:isInSameBrand(user, target)`.

## Cookie scoping (for future)

If brands eventually live on subdomains (`tuffbuffs.ronindojo.com`, `bbl.ronindojo.com`), Better-Auth cookie scope must be `Domain=.ronindojo.com` from day one. Retrofitting cookie scope after launch invalidates sessions.
