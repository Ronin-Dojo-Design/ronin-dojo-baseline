---
title: "SESSION 0334 — Admin onSelect→onClick sweep + lineage security tests + ntfy automation"
slug: session-0334
type: session--implement
status: closed
created: 2026-06-02
updated: 2026-06-02
last_agent: claude-session-0334
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0333.md
  - docs/petey-plan-0305.md
  - docs/security/security-test-plan.md
  - docs/security/privacy-data-classification.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/runbooks/dev-environment/ntfy-pushover-telegram.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0334 — Admin onSelect→onClick sweep + lineage security tests + ntfy automation

## Date

2026-06-02

## Operator

Brian + claude-session-0334 (Petey orchestration)

## Goal

Land the systemic admin `DropdownMenuItem onSelect`→`onClick` repair (WL-P1-3) with a
regression guard, add the two queued lineage privacy tests (WL-P1-4: public search can't
surface non-PUBLIC members; rank-progression leaks no PII), resolve the `awardedAt` public
exposure product call, delete the merged stale `auto/session-0307..0310` branches, and wire a
`docker system df` → ntfy cache monitor (+ fix ntfy iOS delivery). Pick up the most
self-contained `petey-plan-0305` slice (Phase 3e SVG connectors) only if budget allows.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0333.md` (autonomous lineage run + repair + merge).
- Carryover: SESSION_0333 fixed the lineage instance of the dead Base UI `onSelect` handler and
  ledgered the systemic admin sweep (WL-P1-3) + the two privacy tests (WL-P1-4) as follow-ups.
  This session executes those plus housekeeping.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `bf1486f`

### Graphify check

- Graph status: current (rebuilt end of SESSION_0333). Stats at bow-in: 9020 nodes, 13981 edges,
  1371 communities, 1546 files tracked.
- Files opened were already named in the SESSION_0333 plan + wiring-ledger; Graphify confirmed no
  additional affected files beyond the survey below.

### Grill outcome (Petey discovery before lock)

- **Base UI semantics confirmed at source.** `node_modules/@base-ui/react/menu/item/MenuItem.d.ts`
  documents `onClick` and has **no** `onSelect`; `useMenuItem.js` wires activation through
  `useButton` (synthesizes a click on Enter/Space). So `onClick` alone covers pointer **and**
  keyboard — `onSelect` on a `DropdownMenuItem` is a dead DOM text-selection event. Fix shape:
  `onSelect`→`onClick` (drop the dead `onSelect`).
- **Sweep is broader than the plan listed.** `app/admin/users/_components/user-actions.tsx`
  (Unban/Ban/Revoke Sessions, 3 items) has the same dead pattern and was **not** in WL-P1-3 or the
  next-session plan. Added to the sweep → 6 files / 11 action items.
- **Delete items are not affected.** `lead-actions.tsx:79`'s `onSelect={e=>e.preventDefault()}` is a
  `DeleteDialog` trigger (opens via `DialogTrigger render={child}`, not via the menu handler) — it
  works today; the dead `onSelect` is just removable cruft. The guard must not false-positive on it.
- **Guard scope.** A blanket "no `onSelect=`" guard is wrong — cmdk `CommandItem`, Base UI `Calendar`,
  and lineage component-prop `onSelect` are all legitimate. Guard must be scoped to `DropdownMenuItem`.
- **PII vector for the rank-progression test.** `buildAchievementsUnlocked` emits `awarderName` +
  `organizationName`; the test should assert the public path exposes only rank taxonomy + `awardedAt`
  and never a non-PUBLIC member's identity.
- **Stale branches verified merged.** `auto/session-0307..0310` are all ancestors of `origin/main` →
  safe to delete.

### Drift logged

- D-016 follow-up (Base UI `onSelect`→`onClick`): the migration scanned Radix *imports*, not
  `Menu.Item` *semantics*, so it missed `user-actions.tsx` too. Closing the gap here + adding a guard.

## Petey plan

### Goal

Repair the systemic dead-handler admin pattern with a guard, add the two lineage privacy tests,
resolve the `awardedAt` product call, clear merged branches, and stand up the ntfy cache monitor.

### Tasks

#### SESSION_0334_TASK_01 — Admin `onSelect`→`onClick` sweep + regression guard

- **Agent:** Cody (build) → Doug/CI (verify)
- **What:** Convert every action-firing `DropdownMenuItem onSelect={…}` to `onClick={…}` and add a
  guard that fails CI if a `DropdownMenuItem` reintroduces `onSelect`.
- **Files:** `components/admin/tournaments/registration-actions.tsx` (Approve/Waitlist/Cancel);
  `app/admin/leads/_components/lead-actions.tsx` (Nurture/Lost; drop dead `preventDefault` on Delete);
  `app/admin/tools/_components/tool-actions.tsx`, `tags/_components/tag-actions.tsx`,
  `categories/_components/category-actions.tsx` (Duplicate); `app/admin/users/_components/user-actions.tsx`
  (Unban/Ban/Revoke Sessions — newly found). Also normalize the lineage reference files to onClick-only.
- **Done means:** typecheck + changed-file Biome pass; guard script present + wired into CI/test; guard
  goes RED on a reintroduced `onSelect`, GREEN after the sweep.
- **Depends on:** nothing.

#### SESSION_0334_TASK_02 — Lineage privacy test: public search can't surface non-PUBLIC members

- **Agent:** Cody
- **What:** Unit test over `findMatches` (search bar) proving a non-PUBLIC member can't be surfaced —
  the search operates only over already brand-scoped, visibility-filtered `CanvasMember[]`.
- **Done means:** `bun test` green; test fails if the search input set includes a non-PUBLIC node.
- **Depends on:** nothing.

#### SESSION_0334_TASK_03 — Lineage privacy test: rank-progression exposes no PII

- **Agent:** Cody
- **What:** Unit test over `buildBeltProgressions` / `buildAchievementsUnlocked` asserting the public
  read model emits only rank taxonomy + `awardedAt` (+ allowed awarder/org names per the product call),
  never account PII (email/role/notes) nor a non-PUBLIC identity.
- **Done means:** `bun test` green; mirrors `queries.visibility.test.ts` structure.
- **Depends on:** TASK_04 (the `awardedAt` decision sets the assertion).

#### SESSION_0334_TASK_04 — Product decision: public exposure of `awardedAt` promotion dates

- **Agent:** Petey + operator
- **What:** Confirm whether promotion dates stay public-by-default (a per-member `showPromotionDatePublic`
  toggle already exists) or get restricted.
- **Done means:** decision recorded in `Decisions resolved`; privacy-data-classification updated if it changes.
- **Depends on:** operator input.

#### SESSION_0334_TASK_05 — Delete merged stale remote branches

- **Agent:** Petey (gh)
- **What:** `git push origin --delete auto/session-0307 0308 0309 0310` (all verified merged into main).
- **Done means:** branches gone from `origin`; verified.
- **Depends on:** nothing.

#### SESSION_0334_TASK_06 — ntfy cache monitor + iOS delivery fix + candidate automations

- **Agent:** Cody (script) + Petey (recommendation)
- **What:** Local launchd job running `docker system df` on an interval; ntfy push (high priority) when
  reclaimable/total cache exceeds threshold. No `launchctl bootout` self-unload (SESSION_0333 bug).
  Diagnose ntfy iOS no-push (self-hosted `upstream-base-url` vs. priority/permission) and recommend
  the highest-value additional automations.
- **Done means:** script + plist committed; dry-run prints a correct threshold decision; ntfy delivery
  path chosen.
- **Depends on:** operator input (topic/endpoint, threshold, platform).

#### SESSION_0334_TASK_07 — (conditional) petey-plan-0305 Phase 3e — SVG 90° connectors

- **Agent:** Cody
- **What:** Replace `div` connectors with SVG `M/L` 90° bend paths (board layout). Only if budget remains
  after TASK_01–06; otherwise deferred to a dedicated next session with 3f + Phase 4 slices.
- **Done means:** connectors render as SVG; reduced-motion respected; typecheck/Biome pass.
- **Depends on:** TASK_01–06; scope confirmation.

### Parallelism

- TASK_01, TASK_02, TASK_05, TASK_06 touch disjoint file sets → parallelizable.
- TASK_03 waits on TASK_04 (the assertion depends on the `awardedAt` decision).
- TASK_07 is last and conditional.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0334_TASK_01 | Cody → CI | Mechanical multi-file edit + guard; CI is the authoritative verifier. |
| SESSION_0334_TASK_02 | Cody | Pure unit test over `findMatches`. |
| SESSION_0334_TASK_03 | Cody | Pure unit test over rank-progression. |
| SESSION_0334_TASK_04 | Petey + operator | Product call. |
| SESSION_0334_TASK_05 | Petey | git hygiene. |
| SESSION_0334_TASK_06 | Cody + Petey | Local automation + platform recommendation. |
| SESSION_0334_TASK_07 | Cody | Conditional lineage polish slice. |

### Open decisions

- **`awardedAt` public exposure** (TASK_04) — operator call.
- **Session scope** — land TASK_01–06 solidly and defer the bulk of `petey-plan-0305`, optionally
  picking up Phase 3e (TASK_07).
- **ntfy** — which automations to wire + delivery platform / iOS fix.

### Risks

- Removing `onSelect={e=>e.preventDefault()}` from the Delete trigger: verified safe (dialog opens via
  `DialogTrigger`), but admin pages are DB-dependent so the real verifier is typecheck + the guard, not
  a local dev run (Postgres.app re-gate, per SESSION_0333).

### Scope guard

- Do NOT attempt the full `petey-plan-0305` remainder (3f PDF export, Phase 4 Trophy slices 1/3,
  leaderboard cross-user read model) this session — that is a dedicated next session.
- Do NOT change Prisma schema (no `apps/web/prisma/` edits) — keeps the schema-review gate untripped.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0334_TASK_01 | landed | Swept 11 dead `onSelect` handlers across 6 admin/lineage files → `onClick`; added a `bun test` guard (`dropdown-menu.guard.test.ts`) anchored to `DropdownMenuItem`. WL-P1-3 resolved. |
| SESSION_0334_TASK_02 | landed | `search.privacy.test.ts` — wires the real materializer to the extracted pure matcher; proves PRIVATE/RESTRICTED members are unsearchable. Extracted `lib/lineage/search.ts`. |
| SESSION_0334_TASK_03 | landed | `rank-progression.privacy.test.ts` — adversarial-PII allowlist proof; surfaced + fixed a whole-object `discipline` passthrough in `buildBeltProgressions`. WL-P1-4 resolved. |
| SESSION_0334_TASK_04 | landed | Product call: `awardedAt` stays **public-by-default** with the existing per-member `showPromotionDatePublic` toggle. No schema/privacy-doc change. |
| SESSION_0334_TASK_05 | landed | `auto/session-0307..0310` were already deleted upstream; `git fetch --prune` cleared stale local refs. |
| SESSION_0334_TASK_06 | landed | ntfy.sh automation lane (background Cody): shared sender + Docker-cache + disk-pressure launchd monitors + auto-session/CI notify + comparison runbook. Workflow `if:` hardened. |
| SESSION_0334_TASK_07 | deferred | Phase 3e SVG connectors — scope call: deferred to the dedicated `petey-plan-0305` continuation session. |

## What landed

- **Admin `onSelect`→`onClick` sweep (WL-P1-3 resolved).** Converted every action-firing `DropdownMenuItem onSelect` to `onClick` across `registration-actions` (Approve/Waitlist/Cancel), `lead-actions` (Nurture/Lost), `tool/tag/category-actions` (Duplicate), and **`user-actions` (Unban/Ban/Revoke Sessions — found beyond the WL-P1-3 list)**. Removed the dead `onSelect={e=>e.preventDefault()}` from the lead Delete trigger (opens via `DialogTrigger`). Normalized the 3 lineage reference items to `onClick`-only. Added a `bun test` regression guard scoped to `DropdownMenuItem` (robust to multiline tags + arrow `=>`).
- **Two lineage privacy tests (WL-P1-4 resolved).** Search test ties the real `materializeLineageTreeResult` to the extracted pure matcher, proving non-PUBLIC members never reach search. Rank-progression test is an adversarial allowlist proof; it caught a real defense-in-depth gap (whole-`discipline`-object passthrough) now hardened to a field-pick.
- **Product decision:** `awardedAt` stays public-by-default with the per-member toggle.
- **Housekeeping:** stale `auto/session-0307..0310` pruned; ntfy.sh automation lane built (3 monitors + CI/auto-session notify + comparison runbook) with no committed secrets.

## Decisions resolved

- **`awardedAt` exposure:** public-by-default, opt-out via `showPromotionDatePublic`. Privacy-data-classification unchanged (the toggle already encodes consent).
- **Session scope:** land sweep + tests + housekeeping; defer all `petey-plan-0305` slices (incl. Phase 3e) to a dedicated continuation.
- **Sweep semantics:** `onClick`-only (drop dead `onSelect`) — confirmed at Base UI source that `Menu.Item` activates on `onClick` for pointer **and** keyboard; `onSelect` is a dead DOM text-selection event.
- **ntfy:** ntfy.sh public + high-priority headers this session; Pushover/Telegram captured as fallbacks in the new runbook. iOS no-push is an app-permission/priority issue on public ntfy.sh.
- **Guard placement:** a `bun test` (already a CI gate), not a new shell/lint step.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/admin/tournaments/registration-actions.tsx` | Approve/Waitlist/Cancel `onSelect`→`onClick`. |
| `apps/web/app/admin/leads/_components/lead-actions.tsx` | Nurture/Lost `onSelect`→`onClick`; dropped dead `preventDefault` on Delete trigger. |
| `apps/web/app/admin/tools/_components/tool-actions.tsx` | Duplicate `onSelect`→`onClick`. |
| `apps/web/app/admin/tags/_components/tag-actions.tsx` | Duplicate `onSelect`→`onClick`. |
| `apps/web/app/admin/categories/_components/category-actions.tsx` | Duplicate `onSelect`→`onClick`. |
| `apps/web/app/admin/users/_components/user-actions.tsx` | Unban/Ban/Revoke Sessions `onSelect`→`onClick` (beyond original plan). |
| `apps/web/components/web/lineage/lineage-member-actions-menu.tsx` | Dropped redundant `onSelect`; corrected the keyboard comment. |
| `apps/web/components/web/lineage/lineage-profile-drawer.tsx` | Dropped redundant `onSelect` on Change-promoter item. |
| `apps/web/components/web/lineage/lineage-search-bar.tsx` | Consume extracted `findLineageMatches`/`MIN_QUERY_LENGTH`. |
| `apps/web/lib/lineage/search.ts` | **New** — pure lineage search matcher (extracted for testability). |
| `apps/web/lib/lineage/rank-progression.ts` | Harden `buildBeltProgressions` discipline to a field-pick (strict projection). |
| `apps/web/components/common/dropdown-menu.guard.test.ts` | **New** — guard: no `onSelect` on `DropdownMenuItem`. |
| `apps/web/lib/lineage/search.privacy.test.ts` | **New** — public search can't surface non-PUBLIC members. |
| `apps/web/lib/lineage/rank-progression.privacy.test.ts` | **New** — adversarial-PII allowlist proof. |
| `scripts/notify/ntfy-send.sh`, `scripts/notify/ronin-alerts.env.example` | **New** — shared ntfy sender + untracked-config example. |
| `scripts/monitor/docker-cache-monitor.sh`, `scripts/monitor/disk-pressure-monitor.sh` | **New** — launchd-driven threshold monitors. |
| `scripts/auto-session.sh` | ERR-trap + completion ntfy (no self-bootout). |
| `.github/workflows/playwright.yml` | Notify-on-failure ntfy step (secret-gated; `if:` hardened). |
| `docs/runbooks/dev-environment/ntfy-pushover-telegram.md` | **New** — ntfy/Pushover/Telegram comparison + setup + dataflows. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun run typecheck` | Pass (after switching the guard to node `fs` from the untyped `Bun.file`). |
| `bun biome check` (14 changed files) | Pass (2 files auto-formatted, re-checked clean). |
| `bun test` (new files) | Pass — guard (2) + search.privacy (5) + rank-progression.privacy (3) + visibility (9). |
| `bun test` (full suite) | 201 pass / 80 fail — **all 80 are DB-connection failures** (`db.*.* is undefined`, no local Postgres; CI runs them with a real DB). None in touched files. |
| ntfy scripts `bash -n` + `--dry-run` | Pass — disk monitor computes free=51GB; docker monitor no-ops gracefully (daemon down); sender no-ops without a topic. |
| Stale branch prune | `git fetch --prune` removed `auto/session-0307..0310` (already deleted upstream). |

## Open decisions / blockers

- **Operator follow-up (ntfy, not blocking):** set `NTFY_TOPIC` in `~/.config/ronin-alerts.env` (`chmod 600`), `gh secret set NTFY_TOPIC` for CI, subscribe the iPhone to the topic + enable iOS notification permission, then `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.ronin.{docker-cache,disk-pressure}-monitor.plist`. Scripts no-op safely until the topic is set.

## ADR / ubiquitous-language check

- ADR update **not required.** The sweep is a wiring fix; the search extraction is a pure refactor; the rank-progression change is a defense-in-depth tightening of an existing read model (ADR 0016 untouched — `RankAward` still canonical). The ntfy lane is ops tooling, no architecture decision.
- Ubiquitous language **not required** — no new domain terms.

## Reflections

- **The plan under-counted the sweep.** WL-P1-3 listed 5 files; `user-actions.tsx` had the identical dead pattern and wasn't on it. The lesson is the same one that created D-016's residual: enumerate by *semantic pattern*, not by a hand-curated file list — which is exactly why this session shipped a guard rather than just a fix.
- **A privacy test found a real (latent) leak.** The adversarial allowlist test wasn't theater: `buildBeltProgressions` passed the whole `discipline` object through, so enriched input would have leaked. The payload allowlist protected production, but "strict allowlist projection" is now true at the function boundary too — defense in depth the test earned.
- **`onClick`-only beats keep-both.** SESSION_0333 kept `onClick` + `onSelect` "for keyboard," but Base UI `useButton` synthesizes a click on Enter/Space, so `onClick` already covers keyboard. Keeping the dead `onSelect` would have forced a messier guard. Reading the primitive's source settled it.
- **Background subagent for the disjoint lane paid off.** The ntfy automation (scripts + runbook) needed `auto-session.sh`/CI context I hadn't loaded; running it cold in parallel while I did the app-code lanes inline was the right split. The one defect (a fragile workflow `if: secrets.*`) was caught on review.

## Hostile close review

### SESSION_0334 — admin sweep + lineage privacy tests + ntfy automation

- **Giddy:** Pass. The sweep is enforced by a committed guard (not just edits); the privacy claims are asserted by tests wired to the *real* materializer/read-model, not mocks of themselves; the one source change the tests forced (discipline field-pick) is a tightening, not a behavior change for valid payloads.
- **Doug:** Pass. typecheck + changed-file Biome + the new tests are green; the 80 full-suite failures are characterized (DB-less env) and CI is the authoritative DB verifier. No schema touched (gate untripped). No committed secrets (verified `.example` placeholder + secret-referenced CI step).
- **Desi:** Pass. The admin Approve/Waitlist/Cancel, Nurture/Lost, Duplicate, and Ban/Unban/Revoke menu items now actually fire — previously silent no-ops on real admin surfaces.
- **Kaizen aggregate:** 9/10 — clean, guarded, test-earned hardening; −1 because the DB-dependent admin menus can only be proven by CI, not a local click-through this session.

### Findings (severity ≥ medium)

#### SESSION_0334_FINDING_01 — `buildBeltProgressions` discipline passthrough (resolved)

- **Severity:** medium
- **Task:** SESSION_0334_TASK_03
- **Evidence:** `apps/web/lib/lineage/rank-progression.ts` (pre-fix `discipline: system.discipline ?? null`)
- **Impact:** Whole-object passthrough would leak any non-allowlisted field present on `discipline` (not exploitable in prod — payload allowlist gates it).
- **Required follow-up:** none — hardened to a field-pick this session; covered by `rank-progression.privacy.test.ts`.
- **Status:** addressed

## Next session

### Goal

Continue `petey-plan-0305` remaining slices: Phase 3e (SVG 90° connectors), Phase 3f remainder (PDF export toolbar), then Phase 4 Trophy slice 1 (registration/onboarding) + slice 3 (tree overlay) + the deferred **leaderboard** (cross-user read model + brand-scope review).

### Inputs to read

- `docs/petey-plan-0305.md` (Phase 3e/3f + Phase 4 slices), `docs/sprints/SESSION_0334.md`
- `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (connector rendering), `lib/lineage/canvas-model.ts`
- `docs/security/security-test-plan.md` + `brand-scope-hardening-plan.md` (leaderboard cross-user read model)

