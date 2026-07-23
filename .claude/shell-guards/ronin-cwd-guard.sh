#!/bin/sh
# ~/.shell-guards/ronin-cwd-guard.sh — LLM-agnostic FS-0024 guard.
#
# Defines wrapper functions for git / gh / pnpm / bun / vercel / graphify that
# REFUSE to run when the current shell's $PWD is inside the purchased read-only
# DirStarter template (`/Users/brianscott/Local Sites/DirStarter /dirstarter_template`).
#
# This catches the FS-0024 failure pattern at the shell boundary — works for
# Claude Code, GitHub Copilot CLI, OpenAI Codex CLI, Cursor agents, or any
# future LLM that invokes commands through the user's shell.
#
# To bypass intentionally for a single command (e.g., legitimate read-only
# research inside the template), prefix with `RONIN_GUARD_BYPASS=1 git …`.
#
# To remove: delete this file and the `source` lines in ~/.zshenv / ~/.bashrc.

_RONIN_TEMPLATE_DIR="/Users/brianscott/Local Sites/DirStarter /dirstarter_template"
_RONIN_REPO_DIR="/Users/brianscott/dev/ronin-dojo-app"

_ronin_in_template() {
  case "$PWD" in
    "$_RONIN_TEMPLATE_DIR"|"$_RONIN_TEMPLATE_DIR"/*) return 0 ;;
    *) return 1 ;;
  esac
}

_ronin_guard_refuse() {
  # $1 = tool name, $2 = "real" path to forward to if bypass is set
  cat >&2 <<EOF
[FS-0024 GUARD] Refusing to run \`$1\` from inside the read-only DirStarter
template (\$PWD = $PWD). The user's actual git repo is $_RONIN_REPO_DIR.

Fix one of:
  cd $_RONIN_REPO_DIR && $1 ...           # most common — you meant ronin-dojo-app
  RONIN_GUARD_BYPASS=1 $1 ...             # explicit override (e.g. read-only research)

See ~/.claude/projects/.../memory/feedback_ronin_dojo_bash_cwd.md
and docs/protocols/failed-steps-log.md FS-0024 (in the ronin-dojo-app repo).
EOF
  return 1
}

_ronin_wrap() {
  # Usage: _ronin_wrap <tool-name> "$@"
  _tool="$1"
  shift
  if [ "${RONIN_GUARD_BYPASS:-0}" = "1" ]; then
    command "$_tool" "$@"
    return $?
  fi
  if _ronin_in_template; then
    _ronin_guard_refuse "$_tool"
    return 1
  fi
  command "$_tool" "$@"
}

# Tool wrappers — same logic for each.
git()      { _ronin_wrap git      "$@"; }
gh()       { _ronin_wrap gh       "$@"; }
pnpm()     { _ronin_wrap pnpm     "$@"; }
vercel()   { _ronin_wrap vercel   "$@"; }
graphify() { _ronin_wrap graphify "$@"; }

# bun is dual-use — let `bun --version` / `bun --help` through unconditionally
# (those are safe-everywhere version probes).
bun() {
  case "$1" in
    --version|--help|-v|-h|"") command bun "$@"; return $? ;;
  esac
  _ronin_wrap bun "$@"
}

# ─────────────────────────────────────────────────────────────────────────────
# WL-P3-65 — branch-mutation guard for LINKED WORKTREES (the checkout shape of
# the shared-ref-store hazard). Added SESSION_0624.
#
# THE BUG THIS STOPS
# ------------------
# Worktrees share one ref store, and each linked worktree has its own HEAD. Run
# a HEAD-moving git command with a stale $PWD — an agent shell's cwd PERSISTS
# between calls and is invisible unless printed — and you silently redirect a
# SIBLING lane's HEAD onto your branch.
#
#   SESSION_0588: a lane's `git checkout <its-branch>` in the shared tree moved
#                 HEAD, so a sibling's next commit landed on the wrong branch.
#   SESSION_0624: `git checkout -b` ran with cwd still inside ../ronin-wl-lane
#                 and moved that lane onto the agent's branch.
#
# The FS-0039/FS-0040 pre-push hook cannot see this: it fires on PUSH, and this
# is a CHECKOUT. Git has no pre-checkout hook, so the shell is the only layer
# that can REFUSE. Being a sourced shell function, this sees the real $PWD and
# works for any runtime (Claude Code, Codex, Copilot, a human shell).
#
# THE RULE
# --------
# Inside a LINKED worktree (git-dir != git-common-dir), refuse git commands that
# MOVE HEAD or force-move a ref. File-level `git checkout -- <path>` /
# `git checkout <existing-path>` are NOT blocked — those are restores, not
# branch switches.
#
# Bypass (same convention as the FS-0024 rule): RONIN_GUARD_BYPASS=1 git ...

_ronin_linked_worktree() {
  # 0 = we are inside a LINKED worktree; 1 = canonical, or not a repo at all.
  _gd=$(command git rev-parse --git-dir 2>/dev/null) || return 1
  _cd=$(command git rev-parse --git-common-dir 2>/dev/null) || return 1
  # Relative forms ('.git') mean canonical; compare resolved absolute paths.
  _gd=$(cd "$_gd" 2>/dev/null && pwd) || return 1
  _cd=$(cd "$_cd" 2>/dev/null && pwd) || return 1
  [ "$_gd" != "$_cd" ]
}

_ronin_moves_head() {
  # $1 = git subcommand, rest = its args. 0 = this would move HEAD / force a ref.
  _sub="$1"; shift
  case "$_sub" in
    checkout|switch)
      for _a in "$@"; do
        case "$_a" in
          --) return 1 ;;                    # everything after -- is a path: a restore
          -b|-B|-c|-C|--orphan) return 0 ;;  # explicitly creates/moves onto a branch
          -*) ;;                             # other flags: keep looking
          *)
            # First bare arg: a real path is a restore; anything else is a ref.
            [ -e "$_a" ] && return 1
            return 0 ;;
        esac
      done
      return 1 ;;                            # bare `git checkout` / `git switch`: no-op
    branch)
      for _a in "$@"; do
        case "$_a" in -f|--force|-M|-D) return 0 ;; esac
      done
      return 1 ;;
    reset)
      for _a in "$@"; do
        case "$_a" in --hard) return 0 ;; esac
      done
      return 1 ;;
    worktree) return 1 ;;                    # `worktree add -b` is the SUPPORTED way to branch
    *) return 1 ;;
  esac
}

_ronin_refuse_branch_mutation() {
  _wt=$(command git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")
  _br=$(command git symbolic-ref -q --short HEAD 2>/dev/null || echo '(detached)')
  _canon=$(cd "$(command git rev-parse --git-common-dir)/.." 2>/dev/null && pwd)
  cat >&2 <<EOF
[WL-P3-65 GUARD] Refusing a HEAD-moving git command inside a LINKED WORKTREE.

  cwd:        $PWD
  worktree:   $_wt
  its branch: $_br          <-- this is the branch you are about to move
  canonical:  $_canon

Worktrees share one ref store. Moving HEAD here retargets THIS lane's worktree —
if it is a sibling's lane, you have just hijacked their checkout, silently.
An agent shell's cwd persists between calls, which is how this happens by accident.

Did you mean to act on canonical? Then be explicit — never rely on cwd:
  git -C $_canon <your command>

Genuinely meant to move THIS worktree (it is yours)?
  RONIN_GUARD_BYPASS=1 git <your command>

New lane? Create it as its own worktree instead of switching branches in one:
  git -C $_canon worktree add ../ronin-NNNN -b session-NNNN-<lane> main

Refs: WL-P3-65, FS-0039/FS-0040 (the push shape), SESSION_0588, SESSION_0624.
EOF
  return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# WL-P3-67 — SHARED-STASH guard. Added SESSION_0624.
#
# THE BUG THIS STOPS
# ------------------
# `refs/stash` lives in the SHARED ref store, so every worktree sees ONE stash stack.
# `git stash pop` / `drop` / `apply` in lane B silently operates on lane A's entry —
# and `pop`/`drop` DESTROY it. Uncommitted work is the one thing git cannot recover.
# Verified SESSION_0624: canonical listed `stash@{0}: WIP on lane-1` created in a
# different worktree.
#
# This is the mechanism behind the existing "review subagents `git stash` wiped my
# uncommitted edits" note — previously recorded as a symptom without a cause.
#
# THE RULE
# --------
# `git stash pop|drop|apply|clear|branch` is refused when the stack's top entry was
# created in a DIFFERENT worktree than the one you are standing in. Plain `git stash`
# (push) and `git stash list|show` are always allowed — creating and reading are safe;
# only consuming someone else's entry is not.
#
# Bypass: RONIN_GUARD_BYPASS=1 git stash pop ...

_ronin_stash_is_foreign() {
  # 0 = top stash entry belongs to ANOTHER worktree. Conservative: any doubt -> 1 (allow),
  # so this can annoy nobody into disabling the whole guard.
  command git rev-parse --verify --quiet refs/stash >/dev/null 2>&1 || return 1
  _here=$(command git rev-parse --show-toplevel 2>/dev/null) || return 1
  # Each stash commit's message records the branch it was made on: "WIP on <branch>: ...".
  _msg=$(command git log -1 --format='%s' refs/stash 2>/dev/null) || return 1
  _stash_branch=$(printf '%s' "$_msg" | sed -n 's/^[A-Za-z ]*on \([^:]*\):.*/\1/p')
  [ -n "$_stash_branch" ] || return 1
  _my_branch=$(command git symbolic-ref -q --short HEAD 2>/dev/null) || return 1
  [ "$_stash_branch" != "$_my_branch" ]
}

