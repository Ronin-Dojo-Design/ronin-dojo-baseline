---
title: Repo Code Glossary
slug: repo-code-glossary
type: reference
status: active
created: 2026-06-06
updated: 2026-06-07
last_agent: claude-session-0355
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
- **lint / biome** — checks code style and formatting for consistency. **biome** is the specific tool.
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
- **LineageNode** — the person identity point inside lineage data.
- **LineageTreeMember** — a person's membership in a specific lineage tree, including visual parent, sort order, and public display flags.
- **DataSelect** — the id/slug-aware `Select` wrapper (`components/common/data-select.tsx`). Takes `options:{value,label}[]` and forwards a `value→label` map to Base UI `Select.Root` so a preset id renders its label, not the raw cuid (the systemic WL-P1-7 fix). Use it for any Select whose value is an id/slug. SESSION_0355 added an optional per-option `content?: ReactNode` (resolved by `dataSelectRowContent`) that renders a **rich dropdown row** (e.g. a belt swatch) while `label` still drives the collapsed trigger, typeahead, and a11y — so the prior ReactNode-label exception is removed and `tool-filters` is back on `DataSelect`. (For *searchable* person/org pickers use `ComboboxSelector`, not `DataSelect`.)
- **BeltSwatch** — the small belt-color swatch primitive (`components/common/belt-swatch.tsx`), driven by `Rank.colorHex` data via a data-bound SVG `fill` (never a hardcoded colour or inline `style`). The reusable consolidation of the per-surface bespoke belt-color treatments.
- **Person-presentation contract** — the role-agnostic rule that a person is rendered the same everywhere (avatar `passport.avatarUrl ?? user.image` + name + belt/rank + disciplines + location), regardless of role (member/student/instructor/owner). "The instructor avatar should not be just for instructors." Staged in `petey-plan-0356`.
- **Register vs Claim** — two distinct directory entry points. **Register** = a visitor self-creates a *new* entity (org via `/organizations/new`; person via signup→onboarding). **Claim** = a user takes ownership of an *existing* owner-less/placeholder entity (`ProfileClaimRequest`). The unified "search-first → claim if it exists, else create" funnel (the Dirstarter submit pattern, to govern all registers/claims/invites) is staged in `petey-plan-0356`.
- **ProfileClaimRequest** — a request to take ownership of an "unclaimed" directory subject, reviewed by an admin (mirrors `LineageClaimRequest` but for the directory). Subject is an owner-less `Organization` or a placeholder-`User` `DirectoryProfile`. Distinct from a lineage claim (which targets a `LineageNode` on a tree).
- **Claimable** — a directory subject that can be claimed: an `Organization` with no `ownerId`, or a `DirectoryProfile` whose `User.isPlaceholder` is true (a legacy import with no login account).
- **Claim teaser** — the public "mock profile" shown on `/directory/[slug]` for a claimable placeholder person instead of an empty profile/404: a `ProfileHero` preview + skeleton sections + a "Claim this profile" CTA, designed to entice the real owner to claim it.
- **ProfileHero** — the shared presentation hero (`components/web/profile/profile-hero.tsx`) used by the claim teaser and the owner live-preview in the create/edit forms. Renders only display values passed in (no data fetch, no private fields).

## Cross-references

- [Closing ritual](../../rituals/closing.md) — the optional spike that points here.
- [SESSION_0350](../../sprints/SESSION_0350.md) — the session these first entries came from.
