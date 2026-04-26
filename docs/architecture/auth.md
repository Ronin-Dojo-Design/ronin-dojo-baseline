# Auth

## Stack

**Better-Auth** (shipped in Dirstarter at `apps/web/lib/auth.ts` + `apps/web/app/api/auth/[...all]/route.ts`).

## Web flow

1. User signs up / signs in via Dirstarter's auth pages.
2. Better-Auth issues a session cookie (HTTP-only, SameSite=Lax).
3. Server components and route handlers call `auth.getSession()` to authenticate.
4. Authorization checks live in `apps/web/lib/authz.ts` — pure functions like `canEditSchool(user, school)`, `isInSameBrand(user, target)`, `isAdmin(user)`. Every API route imports one.

## Mobile flow

Two viable approaches (decide once Better-Auth's mobile SDK maturity is verified):

**A. Better-Auth mobile SDK (preferred if mature)**
Expo app uses the Better-Auth client; same session contract as web; native cookie/storage handling.

**B. JWT bridge (fallback)**
Web `app/api/v1/mobile-token` mints a short-lived JWT signed with the same secret. Mobile stores the JWT in `expo-secure-store`; refreshes on 401.

## Roles

- `admin` — set as a Better-Auth role claim on the User. Validated by `authz.isAdmin(session)`.
- App roles (`STUDENT`, `INSTRUCTOR`, `OWNER`, `COACH`) live on `Membership`, not on User. A user can be an instructor at school A and a student at school B.

## Brand context: two values, one name

Two distinct concepts (see [ADR 0006](decisions/0006-multi-domain-hosting.md) and [ADR 0008](decisions/0008-brand-switcher.md)):

- **`brand` (host-derived)** — set by middleware from `request.headers.host`. Determines marketing chrome / theme / copy. Same for everyone visiting that domain.
- **`session.user.activeBrandId`** — which brand's *app data* this user is currently working in. Defaults to their sole `Membership.brand`; multi-brand users can switch via the brand switcher.

Single-brand users: `activeBrandId === brand` always.

Multi-brand users (instructors, admins): can diverge. An admin browsing `wekafusa.com` (host brand = WEKAF) while authenticated with `activeBrandId = 'BBL'` sees the WEKAF marketing chrome but their queries scope to BBL.

## Cross-brand isolation

Belt-and-suspenders strategy:

1. **Application layer:** every authenticated query passes through `authz` helpers that check `isInSameBrand(user, target)` against `session.user.activeBrandId`.
2. **Data layer (defense in depth):** a Prisma client extension at `apps/web/lib/db.ts` requires brand-scoped models include a `where: { brand: session.user.activeBrandId }` clause. Throws in dev if missing; logs + alerts in prod.

## Brand switcher

Visible only when `userBrands.length > 1 || authz.isAdmin(session)`. Selecting a brand:
1. Updates `session.user.activeBrandId` server-side.
2. Persists `lastActiveBrandId` on the `User` row so the choice survives sessions.
3. Triggers full page navigation so server components re-render with the new context (avoids stale RSC data).

## Cookie scoping (forward-looking)

If brands later live on subdomains (`bbl.ronindojo.com`, etc.), set `cookieDomain: '.ronindojo.com'` on Better-Auth from day one. Retrofitting after launch invalidates all sessions.

## Admin lockdown

There's no `wp-admin` to lock down — that whole concept goes away. Admin pages live at `apps/web/app/admin/*` and are protected by middleware that calls `authz.isAdmin(session)`. Non-admins get a 404 (not a redirect — don't reveal the route exists).
