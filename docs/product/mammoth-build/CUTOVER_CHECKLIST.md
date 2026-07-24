---
title: "Mammoth Build CRM (mammothmb.com) — Launch Cutover Checklist (Greenfield Attach)"
slug: mmb-cutover-checklist
type: report
status: active
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0633
pairs_with:
  - docs/runbooks/deploy/per-brand-deploy-pattern.md
  - docs/runbooks/deploy/vercel-domain-setup-runbook.md
  - docs/product/mammoth-build/GAP_MATRIX.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0633.md
tags:
  - mammoth
  - mmb
  - launch
  - cutover
  - checklist
---

# Mammoth Build CRM (mammothmb.com) — Launch Cutover Checklist

The cross-layer sequencer for attaching `mammothmb.com` to the MMB app
(`clients/mammoth-build-crm`). Deploy mechanics live in
[`per-brand-deploy-pattern.md`](../../runbooks/deploy/per-brand-deploy-pattern.md); DNS mechanics in
[`vercel-domain-setup-runbook.md`](../../runbooks/deploy/vercel-domain-setup-runbook.md)
(**Cloudflare third-party-zone path, C0–C7** — the zone lives in the client Michael's Cloudflare
account); feature status in [`GAP_MATRIX.md`](GAP_MATRIX.md). This doc only **sequences** them.

> **This is a greenfield attach, not a production cutover.** `mammothmb.com` serves nothing today;
> the incumbent `mammoth.build` (GitHub Pages) **stays put and is out of scope**. Third-party-zone
> boundary (runbook C0): this repo produces **record tables only — never credentials, tokens, or
> zone exports**; the client (or a member they invite) applies edits in their own dashboard.
> Do-not-touch on **both** Mammoth domains (runbook C6): Google Workspace MX, HubSpot DKIM/SPF,
> the `hub.` CNAME, `_dmarc`. The MMB Vercel project lives in **Brian's team** and migrates at the
> ADR 0033 D1 handoff. Every infra step is **OPERATOR GATE**.

## Layer 1 — Deploy / DNS

### Pre-flip blockers (close BEFORE the domain attach — from [`GAP_MATRIX.md`](GAP_MATRIX.md))

| # | Blocker | State | Rollback |
| --- | --- | --- | --- |
| B1 | `buildCommand` lacks `migrate deploy` (BBL runs it in `prebuild`) — the first deploy hits an **un-migrated DB**. Wire `prebuild: migrate deploy` mirroring `apps/web` (pattern §3), or run migrate manually pre-deploy (row 4 below). | pending | code revert (one-file `vercel.json`/`package.json` change) |
| B2 | **Read-side auth gap** — `/app/*` pages have no session check and no middleware: a public deploy exposes all CRM data (contacts, projects, activities) **anonymously**. MUST close before domain attach. Also verify sign-up is closed (no `disableSignUp` found in `lib/auth.ts`; Better Auth default leaves email+password registration open — unverified). | pending — **hard gate on row 6** | n/a — cannot ship without |
| B3 | Public `InquiryForm` dead-ends in the visitor's **localStorage** (`mammoth:submitted`) — inquiries never become Lead/Contact rows. Wire the form to a server action through the ONE matcher (`contact-match.ts`). | pending | code revert |
| B4 | No password-reset path (no email infra by design). **Acceptable** for an operator-provisioned two-role internal tool — recorded, not blocking. | noted — not a blocker | n/a |

### Attach sequence

