---
title: "Component Launch Sweep — the per-component recipe"
slug: component-launch-sweep-recipe
type: runbook
status: active
created: 2026-06-17
updated: 2026-06-18
last_agent: claude-posts-feed-parity-sweep
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

## Cross-references

- [ADR 0022 — brand-neutral primitives](../architecture/decisions/0022-brand-chrome-resolution.md)
- [Lineage Domain Hub](domain-features/lineage-hub.md)
- [SESSION_0410](../sprints/SESSION_0410.md) — the grill that established this recipe + the worked example.
