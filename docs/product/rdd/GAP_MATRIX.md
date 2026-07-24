---
title: "RDD — Brand Deploy Gap Matrix (vs the BBL shipped baseline)"
slug: rdd-gap-matrix
type: report
status: active
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0633
pairs_with:
  - docs/product/rdd/brand-brief.md
  - docs/product/rdd/phase14-local-deployment-checklist.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
backlinks:
  - docs/sprints/SESSION_0633.md
tags:
  - rdd
  - gap-matrix
  - brand-deploys
  - launch
---

# RDD — Brand Deploy Gap Matrix

**As of `main@417a7be9`, 2026-07-23.** What BBL has, as the shipped deployed brand, that RDD
(`apps/rdd`, production target `ronindojodesign.com`) lacks.

> **⚠️ Point-in-time snapshot — parallel mutation in flight.** SESSION_0635 is mutating
> `apps/rdd` in parallel with this analysis. Rows describe the tree at `main@417a7be9`;
> the merge owner reconciles anything 0635 lands.

**Method.** The BBL story matrix (`docs/product/black-belt-legacy/GAP_MATRIX.md`, updated
2026-06-17) was used for its axis vocabulary ONLY — it is known-stale and no status was copied
forward. Every BBL baseline cell below was re-derived from the repo at `main@417a7be9`
(route-tree enumeration, `package.json`/`vercel.json`/workflow/prisma reads) plus a live
spot-check of `https://blackbeltlegacy.com`.

> **🔴 Live spot-check result (2026-07-24 ~04:15 UTC):** every public BBL page probed
> (`/`, `/blog`, `/directory`, `/lineage`, `/techniques`, `/posts`) returned **HTTP 500** from
> the live Vercel deployment `dpl_6cZhc9CU93mo8dGBF2ipyZQvqtcz` — a genuine Next.js error shell,
> not bot-blocking (security headers, CSP Report-Only, Stripe frame/form-action CSP entries, and
> R2 image hosts all present in the 500 response). BBL's baseline below is therefore
> **code-verified but NOT live-confirmed**; the site was in a site-wide outage at check time.

**Launch scope (binding, per brand-brief + operator direction):** RDD MVP = **marketing surface
+ intake**. It is a services-studio site, not a BBL-feature-parity app. "Not needed for a
marketing site" is a valid answer and is used honestly below — this matrix is deliberately
asymmetric with MMB's.

**Legend — Needed for launch?:** `yes` = blocks ronindojodesign.com launch ·
`later` = post-launch increment · `no` = not part of RDD's product shape.

## Matrix

