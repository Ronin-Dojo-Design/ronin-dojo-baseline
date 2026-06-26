---
title: "SESSION 0451 — operator's pick (Stage-2 parked): cleanup leftovers / cred rotation / security-docs / BBL feature"
slug: session-0451
type: session--open
status: closed
created: 2026-06-26
updated: 2026-06-26
last_agent: claude-session-0451
sprint: S45
pairs_with:

  - docs/sprints/SESSION_0450.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0451 — operator's pick (Stage-2 parked)

> **PRE-STAGED at SESSION_0450 bow-out — not yet started.** The next session's bow-in should read this
> file, let the operator pick / reorder the lane (no autopilot), then execute. The candidate Petey plan
> below is a menu, not a commitment — the operator adds/removes tasks at bow-in.

## Date

2026-06-26

## Operator

Brian + claude-session-0451

## Goal

Stage-2 brand-schema-drop lane is **PARKED** (the `brand` column is the multi-product separator —
`[[brand-vestige-trim-inventory]]`). Operator selected orig TASK_01 + TASK_03 + TASK_04 **plus a `/goal`**
that adds a code-quality-standard lane. Confirmed sequence at bow-in (grilled via AskUserQuestion —
matrix-first, doc+skill, last-3-sessions scope):

1. **Lane A — Code-quality standard + matrix** (`/goal`): establish `code-gold-standard` + a reusable
   `code-quality-matrix` (/10 rubric for our *custom* code judged vs the Dirstarter boilerplate baseline +
   our documented extensions), as a **protocol doc + a `/code-quality` skill** (mirrors `fallow-fix-loop`).
   Compose existing scoring (`pr-review-score-fix-loop` accelerator + /10, `fallow` CRAP/dupe/dead-code
   delta, `jetty-annotation-standard`). Currency-check `jetty-annotation-standard.md`.
2. **Lane C — Apply the matrix** (`/goal`): `fallow health` + `fallow audit` + the fallow-fix-loop over the
   **last ~3 sessions' app code** (0447–0450). Score with the matrix, answer "Apple/Facebook-grade?", apply
   KISS/DRY/YAGNI refactors with **no behavior regression**, re-verify headless.
3. **Lane B — Make the claims work** (orig TASK_04 / FI-001 P0): **Tony Hua** finishes his claim path and
   **Brian Truelson** can receive his email + claim. Discovery spike first; PR route (authz/public-surface).
4. **Lane D — Memory/docs de-dup** (orig TASK_01): the 4 audit leftovers from SESSION_0450.
5. **Lane E — Security-docs audit** (orig TASK_03): `docs/security/*` vs the single-brand-collapse reality.

