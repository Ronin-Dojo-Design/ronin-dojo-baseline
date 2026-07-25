---
title: "SESSION 0691 — Quality-suite hardening: merged inbox (G-033) + social-adjacent code"
slug: session-0691
type: session--open
status: in-progress
created: 2026-07-24
updated: 2026-07-25
last_agent: claude-salvage-session-0691
sprint: S12
lane: build
goal_ids: [G-033]
pairs_with:
  - docs/knowledge/wiki/goals-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0691 — Quality-suite hardening: inbox + social-adjacent (apps/web)

> **Salvage note:** this lane was originally dispatched to codex, which died on "out of credits"
> having committed NOTHING. This is a Fable (Claude) salvage — fresh start in the same worktree
> (`ronin-0691`, branch `auto/session-0691-codex-quality-social-inbox`), building/gating/pushing
> directly (not sandboxed).

## Goal

Behavior-preserving quality hardening of the merged G-033 inbox slice + social-adjacent files in
`apps/web`: reduce CRAP / duplication / dead code / cyclomatic complexity, tighten types, fix lint.
No feature/API/schema changes.

## Scope (audited files)

- `apps/web/app/api/resend/webhooks/route.ts`
- `apps/web/server/inbox/{resend-payload,schema,svix-signature}.ts` (+ their tests, read-only)
- `apps/web/server/orpc/routers/inbox.ts`
- `apps/web/app/app/inbox/page.tsx` + `_components/{inbox-table,inbox-table-columns,inbox-status-select}.tsx`
- `apps/web/app/(web)/directory/[slug]/_components/directory-profile/social-section.tsx`
- `apps/web/components/web/passport/social-links-editor.tsx`
- `apps/web/app/(web)/organizations/[slug]/settings/members/_components/member-approval-actions.tsx`

## What landed (all behavior-preserving)

1. **`app/api/resend/webhooks/route.ts` — CRAP 110 → 20** (the one over-threshold function in
   scope; cyclomatic 10 → 4). `POST` decomposed into three single-purpose helpers:
   `rejectUnverifiedDelivery` (signature gate), `ackOrRejectNonEmailEvent` (400 vs
   200-and-ignore mapping), `upsertInboundEmail` (idempotency key + upsert). Also **deduped the
   upsert payload** — the 8 payload-derived fields were written out twice (create + update) and
   `resolveBrandFromRecipients` was computed twice; now one `emailFields` object spread into both.
   Status codes, log lines, and the never-touch-`triageStatus`-on-update rule all preserved.
2. **`server/inbox/resend-payload.ts` — dead-export removal** (fallow dead_code_ratio 0.33 → 0.0,
   MI 86.2 → 92.8): un-exported `EMAIL_RECEIVED_EVENT` and `RECIPIENT_DOMAIN_TO_BRAND` (zero
   external importers — verified by repo grep; both stay as module-private consts).
3. **`server/inbox/svix-signature.ts` — unreachable catch removed**: `Buffer.from(str, "base64")`
   never throws (invalid chars are skipped), so the try/catch around the secret decode was dead;
   the reachable `key.length === 0` → `malformed-secret` path is kept. All 11 svix tests pass.
4. **Triage-status label dedup**: `INBOX_TRIAGE_STATUS_LABELS` added to `server/inbox/schema.ts`;
   `inbox-status-select.tsx` and `inbox-table.tsx` both derived their previously hand-duplicated
   `STATUS_OPTIONS` label maps from it (table keeps its extra `"all"` entry).
5. **`inbox-table.tsx`**: static `filterFields` hoisted out of the render to a module const
   (`FILTER_FIELDS`) — it was rebuilt (including the brand-options map) every render.
6. **`components/web/passport/social-links-editor.tsx`**: tightened `form: UseFormReturn<any>` to
   a structural `SocialLinksFormValues` type (matches `updatePassportSchema.socialLinks`); hoisted
   the per-row-per-render `Object.fromEntries(PLATFORMS.map(...))` to a module const
   `PLATFORM_ITEMS`.

