---
title: "Component Launch Sweep — the per-component recipe"
slug: component-launch-sweep-recipe
type: runbook
status: active
created: 2026-06-17
updated: 2026-06-18
last_agent: claude-about-legal-chrome-sweep
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

Surfaced by the **BjjPassportCard** sweep (the bjj-passport-card credential):

- **A multi-brand-hosted component needs the `var()`-fallback font idiom, not the comma-list one.** The
  always-BBL-wrapped surfaces write `[font-family:var(--font-bbl-heading),system-ui,sans-serif]` — a
  *font-family list*. If the component renders on pages that do **not** define `--font-bbl-heading` (e.g. the
  passport card on the multi-brand `/me` + `/directory/[slug]`, which are not BBL-font-wrapped), that list does
  **not** advance to `system-ui`: an undefined `var()` with no fallback is the *guaranteed-invalid value*, so the
  whole `font-family` declaration is dropped and the element silently **inherits** instead. Use the nested
  `var()` **fallback** form so an undefined brand var degrades to the app token explicitly:
  `[font-family:var(--font-bbl-heading,var(--font-display))]` / `[…var(--font-bbl-body,var(--font-sans))]`.
  Brand-correct (zero regression off-BBL — stays the app font), still inherits BBL when an ancestor defines the
  var, and still "the consumer passes the tokens" (the card only *consumes* the var; it never applies the font
  `.variable`). Tailwind v4 parses the nested-comma value fine (write it with **no spaces**).
- **Overriding a heading primitive's baked-in font needs `!`.** `H4`/`Heading` ships `font-display`, and
  `tailwind-merge` (via `cx`) does **not** dedupe the custom `font-display` against an arbitrary
  `[font-family:…]` (its default font-family group only knows `font-sans/serif/mono`), so both survive and CSS
  source-order decides. Append `!` (Tailwind important) to the arbitrary class to guarantee it wins — same idiom
  as bbl-landing's `[&_:is(h3,h4)]:[font-family:…]!`. Verify in the built CSS: `…!important}.font-dis…`.
- **Promote a *recurring* magic type-size to a neutral theme token, don't just inline it.** `text-[0.625rem]`
  appeared in both the passport eyebrow and `Badge size=sm`; codify it once as `--text-2xs: 0.625rem` in the
  `@theme` (Tailwind v4 auto-generates the `.text-2xs` utility — font-size only, matching the old arbitrary
  value) and anchor it in the primitive (`Badge`) so the token isn't an orphan. Neutral type-scale steps (like
  the existing `--text-5xl`) are **safe under the ADR 0022 freeze** — that freeze governs brand chrome/colors,
  not the neutral scale.
- **Build-only verify (§5b) still yields CSS evidence, and you can grep for it.** Without a DB, `next build`
  fails at *Collecting page data* (`P1001 Can't reach database server`) on DB-backed pages — but
  `✓ Compiled successfully` and `Finished TypeScript` run **first**, so SSR + type + CSS are already proven.
  Concretely confirm your token/classes compiled by grepping the emitted stylesheet (a verifiable stand-in for
  the deferred screenshot): `grep -r -- '--text-2xs' .next --include=*.css`, `'.text-2xs{'`, and the
  `…!important` font rule. Restart-the-dev-server / live-DOM still belongs to PR review.

Surfaced by the **about + legal-chrome** sweep (`/about` + `/terms` + `/privacy` + `/cookies`):

- **The legal-chrome seam (`PolicyLayout` + `BrandTypography`) is the reference pattern for any static-prose
  content page.** `BrandTypography` (`components/web/ui/brand-typography.tsx`) is the brand-aware font scope —
  it attaches `bblHeadingFont.variable`/`bblBodyFont.variable` **only for `Brand.BBL`** and carries
  `flex flex-col gap-y-fluid-md` itself (Gotcha D), exporting `bblHeadingFontClass` (`!`-important, var()-fallback;
  Gotchas B+C) and `bblProseHeadingFontClass`. `PolicyLayout` (`policy-layout.tsx`, `PolicyPageProps`) composes
  it with `Intro` + `Prose`; the per-page prose passes as `children` (+ `afterContent` for `<StructuredData>`).
  Reuse these before hand-rolling an `Intro`/`Prose` page. See custom-component-inventory §3j.
- **`oxfmt` rewrites `…and{" "}\n<Link>` into `…and <Link>` when it reflows the two onto one line — this is
  NOT a copy change.** A whitespace-insensitive word-diff (`git diff --word-diff -w`) will surface `and{" "}` → `and`
  and `<li>\n  Interfere…` → `<li>Interfere…`; both render byte-identical text (JSX collapses inter-line whitespace,
  and a same-line literal space is equivalent to the explicit `{" "}` guard). When verifying "copy word-for-word
  intact," diff the **rendered** text, not the JSX source — the formatter's whitespace normalization is expected and
  load-bearing-free.
- **Extracting shared chrome *reduces* the clone family — but fallow still re-attributes it as `introduced`.** The
  three legal pages were already clone family `dup:6c1e06e9` (175 lines) at base; `PolicyLayout` shrank it to 164
  lines, yet `fallow audit --changed-since HEAD` reports `duplication_introduced: 1` because the fingerprint hash
  changed. This is the Gotcha-E artifact: gate on `dead_code_introduced` + `complexity_introduced` = 0 and a held/
  improved `maintainability_avg` (this sweep: 91.4 → 92.2), and prove the duplication pre-existed with a base-tree
  `fallow dupes` — do **not** chase `duplication_introduced` to 0 by abstracting distinct prose.

## Cross-references

- [ADR 0022 — brand-neutral primitives](../architecture/decisions/0022-brand-chrome-resolution.md)
- [Lineage Domain Hub](domain-features/lineage-hub.md)
- [SESSION_0410](../sprints/SESSION_0410.md) — the grill that established this recipe + the worked example.
