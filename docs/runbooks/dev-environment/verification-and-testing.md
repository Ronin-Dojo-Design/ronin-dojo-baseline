---
title: "Verification & Testing — what runs where, and what gates"
slug: verification-and-testing
type: runbook
status: active
created: 2026-06-03
updated: 2026-06-28
last_agent: claude-session-0462
domain: docs-system
pairs_with:
  - docs/protocols/wiki-lint.md
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/runbooks/dev-environment/session-ops-cookbook.md
backlinks:
  - docs/runbooks/README.md
  - docs/knowledge/wiki/index.md
tags:
  - testing
  - ci
  - verification
  - guards
---

# Verification & Testing — what runs where, and what gates

## Summary

Every session re-derives "what proves a change is safe." This runbook is the standing answer:
the verification layers, **what is automated vs. local-only**, why some tests fail locally, and
the registry of executable invariant guards. Read it before claiming "CI verifies X" — the CI
surface here is narrower than it looks.

## When to use

- Before asserting a change is verified (especially "CI is green ⇒ safe").
- When unit tests fail locally but you suspect the environment, not the code.
- When adding an invariant you want enforced (add it to the guard registry **and** a runner that
  actually executes).

## The layers (and where each runs)

| Layer | Command (from `apps/web`) | Proves | Runs automatically in… |
| --- | --- | --- | --- |
| Typecheck | `bun run typecheck` (`next typegen && tsc --noEmit`) | Types compile | **GitHub Actions** (`ci.yml` → `typecheck`) + Vercel build |
| Lint/format | `bun run lint:check` + `bun run format:check` (drop `:check` to fix locally) | oxlint correctness/best-practice + oxfmt formatting | **GitHub Actions** (`ci.yml` → `oxc`) |
| Unit tests | `bun test` (ignores `e2e/**`) | Pure logic + the guards below | **GitHub Actions** (`ci.yml` → `unit`, Postgres 16 service) |
| E2E | `bunx playwright test` | Real browser flows against a real DB | **GitHub Actions** (`playwright.yml`): chromium full + firefox/webkit lineage subset, 3 parallel jobs, Postgres 16 service |
| Wiki lint | `bun run wiki:lint` (repo root) | Doc links/backlinks/frontmatter (see [wiki-lint](../../protocols/wiki-lint.md)) | Local only (close gate) |

### The CI map

- **`ci.yml` (SESSION_0335; Oxc swap SESSION_0360)** runs the three fast gates — **Oxc (oxlint +
  oxfmt), typecheck, and unit tests** (`bun test` against a Postgres 16 service) — on every PR/push to
  `main`, skipping docs-only commits. Least-privilege `permissions: contents: read`, concurrency-cancel, per-job timeouts.
- **`playwright.yml`** runs e2e (chromium full + firefox/webkit lineage subset, Postgres service). Its
  web server is `bun run dev` (not a build), so typecheck coverage comes from `ci.yml` + Vercel.
- **`clients-ci.yml` (SESSION_0462) — per-product CI.** `apps/web`'s `ci.yml` + `playwright.yml` are
  **BBL-scoped**: both now `paths-ignore: clients/**`, so a `clients/*`-only change no longer fires BBL's
  Oxc/typecheck/unit + Playwright ×3 (the deploy was already skipped by `vercel.json`'s `ignoreCommand`;
  this closes the matching CI waste). Client products get their own gate instead — `clients-ci.yml` fires
  on `clients/**` or `packages/**` (the shared kernel they consume) and runs a **dynamic discover→matrix**:
  one job per `clients/*` with a `package.json`, each running **typecheck** (+ `lint:check` if defined).
  A new client product is picked up automatically — **no workflow edit** (mirrors the per-product deploy
  model, ADR 0034). Matrix details: [new-client-runbook §10](../onboarding/new-client-runbook.md).
- **Vercel** runs `bun run --filter @ronin-dojo/web build` on deploy — a second `next build` typecheck.
- **No git hooks.** There is no husky/lefthook/pre-commit; the gates run in CI, not at commit time. Run
  `bun test` + `bun run lint:check` + `bun run format:check` locally before a close so you don't discover a red gate after pushing.

> **Resolved (SESSION_0335):** `bun test` (incl. the guards below) and `biome` previously ran on no
> automated gate — only e2e + Vercel's build typecheck existed, so SESSION_0334's "the guard is
> CI-verified" claim was inaccurate at the time. `ci.yml` closes that gap. Getting there also required
> clearing 8 pre-existing `biome ci` errors (formatting + imports + one a11y rule taught about the
> `Checkbox` primitive via `biome.json` `inputComponents`).

## Why DB-dependent unit tests fail locally

Many `bun test` files hit a real Prisma client (`db.user.create`, `db.tournament.findMany`, …). With
no reachable database those fail with `db.<model>.<op> is undefined`. Locally the dev DB is
**Postgres.app**, which re-gates the `node` binary under "trust" auth for agent-spawned processes (see
[[turbopack-prisma-dev-server-broken]] memory). So:

