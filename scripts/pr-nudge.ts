#!/usr/bin/env bun
/**
 * pr-nudge.ts — bow-in SessionStart nudge (G-007, SESSION_0466).
 *
 * Queries open PRs (via `gh`) and prints ONE line **iff any are open**, routing the default lane to
 * `/pr-fix-loop` and calling out red-CI / changes-requested PRs (the P1s). Reuses the SAME shared
 * `parsePullRequests` the loop-board + `ledger-backlog.ts` use, so the ranking is identical everywhere.
 *
 * Safe-by-design as a hook: silent + `exit 0` when there are no open PRs, when `gh` is absent /
 * unauthenticated, or when the cwd isn't a repo — so it never blocks or noises up an unrelated session.
 */

import { execFileSync } from "node:child_process"
import { resolve } from "node:path"
import { parsePullRequests, type PullRequestJson } from "../apps/web/lib/loop-board/ledger-parse"

try {
  const out = execFileSync(
    "gh",
    [
      "pr",
      "list",
      "--state",
      "open",
      "--limit",
      "100",
      "--json",
      "number,title,headRefName,isDraft,reviewDecision,statusCheckRollup",
    ],
    { cwd: resolve(import.meta.dir, ".."), encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
  )
  const items = parsePullRequests(JSON.parse(out) as PullRequestJson[]).sort((a, b) =>
    a.priority !== b.priority
      ? a.priority.localeCompare(b.priority) // P1 before P2
      : a.id.localeCompare(b.id, undefined, { numeric: true }),
  )
  if (items.length > 0) {
    const red = items.filter(i => i.priority === "P1")
    const ids = items.map(i => i.id).join(" ")
    const redNote = red.length
      ? `${red.length} red-CI/changes-requested (${red.map(r => r.id).join(" ")})`
      : "all clean/draft"
    console.log(
      `🔁 PR backlog: ${items.length} open — ${ids} · ${redNote}. ` +
        `If no lane is pinned, the default is /pr-fix-loop (opening.md §1c).`,
    )
  }
} catch {
  // gh absent / unauthenticated / non-repo cwd — stay silent, never block the session.
}
process.exit(0)
