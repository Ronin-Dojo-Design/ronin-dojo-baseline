---
title: "SESSION 0700 — auto-claude WL-P2-45 PassportEditor one-submit collapse + riders (overnight auto lane)"
slug: session-0700
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-25
last_agent: claude-session-0700
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0521.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0700 — auto-claude WL-P2-45 PassportEditor one-submit collapse + riders (overnight auto lane)

> Overnight-orchestrator lane. Branch: `auto/session-0700-wl45-passport-editor-unify`, worktree
> `/Users/brianscott/dev/ronin-0700`. HIGH-STAKES scope: Passport = identity SoT (ADR 0025);
> `PassportEditor` = the ONE editor. Backend-first per the dispatch: combined action + merged
> schema, then the UI collapse.

## Date

2026-07-24 → 2026-07-25 (overnight)

## Operator

Brian (asleep) + autonomous lane, orchestrated per the overnight dispatch (operator addendum:
verify-first law — reproduce before refactoring, skip already-fixed riders individually).

## Verify-first evidence (operator addendum)

The WL row + riders were written against Desi SESSION_0521 M4, when the editor lived in the FI-024
inline `ProfileEditDrawer` on `/me`. This tree is post-SESSION_0525 — the drawer surface is GONE,
so each item was re-verified before building:

| Item | Still reproduces? | Evidence in this tree |
| --- | --- | --- |
| Core: two hoisted RHF forms, two Save buttons | **YES** | `passport-editor.tsx` pre-change: `PassportForm` ("Save passport", ~:345) + `DirectoryProfileForm` ("Save directory profile", ~:502), each its own `useHookFormAction` + `<form>` |
| Rider a: drawer dismiss discards dirty state | **NO — surface deleted** | `ProfileEditDrawer` deleted in SESSION_0525 C0 (`app/(web)/me/page.tsx` header comment: "the inline `ProfileEditDrawer` was deleted in migration step 7"; `app/(web)/_components/profile-view/index.tsx` same). `/me` is a bare server redirect to `/app/profile`. No drawer hosts the editor anywhere (`grep ProfileEditDrawer` → 2 comment hits only). Skipped. |
| Rider b: `/me#edit` hash never cleared on close | **NO — surface deleted** | `/me` is `redirect("/app/profile")` — no `#edit` reader/writer exists in the tree (`grep '#edit'` → no live hits). Nothing to strip. Skipped. |
| Rider c: third save-semantics (avatar persists instantly) | **YES** | Owner mode `AvatarUploader` → `uploadAndPromotePassportAvatar` persists on "Save photo", independent of the form Save (`components/web/uploader/index.tsx`). Built: explicit hint. |
| Rider d: `formatPromotedOn` duplicates `formatPromotionDate` | **YES** | Local `formatPromotedOn` in `app/(web)/directory/[slug]/_components/directory-profile/ranks-section.tsx:17` — same "Mon YYYY"/UTC logic as `promotion-format.ts:formatPromotionDate`, only wider input (`Date | string | null`). Built: widened + shared. |

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0700_TASK_01 | done | Combined `updatePassportAndProfile` action + ONE merged zod schema (`updatePassportAndProfileSchema` + `splitPassportAndProfileInput`); granular actions kept |
| SESSION_0700_TASK_02 | done | Admin twin `updatePassportAndProfileAsAdmin` (+ `updatePassportAndProfileAsAdminSchema`) so the ONE editor stays un-forked in admin mode |
| SESSION_0700_TASK_03 | done | PassportEditor collapse: ONE RHF form, ONE "Save profile" submit; Identity / Directory Profile headings now presentation-only sections |
| SESSION_0700_TASK_04 | skipped-obsolete | Rider a (drawer dirty-close guard) — drawer deleted SESSION_0525, see verify-first table |
| SESSION_0700_TASK_05 | skipped-obsolete | Rider b (`/me#edit` hash strip) — surface deleted SESSION_0525, see verify-first table |
| SESSION_0700_TASK_06 | done | Rider c: explicit owner-mode hint "Your photo saves immediately when uploaded — all other fields save when you press 'Save profile'." (upload seam untouched) |
| SESSION_0700_TASK_07 | done | Rider d: `formatPromotionDate` widened to `Date \| string \| null`; `RanksSection` now imports it, local `formatPromotedOn` deleted |
| SESSION_0700_TASK_08 | done | Tests: merged-schema validation + split-helper routing, combined-action safe-action test (both halves in ONE tx, partial-failure explicit), widened-formatter Date cases |

## What landed

**Backend (first, per dispatch):**

- `server/web/passport/schemas.ts` — `updatePassportAndProfileSchema`: FLAT merge
  (`{ ...passport.shape, ...directory.shape }`, collision-free field sets) so RHF field names and
  the `SocialLinksEditor` contract are untouched. `splitPassportAndProfileInput()` routes parsed
  keys back to their owning model by shape membership, copying only PRESENT keys — the load-bearing
  undefined-skip / null-clears semantics survive the merge. Granular schemas remain the granular API.
- `server/web/passport/actions.ts` — `updatePassportAndProfile` (`userActionClient`): both halves in
  ONE interactive `db.$transaction` — passport first (resolves the profile key; identity is the SoT
  half), then directoryProfile keyed by the resolved `passport.id`. **Partial-failure behavior is
  explicit: either update throwing rolls the whole write back — never a half-saved identity.**
  Granular `updatePassport` / `updateDirectoryProfile` kept (zero external consumers today, kept per
  dispatch as the granular API).
