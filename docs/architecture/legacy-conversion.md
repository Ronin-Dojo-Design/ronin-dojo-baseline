# Converting legacy frontend assets

The legacy monorepo at [Ronin-Dojo-Design/ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) (locally: `/Users/brianscott/dev/ronin-dojo-monorepo/`) has UI work worth keeping (TuffBuffs designs, BBL screens, partial WEKAF pages). Don't lift-and-shift wholesale — selective port.

## What to port, what to throw out

| Legacy artifact | Action | Notes |
|---|---|---|
| `src/components/` (36 dirs) | **Port selectively.** | Drop into `apps/web/components/`. Add `'use client'` directive on stateful ones. Replace `react-router` imports with `next/link` + `next/navigation`. |
| `src/hooks/` (38 hooks) | **Port UI hooks; rewrite data hooks.** | UI hooks (forms, modals, animations, theming) port directly. Data hooks (`useMembers`, `useProgress`, `useSchools`, etc.) call the dead REST API — rewrite around `packages/api-client/`. |
| `src/services/` (43 modules) | **Throw out.** | These wrap the legacy 281-route REST surface. Replaced by `packages/api-client/` typed wrappers. |
| `src/apps/DevModeWorkspace.jsx`, `FullDashboardApp.jsx`, etc. | **Reference only.** | Re-implement layouts in Next.js App Router. Don't port wrapper logic. |
| Brand themes (CSS, design tokens) | **Port directly.** | Tokens are framework-agnostic. Move to Tailwind config + CSS variables under `apps/web/styles/themes/<brand>.css`. |
| `wordpress/<brand>-theme/` (4 themes) | **Discard.** | No WP. |
| `tuffbuffs-main.jsx`, `bbl-main.jsx`, `wekaf-main.jsx` (Vite shims) | **Discard.** | One Next.js app; brand resolved via host middleware ([ADR 0006](decisions/0006-multi-domain-hosting.md)). |
| Pods JSON exports | **Field-level reference.** | Look at field names/types when authoring `prisma/schema.prisma`. Don't import verbatim. |

## Per-brand rollout order

Per the build-order in the approved plan:

1. **Ronin Dojo Design** — admin-facing umbrella; minimal UI; proves auth + brand-switching.
2. **BBL** — port BBL landing + app screens; build the migration script ([ADR 0007](decisions/0007-bbl-migration.md)) in parallel.
3. **Baseline Martial Arts** — port TuffBuffs UI minus brand-specific copy/colors; rebrand visually.
4. **WEKAF** — greenfield rework (no users, no migration constraint).

## Practical mechanics for porting a component

1. Copy the file from `legacy-monorepo/src/components/<name>` to `apps/web/components/<name>`.
2. If it uses state, hooks, browser APIs → add `'use client'` at the top.
3. Replace any of:
   - `import { useNavigate } from 'react-router-dom'` → `import { useRouter } from 'next/navigation'`
   - `<Link to="...">` from react-router → `<Link href="...">` from `next/link`
   - `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
   - Direct `fetch('/wp-json/...')` calls → typed methods on `apiClient.xxx()`
4. If it imports from `src/services/*`, that whole call chain dies — rewrite the data fetch as an `await` in a Server Component or `useQuery` (TanStack) in a client component, hitting `packages/api-client/`.
5. Verify in `bun dev` then commit per component.

## Keep the legacy repo around

Don't delete [Ronin-Dojo-Design/ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) (or its local clone at `/Users/brianscott/dev/ronin-dojo-monorepo/`) while you're porting from it. It's the source material. Once each brand has cut over and you're satisfied with parity, archive the GitHub repo (rename, mark archived) but keep it readable.
