---
title: "ADR 0008 — Brand switcher: visible to admins + multi-brand members only"
slug: adr-0008-brand-switcher
type: decision
status: superseded
created: 2026-04-25
updated: 2026-07-19
last_agent: claude-session-0575
pairs_with:
  - docs/architecture/decisions/0004-multi-brand-as-column.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
  - docs/knowledge/wiki/manual-boundary-registry.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0008 — Brand switcher: visible to admins + multi-brand members only

## Status

**Superseded by [ADR 0034](0034-monorepo-platform-and-per-product-deploys.md) (SESSION_0575).**
The single-brand collapse killed the premise: multi-*brand* (one app, a `Brand`-enum switcher over
shared data) is dead; multi-*product* (separate apps in one monorepo, each on its own DB/deploy) is
the model. No user can span brands inside one app anymore, so the switcher, `activeBrandId`
persistence, and the MB-003 smoke proof can never land — MB-003 and WL-P2-9 close as superseded
with this ADR. The text below is retained as historical context.

~~Accepted~~

## Date

2026-04-25

## Context

The legacy TuffBuffs stack had a brand switcher in the UI. Carrying that forward to the new stack is straightforward now that all brands share a Postgres DB. Question: who should see it?

## Decision

Show the brand switcher **only to users whose memberships span more than one brand, plus platform admins**. Single-brand members see no switcher; their brand is auto-set from their sole `Membership.brand`.

## Mechanics

```ts
// apps/web/components/brand-switcher.tsx (sketch)
const userBrands = await db.membership.findMany({
  where: { userId: session.user.id },
  select: { brand: true },
  distinct: ['brand'],
});

const isAdmin = authz.isAdmin(session);
const showSwitcher = isAdmin || userBrands.length > 1;
```

Selecting a brand updates the user's active app-data brand. The current schema field is `User.lastActiveBrandId`; the full UI/session persistence and smoke proof remain open in `MB-003`.

## Interaction with the host-derived `brand`

Two values, same name space, different roles ([ADR 0006](0006-multi-domain-hosting.md)):

- **Site `brand`** (from the host): `wekafusa.com` → `WEKAF`. Determines marketing chrome, theme, copy.
- **`activeBrandId`** (from session): which brand's *app data* the user currently operates in.

For a single-brand user, they're always equal — the switcher is invisible and `activeBrandId === brand`. For an admin browsing `ronindojodesign.com` with `activeBrandId = 'BBL'`, the chrome is Ronin Dojo Design but the queries scope to BBL.

## Consequences

### Positive

- No confusion for students (the 99%): they don't know about other brands; they don't see a switcher.
- Admins and multi-brand instructors get the unified-DB benefit they signed up for.
- Auth / session changes are isolated to one field.

### Negative

- Tests must cover the cross-context case (admin with `activeBrandId` ≠ host brand). Easy to forget.
- "Brand switching" UI must be obvious enough that multi-brand users find it but unobtrusive enough that single-brand users never notice.

## UX rules

- Switcher placement: top-right of the app shell (next to user menu), with the active brand's logo + name.
- On switch: full page navigation (not silent context flip) so server components re-render with the new `activeBrandId`. Avoids stale data from the old context.
- Persistence: stored on the `User` record as `lastActiveBrandId` so the choice survives sessions.

## Current implementation note

As of SESSION_0351, brand chrome resolution is implemented separately by ADR 0022 (`host -> Brand` for public chrome). The active-brand switcher described here is still a runtime proof item, not a completed UI flow. Do not infer from ADR 0022 that admin app-data switching is complete.
