---
title: "SESSION 0535 — FI-028 community-posts freemium ladder (create gate + MAB action)"
slug: session-0535
type: session--plan
status: in-progress
created: 2026-07-13
updated: 2026-07-13
last_agent: claude-session-0535
sprint: S53
pairs_with:

  - docs/sprints/SESSION_0534.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0535 — FI-028 community-posts freemium ladder (create gate + MAB action)

## Date

2026-07-13

## Operator

Brian + claude-session-0535

## Goal

**FI-028 — the community-posts freemium participation ladder** (SESSION_0529 grill Q2/Q3, operator-ratified;
spec in `POST_LAUNCH_SOT.md` FI-028). Tighten community-post CREATE from "any signed-in member" to **Premium ∨
Elite ∨ Legend ∨ staff ∨ RBAC** via a new `canCreateCommunityPostForUser` (mirror `canCreateTechniqueForUser`
— no 5th authz), enforced at the SERVER/action (payload) layer with adversarial negative tests FIRST; free
members see an upgrade CTA where the composer was; restore 1-tap create for MAB holders via a member "post" MAB
action. **PLAN-FIRST** — grill the open forks (scope of read-gating, gate placement, entitlement-key breadth,
free-user experience, grandfathering) and get operator sign-off BEFORE any build.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0534.md` (FS-0031 seed-shape hardening + AdminCollection
  ecosystem drain; closed + pushed to `origin/main` @ `1b41fe80`, fully green).
- Carryover: SESSION_0534's `Next session` flagged FI-028 as the alternative lane needing its OWN grill. The
  AdminCollection ecosystem is drained; FI-028 is the operator's chosen lane for this session.

### Branch and worktree

- Branch: `session-0535-fi028`
- Worktree: `/Users/brianscott/dev/ronin-0535` (off `origin/main` @ `1b41fe80`)
- Status at bow-in: clean (fresh worktree; bootstrapped via `/worktree-setup` — copied `.env` + `bun install`
  [756 pkgs] + `prisma generate` → `.generated/prisma`).
- Current HEAD at bow-in: `1b41fe80`
- ⚠ CONCURRENCY: a sibling session (0536) runs RISK #2 (CSP/security headers) in `../ronin-0536` — disjoint
  from posts. If FI-028 needs middleware/security-header/`next.config` edits, STOP and coordinate. This lane
  stays in the posts/entitlements surfaces.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth/authz (entitlement gating) — reuses the established tier/entitlement seam, no L1 baseline delta |
| Extension or replacement | Extension: a new `canCreateCommunityPostForUser` composing the three existing authz seams (`can()` ∨ staff `Membership` ∨ lineage-tier entitlement), exactly mirroring `canCreateTechniqueForUser` |
| Why justified | The participation ladder (Premium = community posting) is a ratified product decision; no new capability, no 5th authz system |
| Risk if bypassed | A UI-only gate leaves the server action open — any signed-in member could still POST via the action. Server/payload enforcement is the whole point |

Live docs checked during planning: SESSION_0534, `POST_LAUNCH_SOT.md` (FI-028 row), SESSION_0530 (FI-028
spec block), ADR 0046, memories `bbl-membership-tier-model-0472` / `profile-media-freemium-model-0525` /
`technique-authoring-ownership-adr-0046`.

### Graphify check

- Query: `graphify query "community post create composer entitlement premium gate CommunityPost /posts feed"`
  (canonical checkout — worktree graph is empty by design). Seed nodes → `create-community-post-dialog.tsx`,
  Petey Plan 0493 (community feed). Opened exactly: `server/web/community/{actions,schema,queries}.ts`,
  `components/web/community/{community-feed,create-community-post-dialog}.tsx`,
  `server/web/techniques/{permissions,technique-access}.ts`, `components/web/nav/mab-mount.ts`,
  `lib/entitlements/lineage-comp.ts`, `server/web/entitlements/lineage-tier-policy.ts`, `app/(web)/posts/page.tsx`,
  `.generated/prisma/models/CommunityPost.ts`.

### Grill outcome

- Grill presented to operator (see `## Petey plan → Open decisions`). **Build HELD pending operator answers.**

### Drift logged

- None new at bow-in. Pre-existing feed-dedup drift (D-035, D-037) is not a blocker for the create-gate lane.

## Petey plan

### Goal

Ship the community-posts CREATE gate (`canCreateCommunityPostForUser`, server-enforced) + composer upgrade-CTA
+ member "post" MAB action, behavior-tightening (free members lose create), proven by adversarial negative
tests at the action layer FIRST. Per-post READ freemium-gating is a scope FORK for the grill (see Open
decisions Q1).

### Tasks

_Tasks are provisional pending the grill. The likely shape (if the grill resolves as recommended):_

