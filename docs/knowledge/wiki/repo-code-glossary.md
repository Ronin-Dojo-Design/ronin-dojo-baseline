---
title: Repo Code Glossary
slug: repo-code-glossary
type: reference
status: active
created: 2026-06-06
updated: 2026-07-20
last_agent: claude-session-0582
pairs_with:
  - docs/rituals/closing.md
  - docs/knowledge/wiki/index.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0350.md
tags:
  - glossary
  - reference
  - onboarding
---

# Repo Code Glossary

Plain-English definitions of the technical terms that show up in sessions, written for a
**non-technical reader**. Each entry: a one-line meaning + a real example from this repo (file or
commit) so the term is concrete, not abstract.

> **How this grows:** this is an **optional, on-demand** bow-out spike — not a gate, not run every
> session. Add a term when the operator asks ("add X to the glossary") or when an agent uses a term a
> non-technical reader would stumble on. Keep entries to 1–2 lines; link to one concrete example.
> First entries below are only the terms that surfaced in **SESSION_0350**.

## How the code runs

- **TypeScript** — the programming language the app is written in (files ending `.ts` / `.tsx`). It's
  JavaScript with "types" (labels that say what kind of value each thing is) so mistakes get caught
  early. Example: `apps/web/lib/directory/facet-result.ts`.
- **bun** — the tool that runs the code, installs packages, and runs tests. You'll see commands like
  `bun test` and `bun run typecheck`.
- **Next.js** — the web framework that builds the actual site under `apps/web`; it renders pages both
  on the server and in the browser.
- **Prisma** — the toolkit the app uses to talk to the database. The file
  `apps/web/prisma/schema.prisma` is the master list of database tables.
- **Postgres / Neon** — the database (where data lives). **Postgres.app** is the local copy on the
  laptop; **Neon** is the cloud version. Same engine, different location.
- **dev server** — a private running copy of the site on the laptop (`next dev`) used to check changes
  before they go live. Example this session: it served `http://localhost:3000/directory` for the smoke test.
- **App Router** — the Next.js folder system where folders become URLs. Example: `apps/web/app/admin/repo-docs/page.tsx` becomes `/admin/repo-docs`.
- **route handler** — server code that answers a URL directly instead of rendering a page. Example: `apps/web/app/admin/repo-docs/docs-navigator/route.ts` serves the generated docs navigator HTML.

## How code ships (gets to the live site)

- **commit** — one saved bundle of changes, with a message describing it.
- **SHA** — the unique fingerprint (a short code like `3bcb665`) that names a specific commit. This
  session's three commits were `3bcb665` → `640686a` → `bb512e7`.
- **push** — uploading commits to GitHub (the shared online home of the code).
- **CI** (Continuous Integration) — robots on GitHub that automatically run checks every time code is
  pushed (tests, type-checking, formatting). "CI is green" = all checks passed.
- **CI gate** — a check that **must** pass before code is trusted. (This glossary is deliberately *not*
  a gate.)
- **Playwright / E2E** — a robot browser that clicks through the real site to confirm pages actually
  work end-to-end (E2E = "end to end"). This session it loaded all three `/directory` tabs and checked
  for errors.
- **Vercel / deploy** — the hosting service. A "deploy" is publishing a new version of the live site;
  pushing app code triggers one automatically. "Ready" = the new version is live.
- **production** — the real live site and live services. In this repo, production money movement can use live Stripe keys, so test cards do not belong there.
- **preview / staging** — a temporary hosted copy used to prove changes before production. It should be treated as real enough to catch env/domain/auth mistakes, but not as the canonical live site.

## Code-quality tools

- **typecheck** — runs the TypeScript checker to catch type mistakes *before* the code runs.
- **lint / format** — checks code correctness/style and formatting for consistency. The specific tools are the **Oxc** toolchain: **oxlint** (correctness/best-practices) + **oxfmt** (formatting). These replaced **Biome** in SESSION_0360.
- **wiki-lint** — the same idea, but for the documentation (`docs/`).
- **fallow** — a tool that finds **dead code** (code nothing uses anymore). Trialed this session via
  `npx fallow audit`; it caught two unused pieces that were then deleted.
- **graphify** — a repo "map" tool: ask it about a topic and it lists the related files, so you don't
  have to search blindly. See [graphify-repo-memory](../../runbooks/dev-environment/graphify-repo-memory.md).
