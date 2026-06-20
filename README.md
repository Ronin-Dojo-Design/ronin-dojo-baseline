# Ronin Dojo Baseline

## 🥋 Black Belt Legacy is LIVE — launched June 19, 2026

**[blackbeltlegacy.com](https://blackbeltlegacy.com)** is public: the lineage network, one-click member profile claims (magic-link, no passwords), and live paid **Premium/Elite** memberships (Stripe → entitlements) — end to end.

**What it took, from the WordPress years to launch:**

| | Commits | When |
| --- | --- | --- |
| [The monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) — where it began | **1,610** | Dec 20, 2025 → May 6, 2026 |
| This repo — live now | **822** | Apr 25 → Jun 19, 2026 |
| **End to end** | **2,432** | **~1,400 hours** at the keyboard (and that's a floor) |

**56 days in the final stretch — not one off.** A commit on every single day. Eight years of falling, failing, and learning React at the eleventh hour — built to be worthy of Rigan Machado's lineage and the man who dreamed it up, **Bob Bass**.

*Planned Passion Produces Purpose. Design by Discipline. Disciplined by Design. OSSS. 🙏🏻*

---

Ronin Dojo Baseline is a multi-brand martial arts platform built from the Dirstarter stack. The same Next.js app powers school operations, public member/profile surfaces, lineage trees, course/curriculum features, tournaments, payments, entitlements, media, and admin tooling across four brands.

Current snapshot: June 19, 2026 — **Black Belt Legacy is launched and live.** The repo is past launch hardening; active work is post-launch polish, member photo/data backfill, and the remaining brand sequencing.

## Why This Rebuild Exists

Ronin Dojo started from a legacy WordPress/PHP codebase that proved the product direction but became too heavy for the platform Brian is building now. The old implementation carried a large amount of WordPress/PHP/plugin complexity to support workflows that now need to be typed, testable, auditable, brand-scoped, and reusable across four brands.

The decision was to make a clean backend fresh start instead of dragging that complexity forward. This repo modernizes the platform around Next.js, Prisma, Postgres, Better Auth, Stripe, Resend, S3, CI, runbooks, and explicit security/data boundaries. The result is a codebase where lineage, memberships, claims, payments, entitlements, media, and admin operations share one coherent model instead of being split across WordPress conventions and custom PHP plumbing.

Legacy reference: [ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo).

## Current Brand State

| Brand | Role | Launch state |
| --- | --- | --- |
| **Black Belt Legacy** | Main production launch focus. Heritage/community product for practitioner profiles, lineage trees, rank history, claims, trust signals, curriculum, certification, and searchable legacy records. | **🚀 LAUNCHED — June 19, 2026** at [blackbeltlegacy.com](https://blackbeltlegacy.com). Public lineage viewer, one-click magic-link profile claims, admin claim review, audited comp grants, and **live paid Premium/Elite memberships** (Stripe checkout → signed webhook → entitlements, on the per-brand BBL Stripe account). Post-launch work is member photo/data backfill and feature polish. |
| **Baseline Martial Arts** | Live production proxy and school-ops proof brand. Proves the shared code, auth, Stripe, Resend, Vercel, brand scoping, school lifecycle, and student/member flows before BBL cutover. | **Live proxy, not the final launch focus.** Use it to harden the platform safely while BBL-specific DNS/content/migration work continues. Product direction is school operations: lead -> trial -> household/member -> waiver -> membership -> schedule -> attendance -> progress -> rank -> billing -> renewal. |
| **WEKAF USA** | Tournament and stick-fighting organization lane. Owns the deepest tournament/bracket/scoring future. | **Furthest from launch and no immediate rush.** Tournament schema and some admin tooling exist, but full WEKAF-specific bracket/scoring operations are not the active launch priority. |
| **Ronin Dojo Design** | Umbrella/agency/white-label brand. Final commercial launch surface for demos, client onboarding, sales, and multi-brand management. | **Final launch lane, no immediate rush.** This comes after BBL and shared-platform hardening; do not let RDD sales/onboarding scope distract from the BBL cutover. |

## Black Belt Legacy Launch Links

- [BBL Cutover Checklist](docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md) - launch sequencer for DNS/deploy, features, and verification.
- [BBL PRD](docs/product/black-belt-legacy/PRD.md) - product intent and MVP capability frame.
- [BBL Stories](docs/product/black-belt-legacy/STORIES.md) - story map by epic.
- [BBL Gap Matrix](docs/product/black-belt-legacy/GAP_MATRIX.md) - story-by-story implementation status.
- [BBL Production Runbook](docs/runbooks/deploy/bbl-production-runbook.md) - deploy and DNS mechanics.
- [Gift/Comp + Tier-Gating Epic](docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md) - comp, gift, entitlement, and tier-gating plan.

## Agentic Workflow

This repo is maintained through explicit session rituals so AI agents and humans do not rediscover the same context every time.

- **Bow in** - Start with `CLAUDE.md`, `docs/rituals/opening.md`, and the current `docs/sprints/SESSION_NNNN.md`. The opening ritual records the active agent/session, checks branch/worktree state, and loads the relevant project rules.
- **Graphify-first discovery** - Prefer `graphify query`, `graphify explain`, and related Graphify CLI commands for finding code/docs before falling back to broad filesystem searching. Graphify is refreshed at bow-out so the next session starts with current repo memory.
- **SESSION files are the working changelog** - `docs/sprints/SESSION_NNNN.md` captures the plan, task log, files touched, verification, review notes, blockers, next-session handoff, and close evidence. Read the latest session first when picking up work.
- **Wiki, SOPs, and runbooks preserve durable knowledge** - `docs/knowledge/wiki/` stores synthesized project knowledge and ledgers; `docs/runbooks/` stores repeatable procedures; `docs/runbooks/sops/` stores cross-cutting operating patterns. Update these when a session changes durable workflow or product knowledge.
- **Bow out** - End with `docs/rituals/closing.md`: update the SESSION file, run relevant verification, update wiki/index/log/ledgers, run wiki lint, refresh Graphify, then commit and push if authorized.

The root README is intentionally not a full changelog. For change history, use:

- latest session: [docs/sprints/SESSION_0347.md](docs/sprints/SESSION_0347.md)
- session index: [docs/knowledge/wiki/index.md](docs/knowledge/wiki/index.md)
- wiring/debt ledger: [docs/knowledge/wiki/wiring-ledger.md](docs/knowledge/wiki/wiring-ledger.md)
- launch status: [docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md](docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md)

## What Exists Today

- Public multi-brand web app with brand-scoped routing/data.
- Better Auth sessions, Passport and DirectoryProfile shells, organization membership, roles, invites, and admin safe-actions.
- Public directories, discipline pages, member/profile surfaces, courses, schedules, attendance, media attachments, promotion events, and content posts.
- Lineage trees with public viewer, drawer, responsive/mobile layouts, search, selected-path highlighting, rank history, claim flow, admin claim review, editor capabilities, and audited lineage mutations.
- Stripe checkout/webhook entitlement flows, billing portal support, purchased and manual entitlements, audited comp grants, and BBL lineage premium/elite render-policy reads.
- Admin surfaces for users, organizations, tools, programs, courses, content, media, tournaments, lineage, claims, billing monitors, and storage monitors.
- Knowledge/wiki/runbook system for session handoff, ADRs, product docs, Graphify repo memory, and launch protocols.

## Engineering, Security, And Data Posture

The repo is designed to be boring where correctness matters and explicit where trust boundaries matter.

- **CI gates** - GitHub Actions run Biome CI, TypeScript typecheck, and the Bun unit/integration suite against Postgres on pushes/PRs to `main`. Playwright e2e lives in a separate workflow. Local closeout also runs focused regressions, wiki lint, browser smoke where relevant, and Graphify refresh.
- **Deterministic tests** - The app test script uses `bun test --parallel=1 --path-ignore-patterns='e2e/**'` to avoid DB-over-subscription and mock-leak flakes. Current suite size is 450+ Bun tests with brand-isolation, privacy, concurrency, webhook, and safe-action coverage.
- **Brand-scoped data** - Multi-domain brand resolution is centralized in `apps/web/lib/brand-context.ts`; server queries and actions pass `brand` through instead of relying on client-provided brand state. Unknown-host and production-domain hardening is tracked in the manual boundary registry.
- **Server-derived authorization** - Admin and web mutations use safe-action wrappers plus server-side RBAC/capability checks. Client payloads are treated as requests, not authority; sensitive flows re-read database truth before mutating.
- **Audit-first sensitive mutations** - Entitlement grants/revokes, lineage edits, claim review, attendance, membership transitions, and other sensitive admin changes write audit records. SESSION_0347 closed the remaining generic admin entitlement audit gap.
- **Entitlement-first commerce** - Stripe is treated as payment transport, not authorization truth. Checkout line items are derived server-side; signed webhooks grant/revoke `UserEntitlement`; card data is never stored; access is not represented by `Membership.status`.
- **Public payload allowlists** - Directory and lineage public payloads select only intended fields, strip user-hidden email/org/rank data, and test that private/restricted lineage data and account PII do not leak.
- **Operational ledgers** - Known gaps go to canonical ledgers rather than being buried in chat: `wiring-ledger.md`, `test-fail-fix-ledger.md`, `manual-boundary-registry.md`, ADRs, and SESSION close evidence.

## Stack

- **App** - Next.js 16 App Router in `apps/web/`
- **Database** - Postgres via Prisma 7
- **Auth** - Better Auth
- **Payments** - Stripe Checkout, Customer Portal, signed webhook fulfillment, entitlement grants
- **Email** - Resend
- **Storage/media** - S3-compatible storage
- **UI** - React 19, Tailwind CSS, Base UI/Dirstarter primitives, lucide icons
- **Testing** - Bun unit/integration tests, Playwright e2e, Biome lint/format, wiki lint
- **Repo memory** - Graphify for code/doc discovery and close-of-session graph refresh

## Layout

```text
apps/web        Next.js app, Prisma schema, routes, server actions, tests
packages/       Shared package(s), currently api-client
docs/           Product docs, ADRs, runbooks, wiki, session logs, launch checklists
scripts/        Repo automation, wiki lint, docs navigation, smoke helpers
```

## Local Commands

From the repo root:

```bash
pnpm --filter @ronin-dojo/web dev
bun run wiki:lint
```

From `apps/web`:

```bash
bun run lint
bun run typecheck
bun test --parallel=1 --path-ignore-patterns='e2e/**'
bunx playwright test
```

The current session workflow also uses Graphify-first discovery where possible:

```bash
graphify query "black belt legacy launch status" --budget 6000
GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .
```

## Architecture And Session Records

- [Architecture decisions](docs/architecture/decisions/) - ADRs for entitlement-first commerce, membership lifecycle ownership, hosting, routing, and more.
- [Product docs](docs/product/) - brand PRDs, stories, launch docs, and gap matrices.
- [Runbooks](docs/runbooks/) - deploy, SOP, test, Graphify, and domain-feature procedures.
- [Session logs](docs/sprints/) - source of truth for recent implementation and closeout evidence.
