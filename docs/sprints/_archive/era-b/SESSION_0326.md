---
title: "SESSION 0326 — Authenticated avatar visual smoke + remaining public instructor-avatar surfaces"
slug: session-0326
type: session--implement
status: closed
created: 2026-06-01
updated: 2026-06-01
last_agent: claude-session-0326
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0325.md
  - docs/knowledge/wiki/index.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0326 — Authenticated avatar visual smoke + remaining public instructor-avatar surfaces

## Date

2026-06-01

## Operator

Brian + claude-session-0326

## Goal

Close the one honest gap SESSION_0325 left open: confirm the promoted `Passport.avatarUrl ?? User.image`
swap **visually** on a real authenticated session (the smoke that has been environment-blocked since
SESSION_0324), now that a Playwright MCP gives a real Chromium cookie jar. Then enumerate any remaining
public instructor/member-avatar surfaces still rendering raw `User.image` and adopt the same projection
where the surface is genuinely public (admin tools stay excluded, per SESSION_0325).

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0325.md`
- Carryover: SESSION_0325 wired `passport.avatarUrl ?? user.image` into the directory read models,
  lineage display cards, and the discipline black-belt rail — proven by a 3-case projection test and a
  6-route 200 HTTP smoke. Its single named gap was **authenticated/visual** confirmation (pixel-level
  swap), unverified locally because it needs an authed browser + a seeded promoted avatar. This session
  is that confirmation plus the staged instructor-surface enumeration.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `6dd58d5`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None for the smoke (read-only verification). For the instructor-surface slice: directory/member/lineage read-model projection layer (Prisma selects) — same shape as SESSION_0325. |
| Extension or replacement | Extension: reuse the existing privacy-aware read models; widen only `passport.avatarUrl` and resolve `?? user.image` at the projection, never a new query path or component. |
| Why justified | Avatar source preference is a Ronin domain behavior layered on Dirstarter's directory/profile read models; the visual smoke is pure verification. |
| Risk if bypassed | A component-level passport fetch would duplicate the privacy-aware read model and risk leaking data the DirectoryProfile visibility gate withholds. |

Live docs checked during planning: not applicable — no L1 integration surface (storage/payments/media pipeline) changes.

### Graphify check

- Graph status: current; stats at bow-in: 8972 nodes, 13808 edges, 1365 communities, 1542 files tracked.
- Queries used:
  - `autonomous-session auto run setup unattended session` (for the auto-run grill fork)
  - `seed dev user login credentials email password auth sign-in better-auth test account`
  - `instructor avatar school staff teacher coach profile card public user image display`
- Files selected from graph:
  - `docs/runbooks/dev-environment/autonomous-sessions.md` (auto-run rig)
  - `docs/runbooks/dev-environment/local-dev-auth-storage.md` (dev-login bypass route)
  - `apps/web/app/api/auth/dev-login/route.ts` (authed-session entry for Playwright)
  - `apps/web/components/web/schools/school-card.tsx` (instructor-surface candidate — no avatar)
  - `apps/web/app/(web)/disciplines/_components/black-belt-rail.tsx` (already projects the fallback)
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

3 forks resolved during the Petey grill (operator answered):

- **Autonomous auto-run** → *skip this session*. Leave the `auto-session*.sh` rig untouched; do the avatar
  polish interactively and close. (The rig exists and is wired: scripts, `notify.env`, allowlist in
  `.claude/settings.local.json`; not launched this session.)
- **Autonomous backlog** → *decide after this session*. Do not commit `petey-plan-0305` vs next-pointer steering now.
- **Instructor surfaces** → *apply where genuinely public*. Enumerate remaining `User.image` avatar surfaces and
  adopt `passport.avatarUrl ?? user.image` on any true public member-avatar surface; keep admin tools (schedule
  instructor list) excluded.

### Drift logged

- Dev-DB avatar data is empty: **0/112 `User.image`, 0/74 `Passport.avatarUrl`** — every avatar currently renders
  the initials fallback. The visual smoke therefore requires seeding *both* source fields (a promoted user with a
  passport avatar **and** a different `User.image`, plus a control user with only `User.image`) to demonstrate
  prefer-vs-fallback. Seed is fully reversible (all fields NULL today). Not a code drift — a fixture gap.

## Petey plan

### Goal

Visually confirm `passport.avatarUrl ?? user.image` on `/directory`, `/members/<slug>`,
`/lineage/<treeSlug>`, and `/disciplines/<slug>` via an authenticated Playwright session; then enumerate
and migrate any remaining genuinely-public instructor/member-avatar surfaces, keeping admin tools excluded.

### Tasks

#### SESSION_0326_TASK_01 — Authenticated avatar visual smoke (Playwright)

- **Agent:** Petey/Cody (drives Playwright MCP) → Desi (reads screenshots for verdict)
- **What:** Seed reversible demo avatars, log in via `/api/auth/dev-login`, screenshot the four surfaces, confirm
  prefer (GOLD passport) vs fallback (BLUE `user.image`), then revert the seed.
- **Steps:**
  1. Seed self-labeling data-URI SVG avatars (GOLD = passport, BLUE = `user.image`; native `<img>`, no CSP, no next/image):
     - Sensei Demo (`cmpdpnu7w0094wjds0hty30l1`): `Passport.avatarUrl`=GOLD + `User.image`=BLUE; bump bjj membership
       `cmpdpnu8t0097wjdsg1m27hqb` rank → Black Belt 5th Degree (`cmpdpntm70035wjdsju1xcgyu`, sortOrder 25) so the rail renders.
     - Student Alpha (`cmpdpnu9h0099wjdsux1zanj5`): `User.image`=BLUE only (directory control).
     - Carlos Gracie Jr (`cmpp0d12v0002j1dsi5ya7ji2`): INSERT Passport(avatarUrl=GOLD) + `User.image`=BLUE (lineage promoted).
     - Carlos Gracie Sr (`cmpp0d12i0001j1dso37ikfam`): `User.image`=BLUE only (lineage control).
  2. Playwright: navigate `http://localhost:3000/api/auth/dev-login` → authenticated session.
  3. Screenshot `/directory` (Sensei Demo GOLD, Student Alpha BLUE), `/members/sensei-demo` (GOLD),
     `/lineage/rigan-machado-bjj-lineage` (Carlos Jr GOLD, Carlos Sr BLUE), `/disciplines/bjj` (rail GOLD).
  4. Revert: restore Sensei Demo bjj rankId to Blue Belt, set all touched `User.image`/`Passport.avatarUrl` to NULL,
     DELETE the inserted Carlos Jr Passport row.
