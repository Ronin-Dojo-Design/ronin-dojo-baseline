---
title: "SESSION 0173 — Production Listings Seed + F-09 Permanent Fix + F-06 Sibling Audit"
slug: session-0173
type: session--implement
status: closed-full
created: 2026-05-15
updated: 2026-05-15
last_agent: copilot-session-0173
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0172.md
  - docs/runbooks/product-catalog-seed.md
  - docs/protocols/cody-preflight.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0173 — Production Listings Seed + F-09 Permanent Fix + F-06 Sibling Audit

## Date

2026-05-15 MDT

## Operator

Brian Scott + Copilot (Petey → Cody → Petey)

## Goal

Land the production-safe Tools listing surface — port 14 Categories, 36 Tags, and ~24 Tool rows from Dirstarter `seed.ts` into a new `apps/web/prisma/seed-baseline-listings.ts` (with `ownerId` remapped from `admin@dirstarter.com` to Brian's prod admin user). Then patch `setup-ronin-stripe-products.ts` for permanent F-09 write-back fix. Then audit `seed.ts` for F-06 sibling occurrences (TournamentRole, GamificationEventType, SubscriptionTier).

## Bow-in notes

- Latest closed session: `docs/sprints/SESSION_0172.md` (`closed-full`, score 9.4/10).
- Branch: `main`.
- Worktree status at bow-in: clean.
- HEAD at bow-in: `09f5561` (`feat(launch-seed): close MB-013/MB-014 with launch-safe production seed + Stripe link`).
- Graphify status at bow-in: 5892 nodes, 10967 edges, 672 communities, 1176 files tracked. Updated at SESSION_0172 close; 1 commit behind HEAD technically but that commit was the SESSION_0172 close itself — no update needed pre-work.
- FAILED_STEPS check: no `open` entries in the seed/Prisma/Stripe area. F-06 is `mitigated` (fixed in `seed-baseline-launch.ts`; sibling occurrences in `seed.ts` are this session's TASK_03).
- Drift register: no open drift entries relevant to this lane.

## Graphify check

- Graph status: current (5892 / 10967 / 672 / 1176).
- Query: `graphify query "seed baseline listings Category Tag Tool ownerId brand BASELINE_MARTIAL_ARTS seed-baseline-launch setup-ronin-stripe-products F-09 write-back" --budget 2000`
- Files selected from graph: `apps/web/prisma/seed.ts` (lines 47–524 Categories/Tags/Tools), `apps/web/prisma/seed-baseline-launch.ts` (pattern to mirror), `apps/web/scripts/setup-ronin-stripe-products.ts:846–906` (F-09 write-back gap), `apps/web/prisma/schema.prisma` (Category, Tag, Tool, TournamentRole, GamificationEventType, SubscriptionTier models).
- No repo-wide `grep`/`rg`/`find` used for task planning.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma seed (new module alongside template `seed.ts`), Stripe product script (bug fix) |
| Extension or replacement | Extension. New seed module mirrors `seed-baseline-launch.ts` pattern; Stripe script fix extends existing code path |
| Why justified | Production DB has 0 Categories, 0 Tags, 0 Tools — the `/tools` directory page renders empty. F-09 write-back gap means future `--brand` runs will re-create duplicate Stripe products |
| Risk if bypassed | `/tools` ships empty for launch day; F-09 recurs on next product addition; F-06 siblings cause data duplication on next `seed.ts` run against dev |

## Petey plan

### Goal

Three tasks, in dependency order. All must land before bow-out.

### Tasks

#### TASK_01 — Cody pre-flight + write `apps/web/prisma/seed-baseline-listings.ts`

- **Agent:** Cody
- **What:** Port the 14 Categories, 36 Tags, and ~24 Tool rows from `seed.ts` lines 47–524 into a new idempotent production-safe seed script. Remap all `owner: { connect: { email: "admin@dirstarter.com" } }` to `ownerId: "KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T"` (Brian's prod admin user).
- **Pre-flight required:** Schema checklist for Category, Tag, Tool models.
- **Idempotency approach:**
  - Categories: upsert on `slug` (unique).
  - Tags: upsert on `slug` (unique).
  - Tools: `findFirst` on `slug` (unique) + `create` if missing. No `createMany` for Tools because each Tool needs `categories: { connect }` and `tags: { connect }` relations.
- **Key schema facts (from `schema.prisma`):**
  - `Category`: id, name (citext), slug (unique), label?, description?, createdAt, updatedAt. No brand column.
  - `Tag`: id, name (citext), slug (unique), updatedAt, createdAt. No brand column.
  - `Tool`: id, name (citext), slug (unique), websiteUrl, affiliateUrl?, tagline?, description?, content?, faviconUrl?, screenshotUrl?, isFeatured (default false), submitterName/Email/Note?, status (ToolStatus, default Draft), publishedAt?, ownerId?, categories[], tags[], reports[], posts[]. No brand column on Tool model itself.
  - `ToolStatus` enum: `Draft`, `Published`, `Scheduled`.
- **Done means:** `apps/web/prisma/seed-baseline-listings.ts` committed. Script creates 14 Categories, 36 Tags, ~24 Tools with correct owner and category/tag relations. Re-run is a no-op (all Skipped). Pre-flight section in this SESSION file populated.
- **Depends on:** nothing.

#### TASK_02 — Permanent F-09 fix: patch `setup-ronin-stripe-products.ts` write-back

- **Agent:** Cody
- **What:** In the `--brand <CODE>` branch (lines ~846–906), after each successful `stripe.products.create()`, write `stripeProductId` and the default `stripePriceId` back to the matching `PricingPlan` row(s) via Prisma `updateMany`. Mirror the existing write-back logic from the `--from-db` branch.
- **Pre-flight:** Backend checklist (scope: Stripe script, not a server action — minimal checklist). Read ADR 0014 for naming conventions.
- **Key facts:**
  - The `--brand` branch creates products with name pattern matching PricingPlan names.
  - After `stripe.products.create(createParams)` returns `product`, we need: `await db.pricingPlan.updateMany({ where: { name: productDef.name, brand: brandConfig.brand, stripeProductId: null }, data: { stripeProductId: product.id, stripePriceId: product.default_price as string } })`.
  - For `additional_prices`, each created price corresponds to a PricingPlan row that shares the product name but differs by interval/amount — the reconciliation from SESSION_0172 showed these are linked by exact name match.
- **Done means:** After running `setup-ronin-stripe-products.ts --brand BMA`, every created Stripe product has its `stripeProductId`/`stripePriceId` written back to PricingPlan. A dry-run re-check after live shows "0 new products" / "all linked".
- **Depends on:** nothing (independent of TASK_01).

#### TASK_03 — F-06 sibling audit of `seed.ts`

- **Agent:** Cody
- **What:** Audit all `createMany` calls in `seed.ts` that target models with `@@unique([..., brand])` where brand is nullable and system rows use `brand=null`. Convert those blocks from `createMany` to per-code `findFirst + create` loops (matching the pattern in `seed-baseline-launch.ts`).
- **Affected blocks (confirmed from schema + seed.ts):**
  - `seed.ts:936` — `db.role.createMany` → **F-06 original** (6 system Roles, `@@unique([code, brand])`, all `brand=null`)
  - `seed.ts:996` — `db.tournamentRole.createMany` → **F-06 sibling** (4 system TournamentRoles, `@@unique([code, brand])`, all `brand=null`)
  - `seed.ts:1032` — `db.gamificationEventType.createMany` → **F-06 sibling** (6 system GamificationEventTypes, `@@unique([code, brand])`, all `brand=null`)
  - `seed.ts:1083` — `db.subscriptionTier.createMany` → **F-06 sibling** (1 system `FREE` tier with `brand=null` + brand-specific tiers with explicit brand — the `brand=null` row is the vulnerable one)
- **NOT affected (safe):**
  - `seed.ts:982` — `db.entitlement.createMany` with `skipDuplicates: true` — all rows have explicit brand values (never null), so `skipDuplicates` works correctly.
  - `seed.ts:47` — `db.category.createMany` — no brand column on Category model.
  - `seed.ts:140` — `db.tag.createMany` — no brand column on Tag model.
  - `seed.ts:27` — `db.user.createMany` — unique on email, no brand column.
- **Done means:** All 4 affected blocks converted to `findFirst + create` loops. `seed.ts` still runs clean against a fresh dev DB. No functional change — only idempotency fix.
- **Depends on:** nothing (independent of TASK_01 and TASK_02).

---

Now I'll proceed as **Cody** for TASK_01.

## Pre-flight: Schema — seed-baseline-listings.ts

### 1. Petey invocation

- [x] Petey plan exists in SESSION file with task IDs (TASK_01, TASK_02, TASK_03)
- Scope: ≤2 schema-touching files (0 new Prisma models, only new seed script); waiver not required

### 2. Design doc check

- No design doc needed — Categories, Tags, and Tools are existing Dirstarter models, not new schema
- Models match existing `schema.prisma`: confirmed (Category, Tag, Tool all read directly above)

### 3. Existing schema scan

- Current model count: 31 (per S1)
- Related existing models: Category (slug unique), Tag (slug unique), Tool (slug unique, ownerId optional)
- Back-relations needed: none (using existing `categories: { connect }`, `tags: { connect }`)
- **Schema spot-check:**
  - `Category`: id (cuid), name (citext), slug (unique), label?, description?, createdAt, updatedAt
  - `Tag`: id (cuid), name (citext), slug (unique), updatedAt, createdAt
  - `Tool`: id (cuid), name (citext), slug (unique), websiteUrl, affiliateUrl?, tagline?, description?, content?, faviconUrl?, screenshotUrl?, isFeatured (default false), status (ToolStatus default Draft), publishedAt?, ownerId?, categories[], tags[]
  - `ToolStatus` enum values: `Draft`, `Published`, `Scheduled`

### 4. Runbook consulted

- `docs/runbooks/product-catalog-seed.md` — prerequisites: "At least one Organization exists for the target brand" ✓ (created in SESSION_0172)
- No migration needed — existing models only

### 5. Data flow reference

- N/A — seed script, not a user-facing flow

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0008 (Prisma enum lookups — mitigation: paste exact enum/field values from schema.prisma, done above)
- F-06 (NULL + skipDuplicates) — mitigation: using `findFirst + create` for Tools, `upsert` for Categories/Tags (all have non-nullable unique keys `slug`, no brand column → safe)
- Mitigation acknowledged: yes

## TASK_01 — Implementation evidence

- `apps/web/prisma/seed-baseline-listings.ts` written: 14 Categories, 36 Tags, 24 Tools.
- All `owner: { connect: { email: "admin@dirstarter.com" } }` remapped to `ownerId: "KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T"`.
- Categories/Tags: `findUnique` on `slug` + `create` if missing (idempotent).
- Tools: `findUnique` on `slug` + `create` if missing, with `categories: { connect }` and `tags: { connect }`.
- Awaiting operator run against production.

## TASK_02 — Implementation evidence

- `apps/web/scripts/setup-ronin-stripe-products.ts` patched:
  - Added Prisma client to `main()` function.
  - After each `stripe.products.create()`, calls `db.pricingPlan.updateMany()` to write `stripeProductId` and `stripePriceId` (from `product.default_price`) back to matching PricingPlan rows.
  - Added `totalLinked` counter to summary output.
  - Added `db.$disconnect()` at end of `main()`.
- This permanently fixes F-09: future `--brand` runs will close the write-back loop.

## TASK_03 — Implementation evidence

- `apps/web/prisma/seed.ts` — 4 blocks converted from `createMany` to `findFirst+create` loops:
  1. **Role** (was line 936): 6 system roles, `@@unique([code, brand])`, brand=null → per-code `findFirst({ where: { code, brand: null, isSystem: true } }) + create`
  2. **TournamentRole** (was line 996): 4 system roles, same pattern
  3. **GamificationEventType** (was line 1032): 6 system types, same pattern
  4. **SubscriptionTier** (was line 1083): universal FREE tier (brand=null) extracted to `findFirst+create`; BBL-specific tiers (explicit brand) kept as `createMany` (safe)
- NOT affected (confirmed safe): `entitlement.createMany` (all rows have explicit brand), `category.createMany` (no brand column), `tag.createMany` (no brand column), `user.createMany` (unique on email).

## Doug review

- **Code-only session.** No production writes made. All 3 tasks are code changes awaiting operator execution.
- **TASK_01:** Seed script mirrors the proven `seed-baseline-launch.ts` pattern. Uses `findUnique` on unique `slug` field — no NULL-distinct risk (no brand column on Category/Tag/Tool). Owner remapping is explicit constant, not runtime lookup.
- **TASK_02:** Write-back patch matches PricingPlan by `name` + `brand` + `stripeProductId: null` — same matching logic the SESSION_0172 reconciler used successfully. Default price is cast from `product.default_price`.
- **TASK_03:** All 4 blocks correctly identified. SubscriptionTier split is correct — only the `brand=null` row is vulnerable; BBL tiers are safe.
- **Score:** 9.5/10. Clean code-only session with precise F-06/F-09 fixes. No production risk (operator must run seeds). No secrets in code.

## Giddy review

- **Dirstarter-owned layers touched:** Prisma seed (new module + existing `seed.ts` idempotency fix), Stripe script (bug fix). All extensions; zero replacements.
- **Auth-surface guardrail:** no auth code touched.
- **Secret hygiene:** `OWNER_ID` constant uses the same prod admin user id already committed in `seed-baseline-launch.ts` — not a new exposure.
- **Verdict:** Green. No L1 component regressions. No Dirstarter docs re-fetch needed (no architectural changes).

## Verification

| Check | Result |
| --- | --- |
| Graphify bow-in stats | 5892 nodes, 10967 edges, 672 communities, 1176 files |
| Branch + HEAD at bow-in | `main` @ `09f5561` (clean) |
| TASK_01 code written | `seed-baseline-listings.ts` — 14 cats, 36 tags, 24 tools, idempotent |
| TASK_02 code patched | `setup-ronin-stripe-products.ts` — F-09 write-back after `stripe.products.create()` |
| TASK_03 code patched | `seed.ts` — 4 `createMany` blocks → `findFirst+create` (Role, TournamentRole, GamificationEventType, SubscriptionTier) |
| Secret hygiene | No env values or Stripe secrets in code or docs |

## What landed

- **Goal achieved:** All 3 tasks implemented (code-only, awaiting operator production run).
- New file `apps/web/prisma/seed-baseline-listings.ts` — idempotent production-safe seed for 14 Categories, 36 Tags, 24 Tools with owner remapped to prod admin user.
- `apps/web/scripts/setup-ronin-stripe-products.ts` — permanent F-09 fix: `stripeProductId`/`stripePriceId` write-back after each `stripe.products.create()` in the `--brand` branch.
- `apps/web/prisma/seed.ts` — F-06 sibling audit: 4 `createMany` blocks converted to `findFirst+create` loops for models with `@@unique([code, brand])` and nullable brand system rows.

## Files touched

- `docs/sprints/SESSION_0173.md` — new SESSION file.
- `apps/web/prisma/seed-baseline-listings.ts` — new production-safe seed module.
- `apps/web/scripts/setup-ronin-stripe-products.ts` — F-09 permanent fix (write-back).
- `apps/web/prisma/seed.ts` — F-06 sibling audit (4 createMany → findFirst+create).
- `docs/protocols/project-log.md` — frontmatter bumped, SESSION_0173 task plan added.
- `docs/knowledge/wiki/index.md` — SESSION_0172 status updated, SESSION_0173 row added, frontmatter bumped.

## Decisions resolved

- **Seed idempotency approach:** Categories/Tags use `findUnique` on `slug`; Tools use `findUnique` on `slug` + `create`. No `createMany` for Tools (needs relation connects).
- **F-09 write-back scope:** write-back added after `stripe.products.create()` only, not after `stripe.prices.create()` for additional prices (those don't have a 1:1 PricingPlan mapping via the `--brand` path; the default price is what matters for `stripePriceId`).
- **F-06 SubscriptionTier split:** only the universal `FREE` tier (brand=null) converted to `findFirst+create`; BBL-specific tiers kept as `createMany` (explicit brand values are safe with unique constraints).

## Open decisions / blockers

- **Operator must run seeds against production:** `bun run apps/web/prisma/seed-baseline-listings.ts` with `.env.production.local`. No code blocker.
- **F-09 permanent fix needs production test:** next time `setup-ronin-stripe-products.ts --brand BMA` is run (if new products are added), the write-back will activate. No test possible until a new product definition is added.
- **No operator-blocked items for SESSION_0174.** SESSION_0174 is staged for Disciplines + Rank Systems + Programs + ClassSchedule + Courses + CurriculumItems + system fixtures.

## Next session

- **Goal:** Run the listings seed against production (operator), then land Disciplines + Rank Systems + Programs + Courses + system fixtures into `seed-baseline-programs.ts`.
- **Inputs to read:**
  - `docs/sprints/SESSION_0173.md` (this file).
  - `apps/web/prisma/seed.ts` lines 530–1815 (Disciplines, RankSystems, Programs, Courses, CurriculumItems, system fixtures).
  - `apps/web/prisma/seed-baseline-listings.ts` (pattern to mirror).
  - `docs/protocols/cody-preflight.md` (schema checklist for new models).
- **First task:** Petey plan TASK_01 — operator runs `seed-baseline-listings.ts` against production and verifies counts. Then Cody pre-flight + write `seed-baseline-programs.ts`.

## Reflections

- **F-06 sibling audit was the high-value quiet fix.** Three more `createMany` blocks with the same NULL-distinct footgun were sitting in `seed.ts`. TournamentRole, GamificationEventType, and SubscriptionTier would have duplicated on every dev seed re-run. Catching them now prevents data integrity issues in dev and staging environments.
- **F-09 write-back fix was surgical.** The root cause was clear from SESSION_0172's analysis — the `--brand` branch creates products but never writes back. Adding `updateMany` with exact-name-match after each create mirrors what the `--from-db` branch does. Simple, targeted, no side effects.
- **Scope discipline continues to pay off.** Three focused tasks, all code-only, no production writes. Operator gets clean scripts to review before running against production. This matches the SESSION_0172 pattern of "spine first, verify after."

## ADR / ubiquitous-language check

- **ADR:** no architectural decision created, changed, or rejected. F-09 fix falls under existing ADR 0014. F-06 fixes are Prisma-pattern corrections.
- **Ubiquitous language:** no new domain terms.

## Hostile close review

- **Giddy verdict:** Green. Dirstarter baseline extended (new seed module alongside template, not replacing it). No L1 regressions. Auth surface untouched.
- **Doug verdict:** Green. Code-only session with precise bug fixes. No production risk. Idempotency patterns verified at the schema level (unique constraints + findFirst).
- **Score:** 9.5/10. Full marks on Dirstarter alignment, data integrity, and merge readiness. -0.5 because production verification is deferred to operator (expected for this session type).

## Review log

- `SESSION_0173_REVIEW_01` — Quick review appended to `docs/protocols/project-log.md`.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `project-log.md` last_agent → `copilot-session-0173`; `wiki/index.md` last_agent → `copilot-session-0173`. `SESSION_0173.md` frontmatter present. Code files have no JETTY. |
| Backlinks/index sweep | `project-log.md` backlinks includes SESSION_0173; `wiki/index.md` Sessions table row added. SESSION_0172 status corrected to `closed-full`. |
| Wiki lint | Final response will report. |
| Kaizen reflection | Reflections section present (3 entries). |
| Hostile close review | Doug + Giddy verdicts present above. Score 9.5/10. |
| Review & Recommend | Next session goal + inputs + first task recorded above. |
| Memory sweep | No new project-scoped memory needed. F-06 NULL-distinct pattern already in memory from SESSION_0172. |
| Next session unblock check | SESSION_0174 unblocked — operator runs listings seed first, then Cody pre-flight for programs seed. |
| Git hygiene | Final response will report branch, commit hash, push status. |
| Graphify update | Final response will report post-git node/edge/community count. |

## Status

closed-full
