---
title: Closing Ritual
slug: closing
type: protocol
status: active
created: 2026-04-25
updated: 2026-07-20
last_agent: claude-session-0584
pairs_with:
  - docs/rituals/opening.md
  - docs/protocols/code-guardrails.md
  - docs/knowledge/wiki/incidents.md
  - docs/protocols/failed-steps-log.md
  - docs/protocols/hostile-close-review.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Closing ritual — bow out

Run this before ending any session. The point: leave the repo in a state where the next bow-in is cheap.

> v5.0 refresh of the legacy `closing_v4.5.md`. Quick/full distinction is preserved. The legacy multi-file state machine (`CHAT_HANDOFF.md` + `GIDDY_BRANCH_MONITOR.md` + `PETEY_NEXT_SESSION_PROMPT_*.md`) is consolidated into one file: the current `SESSION_NNNN.md`.

## Agent-agnostic

This ritual is the source of truth for any agent that closes a session: Claude, Copilot, Codex, or otherwise. The ritual itself never depends on a specific LLM, IDE, or CLI. The trigger may differ per environment (Claude Code: `/bow-out` skill; Copilot/Codex chat: the words "bow out"; CLI script: a make target), but the steps below are identical and binding.

When you record `last_agent` in the SESSION frontmatter or in this doc's frontmatter, name the agent that actually executed the work (e.g., `claude-session-0031`, `copilot-session-0028`, `codex-session-0030`). Do not rewrite past values; only stamp your own accurately on the artifacts you touched.

## Trigger

Any of: "Bow out" / "Close session" / "End session" / task complete / hitting a natural pause point.

## One close, one status

One ritual, one status: `in-progress` → `closed` (SESSION_0241 merged quick/full). Every session runs the steps
below; the **optional deep items** (Reflections, hostile review, evidence table, memory sweep) are flagged inline
— always recommended at end-of-day / end-of-sprint / after a milestone / when the session touched
schema/auth/payments/deploy/prod-data/governance, and skippable for back-to-back code-only sessions. Legacy
`closed-quick` / `closed-full` / `closed-unclean` are read-only in old SESSION files; don't use them in new ones.

## Close steps

### 1. Run the close gate runner first

Before hand-writing anything, run the one deterministic close-pass:

```bash
bash scripts/bow-out-gates.sh
```

It runs every gate in one shot — task-log check, format-fix on touched files, `wiki:lint`, `next build` (only
if `apps/web/**` changed), `graphify update` (capturing the node/edge/community count), git state, ledger
cross-off **candidate detection**, the board-backlog next-pick list, the fallow introduced-findings delta, and
the hostile-review trigger — then prints a **pre-filled `## Full close evidence` table** (deterministic cells
already filled) and an **`## LLM remainder checklist`** of only the judgment work left. It is read-mostly
(auto-fixes formatting only) and **never commits or pushes**. Spend your tokens on the checklist remainder, not
on re-running gates by hand.

(If a tool call or build is mid-flight, let it finish first; note any abandoned build in step 2.)

### 2. Update the SESSION file

Open the current `docs/sprints/SESSION_NNNN.md`. Fill in:

- `What landed` — bullets of completed work
- `Files touched` — paths + one-line note each
- `Decisions resolved` — anything the user signed off on this session
- `Open decisions / blockers` — anything unblocking the next session
- `Next session: Goal + Inputs to read + First task`
- **ADR 0049 pre-stage:** mint N+1 (`bun scripts/ledger-id-next.ts --prefix=SESSION`), create
  the real `SESSION_NNNN+1.md` stub with `status: staged` + Goal/First-task copied from your
  `Next session` block, and set `next_session:` in this session's frontmatter. The next bow-in
  adopts the stub. Skip only when the lane explicitly ends.
- `Task log` — the `TASK_PLAN_LOG` IDs touched this session
- `Review log` — the `TASK_REVIEW_LOG` entry for this session
- `Hostile close review` — Giddy + Doug verdict, Dirstarter docs check, score cap if any
- `ADR / ubiquitous-language check` — any architectural decision or domain term created, updated, or explicitly marked not needed
- Frontmatter `status: closed`

