---
title: "SESSION 0462 — Platform: per-product CI + new-client scaffold script"
slug: session-0462
type: session--open
status: closed
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0459
sprint: S46
pairs_with:

  - docs/sprints/SESSION_0459.md
  - docs/runbooks/onboarding/new-client-runbook.md
  - docs/architecture/research-review-new-client-onboarding.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0462 — Platform: per-product CI + new-client scaffold

> **PRE-STAGED** by SESSION_0459 for a parallel dispatch (3 concurrent windows: 0460 / 0461 / 0462).
> This window owns **0462** — fill this file in during the session; do **not** create a new SESSION number.

## Date

2026-06-28

## Operator

Brian + claude-session-0462

## Goal

Platform hardening for the multi-product monorepo: (1) **per-product CI** so a `clients/*` change stops
firing BBL's `apps/web` Playwright ×3 matrix, and (2) a thin **`scripts/new-client-scaffold.ts`** for the
mechanical half of `/new-client-recipe`. Closes the two follow-ups SESSION_0459 surfaced.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Parallel session awareness

One of **3 concurrent windows** launched together:

- **SESSION_0460** — Mammoth Phase 2 — dir `clients/mammoth-build-crm` — DB `mammoth_dev`.
- **SESSION_0461** — BBL loop-board Phase B — dir `apps/web` — DB `ronindojo_prodsnap`.
- **SESSION_0462 (THIS)** — Platform — dirs `docs/`/`.github/`/`scripts/` — no DB — worktree `../ronin-0462` (branch `session-0462-platform`).

Touch ONLY `.github/workflows/**`, `scripts/**`, `docs/**` + this SESSION file. Do NOT edit `apps/web` or
`clients/*` **application** code (CI config + scripts + docs only). Shared collision surface = index docs —
append-only; on push reject, `git pull --rebase origin main` then retry (never force).

### Branch and worktree

- Branch: `session-0462-platform` · Worktree: `../ronin-0462` (own index — `git add -A` is safe here).
- DB: none.

### Bow-out cleanup (fold into the close)

At close, after the branch merges to `main`: `git worktree remove ../ronin-0462` then
`git branch -d session-0462-platform`. (Generic rule: closing.md §4.2.)

## Petey plan

### Goal

Give `clients/*` their own CI lane (no BBL e2e) + a dry-run-default scaffold script wired into the
new-client recipe.

### Tasks

#### SESSION_0462_TASK_01 — Per-product CI

- **Agent:** Cody
- **What:** a `clients-ci.yml` (or path-scope `ci.yml`/`playwright.yml`) so `clients/*` get their own
  typecheck/lint WITHOUT running BBL's e2e; ensure the `apps/web` matrix fires only on `apps/web/**` +
  shared roots. Document the matrix in the new-client-runbook.
- **Done means:** a `clients/*`-only change no longer triggers BBL's Playwright ×3.

#### SESSION_0462_TASK_02 — `scripts/new-client-scaffold.ts`

- **Agent:** Cody
- **What:** TS scaffolder (NOT Python) — copy the Mammoth structure, stamp the name, write `.env.example`,
  optional `createdb <name>_dev`. **Dry-run by default**; ⚠ SHOW before any real run (operator-script-caution).
- **Done means:** `--dry-run` prints the plan; a real run scaffolds a new `clients/<name>/`.

#### SESSION_0462_TASK_03 — Wire into the recipe

- **Agent:** Cody
- **What:** reference the script from the `/new-client-recipe` skill + `new-client-runbook` as the
  mechanical entrypoint; update the research-review (scaffold now exists).
- **Done means:** the recipe points at the script.

### Gates

Docs + CI config + scripts only → **FREE push** (no deploy, paths-ignored). Show the scaffold script
before any real run. One push at close, on the operator's "go".

### Scope guard

- Do NOT edit `apps/web` or `clients/*` application code. Do NOT create a real DB beyond a dry-run demo.
  Do NOT change BBL's deploy `ignoreCommand` without flagging it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0462_TASK_01 | done | per-product CI: `clients-ci.yml` (discover→matrix) + `clients/**` added to BBL `ci.yml`/`playwright.yml` `paths-ignore` |
| SESSION_0462_TASK_02 | done | `scripts/new-client-scaffold.ts` — dry-run default, self-tested apply, `--createdb` gated |
| SESSION_0462_TASK_03 | done | wired into `/new-client-recipe` SKILL + runbook (§2 + §10 CI matrix) + research-review + verification-and-testing CI map |

## Evidence

