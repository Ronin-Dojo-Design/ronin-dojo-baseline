---
title: "Component Launch Sweep — the per-component recipe"
slug: component-launch-sweep-recipe
type: runbook
status: active
created: 2026-06-17
updated: 2026-06-18
last_agent: directory-detail-sweep
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

Surfaced by the **directory** sweep (facet tabs / filters / filter sheet, the `directory-filters` decompose):

- **A multi-brand, non-BBL-wrapped surface has no brand font to escape — do NOT force BBL `.variable`
  onto its portals.** The portal-font gotcha (thread the brand class to portaled content) assumes the
  *consumer* sits under a `bblHeadingFont.variable` wrapper. `/directory` does not: the `(web)` layout
  applies no BBL font, so the only font in play is the app `--font-sans` defined on the root `<html>` —
  which portals (Base UI `Dialog`/`Sheet`) inherit anyway. So the thread is a no-op here, and applying
  `bblHeadingFont.variable` to the filter-sheet popup would *force* BBL Poppins onto TB/WEKAF — a brand
  regression. Rule: the portal-font thread is for BBL-font-wrapped surfaces only; on a brand-neutral
  surface leave the chrome on the app neutral tokens it already inherits. The BBL type seam still reaches
  the directory **where it belongs** — via the *reused* `BjjPassportCard` on `/directory/[slug]`, which
  carries the `var(--font-bbl-*, var(--font-…))` fallback idiom itself. (Net: a fully token-clean surface
  can need *zero* font edits — confirm with a grep for hardcoded hex/`font-family`/arbitrary values rather
  than assuming every sweep swaps tokens.)