- **Done means:** Screenshots show GOLD on promoted users and BLUE on controls across all four surfaces; seed reverted; DB back to baseline (0 images).
- **Depends on:** nothing.

#### SESSION_0326_TASK_02 — Enumerate + migrate remaining public instructor/member-avatar surfaces

- **Agent:** Cody (enumerate + apply) + Doug (verify)
- **What:** Enumerate every `AvatarImage`/`User.image` consumer on public `(web)` surfaces; classify public-member-avatar
  (apply `passport.avatarUrl ?? user.image`) vs admin tool (exclude); apply the projection where genuinely public.
- **Steps:**
  1. Graphify + targeted `rg "AvatarImage"`/`\.image` across `apps/web/app/(web)` and `apps/web/components/web` to list consumers.
  2. Per surface: is it a public member/instructor face? (`SchoolCard` has no avatar — confirmed; check schedule, org pages, course instructor, dashboard rosters.)
  3. For each genuine public surface not already migrated, widen the user select to `passport.avatarUrl` and project `?? user.image` at the read model; add/extend a focused test if a read model changes.
  4. Record per-surface decision (migrate / exclude-with-reason) in the task log.
- **Done means:** Every remaining public instructor/member-avatar surface is either migrated (with a test) or explicitly excluded with rationale; typecheck + focused tests green.
- **Depends on:** nothing (independent of TASK_01; can interleave).

#### SESSION_0326_TASK_03 — Verification + full close

- **Agent:** Doug + Petey
- **What:** Run gates, full `closing.md` (incl. optional deep items), refresh Graphify, commit/push to main.
- **Steps:**
  1. `bun run typecheck`, focused `bun test`, changed-file Biome, `git diff --check`, `bun run wiki:lint`.
  2. HTTP route smoke for any changed read model; record evidence (incl. the visual screenshots from TASK_01).
  3. Full `docs/rituals/closing.md` incl. optional deep items (component inventory, ADR check, memory sweep);
     `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` before the final commit.
  4. Stage, commit (conventional), push to `main` after gates pass (single commit, FS-0025).
- **Done means:** Evidence recorded in SESSION_0326, graph refreshed, conventional commit pushed to `origin/main`.
- **Depends on:** SESSION_0326_TASK_01, SESSION_0326_TASK_02.

### Parallelism