| Claim | Evidence |
| --- | --- |
| Client-only change no longer fires BBL's matrix | `clients/**` added to `paths-ignore` (PR+push) in `ci.yml` + `playwright.yml`; paths-ignore skips only when *all* changed files match (independent CI-review agent CONFIRMED) |
| Per-product CI auto-scales (no edit per client) | `clients-ci.yml` `discover` job lists every `clients/*` with a `package.json` → `fromJSON` matrix; empty-matrix guarded by `if: needs.discover.outputs.empty == 'false'` (CONFIRMED) |
| All 3 workflows parse | `python3 yaml.safe_load` OK on `clients-ci.yml`, `ci.yml`, `playwright.yml` |
| Scaffold is dry-run by default | `bun scripts/new-client-scaffold.ts demo-client` prints the plan, writes nothing; `git status` shows no `clients/` change |
| `--apply` writes a complete, valid skeleton | throwaway `clients/zzz-selftest` apply → all 14 files non-empty; `package.json` valid JSON, name stamped, scripts+deps inherited; `schema.prisma` = generator+datasource, **0 models**; `.env.example` only (no `.env`); removed after, tree clean, root `bun.lock` untouched |
| Scaffold refuses unsafe input | empty `--from=` and `--from=../sneaky` both `die`; invalid name regex-rejected before any path use; `createdb` via `execFileSync` args-array (no shell) |
| Docs gate green | `bun run wiki:lint` → 0 errors (15 warnings all pre-existing R8 in untouched files) |
| fallow delta | apps/web-visible diff: 0 introduced findings (2 inherited dead-code FPs: `react-email`, `react-dom`); the script (outside fallow scope): 0 dead functions, 0 dup, flat complexity (max nesting ~3) |

## Review log

### SESSION_0462_REVIEW_01 — per-product CI + new-client scaffold

- **Reviewed tasks:** SESSION_0462_TASK_01, _02, _03.
- **Dirstarter docs check:** cached docs sufficient.
- **Sources:** local — `verification-and-testing.md` CI map, `new-client-runbook.md`, ADR 0034/0038. Dirstarter is a single-app boilerplate; **per-product CI + multi-product onboarding is our platform layer, not a Dirstarter-owned baseline**, so live Dirstarter docs do not inform it.
- **Verdict:** Coherent and dogfooded against the one real client (Mammoth). The CI fork was resolved the right way — not "scope vs separate file" but *both*: path-ignore removes BBL waste, a self-scaling `clients-ci.yml` adds the gate clients lacked. Choosing **fail-safe `paths-ignore`** over positive `paths:` is the correct call for a flagship safety net (unknown shared roots still run BBL — never silently skipped). The scaffold honored the show-before-run gate culture by being dry-run-by-default and was *self-tested through the apply path* (not asserted) with a clean-up + isolation check. Two independent finder agents (correctness/security + CI semantics) returned no CONFIRMED defects; the one PLAUSIBLE (empty `--from=` silent default) was fixed, not waved off.
- **Score:** 9.3/10
- **Follow-up:** (1) surface docs-navigator + graphify on the admin dashboard via the loop-board `fetch-from-main` rail (needs a committed graphify projection — currently gitignored); (2) consider `scripts/**` in BBL's `paths-ignore` (safe — apps/web doesn't import root scripts/).

## Hostile close review

### SESSION_0462 — per-product CI + new-client scaffold

Eight questions (Giddy = architecture/Dirstarter/merge; Doug = QA/security/readiness):

1. **Plan sanity:** Good. The fork ("scope `ci.yml` vs separate `clients-ci.yml`") was a false binary — both are needed (path-ignore can't *add* a gate). No Dirstarter layer was the implementation template because none exists for multi-product CI; the template was our own ADR 0034 deploy model, mirrored into CI.
2. **Dirstarter compliance:** Extends, doesn't replace. GH Actions + the existing `ci.yml`/`playwright.yml` are untouched in behavior except a narrowing `paths-ignore` addition; `clients-ci.yml` is additive.
3. **Security:** No new runtime surface. The only executable is a *local* CLI; it validates its name input before any path use and shells nothing (`execFileSync` args-array). No secrets, no auth, no network in the scaffold.
4. **Data integrity:** N/A — no schema/migration this session. The scaffold's generated schema is a starter with **0 models** (deliberately; models are the runbook's judgment step).
5. **Lifecycle proof:** Serves the stated journey — a `clients/*`-only push now skips BBL's e2e (paths-ignore) and runs only the client's own typecheck job; a new client is scaffolded in one dry-run-previewed command. Both verified.
6. **Verification honesty:** Honest. The apply path was exercised end-to-end into a throwaway dir with per-file assertions, then removed; YAML parsed; wiki-lint green. The one gap I can't exercise locally is the *GitHub-side* matrix run — flagged below, not hidden.
7. **Workflow honesty:** Followed — own worktree (`../ronin-0462`), own branch, task IDs, this review log. Touched only `.github/**`, `scripts/**`, `docs/**`, `.claude/**` + the SESSION file (scope guard respected).
8. **Merge readiness:** Ready. Docs/CI/scripts only → free push (no deploy; `vercel.json` `ignoreCommand` unchanged). One caveat (Q6) is observe-on-first-run, not a blocker.

**Kaizen triage:**

