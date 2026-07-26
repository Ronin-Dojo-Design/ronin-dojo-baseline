---
title: Closing Ritual
slug: closing
type: protocol
status: active
created: 2026-04-25
updated: 2026-07-26
last_agent: claude-session-0711
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

## Agent-agnostic

This ritual is the source of truth for any agent that closes a session (Claude, Copilot, Codex, …).
The trigger differs per environment (Claude Code: `/bow-out`; chat: the words "bow out"); the steps
are identical and binding. Record `last_agent` as the agent that actually executed
(`<agent>-session-NNNN`); never rewrite past values.

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
cross-off **candidate detection**, the board-backlog next-pick list, the fallow introduced-findings delta,
the deterministic State-of-Dojo render, and the hostile-review trigger — then prints a **pre-filled
`## Full close evidence` table** and an **`## LLM remainder checklist`** of only the judgment work left. It is
read-mostly (auto-fixes formatting only) and **never commits or pushes**. Spend your tokens on the checklist
remainder, not on re-running gates by hand. (If a build is mid-flight, let it finish first; note any abandoned
build in step 2.)

Two judgment gates ride along with the runner's output (formerly standalone steps 6c/6d):

- **Class-A code-quality gate (SESSION_0466).** If the session shipped **Class-A custom code** — a
  substantial new/changed module that is not a thin Dirstarter extension, per the A/B/C split in
  [`code-quality-matrix`](../protocols/code-quality-matrix.md) — run
  [`/code-quality`](../../.claude/skills/code-quality/SKILL.md) on the largest such module and record the
  `/10` (+ any hard cap) in the evidence table. Skip with "no Class-A custom code this session" for
  docs/config/thin-wrapper diffs.
- **State-of-Dojo (SESSION_0617).** The render is deterministic (`bun scripts/state-of-project.ts` →
  gitignored `out/state-of-project.html`; the live route `/app/state` reflects `main` for 0 agent tokens).
  **Petey's bow-out three questions** — ① goal hit / what landed? ② next lane (stage the stub)? ③ **publish
  a frozen SotD snapshot + push?** — are enforced in the executed `/bow-out` skill body (FS-0037: prose the
  read-path never reaches does not fire). Only on a *yes* to ③ publish an Artifact (`/preview-artifacts`)
  and paste the URL into `## Artifacts`; otherwise cite `/app/state`. Projection-only — a stale status it
  surfaces gets fixed through the finding router (§6.7), never the renderer.

### 2. Update the SESSION file

Open the current `docs/sprints/SESSION_NNNN.md`. Fill in:

