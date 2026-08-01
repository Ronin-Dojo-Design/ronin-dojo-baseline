#!/usr/bin/env bash
#
# install.sh — point this clone's git hooks at the tracked `scripts/githooks/` directory.
#
# Idempotent. Run once per clone; ALL worktrees inherit it, because `core.hooksPath` lives in the
# shared `.git/config` and every linked worktree reads the same config.
#
#   bash scripts/githooks/install.sh
#
# Installs: pre-commit (FS-0028 staged-format guard), pre-push (FS-0039 cross-lane push guard),
# and post-checkout (WL-P3-65 linked-worktree detection backstop).

set -euo pipefail

common_dir="$(git rev-parse --git-common-dir)"
common_abs="$(cd "$common_dir" && pwd)"
# The canonical checkout owns the shared .git directory. Deriving from --show-toplevel here would
# pin core.hooksPath to a disposable linked worktree when installation runs from a lane (FS-0040).
canonical="$(cd "$(dirname "$common_abs")" && pwd)"
hooks_dir="$canonical/scripts/githooks"

chmod +x "$hooks_dir"/pre-commit "$hooks_dir"/pre-push "$hooks_dir"/post-checkout

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