_ronin_refuse_stash() {
  _msg=$(command git log -1 --format='%s' refs/stash 2>/dev/null)
  cat >&2 <<EOF
[WL-P3-67 GUARD] Refusing to consume a stash entry created in ANOTHER worktree.

  you are on:   $(command git symbolic-ref -q --short HEAD 2>/dev/null || echo '(detached)')
  stash@{0}:    $_msg

Worktrees share ONE stash stack (refs/stash is in the shared ref store). This entry
was made on a different branch — almost certainly a sibling lane's uncommitted work.
\`pop\` and \`drop\` DESTROY it, and uncommitted work is the one thing git cannot recover.

  git stash list                     # see whose entries these are
  git -C <that-lane-path> stash pop  # let the owning lane pop its own

Genuinely yours (e.g. you switched branches after stashing)?
  RONIN_GUARD_BYPASS=1 git stash pop

Refs: WL-P3-67, WL-P3-65 (checkout shape), FS-0039/FS-0040 (push shape).
EOF
  return 1
}

_ronin_stash_consumes() {
  case "${1:-}" in
    pop|drop|apply|clear|branch) return 0 ;;
    *) return 1 ;;
  esac
}

# Final git() wrapper — runs ALL THREE rules. Defined last so it supersedes the
# plain _ronin_wrap definition earlier in this file.
#   FS-0024   refuse anything inside the read-only DirStarter template
#   WL-P3-65  refuse HEAD-moving commands inside a linked worktree
#   WL-P3-67  refuse consuming a stash entry from another worktree
git() {
  if [ "${RONIN_GUARD_BYPASS:-0}" != "1" ]; then
    if _ronin_linked_worktree && _ronin_moves_head "$@"; then
      _ronin_refuse_branch_mutation
      return 1
    fi
    if [ "${1:-}" = "stash" ] && _ronin_stash_consumes "${2:-}" && _ronin_stash_is_foreign; then
      _ronin_refuse_stash
      return 1
    fi
  fi
  _ronin_wrap git "$@"
}