TASK_01 (interactive Playwright in the live session) and TASK_02 (read-model enumeration) are disjoint and could
run concurrently, but the total is small and the Playwright smoke holds the browser session; per CLAUDE.md
("do single coherent changes inline") executed inline/sequentially. No worktrees.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0326_TASK_01 | Petey/Cody + Desi | Drives Playwright MCP; Desi reads the screenshots for the prefer/fallback verdict. |
| SESSION_0326_TASK_02 | Cody + Doug | Read-model projection change mirroring SESSION_0325; needs a focused test if a model changes. |
| SESSION_0326_TASK_03 | Doug + Petey | Gates, hostile close, docs inventory, Graphify refresh, git hygiene. |

### Open decisions

None at plan-lock (3 grill forks resolved above).

### Risks

- Disciplines black-belt rail is empty in dev data (no `rank.sortOrder >= 10` membership); demoing it requires a
  temporary, reverted rank bump on one membership.
- Lineage node figures (Carlos Jr/Sr) have no Passport rows; the promoted case requires an INSERT (reverted by DELETE).
- Seed must be reverted fully so the dev DB returns to its 0-image baseline; revert SQL recorded in the task log.

### Scope guard

- No schema changes; no new query path or component for the smoke.
- No change to DirectoryProfile visibility logic or per-field privacy flags.
- Schedule instructor list stays excluded (admin tool, exposes email — SESSION_0325 decision).
- No autonomous auto-run launch this session (grill decision).
- Seed data is dev-only and reverted before close.

### Dirstarter implementation template

- **Docs read first:** not applicable — read-model projection over existing Prisma selects; no L1 boundary changed.
- **Baseline pattern to extend:** privacy-aware directory/lineage read models + `Avatar`/`AvatarImage`/`AvatarFallback` composition.
- **Custom delta:** prefer Ronin `Passport.avatarUrl` over `User.image` at the projection layer (extends SESSION_0325 to any remaining public surface).
- **No-bypass proof:** avatar source resolved inside the existing privacy-aware read models; no component-level passport fetch, no new query path.

## Cody pre-flight

### Pre-flight: instructor-surface enumeration + migration (TASK_02)

#### 1. Existing component scan

- Graphify query used: `instructor avatar school staff teacher coach profile card public user image display`.
- Found: `SchoolCard` (no avatar field), `BlackBeltRail` (already projects the fallback), directory/lineage surfaces (migrated SESSION_0325). Full `AvatarImage` enumeration done in TASK_02 step 1.

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-docs-inventory.md`: not required — no L1 integration surface changes.
- Closest L1 pattern: privacy-aware DirectoryProfile read models + `Avatar` primitive composition.
- Primitive API spot-check: `AvatarImage` = `AvatarPrimitive.Image` (native `<img>`); accepts any URL incl. data URIs.

#### 3. Composition decision

- Extending existing read models/payloads only; no new component. Any migration mirrors the SESSION_0325 `?? user.image` projection.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0325`).
- ADR read: none required (extends accepted SESSION_0322/0324 Passport-media decision).
- Runbook consulted: `docs/runbooks/dev-environment/local-dev-auth-storage.md` (dev-login), `docs/runbooks/dev-environment/graphify-repo-memory.md`.

#### 5. Dev environment confirmed

- Dev server: running on `http://localhost:3000` (verified 200); Postgres.app on :5432 (verified open).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Auth: `GET /api/auth/dev-login` (guarded `isDev && DEV_LOGIN_USER_ID=cmp1gwfcq0000owdskqo2vlqp`) → signed session; Playwright = real Chromium cookie jar.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0024 (cwd/remote git guard), FS-0025 (single-commit close).
- Mitigation acknowledged: FS-0024 guard ran at bow-in (cwd = ronin-dojo-app, remote = ronin-dojo-baseline); single commit at close.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0326_TASK_01 | landed | Authed Playwright smoke proved GOLD passport vs BLUE user.image across `/directory`, `/members/sensei-demo`, `/lineage/rigan-machado-bjj-lineage`, `/disciplines/bjj` rail; reversible seed applied + fully reverted (DB back to 0 images). |
| SESSION_0326_TASK_02 | landed | Migrated course-instructors (read-model projection + test) and promotion-event promotee (payload widen + JSX); confirmed exclusions: schedule-instructor-list (mgmt widget), Author/blog, user-menu, admin, lineage awarder. |
| SESSION_0326_TASK_03 | landed | typecheck clean, 11/11 course test (incl. 2 new prefer/fallback), promotion-events queries 3/3, changed-file Biome clean, diff clean, wiki-lint 0 err, 5-route 200 HTTP smoke, Graphify refresh, single commit/push. |

