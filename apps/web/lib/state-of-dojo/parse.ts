/**
 * state-of-dojo/parse.ts — pure parsing/classification for the "State of the Dojo"
 * projection (SESSION_0585 slice-1; extracted to the shared lib SESSION_0603 WS-A).
 *
 * ONE parse/feed/classify core, consumed by BOTH the render script and the app (no duplication):
 *   - `scripts/ledger-backlog.ts --json`   — additive `sessions` + `goals` feed fields
 *   - `scripts/state-of-project.ts`        — the standalone HTML renderer (Artifact)
 *   - `apps/web/lib/state-of-dojo/fetch-state.ts` — the in-app `/app/state` runtime feed
 *
 * SELF-CONTAINED on purpose (mirrors `apps/web/lib/loop-board/ledger-parse.ts`): no `fs`,
 * no network, no `server-only`, no React — the caller supplies raw file contents, so the same
 * core runs under Bun (local fs) and in a React Server Component (GitHub-raw fetch). Projection-only
 * law: this module NEVER writes back to a session file or ledger; docs/sprints + goals-ledger.md stay
 * the single source of truth. See `docs/protocols/state-of-project-projection.md`.
 */

/** The three brand tabs (v3 mock): skin × lane filter. `rdd` is the umbrella/default tab —
 * anything not classified BBL or Mammoth (platform, governance, design-system, automation…). */
export type ProductLane = "rdd" | "bbl" | "mmb"

/** The belt-ladder / work-board vocabulary shared by sessions and goals: white=planned ·
 * blue=in flight · purple=review · black=done. One vocabulary, two projections. */
export type Phase = "planned" | "in-flight" | "review" | "done"

export type SessionDetail = {
  number: string
  title: string
  /** Raw frontmatter `status:` value (e.g. "in-progress", "closed-full", "staged"). */
  status: string
  /** Raw frontmatter `lane:` value when present (repo | rdd | bbl | mmb | bma | usa). Most
   * pre-ADR-0049 sessions carry none. */
  lane?: string
  product: ProductLane
  phase: Phase
  pushGateHeld: boolean
}

export type GoalDetail = {
  id: string
  title: string
  /** Raw goals-ledger status word (open · in-progress · done · landed · proposed · dropped —
   * the ledger's format doc names 4; real rows use a couple of informal synonyms too). */
  status: string
  priority: "P0" | "P1" | "P2" | "—"
  /** Raw `- **Lane:**` bullet text (free prose, not an enum). */
  lane?: string
  product: ProductLane
  phase: Phase
  summary: string
  operatorPending: boolean
}

// --- frontmatter -------------------------------------------------------------------------

/** Pull one flat `key: value` field out of a doc's YAML frontmatter block. Intentionally tiny
 * (mirrors `scripts/wiki-lint.ts`'s hand-rolled parser) — only the flat-scalar case is needed
 * here (title/status/lane are always single-line values, never arrays). */