- **§5a's local-verify `migrate deploy` conflicts with a brief that says "Run ZERO migrations."** A sweep
  that forbids all migrations cannot stand up the §5a DB (it needs `bun run db:migrate deploy` to create
  tables; `next build`'s `prebuild` runs it too). Honor the brief literally and fall to §5b — but invoke
  `npx next build` **directly** so the `prebuild` lifecycle migration is skipped. The build still proves
  `✓ Compiled successfully` + `Finished TypeScript` before failing at *Collecting page data*; on an
  empty-but-reachable DB the error is `TableDoesNotExist` (the table-level analog of §5b's `P1001`).
  Recommend the recipe clarify that §5a's *local throwaway* `migrate deploy` is exempt from the
  no-*prod*-migration boundary — until a task says so, treat "ZERO migrations" as absolute.
- **Prove a `next/dynamic` split without a DB by grepping the emitted chunks** (the lazy-boundary analog of
  the §5b CSS grep). `next build` code-splits the dynamic import into its own async chunk even when page-data
  collection later fails. Confirm a string unique to the lazy branch (a filter's `"All kinds"` placeholder)
  lands in a *different* `.next/static/chunks/*.js` than a string unique to the eager branch (the facet-tabs
  `"Schools & Orgs"`), and that the heavy dep (`ComboboxSelector`) rode into the lazy chunk — that is the JS
  deferral, demonstrated.
- **Delete a magic-number that equals the primitive default; don't re-encode it.** The filter sheet's
  `className="w-[320px]"` on `SheetContent` was exactly the Sheet primitive's own `w-80` (320px) default
  (tailwind-merge just let the consumer's arbitrary value win). Dropping the override restores the primitive
  size prop with **zero** visual change — the cleanest "spacing → primitive size prop" swap.
- **An "under-300-line but multi-section" file is still a decompose target.** `directory-filters.tsx` was 215
  lines but six context-driven filter sub-components + a shared hook + helpers — decomposing to a folder
  module (thin `index.tsx` orchestrator + one file per filter + `use-directory-filters.ts`, barrel = only
  export) is what *enabled* the lazy split (step 3 needs a module to split). Size is a heuristic; "one
  responsibility per file" is the rule.
Surfaced by the **/posts feed** parity sweep:

- **Thread the brand-font seam through a `display:contents` wrapper, not a normal `<div>`.** When a
  page's top-level children are independent sections laid out by a flex-gap parent (the `(web)` layout's
  `Wrapper` applies `gap-y-fluid-md` to its direct children), wrapping them in an ordinary `<div>` to add
  the `bblHeadingFont.variable` / `bblBodyFont.variable` classes makes that div the single flex child and
  **collapses the inter-section gaps**. Use `cx("contents", brandFontVariables(brand))`: `display:contents`
  removes the wrapper's box so the sections stay direct flex children (rhythm preserved), while the CSS
  custom properties the `.variable` classes define still inherit to descendants (custom props inherit
  through `display:contents`). This differs from the lineage page, which wraps a *self-contained island* in
  a normal div — there's no parent-gap to preserve. Centralize the brand→class mapping in one helper
  (`brandFontVariables` in `lib/fonts.ts`) so BBL gets the vars and other brands degrade to the app font.
- **`fallow`'s touched-file re-attribution also fires on cross-page page-shell boilerplate, not just your
  own moved code.** Editing a single route page (e.g. `posts/[slug]/page.tsx`) re-attributes the shared
  `getData` / `getPageData` / breadcrumb / `Intro`+`Section` / import-list clones as `introduced: true`,
  because those regions' line content shifted — even though the *same* pattern pre-exists identically in 6+
  sibling route pages you never touched (`blog/[slug]`, `submit/[slug]`, `categories/[slug]`, `tags/[slug]`,
  `programs/[id]/enroll`, `advertise/success`). A surgical diff (a few imports + a wrapper) is enough to
  trip it. Don't chase these by deduping a 7-page Next.js page-shell (out of a single-component sweep's
  scope) — confirm the introduced clone group spans untouched sibling routes, then read the *authored*
  introduced counts (your new module's dup/complexity) + held maintainability instead.
- **The recipe's §5a verify-DB step can collide with a "run zero migrations" task constraint.** Bringing up
  a DB to live-DOM-verify needs `migrate deploy` to apply the existing schema; if the session is explicitly
  scoped to *zero* migrations, that step (and `db push`) is off-limits, so the real-data screenshot isn't
  reachable in-session. Fall back to §5b (`next build` compile/type + emitted-CSS grep) and defer the
  live-DOM pass to PR review — don't fake it.
Surfaced by the **legal/content page sweep** (privacy / cookies / terms + the DSR request form):

- **The portal-escape gotcha extends past Drawer/Dialog to `Select` (any Base UI popup).** The DSR
  form's `Select` dropdown renders through `SelectPrimitive.Portal` into `document.body`, so its open
  options escape the page's `BrandTypography` font scope and render in the app font — even though the
  trigger, labels, and inputs *inside* the scope inherit the brand font correctly. Same fix shape as the
  Drawer one: thread the brand font class to the portal content root (`SelectContent` already forwards
  `className` to its `Popup`). For a content sweep where the dropdown is a tiny secondary surface, it's
  defensible to leave it and log the gap — but **treat every portaled primitive (`Drawer`/`Dialog`/
  `Popover`/`Select`/`Menu`/`Tooltip`) as outside the font scope by default** and decide per surface.
- **Wrapping a page body in one scope collapses it to a single layout-`Wrapper` child — reproduce the
  fluid gap inside the scope.** The `(web)` layout renders `{children}` inside a `Wrapper` whose
  `gap-y-fluid-md` only spaces *direct* children. A page that returned a `<>…</>` fragment (Intro, Prose,
  Note, …) had each as a direct child, so they were spaced by the Wrapper. Introducing a single wrapping
  scope element makes the body ONE child (gap to the Footer is preserved, but the inter-section gap
  vanishes). The scope must carry `flex flex-col gap-y-fluid-md` itself (a spacing token, not a magic
  number) to keep the rhythm.
- **Decomposing N structurally-similar pages multiplies fallow clone groups without adding real
  duplication.** Splitting three legal pages each into `page.tsx` (route scaffold) + `policy-body.tsx`
  (legal copy) turned the pre-existing 2 clone groups (proven at base by a whole-repo `fallow dupes`)
  into 4 introduced groups: the route-scaffold clone (re-attributed because the member files changed)
  plus structural JSX-rhythm clones between three *genuinely different* legal documents. This is the
  step-5 relocation caveat at work — read `introduced` dead-code/complexity = 0 and a **held
  `maintainability_avg`** (`fallow` health `vital_signs.maintainability_avg`, ~94 here), not the raw
  duplication count. Do NOT abstract distinct legal prose to silence the detector; DO extract the genuine
  shared *chrome* (here `PolicyLayout`), which is the duplication actually worth removing.
- **§5a Docker fallback is itself untestable when the cloud session has no Docker daemon.** `docker info`
  failing means §5b (`next build` compile + type + emitted-CSS grep, live-DOM deferred to PR review) is
  the only path — don't burn time trying to bring up the compose stack first; check `docker info` once,
  then go straight to §5b.

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

Surfaced by the **/about** sweep (SESSION_0412 — reused the `PolicyLayout` seam, no new component):

- **A zero-height sibling after the single-wrapper scope is safe — the gap-collapse caveat above still
  holds.** `PolicyLayout` reproduces the Wrapper's `gap-y-fluid-md` *because* wrapping a body collapses
  it to ONE Wrapper child. `/about` keeps a `StructuredData` JSON-LD `<script>` as a **second** Wrapper
  child (sibling AFTER the layout), so there are two children again — but a `<script>` renders
  zero-height, so the inter-child `gap-y-fluid-md` spaces nothing visible. No regression, and you do NOT
  need to fold the sibling into the scope. (If the trailing sibling were *visible*, you would — it would
  re-open the double-gap the scope exists to collapse.)
- **`PolicyLayout` is title/description source-agnostic — i18n vs hardcoded const is a route concern.**
  The legal pages pass hardcoded `PAGE_TITLE` consts; `/about` passes strings resolved from next-intl
  (`pages.about`) + page metadata. The layout takes already-resolved `title`/`description` strings, so
  the i18n wiring stays in the route's `getData` and the layout is reused unchanged. When a swept page
  already sources metadata from i18n, **leave that wiring intact** — don't inline it to match the
  legal-page shape.
- **A token sweep RELOCATES stale copy; it does not rewrite it.** `/about`'s body was leftover dirstarter
  boilerplate (developer-tools copy + a "Brian Scott" author block — not BBL/martial-arts voice). The
  sweep moved it **verbatim** into the body module and **flagged it as content debt for the supervised
  content lane**. Inventing brand copy inside a presentation sweep is out of scope (same boundary as
  schema migrations) — surface it loudly in the report, don't fix it silently.

Surfaced by the **/me member-profile sweep** (SESSION_0413 — reused `ListingDetail` / `BjjPassportCard` /
`LineageRankHistoryTab` + `BrandTypography`, no new shared component):

- **`next/dynamic` works from a SERVER-component orchestrator (SSR kept) — but only split sub-modules
  that actually ship CLIENT JS.** The /me orchestrator is a server component; `dynamic(() =>
  import(clientComponent))` with the default `ssr: true` splits the chunk off the initial bundle and
  still server-renders (same shape as the `bbl-landing/index.tsx` server orchestrator). The genuine win
  here is the below-fold `LineageRankHistoryTab` (a client component that pulls in
  `LineageRankProgressionPanel`). The **gallery** is pure server markup (native lazy `<img>`, no client
  JS), so `next/dynamic`-ing it buys nothing — there is no client chunk to defer, so it stays eager.
  Extends the "lazy only pays off when inactive branches unmount" gotcha: also confirm the sub-module
  ships client JS before splitting it (don't dynamic-wrap server-only markup for show).
- **The shared `ListingDetail` owns the page H1 (its `H2`→`h1`, baked `font-display`) — a consumer
  cannot brand-font the title without editing the frozen component.** Under BBL the section headings
  (`bblHeadingFontClass`) and the `BjjPassportCard` credential (which already carries the BBL-named
  identity) read in the BBL heading font, but the `ListingDetail` H1 stays the neutral display font
  because the component exposes no `titleClassName` / heading-font slot. Under a shared-layer freeze this
  is **flagged, not edited**: a future `titleClassName` (or a `bblHeadingFontClass` default) on
  `ListingDetail` would let both `/me` and the parallel `/directory/[slug]` brand the H1 in one shared
  change. Don't reach into the frozen component from the consumer to force it.
- **Wrapping a `ListingDetail` body in `BrandTypography` is layout-safe; keep nav chrome outside the
  scope.** `BrandTypography` is `flex flex-col gap-y-fluid-md`; `ListingDetail` returns a single
  `<Section>` grid (+ optional `related`), so the scope holds one flex child and its internal gap is
  inert — the Section's own `md:grid-cols-3` is untouched. Render neutral nav chrome (`Breadcrumbs`)
  *outside* the scope; the `(web)` layout `Wrapper` gap (`fluid-md`) between it and the scope equals the
  scope's internal gap, so the vertical rhythm is identical either way (the single-wrapper-collapse
  caveat does not bite when only one visible body child sits inside the scope).
- **Decomposing a multi-optional-field profile flags `complexity_introduced` on the orchestrator — read
  the attribution, not the verdict.** This sweep's `fallow audit` returns `verdict: fail` purely on the
  raw above-threshold count, but the attribution is the truth: `dead_code_introduced: 0`,
  `duplication_introduced: 0`, `complexity_introduced: 2`, `maintainability_avg: 89.9` (held). Both
  introduced complexity findings are 1:1 relocations — `AffiliationRow` is verbatim (5→5 cyclomatic) and
  the orchestrator (7) absorbed the page render's optional-field conditionals (`name ??`, `avatarUrl &&`,
  `locationLine &&`, `gallery && …`) while `page.tsx`'s own complexity *fell* to a thin data-fetch. Same
  rule as the decomposition-heavy sweeps: enforce `dead_code_introduced: 0`, verify complexity findings
  by mapping to relocations, and do **not** atomize a 5-line avatar slot into its own file just to chase
  the count under threshold.
Surfaced by the **/events** sweep (public list + promotion-event detail — decompose, no `PolicyLayout`):

- **Content-rich card decomposition yields non-zero `complexity_introduced` — unlike the legal *prose*
  sweep where it was 0.** A page body made of many optional-field cards (the award card branches on the
  promotee `??` chain, the lineage-node ternary, and `discipline`/`colorHex`/`shortName`/`awardedBy`/
  `organization`/`location` `&&`s) carries high **cyclomatic** complexity that is inherent to the
  *content*, not the structure. Decomposing the monolithic `page.tsx` relocates that branch-heavy render
  into the new section files (`AwardCard` cyc 19, `EventCard` cyc 14), so `fallow audit` attributes it as
  `complexity_introduced > 0` — even though each new unit is **simpler** than the source monolith (and the
  sweep dropped a branch by swapping the inline `rankStyle` ternary for `BeltSwatch`). Read it exactly like
  the clone-relocation caveat: `dead_code_introduced: 0` + a held `maintainability_avg` (90 here) + low
  `avg_cyclomatic`/`p90`/`critical_complexity_pct` (3.6 / 6 / 0%), **not** the raw above-threshold count or
  the `fail` verdict. Do NOT fragment a coherent card further just to push each piece below threshold —
  that's the "abstract distinct content to silence the detector" anti-pattern, and it only redistributes
  the branches (extracting the provenance line leaves both halves above a low threshold).
- **`next/dynamic` on a pure-RSC below-fold section is a structural marker, not a bundle win.** Every
  events section is a Server Component (no `"use client"`, no client JS), so `next/dynamic`-splitting the
  below-fold gallery (`CeremonyPhotos`) with SSR kept defers the *module* but there is no client chunk to
  shrink — unlike bbl-landing, whose lazy targets are client carousels/embeds carrying real JS. Keep SSR
  (no `ssr:false`), keep the split (it marks the boundary and is ready if the section later gains a
  lightbox/client behaviour), and **don't add a `loading` boundary** — the SSR'd HTML paints, so the
  fallback is never meaningfully seen. Report the win as structural, not a measured bundle reduction.
- **A thin detail `page.tsx` that newly needs the brand resolves it on the wire — still no new-data lane.**
  `/events/[slug]` didn't previously read the brand; feeding `BrandTypography` needs `getRequestBrand()`
  (a header read — no schema, no payload column) added to the page and `Promise.all`-ed with the existing
  slug fetch. That's in scope (presentation wiring of data already on the wire), not a supervised migration.
Surfaced by the **`/organizations` + `/organizations/[slug]` sweep** (the public org list + the 411-line detail monolith — a *data-heavy* server route, unlike the static legal/about pages):

- **A `Prose`-less structured page needs the `h1`-inclusive heading-scope class, not per-heading `bblHeadingFontClass`.** The legal/about cluster routes its headings through `PolicyLayout` (Intro `bblHeadingFontClass` + `Prose` `bblProseHeadingFontClass`). A page built from `Intro` + `Section` + `Card` (the org pages) instead scatters one `IntroTitle` (h1) plus *many* `H4`s across sections — tagging each by hand is noise. The reusable move: one **container** rule on the `BrandTypography` scope — `bblHeadingScopeClass` = `[&_:is(h1,h2,h3,h4)]:[font-family:var(--font-bbl-heading,var(--font-display))]!` — covers every descendant heading at once (the structured-page analogue of `bblProseHeadingFontClass`, just widened to include `h1`). Pass it as `BrandTypography`'s `className`. Lightning CSS **merges** it with the existing `h2,h3,h4` rule (shared declaration body), so it adds ~no CSS weight — verifiable in the §5b emitted stylesheet: `grep -roh 'is(h1,h2,h3,h4)…font-bbl-heading…!important' .next/static/chunks/*.css`.
- **`next/dynamic` in a *server* orchestrator pays off via chunk-splitting, not branch unmount.** The drawer gotcha ("lazy only pays off when inactive branches unmount") is about tab/branch switching. For always-rendered *below-the-fold* server sections (the related-orgs grid, the members roster, the list cross-links) the payoff is a smaller initial client bundle — the chunk loads when reached — and SSR is preserved by simply **not** passing `ssr: false` (which is illegal in a Server Component anyway). Precedent: the BBL landing orchestrator. So "lazy-load below-fold" is valid for server modules too; just state the *reason* correctly. Bonus: lazy-loading the *section* that hosts a reused client island (the roster hosts `JoinOrganizationButton`/`MembershipActions`) defers that island's JS as a side effect — without forking the shared island (still "reuse, don't re-implement").
- **A data-heavy server route decomposes around a view-model loader, not a presentation orchestrator that fetches.** Where the static pages let the orchestrator be pure presentation, the org detail route does real server work (member grouping, related-orgs + promotion-timeline fetches, structured-data assembly). Clean shape: a `*-data.ts` **server loader** returns a typed `…View` model; `page.tsx` collapses to `params → load → notFound() → <Orchestrator {...view}/>`; the orchestrator owns only composition + lazy boundaries (zero fetch, zero derivation). Keep the derivation helpers (`groupMembersByUser`, `formatOrgAddress`) **file-private** in the loader and `export` only the loader + the view-model type the section files import — exporting an in-file-only helper is `unused-export` introduced dead code (the lineage-canvas export rule, applied to a server loader).
- **A route whose colors were already token-correct makes the sweep a *type-seam-only* pass — say so, don't invent color churn.** The org pages already used semantic tokens (`text-muted-foreground`, `text-secondary-foreground`, `Badge`/`Card` variants) with zero hex literals, and `organizations/[slug]/layout.tsx` was already the data-driven org-theme seam (`OrgSettings` → `[data-org]` CSS vars behind an HSL-safe regex guard — the recipe's own step-2 "org theme colors from data" ideal). So step 2's *color* work was a verified no-op here; the real brand work was the *type* seam (wrapping the body in `BrandTypography`). Leave an already-compliant `layout.tsx` untouched and report it as already-correct — the "a sweep relocates, it doesn't rewrite" discipline extends to "a sweep doesn't manufacture changes a surface doesn't need."

Surfaced by the **`/courses` + `/courses/[slug]` sweep** (the public course catalog + the 296-line enrollment-bearing detail monolith — a *data-heavy* server route like the org pages, plus a Suspense-island list):

- **Adding a column that ALREADY EXISTS on the model to a payload `select` is on-the-wire, not a schema migration.** The recipe's hard boundary forbids "new payload selects that **require** schema." The course payloads selected `rank: { id, name }` only, but `Rank.colorHex` / `Rank.shortName` already exist as columns in `schema.prisma` (used by the lineage / events belt surfaces). Widening the course + instructor rank selects to include them ships **zero migration** — the columns are already on the wire — so rendering the data-driven `<BeltSwatch colorHex={rank.colorHex}>` in place of a plain text rank `Badge` is in scope. The boundary bites only when the field doesn't yet exist on the model (then STOP → supervised lane). Rule of thumb: `grep` the field in `schema.prisma` before assuming a select needs a migration.
- **A `Suspense`-wrapped search island stays in the orchestrator, threaded as a `searchParams` prop — the loader pattern is for the page's OWN fetch, not the island's.** The courses index has TWO fetches: the page's lightweight top-N (`searchCourses({ perPage: 10 })`, for the ItemList JSON-LD + catalog count) and the live `CourseQuery` island's parsed-params fetch (under `<Suspense>`, distinct cache key — no double-fetch). The page does its own small fetch inline (too thin to warrant a `*-data.ts` loader, unlike the detail route) and threads `searchParams: Promise<SearchParams>` down to the orchestrator, which keeps the `<Suspense fallback>` + `<CourseQuery>` intact. Don't try to hoist the island's fetch into a loader — its whole point is to stream independently of the shell.
- **A `BeltSwatch` inside a `Badge prefix` is the cleanest belt-color adoption — no layout change.** The rank chip was `<Badge variant="outline">{rank.name}</Badge>`. Passing the swatch as the badge's `prefix` (`prefix={<BeltSwatch colorHex={rank.colorHex} />}`) renders the data-driven dot inline before the name with the badge's existing affix slot spacing — zero new wrapper, and `BeltSwatch` already null-safe-falls-back to a neutral muted dot when `colorHex` is null. Same swatch seam reused for the course overview chip AND the below-fold instructors grid.
- **A bare `tsc --noEmit` in a fresh worktree floods with `Cannot find name 'PageProps'/'LayoutProps'/'RouteContext'`.** Next.js 15 generates those per-route global types into `.next/types` during `next dev`/`next build`; a clean checkout that has never built has no `.next`, so EVERY pre-existing route page errors on the global `PageProps`. These are environmental, not authored — they vanish after a build generates the types, and they only hit files using the *global* `PageProps` (a swept page that declares its own local `type PageProps` is clean). Read past them; the real gate is the §5b `next build` (which generates the types first), and a filtered `tsc 2>&1 | grep <your-paths>` to confirm your own files are clean.

Surfaced by the **/directory/[slug] member-detail sweep** (the 244-line public profile page — reused `ListingDetail` / `BjjPassportCard`, no new shared component):

- **A token-clean, brand-neutral surface confirms the directory-filters gotcha end-to-end: ZERO font edits, no `BrandTypography`.** The page had no hardcoded hex/`font-family`/arbitrary values (a `grep -nE '#[0-9a-fA-F]{3,8}|font-family|rgb\(|hsl\('` returned only array-index `[0]` false positives), belt color already flowed via the reused `BjjPassportCard` → `Rank.colorHex` → `BeltSwatch`, and the page uses semantic tokens (`text-muted-foreground`, `Badge`/`Avatar` variants). Unlike `/me` (which IS BBL-font-wrapped and so wraps its body in `BrandTypography` + tags section headings with `bblHeadingFontClass`), `/directory/[slug]` is the *public* multi-brand surface — wrapping it in `BrandTypography brand={BBL}` would force Poppins onto TB/WEKAF. So this sweep added **no** `BrandTypography` and **no** `bblHeadingFontClass` on the section `H4`s. The BBL type seam still reaches the page via the reused passport card's own `var(--font-bbl-*, var(--font-…))` fallback idiom — verifiable in the §5b emitted CSS (`grep -roh 'font-bbl-heading,var(--font-display)' .next/static/chunks/*.css`). Net: the token sweep was a verified no-op; the *only* code change was the decomposition + lazy split. Say so, don't manufacture color/font churn.
- **`next/dynamic` from a server orchestrator pays off only for the below-fold sections that ship CLIENT JS — the pure-RSC ones produce no client chunk to grep.** All five body sections are Server Components, but only the three carrying the client `Link` primitive (Schools/Orgs, Social, Upgrade) produce a client async chunk when `dynamic()`-split; the eager pure-server sections (About, Ranks) emit **zero** client JS (their text never appears in any `.next/static/chunks/*.js`). Evidence without a DB: the `UpgradeSection`'s `/lineage/join` href and the orgs `"Schools &"` string land in `static/chunks/*.js` (the lazy boundary materialized a client async chunk), while `"Rank Summary"` / `"Ranks & Achievements"` (eager RSC) appear in **no** client chunk at all. Keep the splits on the `Link`-bearing below-fold sections (real deferral); keep SSR (no `ssr:false`). Same lesson as /me — confirm the sub-module ships client JS before claiming a measured win.
- **fallow's 271-changed-file aggregate is meaningless on a worktree whose base lags many sibling sweeps — scope every count to your own route path before reading it.** The repo-wide summary read `dead_code_introduced: 14 / complexity_introduced: 77 / duplication_introduced: 55`, `verdict: fail` — almost entirely sibling-sweep churn in the `git diff main` base, NOT this sweep. Scoped to `/directory/[slug]/_components/`: **zero** dead-code entries (no `unused-export` from the relocated loader/types/fields/sections — the barrel consumes every export), **zero** duplication clone groups, and the only complexity items are cyc-5 1:1 relocations (`HeroBadges`, `loadDirectoryProfile`). The old monolith's `DirectoryProfilePage cyc=32` is attributed `introduced: false` (it's the *base* `page.tsx`), and the new thin page trips no threshold — the orchestrator's complexity *fell* as logic moved to the loader + sections. `maintainability_avg: 89.6` held. Read `dead_code_introduced: 0` + held maintainability *scoped to your files*, never the worktree-wide raw count.

## Cross-references

- [ADR 0022 — brand-neutral primitives](../architecture/decisions/0022-brand-chrome-resolution.md)
- [Lineage Domain Hub](domain-features/lineage-hub.md)
- [SESSION_0410](../sprints/SESSION_0410.md) — the grill that established this recipe + the worked example.
