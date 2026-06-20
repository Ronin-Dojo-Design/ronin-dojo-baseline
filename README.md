# Black Belt Legacy — BBLApp v4.4

> Preserve, verify, explore, and share your martial arts legacy — through profiles, lineage
> trees, rank history, curriculum, certifications, and community knowledge.
>
> **🥋 Live at [blackbeltlegacy.com](https://blackbeltlegacy.com)**

**Milestone:** `MVP — LIVE` · launched **June 19, 2026** · current line **BBLApp v4.4**

---

## What this is

**Black Belt Legacy** is the heritage-and-community home for martial artists: the place where
identity, lineage, rank history, instructors, schools, stories, and trust signals come together.
This repository is **BBLApp v4.4** — the modern, typed, testable, auditable rebuild of that
product, running in production today.

This repo is being **renamed to `black-belt-legacy`** and pared down to the Black Belt Legacy app
alone. It grew up inside a four-brand platform harness; that harness is being **stripped** so the
codebase is exactly one thing — BBL — with no other-brand scope to carry, gate, or reason around.

> Lineage of the build: legacy **WordPress/PHP** years → the
> [ronin-dojo-monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) (1,610 commits)
> → **this app** (822+ commits). v4.4 is the current production line of that rebuild.

## Milestone: MVP — LIVE (June 19, 2026)

**[blackbeltlegacy.com](https://blackbeltlegacy.com)** is public: the lineage network, one-click
member profile claims (magic-link, no passwords), and live paid **Premium/Elite** memberships
(Stripe → entitlements) — end to end.

**What it took, from the WordPress years to launch:**

| | Commits | When |
| --- | --- | --- |
| [The monorepo](https://github.com/Ronin-Dojo-Design/ronin-dojo-monorepo) — where it began | **1,610** | Dec 20, 2025 → May 6, 2026 |
| This app — live now | **822+** | Apr 25, 2026 → present |
| **End to end** | **2,432+** | **~1,400 hours** at the keyboard (and that's a floor) |

**56 days in the final stretch — not one off.** A commit on every single day. Eight years of
falling, failing, and learning React at the eleventh hour — built to be worthy of Rigan Machado's
lineage and the man who dreamed it up, **Bob Bass**.

*Planned Passion Produces Purpose. Design by Discipline. Disciplined by Design. OSSS. 🙏🏻*

## Built continuously

BBLApp v4.4 is under **active, continuous development**. We port capabilities forward — from the
legacy Black Belt Legacy (WordPress) product and the monorepo — into one coherent, typed model,
constantly. New surfaces land in **beta** first and graduate to **live** as they harden.

**Have an idea?** Feature suggestions are welcome — open an issue on this repo, or reply to any
Black Belt Legacy email and a human will read it.

## Feature status (v4.4)

A snapshot of what's set-and-live versus what's in beta. Full, dated log:
**[FEATURES.md](FEATURES.md)**.

### ✅ Live — set and in production

- **Lineage network** — the **timeline-tree** with provable promotion provenance ("Promoted by
  X · date", year-stamped connectors, chronological order). This is the product's signature.
- **Public lineage viewer** — node drawer, search, selected-path highlighting, responsive/mobile.
- **Member & practitioner profiles** + the public **directory** (people and schools).
- **One-click profile claims** — magic-link (no passwords) and social sign-in, with claim binding
  reconciled on every sign-in; **admin claim review** (approve / deny / needs-info) with audit + email.
- **Rank history & awards.**
- **Paid memberships** — Premium / Elite via Stripe checkout → signed webhook → **entitlements**,
  billing portal, and audited **comp / gift** grants.
- **Lifecycle emails** — welcome, claim approved/denied, receipts (Resend).
- **Schools & organizations** — membership, invites, roles, settings, theming.

### 🧪 Beta — built, hardening toward GA

- **Technique graph** — close.
- **Curriculum** — close.
- **Certificates** (with public `/certificates/verify` codes) — close.
- **Merch / gear** (Printful) — close.
- **Video library** — beta, **closest to GA**.

## Engineering, security, and data posture

Boring where correctness matters; explicit where trust boundaries matter.

- **Entitlement-first commerce** — Stripe is payment transport, not authorization truth. Checkout
  line items are derived server-side; signed webhooks grant/revoke `UserEntitlement`; card data is
  never stored; access is never represented by `Membership.status`.
- **Server-derived authorization** — admin and web mutations use safe-action wrappers plus
  server-side RBAC/capability checks. Client payloads are requests, not authority; sensitive flows
  re-read database truth before mutating.
- **Audit-first sensitive mutations** — entitlement grants/revokes, lineage edits, claim review,
  attendance, and membership transitions write audit records.
- **Public payload allowlists** — directory and lineage public payloads select only intended
  fields and strip hidden email/org/rank data; tests assert private data and PII do not leak.
- **CI gates** — GitHub Actions run lint/format (Oxc), TypeScript typecheck, and the Bun
  unit/integration suite against Postgres on pushes/PRs to `main`; Playwright e2e in a separate
  workflow.
- **Operational ledgers** — known gaps go to canonical ledgers (`wiring-ledger.md`,
  `manual-boundary-registry.md`, ADRs, SESSION close evidence), not buried in chat.

## Stack

- **App** — Next.js 16 App Router in `apps/web/`
- **Database** — Postgres via Prisma 7
- **Auth** — Better Auth
- **Payments** — Stripe Checkout, Customer Portal, signed-webhook fulfillment, entitlement grants
- **Email** — Resend
- **Storage / media** — S3-compatible (Cloudflare R2 for BBL media)
- **UI** — React 19, Tailwind CSS, Base UI / Dirstarter primitives, lucide icons
- **Testing** — Bun unit/integration, Playwright e2e, Oxc lint/format, wiki lint
- **Repo memory** — Graphify for code/doc discovery

## Layout

```text
apps/web        Next.js app, Prisma schema, routes, server actions, tests
packages/       Shared package(s)
docs/           Product docs, ADRs, runbooks, wiki, session logs, launch checklists
scripts/        Repo automation, wiki lint, docs navigation, smoke helpers
```

## Local commands

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

## Explore the build

Interactive maps generated from the repo itself and published live:

- **[Docs Navigator](https://ronin-dojo-design.github.io/ronin-dojo-baseline/navigator.html)** — every product doc, runbook, ADR, and session log.
- **[Repo Knowledge Graph](https://ronin-dojo-design.github.io/ronin-dojo-baseline/graph.html)** — an interactive Graphify graph of how code, docs, and decisions connect.

## Architecture and records

- [Feature log](FEATURES.md) — public, dated Live / Beta / Planned status.
- [Architecture decisions](docs/architecture/decisions/) — ADRs.
- [Product docs](docs/product/black-belt-legacy/) — PRD, stories, launch checklist, gap matrix.
- [Runbooks](docs/runbooks/) — deploy, SOP, test, Graphify, and domain-feature procedures.
- [Session logs](docs/sprints/) — source of truth for recent implementation and close evidence.

---

*This app is maintained through explicit session rituals (`CLAUDE.md`, `docs/rituals/`) so humans
and AI agents don't rediscover context every time. SESSION files in `docs/sprints/` are the working
changelog; **[FEATURES.md](FEATURES.md)** is the public-facing one.*
