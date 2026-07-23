---
title: "SESSION 0634 — CRM as a kernel feature-module (brand-agnostic, all brands)"
slug: session-0634
type: session--plan
status: staged
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0624
sprint: S12
lane: repo
recipe: ""
goal_ids: ["G-021", "G-002"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0624.md
  - docs/knowledge/wiki/goals-ledger.md
  - docs/architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0634 — CRM as a kernel feature-module

> **Pre-staged stub (ADR 0049), staged by [SESSION_0624](SESSION_0624.md).** Operator-directed at the 0624
> bow-out: *"Let's get back to the CRM goal for all brands (this is kernel based, so all brands can use
> it)."* Adopt at bow-in: flip `staged` → `in-progress`, run the canonical-occupancy check.

## Operator

Brian + <agent>-session-0634

## Goal

Resume the **CRM lane at the kernel level** — as a **brand-agnostic feature-module** any brand's app can
mount, not a Mammoth-only surface. Per [ADR 0051](../architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md)
and CLAUDE.md's North Star, `leads/CRM` is explicitly named as one of the kernel's feature-modules; the
kernel + the module library are the moat. Mammoth is where CRM was *proven*, not where it *belongs*.

## ⚠ Read this before planning — the goal row does not exist yet

There is **no kernel-level CRM goal** in [`goals-ledger.md`](../knowledge/wiki/goals-ledger.md). Verified at
SESSION_0624 close: the ledger has 31 goals (G-001…G-031); the CRM-adjacent ones are

- **[G-021](../knowledge/wiki/goals-ledger.md)** — *Mammoth lean operating shell + sales-cockpit tracer*
  (in-progress, P1). This is the **implementation** — Today queue → lead roster → contact workspace →
  Contact Attempt → one owned/due Next Action, on Mammoth's own DB. Lead-sheet import landed SESSION_0582.
- **G-002** — per-product DB separation (ADR 0038); phase 1 scaffolded Mammoth as the
  "HubSpot-replacement CRM core" on `mammoth_dev`.

So **the operator's "the CRM goal for all brands" is a goal that needs minting, not one to look up.**
Do not silently widen G-021's scope to mean this — G-021 is a Mammoth product goal with its own progress
log and next slice, and quietly turning it into a kernel goal would lose both threads.

**First decision of this session (grill it, don't assume):** mint a **new kernel goal** (proposed
**G-032** — confirm with `bun scripts/ledger-id-next.ts --prefix=G` **and** re-read the ledger, because the
`G` mint only scans the current working tree, not sibling branches — see the G-number race note in
`adr-0049-session-numbering`), *or* extend an existing goal, *or* park it as a PL row until the extraction
shape is known.

## Next session

**Task — plan (do not build yet) the CRM kernel-extraction lane.**

1. **Grill the open forks first** (`/pp` or `/ppp`, per ADR 0052 D1) — this is a Plan lane, not a Build lane:
   - **What is the module boundary?** Which of `Lead`, `Contact`, `Deal/Engagement`, `ContactAttempt`,
     `NextAction`, `Activity` are genuinely brand-agnostic, and which are Mammoth's sales vocabulary?
   - **Where does it live?** `packages/ui-kit` is the current kernel package and is UI-shaped. A CRM module
     is UI **+ schema + server actions** — so does the kernel need a second package (e.g.
     `packages/crm`), and what does that do to the standalone-`bun` `file:` + postinstall-symlink
     arrangement in `separation-separate-dbs-per-product`?
   - **Schema, given ADR 0038.** Every app has its **own DB**. A shared feature-module therefore ships a
     *schema contract* (Prisma models each app migrates into its own DB), not a shared table. Is that the
     intent, and who owns the migration when the module's schema changes?
   - **Which brand consumes it second?** A module extracted against exactly one consumer is a rename, not a
     kernel. Naming the second consumer (BBL? Baseline/White-Labeled Dojo? RDD agency, cf. G-028's
     `ClientEngagement`?) is what makes the abstraction honest — and G-027's RDD lane already wants
     CRM-shaped client tracking.
   - **Does this collide with G-028?** That goal's grill already asked whether RDD should get a new
     `ClientEngagement` model or *"extend/pull the Mammoth CRM contact/deal SHAPE as far as possible."*
     That is the same question this lane is asking. Reconcile, don't fork.
2. **Read before deciding** (domain-hub-first, opening.md §3d): `goals-ledger.md` G-021 / G-002 / G-027 /
   G-028 · ADR 0051 (kernel → brand → app) · ADR 0038 (separate DB per product) · ADR 0040 + G-005 (how the
   kernel extracts an L1 *down* from an app rather than cleanrooming it — the proven extraction pattern) ·
   `clients/mammoth-build-crm/**` for the actual shipped surface.
3. **Apply the abstraction ladder** (`abstraction-ladder-run-card-skill` memory: run → card → skill; prove
   each rung). The kernel equivalent: it ran in Mammoth (rung 1). Rung 2 is a *second* consumer, not a
   package. **Do not create `packages/crm` before a second consumer is named** — that is pre-building a
   card for unrun work.
4. **Output:** a Petey plan with the forks resolved, the module boundary drawn, the goal row minted (or
   explicitly deferred with the reason), and a disjointness assessment for whether the extraction can
   fan out. **No schema or package changes this session.**

**Done means:** the kernel-CRM goal exists (or is explicitly parked with a reason), the module boundary and
its second consumer are decided, the ADR 0038 schema-contract question is answered, and the next session has
a buildable first slice. Nothing built.

## Task log

<!-- filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
