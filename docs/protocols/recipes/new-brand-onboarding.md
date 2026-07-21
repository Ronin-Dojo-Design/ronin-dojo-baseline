---
title: "Recipe — New-Brand Onboarding (scaffold + DB + deploy + email)"
slug: recipe-new-brand-onboarding
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
pairs_with:
  - docs/protocols/recipes/new-brand-setup.md
  - docs/runbooks/onboarding/new-client-runbook.md
  - docs/runbooks/database/per-app-db-separation.md
  - docs/protocols/recipes/lane.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - onboarding
  - recipe
  - deploy
---

# Recipe — New-Brand Onboarding

The mechanical spine: turn a pinned [setup](new-brand-setup.md) fork set into a live (or locally-live)
app — scaffold + own DB + deploy + email. Distilled from **proven** machinery
(`scripts/new-client-scaffold.ts` [ran for Mammoth], [`new-client-runbook.md`](../../runbooks/onboarding/new-client-runbook.md),
[`per-app-db-separation.md`](../../runbooks/database/per-app-db-separation.md), the deploy + Resend
runbooks). `⛔` = operator-gated (show, then run on the word). Runs as a build [lane](lane.md).

## Persona pack

- **Cody** — builds the scaffold + gates + self-review.
- **Giddy** — structural sign-off (home pattern, disjointness, DB isolation).
- **Doug** — verifies (a new deploy unit; root gates never cover a `clients/*` product).
- **Operator** — gates every `⛔` step; one push at close.

## Overlays — pick the home pattern (decided at intake)

| Axis | `apps/<name>` (first-party peer) | `clients/<name>` (standalone) |
| --- | --- | --- |
| ui-kit | `workspace:*` (clean symlink) | `file:../../packages/ui-kit` + `link-ui-kit.mjs` postinstall (Turbopack break) |
| Lockfile | shared root `bun.lock` | own `bun.lock` |
| Scaffold script | hand-scaffold off `apps/baseline` (script is `clients/`-hardcoded) | `bun scripts/new-client-scaffold.ts <name>` |
| CI trigger | **3 edits** (`clients-ci.yml` paths + `ci.yml`/`playwright.yml` paths-ignore) | auto (`clients/**`) |

## Step sequence

1. **Scaffold the app dir** — peer: copy `apps/baseline` shape (package.json `workspace:*`,
   `next.config` `transpilePackages` + `turbopack.root`, tsconfig, postcss); standalone: run the script.
2. **Wire deps** — ui-kit per pattern · `@prisma/client`+`prisma` · `@prisma/adapter-pg`+`pg` when it hits the DB · `db:*` scripts.
3. **Install** `⛔` — peer: root `bun install`; standalone: in-dir `bun install` (verify root lock unchanged).
4. **CI wiring** (peer only) — add `<app>/**` to `clients-ci.yml` `on.paths` **and** to `ci.yml` +
   `playwright.yml` `paths-ignore` (else no Products-CI trigger + wasteful BBL-gate fire). Ensure `typecheck` script.
5. **Own DB** `⛔` — `schema.prisma` (provider-only datasource) · copy `prisma.config.ts` from Mammoth ·
   `.env`/`.env.example` → `<name>_dev` · `createdb` · `migrate dev --name init` (**only** for a
   not-yet-shared local DB — hand-author once shared / always in prod) · **prove isolation**:
   psql table-snapshot **diff** on every other product DB (byte-identical) + new tables only in `<name>_dev`.
6. **Brand tokens** — swap `app/globals.css` starter vars for the brand's (from the [design interview](new-brand-interview-design.md)).
7. **Deploy — Neon** `⛔` — new Neon project; pooled `DATABASE_URL` + direct `DIRECT_URL` (same DB).
8. **Deploy — Vercel** `⛔` — new project, Root Dir = the app dir; author `<app>/vercel.json` with a
   scoped `ignoreCommand` (`git diff --quiet HEAD^ HEAD -- <app> packages bun.lock package.json vercel.json ':(exclude)*.md' ':(exclude)*.mdx'`);
   set env in **Production + Preview**. First deploy → Production before attaching a domain.
9. **Domain** `⛔` — Vercel Domains → apex + www; registrar zone edits in one batch; `dig` verify; SSL auto.
10. **Email** `⛔` — Resend domain + **domain-scoped "Sending" key** (`RESEND_API_KEY` +
    `RESEND_SENDER_EMAIL=welcome@<domain>`); a cross-brand key 403s silently.
11. **Env parity** — `bun scripts/check-vercel-env-parity.ts` green.
12. **Docs + governance** — `docs/product/<brand>/PRD.md` + `STORIES.md`; goals-ledger row; wiki index.
13. **Push** `⛔` — one push at close.

## Gotcha floor (confirmed in-tree)

- **Vercel Sensitive vars pull empty** → gitignored `.env.prod` overlay + `bun --env-file`, never a CLI pull.
- **Prod migrate-only** (prebuild → `migrate deploy`); never `migrate dev`/`db push`/`--accept-data-loss` on prod.
- **`ignoreCommand`** must watch `<app> packages bun.lock package.json` (a kernel/dep bump must rebuild the app; docs-only must not).
- **First `apps/*` peer to deploy** confirms Root-Dir / two-`vercel.json` topology on the **live dashboard**, not the tree.

## Minimum-output / done-means

1. Products-CI green on the new app (peer: after the 3 CI edits); root gates untouched or green.
2. **DB isolation proof** — other product DBs byte-identical; new tables only in `<name>_dev`.
3. `next build <app>` green off `git diff origin/main..HEAD` (capture real `$?`, never `| tail`).
4. Env parity green; (cloud slices) live URL + email smoke.

## Session stub

```yaml
type: session--build
lane: <brand-slug>
recipe: new-brand-onboarding
goal_ids: [G-NNN]
```

## Worked example — RDD (SESSION_0598 → staged `session-0601-rdd-scaffold`)

Slice A = `apps/rdd` peer off `apps/baseline` + hello-route + the 3 CI edits → Products-CI green
(local, no cloud). B1 = `rdd_dev` + isolation proof. Cloud (Neon/Vercel/domain/Resend) = separate gated slice.

## Cross-references

- [`new-brand-setup.md`](new-brand-setup.md) · [`lane.md`](lane.md) (the build-lane sequence this runs as).
- [`new-client-runbook.md`](../../runbooks/onboarding/new-client-runbook.md) · [`per-app-db-separation.md`](../../runbooks/database/per-app-db-separation.md) · deploy + Resend runbooks under `docs/runbooks/`.
