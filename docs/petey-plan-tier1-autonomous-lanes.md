---
title: "Tier-1 autonomous lane stubs — overnight-launchable"
slug: tier1-autonomous-lanes
type: dispatch-prompts
status: ready-to-launch
created: 2026-07-21
last_agent: petey-assessment
note: >
  Five fully-specified, pairwise-file-disjoint lanes cleared the autonomy bar
  (fully-specified · gate-able without a human · disjoint from every live lane ·
  not operator/secret-gated). Each block below is a SELF-CONTAINED dispatch prompt —
  paste one into a fresh Codex or Claude agent. Each agent mints its own SESSION at
  bow-in and works in its OWN worktree. They can all run concurrently (no shared files);
  the only shared resource is the local Postgres — stagger the DB-touching gate runs
  (lanes 1, 2, 3) or give each its own scratch DB.
---

# Tier-1 autonomous lane stubs (overnight)

## Shared preamble (prepended by each launched agent — do NOT skip)

```
You are Cody, an autonomous build lane in the ronin-dojo-app monorepo
(/Users/brianscott/dev/ronin-dojo-app, remote Ronin-Dojo-Design/ronin-dojo-baseline).

INVARIANTS (read once, obey throughout):
- Work in your OWN git worktree off `main` — NEVER edit the canonical checkout; canonical
  is dirty with another session's live SotD work. Create: `git worktree add ../ronin-<lane> -b <branch> origin/main`.
- Bootstrap the fresh worktree first: run `/worktree-setup` (installs deps, copies .env,
  generates the Prisma client). A fresh worktree has NO node_modules/.env/Prisma client and
  graphify=0 — gates fail on module resolution until you do this.
- Run the FS-0024 guard before ANY mutating git: `pwd` shows the worktree path + `git remote`
  is ronin-dojo-baseline (never the dirstarter_template dir).
- Follow seq-lane-build (.claude/skills/seq-lane-build): recon → cody-preflight (reuse-first;
  check Dirstarter L1 primitives before creating anything) → build → gates → runtime proof →
  session record → close.
- NON-GOALS for every lane: do NOT touch `components/common/*`, `components/app/state-of-dojo/*`,
  `_kernel/*`, `app/app/*`, `apps/rdd/*`, `clients/mammoth-build-crm/*` app code, `schema.prisma`,
  or the technique-graph files. Stay strictly inside your owned-file set. Flag adjacent debt in
  the session record; do NOT fix it.
- Gate honesty (FS/PL-010): capture the REAL exit code — never `| tail`/`| grep` that masks `$?`.
  `prisma generate` before `next build` if a schema client is stale. `bun run test` = the pinned
  --parallel=1 gate; a lone file needs no --parallel.
- Commit locally on the lane branch with a conventional message. DO NOT push, open a PR, merge,
  or deploy. Return the Minimum-output contract (below) and STOP for operator review.

MINIMUM-OUTPUT CONTRACT (a lane is not done until it returns, verbatim):
  1. Files touched — the owned-set diff, nothing outside it.
  2. Gate outputs — copy-pasted command results, not "gates passed."
  3. Runtime evidence — when a runtime surface changed; else "no runtime surface touched."
  4. Proposed ledger edits — as a session-file section (never a direct shared-ledger edit).
  5. Commit sha(s) — local only, on the lane branch.
  6. Deliberately-not-done list — named, not silently dropped.
```

---

## LANE 1 — WL-P3-33 · people + entitlements unit-test coverage

**Model:** Sonnet · **Recipe:** lane (tdd) · **Size:** S–M · **Branch:** `lane-wl-p3-33-people-tests`

```
GOAL (WL-P3-33, test-coverage lift, ADDITIVE ONLY — no runtime behavior change):
Add the two missing unit tests Doug flagged (SESSION_0510). Neither target is a defect;
these lock in current behavior.
  (a) server/admin/people/queries.test.ts — cover findPeople's three populations
      (accountful / accountless-placeholder / gating) + the placeholder-gating branch.
  (b) An isolated hasEntitlement unit test (today only transitively covered via
      register.concurrency.test.ts) — server/web/entitlements/queries.ts.

OWNED FILES (create/edit ONLY these):
  - apps/web/server/admin/people/queries.test.ts        (NEW)
  - apps/web/server/web/entitlements/queries.test.ts     (NEW, or add an isolated case)
  Read-only refs: server/admin/people/queries.ts, server/web/entitlements/queries.ts,
  an existing DB-backed test (e.g. register.concurrency.test.ts) as the fixture pattern.

GATE (pass/fail, no human judgment):
  cd apps/web && bun test server/admin/people/queries.test.ts server/web/entitlements/queries.test.ts
  then full: bun run test   (must stay green; --parallel=1)
DISJOINTNESS: touches only NEW test files; findPeople/entitlements queries are not owned by any
live lane. Verified not imported by the SotD panels / admin landing.
```

---

## LANE 2 — WL-P3-40 · community-post gate real-DB integration test

**Model:** Sonnet · **Recipe:** lane · **Size:** S · **Branch:** `lane-wl-p3-40-community-gate-itest`

```
GOAL (WL-P3-40, test-coverage lift, ADDITIVE ONLY):
The 9 gate tests for canCreateCommunityPostForUser use a MOCK db, so the real Prisma `where`
(expired endsAt / non-ACTIVE filtering) is never exercised. Add ONE integration test that drives
canCreateCommunityPostForUser through the REAL query for a free-tier session — mirror an existing
DB-backed test's setup/teardown (unique per-run ids, FK-ordered teardown). Not a defect; parity
with shipped hasEntitlement is already confirmed — this pins it.

OWNED FILES (create/edit ONLY these):
  - apps/web/server/web/community/permissions.test.ts   (extend), OR
  - apps/web/server/web/community/permissions.integration.test.ts  (NEW — preferred, keeps the
    mock-db unit file and the real-db integration file cleanly separated)
  Read-only refs: server/web/community/permissions.ts, an existing DB-backed integration test.

GATE:
  cd apps/web && bun test server/web/community/permissions*.test.ts   (needs local Postgres)
  then full: bun run test
DISJOINTNESS: community permissions are not a live lane (FI-028/b already landed). Test-only.
NOTE: hits the local test DB — if run concurrently with lanes 1 & 3, stagger the gate or use a
scratch DB (ronindojo_e2e is the disposable fixture; migrate + db:seed in the worktree first).
```

---

## LANE 3 — WL-P3-25 (carved) · country-validator consolidation + flake fix

**Model:** Sonnet · **Recipe:** fallow-fix-loop · **Size:** M · **Branch:** `lane-wl-p3-25-country-dedup`

```
GOAL (WL-P3-25 remainder — behavior-preserving DRY + documented flake fix + test pins):
  1. Consolidate the triplicated country validators into ONE normalizeCountryCode in
     apps/web/lib/countries.ts; repoint the three call sites (public-actions.ts, lead-country.ts,
     node-profile-schemas.ts) at it. Behavior-preserving.
  2. Add the COUNTRIES allowlist check to node-profile country (today shape-checked, not
     allowlisted).
  3. Passport locationCountry: add .trim() parity with the node-profile variant (passport/schemas.ts).
  4. memberSchool pure-placeholder null: add the missing unit pin.
  5. Flake fix: registration spec's default 5s timeout → 30s to match siblings (the one CI flake
     source). FIND the current line (it moved from :29) — grep the 5s timeout in
     e2e/auth/registration.spec.ts; if already 30s, note it as already-done and skip.

OWNED FILES (edit ONLY these — verify each path in-repo first):
  - apps/web/lib/countries.ts
  - apps/web/server/web/**/public-actions.ts   (the country-validator call site)
  - apps/web/lib/lead-country.ts
  - apps/web/**/node-profile-schemas.ts
  - apps/web/**/passport/schemas.ts
  - apps/web/e2e/auth/registration.spec.ts
  + a unit test file for normalizeCountryCode + memberSchool null (co-located).