| Axis | BBL baseline (re-verified @417a7be9) | RDD status | Gap | Needed for launch? |
| --- | --- | --- | --- | --- |
| Deploy unit (Vercel project + domain) | Own Vercel project on `blackbeltlegacy.com`; `apps/web/vercel.json` (workspace install/build + cron) + root `vercel.json` scoped `ignoreCommand`. Live deploy exists (currently 500ing — see spot-check). | `apps/rdd/vercel.json` **committed** (SESSION_0625): workspace-aware install/build, `ignoreCommand` scoped to `apps/rdd` + `packages` + root config, md-excluded. **No Vercel project created, no DNS** — phase14 checklist items "Confirm production Vercel project name" and "Confirm ronindojodesign.com DNS access" are unchecked (PL-015, epic #247). | Create Vercel project (Root Directory `apps/rdd`), attach `ronindojodesign.com` + `www`, set env. Config file is ready; the cloud side is the whole gap. | **yes** |
| Public marketing surface | Full public site: ~35 `(web)` route groups (home, about, blog, directory, lineage, techniques, events, merch, join funnel…). | **Built** — single-page marketing home shipped (SESSION_0625 Slice B3): hero, kernel→brand→app model, engagements, BBL-only proof section, founder, contact. Copy governed by `brand-brief.md` (no numbers, no unsigned client names). Self-hosted fonts. | None for the single-pager. More pages (work, writing) are post-launch. | — (built) |
| Intake / leads module | Full leads pipeline: `lib/leads-pipeline`, `server/web/lead`, admin `/app/leads` + `/app/leads-pipeline` board. | **Planned — SESSION_0632 in flight.** The brand-agnostic intake module is being built in parallel; RDD is its **first mount** (pinned decision). Today the page has `mailto:` CTAs only. | Mount the 0632 module when it lands; until then the only intake channel is email. | **yes** (RDD MVP = marketing + intake) |
| Database (Prisma) | Root `prisma/` — 134 models, Neon prod, `prebuild → migrate deploy` auto-migration. | **None** (no `prisma/`, `vercel.json` comment explicitly notes "no db:generate — RDD has no Prisma schema yet"). Pinned: RDD gets its **own DB** (ADR 0038) — never a share of BBL's. | Provision RDD's own DB when the 0632 intake mount needs persistence; add `db:generate` + migrate-on-deploy to `vercel.json` at that point (the comment documents how). | **yes — unconditional** (SESSION_0633 pinned decision 3: RDD gets its own DB per ADR 0038 + the operator's "their own DBs" directive; provisioning timing operator-gated, schema shaped by the 0632 intake mount) |
| Auth (Better Auth) | Better Auth: magic-link + one-time-token + admin plugin, roles, dev-login smoke. | None. | Only needed if an authenticated inbox/admin surface mounts on RDD (leads could also route to email/an existing surface — 0632 decides). | later |
| Payments (Stripe) | Live-mode Stripe: Premium/Elite entitlement keys, checkout + billing portal, `api/stripe/webhooks`, `/app/billing/monitoring`. | None. | RDD sells services (engagements are quoted, not self-serve checkout). | **no** — not part of a marketing+intake site |
| Email (Resend) | Resend + react-email template library (`apps/web/emails/*`), domain-scoped key. | None. | Intake without a "new lead" notification is a dead letterbox — needs a `ronindojodesign.com`-scoped Resend key (BBL memory: keys are sender-domain-scoped, a foreign key 403s) when 0632 mounts. | **yes with intake** (notification path); templates later |
| Media / uploads | R2 object storage + the ONE uploader family (`components/web/uploader/*`), MinIO local. | None; static assets only. | None for launch scope. | no |
| Blog / content | Dual surface: `Post`→`/blog` (staff) + `CommunityPost`→`/posts` (members), RSS, sitemap. | None. | Content marketing surface is a real future want for an agency site, not a launch gate. | later |
| Admin surface | `/app` AdminCollection suite — ~45 admin areas on the conformed data-table pattern. | None. | Depends entirely on where 0632 routes leads; do not build an RDD admin ahead of that decision. | later |
| CI gates | `ci.yml` (typecheck + oxlint + unit incl. invariant guards) + `playwright.yml` (chromium full, firefox/webkit subset). BBL paths excluded from Products CI. | **Covered by `clients-ci.yml` (Products CI)** — `apps/rdd/**` and `packages/**` trigger a per-product job: install in-dir, **typecheck** (required; RDD defines it). Test/lint steps are opt-in and RDD defines neither `test` nor `lint:check` → they skip loudly. | Typecheck-only is proportionate for a static page today; add `test`/`lint:check` scripts when logic lands (0632 mount). | — (adequate); tests **later** |
| E2E | 29 Playwright specs across auth/lineage/directory/admin/stripe/privacy, 3-browser CI matrix, hermetic e2e DB. | None. | A single smoke (home renders + intake submits) belongs with the 0632 mount, not before. | later |
| SEO plumbing | `robots.ts`, `sitemap.ts`, `rss.xml`, `manifest.ts`, OG image route, next-sitemap postbuild. | Metadata + OG/Twitter tags in `layout.tsx` (canonical, metadataBase) — **but no `robots.ts`, no `sitemap.ts`, no favicon/icon, no OG image asset, no `not-found.tsx`**. | A marketing site's job is to be found and to look finished: add robots + sitemap + favicon + a 404 page. Cheap, high-signal. | **yes** (minimal set); OG image asset later |
| Security headers / CSP | Full header set + CSP Report-Only + `/api/csp-report` sink + nonce infra (verified present even on the live 500 response). | Next defaults only. | Static single-pager has minimal surface; revisit when the intake form (a POST surface) mounts. | later (with intake) |
| Brand skin / design tokens | DB-driven `BrandSettings` + ui-kit token contract. | Committed scaffold palette in `app/globals.css` — **explicitly provisional**; the real skin is a deliberate later design-interview slice (documented in `page.tsx`). | Ship on the scaffold palette (that is the ratified plan); brand-skin slice later. | later (by design) |
| Observability / ops | Vercel cron, CSP report sink, billing + storage monitoring pages, ntfy notify stack. | None. | Nothing to observe until intake mounts. | later |

## Launch-blocking summary

**3 hard launch-blocking rows:** deploy attach (Vercel project + DNS), intake mount (0632 in
flight), minimal SEO/app-shell set (robots + sitemap + favicon + 404).
**2 conditional rows tied to the 0632 module's shape:** own DB (if intake persists), Resend
notification key (intake needs a delivery path).
Everything else is honestly `later` or `no` — RDD is a near-empty shell **on purpose**; its MVP
is a marketing surface + intake, not BBL feature parity, and this matrix is not padded to look
symmetric with MMB's.
