---
title: "Component Launch Sweep — the per-component recipe"
slug: component-launch-sweep-recipe
type: runbook
status: active
created: 2026-06-17
updated: 2026-06-18
last_agent: claude-lineage-tree-canvas-sweep
pairs_with:
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Component Launch Sweep — the per-component recipe

> **One-line:** the repeatable playbook a session (human *or* parallel cloud agent) runs on **one
> component / page** to make it launch-ready: decompose → brand-token sweep → lazy-load → wire
> on-the-wire data → verify. Worked example: the **lineage profile drawer** (SESSION_0410).
>
> **Why it exists:** the BBL launch finish is a wide, shallow sweep across many components. To run it
> in parallel cloud sessions without drift, every session follows the *same* recipe. This doc is that
> recipe. Established by the SESSION_0410 grill (drawer redesign) as the reference pattern.

## Hard boundary (read first)

**The fleet does presentation, brand-tokens, lazy-loading, and wiring of data that is ALREADY on the
wire. It runs ZERO schema migrations.** Any new field, new payload column, media/gallery import, or
prod data backfill is **out of scope for a sweep session** and routes to the **single supervised
new-data lane**. This keeps N parallel agents from each running prod migrations.

- ✅ In scope: file decomposition, CSS-var/token swaps, `next/dynamic`, rendering an existing field,
  null-safe fallbacks, design-system primitive adoption, fallow/typecheck/DOM verification.
- ⛔ Out of scope (→ supervised lane): `prisma migrate`, new Prisma fields, new payload selects that
  require schema, importing/backfilling data, `migrate deploy` to prod.

## The recipe (run in order, per component)

### 1. Decompose → colocated folder module

A non-trivial component (≳300 lines, or multi-section/stateful) becomes a **folder**, not a file:

```
<component>/
  index.tsx            ← public orchestrator. Thin: compose + lazy-load. The ONLY export.
  <section>.tsx        ← one component per file (header, each tab/panel, badges…)
  use-<thing>.ts       ← derivation + state hooks (logic OUT of JSX)
  <component>-types.ts ← shared types
  *.test.tsx           ← colocated tests
```

Rules: **one component per file · single responsibility · logic in hooks · the orchestrator only
wires and lazy-loads · the barrel (`index.tsx`) is the module boundary** (sub-parts are private to the
folder; consumers import only the public component). This is the structural discipline that prevents
the 2179-line monolith (the legacy `LineageProfileDrawer.jsx` violated every rule above).

### 2. Brand-token sweep → zero hardcoded values

Four token classes, each with a source of truth. **No hardcoded hex / font-family / px / logo URL.**

| Token class | Use | Never |
| --- | --- | --- |
| **Color** | `--primary` / `--accent` (from `BrandSettings` DB → CSS vars); belt color = `Rank.colorHex` **data** (via `BeltSwatch`) | hardcoded hex, hardcoded belt palettes (ADR 0022) |
| **Type** | `--font-bbl-heading` (Poppins-evoking) / `--font-bbl-body`; generic `--font-sans` / `--font-display` | hardcoded `font-family` |
| **Logo / image** | `BrandSettings.logoUrl` (brand) · `Organization.logoUrl` (school) — null-safe fallback to a styled name | hardcoded asset paths |
| **Spacing / radius** | design-system primitive size props (`Stack`/`Card`/`Badge size=…`) | raw Tailwind magic numbers where a primitive exists |

The BBL font seam already exists (the lineage explorer, landing, and join pages inherit
`--font-bbl-heading`); a swept component should inherit it too rather than render generic fonts.

### 3. Lazy-load heavy / below-fold sub-modules

In the orchestrator, `next/dynamic` the parts not visible on first paint (secondary tabs, media
panels). **Eager** = whatever renders the instant the component mounts (header + default tab). The
folder module (step 1) is the prerequisite — you can only lazy-split a module that *is* a module.

### 4. Wire on-the-wire data (only)

Render fields the payload already carries. If a field would need a schema/payload change, **stop and
route it to the supervised lane** — do not migrate.

### 5. Verify

- `npx tsc --noEmit` → 0 errors.
- `npx fallow audit` → **no new findings**. Decomposition relocates functions to new file paths, so the
  audit's path-based diff flags moved code as "introduced" — read `introduced: 0` in the JSON + a held
  maintainability number, **not** the raw above-threshold count.