**Single source of truth (SESSION_0342):** status lives only in the YAML frontmatter `status:` field (`in-progress` → `closed`). The body `## Status` section is a pointer, not a second copy — there is nothing to keep in sync. This supersedes the old FS-0015 atomicity rule, which existed only because the value was duplicated in the body.

**SESSION-file gate:** Before setting `closed` status, verify the current SESSION file has at least one entry in its `## Task log` table. The cross-session `project-log.md` was retired at SESSION_0228. Use an exact-file check:

```bash
awk '/^## Task log/{flag=1; next} /^## /{flag=0} flag' docs/sprints/SESSION_NNNN.md | grep -c "SESSION_NNNN_TASK"
```

Must return >= 1 before setting `closed`. Do not append to `docs/protocols/project-log.md` — it is frozen.

If the session didn't accomplish its `Goal`, note that explicitly in `What landed` ("Goal X was not reached because Y").

### 3. JETTY 3.0 sweep on touched files

For every file listed in `Files touched`, run this dual sweep:

#### 3a. Doc frontmatter sweep

- If it's a wiki page or architecture doc: verify JETTY 3.0 frontmatter is present and `updated` date is current.
- If it's a code file with a wiki annotation (e.g., `wiki/files/schema-prisma.md`): bump `updated`, re-evaluate `health`.
- Set `last_agent` to the current agent identity on every doc you touched.

#### 3b. Bidirectional backlinks audit

- Update `backlinks` on any page that references or is referenced by touched files. **Both directions** — if A references B, both A's and B's frontmatter must reflect the link.
- Update `pairs_with` on any page that was newly cross-referenced during the session. Verify both pages list each other.

#### 3c. Wiki index completeness check (FS-0019 gate)

- Open `docs/knowledge/wiki/index.md`.
- Verify the **current session** has an entry in the session table with correct status.
- Verify no prior sessions are missing (spot-check the last 5 session numbers). If gaps exist, fill them before closing.
- If any new wiki pages were created, or any page status/health changed, add/update the relevant rows.
- If the session **added, moved, or retired a runbook**, update the [runbooks domain hub](../runbooks/README.md) in the same pass (same rule as the custom-component-inventory). Moving a runbook also requires relinking inbound references — never move without an atomic relink.
- Bump `updated` on `wiki/index.md` itself.

If you created new cross-references during the session, verify both pages list each other in `pairs_with` or `backlinks`.

Run wiki-lint from the repo root after the manual sweep:

```bash
bun run wiki:lint
```

If wiki-lint fails, record the exact error/warning count and whether failures are pre-existing or introduced by this session. Do not write "wiki-lint ran" without the command result.

#### 3d. Incremental formatting fix (G8 / R8)

Handled by the step-1 gate runner — it auto-fixes formatting on the files you touched (`oxfmt` on code; markdown
stays check-only via `wiki:lint`). Incremental by design: only touched files, never a repo-wide batch.

### 4. Git hygiene

> **Single-push order (FS-0025) — defer this step to LAST.** Finish all SESSION-file content first (the step-1
> gate runner already ran graphify + captured its count into the evidence table, so the tree is final). Then
> `git add -A` → one commit → one push. The only value you can't write pre-commit is the commit hash — don't
> chase it with a second commit; the evidence cell reads `see git log` and you state the hash in the bow-out
> chat response.

Before committing:

1. **Branch check**: Verify you're on the expected branch (`git branch --show-current`). If you should be on a feature branch but you're on `main`, stop and discuss with the user.
2. **Worktree check**: Run `git worktree list`. If a session worktree is clean and its branch is already merged into the active branch, remove the worktree and delete the local branch. If it still has unique commits or uncommitted files, record the branch/path and leave it in place.
   - **Parallel-dispatch sessions (own worktree):** if this session ran in its own worktree (e.g. `../ronin-NNNN` on branch `session-NNNN-<lane>`, as set up by `/new-client-recipe`-style parallel dispatch), the close MUST self-clean once its branch is merged to `main`: `git worktree remove ../ronin-NNNN` then `git branch -d session-NNNN-<lane>`. Leaving stale worktrees/branches is the parallel-session equivalent of an unclean close.
