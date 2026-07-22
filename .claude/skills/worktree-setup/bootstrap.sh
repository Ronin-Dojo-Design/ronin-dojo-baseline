#!/usr/bin/env bash
#
# /worktree-setup — bootstrap a fresh git worktree so gates + the dev server run.
# Canonical sequence: docs/runbooks/dev-environment/dev-environment.md#fresh-worktree-bootstrap
#
# Idempotent: safe to re-run. Env-FIRST ordering means bun install's prisma postinstall
# succeeds in one shot (the documented install-first order hits a DATABASE_URL failure).

set -euo pipefail

# repo/worktree root = three levels up from this script (.claude/skills/worktree-setup/)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
CANONICAL_ENV="/Users/brianscott/dev/ronin-dojo-app/apps/web/.env"
APP_ENV="$ROOT/apps/web/.env"
BASELINE_ENV="$ROOT/apps/baseline/.env"
BASELINE_DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

cd "$ROOT"
echo "▶ worktree-setup: $ROOT"

# 1. Env FIRST — so `bun install`'s prisma postinstall has DATABASE_URL and generates in one shot.
if [ -f "$APP_ENV" ]; then
  echo "✓ apps/web/.env already present"
elif [ -f "$CANONICAL_ENV" ]; then
  cp "$CANONICAL_ENV" "$APP_ENV"
  echo "✓ copied canonical .env → apps/web/.env"
else
  echo "⚠ canonical .env not found — exporting a throwaway DATABASE_URL for generate only"
  echo "  (the dev server still needs a real .env; see dev-environment.md § Database)"
  export DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
  export SKIP_ENV_VALIDATION=1
fi

# 2. Install — root Bun workspace (one root bun.lock); postinstall runs prisma generate.
echo "▶ bun install"
bun install

# 3. Ensure the Prisma client exists (idempotent; covers the throwaway-env path).
if [ ! -d "$ROOT/apps/web/.generated/prisma" ]; then
  echo "▶ prisma generate (client was not materialized by postinstall)"
  (cd "$ROOT/apps/web" && bunx prisma generate --no-hints)
fi

if [ -d "$ROOT/apps/baseline" ]; then
  if [ -f "$BASELINE_ENV" ]; then
    echo "✓ apps/baseline/.env already present"
  else
    cat > "$BASELINE_ENV" <<EOF
# Placeholder env for fresh-worktree bootstrap only.
# Replace with a real baseline_dev URL before running the Baseline app.
DATABASE_URL="$BASELINE_DATABASE_URL"
BETTER_AUTH_SECRET="placeholder-worktree-secret"
BETTER_AUTH_URL="http://localhost:3100"
EOF
    echo "✓ wrote placeholder apps/baseline/.env"
  fi

  if [ ! -d "$ROOT/apps/baseline/.generated/prisma" ]; then
    echo "▶ baseline prisma generate (client was not materialized by postinstall)"
    (cd "$ROOT/apps/baseline" && DATABASE_URL="$BASELINE_DATABASE_URL" bunx prisma generate --no-hints)
  fi
fi

echo "✓ worktree-setup complete — tsc / oxlint / bun test / 'next dev' should now run."
echo "  Reminder: the graphify graph lives in the canonical checkout; this worktree reads 0 nodes."
