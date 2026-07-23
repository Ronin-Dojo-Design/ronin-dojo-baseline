---
title: "SESSION 0633 — RDD + MMB stand-alone deploys: /rr wave → two /ppp batons (WS-A/B/C/D)"
slug: session-0633
type: session--plan
status: staged
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0625
sprint: S12
lane: repo
goal_ids: ["G-021", "G-027"]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0632.md
  - docs/runbooks/deploy/vercel-domain-setup-runbook.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0633 — RDD + MMB stand-alone deploys (planning wave)

> **Pre-staged stub (ADR 0049), staged by [SESSION_0625](SESSION_0625.md)** from the operator's
> directive, captured verbatim below. **PLANNING ONLY** — this session runs `/rr` and emits `/ppp`
> batons. It does **not** create Vercel projects, edit DNS, provision databases, or deploy.

## Operator directive (verbatim, 2026-07-23)

> "RDD has ronindojodesign.com, MMB has mammothmb.com that we need to setup their own separate Vercel
> deploys. I have RDD on the Bluehost and MMB the client Michael has a CloudFlare account that we just
> need to point the DNS to the Vercel deploys. `/gq` the deployment local dev runbooks and sessions
> hubs domain hubs for how we setup BBL to have separate deployment from this monorepo, then have Petey
> and Giddy do `/rr` on planning and `/ppp` for each individually so they end up in their own DBs,
> their own product/client folders. We need `/rr` separately for cross-matrix-gap compared to BBL and
> `/rr` for individual `CUTOVER_CHECKLIST.md` like we did for BBL — just for RDD and MMB."

## Goal

Produce **two independently-executable batons** — one for RDD (`ronindojodesign.com`), one for MMB
(`mammothmb.com`) — that each carry: own Vercel project, own database, own product/client folder, own
`CUTOVER_CHECKLIST.md`, and a DNS cutover path. The shared research runs **once**; only the batons fork.

## Ground truth (`/gq` from the canonical graph, SESSION_0625 — verified by direct read)

| Fact | State |
| --- | --- |
| Per-app deploy pattern | ✅ established — root `vercel.json` **is** the BBL/`apps/web` project; `ignoreCommand` scopes the build trigger to `apps/web packages bun.lock package.json vercel.json` with `*.md`/`*.mdx` excluded (SESSION_0501) |
| `clients/mammoth-build-crm/vercel.json` | ✅ **exists** — `ignoreCommand: git diff --quiet HEAD^ HEAD -- .` (whole-dir scope, standalone app) |
| MMB database | ✅ **exists** — own `prisma/` + `prisma.config.ts`; `Contact`/`Company`/`Project`/`Activity`/`Quote`/`Invoice` models (ADR 0038) |
| `apps/rdd/vercel.json` | ❌ **absent** — RDD's deploy is not stood up |
| RDD database | ❌ **absent** — no `prisma/` under `apps/rdd` |
| `apps/rdd` app | ⚠️ skeleton only — `app/{globals.css,layout.tsx,page.tsx}`, consumes `@ronin-dojo/ui-kit` via `workspace:*` |
| Product folders | ✅ both exist — `docs/product/rdd/` (brand-brief, phase-14 checklist, `assets/`) and `docs/product/mammoth-build/` |
| `CUTOVER_CHECKLIST.md` | ⚠️ **BBL only** — 3-layer shape (Deploy/DNS → Features/GAP_MATRIX → Tests/verification). The template to mirror. |
| Domain runbook | ⚠️ [`deploy/vercel-domain-setup-runbook.md`](../runbooks/deploy/vercel-domain-setup-runbook.md) is **Bluehost-specific** — covers RDD, **no Cloudflare path** for MMB |
| CI split | `ci.yml` / `playwright.yml` gate `apps/web`; `clients-ci.yml` ("Products CI") gates `apps/baseline` + `clients/*` |

**Two stale claims found while verifying — fold the corrections into WS-A rather than filing separately:**

1. The root `vercel.json` comment asserts *"apps/baseline is its OWN Vercel project with its own
   vercel.json scoped to `apps/baseline packages bun.lock` (SESSION_0463 stands it up)"* — but
   **`apps/baseline/vercel.json` does not exist**. Either it was never landed or it was removed.
2. The graph still carries a node for `docs/runbooks/vercel-domain-setup-runbook.md` at the **old
   top-level path**; the file now lives under `docs/runbooks/deploy/`. Graph staleness, not drift —
   a `graphify update .` clears it.

## Two MMB domains — the target is NOT the incumbent (operator, 2026-07-23)

| Domain | Role | Implication |
| --- | --- | --- |
| **`mammothmb.com`** | **The TARGET** — where the new build goes live | Greenfield point-at-Vercel. **Additive, no cutover, no rollback drama.** |
| `mammoth.build` | The **incumbent** — the previous developer's live GitHub Pages site | Keeps serving. **Out of scope for the MVP**; migrating or retiring it is a later, separate decision. |

