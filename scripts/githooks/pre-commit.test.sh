#!/usr/bin/env bash
# Integration proof for the FS-0028 staged-format guard.

set -euo pipefail
# Test Git's native hook behavior; an exported interactive safety wrapper must not rewrite fixture
# commands or turn an expected blocked commit into a harness-level `set -e` exit.
unset -f git 2>/dev/null || true

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
source_formatter="$repo_root/node_modules/.bin/oxfmt"
scratch="$(mktemp -d "${TMPDIR:-/tmp}/ronin-pre-commit-test.XXXXXX")"

cleanup() {
  rm -rf "$scratch"
}
trap cleanup EXIT

fail() {
  echo "pre-commit.test: FAIL — $1" >&2
  if [ -n "${hook_output:-}" ] && [ -s "$hook_output" ]; then
    sed 's/^/  | /' "$hook_output" >&2
  fi
  exit 1
}

snapshot() {
  local label="$1"
  git -C "$fixture" diff --cached --binary --no-ext-diff > "$scratch/$label.index"
  git -C "$fixture" diff --binary --no-ext-diff > "$scratch/$label.worktree"
}

assert_unchanged() {
  local label="$1"
  git -C "$fixture" diff --cached --binary --no-ext-diff > "$scratch/$label.index.after"
  git -C "$fixture" diff --binary --no-ext-diff > "$scratch/$label.worktree.after"
  cmp -s "$scratch/$label.index" "$scratch/$label.index.after" \
    || fail "$label mutated the index"
  cmp -s "$scratch/$label.worktree" "$scratch/$label.worktree.after" \
    || fail "$label mutated the worktree"
}

[ -x "$source_formatter" ] || fail "source formatter is unavailable: $source_formatter"

fixture="$scratch/repo"
mkdir -p \
  "$fixture/apps/web" \
  "$fixture/packages/ui-kit" \
  "$fixture/node_modules/.bin" \
  "$fixture/no-hooks"
git init -q "$fixture"
git -C "$fixture" config user.email "guard-test@ronindojo.invalid"
git -C "$fixture" config user.name "Ronin guard test"
git -C "$fixture" config core.hooksPath "$fixture/no-hooks"
ln -s "$source_formatter" "$fixture/node_modules/.bin/oxfmt"
cp "$script_dir/pre-commit" "$fixture/pre-commit"
chmod +x "$fixture/pre-commit"

printf '{"semi":false}\n' > "$fixture/apps/web/.oxfmtrc.json"
printf '{"semi":false}\n' > "$fixture/packages/ui-kit/.oxfmtrc.json"
rank_file="$fixture/apps/web/member-ranks.ts"
deleted_file="$fixture/apps/web/deleted.ts"
existing_ui_file="$fixture/packages/ui-kit/existing.ts"
hook_output="$scratch/hook-output"

printf 'const rank = { value: 0 }\n' > "$rank_file"
printf 'export const deleted = true\n' > "$deleted_file"
printf 'export const existingUi = 1\n' > "$existing_ui_file"
git -C "$fixture" add \
  apps/web/.oxfmtrc.json \
  apps/web/deleted.ts \
  apps/web/member-ranks.ts \
  packages/ui-kit/.oxfmtrc.json \
  packages/ui-kit/existing.ts
git -C "$fixture" commit -qm "fixture baseline"

