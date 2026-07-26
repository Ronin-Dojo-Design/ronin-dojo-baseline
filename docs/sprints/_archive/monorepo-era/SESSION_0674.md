---
title: "SESSION 0674 — brand-scoped state surfaces (SotD=BBL-only, SotB=MMB-only) — verify-first vs frozen kernel (auto lane, wave 11/12)"
slug: session-0674
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0674
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0674 — brand-scoped state surfaces (SotD=BBL-only, SotB=MMB-only) — verify-first vs frozen kernel (auto lane, wave 11/12)

> Staged by the SESSION_0635 orchestrator (waves 11+12, operator-directed). Adopted; branch
> `auto/session-0674-state-brand-scoping` (base: main). **Decision branch taken: 2 — BUILD**
> (zero frozen-file edits).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

brand-scoped state surfaces (SotD=BBL-only, SotB=MMB-only) — verify-first vs frozen kernel.

## Verify-first evidence (contract findings, file:line)

| # | Finding | Evidence |
| --- | --- | --- |
| 1 | Frozen contract has NO brand prop and forbids adding one — the only panel prop is `compact?` | `apps/web/components/app/state-of-dojo/_kernel/contract.ts:24-36` ("Do NOT widen this type per-panel") |
| 2 | `StatePanel` builds tabs from `VISIBLE_BRAND_SKINS`; no wrapper-pinnable tab mechanism (`BrandTabs` `defaultValue` is internal) | `state-panel.tsx:66`, `_kernel/projection.tsx:266` |
| 3 | Deploy-scope switch already exists: `VISIBLE_BRAND_SKINS` = BBL-only unless `NEXT_PUBLIC_SOTD_ALL_BRANDS=true`; `DEPLOY_BRAND_KEY="bbl"` | `_kernel/phase.ts:104,113-116` |
| 4 | BUT the env-scoped single-brand collapse still leaks cross-brand data: masthead totals count ALL lanes; Risk-watch/Needs-you are cross-brand by protocol (unfiltered sessions/goals; risk rows carry no lane facet) | `state-panel.tsx:93-97,115,149-150`; `apps/web/lib/state-of-dojo/fetch-state.ts:70-71` |
| 5 | The kernel's exports ARE the public composition vocabulary — panels are built "by composing these SAME pieces" | `_kernel/projection.tsx:1-8` module doc |
| 6 | The feed + parse layer is NOT frozen and lane-faceted (`SessionDetail.product` / `GoalDetail.product: ProductLane`) | `apps/web/lib/state-of-dojo/parse.ts:19,35,56`; `fetch-state.ts:144` |
| 7 | Single-panel `BrandTabs` renders the tab-less brand-tinted wrapper (`data-brand` + `--sotd-accent`) | `_kernel/projection.tsx:250-264` |
| 8 | `/app/*` is `requireUser()`-gated at the layout; the state route has no extra admin gate | `apps/web/app/app/layout.tsx:20` |
| 9 | No e2e touches `/app/state` / StatePanel (no aria/test-id rename risk; nothing renamed anyway) | `grep -rn "app/state\|StatePanel" apps/web/e2e/` → no matches |
| 10 | `NEXT_PUBLIC_SOTD_ALL_BRANDS` unset in worktree AND canonical `.env`/`.env.local`/`.env.prod` → the multi-brand tabs the operator sees are a Vercel-env property | env greps, both checkouts |

## Decision + rationale

**Branch 2 — BUILD, route-layer composition, zero frozen edits.** A brand prop on the panel is
contract-forbidden (finding 1), but findings 5-7 make a route-owned composition first-class: a new
`/app/state/[brand]` segment validates against `VISIBLE_BRAND_SKINS` (the ONE deploy-scope decision
point — finding 3, honored not bypassed) and a route-local `BrandStatePanel` self-fetches the
non-frozen feed, filters to ONE lane, and composes the frozen kernel exports unchanged. This also
fixes what the env flag alone cannot (finding 4): the scoped route's masthead counts are
brand-scoped and the cross-brand Risk-watch/Needs-you feeds are omitted (not mis-scoped — risk rows
have no lane facet). `/app/state` itself is untouched.

