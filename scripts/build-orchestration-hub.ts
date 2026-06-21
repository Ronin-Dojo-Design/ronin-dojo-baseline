/**
 * Orchestration Hub generator (SESSION_0428 / post-launch-clean-repo-001).
 *
 * Builds ONE self-contained, lightweight HTML for agent-handoff orchestration: every ritual,
 * protocol, SOP, and domain hub rendered with an Apple/IBM-clean file-tree sidebar + the
 * email-style numbered "1-2-3" step chips. Offline-openable, no runtime deps.
 *
 *   bun run docs:hub   →   docs/orchestration.html   (git-ignored, regenerate-only)
 *
 * Convention mirrors `docs:nav` (generate-only; never commit the output).
 */
import { Glob } from "bun"
import { marked } from "marked"
import { BBL_FONTS_LINK, BBL_HEADING_CSS, BBL_TOKENS, STEP_CHIP_CSS } from "./lib/bbl-doc-theme"

type Group = { label: string; dir: string; recurse?: boolean }

const GROUPS: Group[] = [
  { label: "Rituals", dir: "docs/rituals" },
  { label: "Protocols", dir: "docs/protocols" },
  { label: "SOPs", dir: "docs/runbooks/sops" },
  { label: "Domain hubs", dir: "docs/runbooks/domain-features" },
  { label: "Agents", dir: "docs/agents" },
  { label: "Epics", dir: "docs/epics" },
]

type Doc = { slug: string; title: string; group: string; html: string; steps: number }

const stripFrontmatter = (md: string): string =>
  md.startsWith("---") ? md.replace(/^---\n[\s\S]*?\n---\n?/, "") : md

