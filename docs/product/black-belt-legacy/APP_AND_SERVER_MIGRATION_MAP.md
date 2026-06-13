---
title: "App + Server Migration Map — unified /app waves & server/<entity> flatten"
slug: app-and-server-migration-map
type: spec
status: active
created: 2026-06-12
updated: 2026-06-13
last_agent: codex-session-0376
author: Brian + Petey
pairs_with:
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - dirstarter-uplift
  - app-migration
  - server-flatten
---

# App + Server Migration Map

The execution map for finishing **SOT-ADR D5** — the full unified `/app/*` workspace — and the
deferred **`server/<entity>` flatten**. Scope decision (SESSION_0374 grill): **Option A — migrate
every admin area to `/app` regardless of the D9 brand gate** (the gate is a *public-route 404*
concern only; it does not scope the admin surface). This doc lets any later session pick a wave and
execute with zero re-discovery.

## 1. Uniform per-area `/app` migration recipe (proven SESSION_0374)

Every legacy `/admin/<area>` uses the `components/admin/auth-hoc` `withAdminPage` wrapper (admin-role
→ 404). The `/app` shell uses a per-area `layout.tsx` permission gate. Migrating one area:

1. `git mv app/admin/<area> app/app/<area>` (history-preserving; moves page(s) + `_components`).
2. Rewrite internal component imports `~/app/admin/<area>/` → `~/app/app/<area>/` **(scope the sed to
   the moved dir ONLY — `s|/admin/<area>|/app/<area>|` also matches `server/admin/<area>` import
   paths and will corrupt them; SESSION_0374 hit and reverted exactly this).**
3. Add `app/app/<area>/layout.tsx`:
   ```tsx
   import { requirePermission } from "~/lib/auth-guard"
   import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
   export default async function ({ children }: LayoutProps<"/app/<area>">) {
     await requirePermission(APP_AREA_PERMISSIONS.<area>)
     return children
   }
   ```
4. Unwrap `withAdminPage(...)` in each page → plain `export default async ({ ... }: PageProps<"/app/<area>...">) => {}`; drop the `auth-hoc` import. The layout now gates.
5. Ensure `APP_AREA_PERMISSIONS.<area>` exists in `server/orpc/roles.ts` (most do; `posts` was added SESSION_0374). `admin: ["*"]` covers it.
6. Add `{ source: "/admin/<area>", destination: "/app/<area>" }` + `:path*` to `config/app-redirects.ts` `MIGRATED_ADMIN_APP_ROUTES`; mirror into `config/app-redirects.test.ts` `toEqual`.
7. Fix in-page nav (`<Link href>`, `router.push`) AND `server/admin/<area>/actions.ts`
   `revalidatePath(["/admin/<area>"])` → `/app/<area>` **(scope the sed; do not touch the
   `~/server/admin/<area>` import paths — server modules stay until the flatten).**
8. Add the sidebar entry (`components/app/sidebar.tsx`) — permission-gated, matching the Users/Claims convention.
9. **Leave** `components/admin/{sidebar,command-palette}.tsx` pointing at `/admin/<area>` — they redirect, and the legacy shell is deleted wholesale in 2c.
10. Verify: `bun run typecheck`, `bun test config/app-redirects.test.ts`, browser-proof `/admin/<area>`→`/app/<area>` + the `/app/<area>` render on `bbl.local`.

## 2. Remaining `/app` waves (23 areas after SESSION_0374 wave 1)

Wave 1 (SESSION_0374, landed): **certificates, posts, content, media.**
Wave 2 (SESSION_0376, landed): **roles, entitlements, invites, leads.**

Order the rest by value to `bbl.local` functionality + coupling to Phase 3/4. BBL-enabled (E) areas
first; BBL-404 (G) areas migrate for unified-shell completeness but aren't launch-gating.