- **docs navigator** — a generated HTML map of the repo docs. Build it with `bun run docs:nav`; in admin it is exposed through `/admin/repo-docs`.
- **Graphify HTML** — the visual graph export at `/graphify.html`. Build it with `bun run graphify:viz`; it is useful for navigation but not proof by itself.

## Concepts that came up this session

- **enum** — a fixed menu of allowed values. Example: `enum LineageVisibility { PUBLIC, UNLISTED,
  RESTRICTED, PRIVATE }` in `apps/web/prisma/schema.prisma`.
- **read model / payload** — the exact set of fields a database query is allowed to return. Keeping
  these tight is how private data stays private. Example: `apps/web/server/web/directory/payloads.ts`.
- **adapter (presentation adapter)** — code that reshapes raw data into one tidy shape for display,
  without changing the database. Example: `DirectoryFacetResult` in
  `apps/web/lib/directory/facet-result.ts` (turns people, schools, and trees into one card shape).
- **facet / faceted browse** — letting people narrow a big list by category or type. This session added
  a People / Schools & Orgs / Lineage Trees switcher to `/directory`.
- **query param (nuqs)** — a setting stored in the web address, like `?type=people`, so a filtered view
  is shareable and survives a refresh. **nuqs** is the library that keeps the URL and the screen in sync.
- **slug** — a human-readable ID used in URLs and filters, such as `brazilian-jiu-jitsu` instead of a
  database ID. This session standardized `/directory?discipline=` on `Discipline.slug`.
- **cross-facet filter** — one filter that applies across several result types at once. Example:
  `/directory?discipline=bjj` narrows People, Schools & Orgs, and Lineage Trees by the same discipline
  slug.
- **pagination** — splitting a large result list into pages with `page`, `perPage`, and `total`, instead
  of loading everything at once. This session moved the People facet toward the same paginated shape as
  Organizations and Lineage Trees.
- **projection** — the server-side shape returned to the UI after privacy and tier rules are applied.
  Example: `projectDirectoryProfileListItem` keeps People cards aligned without exposing hidden profile
  fields.
- **penetration test / pen test** — a deliberate attempt to prove a security boundary holds, such as
  trying `/directory?discipline=<other-brand-slug>` to confirm public search cannot cross brand scope.
- **dead code / orphaned** — code that nothing else uses. This session deleted the orphaned
  `components/web/members/*` (it was unreachable behind a redirect).
- **drift / drift register** — a written record of places where the docs and the code disagree, so they
  don't get silently lost. Example: `D-020` in [drift-register](drift-register.md).
- **wiring ledger** — the repo's list of known code/documentation gaps that should not disappear into memory. Example: [wiring-ledger](wiring-ledger.md).
- **manual boundary** — a thing that cannot be closed by code alone, such as DNS setup, live payment proof, or owner approval. Example: [manual-boundary-registry](manual-boundary-registry.md).
- **ADR (Architecture Decision Record)** — a short document that records a real architecture decision and its consequences. Example: [ADR 0008](../../architecture/decisions/0008-brand-switcher.md).
- **source of truth** — the place we trust first for a fact. Example: `schema.prisma` is the source of truth for database shape; ADRs are the source of truth for accepted architecture decisions.
- **payload / allowlist** — the exact fields a query is allowed to return. Think of it as a packing list: if a private field is not on the list, it cannot accidentally show up in the UI.
- **server action** — a trusted server-side function a form or button can call. It is where validation, permissions, writes, and cache invalidation should happen.
- **brand** — the public face/domain the user is visiting or operating in: Baseline Martial Arts, BBL, WEKAF, or Ronin Dojo Design. Brand affects chrome, data scope, email links, and launch behavior.
- **host-derived brand** — the brand inferred from the current domain, such as `bbl.local` resolving to BBL. It controls public site chrome.
- **active brand** — the app-data brand an admin or multi-brand user is currently working inside. It is planned in [ADR 0008](../../architecture/decisions/0008-brand-switcher.md) and stored as `User.lastActiveBrandId`, but the full switcher flow is still open.
- **admin monitor** — an admin page that summarizes operational health. Current examples: `/admin/billing/monitoring` for Stripe webhooks and `/admin/storage/monitoring` for S3/media readiness.
- **pulse** — a planned scheduled or on-demand digest that runs monitor checks and reports a small owner-readable status. Current pulse candidates are documented in [repo-alignment-report](../../architecture/repo-alignment-report.md).
- **cron** — a scheduled job. In this repo, cron should be used only for durable scheduled work like audits, expiry checks, publish/sync jobs, and pulse reports, with a secret guard and clear failure policy.
- **Graphify-first discovery** — the rule that cross-area sessions query Graphify before broad file searching, then verify by opening exact files. It reduces blind searching but does not replace source review.
- **repo alignment report** — a repeatable sweep that compares current code/session truth against docs, ADRs, ledgers, and generated navigation artifacts. See [repo-alignment-report](../../architecture/repo-alignment-report.md).

