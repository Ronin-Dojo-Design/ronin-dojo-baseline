---
title: "SESSION_0684 — Mammoth GBP submission pack"
slug: session-0684-mmb-gbp-pack
type: session--open
status: open
created: 2026-07-24
lane: build
brand: mammoth-build
---

# SESSION_0684 — Mammoth Metal Buildings GBP submission pack

Overnight-orchestrator lane. Docs-only, Iggy drafts posture (draft social/marketing content,
never post). Worktree `/Users/brianscott/dev/ronin-0684`, branch
`auto/session-0684-mmb-gbp-pack`.

## Goal

Produce a claim-ready Google Business Profile submission package for Mammoth Metal Buildings — the
#282 highest-leverage local-visibility gap (mammoth.build surfaces no GBP link at all, while the CRM
already captures the two triggers a local-search engine feeds on: job completion → review request,
`BuildPhoto` → post material). Drafts-only: the operator claims/creates/verifies the listing (a
credential action Iggy never performs).

## What landed

- New: `docs/product/mammoth-build/gbp/submission-pack.md` — the full pack:
  - Finalized business name (**Mammoth Metal Buildings**, with the rationale vs the internal
    "Mammoth Build" name).
  - Field-by-field paste sheet; confirmed canon (phone 888-850-7564, website mammoth.build, brand
    voice/mission/motto) vs explicit `[VERIFY: …]` placeholders for every unconfirmed listing fact.
  - Primary + secondary category recommendations with live-picker fallbacks and a verify gate.
  - Ready-to-paste **661-char** business description (limit 750; measured), built from confirmed
    brand canon only + an optional verified-building-type expansion path.
  - Six services with per-service blurbs (≤300 chars each) from the PRD lifecycle + two Installation
    Paths.
  - Service-area vs storefront decision guidance; service areas kept a placeholder (explicitly NOT
    inferred from the project gallery).
  - Hours / opening-date placeholders with anti-inference guidance.
  - GBP photo shot-list (logo/cover/exterior/at-work/team + per-project before/during/after SOP +
    publishing QA).
  - Six owner-managed Q&A seeds.
  - Drafts of the first 3 GBP posts (intro / proof / how-we-work), brand-voiced, project specifics
    left as `[VERIFY]` slots.
  - Attributes verify-list.
  - Step-by-step OPERATOR claim + verification checklist (find-existing → core info →
    postcard/phone/email/video/Search-Console verify → complete → seed → access & linking) with a
    who-owns-what table.
  - Pre-publish final-gate checklist.
- New: this SESSION file.

Source discipline honored: the listing-draft rule that unknown facts stay explicit placeholders and
are never inferred from project/gallery locations was applied throughout (address, hours, service
area, opening date, building-type list all left as `[VERIFY]`).

## Proposed ledger edits

_(In-lane rule: never touch shared ledgers. Findings recorded here for the merge owner to route.)_

- **WL (wiring-ledger) candidate — read-path:** the source `gbp-listing-draft.md` template
  (SESSION_0656) is now superseded by this submission-pack for actual claim work. Consider a
  backlink/pointer from the template to `docs/product/mammoth-build/gbp/submission-pack.md` so the
  read-path lands on the actionable pack, not the earlier draft.
- **Backlog candidate — post-claim wiring:** once the operator verifies the GBP, add the GBP link to
  the mammoth.build footer (closes the original #282 gap) and wire the CRM Satisfied-Installation →
  review-request seam (research review §2d). Not doable in this docs-only lane.
- No FS / D / incident findings from this lane.

## Verification

- Docs-only lane. Owned paths written: `docs/product/mammoth-build/gbp/submission-pack.md` and
  `docs/sprints/SESSION_0684.md`. No app/package/shared-ledger files touched.
- No trivially-available markdown linter in a fresh (un-bootstrapped) worktree: `markdownlint` /
  `markdownlint-cli2` absent; `scripts/wiki-lint.ts` requires the bun env (not bootstrapped by
  design) and scopes to `docs/knowledge/wiki/**` only (this deliverable is under `docs/product/**`).
  **Docs-only, no code gate applies.**
- Description character count gate (only measurable check): `python3 len()` on the description body
  → **661** (≤ 750). REAL_EXIT captured below.
- `REAL_EXIT=0` (description-length measurement; see Verification command in the PR / session log).

## Full close evidence

- Identity guard: `pwd` = `/Users/brianscott/dev/ronin-0684`, branch
  `auto/session-0684-mmb-gbp-pack` — confirmed before any write.
- Owned-paths only: `git status` shows exactly the two owned files. No `git add -A`.
- Description length REAL_EXIT recorded (0).
- Exit contract: commit (conventional + Co-Authored-By trailer) → `git push -u origin HEAD` →
  `gh pr create --fill` → STOP (no merge/deploy/main).