| Wave | Areas | Why this order |
| --- | --- | --- |
| **2** | roles (E), entitlements (E), invites (E), leads (E) | ✅ Landed SESSION_0376 — claim/RBAC + funnel surfaces moved to `/app` with guards, redirects, sidebar, and `revalidatePath` repoints. |
| **3** | email (E), brand-settings (E), privacy (E), reports | Next safe wave — operator ops + GDPR/infra the operator drives day-to-day. |
| **4** | programs, courses, age-groups, skill-levels, schedule (all G) | School-ops cluster — share `server/admin/programs` query surface; batch together. |
| **5** | merch, categories, tags, pricing-plans, subscription-tiers, subscriptions, billing (G) | Commerce/listings cluster. |
| **6** | tools (G), storage, repo-docs | Dirstarter-core + infra/dev; lowest user value. |
| **7** | Review checkpoint (no migration) | Desi UI/UX consistency review of the migrated `/app` surface + a `/code-review` pass on the cumulative diff; write findings to the SESSION file for follow-up. |

> **Autonomous-run boundary (SESSION_0374):** waves 2–7 are mechanical/review and safe for the
> unattended `auto-session-automerge.sh` driver (Opus, auto-merge, phone-pinged). The driver's
> `apps/web/prisma/` brake + the prompt's autonomous scope guard **stop the loop before** the
> `server/<entity>` flatten and the Phase 3 identity re-root — both need a human grill + browser
> proof and must NOT auto-deploy to the shared prod DB. Resume those interactively.

After all areas land: **2c** = delete the legacy `/admin` shell (`app/admin/layout.tsx`,
`components/admin/*` nav, `withAdminPage`), add the blanket `/admin/:path*` → `/app/:path*` safety
redirect, close drift **D-024**.

## 3. `server/<entity>` flatten map (deferred — own session)

Per SOT-ADR D5 + BBL-SOT-Spec §3, upstream `76c8e1e` deletes `server/web/*` + `server/admin/*` in
favor of flat `server/<entity>/*`. Today: **`server/web` = 211 files, `server/admin` = 115 files**,
imported from **593 files**.

**Decision (SESSION_0374): do NOT execute alongside route work or design work** — it is a ~900-file
mechanical change, and flattening the *identity* server modules before the Phase 3 re-root rewrites
them is wasted motion. Sequence it as its **own session**, ideally **fused with / immediately after
the Phase 3 identity re-root** (which already rewrites `server/admin/users`, `server/web/lead`,
`server/web/lineage/node-profile-actions`, `lib/auth`).

**Codemod recipe (node/TS, shown-before-run per the no-surprise-script rule):**

1. Build the move map: `server/web/<entity>/*` and `server/admin/<entity>/*` → `server/<entity>/*`.
   Resolve collisions where the same entity exists under both `web` and `admin` (merge dirs; rename
   on clash, e.g. `queries.ts` vs `queries.ts` → keep both as `public-queries.ts`/`admin-queries.ts`
   only if they truly differ — most don't overlap).
2. `git mv` each module to its flat home (preserve history).
3. Rewrite imports repo-wide: `~/server/(web|admin)/<entity>/` → `~/server/<entity>/` across the
   593 importers via a scoped codemod (ts-morph or a reviewed `sed` over a generated file list) —
   **review the file list before running; this is the step that bites.**
4. Reconcile barrel/index re-exports and any `server/router.ts` wiring.
5. Gate: `bun run typecheck` + full `bun test` + `bun run lint:check` + browser smoke.

**Risk:** highest-blast-radius change in the program. Do it on a clean tree, single session, no other
lane in flight. Pin upstream parity (`.dirstarter-upstream`) only after it lands.

## 4. Cross-references

- [BBL-SOT-Spec Phase 2](BBL-SOT-Spec.md) — the wave model this executes.
- [SOT-ADR D5](SOT-ADR.md) — unified `/app` + flatten decision.
- [PHASE3_USER_CARRY_PREFLIGHT](PHASE3_USER_CARRY_PREFLIGHT.md) — the identity re-root the flatten should fuse with.

**Honor the Lineage. Build the Future. OSSS.**