## Domain words in this repo

- **Black Belt Legacy (BBLApp v4.4)** — the live product: the heritage/lineage network for martial artists at [blackbeltlegacy.com](https://blackbeltlegacy.com) (launched June 19, 2026). `BBL` is its brand code; `v4.4` is the current app line. It's the only active brand — the codebase's other three brands are dormant.
- **Passport** — a person's global identity record: name, profile basics, emergency/contact fields. It is not the same as their membership in a school.
- **DirectoryProfile** — the public/private directory face of a person. It controls visibility and which profile fields may show up.
- **Organization** — a school, dojo, club, league, or federation. It is the main container for memberships, programs, schedules, billing, and events.
- **Discipline** — a martial art or training discipline, such as BJJ, Muay Thai, Eskrima, Karate, or Judo.
- **RankSystem** — a rank ladder for one discipline, such as belt ranks, kyu/dan ranks, prajioud, grade levels, or forms progression.
- **Rank** — one step on a RankSystem, such as White Belt, Blue Belt, or Level 3.
- **Membership** — a user's relationship to an Organization for one Discipline. This is where active/pending/suspended status, rank, and roles come together.
- **RegistrationEntry** — one specific event/tournament entry with rank and organization snapshots, so competitive history does not change when someone is promoted later.
- **Entitlement** — a durable access permission. Payment, comp, membership, or promo can grant it; features check it instead of guessing from Stripe metadata.
- **ContentAtom** — one canonical teaching/marketing idea that can become posts, curriculum, social copy, videos, or other variants.
- **ContentVariant** — a brand/channel-specific version of a ContentAtom, such as a Baseline blog post or BBL social caption.
- **LineageTree** — a public or private family-tree-style view of martial arts relationships.
- **Timeline-tree** — BBL's signature lineage view: a *chronological* tree of who promoted whom, with **provable provenance** ("Promoted by X · date", year-stamped connectors, ordered by time). The product's USP — not just who's connected, but when and by whom.
- **LineageNode** — the person identity point inside lineage data. Rooted on a **Passport** (a placeholder node has an accountless Passport, claimable).
- **LineageTreeMember** — a person's membership in a specific lineage tree, including visual parent, sort order, and public display flags.
- **DataSelect** — the id/slug-aware `Select` wrapper (`components/common/data-select.tsx`). Takes `options:{value,label}[]` and forwards a `value→label` map to Base UI `Select.Root` so a preset id renders its label, not the raw cuid (the systemic WL-P1-7 fix). Use it for any Select whose value is an id/slug. SESSION_0355 added an optional per-option `content?: ReactNode` (resolved by `dataSelectRowContent`) that renders a **rich dropdown row** (e.g. a belt swatch) while `label` still drives the collapsed trigger, typeahead, and a11y — so the prior ReactNode-label exception is removed and `tool-filters` is back on `DataSelect`. (For *searchable* person/org pickers use `ComboboxSelector`, not `DataSelect`.)
- **BeltSwatch** — the small belt-color swatch primitive (`components/common/belt-swatch.tsx`), driven by `Rank.colorHex` data via a data-bound SVG `fill` (never a hardcoded colour or inline `style`). The reusable consolidation of the per-surface bespoke belt-color treatments.
- **Person-presentation contract** — the role-agnostic rule that a person is rendered the same everywhere (avatar `passport.avatarUrl ?? user.image` + name + belt/rank + disciplines + location), regardless of role (member/student/instructor/owner). "The instructor avatar should not be just for instructors." Staged in `petey-plan-0356`.
- **Register vs Claim** — two distinct directory entry points. **Register** = a visitor self-creates a *new* entity (org via `/organizations/new`; person via signup→onboarding). **Claim** = a user takes ownership of an *existing* owner-less/placeholder entity (`ProfileClaimRequest`). The unified "search-first → claim if it exists, else create" funnel (the Dirstarter submit pattern, to govern all registers/claims/invites) is staged in `petey-plan-0356`.
- **ProfileClaimRequest** — a request to take ownership of an "unclaimed" directory subject, reviewed by an admin (mirrors `LineageClaimRequest` but for the directory). Subject is an owner-less `Organization` or a placeholder-`User` `DirectoryProfile`. Distinct from a lineage claim (which targets a `LineageNode` on a tree).
- **Claimable** — a directory subject that can be claimed: an `Organization` with no `ownerId`, or a `DirectoryProfile` whose `User.isPlaceholder` is true (a legacy import with no login account).
- **Claim teaser** — the public "mock profile" shown on `/directory/[slug]` for a claimable placeholder person instead of an empty profile/404: a `ProfileHero` preview + skeleton sections + a "Claim this profile" CTA, designed to entice the real owner to claim it.
- **ProfileHero** — the shared presentation hero (`components/web/profile/profile-hero.tsx`) used by the claim teaser and the owner live-preview in the create/edit forms. Renders only display values passed in (no data fetch, no private fields).
- **DTO (Data Transfer Object)** — the explicit shape of data allowed to *leave the server*, defined as a Prisma `select` "payload" (`server/web/.../payloads.ts`, `top-ranked-queries.ts`). WordPress/Pods analogy: choosing which fields a template may output. It is the privacy boundary (no email leaks), the performance boundary (fetch only what's shown), and the type contract (UI types derive from it). Rule: cross server→client through a DTO, never a raw `db.*` row in a component.
- **View-model** — pure functions that turn a DTO into *display values*, in one place (`lib/lineage/canvas-model.ts`: `memberRankLabel`, `memberSchoolLabel`, `memberInitials`). WordPress/Pods analogy: a display helper that formats a raw field for output. Keeps "how we show X" from being re-spelled in every component.
- **fd** — a fast `find` replacement (`brew install fd`; `fd PATTERN path`); respects `.gitignore`, simpler syntax. **Optional, not installed** — this repo's sanctioned discovery path is Graphify first, then `find`/`grep`. Convenience only.
- **Router Cache / `revalidatePath`** — Next.js keeps a short-lived client-side copy of each page you've visited (the "Router Cache"), so navigating *back* to a page can show a remembered version instead of re-asking the server. After a save, a server action calls `revalidatePath("/some/route")` to tell Next "throw away the cached copy of that page." WordPress analogy: clearing a page cache after editing a post. **The gotcha (SESSION_0451):** if the path string is wrong (e.g. it points at a retired/redirected route), the save still writes to the database but the *visible* page is never refreshed — so the edit "reverts" on navigation even though the data is correct. Rule: a save that persists in the DB but won't show on screen is usually a wrong/missing `revalidatePath`, not a save bug. See FS-0026 / `[[admin-app-migration-revalidate-paths]]`.

## Architecture concepts (SESSION_0458)

- **Kernel** — the small, shared, jointly-owned *core* that multiple products are allowed to reuse, but
  that **no single product may bend toward its own domain**. In this repo the kernel is
  `packages/ui-kit` — the `m-card` (the one card), the design tokens, and the `AdminKanban` board
  engine. Plain analogy: a car *platform* (chassis, axles, electronics) shared across several models —
  each model adds its own body/trim, but none re-welds the chassis. Why it matters: keeping product-
  specific rules *out* of the kernel is what lets Black Belt Legacy and Mammoth share UI without their
  meanings of words like "status" or "owner" leaking into each other. The board you reuse, you don't
  fork. (Deeper teaching: learning record `0002`; the DDD "Shared Kernel" idea, ADR 0033 D1.)
- **Projection / read-model** — a *read-only view* computed from a source of truth, never a second copy
  you have to keep in sync. The Loop Board is a projection: it reads the 9 ledger markdown files and
  *renders* them as cards; it stores nothing. Analogy: a report built from a spreadsheet — change the
  spreadsheet, re-run the report, no separate data to reconcile. Example: `apps/web/lib/loop-board/`.
- **Port & adapter** — a **port** is a named slot a component depends on (an interface: "give me a way
  to load/save a board"); an **adapter** is a concrete thing that fills the slot (localStorage, a DB, a
  REST API). The component talks only to the port, so you swap the adapter without touching the
  component. Example: `BoardStore` (port) with `createLocalStorageBoardStore` / `createMemoryBoardStore`
  (adapters) in `packages/ui-kit/src/kanban/board-store.ts`.
- **Scroll-snap carousel** — a row that scrolls sideways and "snaps" to one item at a time (like the
  Amazon products row or a Spotify shelf), built with plain CSS (`scroll-snap-type`) — no library. On a
  phone the Loop Board's columns are a snap carousel: swipe, tap the pager, or use the arrows. Example:
  `BoardColumns` / `useColumnCarousel` in `packages/ui-kit/src/kanban/admin-kanban.tsx`; lifted from the
  monorepo `CarouselRail`.
- **Config-driven (zero per-project code)** — a component whose behavior is set entirely by a *data*
  object passed in, so targeting a new use case means writing config, not editing the component. The
  whole "Mammoth instance" of `AdminKanban` is one `BoardConfig` + a 15-line mapper; the Loop Board is
  another config + mapper. Analogy: the same coffee machine, different pods.
- **Realtime-from-git** — reading content **live from the `main` branch** at request time (via GitHub's
  public raw URL) instead of from the deployed bundle, so the page reflects the latest commit even when
  no redeploy happened. The Loop Board uses this so docs-only ledger commits (which skip the prod build)
  still show. Example: `apps/web/lib/loop-board/fetch-ledgers.ts`.

## Security & web headers (SESSION_0536)

- **CSP (Content-Security-Policy)** — a browser rulebook, sent as an HTTP header, that lists which
  sources the page is allowed to load each kind of thing from (scripts, styles, images, videos, fonts).
  Anything not on the list is blocked. It's the main defense against a hacker sneaking a malicious script
  onto the page. Example: `apps/web/config/security-headers.ts`.
- **XSS (cross-site scripting)** — the attack CSP defends against: an attacker gets *their* JavaScript to
  run on your page (e.g. through a comment box or a bad upload), where it can steal logins or data.
- **Report-Only** — a "dry-run" mode for CSP: the browser *reports* what the rules would block but
  blocks nothing. It lets you watch the live site for breakage before turning enforcement on. BBL runs
  CSP Report-Only today; the switch to actually enforce is the env flag `CSP_ENFORCE=1`.
- **nonce** — a one-time random password stamped on each `<script>` tag and in the CSP header, so the
  browser only runs scripts carrying today's password. It lets the page drop the blanket "allow any
  inline script" permission — the biggest XSS hole. Minted per request in `apps/web/proxy.ts`.
- **report sink / `report-uri`** — the address the browser POSTs CSP violation reports to, plus the small
  endpoint that collects them (`apps/web/app/api/csp-report/route.ts`). The rule of thumb: you can't
  safely *enforce* what you can't *observe*, so the sink ships before the enforce flip.
- **HSTS (Strict-Transport-Security)** — a header that tells the browser "always use secure HTTPS for
  this site, never plain http," so no one can downgrade the connection. Production only.
- **`'unsafe-inline'`** — a CSP permission that means "allow inline scripts/styles written directly in the
  page." Convenient but it defeats most of CSP's script protection, so the goal is to remove it from
  scripts (replaced by the nonce) — while keeping it for *styles*, because inline `style="…"` attributes
  are everywhere and a nonce can't cover them.
- **Security-header baseline** — the standard set of protective headers every page sends (CSP, HSTS,
  X-Frame-Options, COOP, Referrer-Policy, Permissions-Policy). Analogy: the seatbelts and airbags every
  car ships with by default. Built in `apps/web/config/security-headers.ts`.

## Membership tiers & access gates (SESSION_0535)

- **Membership tier** — the paid level a member is on: **Free** (account only), **Premium**, **Elite**,
  **Legend**. Higher tiers unlock more actions.
- **Participation ladder** — the rule that *each paid tier unlocks the next action*: Free members **read** the
  community; **Premium** members can **create** community posts; **Elite** members can **author** techniques.
  Upgrading is how you earn the next "verb." (SESSION_0535 tightened community posting to Premium-and-up, so
  free members lost it.)
- **Entitlement key** — the record that proves a member holds a tier: `LINEAGE_PREMIUM`, `LINEAGE_ELITE`,
  `LINEAGE_LEGEND`. A member can hold more than one. Example: `apps/web/lib/entitlements/lineage-comp.ts`.
- **Capability gate** — a small server-side function that answers "is this user allowed to do X?" by
  *combining the checks we already have* (their role, their staff position, their paid tier) — never a new
  bespoke system (the "no 5th authz" rule). Example: `canCreateCommunityPostForUser`
  (`apps/web/server/web/community/permissions.ts`) decides who may post; its sibling `canCreateTechniqueForUser`
  decides who may author a technique.
- **Server-side gate (not a hidden button)** — the real access check lives *inside the server action* that
  does the write, so a hidden "New post" button isn't the lock — the server refusing the write is. Example
  this session: `createCommunityPost` rejects a free member before saving anything.
- **"Gate on the tier, not one key"** — because which entitlement keys a paid plan grants is set in the
  database (not in code), the post gate accepts *any* paid tier (Premium **or** Elite **or** Legend), so a
  paying member of any level can always post. (The reasoning: Learning Record 0015.)

## More terms that recur in sessions

- **SSR (server-side rendering)** — the page's HTML is assembled on the server and sent ready-to-show, so
  it appears fast and search engines can read it (versus a blank page that fills in later via JavaScript).
- **HMR (hot module reload)** — while developing, saving a file updates the running page instantly with
  no full reload.
- **Turbopack** — the fast dev/build engine Next.js uses here (`next dev --turbo`).
- **middleware** — code that runs on *every* request before the page does. Here it handles login
  redirects and attaches the CSP nonce. File: `apps/web/proxy.ts`.
- **R2** — Cloudflare's file storage (an S3-style bucket) where BBL keeps uploaded images and videos.
- **oRPC** — the type-safe way the browser calls server functions in this repo (`server/orpc/*`); it's
  replacing the older `next-safe-action`.
- **Better Auth** — the login/session library the app uses (magic links, social sign-in, sessions).
- **CRAP score** — a code-quality number ("Change Risk Anti-Patterns") from `fallow`: high means a
  function that is both complicated *and* poorly tested — i.e. scary to change safely.
- **AdminCollection** — the one standard admin list-page shape (a searchable, sortable data table) that
  every admin screen conforms to instead of being hand-built each time (ADR 0045).
- **RankEntry** — the single current model for "what belt/rank a member holds." It replaced the older
  `RankAward`.
- **MAB (mobile action button)** — the floating "＋" button on mobile that opens create-actions (new
  post, new technique).
- **Sequence skill / SSS (scripted-sequence-skill)** — a skill whose body is an ordered step list
  packaging OTHER skills/protocol steps for a given flow, so dispatch prompts shrink to "read this
  file + lane specifics." First two: `.claude/skills/seq-lane-build/` (worktree build lane) and
  `seq-review-wave/` (parallel review). Thin pointers by law (D-023) — the G-023 recipe cards
  become their source docs. Example: SESSION_0582's overnight fan-out stub cites `/seq-lane-build`
  instead of restating ~60 lines of invariants per lane.
- **/rr (research-recommend)** — the "research first, recommend, don't build" move: graphify
  prior-art query → read what exists → options → one recommendation → route to a ledger. Grounded
  in `docs/protocols/review-recommend.md`; planned as `/seq-research-recommend` (SESSION_0584).
  Example: SESSION_0582's /rr found `scripts/auto-session.sh` before anyone rebuilt an overnight
  driver.
- **/graphify-query · /graphify-explain** — skills wrapping the Graphify-first law: budget-capped
  graph query instead of repo-wide grep (query the CANONICAL checkout — a worktree graph reads 0
  nodes by design), and subsystem explanation from graph hubs instead of bulk-reading.
- **PM_Planning_Lane / AM_Coffee_Merge_Review** — the two overnight session recipe cards (G-023
  children, planned SESSION_0582): PM = evening grill pins every operator fork, pre-stages a
  staged-stub orchestrator + reservation branches; overnight lanes build commit-local; AM = the
  merge-review half — completion-triggered pre-review sweep, ntfy push, push gate held for the
  operator's coffee word.
- **State of the Dojo** — the read-only operator dashboard artifact projecting ledgers + SESSION
  frontmatter (work board, goal belt-ladders, risk watch; brand tab = skin × lane filter). Name
  pending operator ratification (Brandon pass, SESSION_0582). Projection only — the ledgers stay
  the source of truth; `/app/loop-board` stays the editable board.

## Cross-references

- [Closing ritual](../../rituals/closing.md) — the optional spike that points here.
- [SESSION_0350](../../sprints/SESSION_0350.md) — the session these first entries came from.
- [Learning record 0002](../../learning/ddd/learning-records/0002-shared-kernel-in-practice.md) — the kernel, taught.