3. **Stage and review**: `git add -A && git status` — review the list. No secrets, no `.env`, no `node_modules`.
   The gate runner's **Gate 12b secret scan** (key/token/private-key patterns over touched files) is the
   deterministic backstop — a hit blocks commit/push until the value is removed **and rotated**.
4. **Commit**: Use a conventional commit message (`feat:`, `docs:`, `fix:`, `chore:`). Don't bundle unrelated changes into one commit.
5. **Push**: `git push origin <branch>` — only if the user has authorized pushes. If not, note "changes committed but not pushed" in the SESSION file.

If the user hasn't authorized commits, leave changes uncommitted and note that in `Open decisions / blockers`.

### 4a. Pre-push cost gate (CI / GitHub Actions spend)

Pushing to `main` is not free. An **app-code** push (anything under `apps/web/**`) fires the full CI
matrix — typecheck, unit, oxc, and **Playwright ×3 browsers** (chromium/firefox/webkit) — *and* a Vercel
prod deploy. A remote build failure burns that entire matrix to learn what a local build would have told
you for free. So, before an app-code push:

1. **Run `next build` locally** (`cd apps/web && bun run build`) — it mirrors Vercel's build and catches
   the failures tsc/lint/test can't: `"use server"` non-function exports, Prisma-in-browser, dynamic-import
   issues. Push **only when it's green.** (Docs/governance pushes skip this — they don't build or deploy.)
2. **Be selective about _when_:** one push per session at close (never mid-session); push a *complete,
   verified unit*, not work-in-progress. Batch only when another push is genuinely imminent — don't strand
   finished, verified work waiting for a bundle that isn't coming.
3. **Keep docs separate from code when independent:** `ci.yml` + `playwright.yml` already `paths-ignore`
   `docs/**` / `**.md` / `.claude/**` (SESSION_0267), and `vercel.json`'s `ignoreCommand` skips the deploy
   for non-`apps/web` pushes — so a **docs-only push is free** (no CI matrix, no deploy). A mixed app+docs
   commit still pays the full matrix; split them when the docs don't depend on the code.

Record in the SESSION evidence table whether the local build gate was run and its result. (Standing
follow-up cost lever: the per-push Playwright **×3** matrix is the biggest remaining GHA spend — trimming
it to chromium-only per-push with the full ×3 on a nightly/label is the structural win.)

### 4b. Graphify update (run by the step-1 gate runner)

The step-1 gate runner already ran `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` and captured the
node/edge/community count into the evidence table. This runs **before** the commit on purpose (FS-0025):
`.graphify/` is git-ignored and indexes the working tree, so a pre-commit run avoids the second "fill close
evidence" push. Nothing to do here unless the runner reported Graphify unavailable — then run it manually or
record "skipped." See [Graphify Repo Memory Runbook](../runbooks/dev-environment/graphify-repo-memory.md).

**Docs Navigator** ([docs-navigator runbook](../runbooks/dev-environment/docs-navigator.md)) is **regenerate-only — never commit it.** `docs/index.html` is generated (~7 MB) and git-ignored; run `bun run docs:nav` whenever you want to browse the latest docs. It is not a close gate and must not enter a commit (it would churn megabytes every session).

### 4c. E2E run-evidence guard (FS-0031)

If this session's diff **touches `apps/web/e2e/**`** (any spec/helper), a new or changed Playwright
assertion must have been **run locally** before it ships — FS-0031 was three consecutive red-`main`
pushes from assertions "verified by inspection" because the suite couldn't be run locally. Before the
pre-push gate:

1. **Provision + migrate the small e2e DB once** (idempotent — the heavy `ronindojo_prodsnap` times out
   on cold admin-list pages, so use the dedicated `ronindojo_e2e`): `cd apps/web && bun run e2e:db:setup`.
   Requires `apps/web/.env.e2e` (gitignored; shape in `.env.e2e.example` — copy `.env`, override
   **both** `DATABASE_URL` and `DIRECT_URL` to `ronindojo_e2e`). The setup is migrate-only; seed separately
   only when the affected manual smoke needs reference data.
