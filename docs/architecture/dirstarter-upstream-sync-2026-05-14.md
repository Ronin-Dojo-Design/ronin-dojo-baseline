---
title: "Dirstarter Upstream Sync Snapshot - 2026-05-14"
slug: dirstarter-upstream-sync-2026-05-14
type: architecture
status: active
created: 2026-05-14
updated: 2026-05-14
last_agent: codex-session-0164
pairs_with:
  - docs/architecture/dirstarter-baseline-index.md
  - docs/knowledge/wiki/dirstarter-uplift-backlog.md
  - docs/protocols/project-log.md
  - docs/sprints/SESSION_0164.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Dirstarter Upstream Sync Snapshot - 2026-05-14

## Purpose

Capture the current Dirstarter upstream state before Ronin ports anything from it. This is a gate document: it proves the local Dirstarter reference is updated, records the size of the upstream delta, and defines how Ronin should pull the changes in without a bulk merge.

## Local checkout state

| Field | Value |
| --- | --- |
| Local checkout | `/Users/brianscott/Local Sites/DirStarter /dirstarter_template` |
| Remote | `https://github.com/dirstarter/dirstarter.git` |
| Previous local upstream base | `c42e8bb` |
| Current upstream head | `7e724b6` (`feat: add Rejected and Deleted tool statuses`) |
| Clean upstream branch | `upstream/dirstarter-main-20260514` tracks `origin/main` |
| Preserved local branch | `backup/local-graphify-ignore-20260514` at `29a2232` |
| Local-only ignore | `.graphify/` added to the Dirstarter checkout's `.git/info/exclude` |

The old Dirstarter `main` branch still points at the local Graphify ignore commit and remains `ahead 1, behind 252`. It was not force-reset. The clean branch above is the current reference branch for upstream review.

## Upstream delta

Compared with `c42e8bb`, upstream `origin/main` now contains:

- 252 commits.
- 437 files changed.
- 14,606 insertions and 10,676 deletions.

Top-level impact by file count:

| Area | Files changed |
| --- | ---: |
| `components/` | 141 |
| `app/` | 117 |
| `server/` | 69 |
| `lib/` | 28 |
| `emails/` | 12 |
| `prisma/` | 11 |
| `messages/` | 11 |
| `hooks/` | 8 |
| `config/` | 8 |
| `services/` | 5 |

## Major upstream changes

| Lane | Upstream change | Ronin implication |
| --- | --- | --- |
| Framework/toolchain | Next `16.2.3`, React `19.2.5`, Bun `1.3.11`, TypeScript `6.0.2`, Prisma `7.7.0`, `oxlint`/`oxfmt` replacing Biome | Ronin already has production Vercel complexity. Toolchain changes need their own lane with build proof before adoption. |
| Server API | `next-safe-action` removed; `oRPC` + TanStack Query routers added under `/api/rpc` | Do not mass-replace Ronin server actions. This requires an ADR or explicit migration plan because Ronin has brand-scoped action clients and audit behavior. |
| UI primitives | Base UI render-prop style, `Field`, `ButtonGroup`, `tool-status`, data-table helpers, `tailwind-variants` | Good candidate for small porting lanes after inventory. Avoid mixing primitive migration with feature work. |
| Data model | Tool tiers/statuses, bookmarks, posts, report enum, generated IDs/slugs, several migrations | High collision risk with Ronin schema and martial-arts domain models. Port only if tied to a Ronin feature need. |
| Content/SEO | Database-driven blog, native sitemap routes, RSS route split, `next-sitemap` removal | Candidate lane after production smoke. Must preserve Ronin brand-domain behavior and Vercel root config. |
| Env/deploy | `DATABASE_PUBLIC_URL`, `REDIS_URL`, AI Gateway variables, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`; `RESEND_AUDIENCE_ID`, Upstash REST vars, and Google Generative AI key removed upstream | Requires runbook/env audit before any adoption. Especially relevant after SESSION_0161/0163 Vercel and Resend work. |
| Vendor APIs | Stripe SDK/API updated to `2026-04-22.dahlia`; Resend SDK contact shape updated | Must be reviewed against Ronin's existing Stripe membership and Resend magic-link/email flows. |
| Admin routing | Admin CRUD moved toward ID routes and shared router/table patterns | Ronin already has ADR 0012 and many domain admin pages. Port by pattern, not by direct file copy. |

## Ronin stance

Do not bulk merge Dirstarter upstream into Ronin. The Dirstarter template and Ronin app have diverged in ways that are intentional:

- Ronin has brand/hostname resolution and production multi-domain deployment.
- Ronin has martial-arts domain models, school operations, programs, curriculum, tournaments, memberships, merch, waivers, and audit trails.
- Ronin's current production build and Vercel config were stabilized in SESSION_0161.
- Ronin still uses `next-safe-action` patterns and brand-scoped server clients in many places.

The correct move is lane-based porting. Each lane should have a source diff, Ronin target files, risk note, and verification gate before implementation.

## Recommended porting lanes

1. **Upstream baseline map lane.** Refresh `dirstarter-baseline-index.md` from the clean upstream branch and mark old sections that are no longer current.
2. **Env/deploy lane.** Compare upstream `.env.example`, `env.ts`, `services/db.ts`, `vercel.json`, sitemap/RSS changes, and Ronin's Vercel production setup. Do not change production env vars until the runbooks are updated.
3. **Low-risk UI primitive lane.** Evaluate `Field`, `ButtonGroup`, data-table helpers, `data-required` labels, and select small Ronin surfaces for porting.
4. **Vendor SDK lane.** Review Stripe and Resend SDK/API changes against Ronin membership, checkout, webhook, and email flows.
5. **API architecture lane.** Decide whether oRPC is a future Ronin direction. This requires an ADR because it affects action clients, brand scoping, audit logging, tests, and UI mutation patterns.
6. **Content/SEO lane.** Review native sitemap/RSS and database blog migration after production user-journey smoke.
7. **Schema/content lane.** Review bookmarks, posts, tool statuses/tiers, CUID2, and tier priority only when a Ronin product feature needs them.

## Gates before code porting

- One session per lane unless the lane is explicitly split smaller.
- No mixed toolchain + schema + UI migration in the same session.
- Every lane must update this snapshot or a successor port map with source commit and target files.
- Any env variable change must update deployment/runbook docs and Vercel production notes.
- Any route/API architecture change must include local typecheck/build and a production-risk note.
- Browser/UI lanes need Playwright or equivalent visual/interaction proof.

## Next action

Open a dedicated Dirstarter port-planning session before changing Ronin runtime code. The first useful task is to refresh the Dirstarter baseline index from upstream `7e724b6` and turn the lanes above into prioritized Ronin work packages.
