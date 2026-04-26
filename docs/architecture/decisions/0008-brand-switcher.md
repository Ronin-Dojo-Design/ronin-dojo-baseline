# ADR 0008 — Brand switcher: visible to admins + multi-brand members only

**Status:** Accepted
**Date:** 2026-04-25

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

Selecting a brand updates `session.user.activeBrandId` (Better-Auth session field), which the Prisma client extension then enforces on every authenticated query.

## Interaction with the host-derived `brand`

Two values, same name space, different roles ([ADR 0006](0006-multi-domain-hosting.md)):

- **Site `brand`** (from the host): `wekafusa.com` → `WEKAF`. Determines marketing chrome, theme, copy.
- **`activeBrandId`** (from session): which brand's *app data* the user currently operates in.

For a single-brand user, they're always equal — the switcher is invisible and `activeBrandId === brand`. For an admin browsing `ronindojodesign.com` with `activeBrandId = 'BBL'`, the chrome is Ronin Dojo Design but the queries scope to BBL.

## Consequences

**Positive**

- No confusion for students (the 99%): they don't know about other brands; they don't see a switcher.
- Admins and multi-brand instructors get the unified-DB benefit they signed up for.
- Auth / session changes are isolated to one field.

**Negative**

- Tests must cover the cross-context case (admin with `activeBrandId` ≠ host brand). Easy to forget.
- "Brand switching" UI must be obvious enough that multi-brand users find it but unobtrusive enough that single-brand users never notice.

## UX rules

- Switcher placement: top-right of the app shell (next to user menu), with the active brand's logo + name.
- On switch: full page navigation (not silent context flip) so server components re-render with the new `activeBrandId`. Avoids stale data from the old context.
- Persistence: stored on the `User` record as `lastActiveBrandId` so the choice survives sessions.
