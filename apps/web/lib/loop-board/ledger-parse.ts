/**
 * ledger-parse — the pure, content-in ledger aggregator (Loop-of-Loops P2/P3).
 *
 * Extracted from `scripts/ledger-backlog.ts` so ONE parser serves both consumers:
 *   - the bow-in CLI (`scripts/ledger-backlog.ts`) — reads the ledgers from disk, and
 *   - the `/app/loop-board` server projection — fetches them from the public `main` branch.
 *
 * SELF-CONTAINED on purpose: no `fs`, no network, no `~/` path aliases, no React. Parsing is
 * pure string→`Item[]`; the caller supplies each ledger's raw markdown. Keep it that way so the
 * root CLI can import it under bun without inheriting the Next tsconfig.
 */

export type LedgerCode =
  | "GL"
  | "PR"
  | "FS"
  | "D"
  | "WL"
  | "FI"
  | "MB"
  | "TFF"
  | "INC"
  | "RISK"
  | "TD"
  | "PL"
  | "RLL"
  | "YLL"
  | "GPTLL"
  | "DBS"

/** A ledger code that is backed by a markdown file on disk / `main` (everything except live `PR`). */
export type FileLedgerCode = Exclude<LedgerCode, "PR">

export type Priority = "P0" | "P1" | "P2" | "—"

export type Item = {
  id: string
  ledger: LedgerCode
  priority: Priority
  status: string
  summary: string
}

/**
 * Stable display + ranking order across the governance ledgers. Goals (`GL`) lead the backlog; the
 * live `PR` source rides right behind them (open PRs are actionable work-in-flight, above static debt).
 */
export const LEDGER_ORDER: LedgerCode[] = [
  "GL",
  "PR",
  "FS",
  "D",
  "WL",
  "FI",
  "MB",
  "TFF",
  "INC",
  "RISK",
  "TD",
  // Intake ledgers (SESSION_0589/0591) — planning + link-capture + daily-scan findings, appended
  // after the existing governance codes rather than interspersed (behavior-preserving order).
  "PL",
  "RLL",
  "YLL",
  "GPTLL",
  "DBS",
]

/**
 * Repo-relative path of each FILE-backed ledger (the inbound sources from the design doc + security
 * register). `PR` is intentionally absent: it is a LIVE source (queried from `gh` / the GitHub API),
 * not a markdown file — so the disk reader + the `main`-branch fetch iterate `LEDGER_FILES`, while `PR`
 * items arrive via `parsePullRequests` and ride into the backlog through `aggregateFromContents`'
 * `extraItems` channel.
 */
export const LEDGER_FILES: Record<FileLedgerCode, string> = {
  GL: "docs/knowledge/wiki/goals-ledger.md",
  FS: "docs/protocols/failed-steps-log.md",
  D: "docs/knowledge/wiki/drift-register.md",
  WL: "docs/knowledge/wiki/wiring-ledger.md",
  FI: "docs/product/black-belt-legacy/POST_LAUNCH_SOT.md",
  MB: "docs/knowledge/wiki/manual-boundary-registry.md",
  TFF: "docs/knowledge/wiki/test-fail-fix-ledger.md",
  INC: "docs/knowledge/wiki/incidents.md",
  RISK: "docs/security/ronin-security-risk-register.md",
  TD: "docs/knowledge/wiki/teardown-ledger.md",
  PL: "docs/knowledge/wiki/planning-ledger.md",
  RLL: "docs/knowledge/wiki/reddit-links-ledger.md",
  YLL: "docs/knowledge/wiki/youtube-links-ledger.md",
  GPTLL: "docs/knowledge/wiki/chatgpt-links-ledger.md",
  DBS: "docs/knowledge/wiki/daily-bug-scan-ledger.md",
}

/** File-backed ledger codes in display order — the disk reader + `main`-branch fetch iterate this. */
export const FILE_LEDGER_ORDER: FileLedgerCode[] = LEDGER_ORDER.filter(
  (c): c is FileLedgerCode => c !== "PR",
)

const PRI_SCORE: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, "—": 3 }

// --- shared parsing helpers ------------------------------------------------

/** Split markdown into `#`-heading sections at an exact level (3 or 4). */
function sections(content: string, level: number): { heading: string; body: string }[] {
  const prefix = `${"#".repeat(level)} `
  const out: { heading: string; body: string }[] = []
  let cur: { heading: string; body: string } | null = null
  for (const line of content.split("\n")) {
    if (line.startsWith(prefix) && line[level] !== "#") {
      if (cur) out.push(cur)
      cur = { heading: line.slice(prefix.length).trim(), body: "" }
    } else if (cur) {
      cur.body += `${line}\n`
    }
  }
  if (cur) out.push(cur)
  return out
}

