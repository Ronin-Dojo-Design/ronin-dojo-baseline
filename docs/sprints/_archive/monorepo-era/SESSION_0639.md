---
title: "SESSION 0639 — auto-claude G-033 slice 1 InboundEmail + /app/inbox AdminCollection (overnight auto lane)"
slug: session-0639
type: session--implement
status: in-progress
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0639
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0639 — auto-claude G-033 slice 1 InboundEmail + /app/inbox AdminCollection (overnight auto lane)

> Staged by the SESSION_0635 overnight orchestrator (operator-approved 5-lane dispatch). Adopt at lane
> start: flip `status:` → `in-progress`, set `last_agent:` to `<driver>-session-0639`. The dispatch
> payload is the lane prompt; its HARD RULES are binding. Branch: `auto/session-0639-inbox-module`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude G-033 slice 1 InboundEmail + /app/inbox AdminCollection — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0639_TASK_01 | done | `InboundEmail` model + hand-authored (UNAPPLIED) migration + `bunx prisma generate` |
| SESSION_0639_TASK_02 | done | Pure kernel-shaped module `server/inbox/` (svix verify, payload parse, brand-from-recipient) + focused tests |
| SESSION_0639_TASK_03 | done | `/api/resend/webhooks` route (svix-verified, `email.received` → idempotent upsert, unknown events 200+ignore) |
| SESSION_0639_TASK_04 | done | oRPC `inbox` router (list + setTriageStatus, `email.manage`-gated) registered in `server/router.ts` |
| SESSION_0639_TASK_05 | done | `/app/inbox` conformed AdminCollection + nav entry (Growth group, reuses `email.manage`) |

## What landed

G-033 slice 1 — inbound-email capture + admin Inbox, built app-local in `apps/web` (ADR 0040/0051:
one consumer today, structured for later extraction; no new package, no new deps — svix signature
verification implemented in-house with `node:crypto`, mirroring the `services/printful.ts` precedent).

- **Model**: `InboundEmail` (additive; `triageStatus` plain string UNREAD|READ|ARCHIVED — no new
  enum; `brand Brand?` nullable; indexes on `receivedAt` + `triageStatus`; unique `resendEmailId`).
  Migration `20260724000000_add_inbound_email` generated via `prisma migrate diff --from-migrations
  … --to-schema … --script` (note: Prisma 7.8 renamed the pinned `--to-schema-datamodel` flag to
  `--to-schema`; a pre-created EMPTY migration dir breaks the scan with P3015 — generate to a temp
  file first). **NOT applied** — the AM merge applies it.
- **Webhook** `app/api/resend/webhooks/route.ts`: svix verification via env
  `RESEND_WEBHOOK_SECRET` (optional in the env schema per the PRINTFUL pattern; **fail-closed in
  prod when unset** — deliberately stricter than Printful's skip, an open inbound-mail sink would
  accept forged mail); `email.received` → upsert keyed on `resendEmailId` (falls back
  `svix:<svix-id>` → `unkeyed:<uuid>`); retry-refresh never clobbers `triageStatus`; rawPayload
  always stored; unknown event types → 200 + ignore.
- **Read layer**: oRPC `inbox.list` (triageStatus/brand facets, sender search, paginate, sort) +
  `inbox.setTriageStatus`, both `.meta({ permission: APP_AREA_PERMISSIONS.email })` — REUSED the
  existing `email.manage` area key (inbound inbox = the email admin area's receive side; no new
  key, no new system).
- **Surface**: `/app/inbox` conformed AdminCollection (planning-intake sibling: opens on the
  UNREAD queue, status DataSelect shallow:false, in-row `InboxStatusSelect` writing through the
  oRPC client — the first oRPC-mutating row control). Columns: from, subject, brand, receivedAt,
  triageStatus. No detail page (pinned). Brand enum never value-imported client-side —
  `server/inbox/schema.ts` carries string-literal `INBOX_BRANDS`/labels; the pure resolver
  type-checks its literals against the real enum via a type-only import.
- **Nav**: ONE entry (Growth group, `InboxIcon`, `email.manage`). `/app/inbox` shadowing grep on
  `config/app-redirects.ts`: exit 1 = no match, not shadowed. `admin-sections.test.ts` count-locks
  bumped 37→38 / 36→37 + an Inbox gate assertion.

## Files touched