export function frontmatterField(content: string, key: string): string | undefined {
  const block = content.match(/^---\n([\s\S]*?)\n---/)
  if (!block) return undefined
  const re = new RegExp(`^${key}\\s*:\\s*(.*)$`)
  for (const line of block[1].split("\n")) {
    const m = line.match(re)
    if (!m) continue
    const value = m[1].trim().replace(/^["']|["']$/g, "")
    return value === "" ? undefined : value
  }
  return undefined
}

// --- product classification --------------------------------------------------------------

const MAMMOTH_RE = /\bmammoth\b/i
const BBL_RE = /\bbbl\b|black belt legacy|\blineage\b|\bbelt\b|\btechniques?\b|grappling|\bbjj\b/i

/** Classify a GOAL's free-text `Lane:` bullet into a brand tab. Keyword heuristic — the
 * formal `lane:` enum (G-023 Session C) doesn't exist on goals yet; this is slice-1's
 * best-effort bridge, documented as such in the projection protocol. */
export function classifyGoalProduct(rawLane: string | undefined): ProductLane {
  if (!rawLane) return "rdd"
  if (MAMMOTH_RE.test(rawLane)) return "mmb"
  if (BBL_RE.test(rawLane)) return "bbl"
  return "rdd"
}

/** Classify a SESSION's frontmatter `lane:` short code into a brand tab. `repo`/`rdd`/`bma`/
 * `usa` (and no lane at all — most pre-ADR-0049 sessions) all collapse to the `rdd` umbrella
 * tab for slice 1; only literal `bbl`/`mmb` split out. */
export function classifySessionProduct(rawLane: string | undefined): ProductLane {
  if (!rawLane) return "rdd"
  const v = rawLane.trim().toLowerCase()
  if (v === "mmb") return "mmb"
  if (v === "bbl") return "bbl"
  return "rdd"
}

// --- phase bucketing --------------------------------------------------------------------

const SESSION_DONE_RE = /^closed/i

/** staged=planned, in-progress=in flight, closed(-full/-quick/-partial)=done — plus a `review`
 * stage for a session that's in-progress AND push-gate-held (awaiting the operator's word). */
export function bucketSessionPhase(status: string, pushGateHeld: boolean): Phase {
  const s = status.trim().toLowerCase()
  if (SESSION_DONE_RE.test(s)) return "done"
  if (s === "in-progress") return pushGateHeld ? "review" : "in-flight"
  return "planned" // staged | open | pending | unrecognized (defensive default)
}

const GOAL_DONE_RE = /^(done|landed|shipped)\b/i

/** Same 4-stage vocabulary applied to a goal row. `reviewSignal` = the goal's body text names
 * an operator-pending/ratification-pending condition (see `detectReviewSignal`). `dropped`
 * goals have no natural ladder position — callers render them as a distinct badge, not a
 * ladder stage (see `state-of-project-projection.md`). */
export function bucketGoalPhase(status: string, reviewSignal: boolean): Phase {
  const s = status.trim().toLowerCase()
  if (GOAL_DONE_RE.test(s)) return "done"
  if (s === "in-progress") return reviewSignal ? "review" : "in-flight"
  return "planned" // open | proposed | pending | dropped | unrecognized
}

// --- needs-you signals --------------------------------------------------------------------

const PUSH_GATE_RE = /push gate (?:is |stays )?held|held.{0,20}push gate|push gate.{0,20}shut/i

/** A session body names the push-gate-held condition (the "needs-you" feed's first source). */
export function detectPushGateHeld(body: string): boolean {
  return PUSH_GATE_RE.test(body)
}

const OPERATOR_PENDING_RE =
  /operator[^\n]{0,40}(?:pending|ratif)|(?:pending|ratif)[^\n]{0,40}\(operator\)/i

/** A row is tagged operator-pending (ratification/decision owed) — the "needs-you" feed's
 * second source. Distinct from `detectReviewSignal`: pending ≠ mid-review. */
export function detectOperatorPending(text: string): boolean {
  return OPERATOR_PENDING_RE.test(text)
}

const REVIEW_SIGNAL_RE =
  /pending ratification|ratifications? pending|awaiting (?:operator|review)|verdict pending|push gate held/i

/** A goal's body names an in-flight review/ratification condition — bumps its belt-ladder
 * stage from blue (in flight) to purple (review). */
export function detectReviewSignal(text: string): boolean {
  return REVIEW_SIGNAL_RE.test(text)
}

// --- session parsing ------------------------------------------------------------------------

const SESSION_FILENAME_RE = /SESSION_(\d{4})\.md$/

/** Parse one `docs/sprints/SESSION_NNNN.md` file's frontmatter + body into a `SessionDetail`.
 * Returns `null` for a non-matching filename (e.g. the `_template/` dir) so callers can filter
 * a directory listing without a separate glob pattern. */
export function parseSessionFile(path: string, content: string): SessionDetail | null {
  const m = path.match(SESSION_FILENAME_RE)
  if (!m) return null
  const number = m[1]
  const rawTitle = frontmatterField(content, "title") ?? `Session ${number}`
  const title = rawTitle.replace(/^SESSION\s+\d+\s*[—–-]\s*/i, "")
  const status = frontmatterField(content, "status") ?? "unknown"
  const lane = frontmatterField(content, "lane")
  const pushGateHeld = detectPushGateHeld(content)
  return {
    number,
    title,
    status,
    lane,
    product: classifySessionProduct(lane),
    phase: bucketSessionPhase(status, pushGateHeld),
    pushGateHeld,
  }
}

// --- goals-ledger parsing -------------------------------------------------------------------

/** Split markdown into level-3 (`### `) heading sections. Tiny local twin of
 * `apps/web/lib/loop-board/ledger-parse.ts`'s private `sections()` — duplicated rather than
 * imported so this lib stays fully self-contained (no cross-package coupling for 6 lines). */
function level3Sections(content: string): { heading: string; body: string }[] {
  const out: { heading: string; body: string }[] = []
  let cur: { heading: string; body: string } | null = null
  for (const line of content.split("\n")) {
    if (line.startsWith("### ") && line[3] !== "#") {
      if (cur) out.push(cur)
      cur = { heading: line.slice(4).trim(), body: "" }
    } else if (cur) {
      cur.body += `${line}\n`
    }
  }
  if (cur) out.push(cur)
  return out
}

/** Heading "G-022 — Technique graph out of beta (GA)" → { id: "G-022", title: "Technique…" }. */
function splitGoalHeading(heading: string): { id: string; title: string } {
  const m = heading.match(/^([A-Za-z0-9.-]+)\s*[—–-]\s*(.+)$/)
  return m ? { id: m[1], title: m[2] } : { id: heading.split(/\s+/)[0], title: heading }
}

const priFromTag = (s: string): GoalDetail["priority"] =>
  /\bP0\b/.test(s) ? "P0" : /\bP1\b/.test(s) ? "P1" : /\bP2\b/.test(s) ? "P2" : "—"

/** `- **Status:** in-progress — P1 (…)` → { status: "in-progress", priority: "P1" }. The
 * `[^*\n]+` capture stops at the next `**` marker OR end of line — never crossing a newline
 * into the following bullet (real rows chain a follow-on `**Tag:**` clause on the same line;
 * a small few instead wrap onto the next line with no `**` before it). No leading-bullet
 * anchor: a few rows embed the label inline inside a different bullet's prose (e.g. G-019's
 * `**Lane:**` sits mid-sentence in its `**Pointer:**` bullet) — matching the label itself,
 * not its bullet marker, is the more robust read of this real, slightly inconsistent ledger
 * prose. Splits on a SPACED em/en dash only (`\s—\s`/`\s–\s`) — a bare hyphen would wrongly
 * cut "in-progress" or "closed-full" at their first internal `-`. A few rows separate the
 * status word with a middle dot (`·`) instead of an em-dash (e.g. "landed · P2 · SESSION_0551")
 * — both separators split; a trailing `·` with nothing after it (rows with no inline P-tag,
 * e.g. G-011) is trimmed as cosmetic punctuation, not part of the status word. */
function statusAndPriority(body: string): { status: string; priority: GoalDetail["priority"] } {
  const m = body.match(/\*\*Status:?\*\*\s*([^*\n]+)/i)
  const raw = (m?.[1] ?? "").trim()
  const status =
    raw
      .split(/\s[—–·]\s/)[0]
      ?.trim()
      .replace(/[·\s]+$/, "") || "open"
  return { status, priority: priFromTag(raw) }
}

/** `- **Lane:** lineage / onboarding. **Gated:** …` → "lineage / onboarding." (see the capture
 * shape note above — same no-leading-bullet-anchor, no-newline-crossing rationale). */
function laneOf(body: string): string | undefined {
  const m = body.match(/\*\*Lane:?\*\*\s*([^*\n]+)/i)
  return m?.[1]?.trim() || undefined
}

/** Parse `docs/knowledge/wiki/goals-ledger.md`'s raw markdown into `GoalDetail[]` — ALL goals
 * (not just open ones; `done`/`landed` rows are the ladder's natural black-belt culmination,
 * unlike the backlog aggregator's open-only filter in `ledger-parse.ts`). */
export function parseGoalsDetail(content: string): GoalDetail[] {
  return level3Sections(content)
    .filter(s => /^G-\d+/.test(s.heading))
    .map(s => {
      const { id, title } = splitGoalHeading(s.heading)
      const { status, priority } = statusAndPriority(s.body)
      const lane = laneOf(s.body)
      const operatorPending = detectOperatorPending(s.body)
      const reviewSignal = detectReviewSignal(s.body)
      return {
        id,
        title,
        status,
        priority,
        lane,
        product: classifyGoalProduct(lane),
        phase: bucketGoalPhase(status, reviewSignal),
        summary: title,
        operatorPending,
      }
    })
}
