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

# ABSOLUTE, not "scripts/githooks" (FS-0040). git resolves a RELATIVE core.hooksPath against the
# directory git runs in, so a relative value silently means "this worktree's own copy". A lane
# branched before the hook existed has no such directory — and git skips a missing hooksPath with
# NO warning and exit 0. The guard was therefore absent from exactly the worktrees it exists to
# guard. An absolute path pins every worktree to the canonical checkout's copy, on any branch.
git config core.hooksPath "$hooks_dir"

echo "✓ core.hooksPath → $hooks_dir"
echo "  (absolute on purpose — covers canonical + every worktree, on any branch. See FS-0040.)"
echo "  active hooks: $(ls "$hooks_dir" | grep -v '\.sh$' | tr '\n' ' ')"
echo "  verify any time: bash $hooks_dir/doctor.sh"
