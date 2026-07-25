---
title: "RDD (ronindojodesign.com) — Launch Cutover Checklist"
slug: rdd-cutover-checklist
type: report
status: active
created: 2026-07-23
updated: 2026-07-23
last_agent: claude-session-0633
pairs_with:
  - docs/runbooks/deploy/per-brand-deploy-pattern.md
  - docs/runbooks/deploy/vercel-domain-setup-runbook.md
  - docs/product/rdd/GAP_MATRIX.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0633.md
tags:
  - rdd
  - ronindojodesign
  - launch
  - cutover
  - checklist
---

# RDD (ronindojodesign.com) — Launch Cutover Checklist

The cross-layer sequencer for standing `ronindojodesign.com` up as its own deploy unit. Deploy
mechanics live in [`per-brand-deploy-pattern.md`](../../runbooks/deploy/per-brand-deploy-pattern.md)
(8 ingredients + the §9 worked checklist); DNS mechanics in
[`vercel-domain-setup-runbook.md`](../../runbooks/deploy/vercel-domain-setup-runbook.md) (**Bluehost
path**, steps 1–8 — RDD's DNS lives at Bluehost); feature status in [`GAP_MATRIX.md`](GAP_MATRIX.md).
This doc only **sequences** them.

> Pinned decisions (SESSION_0633, binding): RDD gets its **own Neon DB** (ADR 0038 — never a share
> of BBL's); the SESSION_0632 intake module mounts on RDD as its **first consumer** (in flight).
> `apps/rdd/vercel.json` already exists (workspace shape, SESSION_0625) — the entire remaining gap
> is cloud-side. Every infra step below is **OPERATOR GATE**: build, verify, show, then act on the
> word.

## Layer 1 — Deploy / DNS

Sequence follows pattern §9 (steps 1–6 already landed for RDD) then domain runbook steps 1–8.

| # | Item | State | Rollback |
| --- | --- | --- | --- |
| 0 | Config baseline: `apps/rdd/vercel.json` committed — workspace install/build, path-scoped `ignoreCommand` (`apps/rdd packages bun.lock package.json` + md/mdx excludes). | ✅ landed SESSION_0625 (pattern §2–3 reference impl) | n/a |
| 1 | Pre-flight: local `bun run --filter rdd build` green + Products CI green on the branch (pattern §9 precondition to project creation). | pending | n/a |
| 2 | Provision RDD's **own Neon DB** (pinned; needed when the 0632 intake persists leads). Then add `db:generate` + migrate-on-deploy to `vercel.json` per its own comment + pattern §3. | **OPERATOR GATE** | drop the DB — nothing depends on it pre-launch |
| 3 | Create the Vercel project: Root Directory `apps/rdd`; env block per pattern §4 (mark secrets Sensitive; keep the gitignored `.env.prod` overlay). | **OPERATOR GATE** | delete the project |
| 4 | First production deploy; confirm on the dashboard that the app-dir `vercel.json` is the config being read (pattern §1). | **OPERATOR GATE** | none needed — no domain attached yet |
| 5 | Blast-radius proof both directions (SESSION_0501 matrix): docs-only commit → RDD skips; RDD code commit → RDD deploys; RDD commit → **BBL shows a skip** (pattern §8/§9 step 8). | pending | n/a (verification) |
| 6 | Attach `ronindojodesign.com` + `www` on the **project** Domains page (runbook step 2). Copy the **per-project dashboard record values** — currently apex A `216.198.79.1`; `www` CNAME `cname.vercel-dns.com` is legacy-but-working (dashboard value wins). | **OPERATOR GATE** | remove the domain from the project |
| 7 | Apply the Bluehost DNS batch in one save (runbook step 4): apex A → the dashboard value; `www` CNAME → the dashboard value. Capture the prior records first. | **OPERATOR GATE** | re-point apex A / `www` to the captured prior values |
| 8 | Verify: `dig` at authoritative + cache layers (runbook step 5), Vercel **Valid Configuration**, SSL + 200 (runbook steps 6–7). | pending | covered by row 7 rollback |
| 9 | Resend: add `ronindojodesign.com` + its own DKIM at Bluehost, domain-scoped key (a cross-brand key silently 403s — pattern §4). Required with the 0632 intake notification path; skip until the mount lands. | **OPERATOR GATE** (with intake) | remove the Resend domain; DNS rows are additive |

## Layer 2 — Features (GAP_MATRIX)

Full status in [`GAP_MATRIX.md`](GAP_MATRIX.md). **Caveat:** the BBL baseline in that matrix is
**code-verified only** — `blackbeltlegacy.com` was mid-outage (Neon compute quota, site-wide 500s)
during verification.

RDD's MVP is **marketing + intake**, deliberately near-empty otherwise. Launch-blocking rows only:

| # | Item | State |
| --- | --- | --- |
| 1 | Deploy attach (Vercel project + DNS) — sequenced as Layer 1 above. | pending (operator-gated) |
| 2 | Intake mount — the 0632 brand-agnostic intake module; RDD is its first consumer. Today the page has `mailto:` CTAs only. | in flight (SESSION_0632) |
| 3 | Minimal SEO/app-shell set: `robots.ts` + `sitemap.ts` + favicon + 404 page. | pending |
| 4 | Own DB (pinned yes) + Resend notification key — both conditional on the 0632 module's persistence/notification shape; sequenced as Layer 1 rows 2 and 9. | pending (operator-gated) |

Everything else in the matrix is honestly `later` or `no` — do not pad scope before the flip.

## Layer 3 — Tests / verification

| Rank | Check | Why | Mechanics |
| --- | --- | --- | --- |
| 1 | Local build gate | Precondition to project creation (Layer 1 row 1). | `bun run --filter rdd build` from repo root |
| 2 | Products CI green | `apps/rdd/**` **is** in `clients-ci.yml` `on.paths`; typecheck required. Test/lint are opt-in (WL-P3-56) and RDD defines neither → they skip loudly — that is the expected green today. | next PR touching `apps/rdd` |
| 3 | Post-attach smoke | Proves DNS + cert + prod deploy end-to-end. **No `curl` in the sandbox** — use `bun -e "fetch(...)"` probes: apex + `www` → 200/redirect + `server: Vercel`. | runbook step 7 shape, `bun -e` variant |
| 4 | Intake smoke (post-0632 mount) | Submit → lead persisted (own DB) + notification delivered (Resend). Add `test`/`lint:check` scripts to `apps/rdd` at the same time. | with the mount — not before |

## Cross-references

- [Per-Brand Deploy Pattern](../../runbooks/deploy/per-brand-deploy-pattern.md) — the 8 ingredients + worked checklist.
- [Vercel Domain Setup Runbook](../../runbooks/deploy/vercel-domain-setup-runbook.md) — Bluehost record batch + verification.
- [GAP_MATRIX](GAP_MATRIX.md) — full feature status vs the BBL baseline.
- [phase14-local-deployment-checklist](phase14-local-deployment-checklist.md) — the earlier local-deploy checklist this supersedes at the cloud boundary.
