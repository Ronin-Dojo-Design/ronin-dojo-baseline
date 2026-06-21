/**
 * Loop Posters generator (SESSION_0428 / post-launch-clean-repo-001).
 *
 * Condensed, one-page, print-ready posters of the orchestration loops — big "1-2-3" numbered
 * steps, BBL-branded, A4 print CSS. Built for emailing / quick messages to Tony: open the HTML,
 * "Save as PDF" (one click), or screenshot → PNG. No runtime deps.
 *
 *   bun run docs:posters   →   docs/posters/*.html   (git-ignored, regenerate-only)
 *
 * PNG/PDF: use the browser Print dialog (Save as PDF) or a screenshot. Automated export needs a
 * headless browser (puppeteer/playwright) — not bundled here.
 */

import { BBL_FONTS_LINK, BBL_TOKENS } from "./lib/bbl-doc-theme"

type Loop = { slug: string; title: string; subtitle: string; file: string }

// Tony-facing loops only (Desi pass): the operator/external loops worth a polished one-pager.
// The internal-agent loops (giddy-merge, hostile-close, review-recommend, cody-preflight) live in
// the orchestration hub, not as standalone PDFs.
const LOOPS: Loop[] = [
  { slug: "bow-in", title: "Bow-In", subtitle: "Open a session", file: "docs/rituals/opening.md" },
  { slug: "bow-out", title: "Bow-Out", subtitle: "Close a session", file: "docs/rituals/closing.md" },
  { slug: "pr-review-loop", title: "PR Review → Score → Fix", subtitle: "Review loop", file: "docs/protocols/pr-review-score-fix-loop.md" },
]

type Step = { num: string; title: string; blurb: string }

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const clean = (s: string) =>
  s
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[*_]/g, "")
    .trim()

const stripFm = (md: string) => (md.startsWith("---") ? md.replace(/^---\n[\s\S]*?\n---\n?/, "") : md)

const firstBlurb = (lines: string[], from: number): string => {
  for (let i = from; i < Math.min(from + 8, lines.length); i++) {
    const l = lines[i].trim()
    if (!l || l.startsWith("#") || l.startsWith("```") || l.startsWith("|") || l.startsWith(">")) continue
    const txt = clean(l.replace(/^[-*]\s+/, ""))
    if (txt.length > 8) return txt.length > 150 ? `${txt.slice(0, 147)}…` : txt
  }
  return ""
}

