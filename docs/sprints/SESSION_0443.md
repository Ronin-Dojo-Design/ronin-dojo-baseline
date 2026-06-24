---
title: "SESSION 0443 — Lineage branch-head model set in stone + Truelson care (staged)"
slug: session-0443
type: session--implement
status: closed
created: 2026-06-24
updated: 2026-06-24
last_agent: claude-session-0443
sprint: S44
pairs_with:

  - docs/sprints/SESSION_0442.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0443 — Lineage branch-head model set in stone + Truelson care (staged)

## Date

2026-06-24

## Operator

Brian + claude-session-0443 (Petey)

## Goal

Two tracks, set by a bow-in grill (operator "nothing is canonical" — TASK_04 from 0442's Next-block
was de-selected). **Track 1:** take care of VIP Brian Truelson (highest priority) — stage his
lifetime-Elite thank-you funnel and rehearse the live claim loop end-to-end on a disposable Chayce
Johnson claimant first; the real Truelson `--send` is HELD on operator go. **Track 2:** set the BBL
lineage **branch-head** structure in stone (ADR 0037 — done in bow-in) and **build** the implied code:
seed a student's visual placement from the `INSTRUCTOR_STUDENT` edge at finalize, rename the canonical
tree `bbl-lineage` → `rigan-machado-lineage`, repoint the public viewer, retire the brand-clone seed.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0442.md`
- Carryover: 0442 shipped Slice B + finalize materialization (`331b43fb`) and **the held push went out**
  — `origin/main` = local `main` = `331b43fb` (0 ahead/0 behind). 0442's "Next session" block proposed
  TASK_04 (`/admin → /app` migration); the operator de-selected it at bow-in in favor of the two tracks
  above.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `331b43fb`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (lineage finalize write — set `primaryVisualParentMemberId`; one-row tree slug rename); Auth/claim (magic-link dogfood) |
| Extension or replacement | Extension: seeds the existing dual-model display projection (ADR 0016/0037) from the SESSION_0442 `INSTRUCTOR_STUDENT` edge; no schema change |
| Why justified | Branch heads are inert without visual filing; the edge already persists — finalize only projects it onto the editable visual parent |
| Risk if bypassed | Students keep landing as root-level orphans next to Rigan; the branch-head model never renders |

Live docs checked during planning: Prisma (schema for `LineageTree`/`LineageTreeMember`), Auth (claim).

### Graphify check

- Graph status: current; stats at bow-in: 15038 nodes, 28697 edges, 2006 communities, 2489 files.
- Queries used:
  - `lineage tree branch head root multiple sub-trees Rigan Machado Bob Bass member tree structure hierarchy`
- Files selected from graph: `lineage-family-tree-port-spec.md`, `lineage-tree-v1-requirements.md`,
  `apps/web/prisma/schema.prisma`, then `claim-finalize.ts`, `seed-bbl-org.ts`,
  `import-bbl-members-full.ts`, `disciplines/_components/lineage-tree-section.tsx`.
- Verification note: opened each file directly; Graphify used as navigation, not proof.

### Grill outcome

Resolved via `/grill-me` then `/grill-with-docs` (8 forks):

1. **Session shape = D** — dogfood/verify the live claim loop first, then build; TASK_04 dropped.
2. **Send posture = A (staged, held)** — Truelson fully staged but `--send` held on operator go;
   Chayce rehearsal uses the **full `--send` email-link path** (exercises the 0440 callbackURL).
3. **Truelson = VIP, not founder** — long-paying customer, highest priority; "take care of him."
4. **Test claimant = Chayce Johnson** (an existing node) via `ronindojodesign@gmail.com`, not Eric Cullet.
5. **Branch head purpose = C** — a stewardship/claim boundary (branch-scoped `LineageTreeAccess`), not
   cosmetic; D (per-branch sub-trees via `ownerNodeId`) is the eventual state, not now. Glossary already
   reserved "branch" as an ACL scope (`ubiquitous-language.md:273`).
6. **One canonical tree = A** — `bbl-lineage` (full roster) wins; **renamed → `rigan-machado-lineage`**;
   repoint the public discipline embed; retire the Baseline→BBL clone + smoke-test tree. **Brand is out.**
7. **Filed-under wiring = A** — finalize seeds `primaryVisualParentMemberId` from the `INSTRUCTOR_STUDENT`
   edge (projection from truth, editable); instructor-not-in-tree → student at root, flag steward.
8. **Build scope = B** — build the finalize fix + tree rename this session; push + prod rename HELD on go.

Captured inline: ADR 0037, glossary term "Branch head" (`ubiquitous-language.md`), lineage hub updates.

### Drift logged

- D-033 (new): two divergent trees — public BJJ viewer renders `rigan-machado-bjj-lineage` (thin
  Baseline clone) while the real 76-member roster lives in `bbl-lineage`; `seed-bbl-org.ts` brand-clone
  is dead weight under single-brand. Resolved by Track 2 (consolidate to `rigan-machado-lineage`).

## Petey plan

### Goal

Set the branch-head model in stone (done) and build the finalize visual-placement seed + tree
consolidation; stage the Truelson care funnel with a Chayce live rehearsal, sends held on go.

### Tasks

#### SESSION_0443_TASK_01 — Branch-head design set in stone (docs)

- **Agent:** Petey
- **What:** ADR 0037 + glossary term + lineage hub updates capturing branch heads, one canonical
  brand-agnostic tree, and the finalize-seeds-visual-placement rule.
- **Done means:** ADR 0037, `ubiquitous-language.md` "Branch head", hub mental-model + decisions list. ✅
- **Depends on:** nothing.

#### SESSION_0443_TASK_02 — Finalize: seed visual placement from the instructor edge

- **Agent:** Cody
- **What:** In `claim-finalize.ts`, set the new member's `primaryVisualParentMemberId` to the
  instructor's `LineageTreeMember` in the represent tree when `trainedUnderNodeId` resolves a member
  there; leave at root + flag steward otherwise. Idempotent; editable afterward.
- **Done means:** approving a claim with trained-under + tree files the student under the branch head;
  prodsnap rolled-back verify; unit/touched-area tests green.
- **Depends on:** TASK_01.

#### SESSION_0443_TASK_03 — Consolidate to one canonical tree

- **Agent:** Cody
- **What:** Rename `bbl-lineage` → `rigan-machado-lineage` (one-row data update), repoint the public
  discipline embed (`lineage-tree-section.tsx`), retire the `seed-bbl-org.ts` brand-clone + smoke-test
  tree. Brand-agnostic.
- **Done means:** public viewer resolves the one full-roster tree; clone path removed; `next build` green.
  Prod rename HELD on operator go.
- **Depends on:** nothing (independent of TASK_02).

#### SESSION_0443_TASK_04 — Truelson care, staged + Chayce live rehearsal (operator-gated)

- **Agent:** Petey (prep) + operator (live runs)
- **What:** Rehearse `setup-test-claimant.ts --send` for Chayce on prodsnap; render the Truelson email
  (`--dry-run`); stage the Truelson funnel commands (verify/backfill/grant/send). Operator runs the live
  prod steps; **both real sends HELD on go.**
- **Done means:** Chayce loop proven (operator clicks through); Truelson funnel staged + email approved;
  Truelson `--send` held.
- **Depends on:** prefers TASK_02 (so the rehearsal exercises filing-under-branch-head).

### Parallelism

TASK_02 and TASK_03 are disjoint (finalize write vs tree/seed/route); run inline sequentially. TASK_04
is operator-gated and interleaves with prep.

### Open decisions

- None at plan-lock. Edge-case (instructor-not-in-tree → student at root + steward flag) ratified.

### Risks

- TASK_02 mutates `finalizePassportClaim` (the moat) — verify via rolled-back prodsnap finalize, no
  persistence, before any push.
- TASK_03's prod slug rename is a real prod data change + public-viewer repoint — held on operator go.

### Scope guard

- No schema change. Push + prod rename + both real sends HELD on operator go (explicit-push-authorization).
- Do not run live prod `--bind`/`--grant`/`--send` (operator-only: prod Neon + Resend keys absent locally).

## What landed

- **Branch-head model set in stone (ADR 0037).** A *branch head* = a real person-node (instructor /
  school owner) placed under the tree root that anchors its students' visual placement; claiming it
  grants branch-scoped `LineageTreeAccess`. One canonical brand-agnostic tree; finalize seeds a
  student's `primaryVisualParentMemberId` from the `INSTRUCTOR_STUDENT` edge. Glossary term + lineage
  hub updated inline.
- **Finalize visual placement (TASK_02).** `claim-finalize.ts` now files students under their branch
  head (`materializeVisualPlacement`) — guards: instructor-not-in-tree → root, no-clobber, self-skip.
- **Complexity refactor.** Extracted `materializeAssertedSelections`; `finalizePassportClaim` 30→21
  cyclomatic, file maintainability 89.5→91.1.
- **Fresh §5d test pattern.** New `claim-finalize.test.ts` calls `finalizePassportClaim(tx, …)` directly
  in an always-rolled-back transaction — zero mocks, zero teardown, no DB pollution. Ported the rank
  lifecycle assertions and **retired** `claim-rank-lifecycle.test.ts`. SOP §5d documents the pattern;
  de-staled the ADR-0036 names + the `ronindojo_dev` claim.
- **Env model fixed.** `.env.prod` overlay convention (gitignored) + tracked `.env.prod.example`;
  documented that `--env-file=.env.prod` overlays `.env`. SOP corrected: local DB is `ronindojo_prodsnap`.
- **TASK_03 tree consolidation (HELD for prod).** `consolidate-rigan-machado-tree.ts` — idempotent,
  backup-on-apply, `--rollback` proven on prodsnap (apply→rollback→re-apply round-trip). Sets root +
  bjj discipline, migrates the Dirty Dozen group (comp-critical), renames `bbl-lineage` →
  `rigan-machado-lineage`, unpublishes the clone. Code repointed (brand-agnostic embed, join href, 4
  script defaults, slimmed `seed-bbl-org`). **Browser-verified** on prodsnap: tree + discipline embed
  render the 77-member roster; old slug 404s.
- **Preview Cluster B retired.** Removed the dead `previewToken` plumbing from the live claim path
  (`mint-claim-magic-link`, `public-actions`) + 3 send-scripts. Cluster A (the `/preview` gate) left
  dormant for re-gate capability (operator choice).

## Decisions resolved

- **ADR 0037 ratified** — branch heads, one canonical tree, visual-placement-seeded-from-provenance,
  instructor-not-in-tree → student-at-root.
- **Full 77-member roster** is the public tree (all claimable + verified); Dirty Dozen group migrated.
- **§5d rolled-back-tx** is the preferred helper-level pattern for tx-shaped functions.
- **`.env.prod` overlay** is the prod-ops convention (no secrets on the command line).
- **Brand is out** — embed repoint is brand-agnostic; Baseline left to its future separate deploy.
- **Preview Cluster B retired, Cluster A dormant.**
- **Everything HELD for push** (explicit-push-authorization). Prod tree cutover = data + code together.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/decisions/0037-…md` | NEW — branch-head + visual-placement ADR |
| `docs/architecture/ubiquitous-language.md` | + "Branch head" term |
| `docs/runbooks/domain-features/lineage-hub.md` | branch-head mental model + ADR 0037 in decisions list |
| `apps/web/server/admin/lineage/claim-finalize.ts` | `materializeVisualPlacement` + `materializeAssertedSelections` refactor |
| `apps/web/server/admin/lineage/claim-finalize.test.ts` | NEW — §5d test (rank + visual placement); replaces the legacy file |
| `apps/web/server/admin/lineage/claim-rank-lifecycle.test.ts` | DELETED — ported to §5d |
| `docs/runbooks/sops/sop-test-writing.md` | §5d pattern + ADR-0036/`ronindojo_dev` de-stale |
| `apps/web/.gitignore` · `apps/web/.env.prod.example` | NEW prod-ops overlay convention |
| `apps/web/scripts/consolidate-rigan-machado-tree.ts` | NEW — consolidation + rollback |
| `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx` | embed → `rigan-machado-lineage` (brand-agnostic) |
| `apps/web/app/(web)/lineage/join/join-legacy-landing.tsx` | explore-href → new slug |
| `apps/web/prisma/seed-bbl-org.ts` | slimmed to BBL Org (clone + smoke tree retired) |
| `apps/web/scripts/{import-bbl-members-full,enrich-bbl-members-pods,backfill-bbl-avatars,set-bbl-default-avatars}.ts` | default tree-slug → `rigan-machado-lineage` |
| `apps/web/server/web/lineage/mint-claim-magic-link.ts` · `server/web/lead/public-actions.ts` | removed `previewToken` (Cluster B) |
| `apps/web/scripts/{send-bbl-truelson-thankyou,send-bbl-claim-emails,send-founder-long-road-real}.ts` | removed `previewToken` |

