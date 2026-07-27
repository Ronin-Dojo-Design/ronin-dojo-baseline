#!/usr/bin/env bun
/**
 * state-of-project.ts — "State of the Dojo" projection renderer (SESSION_0585, G-023 child —
 * SOT dashboard slice 1: feed + render).
 *
 * Renders a full, self-contained HTML dashboard from `scripts/ledger-backlog.ts --json`'s feed
 * (sessions + goals + the existing ledger-backlog `items`). PROJECTION ONLY — this script never
 * writes back to a session file or ledger; `docs/sprints/*` and `docs/knowledge/wiki/goals-ledger.md`
 * stay the source of truth (see `docs/protocols/state-of-project-projection.md`). Publishing the
 * render (e.g. via the Artifact tool, to one stable URL) is a separate agent ritual step, not
 * something this script does — it only writes a local HTML file.
 *
 * The `gh` PR count called for by the lane brief arrives THROUGH the ledger-backlog JSON (its
 * existing live `PR` ledger rows are already sourced from `gh pr list`) rather than a second,
 * duplicate `gh` shell-out from this script — one external call, one resilience path, DRY.
 *
 * Usage:
 *   bun scripts/state-of-project.ts                       # writes out/state-of-project.html (gitignored)
 *   bun scripts/state-of-project.ts path/to/output.html    # explicit output path
 */

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import type { Item } from "../apps/web/lib/loop-board/ledger-parse"
import type {
  ArtifactDetail,
  GoalDetail,
  ProductLane,
  SessionDetail,
} from "../apps/web/lib/state-of-dojo/parse"
// The projection vocabulary is imported from the ONE shared, framework-free substrate the app kernel
// (`_kernel/phase.ts`) also re-exports — no private copies, so every vocab fix lands once (D-055).
import {
  BRAND_SKINS,
  MASTHEAD_TITLE_HERE,
  PHASE_LABEL,
  PHASES,
} from "../apps/web/lib/state-of-dojo/vocab"

const ROOT = resolve(import.meta.dir, "..")
const OUT_PATH = resolve(ROOT, process.argv[2] ?? "out/state-of-project.html")

type Feed = {
  items: Item[]
  sessions: SessionDetail[]
  goals: GoalDetail[]
  artifacts: ArtifactDetail[]
}

function loadFeed(): Feed {
  const raw = execFileSync("bun", ["scripts/ledger-backlog.ts", "--json"], {
    cwd: ROOT,
    encoding: "utf-8",
    maxBuffer: 16 * 1024 * 1024,
  })
  return JSON.parse(raw) as Feed
}

// --- tiny render helpers -----------------------------------------------------------------

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Honest-empties wrapper: a zero-row section says so in plain text, never renders silently
 * blank (v3 mock design decision). */
function listOrEmpty(rows: string[], emptyText: string): string {
  return rows.length ? rows.join("") : `<p class="empty">${esc(emptyText)}</p>`
}

function sessionCard(s: SessionDetail): string {
  // A product-doc card's id is a word (`PRD`, `STORIES`), not a session number — the `#` prefix
  // would read as a fake session id, so only numeric sprint sessions get it (WL-P2-80).
  const eyebrow = s.kind === "product-doc" ? `${esc(s.number)} · canon` : `#${esc(s.number)}`
  return `<li class="card" data-phase="${s.phase}">
    <span class="card-id">${eyebrow}</span>
    <span class="card-title">${esc(s.title)}</span>
    <span class="pill pill-${s.status.startsWith("closed") ? "good" : s.phase === "review" ? "warn" : "neutral"}">${esc(s.status)}</span>
  </li>`
}

/** The `done` column is the whole historical backlog (hundreds of closed sessions) — capping
 * it to the most recent N keeps the board a triage surface, not a full session archive
 * rendered inline. The other three columns are naturally small (planned/in-flight/review), so
 * no cap applies there; the true count still shows in the column header regardless. */
const DONE_COLUMN_CAP = 12

function workBoard(sessions: SessionDetail[]): string {
  const cols = PHASES.map(phase => {
    // Numeric-aware string compare, not `Number()` — product-doc cards carry word ids (`PRD`),
    // which `Number()` turns into NaN and an unstable order (WL-P2-80). Mirrors the frozen
    // kernel's `key.localeCompare(…, { numeric: true })`, so both renderers order identically.
    const inPhase = sessions
      .filter(s => s.phase === phase)
      .sort((a, b) => b.number.localeCompare(a.number, undefined, { numeric: true }))
    const capped = phase === "done" ? inPhase.slice(0, DONE_COLUMN_CAP) : inPhase
    const rows = capped.map(sessionCard)
    const hiddenCount = inPhase.length - capped.length
    const more = hiddenCount > 0 ? `<li class="more">+${hiddenCount} more — see docs/sprints/</li>` : ""
    return `<div class="col" data-phase="${phase}">
      <h3>${PHASE_LABEL[phase]} <span class="count">${inPhase.length}</span></h3>
      <ul class="cards">${listOrEmpty(rows, "Nothing here.")}${more}</ul>
    </div>`
  }).join("")
  return `<section class="work-board"><h2>Work board</h2><div class="columns">${cols}</div></section>`
}