Not selected: orig TASK_02 (Neon pw rotation — still an open follow-up), orig TASK_05 (future
Baseline-courses-on-BBL feature).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0450.md` (closed). It refreshed prodsnap == prod, gate-reviewed
  + PARKED the brand-column drop (banked a verified purge tool), and did a memory/governance-docs cleanup.
- Carryover: no blocker. prodsnap is fresh. The brand column stays. A few cleanup leftovers + standing
  follow-ups remain (below).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: SESSION_0450 pushed a **docs-only** commit. Expect ONE intentionally-untracked file —
  `apps/web/scripts/purge-non-bbl-baseline-data.ts` (the banked purge tool, held out of the docs push to
  avoid a no-op BBL redeploy). Not a problem; it lands free on the next app-code push. Don't run it.

## Petey plan (CONFIRMED at bow-in — sequence locked via grill)

### Goal

Execute lanes A → C → B in order, with D + E as a disjoint docs-only parallel track. Re-IDed to execution
order; candidate-menu mapping noted per task.

### Tasks

#### SESSION_0451_TASK_01 — Lane A: code-quality standard + `code-quality-matrix` + `/code-quality` skill

- **Agent:** Petey → Cody (governance artifact)
- **What:** Net-new `code-gold-standard` definition + a reusable `code-quality-matrix` (/10 rubric) for our
  **custom** code, judged vs the Dirstarter boilerplate baseline + our documented extensions. Ship as a
  **protocol doc + a `/code-quality` skill** (mirrors `fallow-fix-loop`). Compose `pr-review-score-fix-loop`
  (binary accelerator + /10 avg), `fallow` (CRAP/dupe/dead-code delta), `jetty-annotation-standard`, and the
  hostile-review rubric. Currency-check `jetty-annotation-standard.md` (last updated 2026-05-12).
- **Inputs:** `hostile-repo-review.md`, `hostile-close-review.md`, `pr-review-score-fix-loop.md`,
  `fallow-fix-loop` SKILL, Dirstarter inventory + `custom-component-inventory.md`, `code-guardrails.md`.
- **Done means:** `docs/protocols/code-quality-matrix.md` + `.claude/skills/code-quality/SKILL.md` exist,
  wiki-lint clean; jetty standard confirmed current or updated; dimensions + scoring defined.
- **From candidate:** the `/goal` quality half (net-new).

#### SESSION_0451_TASK_02 — Lane C: apply the matrix + fallow-fix-loop on last ~3 sessions' app code

- **Agent:** Cody/Doug
- **What:** Run `fallow health` + `fallow audit` over the app-code touched in 0447–0450 (claim-path,
  brand-collapse, owner-email PII fix, recent touches). Score each touched area with the new matrix; answer
  "is this Apple/Facebook-grade?" with evidence; apply KISS/DRY/YAGNI refactors with **no behavior
  regression**; re-verify headless + re-measure fallow delta.
- **Done means:** a scored report (per-area /10 + Apple/FB verdict), refactors applied + behavior re-verified,
  before→after fallow delta, inherited debt named (not adopted).
- **From candidate:** the `/goal` quality half (net-new). **Depends on:** TASK_01.

#### SESSION_0451_TASK_03 — Lane B: make Tony Hua + Brian Truelson claims work (FI-001 P0)

- **Agent:** Petey → Cody → Doug
- **What:** Discovery spike (current state of Tony's + Brian Truelson's claim against prodsnap == prod + the
  claim code), diagnose what's broken, fix so **Tony can finish his claim path** and **Brian Truelson can
  receive his email + claim** (FI-001: first-tester onboarding + lifetime comp + thank-you email).
- **Watch:** BBL-scoped Resend key (Baseline key 403s; Vercel vars pull empty — `[[bbl-resend-key-and-dogfood-teardown]]`);
  magic-link callbackURL double-decode (`[[magic-link-callback-double-decode]]`); claim unification (ADR 0036).
- **Done means:** Tony's claim completes end-to-end; Brian Truelson's invite/claim path verified; PR route
  (authz/public-surface) — held for operator go.
- **From candidate:** orig TASK_04 (BBL feature from POST_LAUNCH_SOT).

#### SESSION_0451_TASK_04 — Lane D: finish the memory + governance-docs de-dup (carryover from 0450 TASK_05)

- **Agent:** Giddy
- **What:** (a) fix the stale "prodsnap has ZERO legacy BBL claims" line in `bbl-sot-spec-program.md`;
  (b) resolve the `bbl-launch-is-the-focus` ↔ `bbl-paid-live-and-e2e-green` launch-status conflict (verify
  `BBL_COUNTDOWN` / reveal state first); (c) merge claim-file overlaps; (d) lean
  `.github/copilot-instructions.md` (12KB).
- **Done means:** no stale/conflicting memory; Copilot doc de-duped; MEMORY.md still < 17KB.
- **From candidate:** orig TASK_01.

#### SESSION_0451_TASK_05 — Lane E: SESSION_0446 stale-security-docs audit

- **Agent:** Giddy/Doug
- **What:** `docs/security/*` was written for the dead multi-brand model. Trim/keep/update — distinguish the
  still-load-bearing host→brand security gate (MB-002, KEEP-FOREVER) from multi-brand-only hardening. Don't
  blind-delete risk rows; update rationale.
- **Done means:** `docs/security/*` reflects single-brand-collapse + multi-product reality; MB-002 marked
  load-bearing.
- **From candidate:** orig TASK_03.

### Not selected (this session)

- orig TASK_02 — 🔐 rotate prod Neon password (re-exposed in 0450 transcript). Still an open follow-up.
- orig TASK_05 — (future) "BJJ courses under a Baseline school listing on BBL" feature.

### Open decisions

- Brian Truelson email mechanism + the BBL Resend-key dependency (resolve in TASK_03 discovery).

### Scope guard

- Do NOT touch the `brand` column / `Brand` enum / `lib/brand-context.ts` (Stage-2 parked; column is the
  multi-product separator). The banked purge `scripts/purge-non-bbl-baseline-data.ts` is for the FUTURE
  Baseline extraction only — do not run it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0451_TASK_01 | landed | Lane A — `code-quality-matrix.md` + `/code-quality` skill + jetty currency-fix; wiki-lint 0 errors |
| SESSION_0451_TASK_02 | landed | Lane C — fallow baseline (MI 88.7 good; brand collapse −9.8k LOC; claim path 0 findings); flagship `claim-finalize.ts` scored near-gold (1 G1 ternary ding); **the regression below IS the Lane C logic-improvement win** |
| SESSION_0451_TASK_03 | landed (code held for PR) | Lane B — root-caused Tony's "rank reverts": **systemic stale `/admin/*` revalidate-path regression** from the 0448 admin→app migration (8 files). Fix built+verified (typecheck/lint/format clean; PROVEN against prod — operator's 06-26 saves persisted, only view didn't refresh). Branch `session-0451-admin-revalidate-paths` (push as PR at close, operator-approved). **Tony prod data-op COMMITTED + verified on prod** (operator GO): award `crpx54ie`→VERIFIED (awardedBy Brian), leftover claim `ne5shet1`→CANCELLED; 0 open claims remain. Brian Truelson deferred (operator). |
| SESSION_0451_TASK_04 | landed | Lane D — memory/docs de-dup (subagent): stale prodsnap line fixed, launch-status consolidated (countdown OFF verified), claim memories cross-linked, copilot-instructions 12.4KB→4.3KB; MEMORY.md 14.5KB |
| SESSION_0451_TASK_05 | landed | Lane E — security-docs audit (subagent): 0447 had destaled 5/6; found+fixed the missed `privacy-data-classification.md`; sharpened the "no 2nd tenant" claim vs the 388 co-resident Baseline rows; MB-002 marked load-bearing; wiki-lint 0 errors |

## What landed

- **Lane A — the code-gold-standard now exists.** New `docs/protocols/code-quality-matrix.md` (a /10 rubric
  across 7 weighted dimensions + a **Class A/B/C judging protocol** for *custom* code vs the Dirstarter
  baseline + hard caps inherited from hostile-close) and a runnable **`/code-quality` skill** that applies it
  (gather fallow evidence → classify → score → cap → fix → re-verify). Currency-checked `jetty-annotation-standard.md`
  (fixed a stale `app/admin/invites/` → `app/app/invites/` reference from the retired admin tree).
- **Lane C — answered "is this Apple/Facebook-grade?" with evidence.** fallow baseline on the 0447–0450 window:
  maintainability **88.7 (good)**, avg cyclomatic **2.3**, brand collapse removed ~9.8k LOC. Flagship
  `claim-finalize.ts` (Class B) scored near-gold (excellent why-docs, idempotent single-purpose materializers,
  DB-enforced double-claim guards; dings = one G1 nested-ternary + `type Tx = any`). **The matrix earned its
  keep** by surfacing the regression below — a real shipped logic bug, not a style nit.
- **Lane B — root-caused + fixed a systemic admin regression, and cleared Tony.** Tony's "rank saves but reverts"
  was **not** a save bug — the prod audit log shows his 06-26 saves persisted; the admin view never refreshed
  because the **0448 admin→app route migration left `revalidatePath()` targeting the retired `/admin/*` redirect
  stubs** instead of the live `/app/*` pages. Swept all 8 files (`/admin/*` → `/app/*` revalidate paths;
  imports untouched). Verified: typecheck/lint/format clean; every target route confirmed live; root cause
  proven by the prod audit log + route topology (`/admin/*`=308 redirect stub, `/app/*`=live) + the
  `next.config.ts` redirect map. **Tony's prod data committed + verified** (operator GO): 3rd-degree RankAward
  → VERIFIED (vouched by Brian), leftover duplicate directory claim → CANCELLED, 0 open claims remain.
- **Lanes D + E (parallel subagent) — docs/memory cleanup.** D: stale prodsnap line fixed, launch-status
  consolidated (verified countdown OFF), claim memories cross-linked, `.github/copilot-instructions.md`
  12.4KB→4.3KB; MEMORY.md 14.5KB. E: 0447 had already destaled 5/6 security docs — found + fixed the missed
  `privacy-data-classification.md`, sharpened the "no second tenant" claim against the 388 co-resident Baseline
  rows, MB-002 marked load-bearing. wiki-lint 0 errors.
- **Deferred (operator):** Brian Truelson first-tester invite (FI-001) → next session. Note: the BBL Resend
  creds (`RESEND_API_KEY` + `RESEND_SENDER_EMAIL_BBL`) are **already present in `.env.prod`** — the dependency
  I flagged is resolved.

## Files touched

| File | Change |
| --- | --- |
| `docs/protocols/code-quality-matrix.md` | NEW — the /10 code-gold-standard rubric + Class A/B/C custom-vs-Dirstarter judging + caps |
| `.claude/skills/code-quality/SKILL.md` | NEW — runnable loop applying the matrix |
| `docs/protocols/jetty-annotation-standard.md` | currency-fix (retired `app/admin/invites/` → `app/app/invites/`); linked to the matrix; metadata bump |
| `apps/web/server/admin/{lineage,users,memberships,entitlements,tournaments,org-settings}/actions.ts`, `apps/web/server/admin/users/queries.ts`, `apps/web/server/web/media/actions.ts` | **the fix** — `revalidatePath("/admin/*")` → `"/app/*"` (8 files) |
| `docs/knowledge/wiki/index.md` | matrix row added |
| `.github/copilot-instructions.md` | Lane D — 12.4KB→4.3KB lean (de-dup → canonical-doc pointers; purged 4-brand drift) |
| `docs/security/{README,brand-scope-hardening-plan,privacy-data-classification,ronin-security-risk-register}.md` | Lane E — single-brand-collapse destale; MB-002 load-bearing; "no 2nd tenant" sharpened |
| `apps/web/scripts/purge-non-bbl-baseline-data.ts` | banked tool from 0450 — lands free on this app-code push (still never run) |
| `docs/sprints/SESSION_0451.md` | this session record |

(Non-file: PROD data — Tony's RankAward verified + leftover claim cancelled, both operator-approved + verified post-commit.)

## Decisions resolved

- **Quality lane shape** (grill): matrix-first → doc + `/code-quality` skill → fallow scope = last ~3 sessions.
- **Revalidate-path regression: fix the whole class** (operator), not just lineage.
- **Tony = option 1** (operator GO): verify his award + cancel the leftover duplicate claim — committed to prod.
- **Brian Truelson deferred** to next session (operator).
- **Claim-path consolidation** (lineage node-claim ↔ directory profile claim → parity with the better version)
  = a noted **future lane**, not this session (operator: "take care of Tony now").

## Reflections

- **"Saves but reverts" is a cache-invalidation smell, not a write bug — confirm which.** The instinct was a
  write/read field mismatch; the truth was the write persisted fine and the *revalidate target* was a dead
  redirect stub. The prod audit log (the operator's own saves) was the decisive evidence — it proved persistence
  and pointed straight at the view layer. Read the audit trail before theorizing about the writer.
- **A route migration must carry its `revalidatePath()` calls.** The 0448 admin→app migration added
  `/admin/*`→`/app/*` redirects (so links kept working) but left every `revalidatePath("/admin/...")` pointing at
  the now-stub path — silently breaking refresh across the *entire* admin (lineage, users, memberships,
  entitlements, tournaments, org-settings). The redirects masked it: pages still loaded, mutations still
  persisted, only the post-mutation refresh was dead. Migration checklists need a "grep revalidatePath/redirect
  for the old prefix" step.
- **The quality matrix paid for itself on first use.** The /goal asked for a rubric *and* an assessment; applying
  the fallow lens to recently-touched code is what surfaced the revalidate regression (a behavior bug the matrix
  caps at "not shippable"). Quality tooling that only confirms "looks clean" is theater; this one found a real
  shipped defect.
- **prodsnap freshness has a one-day teeth.** prodsnap (06-25) showed Tony's `rankAwardId` NULL; prod (06-26) had
  it set from his own saves. Verifying the prod-affecting claim against PROD, not the snapshot, both confirmed the
  diagnosis and avoided "fixing" a non-problem. Same lesson as 0449/0450.

## Review log

### SESSION_0451_REVIEW_01 — quality matrix + revalidate-path regression fix + Tony prod cleanup

- **Reviewed tasks:** TASK_01 (matrix + skill), TASK_02 (fallow assessment), TASK_03 (revalidate fix + Tony
  data-op), TASK_04/05 (subagent docs/memory).
- **Dirstarter docs check:** cached/inventory sufficient — the revalidate fix is a Next.js App-Router cache
  concern (not a Dirstarter baseline layer); the matrix *references* the live Dirstarter docs as the Class-A
  judging source but added no baseline-layer code.
- **Verdict:** Strong. The regression was root-caused with converging evidence (prod audit log + route topology +
  redirect config), the fix is mechanical/low-risk with imports provably untouched, and gates are green. The Tony
  prod mutation was dry-run-proven, operator-gated, idempotent-guarded, and verified post-commit on a fresh
  connection. The one gap is that the *fixed runtime behavior* (admin view refreshes post-deploy) is proven by
  inspection + prod-data, not yet by a live render (the PR isn't merged/deployed) — caps verification honesty.
- **Score:** 9.2/10 (½ off: no live render of the fixed refresh behavior pre-deploy; verify post-merge).
- **Follow-up:** merge the PR + browser-verify Tony's admin card renders his rank after deploy (next session
  first task); FS entry for the migration-revalidate lesson.

## Hostile close review

- **Giddy:** **pass** — clean feature branch, focused mechanical diff, imports verified intact, no scope creep
  into the parked `brand` column. The fix completes an incomplete migration rather than adding surface area.
- **Doug:** **pass** — root cause proven on three independent legs (prod audit log showing the persisted saves,
  the `/admin`=308-stub vs `/app`=live route topology, the `next.config.ts` redirect map); gates green; the prod
  data-op was dry-run → commit → fresh-read-verified. Open: live render of the refreshed admin view is
  deploy-gated (verify post-merge).
- **Desi:** **pass (n/a)** — no UI built; the fix restores existing admin refresh behavior.
- **Kaizen — safe/secure + proof:** the path swap is string-only with typecheck green and no logic/authz change;
  Tony's award-verify is an admin vouch (no exposure). Proof that would close the last gap: a headless test on the
  deployed admin showing the rank persists across navigation.
- **Kaizen — preventable failed steps:** the 0448 migration's missing revalidate-path update is the root process
  slip; a migration checklist line ("grep old route prefix in `revalidatePath`/`redirect`/links") prevents the
  class. Minor: the surface/repro decision oscillated before the audit-log evidence settled it.
- **Kaizen — confidence at 100/1k/10k:** **9/9/9** — the fix is a compile-time string change with zero added
  runtime cost; it scales trivially. Tony's data-op is a one-off, idempotent, verified.
- **Aggregate:** 9.2/10.

## ADR / ubiquitous-language check

- **No new ADR.** The matrix is a *governance protocol* (a rubric), not an architectural decision — it composes
  existing decisions (pr-review-score, hostile-close, fallow, jetty). The revalidate fix is a bug fix; Tony's
  data-op is ops. No baseline-layer architecture changed.
- **Ubiquitous language:** no new terms (reused: revalidate path, Router Cache, redirect stub, Class A/B/C,
  code-gold-standard, awarded-truth, directory claim vs lineage claim).
- **Finding router:** the migration-revalidate miss → `failed-steps-log` (FS) as a process lesson with the
  corrective grep step. The matrix → `wiki/index.md` (done). No drift/wiring/incident rows.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | new `code-quality-matrix.md` + `code-quality/SKILL.md` carry frontmatter; `jetty-annotation-standard.md` + `wiki/index.md` `updated`/`last_agent` bumped; security docs + copilot handled by the Lane D/E subagent (frontmatter verified) |
| Backlinks/index sweep | matrix ↔ jetty `pairs_with` linked; `wiki/index.md` matrix row added |
| Wiki lint | `bun run wiki:lint` → 0 errors (15 warnings, all pre-existing in untouched files) — recorded in bow-out chat |
| Kaizen reflection | yes (Reflections above) |
| Hostile close review | SESSION_0451_REVIEW_01 + Giddy/Doug/Desi above (9.2/10) |
| Review & Recommend | yes — Next session = Brian Truelson FI-001 + merge/verify the revalidate PR |
| Memory sweep | NEW `[[admin-app-migration-revalidate-paths]]` gotcha; NEW `[[code-quality-matrix-and-skill]]` pointer; updated `[[lineage-rank-display-awarded-truth]]` (Tony resolved) |
| Next session unblock check | unblocked — Brian invite is doable (Resend creds confirmed in `.env.prod`); first task = merge/verify the PR |
| Git hygiene | branch `session-0451-admin-revalidate-paths`; structured commits; **push as PR (operator-approved)** — hash reported at bow-out / see git log |
| Graphify update | run before the close commit — count recorded in bow-out chat |
| Pre-push cost gate | `next build` run locally before the app-code push — result in bow-out chat |

## Next session

### Goal

**LEAD LANE — make the Loop of Loops + AdminKanban actually functional** (operator-requested 0451; the first
"ledger-driven session", eating our own dog food). Per [`loop-of-loops-ledger-driven-sessions.md`](../protocols/loop-of-loops-ledger-driven-sessions.md):
P1 = add the bow-in *ledger-scan + bundle 3–5 items* step to `opening.md`; P2 = `scripts/ledger-backlog.ts`
(read-only aggregator of all open ledger items → one ranked backlog); **P3 = DB-back the AdminKanban as a
ledger projection** (a `Task`/`BoardItem` model + sync; the board stops being a localStorage demo fixture and
becomes the operator-visible backlog — schema → PR route). This is a real feature build, deliberately NOT
rushed into the 0451 close tail.

**Carryover bundle (the session's other ledger items):** (a) **merge the `session-0451-admin-revalidate-paths`
PR** + browser-verify Tony's admin rank renders post-deploy (the 0451 verification gap); (b) **Brian Truelson
FI-001 (P0)** — mint + send his BBL claim email (placeholder Passport `5f3ead66` + node `brian-truelson` ready;
BBL Resend creds confirmed in `.env.prod`).

### First task

1. **Run `/fallow-fix-loop`** (fallow health + audit) over the files touched THIS session (the 8
   `server/admin|web/**` revalidate edits) — operator-requested final quality pass; confirm no new
   CRAP/dupes/dead-code, behavior unchanged.
2. **Loop-of-Loops P1** (docs, free push): add the bow-in ledger-scan + bundle step to `opening.md` per
   `loop-of-loops-ledger-driven-sessions.md`. Then **P2** `scripts/ledger-backlog.ts` if time.
3. **Merge + verify the revalidate-path PR:** green + merged + deployed, then dev-login as admin and verify Tony
   Hua's card shows his (VERIFIED) 3rd-degree rank persisting across navigation — closes the 0451 deploy gap.
4. **AdminKanban P3** (the operator's "make it functional"): DB-back the board as a ledger projection (schema →
   PR). Bigger build — may be its own session.
5. **Brian Truelson FI-001:** `scripts/send-bbl-claim-emails.ts` (dry-run → live send).

### Inputs to read

- This file; `[[bbl-resend-key-and-dogfood-teardown]]`; `apps/web/scripts/send-bbl-claim-emails.ts` +
  `apps/web/server/web/lineage/mint-claim-magic-link.ts`; FI-001 in `POST_LAUNCH_SOT.md`;
  `[[admin-app-migration-revalidate-paths]]`.