| # | Item | State | Rollback |
| --- | --- | --- | --- |
| 0 | Config baseline: `clients/mammoth-build-crm/vercel.json` committed — standalone shape (in-dir install, `db:generate && build`, whole-dir `ignoreCommand`); `prisma.config.ts` normalizes the Neon pooler for migrate. | ✅ committed (pattern §2–3, §6 reference impl) | n/a |
| 1 | Pre-flight: Products CI green (typecheck + the 6 unit suites) on the branch carrying B1–B3. | pending | n/a |
| 2 | Provision the **own Neon prod DB** (ADR 0038 — MMB already has its own `prisma/`, 3 committed migrations, idempotent seed). | **OPERATOR GATE** | drop the DB — nothing depends on it pre-launch |
| 3 | Create the Vercel project **in Brian's team** (migrates at ADR 0033 D1 handoff): Root Directory `clients/mammoth-build-crm`; env block `DATABASE_URL` / `DIRECT_URL` / `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` (pattern §4; secrets Sensitive + `.env.prod` overlay). | **OPERATOR GATE** | delete the project |
| 4 | Apply migrations to the prod DB — manual `migrate deploy` until B1 lands; `prisma.config.ts` already prefers `DIRECT_URL` on Vercel. | **OPERATOR GATE** | Neon PITR/branch restore; DB is empty pre-launch |
| 5 | First production deploy; confirm the app-dir `vercel.json` is being read; blast-radius check — an MMB commit must show a **skip** on the BBL project (pattern §8). | **OPERATOR GATE** | none needed — no domain attached yet |
| 6 | **Gate check: B2 closed + sign-up verified shut.** Then attach `mammothmb.com` + `www` on the project Domains page (attach FIRST — it mints the per-domain record values, runbook C4). | **OPERATOR GATE** | remove the domain from the project |
| 7 | Produce the C2 record table from the dashboard values: apex A + `www` CNAME, **Before column captured from the live zone**, proxy status **DNS only (grey)**. Placeholders only — no tokens/keys in the repo. | pending | the Before column IS the rollback state |
| 8 | Client (zone-holder) applies the table in their Cloudflare — `www` first if a soft launch is wanted (C4); do-not-touch list C6 stands. | **OPERATOR GATE** (client-applied per C0) | C7: delete/re-point the two added rows to the Before column; restore proxy status |
| 9 | Verify: **Valid Configuration** on the project Domains page, cert issued, `bun -e "fetch(...)"` probes → 200 + `server: Vercel` (`server: cloudflare` = row still proxied — flip per C3). | pending | covered by row 8 rollback |

## Layer 2 — Features (GAP_MATRIX)

Full status in [`GAP_MATRIX.md`](GAP_MATRIX.md). **Caveat:** the BBL baseline in that matrix is
**code-verified only** — `blackbeltlegacy.com` was mid-outage (Neon compute quota, site-wide 500s)
during verification.

MMB is the inverse of RDD: a **working app** (pipeline board, sales cockpit, lead import, job
orders, own Better Auth) missing the deploy attach + pre-public hardening. Its 4 launch-blocking
rows are exactly Layer 1's rows 2–6 + B1–B3:

| # | Item | Where sequenced |
| --- | --- | --- |
| 1 | Vercel project + `mammothmb.com` attach + env | Layer 1 rows 3, 6–9 |
| 2 | Prod DB provisioning + the missing migrate-on-deploy step | Layer 1 rows 2, 4 + B1 |
| 3 | Read-side auth gate on `/app/*` + sign-up-closed verification | B2 (hard gate on row 6) |
| 4 | Inquiry form → real Lead/Contact rows | B3 |

Everything else (Stripe, Resend, R2 photos, SEO set, headers, palette sign-off) is `later` on a
working app — see the matrix; do not pad the flip.

## Layer 3 — Tests / verification

| Rank | Check | Why | Mechanics |
| --- | --- | --- | --- |
| 1 | Products CI — 6 unit suites | `board-config, contact-match, lead-commit, lead-ingest, lead-source, sales-cockpit` gate every PR since WL-P3-56 (typecheck required; tests run because MMB defines `test`). B1–B3 land through this gate. | next PR touching `clients/mammoth-build-crm` |
| 2 | Scratch-DB + fixture-login + in-page-fetch UAT | The proven manual MMB recipe. Point it at the B2 fix especially: an **anonymous** fetch of `/app/*` must redirect/deny, a fixture-login one must render; then submit the public inquiry form → Lead/Contact rows appear on the board (B3 proof). | local scratch DB per the recipe |
| 3 | Post-attach smoke | `bun -e "fetch(...)"` probes (no `curl` in the sandbox): apex + `www` → 200/redirect + `server: Vercel`; then login → board renders → add a lead. | Layer 1 row 9 + manual pass |
| 4 | Deploy-smoke e2e (login → board → add lead) | First post-attach increment — MMB has no e2e today. | later — not a flip gate |

## Cross-references

- [Per-Brand Deploy Pattern](../../runbooks/deploy/per-brand-deploy-pattern.md) — 8 ingredients; MMB is the standalone-shape reference impl.
- [Vercel Domain Setup Runbook — Cloudflare section C0–C7](../../runbooks/deploy/vercel-domain-setup-runbook.md) — third-party-zone boundary, record table, proxy rule, rollback.
- [GAP_MATRIX](GAP_MATRIX.md) — full feature status vs the BBL baseline.
