---
title: Daily Bug Scan Ledger
slug: daily-bug-scan-ledger
type: reference
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/knowledge/wiki/wiring-ledger.md
  - docs/protocols/pr-review-score-fix-loop.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - findings
  - automation
---

# Daily Bug Scan Ledger

**Findings** ledger — the durable record of the **Codex Daily Bug Scan (DBS)**. Unlike the human
capture inboxes ([Reddit](reddit-links-ledger.md)/[YouTube](youtube-links-ledger.md)/
[ChatGPT](chatgpt-links-ledger.md) link-ledgers), DBS rows are **auto-appended by a scheduled Codex
bug scan** (cron/launchd) and reviewed for merge — closer in kind to the
[wiring-ledger](wiring-ledger.md) / failed-steps than to an idea inbox.

**Pipeline (planned — `session-0596-dbs-pipeline`, run as a fresh Codex session):**

```
Codex Daily Bug Scan (scheduled)  →  appends DBS-0NN rows here  →  renders the DBS
  (cron / launchd, Codex-side)         (repo, this file)            State-of-Dojo component
                                                                     (L4: local opening/closing
                                                                      artifact + pushed /app admin
                                                                      landing = State of the Dojo)
```

**Row law:** `DBS-0NN` ids, append-only, mint = max+1 (verify by grep — D-049 class). Status:
`open → reviewed → merged / rejected / routed (→ FS/WL/PR pointer)`. Each row: date, area/file,
severity, a one-line finding, and (if the scan opened one) a branch/PR ref for review-merge. Wired
into `scripts/ledger-backlog.ts` (code `DBS`), `scripts/deferral-guard.ts`, and closing.md §6.7 by
lane L2 (`session-0591-ledger-wiring`).

## Rows

> **Scan run:** commits **2026-07-12 → 2026-07-19**, cross-checked against `test-fail-fix-ledger.md`
> + `wiring-ledger.md`. Output lives in the Codex worktree
> `/Users/brianscott/.codex/worktrees/bc1f/ronin-dojo-app` (reported by operator, SESSION_0589).
> **Verification:** `cd clients/mammoth-build-crm && bun run test` → **20/20 pass**; `bun run
> typecheck` could not run (tsc not installed in that worktree — the fresh-worktree bootstrap gap,
> `/worktree-setup`).

### DBS-001 — clients-ci.yml runs `bun run test` per product → closes WL-P3-56 — fix-made · pending-merge

- **Fix:** [`/.github/workflows/clients-ci.yml`](../../../.github/workflows/clients-ci.yml) now runs
  `bun run test` for any product that defines a `test` script. Before this, Mammoth's 20 app-local
  tests could all fail while Products CI went green on typecheck alone.
- **Closes:** [`WL-P3-56`](wiring-ledger.md) (once merged).
- **Status:** the change is **uncommitted in the Codex worktree** (`M .github/workflows/clients-ci.yml`,
  bc1f) — **pending review/merge** into `main`. Route via a build session or `/pr-fix-loop`. **Not
  merged by SESSION_0589** (planning lane — out of scope to pull a worktree change in).

### DBS-002 — Mammoth contact-dedup mismatch (preview vs write) = SESSION_0577_FINDING_01 — open · latent

- **Finding:** [`clients/mammoth-build-crm/lib/lead-ingest.ts`](../../../clients/mammoth-build-crm/lib/lead-ingest.ts)
  dedupes **case-insensitive email + normalized phone**, while
  [`clients/mammoth-build-crm/lib/actions.ts`](../../../clients/mammoth-build-crm/lib/actions.ts)
  `findOrCreateContact()` still dedupes **case-sensitive email only**.
- **Severity:** latent — safe today (the import path does not exist yet). **Smallest fix:** share ONE
  contact-identity helper between preview and write.
- **Cross-ref:** `SESSION_0577_FINDING_01`. Route to the Mammoth lane when the import path lands.

### DBS-003 — Signed-out Mammoth `/app` shell renders while `listProjects()` rejects = WL-P3-53 — open

- **Finding:** signed-out Mammoth `/app` shells can render while `listProjects()` rejects with
  `UnauthorizedError`, producing noisy server-action failures.
- **Fix (not a silent catch):** an explicit **signed-out boundary** on the `/app` shell.
- **Cross-ref:** [`WL-P3-53`](wiring-ledger.md) (still valid). Route to the Mammoth lane.

## Cross-references

- [Planning Ledger](planning-ledger.md) · [Wiring Ledger](wiring-ledger.md) — sibling ledgers.
- [pr-review-score-fix-loop](../../protocols/pr-review-score-fix-loop.md) — how scan-opened PRs get merged.
