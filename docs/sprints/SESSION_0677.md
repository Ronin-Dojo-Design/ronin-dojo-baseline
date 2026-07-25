---
title: "SESSION 0677 — Fable /rr + spec — RDD client portal (Michael+BBL accounts, billing, previews, SOP uploads) (auto lane, wave 13/14)"
slug: session-0677
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0677
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/research/research-review-rdd-client-portal.md
---

# SESSION 0677 — Fable /rr + spec — RDD client portal (Michael+BBL accounts, billing, previews, SOP uploads) (auto lane, wave 13/14)

> Staged by the SESSION_0635 orchestrator (waves 13+14, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0677-rdd-client-portal-rr`.

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

Fable /rr + spec — RDD client portal (Michael+BBL accounts, billing, previews, SOP uploads).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0677_TASK_01 | done | Verify-first recon (read-only, cited file:line): apps/rdd static/no-DB state + the vercel.json DB slot, apps/web Better Auth (magicLink/trustedOrigins/BBL-only origins), MMB CRM standalone-auth precedent (ADR 0038 D5), R2 seam (`media.ts:53`), PR #262 intake kernel, PR #269 InboundEmail (+0639 migration pattern), PR #300 QuickBooks /rr, 0667 billing pack + 0675 feature-intake spec via `git show` |
| SESSION_0677_TASK_02 | done | Web research (cited): Structure Webworks + agency client-portal must-haves; Better Auth organization plugin vs lean scoping; Resend inbound attachment mechanics (NOT in webhook payload — follow-up API fetch required); Claude-side file-creation + Gmail flows ("Michael creates on his Claude" = native create→attach→send) |
| SESSION_0677_TASK_03 | done | Build-ready phased spec authored (0660/0675 house style): Phase 0 (0678 env-gated preview — gives/lacks/growth contract), Phase 1 (rdd DB + standalone magic-link Better Auth + Client/ClientMembership + file-fed status), Phase 2 (billing read surface + R2 artifact hosting + component previews + feature-widget deep-links), Phase 3 (email-in SOP capture first, portal R2 uploads second); per-phase gates/migrations/kill-switches/effort; 9 open forks |

## What landed

**`docs/architecture/research/research-review-rdd-client-portal.md`** — /rr + build-ready phased
spec for the RDD client portal on ronindojodesign.com (operator directive: Michael as a client
user — billing, project status, clickable previews, component/design previews with the feature
widget; BBL/Tony onboarded as a client too; SOP/document uploads with quick retrieval for Brian).

Headline recommendations (all forks OPEN, §7 of the doc):

- **Phase-1 default: `apps/rdd` gets its OWN Better Auth (magic-link, passwordless) on its OWN new
  `rdd` Postgres** — ADR 0038 D1/D5, the MMB-CRM standalone precedent with apps/web's magic-link
  mechanism; cross-domain reuse of apps/web auth rejected (D5 + cookie mechanics + BBL blast
  radius). Client scoping = hand-rolled `Client`/`ClientMembership`; org plugin deferred.
- Project status Phase 1 is file-fed (committed per-client content, no CRUD build).
- Phase 2: billing is a READ surface over the 0667/0672 pipeline (no payments, no send paths);
  artifacts (State of the Building, decks) hosted in R2 behind an authenticated streaming route;
  feature widget = deep-links to the 0675 mounts, not a portal-local table.
- Phase 3: **email-in SOP channel FIRST** (Michael's Claude → welcome@ → #269 InboundEmail; only
  attachment-persist to R2 is new — Resend webhooks carry metadata only), portal drag-and-drop
  uploads second. Brian's retrieval day-1 surface = `/app/inbox` + ntfy.
- Tony = read-only client on Client BBL; Ronin-bots naming lane referenced, nothing blocked.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/research/research-review-rdd-client-portal.md` | NEW — /rr + phased build-ready spec (evidence table V1–V15, research §1–3, spec §4–5, 9 open forks, sources) |
| `docs/sprints/SESSION_0677.md` | adopted (staged → closed), task log + close sections filled |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0677` · `auto/session-0677-rdd-client-portal-rr` — exit 0 |
| Docs-only lane — no code gates run (no bootstrap per dispatch) | n/a; writes confined to the two allowed files |
| `git status --short` scope check before staging | only the 2 allowed files present — exit 0 |

## Proposed ledger edits

> Proposed only — this lane does not touch ledgers. For the merge owner:

- **goals-ledger: NEW goals row — "RDD client portal program"** (suggested id: next G-0xx):
  ronindojodesign.com client portal per
  `docs/architecture/research/research-review-rdd-client-portal.md` — Phase 1 (rdd DB +
  magic-link auth + client accounts + status), Phase 2 (billing view + artifact hosting +
  previews), Phase 3 (SOP document exchange: email-in first, portal uploads second). Clients:
  Michael/MMB + Tony/BBL. Depends on: #269 merge (Phase 3a), 0678 preview area (Phase 0), 0675
  feature-intake spec (widget mounts). All §7 forks awaiting operator ratification.

## Open decisions / blockers

- All 9 forks in the research doc §7 are OPEN for the operator — headline: 7.1 DB-now (rec: yes),
  7.2 auth mechanism (rec: own Better Auth + magic-link), 7.4 artifact hosting (rec: R2 +
  PortalDocument), 7.5 upload channel priority (rec: email-in first), 7.7 Tony scope (rec:
  read-only).
- Phase-1 gate item: a `ronindojodesign.com`-scoped Resend sending key must exist (receiving is
  live; sending unverified this session).
- Phase 3a stacks on PR #269's merge (its migration is deliberately unapplied — 0639 pattern).

## Residual for AM merge

- Operator: ratify/redirect the §7 forks; if Phase 1 is a go, stage the build lane off the spec's
  Phase-1 section (2–3 lanes).
- Merge owner: add the proposed goals-ledger row (above) if accepted; no other ledger edits from
  this lane.