1. **Is this safe and secure? What tests would prove me right?** Provably safe: dry-run default (no write without `--apply`, verified), no-shell createdb, regex-gated paths, YAML parses, wiki-lint green, apply-path self-test. *Documented but not yet behaviorally proven:* that GitHub actually skips BBL's matrix on a client-only push and that the `discover→matrix` runs green on the runner — provable only by the **first real `clients/**`-only push** (watch the Actions tab). The conditional `prisma generate`/`lint` steps are proven-by-reasoning + agent review, not by a runner execution yet.
2. **How many failed steps could we have prevented?** Zero hard slips. The one process note: I cannot run GitHub Actions locally, so the workflow's runtime behavior is reasoned + statically reviewed, not executed — the smallest prevention is a one-time **post-push verification** (confirm on the first client push that BBL stayed skipped and `clients-ci` went green) rather than any pre-push change. No protocol gap to file.
3. **Confidence at scale (100 / 1k / 10k):** The "scale" axis is unusual here (CI config + a CLI, not a request path). **100: 10** — trivially handles a handful of client products. **1,000: 9** — the discover matrix would fan out to N jobs; GH matrix caps (256 jobs) are far off, but a very large client count would want batching. **10,000: 8** — not a realistic monorepo size; the dynamic matrix would need sharding. Aggregate (lowest realistic tier this hits before next remediation): **9**.

**Score:** 9.3/10 — no Dirstarter/data-integrity/security caps apply; the only deduction is the unproven-until-first-push GitHub-side behavior (a verification-completeness gap, not a code gap). Aggregate Kaizen **9 → proceed**.

## ADR / ubiquitous-language check

- **ADR update:** none required. This *executes* ADR 0034 (per-product deploys → per-product CI) and ADR 0038 (per-product DB → per-product scaffold); it ratifies no new decision. The docs-on-dashboard follow-up *would* warrant an ADR — deferred to that lane.
- **Ubiquitous language:** no new product-domain vocabulary; "per-product CI", "discover→matrix", "scaffold" are platform/tooling terms, homed in the runbook + verification doc.

## Reflections

- **A fork can be a false binary.** "Path-scope the existing workflows *vs* a separate `clients-ci.yml`" framed an either/or that wasn't — path-ignore *removes* waste, a new workflow *adds* the missing gate. The grill's value was noticing the goal ("give clients their own typecheck/lint") *requires* the second, so the real question was only how to scope each.
- **Fail-safe beats precise for a flagship gate.** I kept BBL on negative `paths-ignore` rather than converting to positive `paths:`. Positive filters read cleaner but fail *open* — a new shared root not in the list silently skips BBL's e2e. For the thing that gates prod, "run on the unknown" is the right default.
- **The dashboard-docs blocker was never about location.** The operator's instinct (move docs into `apps/web`) and my first objection (deploy coupling) were both about *where* docs live. Grounding in the actual `fetch-ledgers.ts` showed the real blocker is *artifact availability on `main`* (graphify output is gitignored) and the proven fix is the existing fetch-from-main rail — no move at all. Reading the running code beat reasoning about the topology.
- **Dry-run-by-default earns trust cheaply.** Making the scaffold print-and-exit unless `--apply`, then self-testing the apply path into a throwaway, meant I could show the operator exactly what it does without ever touching the real `clients/` tree.

## Next session

### Goal

Surface the **docs-navigator + graphify graph on the admin dashboard** — the operator's standing want.
The blocker is NOT where `docs/` lives; it's artifact availability on `main`: graphify output is
gitignored (`.gitignore` → `graphify-out/`), and the deployed `apps/web` function can't read repo-root
files. Reuse the **proven loop-board rail**: `apps/web/lib/loop-board/fetch-ledgers.ts` already reads the
ledgers live from `raw.githubusercontent.com/.../main`. Do the same for a committed **graphify projection
JSON** + a **docs-nav index JSON**, rendered on an `/app` page. Beats moving docs (which freezes the view
at deploy time + is an ADR-0034 category error). ⚠ This lane **edits `apps/web`** → not a platform-lane;
run it as a BBL/app lane (own worktree if parallel with another `apps/web` lane).

### First task

Decide the artifact contract: a small `graphify update` post-step that emits a render-ready
`docs/<…>/graph.json` (committed) + the `docs:nav` index as JSON; then an `apps/web` `/app/docs` (or
`/app/graph`) page that fetches them from `main` like `fetch-ledgers.ts`. Write the ADR for the
fetch-from-main-vs-bundle decision first.

### Smaller platform follow-ups (cheap, brand-neutral)

- **`scripts/**` in BBL's `paths-ignore`** — a root-script change still fires BBL's matrix today; verified
  safe (apps/web does not import root `scripts/`; the dependency runs the other way). One-line-per-workflow,
  same pattern as `clients/**`. (NOT done this session — kept scope to `clients/**` per the goal.)
- **First-push verification** — on the first real `clients/**`-only push, confirm in the Actions tab that
  BBL's `ci.yml`/`playwright.yml` were **skipped** and `clients-ci.yml` ran **green** (the one
  observe-on-first-run gap from the hostile review).
- **Per-client lint gate** — when a `clients/*` adopts oxlint, `clients-ci.yml` runs `lint:check`
  automatically (already wired conditionally); add the script to the client's `package.json`.
