---
title: "SESSION 0598 — PLAN: stand up ronindojodesign.com (apps/rdd) + new-brand onboarding recipe family (rdd)"
slug: session-0598
type: session--plan
status: closed
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
sprint: S12
lane: rdd
recipe: epic-plan
goal_ids: [G-027, G-023]
tickets: []
next_session: docs/sprints/SESSION_0601.md
pairs_with:
  - docs/sprints/SESSION_0593.md
  - docs/sprints/SESSION_0599.md
  - docs/knowledge/wiki/planning-ledger.md
  - docs/protocols/recipes/new-brand-setup.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0598 — PLAN: RDD umbrella app deploy + new-brand onboarding recipe family

> **`/pp` PLAN session (ADR 0049).** Reservation branch `session-0598-rdd-deploy-plan`. **No product
> code, no scaffolding executed.** Deliverables: (1) executable plan to stand up `ronindojodesign.com`
> (apps/rdd), (2) the reusable **new-brand/new-client onboarding recipe-card family** (durable value —
> RDD is exerciser #1), (3) staged build stub. Push held for operator.
>
> **Ran in a dedicated worktree** (`/Users/brianscott/dev/ronin-dojo-app-0598`) — a parallel lane
> (`session-0599-admin-consolidation`) switched the shared canonical checkout mid-session; 0598
> isolated to protect both. See Open decisions.

## Date

2026-07-21

## Operator

Brian + claude-session-0598

## Goal

`/pp` Petey plan → the executable program to stand up **`ronindojodesign.com`** as the RDD
umbrella/agency app (its own `apps/rdd` + DB + deploy + email + env + CI), AND generalize that build
into a reusable **new-brand/new-client intake → onboarding → interview → setup** recipe-card family.
RDD is the first worked example. This session grills + pins the forks; the build runs in follow-on
sessions under **G-027**.

## Inherited pinned (ratified — NOT re-grilled)

- **ADR 0051** — `kernel → brand → app`; RDD = umbrella brand above 7 brands; **app = deploy unit =
  1 Vercel project + 1 DB**. RDD is first-party (owns the kernel), permanent in-repo.
- **PL-005 skin law** = fixed-hue-brand-tint — governs the RDD design interview.

## Grill outcome (research → 5 forks resolved + adds)

Research: `/rr` seq-research-recommend — **Petey** (existing-machinery inventory) + **Giddy**
(architecture / Dirstarter / git+deploy shape), both grounded in the real tree; **Brandon** produced
the RDD business-interview worked example ([`docs/product/rdd/brand-brief.md`](../product/rdd/brand-brief.md)).

1. **Home → `apps/rdd`** (workspace peer, cloned from `apps/baseline`). First-party + permanent →
   `clients/*` handoff-isolation (own lockfile + `file:`-ui-kit Turbopack hack + `link-ui-kit`
   postinstall) buys nothing. Kernel via `workspace:*`, shared root `bun.lock`.
   - ⚠️ **CI is half-dynamic.** `clients-ci.yml` discover picks up `apps/rdd`, but its `on.paths` +
     `ci.yml`/`playwright.yml` `paths-ignore` **hardcode `apps/baseline/**`**. Without **3 one-line CI
     edits** RDD gets **no** Products-CI trigger AND wastefully fires BBL's heavy gate. Required build step.
2. **Separate DB** → own `schema.prisma` + `prisma.config.ts` (copy Mammoth's) + `rdd_dev`, per ADR
   0038. **Isolation proof** = psql table-snapshot diff (BBL `ronindojo_prodsnap` / `mammoth_dev` /
   `baseline_dev` byte-identical; RDD tables only in `rdd_dev`). `migrate dev` OK only for first-init
   of a not-yet-shared `rdd_dev`; hand-author once shared / always in prod.
3. **Email** → own `ronindojodesign.com`-scoped Resend key (`RESEND_API_KEY` +
   `RESEND_SENDER_EMAIL=welcome@ronindojodesign.com`); a cross-brand key silently 403s. Thin
   transactional set at v1 (contact/lead intake); full cutover rides the cloud slice.
4. **Deploy + domain** → new Vercel project (Root Dir `apps/rdd`) + `apps/rdd/vercel.json`
   `ignoreCommand` scoped `apps/rdd packages bun.lock package.json vercel.json` (exclude `*.md`).
   Sensitive-vars-pull-empty → gitignored `.env.prod` overlay + `bun --env-file`. ⚠️ **RDD = first
   `apps/*` peer to actually deploy** (baseline's cloud deferred) → confirm Root-Dir / two-`vercel.json`
   topology on the **live dashboard**.
   - **Domain = `ronindojodesign.com`** (operator-ratified). **ADR 0051 + `ronin-project-context.md`
     conform edit required** (they read `ronindojo.design`) — drift, not a re-grill.
5. **Scope / v1** → **reach = local scaffold only** (build the app locally + CI-green; cloud cutover a
   **separate operator-gated session**); **surface = full**: public marketing/agency/**portfolio** site
   (mission · philosophy · how RDD runs · founder positioning · design/build process · **portfolio
   showcase of the other brands/apps/clients** with stories + testimonials) **+** auth + admin portal
   that **hosts the 7-brand State-of-Dojo umbrella surface**.
   - Consequence: the **State host IS in-scope for the RDD build (built locally)**, just not
     cloud-deployed at v1 — see the cross-lane seam.

**Adds pinned this session:**
- **Mint `G-027`** (NOT G-026 — a parallel lane already took G-026 for `/app` admin-surface
  consolidation) — "RDD umbrella app deploy + new-brand onboarding recipe family." `goal_ids:
  [G-027, G-023]`.
- **Design interview seed (operator)** — RDD's skin **starts from the current State-of-the-Dojo look**;
  that render (`scripts/state-of-project*` + current mock) seeds the ui-kit / design-system **brand
  tokens** for RDD (PL-005 anchor; feeds **G-018** RDD cockpit skin). Design card's RDD worked example
  = "extract tokens from the State-of-Dojo render," not blank-canvas.

## The plan — G-027 program (sequential, NOT a fan-out)

The full surface is multi-session and each slice builds on the prior, so this is a **sequential
program**. Slices (each its own build session, staged one at a time per ADR 0049):

| Slice | Session (staged) | Scope | Gate / done-means |
| --- | --- | --- | --- |
| **A — Scaffold** | `session-0601-rdd-scaffold` (staged this session) | `apps/rdd` off `apps/baseline` (`workspace:*` ui-kit) + hello-route + **the 3 CI edits** | Products-CI green; root gates untouched-or-green; `next build apps/rdd` |
| **B1 — DB** | staged at A close | `schema.prisma` + `prisma.config.ts` + `rdd_dev` + first migration | **isolation proof** |
| **B2 — Auth + State host** | staged at B1 close | Better Auth (own) + admin portal shell on AdminCollection L1 + **State-of-Dojo host mount** | admin gated; State mount renders 0593's data contract |
| **B3 — Marketing + portfolio** | staged at B2 close | public marketing/portfolio pages; showcase content model; RDD skin from design tokens | Desi review; content from the Brandon brief |
| **C — Cloud cutover** | separate **operator-gated** session | Neon + Vercel + domain + Resend + env parity | live shell; RISK-#13 Neon rotation before domain detach |

**Build shape (per slice):** own worktree off `main` (`/worktree-setup`), `recipe: new-brand-onboarding`,
hand-authored migrations past first-init, push-gate `next build` off `git diff origin/main..HEAD`
(capture real `$?`, never `| tail`), one push at close on the operator's word. Owned-file overlap risk
= the 3 shared CI files (+ maybe root `vercel.json`) → RDD scaffold runs **solo**.

## Deliverable 2 — the new-brand/new-client onboarding recipe-card family

Authored this session under `docs/protocols/recipes/`, grounded in **proven** machinery
(`new-client-scaffold.ts` [ran for Mammoth] + `new-client-runbook.md` + `per-app-db-separation.md` +
deploy/Resend runbooks), generalized for first-party (`apps/*`) and client (`clients/*`) brands. RDD =
worked example. Per the abstraction ladder (SOT_Cookbook), these are **rung-2 cards**; the interview
cards are first proven by RDD/0598 — **skill-ify (rung-3) deferred until 2–3 proven runs.**

| Card | Owner | Captures |
| --- | --- | --- |
| `new-brand-setup.md` | Petey | PARENT plan card — composes the family; the phase ladder + fork set |
| `new-brand-intake.md` | Petey | requirements → brief (extends new-client-runbook §1 + `docs/business/leads/`) |
| `new-brand-onboarding.md` | Cody | scaffold + DB + deploy + email (gated step list; `apps/*` vs `clients/*`) |
| `new-brand-interview-design.md` | Desi | brand skin/tokens + design-system fit (PL-005) |
| `new-brand-interview-business.md` | Brandon | model, revenue, entitlements, feature-modules |
| `new-brand-interview-client.md` | Petey/Brandon | client requirements + handoff (for `clients/*`; N/A first-party RDD) |

Each carries a **session-template stub** (`recipe:` key). RDD worked examples: business brief →
[`docs/product/rdd/brand-brief.md`](../product/rdd/brand-brief.md) (Brandon); design brief =
State-of-Dojo token extraction; onboarding = Slice-A step list.

## Uploads — raw assets placed (operator, mid-session)

Operator uploaded 5 docs; placed as raw assets (Brandon `/rr` in flight → integrates into the interview
recipe + seeds G-028):

| Asset | Placed at | Belongs to |
| --- | --- | --- |
| Initial_Client_Meeting_Template.docx | `docs/product/rdd/assets/` | RDD client-onboarding |
| Master_Service_Agreement_Template.docx | `docs/product/rdd/assets/` | RDD client-onboarding |
| NDA_Template.docx | `docs/product/rdd/assets/` | RDD client-onboarding |
| Michaels_Notes_Meeting.md | `docs/product/mammoth-build/assets/` | MMB (G-021) — CRM capture |
| MMB_HubSpot_Reference.pdf | `docs/product/mammoth-build/assets/` | MMB (G-021) — reference |

## Spawned — G-028 (branded onboarding artifacts + interactive forms), own plan session

Operator directive: turn the RDD onboarding templates (Initial Client Meeting / MSA / NDA) — and future
ones — into **branded artifacts + interactive forms** for RDD and other brands/clients; **its own goal +
planning-ledger row + plan session** (do not build here). Proposed: **G-028** + **PL-011** +
`session-0602-rdd-onboarding-forms-plan` (plan-me stub, staged this session).

**Brandon `/rr` (done):** all 3 templates are **blank boilerplate** (safe to commit; TEMPLATE banner +
README added under `docs/product/rdd/assets/`); home = the **client path** (`new-brand-interview-client.md`,
NDA→discovery→MSA+SOW — cards edited); MSA §6.2/6.3 = the ADR 0033 extract-on-handoff / "kernel is the moat"
anchor. **G-028 scope (reuse-first):** admin Client-Onboarding surface (existing authz, no 5th) · template→
typed-form schema · generate+store the branded PDF via the ONE uploader/R2 seam on the leads record ·
typed-name signature first (defer DocuSign). **Operator flags:** confirm the client-path home (Brandon
rec: yes) · authorize the **de-Tableau re-scope** of the template language · a **counsel / ESIGN-UETA gate**
before any generated MSA/NDA is executable · executed (filled) instances never committed to git.

## Cross-lane seam — the `/app` + State-of-Dojo three-way

Three sibling lanes meet at the RDD app; **disjoint plan file-sets**:
- **SESSION_0593** (G-023) — the State-of-Dojo **READ** side (projection + AdminKanban embed + panels + the mount contract).
- **SESSION_0599** (G-026) — the `/app` admin-surface **WRITE** side (landing shell + nav + quick-actions +
  AdminCollection sweep); its G-026 row **already names 0598/RDD as the second consumer** for the
  `packages/ui-kit` shell/quick-action extraction (deferred WS-6).
- **SESSION_0598** (G-027) — the **RDD app** that, at Slice B2, **mounts the State host** and **reuses**
  the 0599 admin shell (once extracted to ui-kit).

Contract: **0598 reserves + builds the State host MOUNT** (apps/rdd); **0593 plans WHAT renders there**;
**0599 owns the reusable shell pattern**. No plan-file collision; the build-time contract meets at the
State host + the ui-kit shell extraction.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0598_TASK_01 | landed | `/rr` research (Petey + Giddy) → 5-fork grill, operator-resolved |
| SESSION_0598_TASK_02 | landed | Home/DB/email/deploy/scope pinned; goal_ids [G-027, G-023] (G-026 was taken) |
| SESSION_0598_TASK_03 | landed | Author `new-brand-*` recipe-card family (6 cards) |
| SESSION_0598_TASK_04 | landed | RDD business-interview worked example (Brandon → brand-brief.md) |
| SESSION_0598_TASK_05 | landed | Place operator uploads as raw assets; Brandon `/rr` → interview-recipe + G-028 |
| SESSION_0598_TASK_06 | landed | Stage Slice-A stub (`session-0601-rdd-scaffold`) + G-028 forms plan stub |
| SESSION_0598_TASK_07 | landed | SOT_Cookbook router row + card-family links |

## Proposed ledger edits (apply at operator-gated merge, post-rebase onto latest main)

Held as proposals — the shared ledgers diverge (this branch's `main` base predates 0599's committed
G-026), so direct-editing them now would collide. Apply after rebasing onto a main that has G-026.

**goals-ledger.md** — append:
- **G-027 — RDD umbrella app deploy (ronindojodesign.com) + new-brand onboarding recipe family.**
  Status: in-progress — P1 (planned SESSION_0598). Objective: stand up `apps/rdd` (own DB/deploy/email/
  env/CI) + generalize the reusable new-brand onboarding recipe family (RDD = exerciser #1). Children:
  `session-0601-rdd-scaffold` (Slice A) → B1/B2/B3/C staged one at a time. Cross-refs: `new-brand-*`
  cards; hosts G-023 State surface; reuses G-026 admin shell; ADR 0034/0038/0051; PL-005 + G-018 skin.
  Lane: rdd.
- **G-028 — Branded client-onboarding artifacts + interactive forms (RDD agency).** Status: proposed —
  own plan session (operator directive SESSION_0598). Objective: brand + make interactive forms of the
  RDD onboarding templates (Initial Client Meeting / MSA / NDA) + future ones, reusable across brands/
  clients; reuse-first (ONE uploader seam, existing form primitives, existing entitlement gating — no
  5th authz). Origin: operator uploads placed under `docs/product/rdd/assets/`. Child:
  `session-0602-rdd-onboarding-forms-plan`. Cross-refs: `new-brand-interview-client.md` + `new-brand-intake.md`; PL-011. Lane: rdd.

**planning-ledger.md** — append:
- **PL-011 — Branded client-onboarding artifacts + interactive forms — queued · own plan (G-028).**
  Origin: operator directive SESSION_0598 (uploaded RDD onboarding templates). Raw assets:
  `docs/product/rdd/assets/{Initial_Client_Meeting_Template,Master_Service_Agreement_Template,NDA_Template}.docx`.
  Own plan-me stub: `session-0602-rdd-onboarding-forms-plan`.

**index.md** — add the SESSION_0598 row (session table) at merge/bow-out.

## Open decisions / blockers

- **Parallel-checkout race (this session).** A sibling lane switched the shared canonical checkout to
  `session-0599-admin-consolidation` mid-session; 0598 moved to a dedicated worktree to avoid clobbering.
  N lanes on 1 checkout will keep racing — recommend worktree-per-lane for concurrent plan sessions.
  (Reinforces the ADR 0049 same-checkout-race memory; candidate FS/incident note at close.)
- **G-number race.** `ledger-id-next --prefix=G` only scans the current working tree, not sibling
  branches — G-027/G-028 are best-effort claims (proposed rows) and need confirming at merge if a
  sibling lane mints the same numbers. SESSION numbers (0601/0602) are claimed via reservation branches.
- **SESSION_0593 reciprocal note.** 0593 is a live parallel lane with an uncommitted edit to its own
  file; 0598 does not touch it. The reciprocal cross-lane note belongs in `SESSION_0593.md` — the 0593
  lane/operator should add it.
- **ADR 0051 + ronin-project-context domain drift** (`ronindojo.design` → `ronindojodesign.com`) — conform at Slice-A build/close.
- **Registrar / Neon account** for `ronindojodesign.com` — not determinable from the tree; resolve at the Cloud (Slice C) session.
- **MMB asset lane-bleed.** Michael's notes + HubSpot ref were placed on the 0598 branch (per the
  operator's "place them now"); they belong to MMB (G-021). Additive raw files, no conflict; flagged for awareness.

## Next session

### Goal

Run **Slice A** — scaffold `apps/rdd` off `apps/baseline` (workspace peer, `workspace:*` ui-kit) with a
hello-route + the 3 CI edits, Products-CI green, root gates untouched. Build-only; no cloud.

### First task

Adopt `session-0601-rdd-scaffold` (staged stub, `recipe: new-brand-onboarding`, `goal_ids: [G-027]`);
follow `new-brand-onboarding.md` Slice-A steps; prove Products-CI picks up `apps/rdd` after the 3 CI
edits; leave DB/auth/surface to B1–B3.

## What landed

- **Plan of record** for `ronindojodesign.com` (`apps/rdd`, G-027): 5 forks researched (Petey+Giddy),
  operator-resolved + pinned; sequential slice roadmap (A scaffold → B1 DB → B2 auth+State-host → B3
  marketing/portfolio → C cloud).
- **New-brand onboarding recipe-card family** (6 cards) + SOT_Cookbook router row; RDD = worked example.
- **Brandon** business-interview worked example → `docs/product/rdd/brand-brief.md`.
- **Operator uploads** placed as raw assets (RDD onboarding templates + sensitivity README; MMB
  notes/HubSpot ref); Brandon `/rr` folded into the client-interview card.
- **Spawned G-028** (branded onboarding artifacts + interactive forms) + staged plan stub `session-0602`.
- **Staged Slice-A build stub** `session-0601-rdd-scaffold`; reservation branches 0601/0602 claimed.
- Committed `c852167e` (17 files, +1170) on the `session-0598-rdd-deploy-plan` worktree.

## Decisions resolved

- Home `apps/rdd`; reach = local-scaffold-first; surface = full (marketing/portfolio + auth + State
  host); domain `ronindojodesign.com`; own DB (ADR 0038); own Resend key. `goal_ids [G-027, G-023]`
  (G-026 was taken by the `/app` admin lane).
- Design seed = current State-of-Dojo look → RDD brand tokens (PL-005).
- Brandon flags **approved by operator**: client-path home for the templates; de-Tableau re-scope
  authorized; counsel/ESIGN-UETA gate required for G-028.
- **Merge (rebase + proposed-ledger application) rides the 0593 merge wave** (operator directive); the
  0593 reciprocal cross-lane note is handled by the operator.

## Reflections

- **Parallel-checkout race, live.** A sibling lane (0599) `git checkout`ed the shared canonical tree
  mid-session, silently moving HEAD off 0598. Caught at the ledger-read before minting; moved to a
  worktree; lost nothing. Concurrent plan sessions must worktree-isolate, not share one checkout.
- **G-number race is a real gap.** `ledger-id-next --prefix=G` only scans the working tree, not sibling
  branches — nearly collided on G-026. Reading the goals-ledger before minting is the only guard;
  captured to the `adr-0049-session-numbering` memory.
- **Read-before-write saved a collision twice** — reading the ledger surfaced the taken G-026 + claimed
  0599/0600 before stale IDs shipped.
- **Mid-session scope add absorbed cleanly** — the uploads/forms ask folded in (placed as assets, `/rr`'d,
  spawned G-028 as its own session) without derailing the plan.

## ADR / ubiquitous-language check

- **ADR update not required** — the plan applies ADR 0034/0038/0051 as-is. **Conform edit owed
  (deferred to Slice-A build):** ADR 0051 + `ronin-project-context.md` read `ronindojo.design`; ratified
  domain is `ronindojodesign.com`.
- **New term:** "new-brand onboarding recipe family" (`new-brand-*` cards) — in SOT_Cookbook; add to
  ubiquitous-language at the merge wave if it earns a glossary line.

## Deferral-guard dismissals

`bun scripts/deferral-guard.ts` flagged 3, all justified dismissals: L78 "baseline's cloud deferred"
(scope note, existing ADR 0038 state) · L123 "skill-ify deferred until 2–3 runs" (abstraction-ladder
doctrine, SOT_Cookbook-documented) · L173 "ui-kit extraction WS-6" (tracked in G-026 sibling + G-027
proposed; resolves when the proposed rows land at the merge wave).

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | 6 cards + brand-brief + assets README frontmatter authored; SOT_Cookbook router-row add only |
| Backlinks/index sweep | SOT_Cookbook router row links all 6 cards (reciprocity ✓); brand-brief→SESSION_0598, README→client-interview. **index.md session row deferred to merge wave** |
| Wiki lint | **Not run — worktree unbootstrapped (no node_modules); runs at the 0593 merge-wave gate ladder** |
| Kaizen reflection | yes (## Reflections) |
| Hostile close review | plan-session self-review below; build slices get their own review waves |
| Code-quality gate (Class-A) | n/a — docs/governance only, no custom code |
| Runtime verification (Doug) | no runtime surface touched |
| Evidence-artifact URL | n/a — no runtime surface |
| Review & Recommend | yes — Next session = Slice A (`session-0601`) |
| Memory sweep | updated `adr-0049-session-numbering` with the G-number-race gap |
| Next session unblock check | unblocked — `session-0601` stub staged, `recipe: new-brand-onboarding`, concrete first task |
| Git hygiene | worktree `ronin-dojo-app-0598`, branch `session-0598-rdd-deploy-plan`; single push — hash at bow-out / see git log |
| Graphify update | skipped — worktree unbootstrapped + docs-only; merge wave refreshes on canonical |

## Hostile close review

Plan-session self-review (no code shipped; full Giddy/Doug waves attach to the build slices):
- **Plan sanity** ✓ — sequential slice roadmap, each slice independently gated; the two build-critical
  catches (3 CI edits · first `apps/*` deploy) are encoded, not lost.
- **Dirstarter alignment** ✓ — reuse-first (`apps/*` peer, ui-kit L1, existing authz/uploader/leads);
  no god-component, no 5th authz.
- **Disjointness** ✓ — plan file-sets disjoint from 0593/0599; the three-way seam (State host mount /
  read projection / ui-kit shell) is contracted.
- **Verification honesty** — wiki:lint/graphify **not run** (worktree unbootstrapped); explicitly
  deferred to the merge-wave ladder, not claimed green.
- **Score: 9.0/10** — clean plan + durable recipe family; −1 for gates deferred off-session (operator
  design, but a real gap until the merge wave runs them).