**Audited, no changes warranted:** `server/orpc/routers/inbox.ts` (MI 91.5, no findings),
`app/app/inbox/page.tsx`, `inbox-table-columns.tsx`, `social-section.tsx`,
`member-approval-actions.tsx` — all clean per fallow + hand review; churn avoided.

## Proposed ledger edits

*(Lane rule: no shared-ledger writes in-lane — merge owner routes these.)*

- **Wiring-ledger (WL) candidate — socialLinks shape drift (NOT fixed here; behavior change):**
  `PassportEditor`/`SocialLinksEditor` write `Passport.socialLinks` as an **array** of
  `{ platform, url }` (see `updatePassportSchema.socialLinks`, `passportFormValues`), but the
  directory read side (`social-section.tsx`) renders it as a **Record** via
  `Object.entries(socialLinks as Record<string, string>)` — for array-shaped data this would
  render index keys ("0", "1") as platform labels and object values as hrefs. Test fixtures
  (`profile-detail-projection.test.ts`) use the Record shape (`{ website: url }`), so both shapes
  exist in the ecosystem. Needs a decision on the canonical shape + a read-side normalizer;
  out of scope for a behavior-preserving pass.
- **FS note (pre-existing, environmental):** first after-gate full `bun run test` run hit 43
  fails / REAL_EXIT=1 — all 27 failing files are out-of-scope DB-dependent tests failing with
  Prisma P2028 transaction timeouts; run took 3082s vs 235s baseline (shared local Postgres under
  parallel-lane contention). Immediate retry: 1741 pass / 0 fail / 259.9s. Known shared-local-DB
  contention class, not a new finding — recording for the evidence trail only.

## Verification table

| Gate | Before (REAL_EXIT) | After (REAL_EXIT) |
| --- | --- | --- |
| `bun run typecheck` (root, all workspaces) | 0 | 0 |
| `bun run test` (apps/web, 224 files) | 0 (1741 pass / 0 fail, 235.5s) | 0 on retry (1741 pass / 0 fail, 259.9s); first run 1 — environmental P2028 DB contention, 27 out-of-scope DB test files, noted above |
| `bun run test` scoped: `server/inbox/*.test.ts` (in-scope, 22 tests) | — (covered by full run) | 0 (22 pass / 0 fail) |
| `bunx oxlint <14 target files>` (apps/web) | 0 | 0 |
| `fallow health -w @ronin-dojo/web` | 1 (advisory exit; 680 inherited repo-wide complexity findings) | 1 (same advisory exit, identical inherited set — unchanged pre-existing, out of scope) |
| `fallow audit --changed-since HEAD` (changeset gate, new-only) | n/a (no changes yet) | 0 — "No issues in 7 changed files"; 1 inherited finding excluded (`pg` unused dep in `apps/baseline`, out of scope) |
| `next build` | not run (orchestrator runs the full build gate) | not run |

Fallow per-file deltas (health, before → after):

| File | crap_max | crap_over | dead ratio | MI |
| --- | --- | --- | --- | --- |
| `app/api/resend/webhooks/route.ts` | 110.0 → 20.0 | 1 → 0 | 0.0 → 0.0 | 90.6 → 90.0 |
| `server/inbox/resend-payload.ts` | 20.2 → 20.2 | 0 → 0 | 0.33 → 0.0 | 86.2 → 92.8 |
| `server/inbox/svix-signature.ts` | 15.8 → 14.7 | 0 → 0 | 0.0 → 0.0 | 94.9 → 95.2 |

## Exit

Committed on `auto/session-0691-codex-quality-social-inbox`, pushed, PR opened (no merge — merge
owner decides). Prisma schema/migrations, SotD kernel, `components/common/*`, and shared ledgers
untouched.
