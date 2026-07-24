---
title: "Mammoth Build CRM — Brand Deploy Gap Matrix (vs the BBL shipped baseline)"
slug: mmb-gap-matrix
type: report
status: active
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0633
pairs_with:
  - docs/product/mammoth-build/PRD.md
  - docs/product/mammoth-build/CONTEXT.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
backlinks:
  - docs/sprints/SESSION_0633.md
tags:
  - mammoth
  - mmb
  - gap-matrix
  - brand-deploys
  - launch
---

# Mammoth Build CRM — Brand Deploy Gap Matrix

**As of `main@417a7be9`, 2026-07-23.** What BBL has, as the shipped deployed brand, that MMB
(`clients/mammoth-build-crm`, target domain `mammothmb.com` — greenfield attach) lacks.

**Method.** The BBL story matrix (`docs/product/black-belt-legacy/GAP_MATRIX.md`, updated
2026-06-17) supplied axis vocabulary ONLY — it is known-stale and no status was copied forward.
Every BBL baseline cell was re-derived from the repo at `main@417a7be9` (route enumeration,
config/workflow/prisma reads) plus a live spot-check of `https://blackbeltlegacy.com`.

> **🔴 Live spot-check result (2026-07-24 ~04:15 UTC):** all probed BBL public pages (`/`,
> `/blog`, `/directory`, `/lineage`, `/techniques`, `/posts`) returned **HTTP 500** from live
> Vercel deployment `dpl_6cZhc9CU93mo8dGBF2ipyZQvqtcz` — a real Next.js error shell, not
> bot-blocking. BBL's baseline is code-verified but was NOT live-confirmed at check time.

**Shape of this matrix:** MMB is a **working app** — DB-backed pipeline board, sales cockpit,
lead-sheet import, job orders, build-photo documentation, its own Better Auth — missing the
**deploy attach + pre-public hardening**, not features. Expect short gaps, not an empty column.

**Legend — Needed for launch?:** `yes` = blocks a public `mammothmb.com` deploy ·
`later` = post-attach increment · `no` = not part of MMB's product shape.

## Matrix

