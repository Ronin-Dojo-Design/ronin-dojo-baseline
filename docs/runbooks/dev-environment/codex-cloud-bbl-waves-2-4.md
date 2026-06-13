---
title: "Codex Cloud Handoff — BBL /app Waves 2-4"
slug: codex-cloud-bbl-waves-2-4
type: runbook
status: active
created: 2026-06-13
updated: 2026-06-13
last_agent: codex-session-0375
pairs_with:
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/runbooks/dev-environment/codex-mobile-runbook.md
  - docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md
  - docs/sprints/SESSION_0374.md
backlinks:
  - docs/runbooks/README.md
  - docs/knowledge/wiki/index.md
tags:
  - codex
  - codex-cloud
  - autonomous
  - bbl
  - app-migration
---

# Codex Cloud Handoff — BBL /app Waves 2-4

Use this when dispatching Codex Cloud for the first three remaining safe BBL `/app` migration waves
after SESSION_0374. This is the cloud equivalent of the local
`scripts/auto-session-codex-automerge.sh` default run.

## Operator Choice

- **Local/SSH path:** run `scripts/auto-session-codex-automerge.sh` from this repo. This is the best
  path when you want local `graphify`, local dev auth/browser proof, `gh`, and ntfy phone pings.
- **Codex Cloud path:** paste the prompt below into Codex Cloud. Do not run `caffeinate`; the cloud
  task is already remote. Do not launch nested `codex exec` from inside Codex Cloud.

## Cloud Prompt

```text
Work in Ronin-Dojo-Design/ronin-dojo-baseline.

Goal: run the first 3 safe BBL local-first /app migration sessions after SESSION_0374, automerging
each green PR if CI passes. These are APP_AND_SERVER_MIGRATION_MAP waves 2, 3, and 4 only:

1. Wave 2: roles, entitlements, invites, leads
2. Wave 3: email, brand-settings, privacy, reports
3. Wave 4: programs, courses, age-groups, skill-levels, schedule

Read first:
- docs/rituals/opening.md
- docs/rituals/closing.md
- docs/sprints/SESSION_0374.md
- docs/product/black-belt-legacy/APP_AND_SERVER_MIGRATION_MAP.md
- docs/product/black-belt-legacy/BBL-SOT-Spec.md
- docs/product/black-belt-legacy/SOT-ADR.md

For each wave:
- Bow in as a new SESSION_NNNN with last_agent codex-session-NNNN.
- Execute only the next wave from APP_AND_SERVER_MIGRATION_MAP.
- Use the proven per-area recipe from SESSION_0374.
- Keep the route work mechanical: git mv admin area to app area, add permission layout, unwrap withAdminPage,
  add redirects/tests/sidebar, and repoint route strings/revalidatePath values.
- Scope every rewrite. Never blanket-rewrite server/admin import paths.
- Run focused redirect tests, typecheck, oxlint/oxfmt checks, wiki lint, and changed-line fallow.
- Graphify is probably unavailable in Codex Cloud; if so, record "Graphify deferred to next local
  session" in the SESSION close evidence instead of faking it.
- Commit the session, push a PR, wait for CI, rerun failed checks once if appropriate, and merge only
  if green.
- After merging, refresh main before starting the next wave.

Hard stops:
- Do not edit apps/web/prisma/** or create migrations.
- Do not execute server/<entity> flattening or move server/web|server/admin modules.
- Do not start Phase 3 identity re-root.
- Do not make DNS, Vercel production-domain, or Stripe rehearsal changes.
- If a wave requires any hard-stop item, stop and leave a SESSION handoff/PR for human review.

End state:
- At most 3 merged PRs, one per wave.
- Main is clean and pushed.
- SESSION docs and wiki index/log are current.
- The final SESSION points to wave 5 or to the human-gated next step if a brake fired.
```

## Local Command

```bash
scripts/auto-session-codex-automerge.sh
```

The local driver defaults to `N=3`, refuses `N>3` unless
`CODEX_AUTO_SESSION_ALLOW_MORE=1`, and stops without automerging if a wave touches Prisma or looks
like server flattening.