Result: on the BBL prod deploy `/app/state/bbl` renders ONLY BBL (Tony's link) and every other
brand's route 404s; on the operator's all-brands env, `/app/state/mmb` gives an MMB-only
"State of the Building" view (masthead + neutral labels via the frozen `MASTHEAD_TITLE` /
`skin.belts` vocabulary) and `/app/state/rdd` an RDD-only view.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0674_TASK_01 | done | Verify-first vs frozen kernel → decision 2 (build); `/app/state/[brand]` + `BrandStatePanel`; gates + authed smoke; MMB live-surface spec note |

## What landed

- `/app/state/[brand]` — brand-scoped State-of-Dojo route: validates the segment against
  `VISIBLE_BRAND_SKINS` (unknown/out-of-scope brand → `notFound()`), owns placement, per-skin
  metadata title.
- `BrandStatePanel` (route-local) — contract-shaped (named export, self-fetching async RSC,
  placement-agnostic, owns Suspense + empty state) but NOT one of the four contract panels; filters
  the feed to one lane; composes frozen `BrandTabs`/`WorkBoard`/`GoalLadders`/`GoalLadderTable`/
  `ProjectionSection`/`PanelSkeleton` unchanged; omits cross-brand feeds by design.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/app/state/[brand]/page.tsx` | NEW — brand-scoped route segment |
| `apps/web/app/app/state/[brand]/brand-state-panel.tsx` | NEW — route-local composition of the frozen kernel |
| `docs/sprints/SESSION_0674.md` | session record |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `bun run typecheck` (apps/web) | exit 0 |
| `bun run lint:check` (apps/web) | exit 0 (warnings pre-existing, none in new files) |
| `bun run format:check` (apps/web) | exit 0 |
| `npx next dev --turbo -p 3151` + `GET /app/state`, `/app/state/bbl` unauthenticated | 307 → login (expected, `requireUser`) |
| `GET /api/auth/dev-login` (local, read-only) | session cookies issued (works despite stripped `RESEND_API_KEY` — send failure non-fatal locally) |
| `GET /app/state/bbl` authed | 200 — masthead "State of the Dojo", "BBL · 29 sessions · 8 goals", exactly one `data-brand="bbl"`, belt words render, **0** "Risk watch"/"Needs you" matches |
| `GET /app/state/mmb` authed | 404 (deploy-scope law: flag unset → only BBL visible) |
| `GET /app/state` authed | 200 unchanged (Risk watch present, single-brand collapse as before) |

## MMB live state surface — spec-only proposal (no build)

The client app (`clients/mammoth`) has no live state surface; the static State-of-the-Building
(unmerged #298) is already MMB-only. The kernel was designed for a per-deploy override — this is
cited, not inferred: `_kernel/phase.ts:100-104` ("a future MMB deploy overrides to `'mmb'`"),
`phase.ts:133-134` (`CURRENT_DEPLOY_SKIN` → `"building"`), and the parse core is pure/source-agnostic
(`lib/state-of-dojo/parse.ts` — pure functions over file content; `fetch-state.ts` reads GitHub
`main`, deploy-agnostic, token optional). Path:

1. **Now (already shipped by this session):** the all-brands internal deploy serves
   `/app/state/mmb` — an auth-gated MMB-only live view for the operator, no further work.
2. **Later (operator-gated epic):** extract the SotD kernel (`_kernel/*` + the parse core) to
   `packages/ui-kit` per the kernel-extraction law (ADR 0040 Option B); the Mammoth app then mounts
   its own `StateOfBuildingPanel` with `DEPLOY_BRAND_KEY="mmb"` + `CURRENT_DEPLOY_SKIN="building"`,
   keeping the frozen panel-contract shape. Feed source stays the same `main` ledgers initially;
   swap to MMB-own sources later behind the same `StateFeed` type. No kernel API change needed —
   only the extraction move itself.

## Proposed ledger edits

- None required. (No frozen files touched; no drift/wiring/incident found. The new route is
  route-local composition — not a common component, so no custom-component-inventory row.)

## Open decisions / blockers

- None blocking. Prod-env check delegated to AM merge (below).

## Residual for AM merge

- **Tony's access path:** `/app/state/bbl` is behind the `/app` layout's `requireUser()`
  (`apps/web/app/app/layout.tsx:20`) — any signed-in account works; there is NO extra admin gate on
  this route. Tony therefore needs a BBL account (magic-link sign-in) and the link
  `blackbeltlegacy.com/app/state/bbl`. **If Tony should view WITHOUT an account, a share-link/token
  mechanism is a new, operator-gated build — flagging it; nothing shipped here covers it.**
- **Prod env check before sharing:** verify the BBL Vercel project does NOT set
  `NEXT_PUBLIC_SOTD_ALL_BRANDS=true` (it's unset in every local env file; the operator's multi-brand
  tabs imply it's set SOMEWHERE — likely a Vercel env). If prod had it set, `/app/state` would tab
  across brands and `/app/state/rdd|mmb` would resolve on the customer deploy — the flag must stay
  off on BBL prod for the single-brand law to hold.
- Dev-server smoke was local-only; no build was run (per lane constraints) — CI on the PR is the
  authoritative gate.