/** One goal's phase-ladder: a 5-stop track — physical belt COLORS (white→blue→purple→brown→black)
 * on the stops, but ONE action-word vocabulary on every skin (OPERATOR CALL 0714 / PL-020:
 * `PHASE_LABEL`, not belt-color words). Stops up to and including the goal's current phase are
 * "reached", the rest are dim. `dropped` goals have no natural ladder position — badged separately,
 * ladder rendered fully dim. Order is `PHASES` (planned→done ⇒ white stop first, black stop last). */
function beltLadder(g: GoalDetail): string {
  const reachedIndex = g.status.toLowerCase() === "dropped" ? -1 : PHASES.indexOf(g.phase)
  const stops = PHASES.map((phase, i) => {
    const reached = i <= reachedIndex
    return `<span class="stop stop-${phase} ${reached ? "reached" : ""}" title="${esc(PHASE_LABEL[phase])}">${esc(PHASE_LABEL[phase])}</span>`
  }).join("")
  const dropped = g.status.toLowerCase() === "dropped" ? '<span class="pill pill-crit">dropped</span>' : ""
  return `<li class="ladder-row">
    <div class="ladder-head"><strong>${esc(g.id)}</strong> ${esc(g.title)} ${dropped}</div>
    <div class="ladder-track">${stops}</div>
  </li>`
}

function goalLadderTable(goals: GoalDetail[]): string {
  if (!goals.length) return '<p class="empty">No goals for this brand tab.</p>'
  const rows = goals
    .map(g => {
      const reachedIndex = g.status.toLowerCase() === "dropped" ? -1 : PHASES.indexOf(g.phase)
      const cells = PHASES.map((_, i) => `<td class="tick">${i <= reachedIndex ? "✓" : "·"}</td>`).join("")
      return `<tr>
        <td>${esc(g.id)}</td>
        <td>${esc(g.title)}</td>
        <td>${esc(g.priority)}</td>
        <td>${esc(g.status)}</td>
        ${cells}
      </tr>`
    })
    .join("")
  const phaseHeads = PHASES.map(p => `<th>${esc(PHASE_LABEL[p])}</th>`).join("")
  return `<table class="ladder-table"><thead><tr>
    <th>ID</th><th>Goal</th><th>Pri</th><th>Status</th>
    ${phaseHeads}
  </tr></thead><tbody>${rows}</tbody></table>`
}

function goalsSection(goals: GoalDetail[]): string {
  const ladders = listOrEmpty(goals.map(beltLadder), "No goals for this brand tab.")
  return `<section class="goals">
    <h2>Goal belt-ladders</h2>
    <ul class="ladders">${ladders}</ul>
    <h3>Goal ladder table</h3>
    ${goalLadderTable(goals)}
  </section>`
}

/** How many recently-added artifacts the strip shows before it stops being a "recently" list. */
const RECENT_ARTIFACT_CAP = 10

/**
 * Recently added — the WL-P2-80 stretch. Recipe cards, client templates and product assets are
 * neither sessions nor goals, so a session that shipped three recipe cards and a contract template
 * showed as idle on every tab. Cross-brand by design (same call as `needsYou`): the operator wants
 * one "what just landed" list regardless of which tab is open, and each row carries its own brand.
 */
function recentlyAdded(artifacts: ArtifactDetail[]): string {
  const rows = artifacts
    .slice(0, RECENT_ARTIFACT_CAP)
    .map(
      a => `<li class="artifact-row">
        <span class="pill pill-neutral">${esc(a.kind)}</span>
        <span class="artifact-title">${esc(a.title)}</span>
        <span class="muted">${esc(a.product.toUpperCase())} · ${esc(a.date ?? "—")} · <code>${esc(a.path)}</code></span>
      </li>`,
    )
  const hidden = artifacts.length - Math.min(artifacts.length, RECENT_ARTIFACT_CAP)
  const more = hidden > 0 ? `<li class="more">+${hidden} more artifact(s)</li>` : ""
  return `<section class="recently-added"><h2>Recently added</h2>
    <h3>Recipe cards · templates · product assets</h3>
    <ul>${listOrEmpty(rows, "No artifacts found.")}${more}</ul></section>`
}