#### SESSION_0535_TASK_01 — `canCreateCommunityPostForUser` + server-layer create gate + negative tests

- **Agent:** Cody (build + self-verify) → Doug (adversarial authz verify)
- **What:** new gate helper mirroring `canCreateTechniqueForUser`; wire into `createCommunityPost` +
  `uploadCommunityPostImage` actions; unit + e2e negative tests (free/anon cannot create) authored FIRST.
- **Done means:** a free-tier and an anon request to the create action are REJECTED server-side; a
  Premium/Elite/Legend/staff/admin request succeeds; tests green.

#### SESSION_0535_TASK_02 — Composer upgrade-CTA (free-user experience) + MAB member "post" action

- **Agent:** Cody (build) → Desi (UX) + Doug (verify)
- **What:** free signed-in members see an upgrade CTA instead of the composer form; add the member "post" MAB
  fan action (restores 1-tap create after the SESSION_0529 FAB de-collision), gated by the same predicate.
- **Done means:** free member sees CTA (no composer); Premium+ sees composer; MAB "post" action appears for
  create-capable viewers only; no double-FAB.

### Parallelism

Sequential: TASK_01 (the server gate + tests) FIRST — it is the security core and gates how TASK_02 is
verified. TASK_02 (UI/CTA/MAB) builds on the resolved predicate. Single coherent Cody per task; review wave
(Doug authz + Desi UX) after each. No fan-out (surfaces are contiguous).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0535_TASK_01 | Cody → Doug | server-layer authz gate; verify demands adversarial negative tests (free/anon rejected) |
| SESSION_0535_TASK_02 | Cody → Desi + Doug | UX of the free-member CTA + the MAB action; parity + no-regression |

### Open decisions

**The grill — build HELD until the operator answers.** Recommendations grounded in code are in the bow-out
chat / the AskUserQuestion presented to the operator.

1. **[SCOPE] Read-gating in or out?** `CommunityPost` has NO `isPremium` field; the read path is public
   (`status:PUBLISHED` only). Per-post freemium READ-gating (locked-post display + per-post premium setter +
   no-leak payload) needs an additive migration + a product reason a post is "premium." **Recommend: SPLIT** —
   ship CREATE gate + MAB + CTA this session (no migration); defer READ-gating to FI-028b.
2. **[GATE PLACEMENT]** Enforce in the server action (`createCommunityPost` + `uploadCommunityPostImage`), not
   just the UI. **Recommend: server-action layer, negative tests FIRST** (operator directive).
3. **[ENTITLEMENT KEYS]** Paid Elite/Legend keys depend on `PricingPlan.entitlementGrants` config (not
   code-guaranteed to include `LINEAGE_PREMIUM`). **Recommend: gate on ANY lineage-tier key**
   (`LINEAGE_PREMIUM` ∨ `ELITE` ∨ `LEGEND`, reusing the tier-policy key set) — robust to plan config; not a
   single-key check.
4. **[FREE-USER UX]** What replaces the composer for free signed-in members. **Recommend: upgrade CTA in the
   dialog** (mirror the `LoginDialog` swap pattern already in the composer) pointing at the membership/upgrade
   funnel.
5. **[GRANDFATHERING]** Existing free-authored posts on downgrade. **Recommend: grandfather** — create-gate is
   forward-only; existing posts stay published, authors keep edit/delete of their own; no retroactive hide.
   (Prodsnap = 0 paid subs and few/zero community posts → near-zero real data impact.)

### Risks

- **UI-only-gate trap:** hiding the composer button without gating the action leaves the write open. Mitigated
  by TASK_01's server enforcement + adversarial tests as the FIRST deliverable.
- **Entitlement-key breadth:** a single-key (`PREMIUM`-only) check could wrongly deny a paid Elite whose plan
  grants only the `ELITE` key. Mitigated by the any-tier-key recommendation (Q3).
- **MAB fan geometry:** adding a 6th MAB action must respect the 90° quadrant cap + radius count-scaling
  (`shouldMountMab` invariants). Mitigated by reusing the existing fan-action pattern.

### Scope guard

- Behavior change is INTENTIONAL and singular: free members lose community-post CREATE. Everything else
  behavior-preserving. No god-component. No 5th authz — compose the existing seams.
- FI-001 / Brian Truelson email STAYS PARKED. `../ronin-dojo-monorepo` READ-ONLY. Hand-authored migrations
  only (relevant only if Q1 resolves read-gating IN). No middleware/security-header/`next.config` edits (0536's
  turf). No push/deploy without explicit operator "go" (build → verify → show → HOLD).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0535_TASK_01 | pending | `canCreateCommunityPostForUser` + server-layer create gate + negative tests |
| SESSION_0535_TASK_02 | pending | Composer upgrade-CTA + member "post" MAB action |