- `server/admin/people/schemas.ts` / `actions.ts` — admin twins (`…AsAdminSchema` = merged schema +
  `passportId`; `updatePassportAndProfileAsAdmin` keyed `where: { id: passportId }`, keeps the
  granular admin action's DirectoryProfile **upsert** semantics for accountless placeholders).

**UI:**

- `components/web/passport/passport-editor.tsx` — the two hoisted forms + two Saves collapsed into
  ONE `useHookFormAction` over the merged schema with ONE "Save profile" button; admin mode still a
  prop-swap (action + schema + injected `passportId`), not a fork. Live-preview `useWatch`es now read
  one control. Rider-c hint added under the owner-mode `AvatarUploader`. Host wiring
  (`DashboardProfileTab`, admin `/app/users/[id]`) needed **zero changes** — props unchanged.
- `promotion-format.ts` + `ranks-section.tsx` — rider d dedupe (one formatter, widened input).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/passport/schemas.ts` | merged schema + split helper added |
| `apps/web/server/web/passport/actions.ts` | combined transactional action added |
| `apps/web/server/web/passport/schemas.test.ts` | merged-schema + split-helper tests (29 pass) |
| `apps/web/server/web/passport/passport-and-profile.safe-action.test.ts` | new — combined-action gate/orchestration tests (4 pass) |
| `apps/web/server/admin/people/schemas.ts` | admin merged schema added |
| `apps/web/server/admin/people/actions.ts` | combined admin action added (tx + upsert) |
| `apps/web/components/web/passport/passport-editor.tsx` | one-form collapse + rider-c hint |
| `apps/web/components/web/lineage/lineage-cohort-timeline/promotion-format.ts` | `formatPromotionDate` widened to accept `Date` |
| `apps/web/components/web/lineage/lineage-cohort-timeline/promotion-format.test.ts` | Date-input cases added (13 pass) |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/ranks-section.tsx` | shares `formatPromotionDate`; local duplicate deleted |
| `docs/sprints/SESSION_0700.md` | this file |

## Verification

| Command | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun run typecheck` (root, all workspaces) | all `Exited with code 0` — REAL_EXIT:0 |
| `bun test server/web/passport/schemas.test.ts` | 29 pass / 0 fail — REAL_EXIT:0 |
| `bun test server/web/passport/passport-and-profile.safe-action.test.ts` | 4 pass / 0 fail — REAL_EXIT:0 |
| `bun test components/web/lineage/lineage-cohort-timeline/promotion-format.test.ts` | 13 pass / 0 fail — REAL_EXIT:0 |
| `bun run lint:check` (apps/web oxlint) | REAL_EXIT:0 (pre-existing warnings only, none in touched files) |
| `bunx oxfmt --check <10 touched files>` | REAL_EXIT:0 after formatting `passport-editor.tsx` |

Single-file `bun test` invocations per SOP-test-writing (§ two-headed concurrency: full suite =
`bun run test` only; never bare multi-file `bun test`).

## Proposed ledger edits

> Lane rule 4: findings stay HERE; the merge owner applies them to the canonical ledgers.

1. **`wiring-ledger.md` WL-P2-45 → RESOLVED (draft):**
   "SESSION_0700: PassportEditor collapsed to ONE submit — combined transactional
   `updatePassportAndProfile` (+ admin twin) over the flat-merged `updatePassportAndProfileSchema`;
   granular actions kept as the granular API. Riders: (a) drawer dirty-close guard **obsolete** —
   `ProfileEditDrawer`/`/me` owner surface deleted SESSION_0525 C0, no drawer hosts the editor;
   (b) `/me#edit` hash strip **obsolete** — same deletion, `/me` is a bare redirect; (c) third
   save-semantics normalized as an explicit owner-mode hint (avatar persists instantly via
   `uploadAndPromotePassportAvatar` — seam untouched per dispatch); (d) `formatPromotedOn`
   duplicate deleted — `formatPromotionDate` widened to `Date | string | null` and shared."
2. **New wiring finding (successor to rider a, for triage):** `DashboardTabs`
   (`app/(web)/dashboard/tabs.tsx`) renders ONLY the active tab's content — switching away from the
   Profile tab (or soft-nav setting `?tab=`) unmounts the editor and silently discards dirty form
   state, the same failure mode Desi MED-1 flagged for the deleted drawer, now at the tab boundary.
   Shared file (9 tabs) → NOT touched by this lane. Suggest a WL-P3 row: dirty-check confirm (or
   keep-mounted tabs) for form-bearing tabs.
3. **Observation (no row needed):** the granular `updatePassport` / `updateDirectoryProfile`
   actions now have ZERO callers outside their own module (grep evidence this session) — kept
   deliberately per dispatch as the granular/API surface; if a future sweep wants them gone, that
   is a separate decision, not tech debt introduced here.

## Close

- Scope held: `social-links-editor.tsx`, `components/common/*`, `_kernel/*`, `state-panel.tsx`,
  shared ledgers untouched (`git status` clean outside owned files).
- No new dependencies; no schema/migration; no env vars.
- Authz preserved: owner path stays `userActionClient` keyed `userId`; admin path stays
  `adminActionClient` keyed explicit `passportId` — same gates as the granular twins.
- Exit contract: commit → push -u → `gh pr create --fill` → STOP (PR left for the merge owner).
