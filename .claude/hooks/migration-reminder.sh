#!/bin/bash
# migration-reminder.sh — PreToolUse (Write|Edit).
#
# When prisma/schema.prisma or a prisma/migrations/** file is created or edited,
# inject a reminder to read the schema-migration runbook FIRST and surface the
# prod-apply flow. Pairs with the SESSION_0475 lesson: the "prod auto-applies via
# the prebuild → migrate deploy hook" fact is documented (schema-migration.md
# §62/64, deployment.md §86/133) but was rediscovered by grepping package.json at
# push time because nothing surfaced it at migration-authoring time. Mirrors the
# FS-0027 test-writing-reminder pattern. Non-blocking — it only adds context.

set -euo pipefail

input="$(cat)"
fp="$(/usr/bin/python3 -c '
import json, sys
data = json.loads(sys.stdin.read() or "{}")
print((data.get("tool_input") or {}).get("file_path", ""))
' <<<"$input")"

case "$fp" in
  *prisma/schema.prisma|*prisma/migrations/*)
    cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "additionalContext": "[prisma-migration] You are editing the Prisma schema or a migration. Read docs/runbooks/database/schema-migration.md FIRST — especially \"When migrations ACTUALLY apply\". Key facts: (1) PROD (Neon) auto-applies committed migration files via prebuild → `scripts/prebuild-migrate.ts` during the Vercel PRODUCTION build ONLY (VERCEL_ENV-gated, SESSION_0730 — before the gate, preview builds applied PR migrations to prod at PR-OPEN, pre-merge; never widen the gate or copy prod creds into preview scope). The migration FILE must be committed or prod applies nothing. (2) Use `prisma migrate dev` locally to create the versioned file (never `db push` for shippable changes). (3) A column TYPE change (String→enum etc.) needs `--create-only` + hand-edit with a `USING` cast — a bare `migrate dev` DROPs the column and resets rows. (4) NEVER run `migrate reset` / `db push` / `--accept-data-loss` against prod. (5) A DESTRUCTIVE migration (drop/rename) must not ride a PR until the operator confirms preview env-scoping is live (see #380 blocker)."
  }
}
EOF
    exit 0
    ;;
esac

echo '{}'
