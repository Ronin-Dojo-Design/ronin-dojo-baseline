---
title: "SESSION 0427 — Mobile polish: rank-badge overlap, EmailCapture system theme, FormLabel wrap"
slug: session-0427
type: session--implement
status: closed
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0427
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0419.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0427 — Mobile polish: rank-badge overlap, EmailCapture system theme, FormLabel wrap

## Date

2026-06-20

## Operator

Brian + claude-session-0427

## Goal

Three small mobile-polish items on the live BBL app, each verified on a real narrow-mobile
viewport (390px requested; also 360/320px) with `getBoundingClientRect` measurements + screenshots:
(1) fix the rank-badge overlap/overflow in the unclaimed-placeholder profile hero, (2) make the BBL
`EmailCapture` card follow the system `prefers-color-scheme` by default (black when no preference),
(3) make `FormLabel` wrap by default instead of clipping long labels, and retire the SESSION_0419
copy-shortening workaround.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0419.md`
- Carryover: SESSION_0419 hardened the claim/email-lifecycle path and noted (in its commits) a
  `FormLabel` `truncate` workaround — this session removes that workaround at the root.

### Branch and worktree

- Branch: `claude/epic-wright-7ofg6h` (remote feature branch for this task; not trunk)
- Status at bow-in: clean
- Current HEAD at bow-in: `d73ce30`

## Task log

| ID | Title | Status |
| --- | --- | --- |
| SESSION_0427_TASK_01 | Fix rank-badge overlap in `ProfileHero` (wrap long chips; flex blowout) | ✅ |
| SESSION_0427_TASK_02 | `EmailCapture` default theme → `prefers-color-scheme`, black fallback | ✅ |
| SESSION_0427_TASK_03 | `FormLabel` wrap-by-default; restore claim-note copy workaround | ✅ |

## What landed

- **Rank-badge overlap (TASK_01).** The placeholder profile hero passes each rank name as a `tags`
  chip; `Badge` is `whitespace-nowrap`, so a long rank ("Coral Belt (Red/Black) - 7th Degree") is a
  single chip that cannot wrap. In the `min-w-0 flex-1` hero content column it spilled past its
  column (and the card). Fix in `profile-hero.tsx`: the chips Stack gets `min-w-0` and every badge
  gets `max-w-full whitespace-normal break-words text-left` (via `cx`/tailwind-merge, this replaces
  the base `whitespace-nowrap`), so long chips wrap inside the column instead of blowing out.
- **EmailCapture system theme (TASK_02).** `EmailCapture` defaulted `theme="dark"`. New
  `useResolvedTheme` hook: an explicit `theme` prop still wins; when omitted, it follows
  `prefers-color-scheme` (light system → light card + black wordmark; dark system → dark card +
  white wordmark) and defaults to BLACK for the SSR / no-JS / no-preference path (initial state is
  `"dark"`). The light landing keeps `theme="light"`; the dark teaser holding page is pinned to
  `theme="dark"` so its cinematic look is preserved regardless of system preference.
- **FormLabel wrap (TASK_03).** `FormLabel` hardcoded `truncate` (white-space:nowrap), clipping long
  labels on mobile and forcing copy-shortening. Changed to wrap by default (`break-words`); pass
  `truncate` via `className` at any call site that genuinely needs ellipsis. Restored the fuller
  claim-note label "Anything that helps us verify your claim (optional)" that SESSION_0419 had to
  shorten (kept the defensive `min-w-0` on the field).

## Files touched

- `apps/web/components/web/profile/profile-hero.tsx` — chips Stack `min-w-0`; badges wrap.
- `apps/web/app/(web)/_components/bbl-teaser/email-capture.tsx` — `useResolvedTheme` + system default.
- `apps/web/app/(web)/_components/bbl-teaser/index.tsx` — pin teaser holding page to `theme="dark"`.
- `apps/web/components/common/form.tsx` — `FormLabel` wraps by default.
- `apps/web/components/web/claims/profile-claim-form.tsx` — restore fuller claim-note copy.
- `apps/web/server/web/lineage/claim-approved-email.ts` — CI follow-up: guard `after()` registration so a
  missing request scope can never break a claim (prod hardening).
- `apps/web/server/admin/lineage/claim-review-actions.test.ts` — CI follow-up: mock `next/server` `after`
  (matches `memberships/actions.test.ts`).

## Verification

Gates: `typecheck` clean; `oxlint` clean (5 touched files); `oxfmt --check` clean. DB-backed tests
(`capture-email.test.ts`) require a live Postgres not present in this container (P1001) — unrelated
to these UI-only changes; env-var validation passes once env is set.

390/360/320px browser measurements via a faithful offline harness (real locally-compiled Tailwind v4
CSS injected into headless Chromium; the app font is unavailable so the harness uses the default
sans, which is *narrower* than BBL Poppins — so it under-states, not over-states, overflow):

- **TASK_01** at 360px: BEFORE chip right edge spills `+10.7px` past its 214px column (visible
  overlap); at 320px `+50.7px` and `overflowX=18px` (horizontal page scroll). AFTER: chip wraps to
  2 lines, `chipPastColumn=0`, `overflowX=0` at 390/360/320. At 390px the exact string already fit
  the default-font column (no-op, no regression); the production Poppins width is what overflows at
  390 — wrapping covers it.
- **TASK_03** at 360px: BEFORE label overflows the field by ~60px and the viewport by `+25.4px`
  (`overflowX=25`); at 320px `overflowX=65`. AFTER: wraps to 2 lines, fits the field, `overflowX=0`
  at all widths.
- **TASK_02**: dark system → `dark` (WHITE wordmark); light system → `light` (BLACK wordmark);
  explicit `light`/`dark` props honored over the system; SSR/initial state → `dark` (black). Known
  platform limitation: browsers map `prefers-color-scheme: no-preference` to the CSS *light*
  fallback at runtime, so the black-on-no-preference guarantee is enforced at the SSR / no-JS /
  initial-state layer (documented in the component).

Screenshots: `task1-rankbadge-{390,360,320}-{BEFORE,AFTER}.png`,
`task3-formlabel-{390,360,320}-{BEFORE,AFTER}.png`, `task2-*.png` (captured in-session).

## Open decisions / blockers

- None blocking from this PR's UI changes. Note the documented `prefers-color-scheme: no-preference`
  → light runtime mapping (unavoidable per current CSS spec; black default holds at SSR/no-JS).
- **CI on PR #128 — pre-existing unit-test failures fixed (operator-approved).** 5 `applyLineageClaimReview`
  tests were red on `main` too (since SESSION_0419 commit `7ef4ef6`): the admin approve path calls Next
  `after()` via `scheduleClaimApprovedEmail`, which throws outside a request scope, and the test never
  mocked `next/server`. Fixed both ways per operator choice: mock `after` in the test + harden
  `scheduleClaimApprovedEmail` to guard the `after()` registration (a claim can never fail because the
  confirmation email couldn't schedule).
- **🔴 Vercel deploy failure is environmental, not a code break.** `next build` *compiles* clean
  (verified locally: "Compiled successfully" + TypeScript pass); it fails only at "Collecting page
  data" for `/[slug]` with `P1001 Can't reach database server`. The Vercel build does build-time DB
  queries, so a missing/rotated/unreachable `DATABASE_URL` (Neon) fails the deploy — this is the
  SESSION_0419 pending secret-rotation blocker, an operator/dashboard action, not fixable in PR code.

## Next session

**Goal:** Continue the SESSION_0419 next-task — lifecycle-email copy audit now that sends are live.

**First task:** Audit every now-live `LifecycleEmailKind` (receipts, renewals, win-back,
comp-granted, rank-promotion, etc.) for a real trigger, correct copy, correct tier/CTA.

## Reflections

- **The bug is font-and-width-dependent, the fix is not.** The exact reported string fits a 390px
  column in the headless default font but overflows at 360/320 and at 390 in the wider production
  font. Wrapping (`whitespace-normal` + `min-w-0`) removes the dependency entirely — the chip can
  never blow out its column at any width or font. Padding alone would not have.
- **`cx` is tailwind-merge.** Adding `whitespace-normal` in a Badge `className` correctly drops the
  base `whitespace-nowrap` — no need to touch the shared `Badge` component.
- **Fix the primitive, not the copy.** SESSION_0419 shortened a label to dodge `FormLabel`'s
  `truncate`; the root fix (wrap by default) lets the fuller copy come back and prevents the next
  clip across all 63 `FormLabel` call sites (audited: none relied on truncate; 2 row-layouts use
  short labels).
