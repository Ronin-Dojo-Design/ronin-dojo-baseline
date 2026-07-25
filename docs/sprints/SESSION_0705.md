---
title: "SESSION 0705 — PL-027 slice: OG belt-color renderer graduation + fork F2 (publicity consent)"
slug: session-0705
type: session--implement
status: closed
created: 2026-07-25
updated: 2026-07-25
last_agent: cody-session-0705
sprint: S30
lane: repo
recipe: lane
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0692.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0705 — PL-027 slice: OG belt-color renderer graduation + fork F2 (publicity consent)

## Date

2026-07-25

## Operator

Brian + cody-session-0705 (dispatched worktree build lane)

## Goal

Two-piece PL-027 slice: (A) graduate the #288/#292 belt-color celebration-card prototype
(`scripts/prototypes/bbl-og-cards/`, which app code must not import) into the real OG render path
(`components/web/og/` + `/api/og`), rendering the payload's `beltColorHex`/`lineageLine`, null-safe
for legacy title/description-only payloads; (B) land the operator-RATIFIED fork F2 —
`Passport.allowSocialCelebration` (opt-in, `Boolean @default(false)`, editable ONLY in the
PassportEditor per ADR 0025) — and wire the MEMBER_OPT_IN approval path to READ it (false → fails
closed; true → approval proceeds). The celebration trigger call-site stays OUT of scope (still
queued in PL-027).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0692.md` (merge-review close; PRs #318/#321 landed the
  approval queue + celebration feeder, deliberately inert pending F2 + renderer graduation).
- Carryover: PL-027 in `docs/knowledge/wiki/planning-ledger.md` — this lane takes the
  renderer-graduation bullet + the F2 ratification (operator ratified in the dispatching session).

### Branch and worktree

- Branch: `auto/session-0705-og-belt-color-graduation`
- Worktree: `/Users/brianscott/dev/ronin-0705`
- Status at bow-in: clean
- Current HEAD at bow-in: `b615cd75`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | OG image route (`app/api/og/route.tsx` + `components/web/og/og-base.tsx`), Prisma schema |
| Extension or replacement | Extension: a `card=rank-promotion` variant branch in the existing `/api/og` route; `OgBase` untouched and remains the fallback. Additive Prisma column. |
| Why justified | The celebration card is a new render variant of the SAME OG endpoint the payloads already target — extending the route keeps ONE og URL contract. |
| Risk if bypassed | A second OG endpoint would fork the payload URL contract and the queue's `previewImageUrlOf` allow-list. |

### Graphify check

Worktree graph reads 0 nodes by design (not-built ≠ no matches); discovery was targeted reads from
this checkout: PL-027 ledger entry, `server/social-queue/*` (feeder, transitions, router, tests),
`app/api/og/route.tsx`, `components/web/og/og-base.tsx`, `lib/opengraph.ts`,
`components/web/passport/passport-editor.tsx`, `server/web/passport/{schemas,actions,payloads}.ts`,
`server/admin/people/{schemas,actions}.ts`, `prisma/schema.prisma` Passport model,
`scripts/prototypes/bbl-og-cards/cards.ts`.

### Grill outcome

Fork F2 was ratified BY THE OPERATOR in the dispatching session (mechanism:
`Passport.allowSocialCelebration`, opt-in, default OFF, PassportEditor-only). No open forks in-lane.
One in-code plan followed, not re-decided: SESSION_0686's transitions module + its pinned test
comment pre-specified the post-F2 semantics — "ok when the bit is true, consent-revoked when
false" — so bit-false at approve time auto-rejects (revocation honored at every later gate), and
`consent-unratified` leaves the reason vocabulary as unreachable.

## Cody pre-flight

### Pre-flight: OgPromotionCard (renderer graduation)

#### 1. Existing component scan

- Searched `components/web/og/`: only `og-base.tsx` (the generic OG card). Searched
  `components/web/` + `components/common/` for card/og/celebration: no celebration-card renderer
  exists in app code (the prototype lives in `scripts/prototypes/bbl-og-cards/` — banned import).
- Found: `OgBase` (kept as fallback), `LogoSymbol` (satori-safe SVG mark used by `OgBase`).

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes — the inventory covers
  interactive app UI primitives; an OG `ImageResponse` card is satori-JSX (inline styles only, no
  Tailwind/common components apply). Closest L1 pattern: `og-base.tsx` + `app/api/og/route.tsx`
  (the Dirstarter OG pipeline) — followed for fonts, loader, and component shape.
- Primitive API spot-check: `OgBase (title, description, faviconUrl, siteName, siteTagline)` —
  inline-style satori JSX; `LogoSymbol (style)` SVG. `loadGoogleFont(font, weight)` from
  `lib/fonts`.

#### 3. Composition decision

- New component justified: `OgPromotionCard` — no existing OG variant renders belt color/lineage;
  design copied/adapted from the prototype `renderPromotionCard` (PRs #288/#292) per the PL-027
  graduation bullet. `OgBase` is NOT modified; the route branches.

#### 4. Lane docs loaded

- PL-027 (planning-ledger) read; SESSION_0688 payload contract read
  (`server/social-queue/celebration-cards.ts` module doc).
- Runbook consulted: N/A (render-side).

#### 5. Dev environment confirmed

- Working directory: `/Users/brianscott/dev/ronin-0705/apps/web`
- Verification: `bun run typecheck` · `bun run lint:check` · `bun run format:check` ·
  `bun run test` (never bare `bun test fileA fileB` — FS-0027).

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0027 (parallel bun test), FS-0024 (git guard). Mitigation:
  `bun run test` only; every git command runs with absolute `cd` into the worktree.

### Pre-flight: Schema — `Passport.allowSocialCelebration` (fork F2)

#### 1. Petey invocation

- Petey waived: single additive column, operator-ratified spec in the dispatch (mechanism, default,
  editor surface all pinned).

#### 2. Design doc check

- Spec: `social-flywheel-approval-queue-spec-draft.md` §2.3 leg 3 (as quoted in
  `server/social-queue/transitions.ts`) — matches: `allowSocialCelebration Boolean @default(false)`.

#### 3. Existing schema scan

- Schema spot-check (read from `schema.prisma` directly): `Passport` — identity SoT; relevant
  fields `userId String? @unique` (claim state), `socialLinks Json?`; no existing consent/publicity
  column. `SocialQueueItem.consentBasis` is a `SocialConsentBasis` enum:
  `MEMBER_OPT_IN, AGGREGATE_ONLY, OWNED_CONTENT` (from `server/social-queue/schema.ts` +
  schema.prisma). No back-relations needed — scalar Boolean on Passport.

#### 4. Runbook consulted

- `docs/runbooks/database/schema-migration.md` + `prisma-workflow.md`: additive column, migration
  authored by hand (NEVER `migrate dev` — banned on shared local DB), rehearsed on a scratch DB via
  `migrate deploy` in timestamp order + `migrate diff` → "No difference detected".
- Effective target for rehearsal: scratch DB `ronin_scratch_0705` (localhost Postgres.app);
  DATABASE_URL and DIRECT_URL both pointed at it explicitly. Local `.env` stays untouched.

#### 5. Data flow reference

- Flow: social-queue approve (oRPC `socialQueue.approve` → `evaluateApprovalConsent` live re-check)
  + PassportEditor → `updatePassportAndProfile` / `updatePassportAndProfileAsAdmin` (ONE editor,
  ADR 0025).
- Lifecycle stage: member self-serve profile settings; admin People detail.

#### 6. FAILED_STEPS check

- Prior failures: FS-0031 (e2e DB hermetic); banned `migrate dev` (shared DB). Mitigation: hand-
  authored migration + scratch-DB rehearsal only.

### Pre-flight: Backend — consent gate wiring

#### 1. Auth predicates planned

- No new procedure. `socialQueue.approve` keeps its existing
  `APP_AREA_PERMISSIONS.socialQueue` (`social-queue.manage`) gate; the change only widens its
  passport select (`+ allowSocialCelebration`) and the pure gate's leg 3. PassportEditor writes ride
  the existing `userActionClient`/`adminActionClient` chains — no authz change.

#### 2. Existing action scan

- `evaluateApprovalConsent` (transitions.ts) is the ONE consent brain — leg 3 swaps from
  fail-closed-unratified to the real bit read, exactly as its own docstring pre-specified.
- `canEnqueueMemberOptInDraft` (celebration-cards.ts) delegates to it (never a parallel check) —
  post-F2 it becomes `consent.ok`.

#### 3. Data flow reference

- `sop-data-and-wiring-flows.md`: server action → Prisma → revalidate (PassportEditor);
  oRPC procedure (approve). No new flow shape.

#### 4. FAILED_STEPS check

- Prior failures: none specific to social-queue. Manual Boundary Registry: none.

## Task log

### SESSION_0705_TASK_01 — Renderer graduation (A)

Status: landed. See "What landed".

### SESSION_0705_TASK_02 — Fork F2 schema + consent wiring (B)

Status: landed. See "What landed".

## What landed

- **A — renderer graduation (render-side only):** the #288/#292 prototype's promotion-card design
  copied/adapted (never imported) into `components/web/og/og-promotion-card.tsx` (satori JSX) +
  `promotion-card-params.ts` (pure, unit-tested normalization: hex-validated belt color with accent
  fallback, length clamps, null-safe legacy fallback). `/api/og` branches on `card=rank-promotion`;
  incomplete/legacy URLs (title/description only) keep rendering the generic `OgBase`, so the
  SESSION_0688 preview column stays null-safe end to end. The celebration feeder now writes the
  card params (`card`/`name`/`beltName`/`beltColorHex`/`date`/`lineageLine`) into the payload's
  relative `ogImageUrl` (title/description still ride along as the fallback contract).
- **B — fork F2 (operator-RATIFIED):** `Passport.allowSocialCelebration Boolean @default(false)`
  (additive migration `20260725000000_add_passport_allow_social_celebration`, hand-authored, NEVER
  `migrate dev`). Editable ONLY in the PassportEditor (ADR 0025) — new "Publicity" opt-in checkbox
  in the Identity section; the value rides both the self-serve and admin combined actions through
  the existing schemas (no new action). The MEMBER_OPT_IN approval path now READS the bit live:
  `evaluateApprovalConsent` leg 3 = `allowSocialCelebration === true` (the exact one-line swap 0686
  pre-specified); false → fails closed as `consent-revoked` (approve auto-rejects — revocation
  honored at every later gate); true → approval proceeds. `consent-unratified` retired from the
  reason vocabulary. The enqueue gate (`canEnqueueMemberOptInDraft`) now requires the full check —
  no draft is generated for a non-consenting subject.
- **NOT landed (deliberately, per dispatch):** the celebration trigger call-site —
  `enqueueRankPromotionCelebration` still has NO caller; `/app/social-queue` sidebar nav still
  absent. Both stay queued in PL-027.

## Decisions resolved

- F2 ratified by the operator (dispatching session): `Passport.allowSocialCelebration`, opt-in,
  default OFF, PassportEditor-only.
- Bit-false at approve = `consent-revoked` (auto-reject), not a new stays-DRAFT reason — follows
  the 0686 in-code pinned plan ("ok when the bit is true, consent-revoked when false"); not
  re-decided in-lane.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | `Passport.allowSocialCelebration Boolean @default(false)` (fork F2) |
| `apps/web/prisma/migrations/20260725000000_add_passport_allow_social_celebration/migration.sql` | hand-authored additive migration |
| `apps/web/components/web/og/promotion-card-params.ts` | NEW — pure param normalization (hex guard, clamps, null-safe) |
| `apps/web/components/web/og/og-promotion-card.tsx` | NEW — belt-color celebration card (satori JSX, prototype design graduated) |
| `apps/web/components/web/og/promotion-card-params.test.ts` | NEW — render null-safety + untrusted-input tests |
| `apps/web/app/api/og/route.tsx` | `card=rank-promotion` branch → `OgPromotionCard`; `OgBase` fallback unchanged |
| `apps/web/lib/opengraph.ts` | `promotionCardSearchParams` + `ogImageSearchParams`; serializer widened |
| `apps/web/server/social-queue/celebration-cards.ts` | payload URL carries card params; enqueue consent = full post-F2 check; select + docs |
| `apps/web/server/social-queue/transitions.ts` | consent leg 3 reads `allowSocialCelebration`; `consent-unratified` retired |
| `apps/web/server/orpc/routers/social-queue.ts` | approve selects the bit; unratified CONFLICT branch removed |
| `apps/web/server/web/passport/schemas.ts` | `allowSocialCelebration: z.boolean().optional()` on `updatePassportSchema` |
| `apps/web/server/web/passport/payloads.ts` | `passportOnePayload` selects the bit (editor read path) |
| `apps/web/components/web/passport/passport-editor.tsx` | "Publicity" opt-in checkbox (Identity section) + form value |
| `apps/web/server/social-queue/transitions.test.ts` | consent table updated: true→ok, false→revoked, adversarial placeholder+true |
| `apps/web/server/social-queue/celebration-cards.test.ts` | opt-in fixtures, not-opted-in skip test, card-param URL assertions |
| `apps/web/server/orpc/routers/social-queue.test.ts` | opted-in→APPROVED (no publish), not-opted-in→auto-rejected |
| `docs/sprints/SESSION_0705.md` | this file |

## Verification

Migration rehearsal (scratch DB `ronin_scratch_0705`, local `.env`/prodsnap untouched):

| Command | Result |
| --- | --- |
| `psql -d postgres -c 'DROP/CREATE DATABASE ronin_scratch_0705'` | exit 0 |
| `DATABASE_URL=…scratch… bunx prisma migrate deploy` | full chain in timestamp order, ends `…20260725000000_add_passport_allow_social_celebration`, "All migrations have been successfully applied.", exit 0 |
| `bunx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` (datasource=scratch) | "No difference detected.", exit 0 |

Gates (all real exit codes, foreground, post-resume):

| Command | Result |
| --- | --- |
| `bunx prisma generate --no-hints` (apps/web) | exit 0 |
| `bun run typecheck` (apps/web: `next typegen && tsc --noEmit`) | exit 0 |
| `bun run typecheck` (root, all workspaces) | exit 0 — ui-kit/api-client/rdd/baseline/web all "Exited with code 0" |
| `bun run lint:check` (apps/web) | exit 0 (pre-existing warnings only; lint-button-type OK) |
| `bun run format:check` (apps/web) | exit 0 ("All matched files use the correct format.") |
| `bun run test server/social-queue/transitions.test.ts server/social-queue/celebration-cards.test.ts server/orpc/routers/social-queue.test.ts components/web/og/promotion-card-params.test.ts` (apps/web, `--parallel=1` runner) | 76 pass / 0 fail, exit 0 |
| `bun run test server/web/passport/public-projection.test.ts components/web/lineage/galaxy/bbl-galaxy-from-lineage.test.ts` | 13 pass / 0 fail, exit 0 |

**Full-suite caveat (expected, structural):** the FULL `bun run test` run red-gates in this
worktree with Prisma P2022 on real-DB suites — the worktree's generated client knows
`Passport.allowSocialCelebration` but the shared local `ronindojo_prodsnap` correctly does NOT
have the migration applied (lanes never migrate the shared DB; the merge owner applies it —
the exact 0686/0688 `SocialQueueItem` precedent, whose tests were mock-seamed for this same
reason). CI runs migrations on its hermetic DB and is authoritative. All suites touching THIS
lane's code are hermetic and pass (above).

## Proposed ledger edits

> Lane rule: shared ledgers are NOT edited from a worktree. Merge owner applies these.

- **PL-027 (`docs/knowledge/wiki/planning-ledger.md`):**
  - "Ratify (operator) — fork F2" → **ratified + landed** (SESSION_0705): `Passport.allowSocialCelebration`,
    opt-in, default OFF, PassportEditor-only; MEMBER_OPT_IN approvals now verify the live bit
    (false → fail closed `consent-revoked`, true → approve proceeds). `consent-unratified` retired.
  - "Belt-color renderer graduation" bullet → **done** (SESSION_0705): `components/web/og/`
    `OgPromotionCard` + `card=rank-promotion` on `/api/og`; feeder payload URL graduated; legacy
    payloads fall back to OgBase.
  - **Still queued:** celebration trigger call-site (`enqueueRankPromotionCelebration` — no
    caller; must be authz-gated when wired) + `/app/social-queue` sidebar nav residue. Status can
    stay open on those two bullets.
- **Custom-component-inventory:** add `OgPromotionCard` (+ `promotion-card-params`) under the OG
  render path family (merge owner, at ledger-apply).
- **Merge-owner post-merge step:** apply the migration to the shared local DB
  (`bunx prisma migrate deploy` on `ronindojo_prodsnap` after preflight per the schema-migration
  runbook) so full local suites go green again; prod auto-applies via `prebuild → migrate deploy`.

## Open decisions / blockers

- Trigger call-site wiring (PL-027) — operator decision on where `enqueueRankPromotionCelebration`
  fires (admin action on RankEntry verify / event hook / nightly diff); must be authz-gated.
- Legacy pre-F2 DRAFT items for non-opted-in subjects will AUTO-REJECT (terminal,
  `consent-revoked`) on their first approve attempt — correct per spec §2.3, but worth the
  operator knowing before bulk-approving old test drafts.
- `SOCIAL_CONSENT_BASIS` docstring in `server/social-queue/schema.ts` still says "fork F2" without
  the ratified column name — cosmetic; left untouched to keep the diff scoped.

## Next session

### Goal

PL-027 remaining slice: wire the authz-gated celebration trigger call-site + add the
permission-gated `/app/social-queue` sidebar nav entry.

### First task

Grill the trigger fork (admin action on RankEntry verify vs event hook vs Phase-D nightly diff)
with the operator, then wire `enqueueRankPromotionCelebration` behind the chosen, authz-gated
seam and end-to-end smoke the queue: promotion → draft → approve (opted-in member) → belt-color
card preview renders.