/** Pull the `- **Status:** …` value out of a section body. */
function statusOf(body: string): string {
  const m = body.match(/[-*]\s*\*\*Status:?\*\*\s*(.+)/i)
  return m ? m[1].trim() : ""
}

/** Parse pipe-table rows (skips the separator + any header row). */
function tableRows(content: string, headerCell0: string): string[][] {
  const rows: string[][] = []
  for (const raw of content.split("\n")) {
    const t = raw.trim()
    if (!t.startsWith("|")) continue
    if (/^\|[\s:|-]+\|?$/.test(t)) continue // separator row
    const cells = t
      .split("|")
      .slice(1, -1)
      .map(c => c.trim())
    if (cells[0] === headerCell0) continue // header row
    rows.push(cells)
  }
  return rows
}

/** Heading "ID — title" → { id, title }. */
function splitHeading(heading: string): { id: string; title: string } {
  const m = heading.match(/^([A-Za-z0-9.\-_/]+)\s*[—–-]\s*(.+)$/)
  return m ? { id: m[1], title: m[2] } : { id: heading.split(/\s+/)[0], title: heading }
}

/** Tidy a cell/title into a one-line summary (strip md links/backticks/bold). */
function clean(s: string, max = 96): string {
  const t = s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

const priFromTag = (s: string): Priority =>
  /\bP0\b/.test(s) ? "P0" : /\bP1\b/.test(s) ? "P1" : /\bP2\b/.test(s) ? "P2" : "—"

/**
 * Heading "ID — title — status" (status appended inline, no separate `- **Status:**` body line —
 * the intake ledgers' convention: PL/RLL/YLL/GPTLL/DBS). Status is everything after the LAST
 * ` — `/` – ` (em/en dash with surrounding spaces) so hyphenated words in the title/status
 * ("content-pending", "fix-made") never get mistaken for a separator.
 */
function splitHeadingWithInlineStatus(heading: string): {
  id: string
  title: string
  status: string
} {
  const m = heading.match(/^([A-Za-z0-9.\-_/]+)\s*[—–-]\s*(.+)$/)
  if (!m) return { id: heading.split(/\s+/)[0], title: heading, status: "" }
  const id = m[1]
  const rest = m[2]
  const sep = /\s[—–]\s/g
  let lastIdx = -1
  let lastLen = 0
  let hit: RegExpExecArray | null
  // biome-ignore lint: intentional last-match scan
  while ((hit = sep.exec(rest))) {
    lastIdx = hit.index
    lastLen = hit[0].length
  }
  if (lastIdx === -1) return { id, title: rest, status: "" }
  return { id, title: rest.slice(0, lastIdx).trim(), status: rest.slice(lastIdx + lastLen).trim() }
}

/** Closed-state prefixes for the inline-status intake ledgers (done/rejected/✅-ratified/merged). */
const isClosedInline = (status: string): boolean =>
  /^\s*(✅|done\b|resolved\b|fixed\b|rejected\b|merged\b)/i.test(status)

function parseInlineStatusSectioned(
  content: string,
  ledger: LedgerCode,
  level: number,
  idRe: RegExp,
): Item[] {
  return sections(content, level)
    .filter(s => idRe.test(s.heading))
    .map(s => splitHeadingWithInlineStatus(s.heading))
    .filter(s => !isClosedInline(s.status))
    .map(s => ({
      id: s.id,
      ledger,
      priority: priFromTag(`${s.status} ${s.title}`),
      status: clean(s.status || "open", 17),
      summary: clean(s.title),
    }))
}

// --- per-ledger extractors -------------------------------------------------

function parseSectioned(
  content: string,
  ledger: LedgerCode,
  level: number,
  idRe: RegExp,
  isOpen: (status: string) => boolean,
): Item[] {
  return sections(content, level)
    .filter(s => idRe.test(s.heading))
    .map(s => {
      const { id, title } = splitHeading(s.heading)
      return { id, title, status: statusOf(s.body) }
    })
    .filter(s => isOpen(s.status))
    .map(s => ({
      id: s.id,
      ledger,
      priority: priFromTag(`${s.status} ${s.title}`),
      status: clean(s.status || "open", 17),
      summary: clean(s.title),
    }))
}

function parseWiring(content: string): Item[] {
  return tableRows(content, "ID")
    .filter(c => /^WL-P\d/.test(c[0] ?? ""))
    .filter(c => {
      // ✅ is the wiring-ledger's "Fixed/Resolved" marker — it lands in the status cell
      // normally, but a few resolved rows carry it appended to the ID cell instead.
      const status = c[c.length - 1] ?? ""
      return !c[0].includes("✅") && !/^\s*(✅|done\b|resolved\b|fixed\b)/i.test(status)
    })
    .map(c => ({
      id: c[0],
      ledger: "WL" as const,
      priority: (c[0].match(/WL-(P\d)/)?.[1] as Priority) ?? "—",
      status: "open",
      summary: clean(c[3] ?? c[1] ?? ""),
    }))
}

function parseFeatureIntake(content: string): Item[] {
  return tableRows(content, "ID")
    .filter(c => /^FI-\d/.test(c[0] ?? ""))
    .filter(c => /triaged|in[\s-]?progress/i.test(c[4] ?? ""))
    .map(c => ({
      id: c[0],
      ledger: "FI" as const,
      priority: priFromTag(c[3] ?? ""),
      status: clean(c[4] ?? "", 16),
      summary: clean(c[1] ?? ""),
    }))
}

function parseIncidents(content: string): Item[] {
  return tableRows(content, "Date")
    .filter(c => c.length >= 6 && /^\d{4}-\d{2}-\d{2}$/.test(c[0] ?? ""))
    .filter(c => (c[5] ?? "").length === 0) // empty "Resolved by" → still open
    .map(c => ({
      id: `${c[0]}/${c[1]}`,
      ledger: "INC" as const,
      priority: "P0" as const, // an unresolved incident is always top-of-mind
      status: "unresolved",
      summary: clean(`${c[2]}: ${c[3]}`),
    }))
}

function parseRisk(content: string): Item[] {
  return tableRows(content, "Priority")
    .filter(c => /^\d+$/.test(c[0] ?? ""))
    .filter(c => {
      const row = c.join(" | ")
      return !/~~|superseded|shelved|→\s*N\/A|✅|\bresolved\b|confirmed fixed/i.test(row)
    })
    .map(c => {
      const sev = c[2] ?? ""
      const priority: Priority = /critical/i.test(sev) ? "P0" : /high/i.test(sev) ? "P1" : "P2"
      return {
        id: `#${c[0]}`,
        ledger: "RISK" as const,
        priority,
        status: clean(sev || "open", 16),
        summary: clean(c[1] ?? ""),
      }
    })
}

// --- live PR source (G-007) ------------------------------------------------

/**
 * The slice of `gh pr list --json number,title,headRefName,isDraft,reviewDecision,statusCheckRollup`
 * this parser reads. The same shape is produced server-side by a GitHub GraphQL query (gh uses GraphQL
 * under the hood), so ONE pure parser serves both the bow-in CLI and the `/app/loop-board` projection.
 */
export type PullRequestJson = {
  number: number
  title: string
  headRefName?: string
  isDraft?: boolean
  /** "" | "APPROVED" | "CHANGES_REQUESTED" | "REVIEW_REQUIRED" */
  reviewDecision?: string
  /** Mixed CheckRun (`conclusion`/`status`) + StatusContext (`state`) entries, per the gh JSON. */
  statusCheckRollup?: Array<{
    __typename?: string
    /** CheckRun check name. */
    name?: string
    /** StatusContext name (e.g. "Vercel", "CodeRabbit"). */
    context?: string
    /** CheckRun terminal outcome — SUCCESS | FAILURE | TIMED_OUT | CANCELLED | ACTION_REQUIRED | … */
    conclusion?: string
    /** CheckRun lifecycle — QUEUED | IN_PROGRESS | COMPLETED. */
    status?: string
    /** StatusContext rollup state — SUCCESS | FAILURE | ERROR | PENDING | EXPECTED. */
    state?: string
  }>
}

/** CheckRun `conclusion` values that mean the check failed (a red CI signal). */
const FAILED_CONCLUSIONS = new Set([
  "FAILURE",
  "TIMED_OUT",
  "CANCELLED",
  "ACTION_REQUIRED",
  "STARTUP_FAILURE",
  "STALE",
])
/** StatusContext `state` values that mean the external check failed. */
const FAILED_STATES = new Set(["FAILURE", "ERROR"])

/** A PR is "red" when review is changes-requested OR any rollup check failed. */
function isPullRequestRed(pr: PullRequestJson): boolean {
  if ((pr.reviewDecision ?? "").toUpperCase() === "CHANGES_REQUESTED") return true
  for (const c of pr.statusCheckRollup ?? []) {
    if (FAILED_CONCLUSIONS.has((c.conclusion ?? "").toUpperCase())) return true
    if (FAILED_STATES.has((c.state ?? "").toUpperCase())) return true
  }
  return false
}

/**
 * Parse open PRs into backlog `Item[]`. Rank: red CI / changes-requested = **P1**, draft or clean =
 * **P2** (then by age — the caller passes PRs oldest-first and `rankItems` keeps PR-number ascending
 * within a priority). The id is `#<number>` (ledger-scoped to `PR`, so it never collides with RISK's
 * `#<n>`). Pure: no `gh`, no network — the caller supplies the already-fetched JSON.
 */
export function parsePullRequests(prs: PullRequestJson[]): Item[] {
  return prs.map(pr => {
    const red = isPullRequestRed(pr)
    const status = red ? "red-ci" : pr.isDraft ? "draft" : "open"
    return {
      id: `#${pr.number}`,
      ledger: "PR" as const,
      priority: (red ? "P1" : "P2") as Priority,
      status,
      summary: clean(`#${pr.number} ${pr.title}`),
    }
  })
}

/** Parse ONE ledger's raw markdown into its open `Item[]`. */
export function parseLedger(code: FileLedgerCode, content: string): Item[] {
  switch (code) {
    case "GL":
      return parseSectioned(
        content,
        "GL",
        3,
        /^G-\d/,
        s => /^(open|in[-\s]?progress|active)\b/i.test(s) || /pending/i.test(s),
      )
    case "FS":
      return parseSectioned(
        content,
        "FS",
        3,
        /^FS-\d/,
        s => /\bopen\b/i.test(s) || /pending/i.test(s),
      )
    case "D":
      return parseSectioned(content, "D", 3, /^D-\d/, s => /^open\b/i.test(s) || /pending/i.test(s))
    case "MB":
      return parseSectioned(content, "MB", 4, /^MB-\d/, s => /^open\b/i.test(s))
    case "TFF":
      return parseSectioned(content, "TFF", 3, /^TFF-\d+\b/, s => /\bopen\b|investigating/i.test(s))
    case "WL":
      return parseWiring(content)
    case "FI":
      return parseFeatureIntake(content)
    case "INC":
      return parseIncidents(content)
    case "RISK":
      return parseRisk(content)
    case "TD":
      return parseSectioned(
        content,
        "TD",
        3,
        /^TD-\d/,
        s => /^open\b/i.test(s) || /pending/i.test(s),
      )
    case "PL":
      return parseInlineStatusSectioned(content, "PL", 3, /^PL-\d/)
    case "RLL":
      return parseInlineStatusSectioned(content, "RLL", 3, /^RLL-\d/)
    case "YLL":
      return parseInlineStatusSectioned(content, "YLL", 3, /^YLL-\d/)
    case "GPTLL":
      return parseInlineStatusSectioned(content, "GPTLL", 3, /^GPTLL-\d/)
    case "DBS":
      return parseInlineStatusSectioned(content, "DBS", 3, /^DBS-\d/)
  }
}

/** Rank: priority → ledger order → id (numeric-aware). */
function rankItems(items: Item[]): Item[] {
  return [...items].sort((a, b) => {
    const p = PRI_SCORE[a.priority] - PRI_SCORE[b.priority]
    if (p !== 0) return p
    const l = LEDGER_ORDER.indexOf(a.ledger) - LEDGER_ORDER.indexOf(b.ledger)
    if (l !== 0) return l
    return a.id.localeCompare(b.id, undefined, { numeric: true })
  })
}

/**
 * Aggregate open items across all (or one) ledger from raw markdown contents, plus any pre-parsed
 * `extraItems` (the live `PR` source — `parsePullRequests` output, which has no file to read). A
 * file-ledger whose content is absent (`undefined`) is skipped — so a failed fetch contributes 0 items
 * rather than breaking the projection. `opts.ledger` filters BOTH channels. Returns ranked items.
 */
export function aggregateFromContents(
  contents: Partial<Record<FileLedgerCode, string>>,
  opts: { ledger?: LedgerCode; extraItems?: Item[] } = {},
): Item[] {
  const items: Item[] = []
  for (const code of FILE_LEDGER_ORDER) {
    if (opts.ledger && code !== opts.ledger) continue
    const content = contents[code]
    if (content == null) continue
    items.push(...parseLedger(code, content))
  }
  for (const item of opts.extraItems ?? []) {
    if (opts.ledger && item.ledger !== opts.ledger) continue
    items.push(item)
  }
  return rankItems(items)
}
