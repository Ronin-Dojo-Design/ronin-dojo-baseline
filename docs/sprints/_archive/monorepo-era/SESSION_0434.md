---
title: "SESSION 0434 — FI-008 local verify + merge; FI-007 cover/video render"
slug: session-0434
type: session--open
status: closed
created: 2026-06-22
updated: 2026-06-22
last_agent: claude-session-0434
sprint: S43
pairs_with:
  - docs/sprints/SESSION_0433.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0434 — FI-008 local verify + merge; FI-007 cover/video render

## Date

2026-06-22

## Operator

Brian + claude-session-0434

## Goal

Two phases. **PHASE 1:** triage the open PR queue and run the deferred LOCAL verification for the
FI-008 seed reconciliation (PR #161 / SESSION_0433) — run the reconciled `seed-baseline-lineage.ts`
against a throwaway copy of `ronindojo_prodsnap` and diff before/after to confirm it does NOT regress
the SESSION_0430 roster corrections (chris-posnik stays gone, Bill Hosken stays Black Belt 5th, Jerry
Smith BK0, Poznik BK5, Rikki Rockett BK4). Report verdict, pause-on-merge; resolve drift D-030 when it
merges. **PHASE 2:** the FI-007 render follow-up — `DirectoryProfile.coverPhotoUrl` and `videoIntroUrl`
are stored + in the read model but never rendered (WL-P2-14 / WL-P2-15). Wire coverPhotoUrl into
`ProfileHero` and videoIntroUrl into a video-embed section on `/directory/[slug]`; verify both
round-trip and DISPLAY in the browser. Flip WL-P2-14/15 to fixed; resolve FI-007 in POST_LAUNCH_SOT.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0433.md` (FI-008 seed-baseline-lineage reconcile, cloud
  session — authored the seed edits but DEFERRED seed-run verification to a local follow-up, no DB in
  cloud). Also read `SESSION_0432.md` context via 0433.
- Carryover: 0433 reconciled the seed with all SESSION_0430 SQL corrections + the 0432 Hélio/Rorion
  link and opened PR #161 (pause-on-merge). The seed was NEVER run against a DB. This session is the
  named local-verify follow-up that gates the merge and closes D-030.

### Branch and worktree

- Branch: `fi008-verify` (1 commit ahead of `main`; HEAD `4e1d764d` is **identical** to PR #161 tip —
  this is a local checkout of the PR branch, so verifying it verifies the PR exactly).
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `4e1d764d`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma seed (PHASE 1, data verify only); Media/Storage + profile UI (PHASE 2, render) |
| Extension or replacement | Extension: PHASE 1 verifies an existing upsert seed; PHASE 2 renders already-stored media fields |
| Why justified | PHASE 1 gates a merge that could regress prod; PHASE 2 closes a stored-but-never-displayed gap |
| Risk if bypassed | PHASE 1: re-running unverified seed regresses 0430 corrections (D-030); PHASE 2: cover/video uploads remain invisible |

Live docs checked during planning: Media/Storage (cover photo + video URL are existing fields), not applicable for PHASE 1.

### Grill outcome

Decisions locked from the task brief:

1. Session number is **0434**, not 0433 — SESSION_0433 already exists (the cloud FI-008 session, in PR
   #161). Avoiding the session-number collision the bow-in warned about.
2. PHASE 1 local verify uses a **throwaway DB copy** of `ronindojo_prodsnap` (`createdb -T`), not a
   transaction wrapper — the seed uses the Prisma client (auto-commit) so an external `BEGIN/ROLLBACK`
   can't wrap it; a snapshot copy is the truly non-destructive path and gives a real before/after diff.
3. Pause-on-merge: explicit operator "go" required before merging #161 and before any prod-affecting push/deploy.

### Drift logged

- D-030 (open) — `seed-baseline-lineage.ts` drifted from SESSION_0430 SQL corrections. Resolves on this
  session's local-verify pass + merge.

## Petey plan

### Goal

Verify-and-merge the FI-008 seed reconciliation (no regression), then render the two stored-but-hidden
directory-profile media fields and prove they display.

### Tasks

#### SESSION_0434_TASK_01 — PHASE 1: triage PRs + local seed verify of #161

- **Agent:** Petey (triage) → Cody (verify)
- **What:** Triage all open PRs; run the deferred local verification of the reconciled seed against a
  throwaway copy of `ronindojo_prodsnap`; diff before/after; report verdict; pause-on-merge.
- **Steps:**
  1. `gh pr list --state open` + read every check on each PR (code-defect vs flake vs inherited).
  2. Capture "before" roster state on `ronindojo_prodsnap` (Bill Hosken rank, Jerry Smith rank,
     chris-posnik presence, Poznik, Rikki Rockett, dup Brian Scott, Hélio node + edge).
  3. `createdb ronindojo_seedverify -T ronindojo_prodsnap` (throwaway copy).
  4. Run `seed-baseline-lineage.ts` against the copy.
  5. Capture "after" state; diff. Confirm: Bill Hosken=BK5, Jerry Smith=BK0, Poznik=BK5, Rikki
     Rockett=BK4 created, chris-posnik absent, no dup Brian Scott, Hélio node + helio→rorion edge present.
  6. Drop the copy. Report verdict (READY / KEEP_AS_IS / INTENT).
- **Done means:** diff proves no regression of the corrected roster; verdict reported; merge awaits "go".
- **Depends on:** nothing

#### SESSION_0434_TASK_02 — PHASE 2: render coverPhotoUrl in ProfileHero (WL-P2-14)

- **Agent:** Cody
- **What:** Add `coverPhotoUrl?: string | null` prop to `ProfileHero`; render as hero background image
  on `/directory/[slug]`.
- **Steps:** read `profile-hero.tsx` + `directory-profile/index.tsx`; thread the DTO field
  (`queries.ts:205`) into the hero; render a background-image layer with a sensible fallback.
- **Done means:** a profile with a cover photo set shows it behind the hero; no cover → current look.
- **Depends on:** nothing (independent of TASK_01)

#### SESSION_0434_TASK_03 — PHASE 2: render videoIntroUrl embed on /directory/[slug] (WL-P2-15)

- **Agent:** Cody
- **What:** Add a video-intro embed section (YouTube/Vimeo) to the directory profile page.
- **Steps:** parse the stored URL → embed iframe; render a section only when `videoIntroUrl` is set;
  audit client↔server parity (form write → DTO `queries.ts:206` → render).
- **Done means:** a profile with a video URL shows an embedded player; none → no section.
- **Depends on:** nothing

#### SESSION_0434_TASK_04 — PHASE 2: browser-verify + flip ledger + resolve FI-007

- **Agent:** Doug
- **What:** dev-login, set a cover + video on a directory profile, confirm both DISPLAY; screenshot;
  flip WL-P2-14/15 to fixed; resolve FI-007 in POST_LAUNCH_SOT.
- **Done means:** screenshot proof; ledger rows flipped; FI-007 marked resolved.
- **Depends on:** SESSION_0434_TASK_02, SESSION_0434_TASK_03

### Parallelism

TASK_01 (PHASE 1) is independent and runs first to completion. TASK_02 and TASK_03 touch overlapping
files (`directory-profile/index.tsx`) → sequential. TASK_04 after 02+03.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0434_TASK_01 | Petey→Cody | PR triage + data verify |
| SESSION_0434_TASK_02 | Cody | component prop + render |
| SESSION_0434_TASK_03 | Cody | new embed section, same file |
| SESSION_0434_TASK_04 | Doug | browser verify + ledger |

### Open decisions

- Merge of #161 awaits explicit operator "go" (pause-on-merge).

### Risks

- Rikki Rockett displayName matching (flagged in 0433): if the prod Passport displayName ≠ "Rikki
  Rockett", the seed CREATES an accountless dup instead of finding it. The local verify will catch this.
- coverPhotoUrl/videoIntroUrl render must not break profiles with the fields null.

### Scope guard

- Do NOT apply the seed to `ronindojo_prodsnap` itself or to prod — throwaway copy only.
- Do NOT merge #161 without explicit "go".
- Do NOT add helio-gracie tree membership (deferred from 0433 — separate follow-up).
- PHASE 2: do NOT build a new card/detail shell — reuse ProfileHero / ListingDetail chrome.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0434_TASK_01 | landed (merge pending go) | PHASE 1: #161 only open PR; all CI green (PW chromium finishing); local seed-run verify on throwaway `ronindojo_seedverify` (copy of prodsnap) → before/after byte-identical, created=0, prodsnap untouched. Zero regression. Verdict READY. |
| SESSION_0434_TASK_02 | landed | `ProfileHero` + `coverPhotoUrl` prop (bg + scrim); threaded through `ProfileClaimTeaser` (placeholder) + `passport-editor` live preview; claimed path uses new `ProfileCoverBanner` (ListingDetail doesn't use ProfileHero) |
| SESSION_0434_TASK_03 | landed | new `VideoIntroSection` on `/directory/[slug]` + `lib/video-embed.ts::toVideoEmbedUrl` (watch→embed, 10 tests); renders 16:9 YouTube/Vimeo iframe, hides when unset |
| SESSION_0434_TASK_04 | landed | dev-login as admin owner → `/directory/brian-scott` full profile: cover banner + video embed both DISPLAY (screenshots). Gates: bun test 10/10, oxfmt+oxlint clean, tsc exit=0. Flipped WL-P2-14/15; FI-007 resolved in POST_LAUNCH_SOT |

### PHASE 1 — FI-008 local verify evidence

| Check | Result |
| --- | --- |
| Open PR queue | Only #161 (FI-008 seed reconcile); HEAD `4e1d764d` == local `fi008-verify` |
| CI on #161 | Oxc, tsc, bun test, Vercel, firefox+webkit PW = pass; chromium PW finishing; no code-defect reds |
| Method | `createdb -T ronindojo_prodsnap ronindojo_seedverify` → run seed w/ explicit `DATABASE_URL` → diff |
| Roster before==after | **byte-identical** (`diff` clean): Hosken BK5 (+BK3), Jerry BK0, Poznik BK5, Rikki Rockett BK4 (Renato Magno), Hélio R10 + helio→rorion edge, single account-linked Brian Scott, no chris-posnik |
| Seed summary | created=0 everywhere (idempotent; corrective blocks were no-ops on already-corrected prodsnap) |
| prodsnap untouched | re-query post-run `diff` clean — seed only hit the copy |
| Limitation (honest) | corrective blocks fire on UNcorrected data (the pending prod Neon run) was not exercised; reviewed-as-correct in 0433 (mirrors 0430 SQL) |
| Verdict | **READY** — pending operator "go" to merge; on merge resolve D-030 |

## What landed

- **PHASE 1 (FI-008):** ran the deferred local verification for PR #161. Reconciled seed against a
  throwaway `createdb -T` copy of `ronindojo_prodsnap` → before/after **byte-identical** (created=0,
  fully idempotent); prodsnap untouched. Zero regression on the corrected roster. Verdict READY →
  operator approved → **#161 merged** (a parallel session landed the squash-merge `1a771747` +
  doc-resolution `b5779a82`); **D-030 resolved**.
- **PHASE 2 (FI-007 render):** wired the two stored-but-hidden directory-profile media fields.
  - `coverPhotoUrl` → `ProfileHero` background prop (scrim for legibility), threaded through the
    placeholder claim teaser + the owner live-preview; new `ProfileCoverBanner` for the **claimed**
    profile (which renders via `ListingDetail`, not `ProfileHero`).
  - `videoIntroUrl` → new `VideoIntroSection` (16:9 YouTube/Vimeo iframe) + new
    `lib/video-embed.ts::toVideoEmbedUrl` watch→embed normalizer (10 unit tests).
  - Browser-verified both DISPLAY (dev-login as admin owner → `/directory/brian-scott`).
  - Flipped WL-P2-14/15 → fixed; FI-007 → resolved in POST_LAUNCH_SOT.

## Decisions resolved

- The render target discrepancy: the ledger/brief said "coverPhotoUrl → ProfileHero", but the
  **claimed** public profile renders via `ListingDetail` (ProfileHero only appears on the placeholder
  teaser + owner form-preview). Resolved by wiring **both** paths so the cover displays whether the
  profile is claimed or a placeholder.
- Video URL handling: store the user's watch URL (YT/Vimeo) as-is; normalize to an embed URL at render
  via a pure, unit-tested helper (returns null → section hides). No schema/form change.
- Session number 0434 (not 0433 — the cloud FI-008 session) to avoid the collision the bow-in warned of.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/video-embed.ts` | New — `toVideoEmbedUrl` watch→embed normalizer (YouTube/Vimeo) |
| `apps/web/lib/video-embed.test.ts` | New — 10 unit tests |
| `apps/web/components/web/profile/profile-hero.tsx` | + `coverPhotoUrl?` prop → background image + legibility scrim |
| `apps/web/components/web/claims/profile-claim-teaser.tsx` | + `coverPhotoUrl?` prop → ProfileHero (placeholder path) |
| `apps/web/components/web/passport/passport-editor.tsx` | live cover preview (`useWatch coverPhotoUrl`) into ProfileHero |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/cover-banner.tsx` | New — `ProfileCoverBanner` (claimed ListingDetail path) |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/video-section.tsx` | New — `VideoIntroSection` embed |
| `apps/web/app/(web)/directory/[slug]/_components/directory-profile/index.tsx` | Wire cover banner + video section + teaser cover |
| `docs/knowledge/wiki/wiring-ledger.md` | WL-P2-14 / WL-P2-15 → ✅ Fixed |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | FI-007 → resolved; `updated` date bump (FI-008 line reconciled to the parallel session's resolution) |
| `docs/sprints/SESSION_0434.md` | This file |

## Verification

| Command / smoke | Result |
| --- | --- |
| FI-008 seed verify (throwaway prodsnap copy) | before/after **byte-identical**; created=0; prodsnap untouched |
| `bun test lib/video-embed.test.ts server/web/passport/schemas.test.ts` | 20/20 pass |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | **exit 0** |
| `oxfmt` + `oxlint --fix` (changed files) | clean (no auto-changes to unrelated files) |
| `bun run wiki:lint` | 0 errors (15 inherited warnings; the one I caused — stale `updated` — fixed) |
| Browser (dev-login admin owner → `/directory/brian-scott`, full profile) | cover banner renders + YouTube embed loads under "Video Intro" |
| Full unit suite | Deferred to CI on push — local full-suite is unreliable vs `ronindojo_prodsnap` (not the seeded CI DB); changes are additive/low-risk |

## Open decisions / blockers

- **Prod Neon seed run still pending** — the FI-008 corrective blocks (B1/B2/C1/C2) firing on *uncorrected*
  data (the prod scenario) were NOT exercised locally (prodsnap was already corrected → no-ops). That
  run is operator-gated and separate.
- **helio-gracie TREE_SEEDS membership** — deferred from 0433; follow-up.
- Pre-existing duplicate-React-key bug in `organizations-section.tsx` (chip spawned `task_61e4e437`).

## Next session

### Goal

Clear the FI-008 tail: add helio-gracie to `TREE_SEEDS` (deferred from 0433) and, when the operator is
ready, run the reconciled seed against prod Neon (exercises the corrective blocks on uncorrected data).
Optionally pick up the orgs-section duplicate-key fix.

### First task

Add helio-gracie tree membership to `TREE_SEEDS` in `seed-baseline-lineage.ts`, then dry-run on a
throwaway prodsnap copy to confirm the membership materializes without disturbing the corrected roster.

## Review log

### SESSION_0434_REVIEW_01 — FI-008 verify + FI-007 render

- **Reviewed tasks:** SESSION_0434_TASK_01–04
- **Dirstarter docs check:** Media/Storage — cover/video are existing stored fields; this only adds render. Not applicable for PHASE 1.
- **Verdict:** PHASE 1 verification was rigorous (throwaway-copy diff + prodsnap-untouched re-check) and
  honest about what it did/didn't exercise. PHASE 2 reuses existing chrome (`Section`/`H4`/`ProfileHero`),
  adds only optional props + two presentational components + a pure tested helper, and both fields were
  browser-verified to display. Render paths guard null so existing profiles are unaffected.
- **Score:** 8.5/10 (deducted: local full unit-suite deferred to CI; cover banner on the claimed path is a
  page-local banner rather than a true ListingDetail hero-background — a deliberate low-risk choice).
- **Follow-up:** confirm CI green post-push; prod Neon seed run when operator-ready.

## Hostile close review

- **Giddy:** pass — every verification claim is backed (curl DOM markers + screenshots for render; diff
  output for the seed). Explicit about the corrective-blocks-not-fired limitation and the deferred full suite.
- **Doug:** pass — tsc exit 0; changes additive (optional props, new pure lib + presentational components);
  no query/schema/server-action changes; null-guarded renders. `next build` risk low (no `"use server"` added).
- **Desi:** pass — cover banner + video section mirror sibling sections (`Section` + `H4`); ProfileHero scrim
  preserves text legibility over any cover; no new card/detail shell (reuse honored).
- **Kaizen aggregate:** 8.5/10 — clean reuse, honest verification, one deliberate low-risk UI shortcut.

## ADR / ubiquitous-language check

- ADR update: not required. Rendering existing stored fields introduces no new architectural decision.
- Ubiquitous language: no new terms. "Cover photo" / "video intro" are existing `DirectoryProfile` fields.

## Reflections

**The ledger's "wire it into X" can name the wrong surface.** WL-P2-14 said "coverPhotoUrl → ProfileHero",
but the claimed public profile renders via `ListingDetail` — ProfileHero only shows on the teaser + form
preview. Reading the actual render path (not just the ledger) caught it; wiring both paths is what makes the
feature genuinely visible. The cheapest way to find this was `grep ProfileHero` + reading `directory-profile/index.tsx`.

**Gating means a verification can be a no-op and still be the right test.** The FI-008 seed verify produced
created=0 / byte-identical — at first glance "nothing happened", but that IS the proof (the reconciled seed is
idempotent on corrected data; it won't clobber the 0430 fixes). The honest framing is what it did *not* test:
corrective blocks firing on uncorrected prod data.

**Parallel sessions sharing a worktree are a real hazard.** Mid-session the branch advanced under me
(`fi007-render` → `b5779a82`) because another session merged #161 + committed the D-030/FI-008 resolution. My
uncommitted work survived (no `reset --hard`), but my POST_LAUNCH_SOT edit would have clobbered the parallel
session's FI-008 resolution had I committed blind — reconciling against `git diff HEAD` before committing caught it.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0434 full frontmatter; POST_LAUNCH_SOT `updated` bumped (wiki-lint R4 cleared) |
| Backlinks/index sweep | SESSION_0434 in `backlinks: wiki/index.md`; pairs_with 0433 |
| Wiki lint | `bun run wiki:lint` → 0 errors (15 pre-existing warnings in SESSION_VIDEO_R001, not mine) |
| Kaizen reflection | Reflections section present (3 lessons) |
| Hostile close review | SESSION_0434_REVIEW_01; Giddy/Doug/Desi pass |
| Review & Recommend | Next session goal written (helio TREE_SEEDS + prod Neon seed run) |
| Memory sweep | Updated [lineage-rank-display-awarded-truth] (D-030 resolved); see close report |
| Custom components | `ProfileCoverBanner`, `VideoIntroSection`, `toVideoEmbedUrl` — documented in this file |
| New-component inventory | Page-local + reuse existing chrome; no new shared L1 primitive |
| Git hygiene | One commit on `fi007-render` → main; FS-0024 guard run |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` at close |