### First task

Phase 3e — replace the `div` connectors with SVG `M/L` 90° bend paths in the board layout (most self-contained, reduced-motion-respecting, CI-verifiable).

## Full close evidence

| Step | Proof |
| --- | --- |
| SESSION-file gate | Task log contains SESSION_0334_TASK_01–07. |
| JETTY/frontmatter sweep | `SESSION_0334.md` (`last_agent: claude-session-0334`, `type: session--implement`, `status: closed`); new runbook frontmatter verified; wiki index + custom-component-inventory + wiring-ledger + drift-register + runbooks hub updated in-place. |
| Backlinks/index sweep | Wiki index lists SESSION_0334; this file `pairs_with` SESSION_0333 + petey-plan-0305 + 2 security docs + wiring-ledger + the new runbook. Runbook backlinks wiki index + runbooks hub. |
| Wiki lint | `bun run wiki:lint` — result recorded in the bow-out chat (pre-existing warnings noted, no new errors introduced). |
| Kaizen reflection | Present in `## Reflections`. |
| Hostile close review | Present; Giddy/Doug/Desi pass; one resolved finding (FINDING_01, discipline passthrough). |
| Review & Recommend | Next-session goal + inputs + first task written (Phase 3e). |
| ADR / ubiquitous-language | No ADR/glossary change needed (recorded above). |
| Memory sweep | Updated docker-cache memory (monitor now wired); added ntfy-automation-wiring memory. |
| Next session unblock | Unblocked — Phase 3e is self-contained + CI-verifiable. ntfy operator steps are optional follow-ups, not blockers. |
| Git hygiene | FS-0024 guard passed; on `main`; stale `auto/session-0307..0310` pruned; single close push — hash reported at bow-out / see git log. |
| Graphify update | `graphify update .` ran pre-commit (FS-0025): stats recorded in the bow-out chat. |
