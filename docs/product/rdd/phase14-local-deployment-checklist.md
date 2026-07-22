---
title: "RDD Phase 1–14 Local Deployment & Port/Lift Checklist"
slug: rdd-phase14-local-deployment-checklist
type: reference
status: active
created: 2026-07-22
updated: 2026-07-22
last_agent: petey-session-0616
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/knowledge/wiki/goals-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - rdd
  - phase14
  - deployment
source_note: "Operator-provided from Baseline_Vault; imported SESSION_0616 as the PL-015 source of truth. Master epic #247 · parallel epics #248-253."
---

# RDD DirStarter Local Deployment and Phase 1–14 Port/Lift Checklist

## /bow-in

**Jetty intent:** Build `ronindojodesign.com` from the current Ronin DirStarter-derived source of truth as a React/Next.js-first, typed, testable, Vercel-deployable product. Port proven behavior from the legacy monorepo and Phase 1–14 artifacts without porting legacy implementation debt.

## Canonical repositories

- **Target/SOT:** `Ronin-Dojo-Design/ronin-dojo-baseline`
- **Legacy/reference:** `Ronin-Dojo-Design/ronin-dojo-monorepo`
- **Master GitHub epic:** `#247`
- **Parallel epics:** `#248–#253`

> The connected GitHub installation contains `ronin-dojo-baseline`; no repository named `ronin-baseline-app` was found. Confirm whether that was a local folder name or an intended future rename.

---

# 0. Decide the app boundary before touching code

Choose exactly one:

### Option A — Recommended: new RDD app in the existing workspace

```text
apps/
  web/          # current Black Belt Legacy app until split is complete
  rdd-web/      # new ronindojodesign.com app
packages/
  ui-kit/
  domain/
  client-api/
  config/
```

Use this when Black Belt Legacy and RDD need independent routes, deployments, environment variables, Prisma migrations, product cadence, and production domains.

### Option B — RDD as a tenant inside the current app

Use this only when the current app is intentionally a multi-tenant platform and Black Belt Legacy will not be split into its own repository first.

- [ ] Record the decision as an ADR.
- [ ] Confirm whether `ronin-dojo-baseline` will be renamed to `black-belt-legacy`.
- [ ] Confirm whether RDD starts inside this repo before or after that split.
- [ ] Confirm the canonical local hostname: `ronindojodesign.local`, `rdd.local`, or another value.
- [ ] Confirm the production Vercel project name.
- [ ] Confirm `ronindojodesign.com` and `www.ronindojodesign.com` ownership and DNS access.
- [ ] Confirm whether WordPress is migration source, optional adapter, production dependency, or removed.

**Do not begin broad feature lifting until this gate is closed.**

---

# 1. Create the safe local integration branch

```bash
git clone git@github.com:Ronin-Dojo-Design/ronin-dojo-baseline.git
cd ronin-dojo-baseline
git checkout main
git pull --ff-only
git checkout -b epic/rdd-phase14-port-lift
```

- [ ] Confirm clean working tree with `git status`.
- [ ] Record the starting commit SHA.
- [ ] Do not work directly on `main`.
- [ ] Back up uncommitted environment files.
- [ ] Confirm GitHub issue `#247` is the parent epic.

---

# 2. Standardize package-manager truth

The root package declares Bun workspaces. Use Bun unless an ADR explicitly changes it.

```bash
bun --version
node --version
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run build
```

- [ ] Required Node version is installed.
- [ ] Required Bun version is installed.
- [ ] No accidental npm/pnpm/yarn lockfile is introduced.
- [ ] Root scripts run through Bun.
- [ ] Stale pnpm instructions are corrected.

---

# 3. Inventory the current architecture

Create or update:

```text
docs/inventory/
  routes.md
  packages.md
  prisma-models.md
  environment-variables.md
  vercel-config.md
  legacy-source-map.md
  phase-1-14-feature-map.md
```

- [ ] Inventory every route.
- [ ] Inventory server actions and API surfaces.
- [ ] Inventory Prisma models.
- [ ] Inventory Better Auth roles/session behavior.
- [ ] Inventory Stripe products, prices, entitlements, and webhooks.
- [ ] Inventory Resend templates and sender domains.
- [ ] Inventory R2/S3 buckets and media paths.
- [ ] Inventory tenant/organization assumptions.
- [ ] Inventory WordPress/Pods dependencies.
- [ ] Classify each legacy feature: port, redesign, merge, archive, defer.

---

# 4. Scaffold the RDD application boundary

If using `apps/rdd-web`:

- [ ] Copy only reusable DirStarter foundation, not BBL-specific product code.
- [ ] Use package name `@ronin-dojo/rdd-web`.
- [ ] Add root scripts for `dev:rdd`, `build:rdd`, `test:rdd`, and `test:e2e:rdd`.
- [ ] Reuse shared packages rather than copying components.
- [ ] Do not import another app's private route tree.
- [ ] Create `apps/rdd-web/README.md`.
- [ ] Add RDD-specific `.env.example`.
- [ ] Add a distinct Vercel project configuration.