- **Pure unit tests** (logic over fixtures — the guards, `rank-progression`, `search`, visibility
  payload tests) run clean locally and are the ones to rely on in a session.
- **DB-dependent unit tests** are expected to fail in a DB-less shell. Do **not** treat their failures
  as regressions — characterize them (`grep` for `db\.` undefined) and confirm none are in your
  touched files. Their real coverage comes through **e2e in CI**, which has a Postgres service.

This is why **CI (Playwright + Postgres) is the authoritative verifier for DB-backed behavior**, and
local pure-unit + Vercel build cover the rest.

### The e2e DB is a hermetic fixture, not a prodsnap mirror

Two different DBs back the two test layers — don't conflate them (SESSION_0540/0541):

- **`ronindojo_e2e`** is a **hermetic mint-and-assert fixture** (FS-0031): disposable, seeded from scratch. In a
  fresh worktree it is **not provisioned** — `setup-e2e-db.ts` runs **migrate-only**, and the BJJ belt ladder
  the belt journeys assert needs a separate **`db:seed`** that **CI runs** (the local `setup-e2e-db` does not).
  So a local e2e run in an unseeded worktree fails on missing seed data — that is an **environment gap, not a
  code regression**. Provisioning it locally is a yak-shave; **CI (which migrates + seeds) is the authoritative
  e2e gate**. (`belt-journey` is a manual-only `describe.skip` smoke gated behind `RUN_BELT_E2E=1`.)
- **`ronindojo_prodsnap`** is a **realistic, manually-maintained mirror** of prod that the **DB-dependent unit
  tests** (above) point at locally. It is not disposable and not what e2e uses.

The practical rule when your worktree can't run affected e2e: don't fake a green — **push and watch CI**, which is
the authoritative e2e verifier (see [[e2e-db-hermetic-not-prodsnap]]).

## Guard registry (executable invariants)

Unit tests that exist specifically to **freeze an invariant** so it can't silently regress. When you
establish a new invariant, add a guard here. (All run under `bun test`; see the gap note above about
enforcement.)

| Guard | File | Protects |
| --- | --- | --- |
| Dropdown onSelect | `apps/web/components/common/dropdown-menu.guard.test.ts` | No `DropdownMenuItem` uses `onSelect` (Base UI ignores it; use `onClick`). Drift D-016 / WL-P1-3. |
| Lineage payload allowlist | `apps/web/server/web/lineage/queries.visibility.test.ts` | Public lineage payload selects no email/role/notes/audit; materializer drops PRIVATE/RESTRICTED. |
| Lineage search privacy | `apps/web/lib/lineage/search.privacy.test.ts` | Public search can't surface non-PUBLIC members. WL-P1-4. |
| Rank-progression privacy | `apps/web/lib/lineage/rank-progression.privacy.test.ts` | Rank-progression read model is a strict allowlist projection (no PII). WL-P1-4. |

## How to run (local, from `apps/web` unless noted)

```bash
bun run typecheck                 # next typegen + tsc --noEmit
bun run lint:check                # oxlint (drop :check to auto-fix)
bun run format:check              # oxfmt --check (drop :check to write)
bun test                          # all unit tests (expect DB-dependent failures locally)
bun test lib/lineage              # scope to a dir/file
bunx playwright test --project=chromium   # e2e (needs a DB + dev server)
bun run wiki:lint                 # from repo root — doc lint
```

## Deploy gating (production cadence)

`main` is the Vercel **Production** branch, so historically every push — including docs/governance/CI
commits — triggered a full production build+deploy. SESSION_0335 decoupled push from deploy with an
**Ignored Build Step** in `vercel.json`:

```json
"ignoreCommand": "git diff --quiet HEAD^ HEAD -- apps/web bun.lock package.json vercel.json"
```

Vercel runs this before building: **exit 0 ⇒ skip the deploy, exit 1 ⇒ deploy.** `git diff --quiet`
exits 0 when the listed paths are unchanged, so a commit that touches only `docs/`, `.github/`,
`.claude/`, or `scripts/` **does not deploy**; only `apps/web` / dependency / build-config changes do.

Push cadence stays trunk-based (one push per session at close); the deploy cost is now paid only when
deployable code actually changed. For deliberate, milestone-only production (main → Preview, promote
on demand), move the Vercel Production Branch to a `release` branch and `vercel promote` — heavier
process, not currently needed.

## Cross-references

- [Wiki Lint Protocol](../../protocols/wiki-lint.md) — R-rules + canonical frontmatter fields.
- [Autonomous Sessions](autonomous-sessions.md) — cold runs that defer their own e2e are a weak signal; the PR/CI is the gate.
- [Lineage Domain Hub](../domain-features/lineage-hub.md) — the privacy guards above are the lineage invariants.
- [Runbooks Domain Hub](../README.md).