2. **Run the affected spec** against it (sidesteps the FS-0002-banned `bun dev`): start the e2e-bound
   dev server with `cd apps/web && bun run dev:e2e` (= `node scripts/run-e2e-dev.mjs` — a Node
   launcher that `process.loadEnvFile(".env.e2e")`s the DB URLs then spawns `next dev --turbo`). Do
   **NOT** use `bun --env-file=.env.e2e next dev` — running `next` under the bun runtime injects a bun
   loader into the child `NODE_OPTIONS` and poisons Turbopack's PostCSS worker (FS-0031 0533 residual).
   Then `bun run test:e2e:local -- <spec> --project=chromium`. This writes the run-evidence artifact
   `apps/web/.e2e-run-evidence.json`.
3. **Gate the close on the evidence**: `bun run e2e:evidence:check`. It passes only when a fresh,
   passing run covers every touched spec; it blocks (with the recipe) on missing/stale evidence.
   Override only with a real reason: `bun run e2e:evidence:check --waiver="…"`.

This is **not** an installed git hook (supply-chain caution — persistent hooks need explicit
operator sign-off). You MAY wire a local `pre-push` hook that calls `bun run e2e:evidence:check`
yourself; the repo ships the guard, not the hook.

### 5. Bow-out line

State to the user (or in the SESSION file): "Bowed out — SESSION_NNNN closed. Next session goal: {one line}."

That's the core close done.

## Optional deep items

Do these when useful — especially at end of day, end of sprint, milestone, or when the session touched schema/auth/payments/deployment/production data.

> **Sprint-boundary cadence — run the repo-wide hostile review.** When a sprint closes/opens (a new `S#`)
> or on signal (token burn rediscovering files, suspected duplication/drift, before a large porting lane),
> run [`hostile-repo-review.md`](../protocols/hostile-repo-review.md) — the repo-wide sibling of the
> per-diff `hostile-close-review`. This is its cadence hook: the protocol governs by being *triggered here*,
> not by being remembered (the lesson of SESSION_0467, where it had drifted out of memory). It is not a
> per-session step — most bow-outs skip it.

### 6. Reflections (in the SESSION file)

Add a `## Reflections` section to the SESSION file. Capture what's worth remembering:

- Surprises encountered.
- Things that almost broke (and what saved them).
- Patterns or anti-patterns observed.
- Anything you'd tell yourself if you were starting this work again.

This is the kaizen-style note from the legacy system, kept lightweight.

### 6a. Evidence artifact (required when Doug ran live UAT; on-request otherwise)

The step-1 gate runner **pre-fills the deterministic cells** of this table (task-log, format, wiki:lint, build,
graphify, git state) — paste its output and fill only the judgment cells (Kaizen, Hostile review, Class-A score,
Review & Recommend, Memory sweep). The schema:

```markdown
## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | <files checked; updated/last_agent/health changes or "no frontmatter changes needed"> |
| Backlinks/index sweep | <pairs_with/backlinks/index changes or "no new links"> |
| Wiki lint | <command + pass/fail count + whether failures are pre-existing or introduced> |
| Kaizen reflection | <Reflections section present: yes/no> |
| Hostile close review | <TASK_REVIEW_LOG entry or not-applicable line> |
| Code-quality gate (Class-A) | <`/code-quality` score /10 + any hard-cap, or "no Class-A custom code this session"> |
| Runtime verification (Doug) | <`qa-runtime-verification` result for touched routes/actions, or "no runtime surface touched"> |
| Evidence-artifact URL | <published Artifact link for Doug's live UAT / visual proof, or "n/a — no runtime surface touched"> |
| Review & Recommend | <next session goal written: yes/no> |
| Memory sweep | <operator memory update, protocol/doc update, or "none needed because..."> |
| Next session unblock check | <unblocked or blocked-on-user with reason> |
| Git hygiene | <branch, worktree list result, status, "single push — hash reported at bow-out / see git log", or explicit no-commit reason. Do NOT make a second `fill close evidence` commit (FS-0025).> |
| Graphify update | <node/edge/community count — graphify run BEFORE the close commit so this is captured in the single push (FS-0025), or "skipped — Graphify unavailable/no file changes"> |
```

Generic checkmarks are not enough. The proof cell must say what was checked or what changed.