**This inverts the risk profile.** Standing MMB up is *not* a production migration — nothing the
business currently depends on is touched. The `mammoth.build` zone intel below stays recorded because
it governs the *eventual* question, and because it reveals HubSpot/email entanglement that shapes goal
#1 — but **none of it is on the MVP path.**

### `mammoth.build` zone intel (reference only — NOT the MVP path)

The operator supplied this zone from Michael's Cloudflare. Mammoth **fired their previous developer and
hired Brian**, so this incumbent is serving the business right now. Structural shape only is recorded
here — **no verification tokens, DKIM keys, or zone export in git**; the authoritative record table
lives with the operator.

| What the zone shows | Consequence for this lane |
| --- | --- |
| Apex `mammoth.build`: **4× A + 4× AAAA** on GitHub Pages' documented apex ranges, **all Proxied** | The public site is **GitHub Pages behind Cloudflare's orange cloud**. Cutover *retires* these, it doesn't add alongside them. |
| `www.mammoth.build` **CNAME → `mammoth-metal-buildings.github.io`**, Proxied | Same incumbent, `www` side. |
| `_github-pages-challenge-…` TXT | GitHub Pages domain verification — retire with the A/AAAA set. |
| `hub.mammoth.build` **CNAME → HubSpot CMS** (`…sites.hscoscdn-na2…`) | HubSpot **hosts a subdomain site**, not just CRM. |
| `hs1`/`hs2` DKIM CNAMEs + SPF `include:…hubspotemail…` | HubSpot **sends email as this domain**. |
| MX → `smtp.google.com` + `google._domainkey` + site-verification TXT | Mailboxes are **Google Workspace**. HubSpot sends *on behalf of*. |
| `_dmarc` → `v=DMARC1; p=none;` | Monitoring only, no enforcement. |
| 19 of 200 records used, **free plan** | Headroom is fine; plan tier constrains nothing here. |

**What it tells us (none of it blocks the MVP):**

1. **HubSpot is wired into DNS, and that collides with goal #1 (full HubSpot-Pro replacement).** Killing
   HubSpot is not a CRM-only decision: it takes down `hub.mammoth.build` and breaks domain email auth if
   the SPF include and DKIM CNAMEs are stripped. Its own later lane, with a deliverability plan.
2. **Mail is Google Workspace** (MX → `smtp.google.com`). Do-not-touch, on either domain.
3. **Proxy is ON** for `mammoth.build` apex + `www`. Whenever that domain *does* move, those go
   **"DNS only" (grey)** for Vercel cert issuance — and that removes whatever proxy-layer behavior
   (caching, WAF, analytics, origin masking) the site has been getting. Name what is relied on first.
4. **Incumbent repo access is an open risk.** The live site is served from a GitHub Pages org
   (`mammoth-metal-buildings`). The previous developer was let go — **who controls that account today?**
   Whoever holds it can change Mammoth's public site. Settle ownership (and whether source is handed
   over, or the site gets archived as reference) before any `mammoth.build` migration is scheduled.
   This is access-continuity, not a technical question.

## Work streams

### WS-A — `/rr`: "how BBL became a separate deploy" → the reusable per-brand pattern

- **Who:** Petey (planning shape) + Giddy (architecture/Git strategy) — the operator named both.
- **Question:** what *exactly* makes a brand a separate deploy unit out of this monorepo? Cover the
  full set, not just `vercel.json`: project creation + root directory, `ignoreCommand` scoping (and
  why BBL's is path-scoped while MMB's is whole-dir), install/build commands, env + secret blocks,
  the CI workflow that gates it, DB separation (ADR 0038), and domain attach.
- **Output:** ONE runbook — the per-brand deploy pattern — living under `docs/runbooks/deploy/` and
  linked from the runbooks hub. Correct the two stale claims above as part of it.
- **Why once, not twice:** RDD and MMB differ in *inputs*, not in *pattern*.

### WS-B — `/rr`: cross-matrix gap vs BBL (two outputs, one method)

- **Question:** what does BBL have — as a shipped, deployed brand — that RDD and MMB each lack?
  Mirror BBL's `GAP_MATRIX.md` axis set. Expect very different answers: MMB is a **standalone client
  app with its own DB already**, RDD is a **near-empty skeleton with no DB at all**.
- **Output:** `docs/product/rdd/GAP_MATRIX.md` + `docs/product/mammoth-build/GAP_MATRIX.md`.
- **Caveat from BBL:** its `GAP_MATRIX.md` is flagged **known-stale** — re-verify against the live app,
  never copy its rows forward.

### WS-C — `/rr` + author: a `CUTOVER_CHECKLIST.md` per brand

- **Shape:** mirror BBL's three layers — **Layer 1 Deploy/DNS · Layer 2 Features (GAP_MATRIX) · Layer 3
  Tests/verification**. Layer 2 consumes WS-B's output directly.
- **Output:** `docs/product/rdd/CUTOVER_CHECKLIST.md` + `docs/product/mammoth-build/CUTOVER_CHECKLIST.md`.
- **Depends on:** WS-B.

### WS-D — `/rr`: extend the domain runbook to **Cloudflare** (MMB's blocker)