| File | Change |
| --- | --- |
| apps/web/prisma/schema.prisma | + `InboundEmail` model (additive) |
| apps/web/prisma/migrations/20260724000000_add_inbound_email/migration.sql | NEW — hand-generated CREATE TABLE + 3 indexes; **UNAPPLIED** |
| apps/web/server/inbox/svix-signature.ts | NEW — pure svix HMAC verification (node:crypto, injectable clock) |
| apps/web/server/inbox/resend-payload.ts | NEW — pure lenient payload parser + recipient-domain→Brand resolver |
| apps/web/server/inbox/schema.ts | NEW — client-safe nuqs params + row/brand/sort constants |
| apps/web/server/inbox/svix-signature.test.ts | NEW — 10 pure cases (fixed test secret) |
| apps/web/server/inbox/resend-payload.test.ts | NEW — 12 pure cases |
| apps/web/app/api/resend/webhooks/route.ts | NEW — webhook handler (printful/stripe route pattern) |
| apps/web/server/orpc/routers/inbox.ts | NEW — oRPC list + setTriageStatus (`email.manage`) |
| apps/web/server/router.ts | + `inbox` in `appRouter` |
| apps/web/app/app/inbox/page.tsx | NEW — gated index (inline `requirePermission`, rsc() oRPC read) |
| apps/web/app/app/inbox/_components/inbox-table.tsx | NEW — conformed AdminCollection |
| apps/web/app/app/inbox/_components/inbox-table-columns.tsx | NEW — pinned 5 columns |
| apps/web/app/app/inbox/_components/inbox-status-select.tsx | NEW — in-row triage via oRPC client |
| apps/web/config/admin-sections.ts | + Inbox item (Growth, InboxIcon, `email.manage`) |
| apps/web/config/admin-sections.test.ts | count-locks 37→38 / 36→37 + Inbox gate assertion |
| apps/web/env.ts | + `RESEND_WEBHOOK_SECRET` (optional, PRINTFUL pattern) |
| apps/web/.env.example | + `RESEND_WEBHOOK_SECRET` documented |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bunx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script -o <scratch>` | EXIT=0 — SQL = exactly the one CREATE TABLE + 3 indexes (no drift) |
| `bunx prisma generate` (apps/web) | EXIT=0 — client 7.8.0 regenerated |
| `bun run typecheck` (root, final formatted tree) | TYPECHECK_FINAL_EXIT=0 (all 5 workspaces) |
| `cd apps/web && bun run lint:check` | LINT_EXIT=0 (pre-existing warnings only, none in new files) |
| `cd apps/web && bun run format:check` | FORMAT_CHECK_EXIT=0 (after `bunx oxfmt` scoped to the 5 new offending files only) |
| `bun test server/inbox/svix-signature.test.ts` (single file) | SVIX_EXIT=0 — 10 pass / 0 fail |
| `bun test server/inbox/resend-payload.test.ts` (single file) | PAYLOAD_EXIT=0 — 12 pass / 0 fail |
| `bun test config/admin-sections.test.ts` (single file) | EXIT=0 — 11 pass / 0 fail |
| Runtime smoke of `/app/inbox` + webhook | **NOT RUN — impossible tonight by design** (migration unapplied, no DB writes allowed; see Residual) |

## Proposed ledger edits

<!-- Lanes NEVER edit shared ledgers. Every WL/G/D/FS change you would have made goes here as a row;
the attended AM merge applies them once. -->

- **goals-ledger G-033**: progress note — slice 1 landed (SESSION_0639, PR draft): `InboundEmail`
  capture + `/api/resend/webhooks` + oRPC `inbox` router + `/app/inbox` AdminCollection + nav.
  Migration authored, NOT applied. Remaining for the slice: AM apply + webhook registration +
  runtime proof; later slices: detail view, reply, retention policy.
- **wiring-ledger (proposed WL row)**: `/app/inbox` + `/api/resend/webhooks` are WIRED IN CODE but
  runtime-UNPROVEN — migration unapplied at build time, so neither surface has been exercised
  against a DB. Closes when the AM merge applies the migration, registers the webhook +
  `RESEND_WEBHOOK_SECRET` in the Resend dashboard (operator), dev-login smokes `/app/inbox`
  (list + status flip), and posts a signed `email.received` fixture at the route.
- **custom-component-inventory (proposed)**: `InboxStatusSelect`
  (`app/app/inbox/_components/inbox-status-select.tsx`) — the `PlanningIntakeStatusSelect` idiom
  ported to an oRPC-client mutation (optimistic + rollback + toast); first in-row oRPC write
  control. `server/inbox/*` = first kernel-shaped inbound-email module (pure svix verify +
  payload parse, extractable per ADR 0040).

## Open decisions / blockers

None — all forks were pinned in the lane prompt. One pinned-command deviation worth knowing:
Prisma 7.8 removed `--to-schema-datamodel` (pinned flag) → used the renamed `--to-schema`
equivalent; same semantics, output reviewed by hand.

## Residual for AM merge

1. **Apply the migration** (`20260724000000_add_inbound_email`) — local prodsnap via
   `bun run db:migrate:deploy` preflight; Neon prod auto-applies via `prebuild` on deploy.
   Until applied, `/app/inbox` and the webhook 500 on first DB touch.
2. **Run `bunx prisma generate` after merge** if the AM tree regenerates from a different
   checkout (prebuild migrates, does NOT generate — PL-010).
3. **Operator: register the webhook** in the Resend dashboard → endpoint
   `https://blackbeltlegacy.com/api/resend/webhooks`, event `email.received`; set
   `RESEND_WEBHOOK_SECRET` in Vercel env. Until the env var is set, prod rejects deliveries 401
   (fail-closed by design).
4. **Dev-login smoke `/app/inbox`** (admin): empty state renders; after posting a signed test
   `email.received` fixture, row appears; status flip persists (UNREAD → READ → ARCHIVED);
   UNREAD default filter + brand facet + sender search behave.
5. **Admin-collection conformance e2e** for `/app/inbox` (e2e/** is lane-forbidden — not written
   tonight).
6. **Payload-shape check against a REAL Resend `email.received` delivery** — the parser is lenient
   by design, but field naming (`email_id`/`text`/`html`/`created_at`) should be confirmed against
   one live capture; rawPayload retains everything either way.