- **Live-DOM check** (Playwright/Chrome MCP) → the component renders + interacts; screenshot. Prove it on
  the live DOM (SESSION_0337). **Restart the dev server first** (the stale-Prisma-client gotcha above).

#### 5a. Bringing up a DB to verify against

The live-DOM step needs Postgres + a seed. Locally that is Postgres.app; in a **Docker-capable**
environment (e.g. a fresh cloud session), use the repo-root `docker-compose.yml`:

```bash
docker compose up -d postgres        # Postgres 16 on :5432, db ronindojo_dev (see docs/runbooks/database/database.md)
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/ronindojo_dev?schema=public'
cd apps/web
bun run db:migrate deploy            # apply ALL migrations (incl. currentResidence + logoUrl)
bun run db:seed                      # base data + rank systems
SKIP_ENV_VALIDATION=1 bun prisma/seed-baseline-lineage.ts   # the lineage TREE + members — REQUIRED for any lineage surface
RESEND_API_KEY= npx next dev --turbo # RESEND empty = no live emails (BBL sender-rep guard)
docker compose down -v               # when done — stops AND wipes the volume
```

The Docker DB user/pass is `postgres`/`postgres` (not the host Postgres.app `brianscott`/none). MinIO (S3
on :9000) is in the same compose — only needed when verifying media/uploads. **Caveat:** the
`docker-compose.yml` was abandoned locally at the Postgres.app pivot ([database.md](database/database.md)),
so it is **not recently tested** — the first sweep to use it is re-validating it; report any breakage so
it gets fixed here.

#### 5b. Fallback when no DB is reachable

If the environment cannot run Docker/Postgres, do **not** fake live-DOM evidence. Substitute: `npx next
build` compiles (SSR + type check) plus the tsc/fallow gates above, and state **"live-DOM deferred to PR
review"** in the report. The reviewer runs the live-DOM pass when the PR lands.

#### 5c. If the sweep writes or touches tests

Follow [`docs/runbooks/sops/sop-test-writing.md`](sops/sop-test-writing.md): `bun:test`, **real Postgres**
(never mock Prisma), the §3 mock seams (`next/headers` / `next/cache` / `~/lib/auth`), and colocated,
timestamp-tagged fixtures with two-phase teardown. A presentation sweep rarely needs new tests — if you
can't name what a test proves, it proves nothing.

## Worked example — the lineage profile drawer (SESSION_0410)

- **Scope:** exactly three tabs (Info / Lineage / Rank History) — re-housed + brand-tokenized, no new
  sections. The rich extras (belt-journey carousel, achievements, media galleries) live on the
  **profile page** (`/me` + public profile), not the drawer (decided earlier; the drawer is the
  focused lineage lens, the profile page is the rich credential/identity experience).
- **Decompose:** `lineage-profile-drawer/` folder module; orchestrator + `drawer-header.tsx` +
  `{info,lineage,rank-history}-tab.tsx` + `use-drawer-profile.ts` + types.
- **Brand-tokens:** header inherits `--font-bbl-heading` (Poppins type-token, "A"); belt bar is the
  data-driven `BeltSwatch` (`colorHex`); school badge renders `Organization.logoUrl ?? name`.
- **New-data deferred:** `Organization.logoUrl` column added locally; prod `migrate deploy` + logo
  backfill + media galleries + the image-hero Poppins overlay ("B") → supervised lane.
- **Lazy:** Lineage + Rank-History panels `next/dynamic`; header + Info eager.

## Gotchas surfaced by the worked example (fold new ones in here)

Running the recipe on a real component surfaces reusable traps. Each parallel session adds what it hits.

- **Portaled components escape the brand-font wrapper.** `Drawer` / `Dialog` / `Popover` render into
  `document.body`, *outside* the page wrapper that applies the brand font `.variable` class (e.g. the
  lineage explorer wraps its island in `cx(bblHeadingFont.variable, bblBodyFont.variable)`). So a portaled
  component renders **system fonts**, and the brand-font CSS var is undefined inside it. **Fix:** thread the
  brand font class from the brand-aware *consumer* down to the portal content root (e.g. a `contentClassName`
  prop on the drawer applied to `DrawerContent`) — never hardcode the brand font inside the shared component
  (that re-couples it to one brand, violating step 2). The consumer that knows the brand passes the tokens.