- RDD is on **Bluehost** → the existing runbook already covers it; confirm it still matches the
  Bluehost UI and reuse as-is.
- MMB is on **Michael's Cloudflare account** → **no documented path exists**. Add a Cloudflare section:
  A/CNAME targets, apex vs `www`, and the **"DNS only" (grey) vs proxied (orange)** requirement for
  Vercel cert issuance. The zone above confirms apex + `www` are **currently proxied**, so this is a
  real flip, not a hypothetical. Verify the cert-issuance claim against current Vercel + Cloudflare
  docs — do not ship it from memory.
- **Scope it as a cutover, not a setup:** before/after record table, the **rollback** (the incumbent
  GitHub Pages A/AAAA + `www` CNAME, captured verbatim first), independent apex/`www` staging, and an
  explicit *do-not-touch* list — **MX, HubSpot DKIM/SPF, `hub.` CNAME, `_dmarc`**.
- **Third-party-account boundary:** the DNS lives in **Michael's** account. This session produces the
  record table he (or Brian, with access) applies. **No credentials in the repo, ever**, and no
  verification tokens or DKIM keys committed.

### Output — `/ppp` × 2 (the deliverable)

Two paste-ready batons, each independently executable in its own worktree:

- **Baton 1 — RDD** (`ronindojodesign.com`, Bluehost): own Vercel project + `apps/rdd/vercel.json`, own
  DB (decision 3 below), `docs/product/rdd/` gap matrix + cutover, Bluehost DNS.
- **Baton 2 — MMB** (`mammothmb.com`, Cloudflare): Vercel project for the existing
  `clients/mammoth-build-crm` (its `vercel.json` and DB already exist — this is *attach + cutover*,
  not stand-up), `docs/product/mammoth-build/` gap matrix + cutover, Cloudflare DNS.

## Open decisions — grill these first (`/pp` step 1)

1. **Domain — ANSWERED: `mammothmb.com` is the target**; `mammoth.build` is the incumbent and stays put.
   Residue: **is `mammothmb.com` registered, and is its zone in the same Cloudflare account?** If yes,
   this is one CNAME/A pair away from live. If it is registered elsewhere (or not yet), that is the
   first blocking step, not a detail.
2. **MMB Vercel project ownership** — does it live in Brian's Vercel team (RDD bills and operates it) or
   Michael's? This decides billing, access, and what happens at contractual handoff (ADR 0033 D1:
   client-brand apps extract to their own repo on handoff — a project in Brian's team has to migrate).
3. **Does RDD get its own DB at all?** Per ADR 0038 every product owns its DB — but `apps/rdd` today is a
   marketing/portfolio shell. If the intake module (SESSION_0632) or leads land there, it needs one; if
   RDD stays static-plus-forms, provisioning Neon now is premature. **Pin before Baton 1 is written.**
4. **Does SESSION_0632's intake move to `apps/rdd`?** Already open as 0632 decision 2 — but if RDD gets a
   real deploy here, that fork should close in this session, not drift.
5. **Prod-deploy blast radius.** Standing up `apps/rdd` as its own Vercel project means a new
   `ignoreCommand` scope. Confirm a change under `apps/rdd` cannot trigger a **BBL prod** rebuild, and
   vice versa — BBL is live and paid.
6. **Who controls the `mammoth-metal-buildings` GitHub account?** The previous developer was let go and
   that org still serves Mammoth's live site. Ownership, and whether the source is handed over or the
   current site gets archived as reference, must be settled **before** a cutover date is set.
7. **When does HubSpot actually come out of DNS?** Goal #1 is HubSpot-Pro replacement, but `hub.` and
   the domain's email auth ride on it. Sequence it as its own lane after the site cutover, with a
   deliverability plan — not folded into the website move.

## Boundaries (hard)

- **Planning only.** No Vercel project creation, no DNS edits, no DB provisioning, no deploy. Every one
  is an operator-gated action behind an explicit "go" (`explicit-push-authorization`).
- **Michael's Cloudflare is a third-party account.** Produce the record table; never store or request
  credentials, and never edit it from this session.
- **BBL is live and paid** — nothing in this lane may alter BBL's deploy trigger or DNS.

## Parallelism

WS-A ∥ WS-B ∥ WS-D are genuinely disjoint research lanes (different outputs, no shared files) → a real
three-lane `/rr` fan-out. **WS-C depends on WS-B.** The two `/ppp` batons are written last, after all
four land, so each baton can cite the finished runbook, gap matrix, and cutover checklist.

## Done means

- One per-brand deploy-pattern runbook, with the two stale claims corrected.
- A gap matrix **and** a cutover checklist for **each** of RDD and MMB, in their own product folders.
- The domain runbook covers **both** Bluehost and Cloudflare.
- Two paste-ready batons, each executable without re-deriving any of the above.
- Decisions 1–5 answered and recorded (ADR where architectural).
- **Zero** infrastructure mutated by this session.

## Task log

<!-- filled at bow-in -->

## Status

Single source of truth is the frontmatter `status:` field.
