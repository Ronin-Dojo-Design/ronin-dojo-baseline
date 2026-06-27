---
title: Closing Ritual
slug: closing
type: protocol
status: active
created: 2026-04-25
updated: 2026-06-27
last_agent: claude-session-0457
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

> **SESSION_0241 simplification:** Quick close and full close are merged into one ritual. Every session runs the same steps. Optional deep items (Reflections, hostile review, evidence artifact, memory sweep) are flagged inline — do them when useful, skip when not. Status is `closed` (not `closed-quick` or `closed-full`).

| Status | Meaning |
| --- | --- |
| `in-progress` | Session is active |
| `closed` | Session is done — all required steps completed |

Legacy values `closed-quick`, `closed-full`, and `closed-unclean` are accepted in old SESSION files but should not be used in new ones.

## Mode contract

Every session runs the full closing ritual below. The "optional" items (Reflections, hostile review, evidence table, memory sweep) are always available and recommended at end-of-day, end-of-sprint, after milestones, or when the session touched schema/auth/payments/deployment/production data/governance protocols. Skipping them is fine for back-to-back implementation sessions that touch only code files.

## Close steps

### 1. Pause the work

Stop typing. If a tool call is mid-flight, let it finish. If a build is running, decide whether to wait for it or abandon and note the abandonment in step 3.

### 2. Update the SESSION file

Open the current `docs/sprints/SESSION_NNNN.md`. Fill in:

- `What landed` — bullets of completed work
- `Files touched` — paths + one-line note each
- `Decisions resolved` — anything the user signed off on this session
- `Open decisions / blockers` — anything unblocking the next session
- `Next session: Goal + Inputs to read + First task`
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

#### 3d. Incremental markdown formatting fix (G8 / R8)

For every file in `Files touched`, fix any markdown formatting violations (blank lines around headings and lists per guardrail G8). This is incremental cleanup — only fix files you already touched this session, not the whole repo. Over time this brings all docs to compliance without a dedicated batch session.

### 4. Git hygiene

> **Sequencing note (SESSION_0140, hardened SESSION_0304 / FS-0025):** In full close mode, defer this step until after steps 6–8 (Reflections, Review & Recommend, ADR check, Memory sweep, Next session unblock). This lets the evidence artifact (step 6a) and all review content be written *before* the first commit, avoiding a two-pass commit cycle. **Single-push order (mandatory — do not regress to a second `fill close evidence` commit):**
>
> 1. Finish all SESSION-file content **including** the graphify stats (run step 4b *before* committing — see below).
> 2. The **only** value you cannot write pre-commit is the commit hash itself. Do **not** chase it with a second commit. In the evidence table, the Git-hygiene hash cell reads `reported at bow-out — see git log`, and you state the actual hash in the **bow-out chat response**.
> 3. `git add -A` → one commit → one push. Done.
>
> In quick close mode, run git hygiene here as written.

Before committing:

1. **Branch check**: Verify you're on the expected branch (`git branch --show-current`). If you should be on a feature branch but you're on `main`, stop and discuss with the user.
2. **Worktree check**: Run `git worktree list`. If a session worktree is clean and its branch is already merged into the active branch, remove the worktree and delete the local branch. If it still has unique commits or uncommitted files, record the branch/path and leave it in place.
3. **Stage and review**: `git add -A && git status` — review the list. No secrets, no `.env`, no `node_modules`.
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

### 4b. Graphify update (if installed)

If the session changed tracked files and Graphify is installed locally, refresh the repo graph so the next bow-in starts from the current work.

> **Run order (SESSION_0304 / FS-0025):** In **full close**, run `graphify update` **before the close commit**, not after. `.graphify/` is git-ignored and Graphify indexes the **working tree** (not the commit), so the tree is already final after step 2's doc edits — running it first means the node/edge/community count can be written into the SESSION file and captured by the single close commit. Running it *after* the commit is what historically forced the second `fill close evidence` push (FS-0025). In **quick close**, run it after git hygiene as before.

```bash
GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .
```

Skip only if Graphify is not installed or no files changed. Record the node/edge/community count in the SESSION file (it will not force a second commit when run in the order above). See [Graphify Repo Memory Runbook](../runbooks/dev-environment/graphify-repo-memory.md) for full usage.

**Docs Navigator** ([docs-navigator runbook](../runbooks/dev-environment/docs-navigator.md)) is **regenerate-only — never commit it.** `docs/index.html` is generated (~7 MB) and git-ignored; run `bun run docs:nav` whenever you want to browse the latest docs. It is not a close gate and must not enter a commit (it would churn megabytes every session).

### 5. Bow-out line

