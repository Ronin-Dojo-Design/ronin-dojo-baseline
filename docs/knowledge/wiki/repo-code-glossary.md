---
title: Repo Code Glossary
slug: repo-code-glossary
type: reference
status: active
created: 2026-06-06
updated: 2026-06-06
last_agent: claude-session-0350
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

## Code-quality tools

- **typecheck** — runs the TypeScript checker to catch type mistakes *before* the code runs.
- **lint / biome** — checks code style and formatting for consistency. **biome** is the specific tool.
- **wiki-lint** — the same idea, but for the documentation (`docs/`).
- **fallow** — a tool that finds **dead code** (code nothing uses anymore). Trialed this session via
  `npx fallow audit`; it caught two unused pieces that were then deleted.
- **graphify** — a repo "map" tool: ask it about a topic and it lists the related files, so you don't
  have to search blindly. See [graphify-repo-memory](../../runbooks/dev-environment/graphify-repo-memory.md).

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
- **dead code / orphaned** — code that nothing else uses. This session deleted the orphaned
  `components/web/members/*` (it was unreachable behind a redirect).
- **drift / drift register** — a written record of places where the docs and the code disagree, so they
  don't get silently lost. Example: `D-020` in [drift-register](drift-register.md).

## Cross-references

- [Closing ritual](../../rituals/closing.md) — the optional spike that points here.
- [SESSION_0350](../../sprints/SESSION_0350.md) — the session these first entries came from.