function riskWatch(items: Item[]): string {
  const risk = items.filter(i => i.ledger === "RISK")
  const rows = risk.map(
    i =>
      `<li class="risk-row"><span class="pill pill-${i.priority === "P0" ? "crit" : i.priority === "P1" ? "warn" : "neutral"}">${esc(i.priority)}</span> ${esc(i.id)} — ${esc(i.summary)} <span class="muted">(${esc(i.status)})</span></li>`,
  )
  return `<section class="risk-watch"><h2>Risk watch</h2><ul>${listOrEmpty(rows, "No open risk items.")}</ul></section>`
}

/** Needs-you: push-gate-held sessions still open (NOT `done` — a closed session's push gate is
 * by definition resolved; its close notes routinely say "push gate held" in past tense, which
 * would otherwise flood this list with historical noise) + operator-pending goal rows.
 * Cross-brand by design — the operator wants one nagging list regardless of which tab is open
 * (slice 1 simplification, documented in the projection protocol). */
function needsYou(sessions: SessionDetail[], goals: GoalDetail[]): string {
  const heldSessions = sessions.filter(s => s.pushGateHeld && s.phase !== "done")
  const pendingGoals = goals.filter(g => g.operatorPending)
  const rows = [
    ...heldSessions.map(
      s => `<li>Push gate held — <strong>#${esc(s.number)}</strong> ${esc(s.title)}</li>`,
    ),
    ...pendingGoals.map(
      g => `<li>Ratification pending — <strong>${esc(g.id)}</strong> ${esc(g.title)}</li>`,
    ),
  ]
  return `<section class="needs-you"><h2>Needs you</h2><ul>${listOrEmpty(rows, "Nothing needs you right now.")}</ul></section>`
}

function brandPanel(brand: ProductLane, active: boolean, sessions: SessionDetail[], goals: GoalDetail[]): string {
  const bSessions = sessions.filter(s => s.product === brand)
  const bGoals = goals.filter(g => g.product === brand)
  return `<section class="brand-panel" data-panel="${brand}" ${active ? "" : "hidden"}>
    <div class="panel-meta">${bSessions.length} session card(s) · ${bGoals.length} goal(s)</div>
    ${workBoard(bSessions)}
    ${goalsSection(bGoals)}
  </section>`
}

// --- Epics section ---------------------------------------------------------------------------
//
// Epics live scattered (SESSION_0712 SotD sweep): hand-off epic docs under `docs/epics/`, BBL
// product epic-plans with frontmatter, staged plan stubs, and epic-flagged rows in the PL/GL
// ledgers. This section parses all four live sources deterministically so the frozen-snapshot
// publish needs zero hand-merging (PL-032). PROJECTION ONLY — the docs/ledgers stay the source
// of truth; a missing source degrades to an empty group, never a hard fail.

type EpicRow = { id: string; title: string; status: string; source: string; path: string }

/** Pull the value of one frontmatter key from a fenced `---` block (tiny, dependency-free — the
 * doc set uses flat scalar frontmatter for `title`/`status`, so a line scan beats a YAML parse
 * here). Returns `""` when the doc has no frontmatter or no such key. */
