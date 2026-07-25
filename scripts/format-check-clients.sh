#!/usr/bin/env bash
# format-check-clients.sh — WL-P2-69
#
# Fans `format:check` out across clients/* (standalone, non-workspace products —
# their own bun.lock, so root's `bun run --filter '*' format:check` can't reach
# them). Mirrors the opt-in discover pattern already used by
# `.github/workflows/clients-ci.yml`: a client without a `format:check` script is
# skipped loudly, not silently; a client that HAS one and fails, fails the gate.
set -euo pipefail

status=0

for dir in clients/*/; do
  dir="${dir%/}"
  [ -f "$dir/package.json" ] || continue
  if node -e "process.exit(require('./$dir/package.json').scripts?.['format:check'] ? 0 : 1)"; then
    echo "==> $dir: format:check"
    if ! (cd "$dir" && bun run format:check); then
      status=1
    fi
  else
    echo "==> $dir: no format:check script — skipping (add oxfmt to enable)."
  fi
done

exit $status
