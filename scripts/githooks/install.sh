#!/usr/bin/env bash
#
# install.sh — point this clone's git hooks at the tracked `scripts/githooks/` directory.
#
# Idempotent. Run once per clone; ALL worktrees inherit it, because `core.hooksPath` lives in the
# shared `.git/config` and every linked worktree reads the same config.
#
#   bash scripts/githooks/install.sh
#
# Installs: pre-push (FS-0039 — blocks the worktree cross-lane push accident).

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="$repo_root/scripts/githooks"

chmod +x "$hooks_dir"/pre-push
git config core.hooksPath "scripts/githooks"

echo "✓ core.hooksPath → scripts/githooks (applies to canonical + every worktree)"
echo "  active hooks: $(ls "$hooks_dir" | grep -v '\.sh$' | tr '\n' ' ')"
