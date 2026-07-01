# Claude Code hooks + cross-LLM shell guards

This directory holds the source-of-truth copies of the operator-side hooks and shell guards that enforce repo discipline. The live copies are at `~/.claude/hooks/` and `~/.shell-guards/`; everything here is what gets installed into those paths.

Origin: SESSION_0210 (2026-05-20). After three repeats of FS-0024 (Bash cwd drift to the read-only DirStarter template) in three separate sessions, memory + docs were insufficient — moved enforcement into the harness.

## Hook map

| Layer | Event | Matcher | Script | Behavior |
|---|---|---|---|---|
| Claude Code | `PreToolUse` | `Bash` | `ronin-cwd-guard.sh` | Block Bash calls referencing `git`/`gh`/`pnpm`/`bun`/`vercel`/`graphify` or workspace paths unless prefixed with `cd /Users/brianscott/dev/ronin-dojo-app`. Honors `RONIN_GUARD_BYPASS=1` as escape hatch. Pairs with [FS-0024](../../docs/protocols/failed-steps-log.md). |
| Claude Code | `PreToolUse` | `Write\|Edit\|NotebookEdit` | `dirstarter-readonly-guard.sh` | Block any write whose `file_path` is under `/Users/brianscott/Local Sites/DirStarter /dirstarter_template/`. Catches the OTHER half of FS-0024 — accidental writes into the purchased read-only template. |
| Claude Code | `PostToolUse` | `Bash` | `oxlint-fix-nudge.sh` | After any `oxlint … --fix` batch, emit a `systemMessage` reminding to follow up with `tsc --noEmit`. Pairs with [FS-0023 / auto-fixer JSX blindspot](../../docs/protocols/failed-steps-log.md). |
| Claude Code | `PostToolUse` | `Write\|Edit` | `env-shape-check.sh` | When a `.env*` file is written/edited, shape-check each `KEY=VALUE` (Stripe `sk_…` prefix + length, `whsec_…`, Resend `re_…`, AWS `AKIA…`, `DATABASE_URL` URI shape, placeholder red flags). Emits `systemMessage` with anomalies; never blocks. |
| Claude Code | `Stop` | _(any)_ | `bowout-vercel-check.sh` | If `main` got a commit in the last 30 min, probe `vercel ls` and emit a `systemMessage` if latest Production deploy isn't Ready. Pairs with bow-out Vercel-Ready discipline. |
| Claude Code | `Stop` | _(any)_ | `bowout-reminder.sh` | Non-blocking close reminder. When the highest SESSION file is `status: in-progress`, the tree is dirty, and `## What landed` is non-empty (near-close), emit a `systemMessage` to run `bash scripts/bow-out-gates.sh` then finish the SESSION file + hold at the push gate. De-nags off the `.git/.bow-out-gates-ran` sentinel. Pairs with SESSION_0476 P0 (bow-out leaning). |
| Claude Code | `PreToolUse` | `Write\|Edit` | `test-writing-reminder.sh` | When a `*.test.*` file is created/edited, inject a reminder to read `sop-test-writing.md` FIRST (the `--parallel=1` two-headed-concurrency rule + §5d rolled-back-tx). Non-blocking `additionalContext`. Pairs with [FS-0027](../../docs/protocols/failed-steps-log.md). |
| Claude Code | `PreToolUse` | `Bash` | `bash-discipline-reminders.sh` | Two `additionalContext` nudges: (1) a bare multi-file `bun test` (not `bun run test`, no `--parallel`) → use `bun run test` (FS-0027); (2) `git push` / `gh pr merge\|create` / `vercel` prod deploy → explicit-push-authorization reminder. Never blocks. |
| Cross-LLM | shell init | _(any)_ | `../shell-guards/ronin-cwd-guard.sh` | Defines `git`/`gh`/`pnpm`/`bun`/`vercel`/`graphify` as shell functions that refuse to run when `$PWD` is inside the dirstarter template. Works for Claude Code, GitHub Copilot CLI, OpenAI Codex CLI, Cursor agents — anything that uses the user's shell. |

## Install

```bash
# 1. Copy Claude Code hooks into ~/.claude/hooks/
mkdir -p ~/.claude/hooks
cp .claude/hooks/*.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh

# 2. Copy cross-LLM shell guard into ~/.shell-guards/
mkdir -p ~/.shell-guards
cp .claude/shell-guards/ronin-cwd-guard.sh ~/.shell-guards/
chmod +x ~/.shell-guards/ronin-cwd-guard.sh

# 3. Wire shell guard into zsh + bash startup.
# In ~/.zshenv (after PATH setup):
#   if [ -f "$HOME/.shell-guards/ronin-cwd-guard.sh" ]; then
#     . "$HOME/.shell-guards/ronin-cwd-guard.sh"
#     export BASH_ENV="$HOME/.shell-guards/ronin-cwd-guard.sh"
#   fi
# In ~/.bashrc (create if missing):
#   if [ -f "$HOME/.shell-guards/ronin-cwd-guard.sh" ]; then
#     . "$HOME/.shell-guards/ronin-cwd-guard.sh"
#   fi

# 4. Register Claude Code hooks in ~/.claude/settings.json.
# See settings.json.snippet below.
```

### settings.json snippet for `~/.claude/settings.json`

Merge under the top-level object (preserve any existing `permissions`/`model`/etc):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "/Users/brianscott/.claude/hooks/ronin-cwd-guard.sh", "timeout": 5 }
        ]
      },
      {
        "matcher": "Write|Edit|NotebookEdit",
        "hooks": [
          { "type": "command", "command": "/Users/brianscott/.claude/hooks/dirstarter-readonly-guard.sh", "timeout": 5 }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "/Users/brianscott/.claude/hooks/oxlint-fix-nudge.sh", "timeout": 5 }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "/Users/brianscott/.claude/hooks/env-shape-check.sh", "timeout": 10 }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "/Users/brianscott/.claude/hooks/bowout-vercel-check.sh", "timeout": 15 }
        ]
      }
    ]
  }
}
```

## Bypass

For the rare legitimate cross-workspace operation, prefix with the bypass env var:

```bash
RONIN_GUARD_BYPASS=1 git -C ~/.claude status
```

Both the shell wrapper and the Claude `ronin-cwd-guard` PreToolUse hook honor this prefix.

## Inspect / disable

In any Claude Code session: `/hooks` to view, edit, or disable.