Shared package targets:

```text
packages/
  ui-kit/         # design-system primitives
  domain/         # framework-neutral schemas and policies
  client-api/     # portable client services
  config/         # brand/environment config
  testing/        # fixtures/test helpers
```

---

# 5. Configure local Postgres and Prisma

- [ ] Create a dedicated local RDD database.
- [ ] Never point local RDD at production data.
- [ ] Decide separate database vs shared tenant-aware database.
- [ ] Add migrations for RDD-owned models.
- [ ] Add deterministic seed data.

```bash
cd apps/rdd-web
cp .env.example .env.local
bun run db:generate
bun run db:migrate:deploy
bun run db:seed
```

Seed at minimum:

- [ ] RDD tenant/organization
- [ ] owner/admin
- [ ] staff/project manager
- [ ] client
- [ ] coach/instructor
- [ ] athlete/member
- [ ] public visitor fixtures
- [ ] demo project/case study
- [ ] demo workflow
- [ ] demo content story
- [ ] demo event/division
- [ ] demo sponsor/feed item

---

# 6. Configure environments

## Local

- [ ] `DATABASE_URL`
- [ ] Better Auth secret/base URL
- [ ] OAuth credentials if required
- [ ] Stripe test keys/webhook secret
- [ ] Resend sandbox key
- [ ] R2/S3 development credentials
- [ ] app/public asset URLs
- [ ] feature flags for incomplete surfaces

## Vercel Preview

- [ ] isolated preview database
- [ ] Stripe test mode
- [ ] preview-safe email sender
- [ ] preview media bucket prefix
- [ ] Better Auth preview callbacks
- [ ] no production webhooks

## Production

- [ ] production database
- [ ] production auth URL/secret
- [ ] Stripe live keys/signed webhook
- [ ] verified Resend sender/domain
- [ ] production R2 bucket/CORS
- [ ] analytics/error monitoring
- [ ] Redis/rate limiting

---

# 7. Establish the RDD design system

- [ ] Define color, typography, spacing, radius, shadows, and motion.
- [ ] Reuse shared UI primitives.
- [ ] Create public marketing and private app-shell variants.
- [ ] Add sponsor-safe variants.
- [ ] Add reduced-motion behavior.
- [ ] Add keyboard focus and screen-reader labels.
- [ ] Test phone, tablet, laptop, and wide desktop.

---

# 8. Lift Phase 1–14 in bounded epics

## Epic A — Foundation and deployment (`#248`)
- [ ] app boundary
- [ ] env registry
- [ ] Prisma/database
- [ ] auth
- [ ] Vercel preview/prod
- [ ] CI/E2E baseline

## Epic B — Public site and design system (`#249`)
- [ ] landing
- [ ] services
- [ ] work/case studies
- [ ] products/platform
- [ ] about
- [ ] contact/consultation
- [ ] SEO/sitemap/schema
- [ ] accessibility/responsive pass

## Epic C — Identity, membership, compliance (`#250`)
- [ ] users/profiles
- [ ] organizations/schools
- [ ] roles/capabilities
- [ ] applications/reviews
- [ ] dues/payments
- [ ] certifications/documents
- [ ] eligibility gates
- [ ] reminders/audit

## Epic D — Curriculum, techniques, content (`#251`)
- [ ] curriculum/rank requirements
- [ ] technique/move/concept/flow graph
- [ ] evaluations/quick logs
- [ ] media/R2
- [ ] Content Studio
- [ ] story/journey templates
- [ ] mobile sheet editor
- [ ] public share surfaces

## Epic E — Events, tournament, workflow, Ops OS (`#252`)
- [ ] seasons/events/divisions
- [ ] registrations/brackets/mats
- [ ] event state machine
- [ ] touch drag/drop
- [ ] broadcast/operator UI
- [ ] workflow/dependencies
- [ ] staffing/budgets/approvals
- [ ] national/region/club dashboards
- [ ] audit trail

## Epic F — Feed, SaaS, analytics, launch (`#253`)
- [ ] personalized feed
- [ ] favorites/notifications
- [ ] athlete/event/story promos
- [ ] sponsor/media surfaces
- [ ] tenants/themes
- [ ] Free/Premium/Elite gates
- [ ] onboarding/marketplace
- [ ] analytics/search/media kit
- [ ] performance/accessibility/reliability
- [ ] launch/rollback

---

# 9. Feature-lift rule

For every feature, document:

```text
Feature:
Legacy source:
Current SOT equivalent:
Canonical target:
Data model:
User roles:
Public/private boundary:
API/service boundary:
Migration method:
Feature flag:
Unit tests:
Integration tests:
E2E test:
Rollback:
```

- [ ] Port behavior, not filenames.
- [ ] Do not paste JSX into TSX without types and ownership.
- [ ] Do not reproduce PHP business rules in React.
- [ ] Keep client pages behind typed services.
- [ ] Keep sensitive mutations server-authoritative.
- [ ] Record major decisions in ADRs.