- **A folder module and a same-named single file can't coexist.** `foo.tsx` and `foo/index.tsx` both resolve
  to `~/.../foo`; delete the single file in the same change that adds the folder, and consumers importing
  `~/.../foo` keep working unchanged (they resolve to `foo/index.tsx`). Re-export the old public types from
  `index.tsx` so consumer imports don't break.
- **`React.lazy`/`next/dynamic` only pays off when inactive branches unmount.** Base UI `Tabs` unmounts
  inactive panels, so `dynamic()`-ing a tab panel genuinely defers its JS. If a primitive `keepMounted`s its
  hidden branches, lazy-loading buys nothing — verify the unmount behaviour before claiming a split.
- **A new Prisma field needs a dev-server restart, not just `migrate dev`/`generate`.** Turbopack caches the
  generated client in the running `next dev` process. After adding a column + regenerating, the live server
  still throws `Unknown field 'x' for select` (a 500) until you **restart the dev server**. `migrate dev` does
  not restart it. Symptom: schema/migration/typecheck all green, but the page 500s on the new field.
- **A controlled child only switches when the parent updates the controlled value.** A drawer/dialog whose
  `Tabs value` is controlled (`value={activeTab}`) will NOT switch on click unless the *consumer* threads the
  `activeTab` state + `onTabChange` setter. One consumer can wire it (and tabs work) while another renders the
  same component without those props (and tabs are frozen) — that's a consumer gap, not a component bug.

### Decomposition-heavy sweeps (surfaced by the `lineage-tree-canvas` sweep — the 1502-line #1 monolith)

- **Mutually-recursive sub-components must be colocated in ONE file — splitting them violates step 1.** A
  recursive tree renders `Branch → ChildColumn → Branch`. Putting `Branch` and `ChildColumn` in separate files
  makes each import the other, which fallow flags as a `circular-dependency` (dead-code, *introduced*) and risks
  a bundler TDZ at module-eval. The "one component per file" rule yields here: a single mutually-recursive
  rendering unit is ONE module. Keep both `export`/private functions in `branch.tsx`; export only the entry the
  orchestrator renders (mark the inner one file-private, else it's an `unused-export`).
- **Only `export` a relocated const if another file imports it.** Consts that were module-private in the monolith
  (`MIN_SCALE`, the stagger coefficients) are used only by their own `clampScale`/`entranceDelay`. Exporting them
  on the way out creates `unused-export` dead-code (*introduced*). Keep internal-only values file-private; export
  just the surface the other modules consume.
- **A high-complexity monolith will NOT read `introduced: 0` on the fallow complexity/dup axes — and that's
  expected.** Unlike the drawer (whose extracted parts fell *below* threshold, so introduced was genuinely 0), a
  #1-monolith's functions are individually above-threshold, and fallow has **no cross-file move detection**: it
  attributes every relocated function to its new path as `complexity_introduced` / `duplication_introduced`. The
  gate to actually enforce is **`dead_code_introduced: 0`** (genuinely new dead code — fixable, as above). For
  complexity/dup, verify by *mapping*: every "introduced" finding must be a 1:1 verbatim relocation of a function
  that existed in the original (no function's `cyclomatic` rose; the orchestrator's *fell* as logic moved to
  hooks). Two of this sweep's three "introduced" clone groups were against **untouched** sibling files
  (`lineage-cohort-timeline`, `lib/lineage/flatten-lineage`) — proof the clone pre-existed the move. Net-new
  authored complexity/duplication = 0; maintainability held (1502-line hotspot → 14 files, largest ~370).
- **Run `oxfmt` from `apps/web`, not the repo root.** oxfmt discovers `.oxfmtrc.json` from the CWD; run it from
  the repo root and it prints "No config found, using defaults" and reformats with **semicolons + arrow-parens**
  that fight the repo's `semi: false` / `arrowParens: avoid` style. Always `cd apps/web` first (or the package
  `format` script) so the config applies.

## Cross-references

- [ADR 0022 — brand-neutral primitives](../architecture/decisions/0022-brand-chrome-resolution.md)
- [Lineage Domain Hub](domain-features/lineage-hub.md)
- [SESSION_0410](../sprints/SESSION_0410.md) — the grill that established this recipe + the worked example.
