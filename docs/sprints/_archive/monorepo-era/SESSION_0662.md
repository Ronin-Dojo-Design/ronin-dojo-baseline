---
title: "SESSION 0662 — codex-sol MMB OG image + icon (closes #270 residual) (overnight auto lane, wave 7/8)"
slug: session-0662
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: codex-session-0662
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0662 — codex-sol MMB OG image + icon (closes #270 residual) (overnight auto lane, wave 7/8)

> Staged by the SESSION_0635 orchestrator (waves 7+8 — operator-directed continuations of waves 5+6).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0662-mmb-og-image`
> (base: main).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

codex-sol MMB OG image + icon (closes #270 residual).

## Bow-in

- Worktree/branch verified before writes: `/Users/brianscott/dev/ronin-0662` on
  `auto/session-0662-mmb-og-image`.
- Elected lane: add the Mammoth Build client app's two self-contained `next/og` metadata images.
- Queue/pivot: the operator pinned this lane and its three-path write boundary; no pivot.
- Parallel-lane assessment: one coherent, two-file metadata-image change; no disjoint candidates.
- State of Dojo: live at `/app/state`; no frozen snapshot published because artifact publication is
  outside this lane's explicit write scope.

## Petey plan

| ID | Plan |
| --- | --- |
| SESSION_0662_TASK_01 | Add the OG image and icon, run the required client typecheck, record evidence, and commit only the explicit lane paths. |

## Pre-flight: waived by Petey

These are self-contained Next.js metadata file-convention images, not reusable application UI
components. The repo has no existing `opengraph-image.tsx` or `icon.tsx` implementation to extend,
and the lane explicitly forbids changes to shared components, layout, and libraries.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0662_TASK_01 | complete | Added and verified the Mammoth Build OG image and icon. |

## What landed

- Added the 1200×630 Mammoth Build Open Graph image through Next.js's `opengraph-image.tsx`
  file convention.
- Reused the landing page's positioning copy verbatim and rendered it with the client's dark,
  steel, and orange palette.
- Added the 32×32 orange `M` monogram icon through Next.js's `icon.tsx` file convention.
- Kept both image routes self-contained and edge-safe: no font files, network calls, or new
  dependencies.

## Files touched

| File | Change |
| --- | --- |
| `clients/mammoth-build-crm/app/opengraph-image.tsx` | Added the 1200×630 Mammoth Build social image. |
| `clients/mammoth-build-crm/app/icon.tsx` | Added the 32×32 orange `M` monogram. |
| `docs/sprints/SESSION_0662.md` | Recorded lane adoption, implementation, gates, review, and merge residual. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bunx tsc --noEmit` from `clients/mammoth-build-crm` | PASS — `exit=0`. |
| `../../node_modules/.bin/oxfmt --check app/opengraph-image.tsx app/icon.tsx` | PASS — both files correctly formatted, `exit=0`. |
| In-memory `ImageResponse` generation with PNG IHDR inspection | PASS — OG `status=200`, `image/png`, 1200×630, 66,668 bytes; icon `status=200`, `image/png`, 32×32, 480 bytes; `exit=0`. |
| `fallow audit -r . --changed-since HEAD --gate new-only --no-cache` | EXPECTED NON-ZERO — `exit=1`; only introduced findings were the two Next.js file-convention `runtime` exports, which Fallow cannot see the framework consuming. It excluded two inherited dependency findings and reported no new complexity or duplication issue. |
| Read-only Doug / Desi / Giddy review wave | PASS — GO from all three reviewers after Desi's exact-copy alt-text finding was fixed. |

## Proposed ledger edits

- Mark the #270 Mammoth Build OG-image residual closed: the client app now supplies both its
  Open Graph image and icon through the Next.js metadata file conventions.
- No ledger file was edited in this lane; AM merge coordination can apply the status change.

## Artifacts

None.

## Decisions resolved

- The OG positioning line is the landing-rendered `HERO.sub`, copied verbatim into the
  self-contained metadata image.
- Metadata image styling uses the exact provisional Mammoth tokens documented in
  `app/globals.css`; no external font asset is introduced.

## Open decisions / blockers

None for this lane.

## Review log

### SESSION_0662_REVIEW_01 — Mammoth metadata images

- **Reviewed tasks:** SESSION_0662_TASK_01
- **Doug:** GO — conventions, dimensions, copy, and edge-safety satisfy the brief.
- **Desi:** GO — palette, wordmark, legibility by source review, and 32px monogram align; an
  initially synthesized `alt` phrase was replaced with the exact `Mammoth Build` wordmark.
- **Giddy:** GO — code-quality composite **9.4/10** against `code-quality-matrix` §§2–5;
  no security, data-integrity, Dirstarter-bypass, or undocumented-pattern cap.
- **Fallow delta:** no introduced complexity or duplication finding; the two `runtime` export
  reports are expected framework-consumed false positives.
- **Dirstarter docs check:** not applicable — thin Next.js metadata file-convention routes,
  with no Dirstarter component, primitive, or baseline implementation changed.
- **Residual:** local client build and visual image eyeball remain AM merge checks by lane
  instruction.

## Hostile close review

- **Plan sanity:** sound; the work remained a two-file metadata residual with a fixed write set.
- **Dirstarter compliance:** not applicable; no Dirstarter-owned layer was replaced or bypassed.
- **Security / data integrity:** no input, request, filesystem, network, auth, or database path
  was added.
- **Lifecycle proof:** both `ImageResponse` functions generated valid PNG responses in memory at
  their declared dimensions.
- **Verification honesty:** compile, format, and PNG generation are proven; visual appearance and
  the client production build are explicitly retained for AM merge.
- **Workflow / merge readiness:** correct worktree and branch verified; only explicit paths staged;
  commit-only boundary maintained.

### Kaizen

1. The routes are safe because they consume constants only. Typecheck plus in-memory image
   generation prove executable output; a browser/social-card eyeball closes the remaining visual
   confidence gap.
2. One copy-compliance slip was caught in review: the first `alt` phrase synthesized existing
   words. It was fixed before commit. On future exact-copy lanes, audit metadata text alongside
   visible text before the first review.
3. Scale confidence: 100 = 10/10, 1,000 = 10/10, 10,000 = 9/10. The functions are deterministic
   and have no I/O or data-dependent work; aggregate confidence is 9/10.

## ADR / ubiquitous-language check

No architectural decision or new domain term was introduced; no ADR or glossary change is needed.

## Reflections

The Next.js metadata file convention kept the change isolated from the unmerged layout, landing,
and manifest work. Runtime PNG inspection added useful behavioral evidence without invoking a
forbidden client build or writing an artifact.

## Residual for AM merge

- Run a best-effort Mammoth Build client build during merge review.
- Visually eyeball the generated 1200×630 OG image and 32×32 icon.

## Next session

This autonomous lane ends at its commit. AM merge review owns the two residual checks above; no
next-session stub was staged because the write scope permits only this session record and the two
metadata image files.