## Verification

| Check | Result |
| --- | --- |
| `tsc --noEmit` (full) | 0 errors |
| `oxfmt --check` / `oxlint` (touched) | clean |
| `bun test` claim-finalize + review + callback-url + public-actions | 21 + 13 pass / 0 fail |
| fallow health / audit | maintainability 89.5→91.1; `finalizePassportClaim` 30→21 cyclomatic |
| consolidation rollback round-trip (prodsnap) | apply→rollback restored EXACT pre-state→re-apply ✓ |
| Browser (prodsnap, `:3000`) | `/lineage/rigan-machado-lineage` 200 (77 members, Rigan root, Bob Bass, Dirty Dozen); `/disciplines/bjj` 200; old `/lineage/bbl-lineage` 404 |
| Full `bun test` | NOT run (real-Resend landmine — touched-area suites only) |

## Open decisions / blockers

- **Push HELD** (explicit-push-authorization). One close commit will sit on local `main`, unpushed.
- **Prod tree cutover HELD** — run `consolidate-rigan-machado-tree.ts --apply` with `--env-file=.env.prod`
  AND deploy the held code together (embed now resolves the new slug). Save the backup path for rollback.
- **Operator-only:** rotate the leaked Neon + Resend creds → into `.env.prod`; Chayce rehearsal
  (`--send`) + Truelson staging (verify/backfill/send/grant).