function frontmatterField(body: string, key: string): string {
  if (!body.startsWith("---")) return ""
  const end = body.indexOf("\n---", 3)
  if (end === -1) return ""
  const block = body.slice(3, end)
  const line = block.split("\n").find(l => l.trimStart().startsWith(`${key}:`))
  if (!line) return ""
  return line.slice(line.indexOf(":") + 1).trim().replace(/^["']|["']$/g, "")
}

/** First markdown H1 (`# …`), with any `Epic —`/`G-NNN` decoration kept — it is the doc's own name. */
function firstH1(body: string): string {
  const line = body.split("\n").find(l => l.startsWith("# "))
  return line ? line.slice(2).trim() : ""
}

/** Status from prose docs that carry a `Status:` line instead of frontmatter (e.g. the 0711 plan
 * uses `Status: **staged — …**`). Strips markdown emphasis and trailing sentence noise. */
function proseStatus(body: string): string {
  const line = body.split("\n").find(l => /^\s*Status:/i.test(l))
  if (!line) return ""
  return line
    .replace(/^\s*Status:\s*/i, "")
    .replace(/\*\*/g, "")
    .split("—")[0]
    .split(".")[0]
    .trim()
}

function loadEpics(items: Item[]): EpicRow[] {
  const rows: EpicRow[] = []
  const read = (rel: string): string => {
    try {
      return readFileSync(resolve(ROOT, rel), "utf-8")
    } catch {
      return ""
    }
  }
  const glob = (pattern: string): string[] =>
    [...new Bun.Glob(pattern).scanSync({ cwd: ROOT })].sort((a, b) => a.localeCompare(b))

  // 1. Hand-off epic docs — no frontmatter; the H1 is the name, source is the folder.
  for (const rel of glob("docs/epics/*.md")) {
    const body = read(rel)
    rows.push({ id: rel.replace(/^docs\/epics\//, "").replace(/\.md$/, ""), title: firstH1(body) || rel, status: "epic doc", source: "docs/epics", path: rel })
  }

  // 2. Product epic-plans — frontmatter-driven (case-insensitive `epic` in the filename).
  const productEpics = [...glob("docs/product/**/*.md")].filter(p => /epic/i.test(p.split("/").pop() ?? ""))
  for (const rel of productEpics) {
    const body = read(rel)
    rows.push({ id: frontmatterField(body, "slug") || rel, title: frontmatterField(body, "title") || firstH1(body) || rel, status: frontmatterField(body, "status") || "—", source: "product", path: rel })
  }

  // 3. Staged plan stubs — frontmatter status where present, else the prose `Status:` line.
  for (const rel of glob("docs/sprints/plans/*.md")) {
    const body = read(rel)
    rows.push({ id: frontmatterField(body, "slug") || rel.split("/").pop()?.replace(/\.md$/, "") || rel, title: frontmatterField(body, "title") || firstH1(body) || rel, status: frontmatterField(body, "status") || proseStatus(body) || "—", source: "plan stub", path: rel })
  }

  // 4. Epic-flagged PL/GL ledger rows — already parsed in the feed (DRY: one ledger read, not two).
  for (const i of items.filter(i => (i.ledger === "PL" || i.ledger === "GL") && /\bepic\b/i.test(i.summary))) {
    rows.push({ id: i.id, title: i.summary, status: i.status, source: "ledger", path: `docs/knowledge/wiki/${i.ledger === "PL" ? "planning" : "goals"}-ledger.md` })
  }

  return rows
}

/** Map a free-text epic/slot status to a pill class, matching the base renderer's semantics: green
 * is reserved for genuinely complete work; in-motion (active/in-progress/staged/queued) reads amber;
 * dropped/blocked reads critical; everything else (epic doc, draft, n-a) is neutral. */
function statusPill(status: string): string {
  const s = status.toLowerCase()
  if (/\b(done|shipped|live|complete|closed)\b/.test(s)) return "good"
  if (/\b(active|in-progress|in-review|staged|proposed|queued|pending|created)\b/.test(s)) return "warn"
  if (/\b(dropped|blocked|abandoned)\b/.test(s)) return "crit"
  return "neutral"
}

/** A status pill holds ONE glanceable token. Ledger statuses carry qualifiers ("QUEUED · operator ask",
 * "in-progress — P1") — split on middot/em-dash (NOT hyphen, so "in-progress" survives) and keep only the
 * leading token; the full status moves to the muted meta line (Desi, SESSION_0714). */
function pillToken(status: string): string {
  return status.split(/[·—]/)[0].trim() || status
}

/** One live epic row — the format the operator likes (SESSION_0714 STEER): status pill + title +
 * source tag + path, with any status qualifier moved to the muted meta line. Live-sourced; only the
 * GROUPING (below) comes from the 0712 spec. */
function epicRow(e: EpicRow): string {
  const token = pillToken(e.status)
  const qualifier = e.status !== token ? ` · ${esc(e.status)}` : ""
  return `<li class="epic-row">
      <span class="pill pill-${statusPill(e.status)}">${esc(token)}</span>
      <span class="epic-title">${esc(e.title)}</span>
      <span class="muted"><span class="src-tag">${esc(e.source)}</span> · <code>${esc(e.path)}</code>${qualifier}</span>
    </li>`
}

// The 0712 spec's four epic groups. The LIVE 13-row list (loadEpics) stays — the operator likes it
// (source tags + status pills + paths). Only the GROUPING is borrowed from the spec (SESSION_0714
// STEER). `epicGroup` is an ordered, first-match-wins rule derived from each row's source + path;
// it is the whole categorization contract, so it lives here as one readable function (reported in
// the session record) rather than a data file — it operates on live-parsed rows, not static text.
type EpicGroup = "bbl-product" | "cross-portfolio" | "portfolio-ops" | "riders-staging"
const EPIC_GROUP_ORDER: readonly EpicGroup[] = [
  "bbl-product",
  "cross-portfolio",
  "portfolio-ops",
  "riders-staging",
] as const
const EPIC_GROUP_LABEL: Record<EpicGroup, string> = {
  "bbl-product": "BBL product epics",
  "cross-portfolio": "Cross-portfolio & process epics",
  "portfolio-ops": "Portfolio operations",
  "riders-staging": "Riders, findings & staging",
}

/** Ordered, first-match-wins categorization (SESSION_0714 STEER). Rule, top to bottom:
 *   1. staged plan stubs (`docs/sprints/plans/*`) → Riders, findings & staging.
 *   2. epic-flagged PL/GL ledger rows → Portfolio operations (program-level rows).
 *   3. BBL product docs (`docs/product/black-belt-legacy/*`) → BBL product epics.
 *   4. `docs/epics/*technique*` (BBL technique epics) → BBL product epics.
 *   5. everything else (obsidian-dashboard, north-star, post-launch-clean-repo, …) → Cross-portfolio. */
function epicGroup(e: EpicRow): EpicGroup {
  if (e.source === "plan stub") return "riders-staging"
  if (e.source === "ledger") return "portfolio-ops"
  if (e.path.startsWith("docs/product/black-belt-legacy/")) return "bbl-product"
  if (e.path.startsWith("docs/epics/") && /technique/i.test(e.path)) return "bbl-product"
  return "cross-portfolio"
}

function epicsPanel(items: Item[]): string {
  const epics = loadEpics(items)
  const groups = EPIC_GROUP_ORDER.map(g => {
    const rows = epics.filter(e => epicGroup(e) === g).map(epicRow)
    return `<section><h2>${esc(EPIC_GROUP_LABEL[g])} <span class="count">${rows.length}</span></h2>
    <ul class="epic-list">${listOrEmpty(rows, "None in this group.")}</ul></section>`
  }).join("\n")
  return `<section class="brand-panel" data-panel="epics" hidden>
  <div class="panel-meta">Every epic in one place — live-sourced (${epics.length} rows) from <code>docs/epics/</code> · product epic-plans · staged plan stubs · epic-flagged PL/GL ledger rows, grouped into the SESSION_0712 categories. Rows carry a source tag + status pill + path.</div>
  ${groups}
  <p class="muted" style="margin-top:8px">Grouping rule (SESSION_0714): plan stubs → Riders/staging · ledger rows → Portfolio operations · <code>docs/product/black-belt-legacy/*</code> &amp; <code>docs/epics/*technique*</code> → BBL product · everything else → Cross-portfolio &amp; process.</p>
</section>`
}

// --- Fan-out tab (the 8-sub-tab board) -------------------------------------------------------
//
// The Fork Fan-out Board — SoT is `docs/protocols/fork-fanout.yml` (structured, canonical), read
// via Bun's built-in YAML parser (no dependency). The yml carries the operator's SESSION_0712
// board: an Overview panel + one panel per portfolio slot, each panel's `body` a verbatim HTML
// fragment (block scalar → `#`/`"` literal, no comment-truncation). This renderer emits those
// bodies RAW (trusted transcribed narrative); only tab keys/labels/repo are escaped as attributes.
// A missing/parse-failing yml degrades to an honest empty panel rather than a hard fail.

type FanoutTab = { key: string; label: string; repo?: string }
type FanoutPanel = { key: string; repo?: string; body: string }
type FanoutBoard = { title?: string; meta?: string; footer?: string; tabs?: FanoutTab[]; panels?: FanoutPanel[] }

function loadFanout(): FanoutBoard | null {
  try {
    const raw = readFileSync(resolve(ROOT, "docs/protocols/fork-fanout.yml"), "utf-8")
    return Bun.YAML.parse(raw) as FanoutBoard
  } catch {
    return null
  }
}

function fanoutPanel(): string {
  const board = loadFanout()
  if (!board?.tabs?.length) {
    return `<section class="brand-panel" data-panel="fanout" hidden>
  <p class="empty">Fan-out board unavailable — docs/protocols/fork-fanout.yml missing or unreadable.</p>
</section>`
  }
  const ftabs = board.tabs
    .map(
      (t, i) =>
        `<button class="ftab${i === 0 ? " active" : ""}" data-tab="${esc(t.key)}">${esc(t.label)}</button>`,
    )
    .join("\n    ")
  const panels = (board.panels ?? [])
    .map((p, i) => {
      const repoAttr = p.repo ? ` data-repo="${esc(p.repo)}"` : ""
      return `<div class="fpanel${i === 0 ? " active" : ""}" data-panel="${esc(p.key)}"${repoAttr}>
${p.body}
</div>`
    })
    .join("\n")
  const initRepo = board.tabs[0]?.repo ?? "rdd"
  return `<section class="brand-panel" data-panel="fanout" hidden>
  <div id="fanout-root" data-repo="${esc(initRepo)}">
    <div class="panel-meta">${board.meta ?? ""}</div>
    <nav class="ftabs">
    ${ftabs}
  </nav>
${panels}
    ${board.footer ?? ""}
  </div>
</section>`
}

// --- What-landed tab -------------------------------------------------------------------------
//
// Per-snapshot "what this session accomplished" record — SoT is `docs/protocols/sotd-landed.yml`
// (block-scalar section bodies, emitted raw). Bespoke narrative, not live-derivable; a
// missing/parse-failing yml degrades to an honest empty panel.

type LandedDoc = { meta?: string; sections?: { body: string }[] }

function loadLanded(): LandedDoc | null {
  try {
    const raw = readFileSync(resolve(ROOT, "docs/protocols/sotd-landed.yml"), "utf-8")
    return Bun.YAML.parse(raw) as LandedDoc
  } catch {
    return null
  }
}

function landedPanel(): string {
  const doc = loadLanded()
  if (!doc) {
    return `<section class="brand-panel" data-panel="landed" hidden>
  <p class="empty">What-landed unavailable — docs/protocols/sotd-landed.yml missing or unreadable.</p>
</section>`
  }
  const sections = (doc.sections ?? []).map(s => s.body).join("\n  ")
  return `<section class="brand-panel" data-panel="landed" hidden>
  <div class="panel-meta">${doc.meta ?? ""}</div>
  ${sections}
</section>`
}

// --- CSS ------------------------------------------------------------------------------------

const CSS = `
:root{
  --paper:#ffffff; --page:#f5f5f5; --ink:#1f1f1f; --muted:#737373; --line:#e0e0e0;
  --good:#16794f; --warn:#b45309; --crit:#dc2626; --neutral:#52525b;
  --accent:#3f3f46; /* rdd: neutral house graphite (default/umbrella tab) */
}
[data-brand="bbl"]{ --accent: hsl(1 79% 51%); --crit: hsl(1 60% 34%); } /* darkened crit — distinguishable from BBL's own crimson accent */
[data-brand="mmb"]{ --accent: #ff6a1a; }
*{box-sizing:border-box}
html,body{margin:0;max-width:100%;overflow-x:hidden}
body{background:var(--page);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.masthead{background:var(--paper);border-bottom:3px solid var(--accent);padding:20px 16px}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
h1{margin:4px 0 2px;font-size:clamp(22px,5vw,32px);letter-spacing:-.01em}
.prov{font-size:12px;font-weight:400;color:var(--muted)}
.meta{font-size:12px;color:var(--muted);margin-top:6px}
.tabs{display:flex;gap:6px;margin-top:14px;flex-wrap:wrap}
.tab{border:1px solid var(--line);background:var(--paper);color:var(--ink);padding:7px 14px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer}
.tab.active{background:var(--accent);color:#fff;border-color:var(--accent)}
main{max-width:1100px;margin:0 auto;padding:16px}
section{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin-bottom:16px;max-width:100%;overflow-x:auto}
h2{font-size:16px;margin:0 0 10px}
h3{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 0 6px}
.panel-meta{font-size:12px;color:var(--muted);margin-bottom:10px}
.empty{color:var(--muted);font-size:13px;font-style:italic;margin:4px 0}
.columns{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.col h3{display:flex;align-items:center;gap:6px}
.count{background:var(--line);border-radius:10px;padding:1px 7px;font-size:11px;color:var(--ink)}
.cards{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;min-height:24px}
.card{border:1px solid var(--line);border-radius:8px;padding:6px 8px;font-size:12px;display:flex;flex-direction:column;gap:3px;word-break:break-word}
.card-id{color:var(--muted);font-size:11px}
.card-title{font-weight:600}
.more{color:var(--muted);font-size:11px;font-style:italic;list-style:none;padding:2px 0}
.pill{display:inline-block;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:#fff;width:fit-content}
.pill-good{background:var(--good)}
.pill-warn{background:var(--warn)}
.pill-crit{background:var(--crit)}
.pill-neutral{background:var(--neutral)}
.muted{color:var(--muted);font-size:11px}
.ladders{list-style:none;margin:0 0 14px;padding:0;display:flex;flex-direction:column;gap:10px}
.ladder-row{border-bottom:1px solid var(--line);padding-bottom:8px}
.ladder-head{font-size:13px;margin-bottom:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ladder-track{display:flex;gap:4px}
.stop{flex:1;min-width:0;text-align:center;font-size:9px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;padding:5px 2px;border-radius:5px;color:#fff;opacity:.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stop.reached{opacity:1}
.stop-planned{background:#fff;color:var(--ink);border:1px solid var(--line)} /* white belt: 1px edge so it never disappears on the paper bg (Desi) */
.stop-in-flight{background:#1d4ed8}
.stop-review{background:#7c3aed}
.stop-held{background:#7a5230}
.stop-done{background:#111111} /* black belt: near-black fill, white stop first / this stop last (planned→done) */
.ladder-table{width:100%;border-collapse:collapse;font-size:12px;min-width:520px}
.ladder-table th,.ladder-table td{border-bottom:1px solid var(--line);padding:5px 6px;text-align:left}
.ladder-table .tick{text-align:center;color:var(--muted)}
.risk-row,.needs-you li{font-size:13px;margin-bottom:6px;list-style:none}
.recently-added ul{margin:0;padding:0}
.artifact-row{font-size:13px;margin-bottom:8px;list-style:none;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.artifact-title{font-weight:600}
.artifact-row code{font-size:10px;word-break:break-all}
.needs-you ul{margin:0;padding:0}
.epic-list{list-style:none;margin:0;padding:0}
.epic-row{font-size:13px;margin-bottom:8px;list-style:none;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.epic-title{font-weight:600}
.epic-row code{font-size:10px;word-break:break-all}
.src-tag{display:inline-block;background:var(--line);color:var(--ink);border-radius:6px;padding:0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.03em}
footer{max-width:1100px;margin:0 auto;padding:16px;font-size:11px;color:var(--muted)}
footer p{margin:4px 0}
@media (max-width:700px){
  .columns{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:480px){
  .columns{grid-template-columns:1fr}
  /* mobile order: triage what's moving + what needs you (held) before planned/done */
  .col[data-phase="in-flight"]{order:-4}
  .col[data-phase="held"]{order:-3}
  .col[data-phase="review"]{order:-2}
  .col[data-phase="planned"]{order:-1}
  .col[data-phase="done"]{order:0}
  .ladder-table{min-width:0}
}

/* --- Fan-out board (scoped) — the 8-sub-tab tab (#fanout-root) --- */
#fanout-root{--accent:#3f3f46}
#fanout-root[data-repo="bbl"]{--accent:hsl(1 79% 51%)}
#fanout-root[data-repo="bma"]{--accent:#1d4ed8}
#fanout-root[data-repo="mmb"]{--accent:#ff6a1a}
#fanout-root[data-repo="usa"]{--accent:#16794f}
#fanout-root[data-repo="acd"]{--accent:#7c3aed}
#fanout-root[data-repo="tb"]{--accent:#0e7490}
#fanout-root .ftabs{display:flex;gap:6px;margin:0 0 12px;flex-wrap:wrap}
#fanout-root .ftab{border:1px solid var(--line);background:var(--paper);color:var(--ink);padding:6px 12px;border-radius:20px;font-size:12.5px;font-weight:600;cursor:pointer}
#fanout-root .ftab.active{background:var(--accent);color:#fff;border-color:var(--accent)}
#fanout-root .fpanel{display:none}
#fanout-root .fpanel.active{display:block}
#fanout-root .fpanel section{padding:0;border:none;margin:0}
#fanout-root .fladder{display:flex;gap:4px;margin:8px 0 4px;flex-wrap:wrap}
#fanout-root .fstop{flex:1 1 56px;min-width:52px;text-align:center;font-size:9px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;padding:6px 2px;border-radius:5px;color:#fff;background:var(--neutral);opacity:.32;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#fanout-root .fstop.done{background:#111;opacity:1}
#fanout-root .fstop.now{background:var(--accent);opacity:1}
#fanout-root .fstop.na{background:#fff;color:var(--muted);border:1px dashed var(--line);opacity:1}
#fanout-root .steps{width:100%;border-collapse:collapse;font-size:12.5px;min-width:560px}
#fanout-root .steps th,#fanout-root .steps td{border-bottom:1px solid var(--line);padding:6px;text-align:left;vertical-align:top}
#fanout-root .steps th{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
#fanout-root .steps td:first-child{white-space:nowrap;font-weight:700}
#fanout-root .order{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
#fanout-root .order li{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:13px}
#fanout-root .order .n{flex:0 0 auto;width:22px;height:22px;border-radius:50%;background:var(--ink);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}
#fanout-root .keepkill{display:flex;gap:10px;flex-wrap:wrap;margin:6px 0}
#fanout-root .kk{border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:12.5px;flex:1 1 240px}
#fanout-root .kk strong{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}
#fanout-root .kk.keep strong{color:var(--good)}
#fanout-root .kk.kill strong{color:var(--crit)}
#fanout-root .pill-accent{background:var(--accent)}
#fanout-root code{background:var(--page);border:1px solid var(--line);border-radius:4px;padding:0 4px;font-size:11.5px;word-break:break-all}
@media (max-width:480px){ #fanout-root .steps{min-width:0} #fanout-root .steps td:first-child{white-space:normal} }
`

// --- page ------------------------------------------------------------------------------------

// The six top-level tabs (SESSION_0712 artifact structure): the three live brand skins
// (RDD · BBL · MMB) followed by the three consolidated tabs (Fan-out · Epics · What landed).
// RDD is the default-active tab (index 0).
const TOP_TABS: readonly { key: string; label: string }[] = [
  ...BRAND_SKINS.map(b => ({ key: b.key as string, label: b.label })),
  { key: "fanout", label: "Fan-out" },
  { key: "epics", label: "Epics" },
  { key: "landed", label: "What landed" },
] as const

function page(feed: Feed): string {
  const { items, sessions, goals, artifacts } = feed
  const prCount = items.filter(i => i.ledger === "PR").length
  const renderedAt = new Date().toISOString()
  // Brand panels stay LIVE (work board + goal ladders). Landed/Epics/Fan-out are the consolidated
  // tabs; recently/risk/needs-you stay GLOBAL (rendered once, below all tab panels — matching the
  // 0712 artifact, where they sit outside the tab-switched region and show under every tab).
  const brandPanels = BRAND_SKINS.map((b, i) => brandPanel(b.key, i === 0, sessions, goals)).join("")
  const tabs = TOP_TABS.map(
    (t, i) =>
      `<button class="tab${i === 0 ? " active" : ""}" data-tab="${esc(t.key)}" role="tab" aria-selected="${i === 0}">${esc(t.label)}</button>`,
  ).join("")

  return `<!doctype html><html lang="en" data-brand="${BRAND_SKINS[0].key}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(MASTHEAD_TITLE_HERE)}</title>
<style>${CSS}</style></head>
<body>
<header class="masthead">
  <div class="eyebrow">Ronin Dojo Design</div>
  <h1>${esc(MASTHEAD_TITLE_HERE)}</h1>
  <nav class="tabs" role="tablist">${tabs}</nav>
  <div class="meta">${sessions.length} sessions · ${goals.length} goals · ${prCount} open PR(s) · rendered ${esc(renderedAt)}</div>
</header>
<main>
${brandPanels}
${landedPanel()}
${epicsPanel(items)}
${fanoutPanel()}
${recentlyAdded(artifacts ?? [])}
${riskWatch(items)}
${needsYou(sessions, goals)}
</main>
<footer>
  <p><strong>Projection only</strong> — ledgers stay the source of truth. Sources:
  <code>docs/sprints/SESSION_*.md</code> frontmatter · <code>docs/knowledge/wiki/goals-ledger.md</code> ·
  <code>scripts/ledger-backlog.ts --json</code> (which also carries the live <code>gh pr list</code>
  PR count folded in above). Epics parsed LIVE from <code>docs/epics/</code> · product epic-plans ·
  <code>docs/sprints/plans/</code> stubs · epic-flagged PL/GL ledger rows, grouped by the
  SESSION_0714 rule. Fan-out board from <code>docs/protocols/fork-fanout.yml</code>; What-landed from
  <code>docs/protocols/sotd-landed.yml</code>. Regenerate: <code>bun scripts/state-of-project.ts</code>. See
  <code>docs/protocols/state-of-project-projection.md</code> for the re-render ritual.</p>
  <p>Rendered ${esc(renderedAt)}</p>
</footer>
<script>
document.documentElement.setAttribute("data-brand","rdd")
document.querySelectorAll(".tab").forEach(function(btn){
  btn.addEventListener("click", function(){
    var brand = btn.getAttribute("data-tab")
    document.documentElement.setAttribute("data-brand", brand)
    document.querySelectorAll(".tab").forEach(function(b){
      var on = b === btn
      b.classList.toggle("active", on)
      b.setAttribute("aria-selected", String(on))
    })
    document.querySelectorAll(".brand-panel").forEach(function(p){
      p.hidden = p.getAttribute("data-panel") !== brand
    })
  })
})

var fr = document.getElementById("fanout-root")
if (fr) fr.querySelectorAll(".ftab").forEach(function(btn){
  btn.addEventListener("click", function(){
    var t = btn.getAttribute("data-tab")
    fr.querySelectorAll(".ftab").forEach(function(b){ b.classList.toggle("active", b===btn) })
    fr.querySelectorAll(".fpanel").forEach(function(p){ p.classList.toggle("active", p.getAttribute("data-panel")===t) })
    fr.setAttribute("data-repo", (t==="overview") ? "rdd" : t)
  })
})
</script>
</body></html>`
}

async function main() {
  const feed = loadFeed()
  const html = page(feed)
  await Bun.write(OUT_PATH, html)
  console.log(`state-of-project: wrote ${OUT_PATH} (${feed.sessions.length} sessions, ${feed.goals.length} goals)`)
}

main()