---

# 10. Users, roles, and use cases

- **Visitor:** discover services, view work, read stories, submit consultation.
- **Owner/operator:** manage brands, tenants, revenue, deployments, overrides.
- **PM/staff:** plans, phases, sprints, work orders, tasks, approvals.
- **Client:** project status, uploads, reviews, approvals.
- **Instructor/coach:** curriculum, techniques, evaluations, athletes, events.
- **Director:** events, divisions, staffing, qualification, budgets, readiness.
- **Athlete/member:** profile, journey, certifications, favorites, registration.
- **Official/volunteer:** shifts, certification, check-in, protocols, tasks.

---

# 11. Local smoke tests

## Application
- [ ] home loads
- [ ] navigation works
- [ ] no console/hydration errors
- [ ] env errors are clear
- [ ] error boundary works
- [ ] offline/recovery behavior is understandable

## Auth
- [ ] sign up/in/out
- [ ] session persists
- [ ] protected routes redirect
- [ ] server-derived permissions
- [ ] unauthorized mutations fail

## Database
- [ ] migrations apply
- [ ] seed is repeatable
- [ ] no cross-tenant leakage
- [ ] sensitive actions write audit records

## Integrations
- [ ] Stripe test checkout/webhook/entitlement
- [ ] Resend test email
- [ ] R2 upload/read/delete
- [ ] responsive images and alt text

## Core routes
- [ ] public RDD pages
- [ ] dashboard/workflow
- [ ] compliance
- [ ] curriculum/techniques
- [ ] Content Studio
- [ ] events/tournament
- [ ] public feed
- [ ] SaaS operator console
- [ ] analytics/search/launch checklist

---

# 12. Quality gates before Vercel

```bash
bun run lint
bun run typecheck
bun run test
bun run build
bun run test:e2e
bun run audit:fallow
```

- [ ] lint/format/typecheck pass
- [ ] unit/integration/E2E pass
- [ ] production build passes
- [ ] no secrets in logs/bundles
- [ ] no public PII leakage
- [ ] performance targets met
- [ ] accessibility/reduced motion pass
- [ ] media budgets pass

---

# 13. Vercel preview

- [ ] Create/link RDD Vercel project.
- [ ] Set root directory and Next.js preset.
- [ ] Use Bun install/build commands.
- [ ] Add preview environment variables.
- [ ] Configure migrations safely.
- [ ] Configure auth callbacks, Stripe test webhook, and R2 CORS.
- [ ] Deploy the branch.
- [ ] Run remote smoke/E2E tests.
- [ ] Capture screenshots/evidence.
- [ ] Test on a real phone.

---

# 14. Production deployment

## Preflight
- [ ] database backup and migration review
- [ ] live Stripe products/prices/webhook
- [ ] verified Resend domain
- [ ] auth production callbacks
- [ ] production R2/CORS
- [ ] analytics/error monitoring/rate limiting
- [ ] privacy/terms/security headers
- [ ] robots/sitemap
- [ ] launch approval

## Domain
- [ ] add root and `www` domains to Vercel
- [ ] choose canonical redirect
- [ ] update DNS and verify SSL
- [ ] preserve email DNS records
- [ ] verify all callback URLs

## Launch
- [ ] merge approved PR
- [ ] deploy production
- [ ] run production smoke tests
- [ ] test contact/auth/analytics/payment
- [ ] record deployment SHA
- [ ] publish launch status

## Rollback
- [ ] previous Vercel deployment identified
- [ ] database rollback strategy
- [ ] feature flags can disable incomplete modules
- [ ] webhook changes reversible
- [ ] incident owner and communication template

---

# /grill-me decision gate

1. Is RDD a separate app, tenant, or both?
2. Will BBL split out before RDD starts?
3. Which local hostname is canonical?
4. Which local folder maps to the connected GitHub SOT?
5. Is WordPress migration source or production dependency?
6. Which public pages must launch first?
7. Which Phase 13 internal tools must launch with RDD?
8. Which modules are RDD-only vs shared white-label product?
9. Which roles can access each workspace?
10. Which Stripe products are agency services vs SaaS plans?
11. Which Resend sender/domain is canonical?
12. Which R2 bucket/path convention is canonical?
13. Which analytics platform is canonical?
14. Is launch public-site-only or public site plus operating system?
15. Who approves design, migration, DNS, and production release?

---

# Recommended first session

## SESSION RDD-0001 — Repo truth and app-boundary decision

- [ ] clone/pull SOT
- [ ] record commit SHA
- [ ] run clean install/build/test
- [ ] inspect app/package boundaries
- [ ] inspect Prisma/auth/tenant models
- [ ] inspect Vercel configuration
- [ ] write separate-app-vs-tenant ADR
- [ ] create RDD branch
- [ ] create empty RDD app shell/route
- [ ] add first Playwright smoke test
- [ ] close with evidence, risks, and next-session handoff

**Do not lift feature code in SESSION RDD-0001. Establish the target correctly first.**
