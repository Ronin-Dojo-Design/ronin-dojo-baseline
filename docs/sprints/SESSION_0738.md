---
title: "SESSION 0738 — fan-out: #398 FI-001 proof lane (A) + D-062 register extras (B) via recipe cards"
slug: session-0738
type: session--open
status: closed
created: 2026-08-02
updated: 2026-08-03
last_agent: claude-session-0738
sprint: S13
lane: bbl
recipe: "epic-plan"
status_note: "closed — EXTENDED: both lanes landed; #398 executed LIVE + closed; next lane #380"
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0737.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0738 — fan-out: #398 FI-001 proof (A) + D-062 register extras (B)

**Date:** 2026-08-03 · **Operator:** Brian + claude-session-0738

## Goal

Run two genuinely-disjoint lanes in parallel worktrees as a **fan-out / recipe-cards** session
([`recipes/epic-plan.md`](../protocols/recipes/epic-plan.md), one recipe card per lane; the
[`fan-out-session-recipe.md`](../protocols/fan-out-session-recipe.md) §1 disjointness test is met —
billing/migration-proof vs belt/lineage cleanup are distinct file sets):

- **Lane A — #398 FI-001 proof lane.** FI-001 critical path is #398 → #380 → cutover. **#398 is/was
  BLOCKED ON USER** (Vercel/Neon dashboard steps only Brian can run). Confirm the unblock status FIRST;
  if still blocked, hold A and run B solo. Baton inputs are pre-filled in `SESSION_0734.md`
  `## Next session` (#398, #380, D-058, RISK-16, `apps/web/scripts/prebuild-migrate.ts`).
- **Lane B — D-062 register EXTRAS** (all behavior-preserving except where noted):
  `schemas.ts:98` `z.string()`→enum on `verificationStatus` (**verify no valid trust value is excluded
  first** — this one can change behavior if the enum is narrower than live data); the
  first-in-discipline-else-`[0]` accessor extraction triplicated across `belt-gate.ts:41,209` /
  `member-ranks.ts:119` / `canvas-model.ts:77`; `canvas-model.ts:336` `buildDescendantCounts` O(depth)
  `new Set(seen)` per node → documented O(n); the non-UTC `formatDate` off-by-one
  (`promoter-change-modal:55`); cosmetics (`queries.ts:82` orphan doc-comment, `schemas.ts:11` `cuid`
  misnomer, `promoter-proposal-core.ts:216` `while(true)` max-iter guard).

## Status

Frontmatter `status:` is the single source of truth (staged → in-progress at bow-in).

## Bow-in

- Previous session: `docs/sprints/SESSION_0737.md` — closed the 4 staged D-062 clusters (PR #406) +
  proved WL-P2-83 GATE CLEAR. This session takes the remaining register extras + the #398 proof lane.
- Read first: `docs/knowledge/wiki/drift-register.md` §D-062 (Still-OPEN list) + `recipes/epic-plan.md`
  + the #398 baton in `SESSION_0734.md` `## Next session`.
- **Fan-out guard:** each lane gets its OWN `../ronin-NNNN` worktree + branch (worktree-isolation law);
  do not co-edit canonical. Lane A is DB/deploy-shaped (foreground gates + operator-gated dashboard
  steps); lane B is pure-cleanup (behavior-preserving, verify vs the frozen RankAward/#380 seam).

## Lane A — #398 discovery + Giddy /rr (DB separation)

- **Reframed, HELD (no prod change).** Confirmed the #398 defect LIVE (`DATABASE_URL`+`DIRECT_URL`
  scoped `Production, Preview` on the `ronin-dojo-baseline` project = BBL's, misnamed, git-connected
  to `black-belt-legacy`; only BBL is git-connected → Previews are BBL-only). Topology surprise: the
  project still owns stale MMB/Baseline/RDD prod domains (mid-cutover). Operator elected "separate BBL
  first" → ran **/rr** (seq-research-recommend) with Giddy.
- **Graphify prior-art:** `graphify query "per product database provisioning brand separation neon"`
  → ADR 0038, ADR 0057, `docs/runbooks/database/per-app-db-separation.md`, G-002, `new-brand-setup`.
- **Report:** `docs/reviews/2026-08-03-neon-brand-db-separation-rr.md`.
- **Recommendation (Giddy):** operator's instinct is **already ratified law** — claim the existing
  Neon project as BBL's (declare + env-scope, **no rename, no data move**), stand up a **new Neon
  project** per other brand as it cuts over, layer a **Neon Preview branch** to close #398. This is
  execution of G-002 Phase-2 cloud half, not a new ADR.
- **Key correction:** BBL's prod DB is **ONE multi-tenant DB** (Brand enum column, 136 models,
  ~40 brand-scoped), **not** per-brand databases — Baseline rows physically still inside (prodsnap
  `Rank`: 195 null/BBL, 20 Baseline, 1 BBL). "Claim as BBL" = declare now + purge foreign rows LATER
  (gated destructive lane).
- **EXECUTED LIVE (operator ratified "separate BBL first" → then walked the steps together).** After
  the grill, the #398 Preview-isolation slice was executed operator-foreground: Neon **`preview`
  branch** (child of `production`); Vercel `DATABASE_URL`/`DIRECT_URL` scoped **Production-only** with
  Preview pointed at the branch; **Standard Deployment Protection** on Preview; **`production` Neon
  branch protected**. **Proof** (throwaway PR #408, closed/reverted): Preview build logged
  `[prebuild-migrate] SKIP: VERCEL_ENV=preview`, went READY against the branch, prod
  `_prisma_migrations` gained **0** rows. **#398 CLOSED**; D-058/RISK-16 resolved.
- **Mechanism ratified (/grill-me A/A/A):** single persistent `preview` branch + manual explicit apply;
  reset-from-`production` after a migration merges; `PREVIEW_DIRECT_URL` + echo-identity guardrail; no
  auto-delete; guard keeps skipping preview. Documented in `schema-migration.md`. CI-automation +
  per-PR ephemeral branches deferred.
- **Docs:** PR **#409** (`schema-migration.md` mechanism + `/rr` report + this SESSION + G-002).

## Lane B — D-062 register extras (MERGED)

- PR **#407 MERGED** (squash `25524d7e`; branch `session-0738-d062-extras`, deleted). All 5 items done
  (verificationStatus→`z.nativeEnum(RankEntryStatus)` verified-safe; accessor extracted to
  `lib/belt/discipline-scope.ts`; `buildDescendantCounts` O(n) byte-identical; UTC `formatDate`;
  cosmetics). tsc/test/lint + `next build` green; `rank-award-read-guard` PASS. **/ggr 9.1/10 (Class B,
  no hard-cap)**, all CI green. Prod auto-deployed on merge (code-only, no migration).

## Goal verdict

**EXTENDED.** Both planned lanes landed AND overshot: Lane B (#407) merged; Lane A's #398 was not just
"proven" — it was **executed live + closed** (Neon branch + env scoping + protection + throwaway proof),
plus a Giddy **/rr** established the DB-separation strategy (= ratified ADR-0038 law) with the
single-multi-tenant-DB correction recorded on G-002.

## Review log

- **Lane B (#407)** — Giddy **/ggr composite 9.1/10, Class B, no hard-cap** (clears ADR-0052 ≥9.0). All
  4 load-bearing claims verified HOLD; fallow 0 new gated findings. All CI green → merged.
- **Lane A (#398)** — proof-gated ops lane; evidence = the Preview build `SKIP` log + 0 prod migration
  rows. `/rr` report Giddy-authored.
- **Close (this PR #409)** — docs-only; no shippable code touched → no separate `/ggr` required
  (bow-out-gates Gate 12d).

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | n/a (ops/docs session) |
| wiki:lint | 0 err / 115 warn (pre-existing, unrelated files) |
| Build | Lane B `next build` PASS (pre-merge); close PR docs-only |
| /ggr | Lane B 9.1/10; close docs-only n/a |
| Graphify | nodes=15315 edges=33948 (refresh authoritative POST-#409-merge) |
| Secret scan | PASS (clean) |
| Git state | branch=session-0738-398-preview-isolation-docs · clean |
| Telemetry | ~16.1M tokens (182k output) · est $15.46 · elapsed ~2h |

## Reflections

- The staged stub framed Lane A as a "proof lane," but discovery flipped it: the real blocker wasn't
  the code half (landed) — it was the **shared-project/DB topology** (BBL = the misnamed
  `ronin-dojo-baseline` project; ONE multi-tenant Neon DB still holding non-BBL rows). Grilling the
  open fork before building surfaced that the operator's "claim existing as BBL" instinct was already
  ratified ADR-0038 law — /rr converted a guess into a cited plan.
- Operator-foreground execution held: every prod-adjacent change was a staged click-path the operator
  ran, verified after via `vercel env ls` / the Vercel API / the Neon SQL editor — no credential value
  ever entered the agent. The throwaway-proof pattern (inert `SELECT 1;` migration → read the Preview
  build `SKIP` log → operator confirms 0 prod rows) is a reusable isolation-proof recipe.

## Next session

- **Goal:** **#380 — G-011 RankAward table-drop** (now unblocked; #398 closed removed its stated
  blocker). Next on the FI-001 critical path (#398 → #380 → cutover).
- **First task:** open #380 + the frozen-seam context; plan the attended destructive-drop sequence
  (additive expand → backfill → dual-read/write proof → writer cutover → guard → **drop LAST**), with
  foreground prod preflight + parity proof. Read-before-build: `schema.prisma` RankAward/RankEntry,
  `rank-award-read-guard`, the #380 issue, ADR 0035/0058 display law.
- **Kickoff prompt:** hydrate at bow-in from the #380 issue + this session's Review log. NOTE: #380 is
  **destructive + attended** — never a solo auto-merge lane; operator-gated at every irreversible step.