**Policy (ratified SESSION_0582, wired SESSION_0584):** the `Evidence-artifact URL` row is
**required, not optional, whenever the `Runtime verification (Doug)` row is anything other than
"no runtime surface touched"** — i.e. whenever Doug ran a live UAT, a headless probe with visual
output, or any check that produced something worth *seeing* (screenshots, rendered HTML, a live
page). Publish it as an Artifact link ([[preview-via-published-artifacts]] — inline
widgets/attachments don't render for the operator; a published HTML Artifact URL does) and paste
the URL into the row. When the session genuinely touched no runtime surface, `n/a` is a complete
answer — don't manufacture an artifact for a docs-only close. Outside that trigger, an artifact is
**on-request only** (the operator can ask for one at any point; it's not a default expectation).
[`scripts/bow-out-gates.sh`](../../scripts/bow-out-gates.sh) Gate 12c enforces this deterministically
at close.

### 6b. Repo code glossary (optional, on-demand)

Not a gate and not run every session. Add to [`repo-code-glossary.md`](../knowledge/wiki/repo-code-glossary.md)
when the **operator asks** ("add X to the glossary") or when this session used a technical term a
non-technical reader would stumble on (e.g., `CI`, `SHA`, `enum`, `adapter`). Keep each entry to 1–2
plain-English lines + one concrete example (a repo file or a commit SHA from the session). Skip silently
when nothing new came up.

### 6c. Code-quality gate — Class-A custom code (SESSION_0466)

If this session shipped **Class-A custom code** — a substantial new/changed module that is *not* a thin
Dirstarter extension, judged by the A/B/C split in
[`code-quality-matrix`](../protocols/code-quality-matrix.md) — run the
[`/code-quality`](../../.claude/skills/code-quality/SKILL.md) skill on the largest such module and record
the `/10` score (+ any hard-cap triggered) in the `## Full close evidence` table. This holds the
gold-standard bar on exactly the custom code the matrix exists to police (the kernel / card / loop-board
kind of work), not Dirstarter-derived CRUD. Skip with a one-line "no Class-A custom code this session"
when the diff is docs / config / thin-wrapper only.

### 6.5. Review & Recommend (stage the next session)

Run the [Giddy + Doug Hostile Close Review](../protocols/hostile-close-review.md). This is the hard pass that checks plan sanity, Dirstarter alignment, security, data integrity, verification honesty, and WORKFLOW 5.0 compliance. If the session touched a Dirstarter baseline layer, check live `https://dirstarter.com/docs` pages and cite the sources in `TASK_REVIEW_LOG`.

Run the [Review & Recommend protocol](../protocols/review-recommend.md). This reviews what landed, checks the boundary registry and program plan, and writes a concrete `Next session` recommendation into the SESSION file — then materializes it as the ADR 0049 staged stub (§2 pre-stage step; the "optionally pre-stages" below is now the mechanized default). **Seed the `Next session → Goal + First task` from the top-ranked open backlog item** — the operator's `/app/loop-board` board order (`cd apps/web && bun scripts/board-backlog.ts --top=10`) first, falling back to the ledger rank — unless the operator pinned a `/goal`; the boundary registry + program plan then contextualize the pick (SESSION_0476 closed the gap where the next-block was authored disconnected from the live backlog). Optionally pre-stages the next `SESSION_NNNN+1.md` so the next bow-in is nearly zero-cost.

At full close, also consider running [Petey Plan protocol](../protocols/petey-plan.md) to pre-write the next session's plan block — this means the next session skips the planning phase entirely and goes straight to execution.

Append or update the review entry inside the current SESSION file's `## Review log` and `## Hostile close review` sections. The review entry must reference the numbered task IDs from the SESSION file's `## Task log` and list unresolved findings as open follow-ups. Do not write to `docs/protocols/project-log.md` — it is frozen.

### 6.6. ADR + ubiquitous-language check

If the session made, changed, or rejected an architectural decision, create or update an ADR in `docs/architecture/decisions/`. If that decision touches a Dirstarter baseline layer, the ADR must include compact proof links to the relevant live Dirstarter docs. Do not paste long excerpts; one short `Dirstarter docs proof` table with URLs is enough.

Baseline layers that require Dirstarter proof in the ADR:

- project structure
- Prisma/database
- Better Auth/authentication
- payments/Stripe
- storage/media
- deployment/cron
- content/blog/SEO
- theming/UI primitives

If the session introduced or changed a domain term, update [Ubiquitous Language](../architecture/ubiquitous-language.md). If no ADR or glossary update is needed, record that explicitly in the SESSION file.

### 6.7. Finding router — where each finding type goes

A session surfaces different kinds of findings; each has **one** canonical home so the record doesn't fragment. Route by type:

| Finding type | Goes to | ID prefix |
| --- | --- | --- |
| Incomplete/dead wiring, storage gaps, FS-0001 handroll slips, dead plumbing | [`wiring-ledger.md`](../knowledge/wiki/wiring-ledger.md) | `WL-P{0,1,2}-N` |
| Architectural divergence / two-sources-of-truth / spec-vs-impl drift | [`drift-register.md`](../knowledge/wiki/drift-register.md) | `D-NNN` |
| SOP/protocol violation + its corrective action | [`failed-steps-log.md`](../protocols/failed-steps-log.md) | `FS-NNNN` |
| Unclean close / crash / interrupted ritual | [`incidents.md`](../knowledge/wiki/incidents.md) | dated entry |
| "Smoke pending" / manually-verified boundary the session shifted | [`manual-boundary-registry.md`](../knowledge/wiki/manual-boundary-registry.md) | registry row |
| A test that broke + how it was fixed | [`test-fail-fix-ledger.md`](../knowledge/wiki/test-fail-fix-ledger.md) | dated entry |
| Feature status / post-launch running list | [`POST_LAUNCH_SOT.md`](../product/black-belt-legacy/POST_LAUNCH_SOT.md) (supersedes `feature-intake-ledger`) | `FI-NNN` |
| Deferred prod/test data cleanup (leftover test accounts, banked destructive scripts, parked demo data) | [`teardown-ledger.md`](../knowledge/wiki/teardown-ledger.md) | `TD-NNN` |
| Architectural decision made/changed/rejected | new/updated ADR in [`architecture/decisions/`](../architecture/decisions/) | `ADR NNNN` |
| Planning/idea intake (feature need, bug fix, design change) not yet plan-sessioned | [`planning-ledger.md`](../knowledge/wiki/planning-ledger.md) | `PL-NNN` |
| Captured Reddit thread/post shared as planning material | [`reddit-links-ledger.md`](../knowledge/wiki/reddit-links-ledger.md) | `RLL-NNN` |
| Captured YouTube video shared as planning material | [`youtube-links-ledger.md`](../knowledge/wiki/youtube-links-ledger.md) | `YLL-NNN` |
| Captured ChatGPT brainstorm output/link shared as planning material | [`chatgpt-links-ledger.md`](../knowledge/wiki/chatgpt-links-ledger.md) | `GPTLL-NNN` |
| Codex Daily Bug Scan finding (auto-appended, reviewed for merge) | [`daily-bug-scan-ledger.md`](../knowledge/wiki/daily-bug-scan-ledger.md) | `DBS-NNN` |

**Link-ledger → planning-ledger promotion path (SESSION_0589/0591):** a `RLL`/`YLL`/`GPTLL` row is a
*raw capture*, not yet planning material — it graduates by getting **triaged** (an agent/operator
reviews the link/thread/video) and **routed**: the row's `status` flips to `routed` and it gets a
pointer to the `PL-NNN` (or, if the idea is already scoped, directly a `G-NNN`) row it fed. The
`PL`/`G` row is the SoT going forward; the link-ledger row stays as provenance, not a duplicate
tracker. Mirrors how a `PL` row itself graduates to a `G-NNN` goal (§6.7 table above).

**ID assignment (FS-0030):** before minting any `<PREFIX>-NNN` id, run
`bun scripts/ledger-id-next.ts --prefix=<PREFIX>` — it greps the **full** docs ID space (references
count; archives included) and prints the next safe number; `--check` flags IDs defined in more than
one place. Never number by tail-reading the nearest table block — that is exactly the FS-0030 miss.

The SESSION file's `### Findings (severity ≥ medium)` block stays **session-scoped** and should backlink the canonical ledger row — never duplicate a cross-session severity list into the SESSION file (it rots; see `wiki/log.md`).

**Wiring-ledger sweep:** if the session surfaced or resolved wiring debt, append rows with stable `WL-P{0,1,2}-N` IDs (or flip resolved rows to ✅/fixed). Skip if no wiring debt changed.

**Ledger cross-off sweep (the inbound/outbound symmetry).** The finding-router above *adds* findings to the
ledgers (outbound). Its mirror: for every ledger item this session **resolved**, flip the row to ✅/done with the
SESSION reference — `failed-steps-log` (FS `Status:` → mitigated/resolved), `drift-register` (D-NNN → resolved),
`wiring-ledger` (WL → ✅), `POST_LAUNCH_SOT` (FI → MVP_LIVE/declined), `manual-boundary-registry` (boundary
verified). This keeps the ledgers a live backlog whose open items shrink as sessions close them — the inbound
half (bow-in pulls 3–5 open ledger items as the session's tasks) is the [Loop of Loops](../protocols/loop-of-loops-ledger-driven-sessions.md)
design (P1). Skip rows the session didn't touch.

**DB board cross-off (outbound to `/app/loop-board`).** For every ledger item flipped above that is **also a
card on the DB Kanban board**, move the card into the terminal `done` stage so the operator's board visibly
shrinks with the session — the outbound half SESSION_0476 built (it was write-only/insert-only before, so nothing
took a card off the backlog programmatically):

```bash
cd apps/web && bun scripts/board-mark-done.ts GL:G-003 WL-P2-19   # sourceRefs = the ledger-scoped CODE:id
```

Pass the resolved items' stable `sourceRef`s (each `CODE:id`, matching `board-backlog.ts --json`'s rows). It is a
clean no-op for any ref not currently on the board (returns count 0), and the insert-only importer keeps a
done card done. This is the headless twin of the in-app `markCardDone` server action (which needs an
authenticated session and can't run from a bow-out CLI). Skip if the session resolved nothing board-tracked.

**No parallel board exists.** The old per-browser localStorage `AdminTaskBoard` was **retired** (SESSION_0461,
G-003): `/admin/task-board` is now a redirect stub to `/app/loop-board`, and any per-browser tasks migrate into
`KanbanCard` on first visit via the one-time `apps/web/lib/loop-board/parse-legacy-tasks.ts` parser. So there is
**one board** — the DB `/app/loop-board` handled above. There is no live localStorage board to remind the
operator about and no `lib/task-board/seed.ts` to edit.

### 6.8. Deferral guard — prove nothing escaped the ledger

The finding router (§6.7) *routes* findings to ledgers; this step *verifies* the routing actually
happened for every deferral. It exists because a deferral that lives only in the SESSION file (or a
memory note, or a recipe) is **invisible work** — the bow-in read-path (`ledger-backlog.ts` → the
`/app/loop-board` sync) never surfaces it, so it silently rots. This is exactly how **TICKET-0502-A**
vanished for ~11 sessions (found SESSION_0513): it was deferred in prose but never written to a ledger.

Run the guard against this session's file:

```bash
bun scripts/deferral-guard.ts          # newest docs/sprints/SESSION_NNNN.md (or pass a path)
```

It scans for deferral-shaped language ("deferred", "follow-up", "TICKET-", "next/later slice", "punt",
"revisit", …) and flags any whose line doesn't reference a **real ledger id** (WL/FS/D/FI/MB/TFF/INC/
RISK/GL/TD/PL/RLL/YLL/GPTLL/DBS that actually exists in a ledger file). For each flag: either **route it to a ledger** via
§6.7 (then it auto-syncs to the board), or **dismiss it** if it's a scope note / a one-off already-done
action, not trackable future work. Exit 1 = at least one un-ledgered deferral; **do not close until the
guard is clean or every remaining flag is a justified dismissal.** (It errs toward over-flagging — a
missed deferral is the failure it prevents, so a few dismissable false positives are by design.)

### 7. Memory sweep

If anything from this session is worth carrying forward across all future sessions (not just the next one), update operator-side memory. Examples:

- A new architectural decision worth remembering — captured as an ADR; mentioned in memory only if it changes how we work.
- A discovered constraint or gotcha that future sessions will hit.
- A user preference that shapes future work.

Do *not* memory-dump the SESSION file's content. The SESSION file is the session-scoped record; memory is for project-scoped facts.

### 8. Confirm next session is unblocked

Re-read your `Open decisions / blockers` and `Next session` entries. Is the next session's `First task` actually doable, or does it require user input first? If the latter, explicitly note "BLOCKED ON USER" in the next session's entry.

## What this ritual is NOT

- Not a forced commit. Sometimes the right close is "uncommitted, here's what's queued."
- Not a comprehensive log. Diff is the log; the SESSION file is the *summary*.
- Not heavy ceremony. Quick close should take 60 seconds. Full close should take 5 minutes.

## What you must not skip

- The SESSION file update. **Always.** No exceptions. If you skipped it, the session didn't close — it crashed.
- The `Next session` entry. If the next session can't pick up the thread, this ritual failed.
- The JETTY 3.0 sweep (step 3). If you touched wiki pages and didn't update backlinks, the next agent will have broken references.
- The git hygiene check (step 4). Uncommitted changes with no record of what they are = lost work.

## Cross-references

- [Opening ritual](opening.md) — paired counterpart at the start of a session.
- [Chat handoff protocol](../protocols/chat-handoff.md) — describes the SESSION file format in full.
- [Wiki lint protocol](../protocols/wiki-lint.md) — rules for JETTY 3.0 sweep verification.
- [Schema Migration Runbook](../runbooks/database/schema-migration.md) — recurring schema change cycle.
- [Code guardrails](../protocols/code-guardrails.md) — coding standards enforced every session.
- [FAILED_STEPS Log](../protocols/failed-steps-log.md) — append-only log for protocol misses and mitigations.
- [Incidents log](../knowledge/wiki/incidents.md) — append-only log for unclean closes.
- [Giddy + Doug Hostile Close Review](../protocols/hostile-close-review.md) — hard close review against Dirstarter, security, data integrity, and workflow honesty.
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — at full close, log/update any "smoke pending" boundaries the session shifted.
- [SOP — Agent Workflows and Rituals](../runbooks/sops/sop-agent-workflows-and-rituals.md) — the full bow-out / next-target selection procedure as a runbook.
- [Petey Plan protocol](../protocols/petey-plan.md) — structured planning for staging the next session at bow-out.
- [Review & Recommend protocol](../protocols/review-recommend.md) — the review + next-target recommendation cycle run at full close.
- [Graphify Repo Memory Runbook](../runbooks/dev-environment/graphify-repo-memory.md) — local repo graph for cross-domain navigation.

---

## UNCLEAN_CLOSING - Unclean close recovery

Use when a previous session's bow-out was skipped — context loss, compaction, crash, or operator error.

### When this applies

- The latest `SESSION_NNNN.md` has `Status: in-progress` but the session is over.
- A new session discovers the previous one was never closed.
- The closing ritual was interrupted mid-flight.

### Recovery checklist

1. **Read the unclosed SESSION file.** Identify what was done by reading `git log`, `git diff`, and any partial `What landed` entries.
2. **Backfill the SESSION file.** Fill in `What landed`, `Files touched`, `Decisions resolved`, `Open decisions / blockers`, `Next session`.
3. **Set status:** frontmatter `status: closed` and add a `**Close notes:** unclean recovery — {reason}` line in the body.
4. ~~**Add reason tag:**~~ *(merged into step 3 above)*
5. **Log the incident.** Append an entry to [`docs/knowledge/wiki/incidents.md`](../knowledge/wiki/incidents.md) with date, session number, reason, and recovery actions.
6. **JETTY 3.0 sweep.** Run step 3 from quick close on any files touched in the unclosed session.
7. **Wiki index update.** Update session status in `wiki/index.md`.
8. **Continue.** Create the next `SESSION_NNNN.md` and proceed with bow-in.

### Status values

| Status | Meaning |
| --- | --- |
| `in-progress` | Session is active |
| `closed` | Session is done |

Legacy values (`closed-quick`, `closed-full`, `closed-unclean`) are accepted in old SESSION files but should not be used for new sessions.