| Axis | BBL baseline (re-verified @417a7be9) | MMB status | Gap | Needed for launch? |
| --- | --- | --- | --- | --- |
| Deploy unit (Vercel project + domain) | Own Vercel project live on `blackbeltlegacy.com`; workspace-aware `vercel.json` pair (app + root `ignoreCommand`). | `vercel.json` **committed** (standalone shape: in-dir `bun install --frozen-lockfile`, `db:generate && build`, dir-scoped `ignoreCommand`). **No Vercel project, no domain** — `mammothmb.com` is a greenfield attach; Neon staging/prod env vars are operator-gated (`.env.example` TASK_03). | Create the Vercel project, attach `mammothmb.com`, set `DATABASE_URL`/`DIRECT_URL`/`BETTER_AUTH_SECRET`/`BETTER_AUTH_URL`. | **yes** |
| Database (Prisma) | Root `prisma/` 134 models on Neon; **`prebuild → prisma migrate deploy`** applies committed migrations on every prod build. | **Own DB per ADR 0038**: `prisma/schema.prisma` — 14 models (auth quartet, TeamMember, Contact, Company, Project, Activity, Quote, Product, LineItem, Invoice, BuildPhoto) + 9 enums, 3 committed migrations, idempotent seed, `prisma.config.ts` normalizes Neon pooler for migrate. | Two gaps: (1) provision the Neon prod DB; (2) **no migrate-on-deploy** — MMB's `buildCommand` runs `db:generate && build` with **no `migrate deploy` step** (BBL runs it in `prebuild`). First deploy lands on an empty, un-migrated DB unless run manually. | **yes** |
| Auth (Better Auth) | Magic-link + one-time-token + admin plugin, role audit, dev-login smoke. | **Own Better Auth instance** (ADR 0038 D5): email+password, owner/member roles via admin plugin + access control; all writes gated by `requireOwner` in `lib/actions.ts`. | **Read-side gate missing:** `/app/*` pages and layout have **no session check and no middleware** — deployed publicly, all CRM data (contacts, projects, activities) is readable anonymously; only writes are gated. Also confirm sign-up is closed (no `disableSignUp` found in `lib/auth.ts` — Better Auth default leaves email+password registration open; unverified, check before deploy). | **yes** |
| Public marketing surface | Full public site (~35 route groups). | **Built** — landing page recreated + polished per Desi spec (mirror hero, micro-animations, building-types grid, inquiry form, reduced-motion + focus-ring a11y). | **Inquiry form is localStorage-only** — `InquiryForm.onSubmit` writes to the visitor's own device (`mammoth:submitted`); no server action, no Lead row. The site's own copy admits it ("stored on your device only"). Public inquiries never reach the CRM. | **yes** |
| Leads / intake module | Full leads pipeline + admin board (`lib/leads-pipeline`, `/app/leads`, `/app/leads-pipeline`). | **Built for import**: `/app/leads` lead-sheet ingestion (CSV/JSON parse + preview + dedupe report, confirmed server-side commit via the ONE matcher in `contact-match.ts`), mid-session add-lead on the board. | The missing half is the public-form→lead wire (previous row) — internal intake works. | — (built); form wire counted above |
| CRM core (pipeline / sales / orders) | Nearest BBL analog: the `/app` admin suite. | **Built and DB-backed**: pipeline board Lead→Order with confirmed-order + at-risk counts, sales cockpit (due queue → roster → contact workspace → one owned Next Action), job order form, project detail with stage gates + order-number stamping. | Polish-level only; core loop works. | — (built) |
| Payments (Stripe) | Live-mode Stripe, entitlement-keyed tiers, webhooks, billing monitoring. | Quote/Invoice/Product/LineItem **modeled** in the schema; no Stripe/processor integration (explicitly out of the tracer per README). | Invoice send/collect is a client-scope decision, not a deploy gate. | later |
| Email (Resend) | Resend + react-email template library, domain-scoped key. | **None** — deliberately: auth is password-based *because* MMB has no email infra (documented in `lib/auth.ts`). | No transactional email also means **no password reset path**; acceptable for an operator-provisioned two-role internal tool, but note it. Add a `mammothmb.com`-scoped key when inquiry-notification or invoicing lands. | later |
| Media / uploads | R2 object storage + the ONE uploader family; MinIO local. | `BuildPhoto` model + `PhotoDocumentation` UI; `lib/image.ts` downscales to **data-URL thumbnails** (localStorage-quota-era design). Full-res originals + S3/R2 offload explicitly deferred. | Object storage for build photos (schema + UI already in place to receive it). | later |
| Blog / content | `Post`→`/blog` + `CommunityPost`→`/posts`, RSS. | None. | A construction CRM does not need a blog; landing-page content is code-owned (`lib/content.ts`). | no |
| Admin surface | AdminCollection pattern, ~45 areas. | The CRM **is** the admin surface (single-tenant internal tool); owner/member role split exists. | None beyond the read-gate row. | — (n/a by shape) |
| CI gates | `ci.yml` (typecheck + oxlint + unit + invariant guards) scoped to apps/web. | **Products CI (`clients-ci.yml`)**: in-dir install, conditional `prisma generate`, **typecheck (required)** + **unit tests run** (MMB defines `test`; 6 `lib/*.test.ts` suites — board-config, contact-match, lead-commit, lead-ingest, lead-source, sales-cockpit — gate every PR since WL-P3-56). Lint skips loudly (no `lint:check` script). | Add `lint:check` (oxlint) to close the lint gap. Note: the "clients are typecheck-only" line in older docs/memory is **stale** — tests now gate. | later (lint) |
| E2E | 29 Playwright specs, 3-browser matrix, hermetic e2e DB. | None; the proven MMB UAT recipe is manual (scratch-DB + fixture-login + in-page-fetch). | A deploy-smoke (login → board renders → add lead) is the first post-attach increment. | later |
| SEO plumbing | robots/sitemap/RSS/manifest/OG route + next-sitemap. | Root `metadata` in `app/layout.tsx` only; no robots.ts/sitemap.ts/OG asset. | Landing page should carry the minimal set at attach (it is a client's public face). | later |
| Security headers / CSP | Full header set + CSP Report-Only + report sink + nonces (verified live). | None (Next defaults). | Add a basic header set with the deploy attach; full CSP later. | later |
| Brand skin / design tokens | DB-driven `BrandSettings` + ui-kit tokens. | CSS-variable palette in `globals.css`, ui-kit consumed via `file:` link + postinstall symlink. Palette **provisional** — swap when Mammoth's brand hex is confirmed (one-file change by design). | Client sign-off on the palette; mechanical swap. | later |
| Observability / ops | Cron, CSP sink, billing/storage monitoring, ntfy. | None. | Nothing until it is deployed. | later |

## Launch-blocking summary

**4 launch-blocking rows:** (1) Vercel project + `mammothmb.com` attach + env, (2) prod DB
provisioning **plus the missing migrate-on-deploy step** in `vercel.json`, (3) read-side auth
gate on `/app/*` (data is anonymously readable as built) + confirm sign-up is closed, (4) wire
the public inquiry form into the CRM as real Lead/Contact rows (today it dead-ends in the
visitor's localStorage).

Everything else is polish or scope-deferral on a working app — the inverse of RDD's matrix, as
expected: MMB has the product and lacks the deploy; RDD has the deploy config and lacks nearly
everything else by design.