GATE:
  cd apps/web && bun run typecheck && bun run test <the touched unit tests>
  then bun run test (full) ; run the registration e2e if the worktree e2e DB is bootstrapped.
DISJOINTNESS: country/passport/registration validators are not owned by any live lane.
NON-GOAL: do NOT touch node-profile RENDER or the passport EDITOR UI — validators only.
```

---

## LANE 4 — WL-P3-59 · worktree-setup generates apps/baseline Prisma client

**Model:** Sonnet · **Recipe:** lane (docs+tooling, no dev server) · **Size:** S–M · **Branch:** `lane-wl-p3-59-baseline-bootstrap`

```
GOAL (WL-P3-59 — dev-tooling gap; mirror what apps/web already gets):
Fresh-worktree bootstrap never generates apps/baseline's Prisma client or provisions its .env, so
repo-wide `bun run typecheck` fails in the baseline workspace of every fresh ../ronin-NNNN worktree.
Extend the bootstrap to also generate apps/baseline's client with a placeholder DATABASE_URL,
mirroring the apps/web step.

OWNED FILES (edit ONLY these):
  - .claude/skills/worktree-setup/SKILL.md   (+ its .agents/ hardlink twin — keep byte-identical, D-053)
  - docs/runbooks/dev-environment/dev-environment.md  (§ Fresh worktree bootstrap)

