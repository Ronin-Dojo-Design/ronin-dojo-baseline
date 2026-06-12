---
title: "SESSION 0365 — Phase 2a: unified /app shell + per-area permission gates (D5)"
slug: session-0365
type: session--implement
status: closed
created: 2026-06-12
updated: 2026-06-12
last_agent: claude-session-0365
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0364.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/product/black-belt-legacy/SOT-ADR.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0365 — Phase 2a: unified /app shell + per-area permission gates (D5)

## Date

2026-06-12

## Operator

Brian + claude-session-0365

## Goal

BBL-SOT-Spec **Phase 2a**: stand up the unified `/app` workspace (SOT-ADR D5) — port upstream's
`lib/auth-guard.ts` + `components/app/` shell + `app/app/` layout/overview from the captured
`dirstarter_template` @ `76c8e1e`, with the **operator-ratified per-area permission model
(grill option b)**: each area gated by `requirePermission("<entity>.manage")`, lineage areas by
permission-or-`LineageTreeAccess`-grant (D4 seam), sidebar nav rendered per `can()`. First wave
moves the BBL-critical areas (lineage, users, claims). Local execution on a short-lived branch +
PR + CI (cloud can't see the local template). Blanket 308 redirect waits for 2c.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0364.md` (Phase 1c closed; Phase 1 complete).
- Carryover: oRPC substrate + D4 seam + pilot read all on `main` (`94e119d`); migration template
  proven (thin pass-through + e2e-as-proof).

### Branch and worktree

- Branch: `session-0365-app-shell` (off `main` @ `fd2b14b`)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `fd2b14b`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Unified `/app` dashboard (D5), auth-guard layer, permission-gated nav |
| Extension or replacement | Extension: port upstream shell/guards; Ronin deltas = `requireLineageAccess()` (D4 grant-or-permission gate), per-area `<entity>.manage` strings |
| Why justified | SOT-ADR D5 (unified `/app` precedes identity re-root so surfaces move once); live-docs changelog re-verified this session |
| Risk if bypassed | Phase 3/4 surfaces (add-person, claim review) would land in `/admin` and move twice |

Live docs checked during planning: `dirstarter.com/changelog/unified-dashboard` (2026-06-12) —
confirms 308 redirects, `can()`-gated sidebar, admin-vs-user nav split. **Upstream GitHub HEAD
re-checked: still `76c8e1e`** — the pin is current; capture authoritative.

### Grill outcome (grill-with-docs, this chat)

- **Guard model = option (b), operator-ratified (operator leaned b; agent conceded on re-derivation):**
  per-area `requirePermission("<entity>.manage")` from day one. Rationale: no real users (operator +
  beta-testing parents only; Baseline prod is a phone-proxy, breakage acceptable); permission strings
  are defined once and reused by entity routers in Phases 4–5; the NODE_EDITOR shell-looseness fix
  falls out structurally (today `hasLineageAdminAccess` admits any grantee to the whole `/admin`
  shell; under (b) grantees reach only lineage areas).
- **Deliberate tightening accepted:** `tournament_director` goes from see-everything to
  tournaments + user-level items; lineage grantees to lineage areas + user-level items.
- **Waves:** 2a shell + BBL-critical areas → 2b remaining areas → 2c blanket 308 + delete old
  shells + `server/<entity>` flatten. Old `/admin` keeps working untouched until 2c.
- **Local execution** (operator call; template is local-only), short-lived branch + PR + CI.

### Phase-2 upstream capture (pays the spec's [pin in capture] debt)

- `app/app/`: **70 files** — `layout.tsx` (`requireUser()` + `Shell` + `AIProvider`), `page.tsx`
  (dashboard overview + stats/metrics `_components`), areas: categories, reports, ads, tools,
  posts, api-keys, tags, bookmarks, users.
- `lib/auth-guard.ts`: `requireUser()` / `requirePermission(permission)` (small).
- `components/app/`: **17 files** — shell, sidebar, nav, chart, metrics/, tiptap/, ai/, dialogs/.
- Redirects: `next.config.ts` `redirects()` — `/admin/:path*` + `/dashboard/:path*` → `/app/:path*`
  `permanent: true` (308).
- Ronin current state: `app/admin` = 38 areas (layout gate: `admin` | `tournament_director` |
  `hasLineageAdminAccess`); `app/(web)/dashboard` = 6 member-facing pages.

## Petey plan

### Goal

`/app` renders permission-gated with the upstream shell; lineage/users/claims areas reachable at
`/app/*` with (b)-model gates; old routes untouched; gates green; browser-proof on bbl.local.

### Tasks

#### SESSION_0365_TASK_01 — Guards + permission registry

- **Agent:** Cody (inline)
- **What:** Port `lib/auth-guard.ts` (`requireUser`/`requirePermission`); add `requireLineageAccess()`
  (permission OR active `LineageTreeAccess` grant, via the D4 seam); register the per-area
  `<entity>.manage` permission strings in `server/orpc/roles.ts`.
- **Done means:** guards typecheck + pure tests; strings registered.
- **Depends on:** nothing

#### SESSION_0365_TASK_02 — Shell port + /app layout + overview

- **Agent:** Cody (inline)
- **What:** Port `components/app/` shell/sidebar/nav (nav sections rendered per `can()` + lineage
  grant-existence; AI bits stubbed/omitted — not a Ronin lane yet), `app/app/layout.tsx`,
  `app/app/page.tsx` overview (metrics adapted or minimal placeholder).
- **Done means:** `/app` renders for admin; non-admin sees scoped nav; gates green.
- **Depends on:** TASK_01

#### SESSION_0365_TASK_03 — First wave: lineage, users, claims areas

- **Agent:** Cody (inline)
- **What:** Move `/admin/lineage*`, `/admin/users*`, `/admin/claims*` page trees under `app/app/*`
  with (b) gates (`lineage` via `requireLineageAccess`); originals left in place until 2c; e2e specs
  touching these routes updated.
- **Done means:** moved areas function at `/app/*`; e2e green; browser-proof.
- **Depends on:** TASK_02

#### SESSION_0365_TASK_04 — PR + CI + browser proof

- **Agent:** Doug (inline)
- **What:** PR off `session-0365-app-shell`; CI green; bbl.local walk: `/app` as admin, gate
  behavior for non-admin.
- **Done means:** merged; evidence recorded here.
- **Depends on:** TASK_03

### Open decisions

None — grill resolved (b), waves, local. (2b/2c scope staged for next sessions.)

### Risks

- Shell port size (17 components) — mitigated by stubbing AI/tiptap extras not yet used.
- e2e admin specs reference `/admin` routes — first wave updates only the specs whose areas moved;
  the rest stay valid until their wave.

### Scope guard

- NO blanket redirect this session (2c). Old `/admin` + `/dashboard` untouched and functional.
- No `server/<entity>` flattening (2c). No entity-router migrations (Phases 4–5 own that pattern).
- No schema changes. No Better-Auth plugin work (separate queued item).

### Dirstarter implementation template

- **Docs read first:** `dirstarter.com/changelog/unified-dashboard` (live, 2026-06-12); captured
  template `app/app/*`, `lib/auth-guard.ts`, `components/app/*`, `next.config.ts` redirects.
- **Baseline pattern to extend:** upstream unified `/app` shell + guards.
- **Custom delta:** `requireLineageAccess()` (D4), per-area `.manage` strings, AI stubs, Ronin nav map.
- **No-bypass proof:** guards/shell ported line-faithful; deltas documented here + in code comments.

## Cody pre-flight

### Pre-flight: Phase 2a port

1. **Existing component scan:** `components/admin/shell.tsx` + `components/admin/nav.tsx` exist
   (current admin shell — reference for Ronin nav contents); no `components/app/`, `lib/auth-guard.ts`,
   or `app/app/` in apps/web.
2. **L1 template scan:** capture inventory above (this session, direct file reads).
3. **Composition decision:** port upstream shell; reuse Ronin nav item definitions where the admin
   nav already enumerates areas.
4. **Lane docs loaded:** BBL-SOT-Spec Phase 2, SOT-ADR D4/D5, SESSION_0364 next block, changelog.
5. **Dev environment:** `cd apps/web && npx next dev --turbo`; bbl.local:3000.
6. **FAILED_STEPS check:** FS-0002 acknowledged; no installs planned (stop dev server first if any).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0365_TASK_01 | landed | `lib/auth-guard.ts` (requireUser/requirePermission + `requireLineageAccess`/`hasAnyLineageGrant` — TREE_ADMIN-grant parity with the legacy gate, corrected mid-build from any-grant); `APP_AREA_PERMISSIONS` registry (31 area strings) in `roles.ts`. |
| SESSION_0365_TASK_02 | landed | `components/app/{nav,sidebar,shell}` ported (sidebar `can()`-gated + lineage grant-visibility; Kbd API adapted; AIProvider omitted); `app/app/{layout,page}` (overview reuses admin metric components behind `metrics.read`). |
| SESSION_0365_TASK_03 | landed | 9 pages copied to `app/app/{lineage,users,claims}` — HOCs removed (area layouts gate), routes + shared-component hrefs swept to `/app/<area>`; `_components` shared at admin paths until 2c. Greedy-sed import damage (server/admin + app/admin specifiers) caught by typecheck and reverted. |
| SESSION_0365_TASK_04 | landed | PR #63 → all checks green (incl. Playwright ×3 proving old `/admin` intact) → squash-merged `7ee27ce`. Authenticated browser walk via dev-login: `/app` dashboard + sidebar, `/app/lineage` (5 trees, Review-claims href → `/app/lineage/claims`), `/app/users` table — all render in the new shell; anon routes 307 → login. Console errors triaged pre-existing (Resend send-only key, Plausible key, pg deprecation). |

## What landed

- **Unified `/app` workspace live (Phase 2a)** — upstream shell + guards ported from `76c8e1e`,
  per-area permission model (grill option b) in force, first wave (lineage/users/claims) moved.
  Both shells coexist; old `/admin`/`/dashboard` untouched until 2c.
- See Task log for the full breakdown; PR #63 body carries the same evidence.

## Decisions resolved

- **Option (b) per-area gates** (grill, operator-ratified) — recorded in BBL-SOT-Spec Phase 2.
- **Lineage gate = TREE_ADMIN-grant parity** (not any-grant): legacy `hasLineageAdminAccess`/
  `withLineageAdminPage` admit TREE_ADMIN only; broaden only alongside the Phase-4/6 scoped surfaces.
- **`_components` stay shared at admin paths until 2c** — zero duplication; 2c moves them with the
  old-shell deletion.
- **Href sweep is one-way forward** — shared components now link `/app/<area>`; old pages inherit
  the new links (both routes live until 2c).
- **AIProvider omitted** from the `/app` layout (upstream AI dashboard isn't a Ronin lane).

## Files touched

26 files via PR #63 (squash `7ee27ce`): `lib/auth-guard.ts`, `components/app/{nav,sidebar,shell}.tsx`,
`app/app/{layout,page}.tsx` + 9 moved pages + 3 area layouts, `server/orpc/roles.ts`
(`APP_AREA_PERMISSIONS`), 10 shared `_components` href-swept, `BBL-SOT-Spec.md` Phase-2 capture +
(b)-model, this session file.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | EXIT 0 (after sed-damage revert; typecheck caught both rounds) |
| `bun run lint:check` / `format:check` | EXIT 0 / 1262 files clean |
| `bun test server/orpc/` | 36 pass / 0 fail |
| PR #63 CI | typecheck/oxc/unit/Playwright ×3/Vercel preview — all green |
| Anon smoke | `/app{,/lineage,/users,/claims,/users/new}` → 307 `/auth/login` |
| Authenticated walk (dev-login) | `/app` overview + metrics; `/app/lineage` 5 trees + swept hrefs; `/app/users` table — all in new shell |

## Open decisions / blockers

- **2b**: remaining ~35 admin areas + 6 member `(web)/dashboard` pages, in waves (wave-1 transform
  is the template; watch for the greedy-sed classes — anchor patterns or sweep hrefs only).
- **2c**: blanket 308 redirect (`next.config.ts`), delete old shells, `server/<entity>` flatten,
  e2e route swaps (/admin → /app).
- Standing: Better-Auth plugins (local), Resend-test-bounce chip, stripe@22 rehearsal.

## Next session

### Goal

Phase 2b: move the remaining admin areas + member dashboard pages under `/app` in waves using the
wave-1 transform (copy pages → strip HOC → area layout with `APP_AREA_PERMISSIONS` gate → href
sweep anchored to avoid import specifiers), keeping old routes intact until 2c.

### First task

Pick the next wave (suggest: tournaments + memberships + organizations — exercises the
tournament_director gate) and apply the wave-1 transform; gates + anon smoke per wave. Unblocked.

## Review log

### SESSION_0365_REVIEW_01 — Phase 2a (local, PR #63)

- **Reviewed tasks:** TASK_01–04
- **Dirstarter docs check:** live changelog (unified-dashboard) fetched this session; upstream
  GitHub HEAD re-verified = `76c8e1e` (pin current).
- **Verdict:** Shell + guards line-faithful with documented deltas; the (b) permission model is in
  force with the lineage-gate parity correction caught DURING build (legacy gate is TREE_ADMIN-only,
  not any-grant — read-the-code beat my own earlier summary). Both greedy-sed incidents were caught
  by typecheck before commit. Full proof chain: CI green incl. old-route Playwright + authenticated
  new-shell walk.
- **Score:** 8.5/10 (sed sloppiness cost two fix rounds; everything else clean)
- **Follow-up:** 2b waves, 2c cutover of routes.

## Hostile close review

- **Giddy:** pass — additive routes; old surfaces untouched; gates tightened never loosened; no
  schema/payload changes.
- **Doug:** pass — anon + authenticated walks both proven; old-route e2e green in CI; per-area gate
  behavior for non-admin roles not yet browser-proven (no such test user locally) — falls out in 2b
  when tournament areas move.
- **Desi:** pass (shell is the upstream design; Ronin nav icons consistent with admin sidebar).
- **Kaizen aggregate:** 8.5/10.

## Hostile close review

<!-- Filled at bow-out. -->

## ADR / ubiquitous-language check

- ADR update not required — implements SOT-ADR D5 with the (b) guard model recorded in
  BBL-SOT-Spec Phase 2 (operator-ratified in-chat grill; reversible string registry, below ADR bar).
- Ubiquitous language unchanged.

## Reflections

- **Unanchored seds on route strings WILL eat import specifiers** (`/admin/users` lives inside
  `~/server/admin/users/...` and `~/app/admin/users/...`). Two fix rounds. Next wave: sweep only
  string literals in href/redirect positions, or anchor patterns (`"(/admin/` etc.), and let
  typecheck arbitrate immediately after.
- **The grill flipped the right way.** Operator context (no users, flip-focused) reversed my (a)
  recommendation honestly — and option (b) turned out to also be the structural fix for the
  shell-looseness. Constraints first, recommendation second.
- **Read-the-code corrected the grill itself:** my Q1 framing said any-grantee saw the whole shell;
  the code says TREE_ADMIN-only. The fix landed before the gate shipped, but it's a reminder that
  even the grill's premises need source verification.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Session doc current; BBL-SOT-Spec already stamped this session. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0365 row added at close. |
| Wiki lint | Result in close chat. |
| Kaizen reflection | 3 entries. |
| Hostile close review | REVIEW_01 above; Giddy/Doug/Desi pass. |
| Review & Recommend | 2b staged with first task. |
| Memory sweep | No new standing fact (sed lesson lives in Reflections; program memory current). |
| Next session unblock check | Unblocked. |
| Git hygiene | PR #63 → squash `7ee27ce`; close docs commit on main at bow-out. |
| Graphify update | Before close commit — count in chat. |
