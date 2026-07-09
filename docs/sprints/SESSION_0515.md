---
title: "SESSION 0515 — AdminCollection conformance lane + launch-for-Brian gate plan"
slug: session-0515
type: session--open
status: in-progress
created: 2026-07-08
updated: 2026-07-08
last_agent: claude-session-0515
sprint: S-launch
pairs_with:

  - docs/sprints/SESSION_0514.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0515 — AdminCollection conformance lane + launch-for-Brian gate plan

## Date

2026-07-08

## Operator

Brian + claude-session-0515

## Goal

Get `blackbeltlegacy.com` launch-SOLID for the FI-001 first tester (Brian Truelson). LEAD with the
CONFORMANCE lane (WL-P2-34 AdminCollection conformance + WL-P2-35 People Passport-keyed editor) — it
de-sprawls the admin onto ONE surface (the 500-session north star) AND hardens the exact tools used to
onboard Brian (People editor, claims, org, leads). Then plan/sequence the remaining launch-gate lanes
for operator sign-off (build in later sessions). Petey plans + grills the open forks; Cody builds; Doug
verifies; 3-pass gauntlet on the diff. The Brian email is HELD until the full gate is green and the
operator says "send."

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0514.md`
- Carryover: SESSION_0512/0514 merged WL-P2-36 (#196) + item-5 Stage 1 (#195) + durable email claim
  links (#197). The 3-pass gauntlet (fallow-fix-loop + Doug bug-hunt + hostile-close) is the pre-merge
  bar. This session executes the conformance lane the Next-session block pinned.

### Branch and worktree

- Branch: `main` (fresh worktree to be created off `origin/main` per standing rules)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `63f90db3`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Admin data-table kit (`components/data-table/*`), theming (via /app surfaces), Prisma (read queries) |
| Extension or replacement | Extension: `AdminCollection` wraps the existing `components/data-table/*` L1 kit + the `/app/tools` pattern; conform hand-rolled `*-table.tsx` wrappers onto it |
| Why justified | ADR 0045 D1/D5 — one admin-surface frame, conform incrementally; behavior-preserving |
| Risk if bypassed | Continued admin sprawl (~21 hand-rolled kit pages + non-kit stragglers) — the exact drift the operator's north star kills |

Live docs checked during planning: ADR 0045, ADR 0025 (Passport SoT), admin-collection-one-surface-law memory.

### Graphify check

- Graph status: current (canonical checkout). Discovery this bow-in used direct route inventory
  (`find app/app -name '*-table.tsx'`) since the surface set is a known, enumerable directory list.
- Files selected: `components/admin/admin-collection.tsx` (the frame), `app/app/users/_components/people-table.tsx`
  (the sole existing consumer / exemplar), the 21 hand-rolled `*-table.tsx` wrappers, the non-kit
  stragglers (`/app/media`, `/app/organizations`, `/app/claims`, `/app/leads-pipeline`).

### Grill outcome

Open forks surfaced for operator sign-off before Cody builds — see `## Petey plan → Open decisions`.

## Petey plan

### Goal

Execute the AdminCollection conformance lane (a coherent batch) + the People Passport-keyed editor, and
produce the sequenced launch-for-Brian gate plan for operator sign-off.

### Tasks

#### SESSION_0515_TASK_01 — WL-P2-34 AdminCollection conformance (onboarding stragglers)

- **Agent:** Cody → Doug → 3-pass gauntlet
- **What:** Migrate the three non-kit onboarding stragglers — `/app/claims`, `/app/organizations`,
  `/app/leads-pipeline` — onto the `AdminCollection` frame (columns + query; row→detail→one editor).
- **Done means:** Each page renders via `AdminCollection<TData>` (no hand-rolled list/grid/gallery);
  behavior-preserving (same rows, filters, actions, row→detail); affected admin e2e green.
- **Depends on:** nothing.

#### SESSION_0515_TASK_02 — WL-P2-35 People Passport-keyed editor

- **Agent:** Cody → Doug → 3-pass gauntlet
- **What:** Re-key `/app/users/[id]` userId→passportId; reuse+generalize the canonical `PassportEditor`
  via a gated `updatePassportAsAdmin` (adminActionClient, `where passportId`) + an admin-only
  `AccountSection` (role/ban/grants, gated when `passport.userId == null`). Keep `/app/users` (defer
  `/app/people` rename); placeholder-Passport delete OUT of scope.
- **Done means:** `/app/users/[id]` edits through the one PassportEditor for accountless + account People;
  account-only actions gated; ADR 0045 D3 follow-up satisfied.
- **Depends on:** nothing (file-disjoint from TASK_01; run sequentially in one worktree).

#### SESSION_0515_TASK_03 — WL-P2-37 profile /me + /directory consolidation (TICKET-0502-A)

- **Agent:** Cody → Doug → 3-pass gauntlet
- **What:** Merge `/me` + `/directory/[slug]` onto ONE profile renderer + read model; delete dead
  `directoryProfilePreviewPayload`/`previewRankToPublicRank`; preserve tier-gated render (free basic vs
  premium rich per `canRenderProfile`/`canRenderRichMedia`).
- **Done means:** One renderer feeds both surfaces; paywall e2e proves identical tier-gated render;
  Brian's profile renders COMPLETE. **In-scope per operator (bow-in grill).**
- **Depends on:** TASK_02 (People editor surface settles first).

#### SESSION_0515_TASK_04 — Launch-for-Brian gate plan (Petey, planning only)

- **Agent:** Petey (done — see `## Launch-for-Brian gate` below)
- **Done means:** Sequenced gate A–E + critical path + forks F1–F6 delivered for operator sign-off.

### Grill outcome (2 forks resolved)

1. **WL-P2-34 batch = onboarding stragglers** (`/app/claims`, `/app/organizations`, `/app/leads-pipeline`).
   Rationale: highest launch value (the exact admin tools to onboard Brian); non-kit → build columns+query
   fresh. Operator chose this over the cheap kit-swap batch.
2. **WL-P2-37 IN scope** this session (operator pulled it in — profile is the funnel asset Brian lands on).

### Open decisions

- Conformance execution is authorized this session; only push / PR merge / deploy / email-send are HELD
  for the operator's explicit "go".
- Gate-plan forks **F1–F6** (below) await operator sign-off — they gate LATER-session builds, NOT this
  session's conformance execution.

### Scope guard

- No push / PR merge / deploy / email-send without explicit operator "go".
- Behavior-preserving conformance only; no new capabilities bolted onto migrated tables.
- WL-P2-35: placeholder-Passport delete + `/app/people` rename OUT of scope.
- `../ronin-dojo-monorepo` READ-ONLY.

## Launch-for-Brian gate (TASK_04 — Petey, awaiting operator sign-off)

Gate = Brian's onboarding email does NOT send until every item is GREEN or explicitly waived. TASK_01–03
(conformance) assumed landing, not re-planned here. Ground truth: FI-001 is prod-verified green except the
operator "send" word; the Truelson thank-you script already uses the durable-link pattern
(`send-bbl-truelson-thankyou.ts:365`) — so Brian's send is NOT blocked on the #197 follow-ups.

### Critical path (now → "operator can say send")

1. **RISK #13** — rotate exposed prod Neon credential (hard prereq: no external user before rotation).
2. **WL-P2-37** — profile render complete (done in this session as TASK_03).
3. **FI-002 + #197 durable-link follow-ups** — lifecycle copy audit @ DRYRUN=0 (staged) + convert guest
   paid-checkout confirm email + admin invite composer onto the durable-link pattern.
4. **FI-001 rehearsal** — full loop green on a throwaway account (`--backfill`→`--send`→sign-in
   auto-claim→`--grant` lifetime Elite→2 entitlements + complete profile).
5. **Desi E sweep** — public surfaces clean (home, join/claim, directory, lineage, profile, checkout).
6. → operator says "send" → run `send-bbl-truelson-thankyou.ts` loop.

### Sequenced gate (by dependency)

- **D (security-first):** `RISK #13` rotate Neon cred (do first) · `RISK #7` PII/log-leak guardrail
  (launch-blocking, cheap) · `RISK #8` payment/access drift (manual spot-check acceptable) · `RISK #6`
  private-media boundary (deferrable-with-guardrail — not in Brian's flow) · `WL-P2-33` authz sign-off
  (sign-off in-gate; migration out).
- **A (Brian's data):** `WL-P2-21` verify canonical `rigan-machado-lineage` is Brian's sole published
  home on live prod (data already correct — clones removed 0508/0457; admin CRUD OUT of gate) ·
  `WL-P2-37` profile complete (this session).
- **C (email/signup):** `FI-002` copy audit @ DRYRUN=0 (staged) · `#197-followup` guest-checkout confirm
  → durable link · `#197-followup` admin invite composer → durable link · `FI-003` student sign-up +
  claim-approval · `FI-004` admin composer parity (possibly OUT — see F5).
- **B (onboarding):** `FI-001/G-001` rehearsal green end-to-end before any real send.
- **E (public QA):** Desi sweep — final gate before send.

### Forks awaiting operator sign-off (Petey recommendations)

- **F1 — RISK #13 blocker or parallel?** Rec: hard prereq for the SEND, not for build work — rotate early
  (cheap), build in parallel against prodsnap.
- **F2 — Which of #6/#7/#8 launch-blocking?** Rec: #7 blocking (cheap guardrail); #8 blocking-lite
  (documented manual spot-check ok); **#6 deferrable-with-guardrail** (not in Brian's flow) — *confirm defer*.
- **F3 — FI-002 DRYRUN=0 staged?** Rec: yes — dry-run copy render → flip to rehearsal address only → then
  real member traffic. Don't flip global live-send + Brian send in one step.
- **F4 — WL-P2-33 sign-off vs migration in-gate?** Rec: sign-off in-gate, staged migration OUT (char-tests
  hold the line; rushed pre-launch migration riskier than status quo).
- **F5 — FI-004 admin composer in-gate?** Rec: OUT unless Brian is sent via the composer — *confirm send
  channel* (default: the dedicated durable-link script).
- **F6 — WL-P2-21 admin branch/subtree CRUD?** Rec: OUT — data already correct; gate item = *verify on live
  prod*, not *build the CRUD*.

### Explicitly OUT-of-gate

WL-P2-21 admin CRUD · WL-P2-33 staged migration · RISK #6 signed-URL architecture · RISK #8 nightly audit ·
FI-004 composer/mobile/BBLApp port · MB staging/multi-domain · long-tail P3 / RISK #9–12 · re-send "The Long
Road" to Bob (separate operator-gated outbound).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0515_TASK_01 | in-progress | WL-P2-34 conformance: /app/claims + /app/organizations + /app/leads-pipeline onto AdminCollection |
| SESSION_0515_TASK_02 | pending | WL-P2-35 People Passport-keyed editor |
| SESSION_0515_TASK_03 | pending | WL-P2-37 profile /me + /directory consolidation |
| SESSION_0515_TASK_04 | landed | Launch-for-Brian gate plan (Petey) — awaiting operator sign-off on F1–F6 |

## Next session

### Goal

TBD at bow-out.

### First task

TBD at bow-out.
