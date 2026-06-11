---
title: Session Ops Cookbook — real commands run per session
slug: session-ops-cookbook
type: reference
status: active
created: 2026-06-10
updated: 2026-06-11
last_agent: claude-session-0360
pairs_with:
  - docs/runbooks/dev-environment/verification-and-testing.md
  - docs/runbooks/dev-environment/dev-environment.md
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
parent: ""
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/ronin-project-context.md
  - docs/runbooks/dev-environment/mcp-usage-runbook.md
  - docs/runbooks/README.md
needs_fix: []
bug_flags: []
wiring: []
tags:
  - dev-environment
  - operations
  - reference
---

# Session Ops Cookbook

A growing, copy-pasteable reference of the **actual commands** run during sessions — git, bash, gates,
toolchain installs, and verification — so future sessions (and the operator's own review) can reuse proven
recipes instead of re-deriving them. One section per session, newest first. Pairs with
[verification-and-testing](verification-and-testing.md) (the gate definitions) and
[dev-environment](dev-environment.md) (the toolchain).

> Convention: each entry lists the command, then a one-line **why/gotcha**. Secrets are never pasted —
> use the Stripe CLI's stored auth or hosted-MCP OAuth, not raw keys.

---

## SESSION_0360 — Bun + Oxc migration + Dirstarter dep uplift

### Oxc gates (lint / format / typecheck)

```bash
# Run the binaries DIRECTLY from the hoisted workspace bin — NEVER `bunx oxlint`/`bunx oxfmt`.
# Gotcha (this session): `bunx oxfmt .` hung ~24 min — bunx tried to resolve/fetch instead of
# using the local binary. The direct binary formats 1227 files in ~0.5s.
node_modules/.bin/oxlint .                  # lint:check  → exit 0 = pass (warnings don't fail)
node_modules/.bin/oxfmt --check .           # format:check → exit 0 = clean
node_modules/.bin/oxfmt path/to/file.tsx    # write-format a single file
cd apps/web && bun run typecheck            # next typegen && tsc --noEmit (the slow gate)

# Whole-tree, via package scripts (read-only CI gates):
cd apps/web && bun run lint:check && bun run format:check
```

### Bulk biome → oxc source conversion

```bash
# Convert 13 `// biome-ignore lint/<cat>/<rule>: …` suppressions to oxlint directives across many files.
# A single scoped perl pass beats N per-file edits when the shape is uniform.
perl -0pi -e '
s{biome-ignore lint/a11y/useMediaCaption:}{oxlint-disable-next-line jsx-a11y/media-has-caption --}g;
s{biome-ignore lint/a11y/noLabelWithoutControl:}{oxlint-disable-next-line jsx-a11y/label-has-associated-control --}g;
s{biome-ignore lint/a11y/useSemanticElements:}{oxlint-disable-next-line jsx-a11y/prefer-tag-over-role --}g;
s{biome-ignore lint/suspicious/noExplicitAny:}{oxlint-disable-next-line typescript/no-explicit-any --}g;
s{biome-ignore lint/suspicious/noAssignInExpressions:}{oxlint-disable-next-line no-cond-assign --}g;
' file1.tsx "apps/web/app/(web)/techniques/[slug]/page.tsx"   # quote paths with ()/[]
```

### Rename a wired hook (repo copy + live global copy + settings.json)

```bash
git rm .claude/hooks/biome-unsafe-nudge.sh            # tracked repo copy
rm -f /Users/brianscott/.claude/hooks/biome-unsafe-nudge.sh   # untracked live copy
chmod +x .claude/hooks/oxlint-fix-nudge.sh /Users/brianscott/.claude/hooks/oxlint-fix-nudge.sh
# settings.json wiring (untracked global) — see JSON transform below
```

### JSON-safe edit of a large settings.json (remove entries, rename a value)

```bash
cp ~/.claude/settings.json ~/.claude/settings.json.bak   # always back up an untracked global first
# Line-based filter keeps formatting; deletes biome perm lines, renames the hook path, re-parses to validate.
/usr/bin/python3 - <<'PY'
import json
raw=open('settings.json').read(); out=[]
for line in raw.split('\n'):
    if 'biome' not in line.lower(): out.append(line); continue
    if '"command"' in line and 'biome-unsafe-nudge.sh' in line:
        out.append(line.replace('biome-unsafe-nudge.sh','oxlint-fix-nudge.sh')); continue
    # else: drop the permissions.allow entry
new='\n'.join(out); json.loads(new)  # raises if invalid
open('settings.json','w').write(new)
PY
```

### Dependency uplift (version parity to the in-repo Dirstarter template)

```bash
# Reference = the read-only purchased boilerplate (NEVER build/write there — FS-0024):
#   "/Users/brianscott/Local Sites/DirStarter /dirstarter_template/package.json"
# Bump overlapping deps with a scoped perl pass on the ONE package.json, then validate JSON:
perl -pi -e 's{"typescript": "5\.9\.3"}{"typescript": "^6.0.3"}; s{"stripe": "\^18\.5\.0"}{"stripe": "^22.1.1"};' apps/web/package.json
/usr/bin/python3 -c "import json; json.load(open('apps/web/package.json')); print('VALID')"

# Refresh the lockfile — STOP the dev server first (panic lesson: `bun add`/`install` under
# `next dev --turbo` crashes Turbopack HMR mid-write):
pkill -f "next dev"; pkill -f "next-server"
bun install                       # updates root bun.lock; runs trusted postinstalls (prisma generate)
cd apps/web && bun run typecheck  # capture breakage from majors (this uplift: only 2 Stripe fixes)
```

### Stripe 22 (`dahlia`) verification — Stripe CLI, test mode, read-only

```bash
stripe version
# Confirm an expand path is ACCEPTED by a specific API version (invalid expands 400; types can't catch this):
stripe promotion_codes list --limit 1 \
  --stripe-version 2026-05-27.dahlia \
  --expand "data.promotion.coupon.applies_to"
# CLI param syntax: generic `-d key=value` (older CLIs lack resource flags like `--coupon`):
stripe coupons create --percent-off 10 --duration once
stripe promotion_codes create -d coupon=<id> -d code=<code>
stripe coupons delete <id> --confirm          # clean up throwaway test fixtures (no cruft)
# Authoritative type check for an API version = the generated SDK .d.ts:
grep -nE "interface PromotionCode|coupon" node_modules/stripe/esm/resources/PromotionCodes.d.ts
```

### Toolchain installs

```bash
brew upgrade stripe                                   # Stripe CLI 1.35.1 → 1.42.11
claude mcp list                                       # show MCP servers + health
# Hosted Stripe MCP via OAuth (no API key in any file); authenticate later with `/mcp`:
claude mcp add --transport http stripe https://mcp.stripe.com --scope user
```

> Note: the **Claude CLI** (`~/.local/bin/claude`) is the running client — there is no standalone "Claude MCP"
> server to install. Claude Code is the MCP *host*; you add *servers* (playwright, stripe, …) to it.

### Close (single-push order — FS-0025)

```bash
GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .       # index the working tree BEFORE the commit
bun run wiki:lint                                      # docs gate (run from repo root)
git add -A && git status                               # review; no secrets/.env/node_modules
git commit -m "build(toolchain): …"                   # conventional; hash reported in chat, not chased
git push origin main                                  # standing authorization; run FS-0024 guard first
```