- `Delivered` — the ONE table: task ID · status · what landed (template v2 merges the old
  `Task log` + `What landed`; if the `Goal` wasn't reached, say so explicitly and why), plus
  `Decisions resolved` and key files with one-line notes
- `Artifacts` — every Artifact **published** this session (private claude.ai links) with a **status**
  (`keep` / `discard` / `promote`); "None." if none (SESSION_0617 convention)
- `Open decisions / blockers` · `Next session: Goal + First task (+ inputs to read)`
- **ADR 0049 pre-stage:** mint N+1 (`bun scripts/ledger-id-next.ts --prefix=SESSION`), create the real
  `SESSION_NNNN+1.md` stub with `status: staged` + Goal/First-task copied from your `Next session` block,
  and set `next_session:` in this session's frontmatter. Skip only when the lane explicitly ends.
- `Close evidence` — the `/ggr` composite + Systemic-health line + reviewer verdicts + evidence table
  (template v2 merges the old `Review log` / `Hostile close review` / `Full close evidence`), plus the
  ADR / ubiquitous-language line
- Frontmatter `status: closed`

**Single source of truth (SESSION_0342):** status lives only in the frontmatter `status:` field; the body
`## Status` section is a pointer, not a second copy.

**SESSION-file gate:** before setting `closed`, verify the file has ≥1 task table row (the gate runner's
Gate 2 counts lines starting `| SESSION_NNNN_TASK_` anywhere in the file — the v2 `## Delivered` table or
the legacy `## Task log` both satisfy it):

```bash
grep -cE '^\| *SESSION_[0-9]{4}_TASK_[0-9]+' docs/sprints/SESSION_NNNN.md
```

Must return ≥ 1. Never append to `docs/protocols/project-log.md` — it is frozen (SESSION_0228).

### 3. JETTY 3.0 sweep on touched files

For every file in `Files touched`:

- **Frontmatter:** wiki/architecture docs get current `updated` + `last_agent`; annotated code files get
  `updated` bumped and `health` re-evaluated.
- **Backlinks both directions:** if A references B, both A's and B's frontmatter reflect the link
  (`backlinks` / `pairs_with` — verify both pages list each other for any new cross-reference).
- **Wiki index (FS-0019 gate):** if new wiki pages were created or a page's status/health changed, add/update
  the rows in `docs/knowledge/wiki/index.md` and bump its `updated`. If the session **added, moved, or retired
  a runbook**, update the [runbooks domain hub](../runbooks/README.md) in the same pass — and a moved doc
  always ships its inbound relinks atomically. (Session rows no longer live in the wiki index — the
  SESSION_NNNN spine is the source of truth.)
- **Formatting (G8/R8):** handled by the step-1 gate runner — incremental, touched files only.

Then run wiki-lint from the repo root and record the real result (never "wiki-lint ran" without counts,
and note whether failures are pre-existing or introduced):

```bash
bun run wiki:lint
```

### 4. Git hygiene

> **Single-push order (FS-0025) — defer this step to LAST.** Finish all SESSION-file content first, then
> stage → one commit → one push. The only value you can't write pre-commit is the commit hash — the evidence
> cell reads `see git log`; state the hash in the bow-out chat response. Never a second "fill close evidence"
> commit.

1. **Branch check:** `git branch --show-current` — on `main` when you should be on a feature branch → stop
   and discuss.
2. **Worktree check:** `git worktree list`. Merged session worktree → remove it + delete the branch (stale
   worktrees are the parallel-session unclean close). Unique commits/uncommitted files → record and leave.
3. **Stage and review:** `git add -A && git status` — no secrets/`.env`/`node_modules` (gate runner Gate 12b
   secret scan is the backstop; a hit blocks until removed **and rotated**). **FS-0035:** if a *sibling*
   session's file is in the tree, do **NOT** `git add -A` — stage explicit paths and confirm the sibling
   file isn't staged (`git diff --cached --name-only | grep SESSION_MMMM`).
4. **Commit:** conventional message; don't bundle unrelated changes.
5. **Push + PR:** only with explicit operator authorization. **`main` is PR-only (ADR 0053)**:

   ```bash
   git push -u origin HEAD                                    # your session branch, never main
   gh pr create --fill && gh pr merge --squash --delete-branch
   ```

   Docs-only PRs are still free (`paths-ignore` applies to `pull_request` too) — don't "optimize" the PR
   away. Push rejected because a sibling advanced the branch → **rebase, never force**.
6. **Release the canonical claim (FS-0035):** `bash scripts/canonical-claim.sh release --session NNNN`
   after the push (no-op if the session ran isolated in its own worktree).

If the user hasn't authorized commits, leave changes uncommitted and note that in `Open decisions / blockers`.

### 4a. Pre-push cost gate (CI / GitHub Actions spend)

An **app-code** push (`apps/web/**`) fires the full CI matrix (typecheck, unit, oxc, Playwright ×3) *and* a
Vercel prod deploy. Before one: **run `next build` locally** (`cd apps/web && bun run build` — it mirrors
Vercel and catches the `"use server"` / Prisma-in-browser / dynamic-import traps tsc/tests miss; push only
when green) · **one push per session at close**, a complete verified unit · **keep docs separate from code
when independent** (docs-only pushes are free — `paths-ignore` + `vercel.json` `ignoreCommand`; a mixed
commit pays the full matrix). Record the local-build result in the evidence table. (Standing cost lever:
Playwright ×3 per push → chromium-only per-push with ×3 nightly.)

### 4b. Graphify update (run by the step-1 gate runner)

The gate runner already ran `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` and captured the counts —
before the commit on purpose (FS-0025: `.graphify/` is git-ignored and indexes the working tree). Nothing to
do unless the runner reported Graphify unavailable — then run manually or record "skipped."

**Docs Navigator** ([runbook](../runbooks/dev-environment/docs-navigator.md)) is **regenerate-only — never
commit it.** `docs/index.html` is generated (~17.5 MB) and git-ignored; `bun run docs:nav` on demand. Not a
close gate — it must never enter a commit.

### 4c. E2E run-evidence guard (FS-0031)

If the diff **touches `apps/web/e2e/**`**, a new/changed Playwright assertion must have been **run locally**
before it ships (FS-0031: three red-`main` pushes from assertions "verified by inspection"). Recipe:
`cd apps/web && bun run e2e:db:setup` (needs `.env.e2e` with both DB URLs on `ronindojo_e2e`; migrate-only) →
`bun run dev:e2e` (a Node launcher — NEVER run `next` under the bun runtime; it poisons Turbopack's PostCSS
worker) → `bun run test:e2e:local -- <spec> --project=chromium` (writes `apps/web/.e2e-run-evidence.json`) →
gate the close with `bun run e2e:evidence:check` (override only with a real `--waiver="…"`).

Hook policy (SESSION_0624, ADR 0053): hook logic lives in `scripts/githooks/` (tracked, PR-reviewed, never
hand-written into `.git/hooks/`); inert until `install.sh` runs once per clone; prove guards live with
`bash scripts/githooks/doctor.sh` (FS-0040). The e2e-evidence check is not wired into a git hook.

### 5. Bow-out line

State to the user (or in the SESSION file): "Bowed out — SESSION_NNNN closed. Next session goal: {one line}."

That's the core close done.

## Optional deep items

Do these when useful — especially at end of day, end of sprint, milestone, or when the session touched
schema/auth/payments/deployment/production data.

> **Sprint-boundary cadence:** when a sprint closes/opens (a new `S#`) or on signal (token burn
> rediscovering files, suspected duplication/drift, before a large porting lane), run
> [`hostile-repo-review.md`](../protocols/hostile-repo-review.md) — the repo-wide sibling of the per-diff
> close review. The protocol governs by being *triggered here*, not remembered (SESSION_0467). Not a
> per-session step.

### 6. Reflections (in the SESSION file) — the routing receipt

Add a `## Reflections` section: **≤ 5 bullets**, each a lesson worth remembering (a surprise, a near-break,
a pattern/anti-pattern), and **each bullet MUST end with a route** — `→ route: <ledger-id>` (the row it
became), `→ route: <file edited>` (the doc/protocol it fixed), or `→ route: no-action (<why>)`. A lesson
without a route is exactly the "discussed and it evaporated" failure §6.8 guards against. **"Reflections"
is the one name** — the legacy "Kaizen" alias is retired.

### 6a. Evidence artifact (required when Doug ran live UAT; on-request otherwise)

The step-1 gate runner **pre-fills the deterministic cells** of this table — paste its output and fill only
the judgment cells. The schema:

```markdown
## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | <files checked; updated/last_agent/health changes or "no frontmatter changes needed"> |
| Backlinks/index sweep | <pairs_with/backlinks/index changes or "no new links"> |
| Wiki lint | <command + pass/fail count + whether failures are pre-existing or introduced> |
| Reflections routing receipt | <N lessons → N routes (ids)> |
| Hostile close review | <TASK_REVIEW_LOG entry or not-applicable line> |
| Code-quality gate (Class-A) | <`/code-quality` score /10 + any hard-cap, or "no Class-A custom code this session"> |
| Runtime verification (Doug) | <`qa-runtime-verification` result for touched routes/actions, or "no runtime surface touched"> |
| Evidence-artifact URL | <published Artifact link for Doug's live UAT / visual proof, or "n/a — no runtime surface touched"> |
| Review & Recommend | <next session goal written: yes/no> |
| Memory sweep | <operator memory update, protocol/doc update, or "none needed because..."> |
| Next session unblock check | <unblocked or blocked-on-user with reason> |
| Git hygiene | <branch, worktree list result, status, "single push — hash reported at bow-out / see git log", or explicit no-commit reason (FS-0025: no second evidence commit)> |
| Graphify update | <node/edge/community count (run BEFORE the close commit, FS-0025), or "skipped — unavailable/no file changes"> |
```

Generic checkmarks are not enough — the proof cell must say what was checked or what changed. The
`Reflections routing receipt` cell is the ONE name for the old "Kaizen" row: `N lessons → N routes (ids)`.

**Policy (SESSION_0582/0584, enforced by `bow-out-gates.sh` Gate 12c):** the `Evidence-artifact URL` row is
**required whenever `Runtime verification (Doug)` is anything but "no runtime surface touched"** — publish
the live-UAT / visual proof as an Artifact link ([[preview-via-published-artifacts]] — inline widgets don't
render for the operator). Runtime-free session → `n/a` is complete; otherwise artifacts are on-request only.

### 6b. Repo code glossary (optional, on-demand)

Not a gate. Add to [`repo-code-glossary.md`](../knowledge/wiki/repo-code-glossary.md) when the operator asks
or when the session used a term a non-technical reader would stumble on. 1–2 plain-English lines + one
concrete example. Skip silently when nothing new came up.

### 6.5. Review & Recommend (stage the next session)

Run **[`/ggr`](../../.claude/skills/ggr/SKILL.md)** — the universal QAR closing gate (ADR 0052 D4/D5/D6). It is the hard pass that checks plan sanity, Dirstarter alignment, security, data integrity, verification honesty, and standards compliance, and it **enforces the gate policy**: **≥9.0 clears · 7.0–8.9 auto-loops ≤2 Giddy passes then the operator gate · hard-caps always loop**. For a Build lane `/ggr` applies the [`hostile-close-review`](../protocols/hostile-close-review.md) caps + the 100/1k/10k confidence triad as its rubric — **one review, not two** (that protocol is the referenced *how*; `/ggr` is the invocation). If the session touched a Dirstarter baseline layer, check live `https://dirstarter.com/docs` pages and cite the sources in the close evidence. **Record the `/ggr` composite in `## Close evidence`** (legacy sessions: `## Review log`) — a code-touching session's close is verified by `bow-out-gates` Gate 12d grepping the SESSION file for it.

Then run [Review & Recommend](../protocols/review-recommend.md): review what landed, check the boundary
registry + program plan, write the `Next session` recommendation, and materialize it as the ADR 0049 staged
stub (§2 pre-stage). **Seed `Next session → Goal + First task` from the top-ranked open backlog item** —
board order first (`cd apps/web && bun scripts/board-backlog.ts --top=10`), then ledger rank — unless the
operator pinned a `/goal` (SESSION_0476). Optionally pre-write the next [Petey plan](../protocols/petey-plan.md).
The review entry must reference the session's task IDs and list unresolved findings as open follow-ups.

### 6.6. ADR + ubiquitous-language check

If the session made, changed, or rejected an architectural decision, create/update an ADR in
`docs/architecture/decisions/`. Decisions touching a Dirstarter baseline layer (project structure,
Prisma/database, Better Auth, payments/Stripe, storage/media, deployment/cron, content/blog/SEO,
theming/UI primitives) must include a compact `Dirstarter docs proof` table with live-doc URLs — no long
excerpts. New/changed domain terms → update [Ubiquitous Language](../architecture/ubiquitous-language.md).
If neither is needed, record that explicitly in the SESSION file.

### 6.7. Finding router — where each finding type goes

A session surfaces different kinds of findings; each has **one** canonical home so the record doesn't fragment. Route by type:

| Finding type | Goes to | ID prefix |
| --- | --- | --- |
| Incomplete/dead wiring, storage gaps, FS-0001 handroll slips, dead plumbing | [`wiring-ledger.md`](../knowledge/wiki/wiring-ledger.md) | `WL-P{0,1,2}-N` |
| Architectural divergence / two-sources-of-truth / spec-vs-impl drift | [`drift-register.md`](../knowledge/wiki/drift-register.md) | `D-NNN` |
| SOP/protocol violation + its corrective action | [`failed-steps-log.md`](../protocols/failed-steps-log.md) | `FS-NNNN` |
| Design / UX consistency, mobile, or accessibility finding (a Desi design pass) | [`desi-design-ledger.md`](../knowledge/wiki/desi-design-ledger.md) | `DES-NNN` |
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

**Wiring-ledger sweep (includes the built-not-wired class):** if the session surfaced or resolved wiring debt, append rows with stable `WL-P{0,1,2}-N` IDs (or flip resolved rows to ✅/fixed). **Explicitly sweep for "built-but-not-wired"** — anything you *built* this session that compiles and is reachable but is **not mounted/linked/promoted where it's consumed** (an orphaned component not in its aggregator, a route with no nav link, an intake note not promoted, a surface behind an unset flag). It won't read as "dead wiring," so name it here or it escapes (SESSION_0619: token-cost panel orphaned from `attention-panels.tsx` = WL-P2-70; the operator had to find it). One WL row per gap — the WL is the single home, no per-session section. Skip only if nothing was built or everything built is wired.

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

If anything from this session is worth carrying across **all** future sessions (a constraint, a gotcha, a
user preference that shapes work), update operator-side memory. Do *not* memory-dump the SESSION file —
memory is for project-scoped facts, not session records.

### 8. Confirm next session is unblocked

Re-read `Open decisions / blockers` + `Next session`. If the next `First task` needs user input first,
explicitly note "BLOCKED ON USER" in the entry.

## Unclean close recovery

Moved to [`docs/runbooks/dev-environment/unclean-close-recovery.md`](../runbooks/dev-environment/unclean-close-recovery.md)
(SESSION_0711). Use it when a previous session's bow-out was skipped — crash, compaction, or operator error.

## What this ritual is NOT

- Not a forced commit. Sometimes the right close is "uncommitted, here's what's queued."
- Not a comprehensive log. Diff is the log; the SESSION file is the *summary*.
- Not heavy ceremony. Quick close should take 60 seconds. Full close should take 5 minutes.

## What you must not skip

- The SESSION file update. **Always.** If you skipped it, the session didn't close — it crashed.
- The `Next session` entry. If the next session can't pick up the thread, this ritual failed.
- The JETTY sweep (step 3) on touched wiki pages — or the next agent inherits broken references.
- The git hygiene check (step 4). Uncommitted changes with no record = lost work.

## Cross-references

- [Opening ritual](opening.md) — paired counterpart at the start of a session.
- [SESSION_TEMPLATE](../sprints/_template/SESSION_TEMPLATE.md) — the SESSION file format (absorbed `chat-handoff.md`).
- [Wiki lint protocol](../protocols/wiki-lint.md) — rules for the JETTY sweep verification.
- [Code guardrails](../protocols/code-guardrails.md) — coding standards enforced every session.
- [FAILED_STEPS Log](../protocols/failed-steps-log.md) — append-only log for protocol misses and mitigations.
- [Incidents log](../knowledge/wiki/incidents.md) — append-only log for unclean closes.
- [Giddy + Doug Hostile Close Review](../protocols/hostile-close-review.md) — the hard close review `/ggr` applies.
- [Manual Boundary Registry](../knowledge/wiki/manual-boundary-registry.md) — log/update "smoke pending" boundaries.
- [Review & Recommend protocol](../protocols/review-recommend.md) — the review + next-target cycle at full close.
- [Unclean close recovery runbook](../runbooks/dev-environment/unclean-close-recovery.md) — when the previous bow-out was skipped.