const titleOf = (md: string, file: string): string => {
  const fm = md.match(/^---\n[\s\S]*?\ntitle:\s*["']?(.+?)["']?\s*\n[\s\S]*?\n---/)
  if (fm) return fm[1]
  const h1 = stripFrontmatter(md).match(/^#\s+(.+)$/m)
  if (h1) return h1[1].trim()
  return file.replace(/\.md$/, "")
}

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Turn `### 2. Update the SESSION file` headings into numbered step chips (email LoginStep pattern). */
const markStepHeadings = (html: string): string =>
  html.replace(
    /<h([2-4])>(\d+)\.\s+([\s\S]*?)<\/h\1>/g,
    (_m, lvl, num, rest) =>
      `<h${lvl} class="step"><span class="step-num">${num}</span><span>${rest}</span></h${lvl}>`,
  )

async function build() {
  const docs: Doc[] = []

  for (const group of GROUPS) {
    const glob = new Glob("*.md")
    let files: string[] = []
    try {
      files = (await Array.fromAsync(glob.scan({ cwd: group.dir }))).sort()
    } catch {
      continue
    }
    for (const file of files) {
      const path = `${group.dir}/${file}`
      const md = await Bun.file(path).text()
      if (!md.trim()) continue
      const body = stripFrontmatter(md)
      const rendered = markStepHeadings(await marked.parse(body))
      const steps = (rendered.match(/class="step"/g) ?? []).length
      docs.push({
        slug: `${group.label}-${file.replace(/\.md$/, "")}`.replace(/[^\w-]/g, "-").toLowerCase(),
        title: titleOf(md, file),
        group: group.label,
        html: rendered,
        steps,
      })
    }
  }

  const groupsPresent = GROUPS.map(g => g.label).filter(l => docs.some(d => d.group === l))

  const tree = groupsPresent
    .map(label => {
      const items = docs
        .filter(d => d.group === label)
        .map(
          d =>
            `<a class="leaf" href="#${d.slug}" data-title="${esc(d.title).toLowerCase()}">${esc(
              d.title,
            )}${d.steps ? `<span class="badge">${d.steps}</span>` : ""}</a>`,
        )
        .join("")
      return `<div class="group"><div class="group-h">${label}<span class="count">${
        docs.filter(d => d.group === label).length
      }</span></div>${items}</div>`
    })
    .join("")

  const articles = docs
    .map(
      d =>
        `<article id="${d.slug}" class="doc"><div class="eyebrow">${esc(d.group)}</div>${d.html}</article>`,
    )
    .join("\n")

  const css = BBL_TOKENS + BBL_HEADING_CSS + STEP_CHIP_CSS + `
:root{--code:var(--surface);--sidebar:var(--surface);--hover:rgba(127,127,127,.12);--chip-bg:rgba(127,127,127,.16)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font:15px/1.65 var(--font-body);color:var(--fg);background:var(--bg)}
a{color:inherit;text-decoration:none}
.shell{display:grid;grid-template-columns:300px 1fr;min-height:100vh}
aside{position:sticky;top:0;height:100vh;overflow:auto;background:var(--sidebar);border-right:1px solid var(--line);padding:22px 16px}
.brand{font-weight:700;letter-spacing:-.02em;font-size:15px;margin:2px 6px 4px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.brand small{display:block;font-weight:500;color:var(--muted);font-size:11px;letter-spacing:.04em;text-transform:uppercase;margin-top:3px}
.theme-toggle{flex:0 0 auto;border:1px solid var(--line);background:var(--bg);color:var(--muted);border-radius:8px;font-size:14px;line-height:1;padding:5px 8px;cursor:pointer}
.theme-toggle:hover{color:var(--accent);border-color:var(--accent)}
.search{width:100%;margin:14px 0 18px;padding:8px 11px;border:1px solid var(--line);border-radius:9px;background:var(--bg);color:var(--fg);font-size:13px}
.group{margin-bottom:16px}
.group-h{display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);padding:0 6px 6px}
.count,.badge{font-weight:600;color:var(--muted);background:var(--chip-bg);border-radius:20px;font-size:10px;padding:1px 7px}
.leaf{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:6px 8px;border-radius:7px;color:var(--fg);font-size:13px}
.leaf:hover{background:var(--hover)}
.leaf.active{background:var(--bg);box-shadow:inset 2px 0 0 var(--accent);font-weight:600}
.badge{background:transparent;color:var(--accent);border:1px solid var(--accent)}
main{padding:40px clamp(20px,5vw,72px);max-width:920px}
.doc{padding-bottom:64px;margin-bottom:48px;border-bottom:1px solid var(--line)}
.doc .eyebrow{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-dark);margin-bottom:8px}
.doc h1{font-family:var(--font-head);font-weight:800;text-transform:uppercase;font-style:italic;font-size:30px;letter-spacing:-.01em;margin:.2em 0 .5em}
.doc h2{font-size:21px;letter-spacing:-.01em;margin:1.6em 0 .5em;padding-bottom:6px;border-bottom:1px solid var(--line)}
.doc h3{font-size:16px;margin:1.4em 0 .4em}
.doc h4{font-size:14px;margin:1.2em 0 .3em;color:var(--muted)}
.doc p,.doc li{color:var(--fg)}
.doc code{background:var(--code);padding:.12em .4em;border-radius:5px;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
.doc pre{background:var(--code);padding:16px;border-radius:11px;overflow:auto;border:1px solid var(--line)}
.doc pre code{background:none;padding:0}
.doc table{border-collapse:collapse;width:100%;font-size:13px;margin:1em 0}
.doc th,.doc td{border:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top}
.doc th{background:var(--sidebar)}
.doc blockquote{margin:1em 0;padding:2px 16px;border-left:3px solid var(--accent);color:var(--muted);background:var(--surface)}
/* email-style 1-2-3 step chips */
.doc h2.step,.doc h3.step{border:0}
.doc ol{counter-reset:s;list-style:none;padding-left:0}
.doc ol>li{counter-increment:s;position:relative;padding:4px 0 4px 40px;margin:.3em 0}
.doc ol>li::before{content:counter(s);position:absolute;left:0;top:2px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:700;display:grid;place-items:center}
.doc ul{padding-left:20px}
@media(max-width:820px){.shell{grid-template-columns:1fr}aside{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}}
`

  const js = `
// theme: system default, toggle cycles system → light → dark, persisted.
const root=document.documentElement,tb=document.getElementById('themeBtn');
const saved=localStorage.getItem('bbl-theme');if(saved)root.setAttribute('data-theme',saved);
tb.addEventListener('click',()=>{const cur=root.getAttribute('data-theme');
const next=cur==='light'?'dark':cur==='dark'?'':'light';
if(next){root.setAttribute('data-theme',next);localStorage.setItem('bbl-theme',next);}else{root.removeAttribute('data-theme');localStorage.removeItem('bbl-theme');}});
const q=document.getElementById('q'),leaves=[...document.querySelectorAll('.leaf')];
q.addEventListener('input',()=>{const v=q.value.toLowerCase();leaves.forEach(l=>{l.style.display=l.dataset.title.includes(v)?'':'none'});
document.querySelectorAll('.group').forEach(g=>{g.style.display=[...g.querySelectorAll('.leaf')].some(l=>l.style.display!=='none')?'':'none'})});
const byId=Object.fromEntries(leaves.map(l=>[l.getAttribute('href').slice(1),l]));
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){leaves.forEach(l=>l.classList.remove('active'));byId[e.target.id]?.classList.add('active');}})},{rootMargin:'-10% 0px -80% 0px'});
document.querySelectorAll('.doc').forEach(d=>io.observe(d));
`

  const total = docs.length
  const stepTotal = docs.reduce((n, d) => n + d.steps, 0)
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ronin Dojo — Orchestration Hub</title>${BBL_FONTS_LINK}<style>${css}</style></head>
<body><div class="shell">
<aside>
  <div class="brand"><span>Orchestration Hub<small>Ronin Dojo · agent handoff</small></span><button class="theme-toggle" id="themeBtn" title="Toggle light / dark" aria-label="Toggle light / dark">◐</button></div>
  <input id="q" class="search" placeholder="Filter ${total} docs…" autocomplete="off">
  ${tree}
</aside>
<main>
  <article class="doc"><div class="eyebrow">Index</div>
    <h1>Orchestration Hub</h1>
    <p>Every ritual, protocol, SOP, and domain hub for agent-handoff orchestration loops
    (bow-in/out, PR-review→score→fix, Giddy merge strategy, …) — rendered lightweight with the
    numbered step pattern. ${total} docs · ${stepTotal} steps. Generated by
    <code>bun run docs:hub</code>; regenerate-only (never committed).</p></article>
  ${articles}
</main></div><script>${js}</script></body></html>`

  await Bun.write("docs/orchestration.html", html)
  console.log(`✅ docs/orchestration.html — ${total} docs, ${stepTotal} step chips across ${groupsPresent.length} groups`)
}

build()