const extractSteps = (body: string): Step[] => {
  const lines = body.split("\n")
  const steps: Step[] = []
  // Prefer numbered step headings (### 1. … / ## 2. …)
  lines.forEach((line, i) => {
    const m = line.match(/^#{2,4}\s+(\d+[a-z]?)\.\s+(.+)$/)
    if (m) steps.push({ num: m[1], title: clean(m[2]), blurb: firstBlurb(lines, i + 1) })
  })
  if (steps.length) return steps
  // Fallback: H2 section titles, numbered sequentially
  let n = 0
  lines.forEach((line, i) => {
    const m = line.match(/^##\s+(.+)$/)
    if (m) {
      n += 1
      steps.push({ num: String(n), title: clean(m[1]), blurb: firstBlurb(lines, i + 1) })
    }
  })
  return steps
}

const css = BBL_TOKENS + `
:root{--ink:var(--fg);--gold:var(--accent);--paper:var(--bg)}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:var(--page);font:15px/1.55 var(--font-body);color:var(--ink)}
.poster{width:794px;min-height:1123px;margin:24px auto;background:var(--paper);padding:56px 56px 40px;box-shadow:0 8px 40px rgba(0,0,0,.12);border-radius:6px}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent-dark)}
h1{font-family:var(--font-head);font-weight:800;text-transform:uppercase;font-style:italic;font-size:40px;letter-spacing:-.01em;margin:8px 0 4px}
.sub{font-size:17px;color:var(--muted);margin:0 0 4px}
.meta{font-size:12px;color:var(--muted);margin-top:6px}
hr{border:0;border-top:2px solid var(--gold);margin:22px 0 26px;width:64px}
.step{display:flex;gap:18px;align-items:flex-start;padding:13px 0;border-bottom:1px solid var(--line)}
.step:last-child{border-bottom:0}
.n{flex:0 0 auto;width:38px;height:38px;border-radius:50%;background:var(--accent);color:#fff;font-size:16px;font-weight:800;display:grid;place-items:center}
.st h2{font-size:18px;margin:2px 0 2px;letter-spacing:-.01em}
.st p{font-size:13.5px;color:var(--muted);margin:0}
.foot{margin-top:30px;font-size:11px;color:var(--muted);display:flex;justify-content:space-between}
@page{size:A4;margin:0}
@media print{body{background:#fff}.poster{margin:0;box-shadow:none;border-radius:0;width:auto;min-height:auto}}
`

const posterHtml = (loop: Loop, steps: Step[]): string => {
  const rows = steps
    .map(
      s =>
        `<div class="step"><div class="n">${esc(s.num)}</div><div class="st"><h2>${esc(
          s.title,
        )}</h2>${s.blurb ? `<p>${esc(s.blurb)}</p>` : ""}</div></div>`,
    )
    .join("")
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(loop.title)} — Ronin Dojo loop poster</title>${BBL_FONTS_LINK}<style>${css}</style></head>
<body><div class="poster">
  <div class="eyebrow">Ronin Dojo · Black Belt Legacy</div>
  <h1>${esc(loop.title)}</h1>
  <p class="sub">${esc(loop.subtitle)}</p>
  <div class="meta">${steps.length} steps · the loop at a glance</div>
  <hr>
  ${rows}
  <div class="foot"><span>Source: ${esc(loop.file)}</span><span>Save as PDF · or screenshot → PNG</span></div>
</div></body></html>`
}

async function build() {
  // Clear stale outputs (e.g. loops removed from LOOPS) so the dir always reflects the config.
  const { rmSync } = await import("node:fs")
  rmSync("docs/posters", { recursive: true, force: true })

  const built: { loop: Loop; steps: number }[] = []
  for (const loop of LOOPS) {
    const f = Bun.file(loop.file)
    if (!(await f.exists())) {
      console.warn(`skip (missing): ${loop.file}`)
      continue
    }
    const md = await f.text()
    const steps = extractSteps(stripFm(md))
    if (!steps.length) {
      console.warn(`skip (no steps): ${loop.file}`)
      continue
    }
    await Bun.write(`docs/posters/${loop.slug}.html`, posterHtml(loop, steps))
    built.push({ loop, steps: steps.length })
  }

  const index = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Loop posters</title>${BBL_FONTS_LINK}
<style>body{margin:0;background:#F5F5F5;font:15px/1.6 "Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1F1F1F}
.wrap{max-width:680px;margin:48px auto;padding:0 20px}.eyebrow{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B91C1C}
h1{font-family:"Poppins","Segoe UI",sans-serif;font-weight:800;text-transform:uppercase;font-style:italic;letter-spacing:-.01em}a{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;margin:10px 0;background:#fff;border:1px solid #E0E0E0;border-radius:12px;text-decoration:none;color:#1F1F1F}
a:hover{box-shadow:0 4px 18px rgba(0,0,0,.08)}.b{font-size:11px;color:#E52421;border:1px solid #E52421;border-radius:20px;padding:2px 9px;font-weight:600}
p{color:#737373}</style></head><body><div class="wrap">
<div class="eyebrow">Ronin Dojo · Black Belt Legacy</div><h1>Loop posters</h1>
<p>One-page, ez-to-read posters of each orchestration loop. Open one → <b>Save as PDF</b> (print
dialog) or screenshot → PNG → send to Tony.</p>
${built
  .map(
    b =>
      `<a href="${b.loop.slug}.html"><span><strong>${esc(b.loop.title)}</strong> — ${esc(
        b.loop.subtitle,
      )}</span><span class="b">${b.steps} steps</span></a>`,
  )
  .join("")}
</div></body></html>`
  await Bun.write("docs/posters/index.html", index)

  console.log(`✅ docs/posters/ — ${built.length} posters: ${built.map(b => `${b.loop.slug}(${b.steps})`).join(", ")}`)
}

build()
