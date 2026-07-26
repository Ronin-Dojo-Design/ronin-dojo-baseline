---
title: "SESSION 0484 — Ship the BBL Lead Pipeline board standalone (flywheel + CRM; belts held)"
slug: session-0484
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0484
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0483.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0484 — Ship the BBL Lead Pipeline board standalone

> **Post-epic quality-pass decision.** The 6-slice belt-journey + CRM epic (petey-plan-0477) was built
> autonomously overnight (PRs #177–#182). A WWAD/ship-it review (Giddy + Doug + Desi + fallow) found the
> **belt-journey PRs are NOT launch-safe as-is**: the self-declare path (`setPassportRank`, pre-existing +
> ungated) + the belt UI can present a self-declared belt as **VERIFIED** (the trust badge reads
> `node.isVerified`, not the belt's award status), and the "verify-after" machinery the model assumes **does
> not exist** for belts. Operator decision: **hold the belt PRs (#178–#181)**, ship the two independently-safe
> pieces — the school-leads **flywheel (#177, merged)** and the **BBL Lead Pipeline board** (this session) —
> and land belts + a proper verification subsystem together next session (extending the existing claim-approval
> queue). See `docs/petey-plan-0477` + SESSION_0483 (held).

## Goal

Ship the BBL Lead Pipeline board on `main` as a standalone surface, decoupled from the held belt stack.

## Status

Closed. The leads-pipeline board (from epic Slice 6 / #182) extracted onto `main` (post-flywheel), verified,
PR'd. Belt PRs #178–#181 held as drafts.

## What landed

- **`apps/web/lib/leads-pipeline/`** + **`apps/web/app/app/leads-pipeline/`** — a BBL Lead Pipeline board that
  mounts the `AdminKanban` kernel over BBL's own `Lead`/`Organization` data (Mammoth pattern, ADR 0034/0038 —
  share the kernel, not the data; zero cross-product coupling). Stages NEW → TRIAL_BOOKED → CONTACTED →
  CONVERTED → LOST + a demand-ranked **"Schools to invite"** rail fed by the flywheel's `Lead.meta.kind =
  school_outreach` tag. Invite reuses `createOrgInvite` — **no auto-send** (email gated on an explicit
  recipient; test-proven).
- Extracted clean off `main`: 12 files, **zero belt-code references**, `next build` green, 23/23 tests pass.
- **Giddy verdict on the CRM:** textbook doctrine — no Mammoth-DB coupling, `leads.manage`-gated (route +
  per-action), correct kernel reuse. Ship-clean.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/leads-pipeline/*` (6 + 3 tests) | **NEW** — board config + store adapter + queries/actions + pure projection |
| `apps/web/app/app/leads-pipeline/*` | **NEW** — the `leads.manage`-gated route mounting `AdminKanban` + school-invite rail |

## Verification

| Gate | Result |
| --- | --- |
| `tsc` + `bun run build` (on `main`) | ✅ PASS |
| `bun run test lib/leads-pipeline/` | ✅ 23 pass / 0 fail |
| No belt-code dependency | ✅ grep-confirmed |

## Open decisions / blockers

- **Belt-journey held (#178–#181)** — merge blocked on the verification model (see Next session). Not launch-safe
  until: `setPassportRank` gated/marked, per-belt unverified DISPLAY axis (needs an **ADR 0035 amendment**), a
  belt-verify approval path (extend the existing `PassportClaimRequest`/`claim-finalize` queue), and the photo
  soft-gate wired as evidence. Low urgency (pre-launch, 2 users, `setPassportRank` gap is pre-existing in `main`).
- **Flywheel/CRM hardening (deferred, non-blocking pre-launch):** `emitSchoolLead` dedup race → add a partial
  unique index on the normalized school name; atomic `demandCount` increment; scope the fuzzy org-match to
  SCHOOL/placeholder orgs. CRM UX: reorder the two-step invite (Prepare → email/Send), add a board empty state.
- **No nav link** for `/app/leads-pipeline` yet (reachable by URL) — add beside `/app/loop-board`.

## Next session

### Goal

**Belt Journey + verification (land the held belts + make Option-2 real).** Rebase #178–#181 onto `main`; then
**extend the existing claim-approval queue** (`PassportClaimRequest`/`claim-finalize`/`/app/claims`) with a
belt-promotion approval type; gate/mark `setPassportRank`; add a **per-belt unverified DISPLAY axis** (ADR 0035
amendment — decouple the trust badge from a self-declared belt); wire the `RankMilestone` photo (certificate/
instructor) as review evidence. Then apply the held belt UI fixes (country round-trip data-loss, `Hint`→`Note`,
first-run empty state) + the flywheel/CRM hardening above. Inputs: `docs/petey-plan-0477`, SESSION_0483 (held),
the Giddy/Doug/Desi review findings.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0484_TASK_01 | ✅ done | Extracted the BBL Lead Pipeline board standalone onto `main`; verified; PR'd. Belts held for next session. |