GATE (prove it, don't just document it):
  Create a throwaway worktree, run the UPDATED /worktree-setup, then:
  bun run typecheck   → must pass in the apps/baseline workspace (was the failure).
  Paste the before (fails) / after (passes) typecheck output. Remove the throwaway worktree.
DISJOINTNESS: the worktree-setup skill + dev-env runbook are owned by no live lane.
NON-GOAL: do NOT add a real baseline DB / secret — placeholder DATABASE_URL only.
```

---

## LANE 5 — DBS-001 / WL-P3-56 · Products CI runs per-product tests

**Model:** Sonnet (or `/pr-fix-loop`) · **Recipe:** lane (CI, no deploy) · **Size:** S · **Branch:** `lane-dbs-001-clients-ci-test`

```
GOAL (DBS-001 = WL-P3-56 clients-ci.yml half ONLY):
Products CI runs typecheck only for clients/* — Mammoth's 20 app-local tests can all fail while CI
goes green. Add a per-product test step so any client defining a `test` script gets `bun run test`
run in CI. A DRAFT of exactly this fix already sits UNCOMMITTED in the Codex worktree
`/Users/brianscott/.codex/worktrees/bc1f/ronin-dojo-app` (M .github/workflows/clients-ci.yml) — the
cleanest path is to reproduce/adopt that one-file change, not re-derive from scratch.

OWNED FILES (edit ONLY this):
  - .github/workflows/clients-ci.yml
  ⚠ SCOPE GUARD: do NOT touch clients/mammoth-build-crm/package.json or add an oxfmt/oxlint config —
    that collides with the live Mammoth (G-021) lane. The fuller format-gate slice (WL-P2-69) is
    DEFERRED until the Mammoth lane rests. This lane is the workflow YAML ONLY.

GATE:
  Validate the workflow YAML parses and the matrix runs `bun run test` for a product that defines it
  (dry-run / actionlint if available; else inspect the resolved job). Do NOT push to trigger CI —
  hold for operator go.
DISJOINTNESS: .github/workflows/clients-ci.yml is CI infra, owned by no live lane (scoped to the
YAML only, the mammoth package.json is explicitly out).
```

---

## Disjointness-safe batch + merge order

All five owned-file sets are **pairwise empty** — launch all 5 at once. Suggested merge order
(blast radius ascending): **5 (CI) → 4 (tooling) → 1 & 2 (additive tests) → 3 (source refactor,
last, for a clean delta re-verify)**. Deploy note: 4 & 5 don't trigger the prod build; 1/2/3 live
under `apps/web` so a push would deploy (1/2 are test-only/harmless; 3 is behavior-preserving) —
hold every push for the operator's "go."