## What landed

- **Authenticated visual smoke (the SESSION_0324/0325 gap) is closed.** Using the Playwright MCP (real Chromium cookie jar, unlike VS Code Simple Browser), logged in via `/api/auth/dev-login` and confirmed `passport.avatarUrl ?? user.image` on every target surface with self-labeling data-URI avatars (GOLD = passport, BLUE = `user.image`):
  - `/directory`: Sensei Demo → GOLD (passport wins); Student Alpha → BLUE (fallback); others → initials.
  - `/members/sensei-demo`: GOLD (passport wins).
  - `/lineage/rigan-machado-bjj-lineage` honor strip: Carlos Gracie Jr → GOLD (passport wins); Carlos Gracie Sr → BLUE (fallback).
  - `/disciplines/bjj` "Top Ranked" black-belt rail: Sensei Demo → GOLD (after a temporary, reverted rank bump to surface the rail).
- The seed (4 users' `User.image`/`Passport.avatarUrl` + one membership rank) was **fully reverted** — DB is back to its 0-image baseline.
- **Two genuinely-public instructor/member-avatar surfaces migrated** to prefer the promoted Passport avatar:
  - **Course instructors** (`/courses/[slug]` Instructors section): resolved `passport.avatarUrl ?? user.image` at the `findCourseInstructors` read model (into `user.image`) — **zero page change** (directory pattern). Proven by a new prefer/fallback integration test.
  - **Promotion-event promotee** (`/events/[slug]` award cards): widened the shared person payload with `passport.avatarUrl` and preferred it in the detail-page JSX (lineage pattern). Awarder intentionally stays name-only.
- **Per-surface exclusions confirmed** (documented in Decisions resolved): schedule-instructor-list (management widget with assign/remove + email — no public face), `Author` byline (blog/posts/testimonials — content authorship, not member directory), `user-menu` (self/session), admin bracket-viewer + user-form, and lineage awarder avatars (incidental metadata, SESSION_0325).

## Decisions resolved

- **Grill forks:** autonomous auto-run skipped this session (rig left untouched); autonomous backlog choice deferred; instructor surfaces migrated where genuinely public.
- **Course instructors and promotion-event promotee are genuine public member/instructor avatars → migrated.** Course used a read-model projection (testable, no page change); events used payload-widen + JSX preference (single renderer).
- **Schedule instructor list stays excluded.** Re-inspected this session: it is a management widget (Make-primary / Remove / Assign actions + email exposure) rendered behind the org-management surface — the "public face" condition in the goal is not met. SESSION_0325 exclusion holds.
- **`Author`, `user-menu`, admin avatars, and lineage awarder avatars excluded** — different domains (content authorship / self-view / admin tools / incidental metadata), not public member-directory avatars.
- **Found + flagged:** `DEV_LOGIN_USER_ID` in `apps/web/.env` was stale (pointed at `cmp1gwfcq0000owdskqo2vlqp`, which no longer exists → dev-login 404). Repointed to Sensei Demo (`cmpdpnu7w0094wjds0hty30l1`) so the visual smoke could run. `.env` is gitignored (not committed); left repointed to a valid user — see Open decisions / blockers.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/courses/queries.ts` | `findCourseInstructors` selects `passport.avatarUrl` and `.map`-projects `passport.avatarUrl ?? user.image` into `user.image` (page unchanged). |
| `apps/web/server/web/courses/queries.integration.test.ts` | Inline replica updated to match; fixtures add a promoted-passport instructor + an image-only instructor; 2 new tests (prefer / fallback). |
| `apps/web/server/web/promotion-events/payloads.ts` | `promotionEventPersonPayload` adds `passport: { select: { avatarUrl: true } }` (promotee prefers it; awarder name-only). |
| `apps/web/app/(web)/events/[slug]/page.tsx` | Promotee avatar prefers `award.user.passport?.avatarUrl ?? award.user.image`. |
| `docs/sprints/SESSION_0326.md` | Bow-in, plan, pre-flight, ledger, smoke evidence, and close. |
| `docs/knowledge/wiki/custom-component-inventory.md` | §3i extended: course-instructor + promotion-event-promotee surfaces now consume the Passport avatar. |
| `docs/knowledge/wiki/index.md` | SESSION_0326 row; `last_agent` bump. |
| `apps/web/.env` (gitignored, not committed) | `DEV_LOGIN_USER_ID` repointed from stale id to Sensei Demo so dev-login works. |

## Verification

| Command / smoke | Result |
| --- | --- |
| Authed Playwright visual smoke (4 surfaces) | Pass — GOLD passport on promoted users, BLUE `user.image` on controls, initials otherwise (screenshots reviewed in-session; transient, not committed). |
| `bun run typecheck` | Pass — types generated, no `tsc` errors. |
| `bun test server/web/courses/queries.integration.test.ts` | Pass — 11/11 (incl. 2 new: prefer Passport avatar, fall back to `User.image`). |
| `bun test server/web/promotion-events/queries.test.ts` | Pass — 3/3 (exercises widened payload). |
| `bun test server/web/promotion-events/` (whole dir) | 3 pass / 1 fail — the fail (`editor-actions.test.ts` `revalidatePath` SyntaxError) reproduces on clean `main` with my change stashed → **pre-existing test-env fragility, not introduced this session**. |
| `bun biome check <4 changed files>` | Pass after one auto-format (events `src` expression). |
| `git diff --check` | Pass. |
| `bun run wiki:lint` | 0 errors; 3 pre-existing stale-frontmatter warnings (`architecture/data-model.md`, `aliases-and-canonical-ids.md`, `repo-truth-index.md`) — unchanged by this session. |
| HTTP route smoke (dev server :3000) | All 200: `/`, `/directory`, `/courses/bjj-safety-school`, `/events/coral-belt-ceremony-csw-world-conference-2026`, `/disciplines/bjj`. |

## Open decisions / blockers

- **`DEV_LOGIN_USER_ID` was stale** in `apps/web/.env` (404'd dev-login). Repointed to Sensei Demo (`cmpdpnu7w0094wjds0hty30l1`) — a valid user — so the smoke could run. `.env` is gitignored, so this is a **local-only** change left in place (a broken value helps no one); revert or repoint freely.
- **Dev DB has no avatar imagery** (0 `User.image`, 0 `Passport.avatarUrl`). Any future visual avatar check needs a seed; the reversible seed+revert SQL used this session is recorded in `SESSION_0326_TASK_01`.
- **Pre-existing test fragility:** `promotion-events/editor-actions.test.ts` fails under bun when run alongside `queries.test.ts` (`revalidatePath` not found in `next/cache`). Unrelated to this session; worth a dedicated fix slice.

## Next session

### Goal

Avatar-projection consumption is now complete across all genuinely-public surfaces (directory, member detail, lineage, black-belt rail, course instructors, promotion-event promotee). Next clean slice is operator's choice: either (a) resume the `petey-plan-0305` Lineage epic (Phases 2–4: tree animations, belt-rail integration, trophy.so gamification), or (b) fix the pre-existing `next/cache` `revalidatePath` test-env fragility in `promotion-events/editor-actions.test.ts`.

### First task

If continuing the avatar lane is desired, no work remains — pick (a) or (b) above. For (a): bow in against `petey-plan-0305.md` Phase 2 and stage the first animation slice. For (b): reproduce the `revalidatePath` SyntaxError, then align the bun test runner's `next/cache` resolution (mock or import shim) so the promotion-events suite runs green as a directory.

## Review log

### SESSION_0326_REVIEW_01 — Avatar visual smoke + course/event instructor surfaces

- **Reviewed tasks:** SESSION_0326_TASK_01, SESSION_0326_TASK_02, SESSION_0326_TASK_03
- **Dirstarter docs check:** not applicable — no L1 integration boundary changed; read-model projection + payload widening over existing Prisma selects.
- **Verdict:** Strong. The long-blocked authenticated visual smoke is finally done with irrefutable evidence (self-labeling GOLD/BLUE data-URI avatars across all four surfaces, prefer + fallback both shown), and the seed was fully reverted. The two new migrations follow the exact SESSION_0325 patterns (read-model projection for courses with a focused prefer/fallback test; payload-widen + JSX for the events promotee), and the enumeration's exclusions are each justified by inspection rather than assumption. The one honest caveat is that the course/event surfaces were proven by integration test + 200 HTTP render rather than a second pixel-level seed (the read-model projection is deterministically unit-tested, so this is low-risk).
- **Score:** 9.4/10
- **Follow-up:** Pre-existing `revalidatePath` test fragility (named, not introduced); `DEV_LOGIN_USER_ID` stale-env flagged for the operator.

## Hostile close review

- **Doug:** pass — typecheck clean; 11/11 course test incl. 2 new prefer/fallback; promotion-events queries 3/3; the lone dir-run failure reproduces on clean `main` (pre-existing, proven by stash-and-rerun); changed-file Biome clean; diff clean; wiki-lint 0 errors; 5-route 200 smoke. Avatar source is only added where a public profile is already shown, and only a deliberately-public field (`Passport.avatarUrl`) is selected.
- **Desi:** pass — visual smoke confirms the swap renders correctly across directory/member/lineage/disciplines with clear prefer-vs-fallback; course-instructor + event-promotee migrations keep the established `Avatar`/`AvatarImage`/`AvatarFallback` composition; no new component or primitive.
- **Kaizen aggregate:** 9.4/10 — closes a multi-session visual-verification gap with strong evidence, extends consumption to two more public surfaces with tests/typecheck, and is privacy-preserving by construction.

### Findings (severity ≥ medium)

None.

## ADR / ubiquitous-language check

- ADR update: **not required.** This extends the accepted SESSION_0322/0324 Passport-media decision (`Passport.avatarUrl` is the public avatar source) onto two more read surfaces. No new architectural policy, query path, or component.
- Ubiquitous language update: **not required.** No new domain terms; existing terms used (Passport, DirectoryProfile, User, Membership, Lineage, Course, PromotionEvent).

## Reflections

- The whole reason this verification was blocked since SESSION_0324 was the VS Code Simple Browser cookie-jar isolation. The Playwright MCP drives a real Chromium with its own jar, so `/api/auth/dev-login` "just worked" — the blocker was never the auth flow, only the browser. Worth remembering: for any authed visual check, reach for Playwright, not the embedded browser.
- The dev DB having *zero* avatar imagery turned a "log in and look" task into a small fixture-design problem. Self-labeling data-URI SVG avatars (GOLD "PASSPORT" vs BLUE "USER IMG") made the screenshots self-evident — no ambiguity about which source rendered — and needed no MinIO/S3 because `AvatarImage` is a native `<img>` (no CSP, no next/image remotePatterns). That trick is reusable for any future avatar/source-precedence smoke.
- The enumeration paid off exactly as SESSION_0325 predicted: most `AvatarImage` consumers were either already migrated, awarder/admin/self surfaces, or — in the case of `SchoolCard` — not avatar surfaces at all. The two real finds (course instructors, event promotee) are precisely the "public member/instructor face" the goal was pointing at, and the schedule-instructor-list re-inspection confirmed the SESSION_0325 exclusion rather than overturning it.
- A stale `DEV_LOGIN_USER_ID` quietly 404'd the documented dev-login path. The runbook's hardcoded example id had drifted from the reseeded DB. Cheap to fix, but a reminder that "documented" dev conveniences rot against reseeds.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Code files carry no frontmatter. Wiki docs updated: `custom-component-inventory.md` §3i extended + `last_agent: claude-session-0326`; `index.md` SESSION_0326 row + `last_agent` bump. SESSION_0326 `status: closed` set in YAML + body in one pass (FS-0015). |
| Backlinks/index sweep | `custom-component-inventory.md` and `index.md` already pair with the session series; SESSION_0326 `pairs_with` SESSION_0325 + wiki index. No new wiki pages/runbooks. |
| Wiki lint | `bun run wiki:lint` — 0 errors, 3 pre-existing stale-frontmatter warnings (unrelated files), unchanged by this session. |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | `SESSION_0326_REVIEW_01` recorded; Doug + Desi pass; no findings ≥ medium. |
| Review & Recommend | Next session goal + first task written (resume `petey-plan-0305` or fix the `revalidatePath` test fragility). |
| Wiring ledger sweep | No new wiring debt surfaced or resolved (the `revalidatePath` test fragility is a pre-existing test-env issue, not feature plumbing); no ledger change. |
| ADR/glossary check | Recorded: no ADR or glossary update needed. |
| Memory sweep | Updated `passport-avatar-consumption-surfaces.md`: course-instructor + event-promotee now consume the projection; schedule-instructor-list confirmed-excluded; visual smoke done; data-URI avatar smoke trick + `DEV_LOGIN_USER_ID` stale-env gotcha noted. |
| Next session unblock check | Unblocked — next session is operator's choice (Lineage epic or test-fragility fix), both self-contained. |
| Git hygiene | Branch `main`; no session worktrees; FS-0024 cwd/remote guard ran at bow-in. Single commit + push — hash reported at bow-out / see `git log` (no second evidence commit, FS-0025). |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` ran before the close commit; stats recorded in the bow-out response. |