# Formatted staged content passes.
printf 'const rank = { value: 1 }\n' > "$rank_file"
git -C "$fixture" add apps/web/member-ranks.ts
snapshot formatted-pass
if ! (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "formatted staged content was blocked"
fi
assert_unchanged formatted-pass

# Unformatted staged content fails and identifies the exact path.
printf 'const rank={value:1}\n' > "$rank_file"
git -C "$fixture" add apps/web/member-ranks.ts
snapshot unformatted-fail
if (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "unformatted staged content passed"
fi
assert_unchanged unformatted-fail
grep -q 'apps/web/member-ranks.ts' "$hook_output" \
  || fail "failure did not name the unformatted staged path"

# The index, not the worktree, is authoritative: formatting only the worktree must still fail.
(cd "$fixture" && "$source_formatter" apps/web/member-ranks.ts >/dev/null)
snapshot staged-authority
if (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "formatted worktree concealed an unformatted staged blob"
fi
assert_unchanged staged-authority

# The inverse partial-stage case must pass: formatted index, dirty unformatted worktree.
git -C "$fixture" add apps/web/member-ranks.ts
printf 'const rank={value:1}\n' > "$rank_file"
snapshot inverse-partial-stage
if ! (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "unformatted unstaged worktree content blocked a formatted staged blob"
fi
assert_unchanged inverse-partial-stage

# NUL-delimited path handling must preserve a filename containing spaces.
spaced_file="$fixture/apps/web/member ranks.ts"
printf 'export const spaced={value:1}\n' > "$spaced_file"
git -C "$fixture" add "apps/web/member ranks.ts"
if (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "unformatted staged path containing spaces passed"
fi
grep -q 'apps/web/member ranks.ts' "$hook_output" \
  || fail "failure split or omitted a staged path containing spaces"
(cd "$fixture" && "$source_formatter" "apps/web/member ranks.ts" >/dev/null)
git -C "$fixture" add "apps/web/member ranks.ts"
git -C "$fixture" commit -qm "source guard fixtures"

# A config-only change must check untouched files under the would-be formatting law.
printf '{\n  "semi": true\n}\n' > "$fixture/packages/ui-kit/.oxfmtrc.json"
git -C "$fixture" add packages/ui-kit/.oxfmtrc.json
snapshot config-only-expansion
if (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "config-only semantic expansion left an untouched file inconsistent"
fi
assert_unchanged config-only-expansion
grep -q "staged Oxfmt config changes 'packages/ui-kit' formatting" "$hook_output" \
  || fail "config-only failure omitted the affected workspace"
git -C "$fixture" restore --staged packages/ui-kit/.oxfmtrc.json
git -C "$fixture" show HEAD:packages/ui-kit/.oxfmtrc.json \
  > "$fixture/packages/ui-kit/.oxfmtrc.json"

# Deleting a formatter config must also evaluate the resulting workspace defaults.
git -C "$fixture" rm -q packages/ui-kit/.oxfmtrc.json
if (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "staged formatter-config deletion bypassed the workspace check"
fi
git -C "$fixture" restore --staged packages/ui-kit/.oxfmtrc.json
git -C "$fixture" show HEAD:packages/ui-kit/.oxfmtrc.json \
  > "$fixture/packages/ui-kit/.oxfmtrc.json"

# A staged formatter config, not a dirty worktree config, must govern staged source.
ui_file="$fixture/packages/ui-kit/rank.ts"
printf '{\n  "semi": true\n}\n' > "$fixture/packages/ui-kit/.oxfmtrc.json"
git -C "$fixture" add packages/ui-kit/.oxfmtrc.json
printf '{\n  "semi": false\n}\n' > "$fixture/packages/ui-kit/.oxfmtrc.json"
printf 'export const uiRank = 1\n' > "$ui_file"
git -C "$fixture" add packages/ui-kit/rank.ts
snapshot staged-config-authority
if (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "worktree config concealed the staged config's semicolon requirement"
fi
assert_unchanged staged-config-authority
git -C "$fixture" show :packages/ui-kit/.oxfmtrc.json \
  > "$fixture/packages/ui-kit/.oxfmtrc.json"
(cd "$fixture" && "$source_formatter" packages/ui-kit/rank.ts packages/ui-kit/existing.ts >/dev/null)
git -C "$fixture" add \
  packages/ui-kit/.oxfmtrc.json \
  packages/ui-kit/existing.ts \
  packages/ui-kit/rank.ts

# A staged deletion is outside the blob check and must not fail.
git -C "$fixture" rm -q apps/web/deleted.ts
if ! (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "staged deletion was blocked"
fi

# A docs-only commit has no formatter dependency.
git -C "$fixture" commit -qm "formatted fixture changes"
printf '# Guard note\n' > "$fixture/note.md"
git -C "$fixture" add note.md
rm "$fixture/node_modules/.bin/oxfmt"
if ! (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "docs-only staged content required Oxfmt"
fi

# Eligible staged code fails loudly when dependencies have not been installed.
printf 'const rank = { value: 2 }\n' > "$rank_file"
git -C "$fixture" add apps/web/member-ranks.ts
if (cd "$fixture" && ./pre-commit > "$hook_output" 2>&1); then
  fail "eligible staged code passed without Oxfmt installed"
fi
grep -q "Run 'bun install'" "$hook_output" \
  || fail "missing-formatter failure omitted its recovery command"

# Invoke the guard through Git itself, not only as a directly executed script.
ln -s "$source_formatter" "$fixture/node_modules/.bin/oxfmt"
mkdir -p "$fixture/hooks"
cp "$script_dir/pre-commit" "$fixture/hooks/pre-commit"
chmod +x "$fixture/hooks/pre-commit"
git -C "$fixture" config core.hooksPath "$fixture/hooks"
printf 'const rank={value:3}\n' > "$rank_file"
git -C "$fixture" add apps/web/member-ranks.ts
head_before="$(git -C "$fixture" rev-parse HEAD)"
if git -C "$fixture" commit -qm "must be blocked" > "$hook_output" 2>&1; then
  fail "git commit bypassed the installed staged-format hook"
fi
[ "$(git -C "$fixture" rev-parse HEAD)" = "$head_before" ] \
  || fail "blocked git commit still moved HEAD"
(cd "$fixture" && "$source_formatter" apps/web/member-ranks.ts >/dev/null)
git -C "$fixture" add apps/web/member-ranks.ts
git -C "$fixture" commit -qm "installed hook pass" \
  || fail "installed hook blocked formatted staged content"

# Installing from a linked lane must pin the shared config to canonical, never the disposable lane.
install_repo="$scratch/install-repo"
install_lane="$scratch/install-lane"
mkdir -p "$install_repo/scripts/githooks"
git init -q "$install_repo"
git -C "$install_repo" config user.email "guard-test@ronindojo.invalid"
git -C "$install_repo" config user.name "Ronin guard test"
cp "$script_dir/pre-commit" "$install_repo/scripts/githooks/pre-commit"
cp "$script_dir/pre-push" "$install_repo/scripts/githooks/pre-push"
cp "$script_dir/post-checkout" "$install_repo/scripts/githooks/post-checkout"
cp "$script_dir/install.sh" "$install_repo/scripts/githooks/install.sh"
chmod +x \
  "$install_repo/scripts/githooks/pre-commit" \
  "$install_repo/scripts/githooks/pre-push" \
  "$install_repo/scripts/githooks/post-checkout"
git -C "$install_repo" add scripts/githooks
git -C "$install_repo" commit -qm "installer fixture"
git -C "$install_repo" worktree add -q -b guard-test-lane "$install_lane"
(cd "$install_lane" && bash scripts/githooks/install.sh > "$hook_output")
installed_path="$(git -C "$install_repo" config --get core.hooksPath)"
expected_path="$(cd "$install_repo" && pwd -P)/scripts/githooks"
[ "$installed_path" = "$expected_path" ] \
  || fail "linked-lane install pinned '$installed_path' instead of canonical '$expected_path'"

echo "pre-commit.test: PASS — staged source/config authority, installation, and read-only behavior"
