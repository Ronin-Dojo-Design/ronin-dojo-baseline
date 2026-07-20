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
import { resolve } from "node:path"
import type { Item } from "../apps/web/lib/loop-board/ledger-parse"
import type { GoalDetail, Phase, ProductLane, SessionDetail } from "./lib/state-of-project-parse"

const ROOT = resolve(import.meta.dir, "..")
const OUT_PATH = resolve(ROOT, process.argv[2] ?? "out/state-of-project.html")

type Feed = { items: Item[]; sessions: SessionDetail[]; goals: GoalDetail[] }

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

const PHASES: Phase[] = ["planned", "in-flight", "review", "done"]
const PHASE_LABEL: Record<Phase, string> = {
  planned: "Planned",
  "in-flight": "In flight",
  review: "Review",
  done: "Done",
}
const BELT_WORD: Record<Phase, string> = {
  planned: "White",
  "in-flight": "Blue",
  review: "Purple",
  done: "Black",
}
const BRANDS: { key: ProductLane; label: string }[] = [
  { key: "rdd", label: "RDD" },
  { key: "bbl", label: "BBL" },
  { key: "mmb", label: "MMB" },
]

/** Honest-empties wrapper: a zero-row section says so in plain text, never renders silently
 * blank (v3 mock design decision). */
function listOrEmpty(rows: string[], emptyText: string): string {
  return rows.length ? rows.join("") : `<p class="empty">${esc(emptyText)}</p>`
}

function sessionCard(s: SessionDetail): string {
  return `<li class="card" data-phase="${s.phase}">
    <span class="card-id">#${esc(s.number)}</span>
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
    const inPhase = sessions.filter(s => s.phase === phase).sort((a, b) => Number(b.number) - Number(a.number))
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

/** One goal's belt-ladder: a 4-stop track (white/blue/purple/black); stops up to and including
 * the goal's current phase are "reached", the rest are dim. `dropped` goals have no natural
 * ladder position — badged separately, ladder rendered fully dim. */
function beltLadder(g: GoalDetail): string {
  const reachedIndex = g.status.toLowerCase() === "dropped" ? -1 : PHASES.indexOf(g.phase)
  const stops = PHASES.map((phase, i) => {
    const reached = i <= reachedIndex
    return `<span class="stop stop-${phase} ${reached ? "reached" : ""}" title="${esc(BELT_WORD[phase])} / ${esc(PHASE_LABEL[phase])}">
      <span class="lbl-belt">${esc(BELT_WORD[phase])}</span><span class="lbl-neutral">${esc(PHASE_LABEL[phase])}</span>
    </span>`
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
  return `<table class="ladder-table"><thead><tr>
    <th>ID</th><th>Goal</th><th>Pri</th><th>Status</th>
    <th>White</th><th>Blue</th><th>Purple</th><th>Black</th>
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
.columns{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
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
.stop-done{background:#111111}
.lbl-neutral{display:none}
[data-brand="mmb"] .lbl-belt{display:none}
[data-brand="mmb"] .lbl-neutral{display:inline}
.ladder-table{width:100%;border-collapse:collapse;font-size:12px;min-width:520px}
.ladder-table th,.ladder-table td{border-bottom:1px solid var(--line);padding:5px 6px;text-align:left}
.ladder-table .tick{text-align:center;color:var(--muted)}
.risk-row,.needs-you li{font-size:13px;margin-bottom:6px;list-style:none}
.needs-you ul{margin:0;padding:0}
footer{max-width:1100px;margin:0 auto;padding:16px;font-size:11px;color:var(--muted)}
footer p{margin:4px 0}
@media (max-width:700px){
  .columns{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:480px){
  .columns{grid-template-columns:1fr}
  /* mobile order in-flight-first (v3 mock): triage what's moving before what's planned/done */
  .col[data-phase="in-flight"]{order:-3}
  .col[data-phase="review"]{order:-2}
  .col[data-phase="planned"]{order:-1}
  .col[data-phase="done"]{order:0}
  .ladder-table{min-width:0}
}
`

// --- page ------------------------------------------------------------------------------------

function page(feed: Feed): string {
  const { items, sessions, goals } = feed
  const prCount = items.filter(i => i.ledger === "PR").length
  const renderedAt = new Date().toISOString()
  const panels = BRANDS.map((b, i) => brandPanel(b.key, i === 0, sessions, goals)).join("")
  const tabs = BRANDS.map(
    (b, i) =>
      `<button class="tab${i === 0 ? " active" : ""}" data-tab="${b.key}" role="tab" aria-selected="${i === 0}">${esc(b.label)}</button>`,
  ).join("")

  return `<!doctype html><html lang="en" data-brand="${BRANDS[0].key}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>State of the Dojo</title>
<style>${CSS}</style></head>
<body>
<header class="masthead">
  <div class="eyebrow">Ronin Dojo Design</div>
  <h1>State of the Dojo <span class="prov">(name pending operator ratification)</span></h1>
  <nav class="tabs" role="tablist">${tabs}</nav>
  <div class="meta">${sessions.length} sessions · ${goals.length} goals · ${prCount} open PR(s) · rendered ${esc(renderedAt)}</div>
</header>
<main>
${panels}
${riskWatch(items)}
${needsYou(sessions, goals)}
</main>
<footer>
  <p><strong>Projection only</strong> — ledgers stay the source of truth. Sources:
  <code>docs/sprints/SESSION_*.md</code> frontmatter · <code>docs/knowledge/wiki/goals-ledger.md</code> ·
  <code>scripts/ledger-backlog.ts --json</code> (which also carries the live <code>gh pr list</code>
  PR count folded in above). Regenerate: <code>bun scripts/state-of-project.ts</code>. See
  <code>docs/protocols/state-of-project-projection.md</code> for the re-render ritual.</p>
  <p>Rendered ${esc(renderedAt)}</p>
</footer>
<script>
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