State to the user (or in the SESSION file): "Bowed out — SESSION_NNNN closed. Next session goal: {one line}."

That's the core close done.

## Optional deep items

Do these when useful — especially at end of day, end of sprint, milestone, or when the session touched schema/auth/payments/deployment/production data.

### 6. Reflections (in the SESSION file)

Add a `## Reflections` section to the SESSION file. Capture what's worth remembering:

- Surprises encountered.
- Things that almost broke (and what saved them).
- Patterns or anti-patterns observed.
- Anything you'd tell yourself if you were starting this work again.

This is the kaizen-style note from the legacy system, kept lightweight.

### 6a. Evidence artifact (optional)

For sessions that warrant extra proof, add this block to the SESSION file:

```markdown
## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | <files checked; updated/last_agent/health changes or "no frontmatter changes needed"> |
| Backlinks/index sweep | <pairs_with/backlinks/index changes or "no new links"> |
| Wiki lint | <command + pass/fail count + whether failures are pre-existing or introduced> |
| Kaizen reflection | <Reflections section present: yes/no> |
| Hostile close review | <TASK_REVIEW_LOG entry or not-applicable line> |
| Review & Recommend | <next session goal written: yes/no> |
| Memory sweep | <operator memory update, protocol/doc update, or "none needed because..."> |
| Next session unblock check | <unblocked or blocked-on-user with reason> |
| Git hygiene | <branch, worktree list result, status, "single push — hash reported at bow-out / see git log", or explicit no-commit reason. Do NOT make a second `fill close evidence` commit (FS-0025).> |
| Graphify update | <node/edge/community count — graphify run BEFORE the close commit so this is captured in the single push (FS-0025), or "skipped — Graphify unavailable/no file changes"> |
```

Generic checkmarks are not enough. The proof cell must say what was checked or what changed.

### 6b. Repo code glossary (optional, on-demand)

Not a gate and not run every session. Add to [`repo-code-glossary.md`](../knowledge/wiki/repo-code-glossary.md)
when the **operator asks** ("add X to the glossary") or when this session used a technical term a
non-technical reader would stumble on (e.g., `CI`, `SHA`, `enum`, `adapter`). Keep each entry to 1–2
plain-English lines + one concrete example (a repo file or a commit SHA from the session). Skip silently
when nothing new came up.

### 6.5. Review & Recommend (stage the next session)

Run the [Giddy + Doug Hostile Close Review](../protocols/hostile-close-review.md). This is the hard pass that checks plan sanity, Dirstarter alignment, security, data integrity, verification honesty, and WORKFLOW 5.0 compliance. If the session touched a Dirstarter baseline layer, check live `https://dirstarter.com/docs` pages and cite the sources in `TASK_REVIEW_LOG`.

Run the [Review & Recommend protocol](../protocols/review-recommend.md). This reviews what landed, checks the boundary registry and program plan, and writes a concrete `Next session` recommendation into the SESSION file. Optionally pre-stages the next `SESSION_NNNN+1.md` so the next bow-in is nearly zero-cost.

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

The SESSION file's `### Findings (severity ≥ medium)` block stays **session-scoped** and should backlink the canonical ledger row — never duplicate a cross-session severity list into the SESSION file (it rots; see `wiki/log.md`).

**Wiring-ledger sweep:** if the session surfaced or resolved wiring debt, append rows with stable `WL-P{0,1,2}-N` IDs (or flip resolved rows to ✅/fixed). Skip if no wiring debt changed.

**Ledger cross-off sweep (the inbound/outbound symmetry).** The finding-router above *adds* findings to the
ledgers (outbound). Its mirror: for every ledger item this session **resolved**, flip the row to ✅/done with the
SESSION reference — `failed-steps-log` (FS `Status:` → mitigated/resolved), `drift-register` (D-NNN → resolved),
`wiring-ledger` (WL → ✅), `POST_LAUNCH_SOT` (FI → MVP_LIVE/declined), `manual-boundary-registry` (boundary
verified). This keeps the ledgers a live backlog whose open items shrink as sessions close them — the inbound
half (bow-in pulls 3–5 open ledger items as the session's tasks) is the [Loop of Loops](../protocols/loop-of-loops-ledger-driven-sessions.md)
design (P1). Skip rows the session didn't touch.

**AdminKanban reminder.** The operator's task-board (`app/.../task-board`) is a client-side (localStorage) board
— it can't be synced from a session today. If the session resolved items the operator tracks there, **remind the
operator to move the cards** (a DB-backed projection is the [Loop of Loops](../protocols/loop-of-loops-ledger-driven-sessions.md)
P3 target). Don't edit `lib/task-board/seed.ts` to "update tasks" — that's the demo/test fixture, not the live board.

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