## Next session

### Goal

Operator dogfood + prod cutover: run the Chayce rehearsal and Truelson care, then cut over the tree
consolidation on prod (data + code) and push the held session work.

### First task

`SESSION_0444_TASK_01` — after cred rotation, run `bun --env-file=.env.prod
scripts/consolidate-rigan-machado-tree.ts` (dry-run → `--apply`), deploy the held code, browser-verify
`blackbeltlegacy.com` shows the 77-member tree, keep the backup path for rollback. Then the Chayce/Truelson
dogfood. Optional: retire preview Cluster A if "never re-gate" is confirmed.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0443_TASK_01 | landed | ADR 0037 + glossary + hub (branch-head model set in stone) |
| SESSION_0443_TASK_02 | landed | Finalize visual placement + `materializeAssertedSelections` refactor + §5d test; legacy rank test retired |
| SESSION_0443_TASK_03 | held | Tree consolidation script (rollback proven) + code repoint; prodsnap consolidated + browser-verified; **prod cutover held** |
| SESSION_0443_TASK_04 | held | Truelson/Chayce dogfood prep (both nodes claim-verified on prodsnap; email approved); operator-gated sends held |
| SESSION_0443_TASK_05 | landed | `.env.prod` overlay convention + SOP `ronindojo_dev` de-stale |
| SESSION_0443_TASK_06 | landed | Preview Cluster B retired (Cluster A dormant) |

