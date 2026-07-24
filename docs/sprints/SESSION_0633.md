---
title: "SESSION 0633 — RDD + MMB stand-alone deploys: /rr wave → two /ppp batons (WS-A/B/C/D)"
slug: session-0633
type: session--plan
status: in-progress
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0633
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
| `apps/rdd/vercel.json` | ~~❌ absent~~ → **✅ EXISTS** (WS-A correction, 2026-07-23: landed with SESSION_0625's RDD commit — workspace shape, ignoreCommand `apps/rdd packages bun.lock package.json` + md/mdx excludes). What's missing is the Vercel *project* + DB, not the config. |
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

## Petey plan

### Goal

Produce the reusable per-brand deploy pattern + gap matrix and cutover checklist for each of RDD and
MMB, then emit two independently-executable batons — zero infrastructure mutated.

#### SESSION_0633_TASK_01 — WS-A: per-brand deploy-pattern runbook

- **Agent:** general-purpose (Giddy lens: architecture + Git/deploy strategy)
- **What:** ONE runbook, `docs/runbooks/deploy/per-brand-deploy-pattern.md` — what exactly makes a
  brand a separate deploy unit (project + root dir, `ignoreCommand` scoping path-scoped vs whole-dir,
  install/build commands, env/secret blocks, CI workflow, DB separation per ADR 0038, domain attach).
- **Done means:** runbook exists; the two stale claims are *documented as corrected reality* in it.
  The root `vercel.json` comment fix and the runbooks-hub link are **outside owned paths** → routed to
  the merge owner via `## Findings to route`, not edited in-lane.
- **Depends on:** —

#### SESSION_0633_TASK_02 — WS-B: gap matrices vs BBL

- **Agent:** general-purpose (Doug lens: verify against live app + repo, never copy stale rows)
- **What:** `docs/product/rdd/GAP_MATRIX.md` + `docs/product/mammoth-build/GAP_MATRIX.md`, mirroring
  BBL's axis set but with every BBL row re-verified (repo routes + live `blackbeltlegacy.com` spot-checks).
- **Done means:** both files exist, rows dated "as of main@417a7be9", RDD rows flagged as
  point-in-time (SESSION_0635 is mutating `apps/rdd` in parallel).
- **Depends on:** —

#### SESSION_0633_TASK_03 — WS-D: Cloudflare extension of the domain runbook

- **Agent:** general-purpose (research + author; WebFetch/WebSearch against CURRENT Vercel + Cloudflare docs)
- **What:** extend `docs/runbooks/deploy/vercel-domain-setup-runbook.md` with a Cloudflare section:
  A/CNAME targets, apex vs `www`, and the proxied-vs-DNS-only requirement for Vercel cert issuance —
  **verified against current vendor docs, not memory**. Generic Cloudflare path + MMB-zone cautions
  (do-not-touch: MX/Google Workspace on both domains, HubSpot DKIM/SPF + `hub.` CNAME, `_dmarc`).
- **Done means:** Bluehost section intact; Cloudflare section sourced (links + retrieved dates); the
  grey-cloud claim confirmed, corrected, or nuanced per current docs.
- **Depends on:** —

#### SESSION_0633_TASK_04 — WS-C: cutover checklists

- **Agent:** general-purpose (Cody lens: author from WS-B output + BBL's 3-layer shape)
- **What:** `docs/product/rdd/CUTOVER_CHECKLIST.md` + `docs/product/mammoth-build/CUTOVER_CHECKLIST.md`
  mirroring BBL's layers (Deploy/DNS → Features/GAP_MATRIX → Tests/verification). MMB Layer 1 is
  **greenfield attach** (mammothmb.com), not a cutover — no rollback drama, incumbent untouched.
- **Done means:** both files exist; Layer 2 consumes the WS-B matrices by reference.
- **Depends on:** TASK_02 (+ TASK_03 for the DNS layer's Cloudflare specifics).

#### SESSION_0633_TASK_05 — /ppp × 2: the batons

- **Agent:** Petey (inline — this session lead)
- **What:** two paste-ready batons in this file (`## Batons`): Baton 1 RDD (own Vercel project +
  `apps/rdd/vercel.json` + own Neon DB per D3 + intake mount per D4, Bluehost DNS) · Baton 2 MMB
  (attach existing `clients/mammoth-build-crm` to a Vercel project in Brian's team per D2, Cloudflare
  DNS for mammothmb.com). **No new SESSION stubs minted in-lane** (id-collision rule) — the merge
  owner stages stubs from the batons.
- **Done means:** each baton executable without re-deriving WS-A/B/C/D; every infra action inside
  them operator-gated.
- **Depends on:** TASK_01–04.

### Parallelism

TASK_01 ∥ TASK_02 ∥ TASK_03 (disjoint files, one dispatch wave) → TASK_04 → TASK_05 inline.

### Open decisions — resolved at bow-in grill (2026-07-23)

1. mammothmb.com registered + zoned in Michael's Cloudflare — **pre-answered by dispatch key-fact**.
2. MMB Vercel project ownership — **Brian's team**; migrates at ADR 0033 D1 contractual handoff.
3. RDD own DB — **yes, in Baton 1** (operator directive "their own DBs"); provisioning operator-gated.
4. Intake → apps/rdd — **yes**, RDD is the 0632 intake module's first mount; baton plans schema/env.
5. Blast radius — technical verification inside TASK_01 (ignoreCommand scoping proof), not a fork.
6. `mammoth-metal-buildings` GitHub ownership — recorded risk in Baton 2; not an MVP blocker.
7. HubSpot DNS exit — its own later lane; recorded in Baton 2's do-not-touch + sequencing note.

### Risks

- SESSION_0635 mutates `apps/rdd` while WS-B snapshots it → RDD matrix rows dated; merge owner reconciles.
- BBL `GAP_MATRIX.md` known-stale → axis reuse only, zero row copying.
- Browser MCPs may be profile-locked by sibling sessions → agents use WebFetch (no browser dependency).
- `core.hooksPath` singleton points at whichever worktree bootstrapped last → finding routed below.

### Scope guard

Planning only. No Vercel/DNS/DB/deploy mutations; no `apps/rdd/**` edits (0635 owns it); no shared-ledger
writes; no files outside the owned-path list; batons stay in this SESSION file.

## Task log

- `SESSION_0633_TASK_01` — WS-A `/rr`: per-brand deploy-pattern runbook (`docs/runbooks/deploy/`), correcting the two recorded stale claims. — **done** (`per-brand-deploy-pattern.md`: 8-ingredient pattern, both ignoreCommand shapes, CI discover→matrix trap, blast-radius matrix + 10-step stand-up checklist. Baseline reality documented: NO vercel.json, cloud deferred @0598, domain rides BBL project @0617. Root-vercel.json comment fix + hub link routed to merge owner.)
- `SESSION_0633_TASK_02` — WS-B `/rr`: gap matrices vs BBL → `docs/product/rdd/GAP_MATRIX.md` + `docs/product/mammoth-build/GAP_MATRIX.md` (re-verified, not copied from BBL's stale matrix). — **done** (RDD: 3 hard + 2 conditional launch blockers — Vercel project+DNS attach, SEO/app-shell basics, intake pending 0632; homepage already shipped @0625. MMB: 4 launch blockers — deploy attach, missing `migrate deploy` in buildCommand, read-side auth gap exposing CRM data publicly, inquiry form dead-ends in localStorage. BBL rows code-verified only — live site was DOWN during verification, see incident finding.)
- `SESSION_0633_TASK_03` — WS-D `/rr`: extend `vercel-domain-setup-runbook.md` to Cloudflare; verify grey-cloud/cert-issuance claim against current Vercel + Cloudflare docs. — **done** (grey-cloud rule confirmed-with-nuance: HTTP-01 challenge blocked by default orange-cloud behavior, Vercel's fix is still DNS-only; Full-(strict)+well-known-exempt documented as the eyes-open alternative. Current targets verified: apex A `216.198.79.1`, per-project CNAMEs, no AAAA/IPv6; dashboard values authoritative.)
- `SESSION_0633_TASK_04` — WS-C: `CUTOVER_CHECKLIST.md` per brand (3-layer BBL shape), consuming WS-B. Depends on TASK_02. — **done** (RDD: 10-row Layer 1, 6 operator gates, Resend deferred to intake mount. MMB: pre-flip blocker table B1–B4 — migrate-deploy, read-side auth gate, InquiryForm persistence, password-reset recorded — then 10-row greenfield attach, 6 operator gates, C2 record table as rollback state. Relative links verified.)
- `SESSION_0633_TASK_05` — `/ppp` × 2: RDD baton + MMB baton, written last, citing TASK_01–04 outputs. — **done** (`## Batons` above: both paste-ready, consume-not-re-derive, no ids minted; RDD baton opens with a SESSION_0635 reconcile step; MMB baton opens with B1–B3 hard gates before any infra.)

## Bow-in (SESSION_0633, 2026-07-23)

- Canonical-occupancy check: **OCCUPIED by SESSION_0624** → session runs entirely in `../ronin-0633` (worktree on pre-existing branch `session-0633-brand-deploys`, fast-forwarded from stale 7355fa24 to main 417a7be9; branch had zero unique commits).
- `githooks/doctor.sh` from this worktree: **all checks passed** (pre-push RULE B live, server ruleset `main-pr-only` active).
- `/worktree-setup` bootstrap: complete (env, deps, Prisma clients).
- Parallel-lane assessment (opening.md §1d): fan-out shape pre-decided by the SESSION_0625 dispatch — WS-A ∥ WS-B ∥ WS-D disjoint `/rr` lanes, WS-C after WS-B, batons last.
- PR backlog at bow-in: 1 open (#261, clean/draft) — lane pinned by dispatch, so no `/pr-fix-loop` pickup.

## Batons (the /ppp deliverable — paste-ready, one per brand)

> Each baton is independently executable in a fresh session/worktree. The knowledge lives in the four
> session artifacts — the baton makes the executor CONSUME them, not re-derive them. No SESSION
> numbers are minted here (id-collision rule): the merge owner stages stubs from these blocks.

### Baton 1 — RDD go-live deploy (`ronindojodesign.com`)

```text
You are executing the RDD stand-alone deploy lane, planned by SESSION_0633. Repo
/Users/brianscott/dev/ronin-dojo-app (remote Ronin-Dojo-Design/ronin-dojo-baseline). Run
`bash scripts/canonical-claim.sh check --session NNNN` at bow-in; work in your own worktree
(`git worktree add ../ronin-NNNN -b session-NNNN-rdd-deploy main` + /worktree-setup); main is
PR-only (ADR 0053); every push/merge/deploy waits for Brian's explicit word.

READ FIRST (in order — they carry the verified ground truth, do not re-derive):
1. docs/runbooks/deploy/per-brand-deploy-pattern.md — the 8-ingredient pattern; §9 is your spine.
2. docs/product/rdd/CUTOVER_CHECKLIST.md — your execution sequence (Layer 1 rows 0–9; 6 OPERATOR
   GATE rows). Layer 2/3 define feature + verification scope.
3. docs/product/rdd/GAP_MATRIX.md — launch-blocker detail (as of main@417a7be9; re-verify rows).
4. docs/runbooks/deploy/vercel-domain-setup-runbook.md — Bluehost section for the DNS batch.

PINNED DECISIONS (SESSION_0633 grill, 2026-07-23 — binding): RDD gets its OWN Neon DB (ADR 0038);
apps/rdd is the FIRST MOUNT of the SESSION_0632 intake module; apps/rdd/vercel.json already EXISTS
(landed SESSION_0625) — you create the Vercel PROJECT + DB + domain attach, not the config.

STEP 0 — RECONCILE: SESSION_0635 (rdd-golive) ran in parallel with the planning wave. Diff the
checklist's row states against what actually landed (apps/rdd tree + Vercel dashboard + any
SESSION_0635 close notes) before executing anything; flip rows to ✅-with-evidence, don't redo them.

SEQUENCE: follow CUTOVER_CHECKLIST Layer 1 in row order. Every OPERATOR GATE row (DB provision,
project+env, first deploy, domain attach, Bluehost DNS batch, Resend) = build/verify/show, then
STOP for Brian's explicit go. Use dashboard-minted record values (apex A 216.198.79.1 current;
cname.vercel-dns.com legacy-but-working). Capture prior Bluehost records verbatim as rollback
BEFORE the batch. Blast-radius proof (pattern §8): confirm the first deploy did NOT trigger a BBL
rebuild. Layer 3 gates: local build → Products CI green → bun -e fetch smoke (no curl in sandbox).

DONE MEANS: ronindojodesign.com serves apps/rdd on its own Vercel project + own DB, BBL untouched,
checklist rows flipped with evidence, findings routed via your SESSION file (no shared-ledger writes
if parallel lanes are live).
```

### Baton 2 — MMB greenfield attach (`mammothmb.com`)

```text
You are executing the MMB (Mammoth Metal Buildings) deploy-attach lane, planned by SESSION_0633.
Repo /Users/brianscott/dev/ronin-dojo-app (remote Ronin-Dojo-Design/ronin-dojo-baseline). Run
`bash scripts/canonical-claim.sh check --session NNNN` at bow-in; work in your own worktree; main
is PR-only (ADR 0053); every push/merge/deploy/DNS handoff waits for Brian's explicit word.

READ FIRST (verified ground truth — consume, don't re-derive):
1. docs/product/mammoth-build/CUTOVER_CHECKLIST.md — your spine: pre-flip blockers B1–B4, THEN
   attach rows 0–9 (6 OPERATOR GATE rows). B-rows come first, in-repo, before any infra.
2. docs/product/mammoth-build/GAP_MATRIX.md — blocker detail (as of main@417a7be9).
3. docs/runbooks/deploy/per-brand-deploy-pattern.md — pattern; MMB uses the whole-dir
   ignoreCommand shape (known tradeoff: ui-kit changes never auto-redeploy MMB — confirm
   keep/change with Brian at project creation).
4. docs/runbooks/deploy/vercel-domain-setup-runbook.md §Cloudflare (C0–C7) — record-table
   pattern, grey-cloud rule (verified 2026-07-23), do-not-touch list.

FRAMING (binding): GREENFIELD ATTACH, not a cutover. mammothmb.com is the target (registered, in
the client Michael's Cloudflare — a THIRD-PARTY account: produce the C2 record table for Michael/
Brian to apply; NEVER request credentials or edit the zone). mammoth.build (incumbent GitHub Pages
site) stays put — out of scope. DO-NOT-TOUCH on both domains: Google Workspace MX, HubSpot
DKIM/SPF + hub. CNAME, _dmarc. HubSpot's DNS exit is a separate later lane. Vercel project lives
in BRIAN'S team (SESSION_0633 decision 2; migrates at ADR 0033 D1 contractual handoff).

HARD PRE-FLIP GATES (from B-table — the app must not go public without them): B1 add
`migrate deploy` to the deploy path (mirror BBL's prebuild pattern); B2 CLOSE THE READ-SIDE AUTH
GAP — /app/* has no session check; a public deploy today exposes ALL CRM data anonymously — and
verify sign-up-closed in lib/auth.ts; B3 wire InquiryForm to persist (localStorage dead-end today).
B4 no-password-reset is recorded, not blocking. NO REAL CLIENT PII IN GIT (Michael Flores' data
stays out).

SEQUENCE: B1–B3 as normal PR'd code changes with tests → then attach rows 0–9 in order, STOPPING
at every OPERATOR GATE (DB provision, project+env in Brian's team, manual migrate until B1 lands,
first deploy, domain attach, client-applied Cloudflare records — DNS-only/grey per C-section).
Layer 3: 6 unit suites in Products CI + scratch-DB/fixture-login/in-page-fetch UAT proving B2+B3 +
bun -e fetch post-attach smoke.

DONE MEANS: mammothmb.com serves the CRM from its own Vercel project + existing own DB, auth-gated
reads proven, inquiries persist, incumbent zone untouched except the two added records, BBL
untouched, findings routed via your SESSION file.
```

## Artifacts

- Frozen State-of-Dojo snapshot @ bow-in (429 sessions, 31 goals; operator-requested):
  <https://claude.ai/code/artifact/82d86f8c-6008-4313-b367-4e9d9bf8b579>

## Findings to route

<!-- ids assigned by the merge owner after all three lanes land — do not mint ids in-lane -->

- **INC (URGENT, surfaced live to operator + spawn-task chip): BBL prod outage 2026-07-24 03:17Z→ongoing.** blackbeltlegacy.com 500 site-wide; root cause diagnosed via Vercel runtime errors: Neon compute-time quota exhausted (Postgres XX000 "exceeded the compute time quota" through the Prisma driver adapter, 145+ hits, 34 users, all DB-backed routes + Better Auth sessions). NOT a bad deploy — remediation is Neon-console plan/quota action (operator-only). Discovered by WS-B's live-app verification; chip `task_cea09fae` carries recovery-verification + incident-ledger + prevention work.
- NOTE (from the outage logs, separate bug): `/api/og` throws "Can't load image `https://baselinemartialarts.comhttps://d1th1bjp9wz9c3.cloudfront.net/...`" — malformed base-URL concatenation in OG image generation (~6 hits). Route to a fix lane.
- DRIFT (WS-A): root `/vercel.json` comment claims `apps/baseline/vercel.json` exists ("SESSION_0463 stands it up") — verified absent; Baseline cloud deploy deferred @0598, `baselinemartialarts.com` rides the BBL project @0617. Comment fix is merge-owner's (file outside this lane's owned paths; it's also in BBL's deploy-trigger set).
- DRIFT (WS-A): SESSION_0633 stub ground-truth said `apps/rdd/vercel.json` absent — it EXISTS (landed @0625). Corrected in this file's table with a dated strike-through.
- DRIFT (WS-B): "clients-ci.yml = typecheck only" is stale — Products CI runs opt-in `test` + `lint:check` since WL-P3-56; MMB's 6 unit suites gate PRs; `apps/rdd` is in its trigger paths. Update the `mammoth-crm-tracer-lane` memory + any docs asserting typecheck-only.
- NOTE (WS-B): BBL `GAP_MATRIX.md` rows BBL-LINEAGE-001 + BBL-RANK-002 proven stale — they describe `selectedRankAward`, removed @0475 (RankEntry collapse). Epic-4 rows untrustworthy; matrix predates the collapse.
- NOTE (WS-A): runbooks-hub link for `per-brand-deploy-pattern.md` (docs/runbooks/README.md) — merge owner adds at merge (outside owned paths).
- NOTE (WS-A): MMB's whole-dir ignoreCommand means `packages/ui-kit` changes never redeploy MMB — accepted tradeoff documented in the runbook; make it a conscious keep/change decision when the MMB Vercel project is created.
- NOTE (WS-A): `vercel-deploy.md` calls the root `vercel.json` "historical/root fallback" while it carries BBL's live ignoreCommand — phrasing invites deletion of a load-bearing file; one-line correction suggested.
- NOTE (WS-D): Vercel CNAME targets moved to per-project values (`<hash>.vercel-dns-0NN.com`; apex A now `216.198.79.1`, `76.76.21.21` legacy-but-working; no IPv6/AAAA). Bluehost-section rows citing `cname.vercel-dns.com` are legacy-but-working — refresh per-domain from the dashboard on next Bluehost pass.
- NOTE (WS-D): `dns-verification-spec.md` + ADR 0015 are Bluehost-only framings; add a one-line pointer to the runbook's new Cloudflare section.
- NOTE (WS-B): MMB has no password-reset path by construction (password auth, zero email infra) — acceptable for a two-role internal tool; carried into the MMB cutover checklist.
- NOTE (WS-C): RDD `GAP_MATRIX.md` marks own-DB as conditional ("if intake persists leads") but the session's pinned decision is unconditional — checklist follows the pin; tighten the matrix row at merge.
- NOTE (WS-C): `phase14-local-deployment-checklist.md` still carries unchecked project-name/DNS items (PL-015, epic #247) and is superseded at the cloud boundary by the RDD cutover checklist — wants a pointer-back edit post-merge (outside this lane's write scope).
- FS: `core.hooksPath` is a shared-config singleton across all worktrees — at bow-in it pointed into the **ronin-0632 sibling worktree** (its bootstrap ran last); my bootstrap re-pointed it to ronin-0633. Whichever worktree "owns" the path at any moment, removing that worktree at bow-out dangles the hooks for canonical + every sibling until the next bootstrap/doctor run. Doctor passes today; the hazard is worktree *removal*, not present state. Suggest: bow-out ritual (or `canonical-claim.sh release`) re-points hooksPath to the **canonical** checkout's `scripts/githooks` before a worktree is pruned.

## Status

Single source of truth is the frontmatter `status:` field.
