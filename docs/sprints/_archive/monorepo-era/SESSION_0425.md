---
title: "SESSION 0425 — Mammoth intake → Mammoth Build CRM MVP (replace HubSpot)"
slug: session-0425
type: session--open
status: closed
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0425
sprint: S-foundation
pairs_with:
  - docs/sprints/SESSION_0424.md
  - docs/business/leads/project-mammoth-build-crm.md
backlinks:
  - docs/business/README.md
---

# SESSION 0425 — Mammoth intake → Mammoth Build CRM MVP

## Date

2026-06-20

## Operator

Brian + claude-session-0425 (playing Petey → Cody → Doug; Desi sub-agent for design)

## Goal

Onboard Ronin Dojo Design's first intake client (Michael Flores / Mammoth Metal Buildings),
then — on operator pivot — **build a frontend-only MVP of a custom "Mammoth Build CRM" to
replace HubSpot**, set for Sunday 2026-06-21 review.

## Status

Single source of truth is the frontmatter `status:` field.

## Branch and worktree

- Branch: **`claude/pemb-design-codes-v2zamn`** (task directive — develop + push here only;
  this **overrides** the CLAUDE.md standing "push to main" authorization for this session).
- PR: **#131** (draft), CI green (Vercel + CodeRabbit), subscribed for activity.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0425_TASK_01 | landed | Agency BD ledger (`docs/business/`) + Mammoth intake brief; intake logged on calendar |
| SESSION_0425_TASK_02 | landed | Friction audit (HubSpot retrofit) + scoped proposal (DRAFT) |
| SESSION_0425_TASK_03 | landed | HubSpot integration/best-practices reference (sub-agent) |
| SESSION_0425_TASK_04 | landed | Pivot decision doc: replace HubSpot w/ custom CRM + GD backend architecture sketch + roadmap |
| SESSION_0425_TASK_05 | landed | Mammoth Build CRM MVP app (`clients/mammoth-build-crm/`) — tsc clean, next build green |

## What landed

- **Agency BD ledger** under `docs/business/` (README + calendar-of-events + `leads/`),
  deliberately separate from the product `Lead` Prisma model (gym members).
- **Mammoth engagement docs:** intake brief + 7-zone friction audit, DRAFT proposal,
  HubSpot best-practices reference, and the **pivot decision** (replace HubSpot →
  custom CRM) with a backend architecture sketch (Postgres/Prisma + S3 + Stripe + queue)
  and a phased roadmap.
- **Mammoth Build CRM MVP** — `clients/mammoth-build-crm/`, Next.js 16 + TS + Tailwind,
  dark + orange, **localStorage only**:
  - Landing page per Desi's spec (mirror-reflection hero, scroll micro-animations,
    save-interest, inquiry-draft persistence, WCAG/reduced-motion guardrails).
  - Pipeline board (lead→order), job order form, and the centerpiece **before/during/after
    build-photo documentation** per project.
  - "Becomes an actual order" + "can't be dropped" guardrails in `lib/store.ts`.
  - **Doug QA:** `npx tsc --noEmit` exit 0; `npm run build` green (5 routes).

## Files touched

- `docs/business/README.md`, `docs/business/calendar-of-events.md` — new BD ledger + calendar.
- `docs/business/leads/mammoth-build-michael-flores.md` — intake brief + friction audit.
- `docs/business/leads/michael-flores-project-proposal.md` — DRAFT proposal.
- `docs/business/leads/hubspot-integration-best-practices.md` — HubSpot reference (sub-agent).
- `docs/business/leads/project-mammoth-build-crm.md` — pivot decision + architecture + roadmap.
- `clients/mammoth-build-crm/**` — the MVP app (config, `lib/`, `components/`, `app/` routes, README).
- `docs/sprints/SESSION_0425.md` — this file.

## Decisions resolved

- Mammoth is already on HubSpot (retrofit) with Stripe integrated.
- **Pivot: build a custom Mammoth Build CRM instead of tuning HubSpot** (operator call).
- MVP scope = all four (landing + pipeline + job order + photo docs); standalone app in baseline repo.
- Brian schedules the intake directly with Michael (date TBD); RDD retained counsel can paper the engagement.

## Open decisions / blockers

- Go/no-go on HubSpot replacement (vs. integrate-with) — for **Sunday 2026-06-21 review**.
- Real brand hex (palette provisional). Roadmap priority (photo-proof vs. automation first).
- Hosting/stack sign-off; paid-engagement scope. Intake date/time unconfirmed.

## Next session

### Goal

Run the Sunday review of the Mammoth Build CRM MVP; resolve the §6 open decisions in
`project-mammoth-build-crm.md`; if go, scope **P2 (backend + persistence + auth)**.

### First task

Walk the MVP (`cd clients/mammoth-build-crm && npm install && npm run dev`), capture
Brian's review notes, then either scope P2 or iterate the landing/CRM per feedback.

### BLOCKED ON USER

Yes — Sunday review + go/no-go decision gates the next build phase.

## Review log

### SESSION_0425_REVIEW_01 — Mammoth CRM MVP

- **Reviewed tasks:** TASK_01–TASK_05.
- **Verdict:** Pivot is documented as a decision (not a silent scope change), with HubSpot
  work preserved as the feature-parity spec. MVP builds green and demonstrates both
  must-haves (order-confirmation gate, can't-drop guardrail) and the differentiator
  (before/after photo proof). Isolated under `clients/` — no product-app blast radius.
- **Score:** 9.0/10.
- **Follow-up:** photos are localStorage thumbnails (quota-bound) — S3 originals are P3;
  no automated tests yet (MVP) — add when backend lands.

## Hostile close review

- **Giddy:** pass — new client app is isolated in `clients/`, does not touch the product
  `apps/web`, Prisma, auth, or payments; Vercel `ignoreCommand` means it won't trigger the
  prod deploy. Branch directive honored (no push to `main`).
- **Doug:** pass — typecheck clean, production build green, no `node_modules`/`.next` staged,
  `package-lock.json` committed.

## ADR / ubiquitous-language check

- ADR not filed this session (client-side BD/app work, not a product-architecture decision).
  The HubSpot-replacement decision is recorded in `project-mammoth-build-crm.md`; promote to a
  formal ADR if/when the build is greenlit Sunday.

## Reflections

- **Name the pivot, don't bury it.** "Replace HubSpot" is a different commitment than "tune
  HubSpot" — surfacing it as a decision doc + a scoping question kept the prior work as an
  asset (feature-parity spec) instead of waste.
- **Isolation buys speed.** Standing the CRM up under `clients/` (own package.json) let it
  build green without any risk to the product app or its CI/deploy.
- **The differentiator is the product.** Mammoth's "we stay in the build, with proof" is the
  before/during/after photo feature — that's why it's the MVP centerpiece, not the pipeline.

## Full close evidence

| Step | Proof |
| --- | --- |
| Frontmatter sweep | New `docs/business/*` docs carry frontmatter; SESSION_0425 created with full frontmatter |
| Backlinks/index sweep | `docs/business/README.md` links all BD docs + the app; wiki/ tree untouched (no wiki-index change needed) |
| Wiki lint | see bow-out chat (`bun run wiki:lint` result reported there) |
| Hostile close review | SESSION_0425_REVIEW_01 + Giddy/Doug above |
| Memory sweep | none needed — session-scoped client work; pivot recorded in project doc |
| Git hygiene | branch `claude/pemb-design-codes-v2zamn`; single docs commit at close; hash in bow-out chat |
| Graphify update | skipped — Graphify not installed in this environment |