## Review log

### SESSION_0443_REVIEW_01 — branch-head model, finalize, consolidation, env, preview

- **Reviewed:** TASK_01–06. Build (finalize + refactor + test), data migration (consolidation, rollback-proven),
  governance (ADR/SOP/glossary), env hygiene, dead-code retirement.
- **Verdict:** Clean. Moat-touching changes verified without mutating prod: finalize via rolled-back §5d test;
  consolidation via prodsnap apply/rollback round-trip + browser render. Scope corrections surfaced early
  (consolidation = data migration not rename; preview = 2 clusters not 1) rather than discovered mid-grind.
- **Score:** 9/10 (−1: full `bun test` not run — Resend landmine; prod cutover unverifiable until operator runs it).
- **Follow-up:** prod cutover + push (held); cred rotation; dogfood; optional Cluster A.

### Findings (severity ≥ medium)

- **D-033 (drift):** the two BBL trees had diverged (77-member raw roster vs 20-member curated clone with
  groups/discipline) — public page showed the thin clone. Resolved by the consolidation (held for prod). Route
  to [`drift-register`](../knowledge/wiki/drift-register.md).
- **Security (operator):** prod Neon password + Resend key were pasted into chat + briefly into the tracked
  `.env.prod.example` (scrubbed, never committed). **Rotation required.**

## Hostile close review

- **Giddy:** pass — scope honesty (two scope corrections surfaced + checkpointed); no assumed prod state; the
  held-push posture is consistent with the standing explicit-push rule.
- **Doug:** pass — finalize verified by a real rolled-back §5d test; consolidation proven reversible on prodsnap
  + browser-rendered; gates green. Honesty note: full `bun test` skipped (Resend), prod cutover unverified by design.
- **Desi:** pass — public tree renders the full roster with the Dirty Dozen cohort intact.
- **Kaizen aggregate:** 9/10.

## ADR / ubiquitous-language check

- **ADR created: 0037** (branch heads + visual placement). Ubiquitous language: added **"Branch head"**.
- No Dirstarter baseline-layer decision changed (lineage is app-domain, not an L1 baseline).

## Reflections

- **Scope honesty beat grinding — twice.** Both TASK_03 (rename → real data migration: divergent trees needing
  root/discipline/visual-group wiring) and the preview retirement (one cluster → two, env-coupled) were bigger
  than scoped. Surfacing + checkpointing each beat plowing a wrong-shaped change — the same lesson as 0442's TASK_04.
- **Rollback-first for moat data.** Building the consolidation with a before-state backup + `--rollback` and
  *proving the round-trip on prodsnap* before touching prod is the pattern: a moat migration you can undo on demand.
- **The `.example` footgun is real.** The operator twice pasted live creds into the tracked `.env.prod.example`
  because the real gitignored `.env.prod` didn't exist yet. Creating the real file ended the loop — make the
  safe destination exist, don't just document it.
- **`--env-file` overlay verified, not assumed.** Tested empirically that `bun --env-file=.env.prod` wins over
  `.env` and falls back for the rest — the answer to "why is my .env so big" is "it's the full config; .env.prod
  is the few deltas."

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | new docs: ADR 0037, SESSION_0443; bumped `updated`/`last_agent` on ubiquitous-language, lineage-hub, sop-test-writing |
| Backlinks/index sweep | wiki index session row added; ADR 0037 ↔ hub/glossary cross-refs |
| Wiki lint | `bun run wiki:lint` — result recorded in chat |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | Giddy/Doug/Desi above |
| Review & Recommend | yes — next session = prod cutover + dogfood |
| Memory sweep | branch-head/ADR-0037, consolidation-held, `.env.prod` overlay, scope-honesty learnings |
| Next session unblock check | BLOCKED ON USER — cred rotation + operator-only sends + prod cutover are operator actions |
| Git hygiene | branch `main`; close commit unpushed (push HELD); hash reported in chat |
| Graphify update | run before the close commit — count reported in chat |
