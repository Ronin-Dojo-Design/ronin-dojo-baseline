#!/usr/bin/env python3
"""Generate a self-contained, searchable HTML navigator for docs/.

Walks docs/ (mirroring scripts/wiki-lint.ts exclusions), parses frontmatter +
body, and emits docs/index.html with everything embedded (no network, no deps).
Open docs/index.html in a browser to search/browse/render every doc.

Regenerate: `bun run docs:nav` (or `python3 scripts/generate-docs-nav.py`).
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "docs"))
OUT = os.path.join(DOCS, "index.html")

EXCLUDE_DIRS = {"templates", "node_modules", "_imports", "source",
                "ronin_dojo_baseline_systems_pack", "graphify-out"}

# Runbook filename -> domain module (virtual nesting without moving files)
RUNBOOK_DOMAIN = {
    "database": "Database", "schema-migration": "Database",
    "prisma-workflow": "Database", "neon-advisory-lock-recovery": "Database",
    "deployment": "Deploy & Infra", "vercel-deploy": "Deploy & Infra",
    "vercel-domain-setup-runbook": "Deploy & Infra",
    "bbl-production-runbook": "Deploy & Infra",
    "white-label-site-runbook": "Deploy & Infra",
    "dev-environment": "Dev Environment", "local-dev-auth-storage": "Dev Environment",
    "mcp-usage-runbook": "Dev Environment", "graphify-repo-memory": "Dev Environment",
    "stripe-setup-runbook": "Integrations", "resend-setup-runbook": "Integrations",
    "printful-setup-runbook": "Integrations", "aws-s3-operator-runbook": "Integrations",
    "product-catalog-seed": "Integrations", "sop-email-runbook": "Integrations",
    "invites": "Domain Features", "course-curriculum-runbook": "Domain Features",
    "baseline-listings-runbook": "Domain Features", "lineage-listing-runbook": "Domain Features",
    "nav-sidebar-menu-runbook": "Domain Features",
    "sop-data-and-wiring-flows": "SOPs", "sop-test-writing": "SOPs",
    "sop-e2e-user-lifecycle": "SOPs", "sop-agent-workflows-and-rituals": "SOPs",
    "react-to-next-component-porting-runbook": "Porting",
    "adr-0014-stripe-product-policy-research": "ADR research",
}

FM_KEYS = ("title", "slug", "type", "status", "created", "updated")


def parse_frontmatter(text):
    fm = {}
    body = text
    if text.startswith("---\n"):
        end = text.find("\n---\n", 4)
        if end != -1:
            block = text[4:end]
            body = text[end + 5:]
            for line in block.split("\n"):
                m = re.match(r"^([A-Za-z_]+):\s*(.*)$", line)
                if m and m.group(1) in FM_KEYS:
                    fm[m.group(1)] = m.group(2).strip().strip('"')
    return fm, body


def area_and_group(rel, fm, fname):
    parts = rel.split(os.sep)
    area = parts[0] if len(parts) > 1 else "(root)"
    stem = fname[:-3]
    if area == "runbooks":
        group = RUNBOOK_DOMAIN.get(stem, "Other")
    elif area == "sprints":
        group = "Archive" if "_archive" in parts else "Active"
    elif len(parts) > 2:
        group = parts[1]  # second-level dir
    else:
        group = fm.get("type", "doc") or "doc"
    return area, group


def collect():
    docs = []
    for root, dirs, files in os.walk(DOCS):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in sorted(files):
            if not f.endswith(".md") or f.startswith("_template"):
                continue
            path = os.path.join(root, f)
            rel = os.path.relpath(path, DOCS)
            text = open(path, encoding="utf-8").read()
            fm, body = parse_frontmatter(text)
            area, group = area_and_group(rel, fm, f)
            title = fm.get("title") or f[:-3]
            docs.append({
                "path": rel.replace(os.sep, "/"),
                "title": title,
                "type": fm.get("type", ""),
                "status": fm.get("status", ""),
                "updated": fm.get("updated", ""),
                "area": area,
                "group": group,
                "body": body,
            })
    docs.sort(key=lambda d: (d["area"], d["group"], d["title"].lower()))
    return docs


TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ronin Dojo — Docs Navigator</title>
<style>
  :root { --bg:#0d1117; --panel:#161b22; --border:#30363d; --fg:#c9d1d9; --muted:#8b949e;
    --accent:#58a6ff; --green:#3fb950; --yellow:#d29922; --red:#f85149; }
  * { box-sizing: border-box; }
  body { margin:0; font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    background:var(--bg); color:var(--fg); height:100vh; display:flex; flex-direction:column; }
  header { padding:10px 16px; border-bottom:1px solid var(--border); display:flex; gap:12px; align-items:center; }
  header h1 { font-size:15px; margin:0; white-space:nowrap; }
  header .meta { color:var(--muted); font-size:12px; }
  #search { flex:1; max-width:520px; padding:7px 10px; background:var(--panel); border:1px solid var(--border);
    border-radius:6px; color:var(--fg); font-size:13px; }
  main { flex:1; display:flex; min-height:0; }
  #sidebar { width:340px; border-right:1px solid var(--border); overflow:auto; padding:8px 0; }
  #content { flex:1; overflow:auto; padding:28px 40px; max-width:980px; }
  .area > .area-h { font-weight:600; color:var(--fg); padding:6px 14px; font-size:12px;
    text-transform:uppercase; letter-spacing:.5px; cursor:pointer; }
  .group > .group-h { color:var(--muted); padding:3px 14px 3px 22px; font-size:12px; cursor:pointer; }
  .doc { padding:3px 14px 3px 34px; cursor:pointer; color:var(--fg); display:flex; gap:6px; align-items:baseline;
    border-left:2px solid transparent; }
  .doc:hover { background:var(--panel); }
  .doc.active { background:var(--panel); border-left-color:var(--accent); }
  .doc .t { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .badge { font-size:10px; padding:1px 5px; border-radius:4px; border:1px solid var(--border); color:var(--muted); }
  .st-active,.st-accepted { color:var(--green); border-color:var(--green); }
  .st-closed,.st-archived,.st-superseded { color:var(--muted); }
  .st-in-progress,.st-draft { color:var(--yellow); border-color:var(--yellow); }
  .stale { color:var(--yellow); font-size:10px; }
  .hidden { display:none; }
  .count { color:var(--muted); font-size:11px; }
  /* rendered markdown */
  #content h1,#content h2,#content h3,#content h4 { line-height:1.25; margin:1.2em 0 .5em; }
  #content h1 { font-size:1.7em; border-bottom:1px solid var(--border); padding-bottom:.3em; }
  #content h2 { font-size:1.35em; border-bottom:1px solid var(--border); padding-bottom:.3em; }
  #content h3 { font-size:1.12em; } #content h4 { font-size:1em; }
  #content code { background:var(--panel); padding:.15em .4em; border-radius:4px; font-size:.88em;
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
  #content pre { background:var(--panel); border:1px solid var(--border); border-radius:6px;
    padding:14px; overflow:auto; } #content pre code { background:none; padding:0; }
  #content table { border-collapse:collapse; margin:1em 0; display:block; overflow:auto; }
  #content th,#content td { border:1px solid var(--border); padding:6px 11px; text-align:left; }
  #content th { background:var(--panel); }
  #content a { color:var(--accent); text-decoration:none; } #content a:hover { text-decoration:underline; }
  #content blockquote { border-left:3px solid var(--border); margin:1em 0; padding:.2em 1em; color:var(--muted); }
  #content hr { border:0; border-top:1px solid var(--border); margin:1.5em 0; }
  #crumb { color:var(--muted); font-size:12px; margin-bottom:6px; }
  #crumb .p { font-family:ui-monospace,monospace; }
  mark { background:#9e6a03; color:#fff; border-radius:2px; }
  .empty { color:var(--muted); padding:20px 14px; }
</style>
</head>
<body>
<header>
  <h1>🥋 Ronin Dojo Docs</h1>
  <input id="search" placeholder="Search titles, paths, and full text…" autocomplete="off">
  <span class="meta" id="stat"></span>
</header>
<main>
  <nav id="sidebar"></nav>
  <article id="content"><p class="empty">Select a document, or search above.</p></article>
</main>
<script>
const DOCS = __DOCS_DATA__;
const GEN = "__GEN_DATE__";
const STALE_DAYS = 30;
let current = null;

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function daysAgo(d){ if(!d) return null; const t=Date.parse(d); if(isNaN(t)) return null;
  return Math.floor((Date.now()-t)/86400000); }

// ---- compact markdown renderer ----
function inlineMd(s){
  s = esc(s);
  s = s.replace(/`([^`]+)`/g,(m,c)=>'<code>'+c+'</code>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(m,t,u)=>{
    if(/^https?:/.test(u)) return '<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>';
    return '<a href="#" data-link="'+u.replace(/"/g,'&quot;')+'">'+t+'</a>';
  });
  s = s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g,'$1<em>$2</em>');
  return s;
}
function renderMd(src){
  const L = src.split('\n'); let h=''; let i=0;
  const isBreak = (x)=>/^(#{1,6}\s|```|\s*[-*+]\s|\s*\d+[.)]\s|\s*>|\s*\|)/.test(x);
  while(i<L.length){
    let line=L[i];
    if(/^```/.test(line.trim())){ let b=[]; i++; while(i<L.length && !/^```/.test(L[i].trim())){b.push(L[i]);i++;} i++; h+='<pre><code>'+esc(b.join('\n'))+'</code></pre>'; continue; }
    let m=line.match(/^(#{1,6})\s+(.*)/); if(m){ const n=m[1].length; h+='<h'+n+'>'+inlineMd(m[2])+'</h'+n+'>'; i++; continue; }
    if(/^\s*([-*_])\1{2,}\s*$/.test(line)){ h+='<hr>'; i++; continue; }
    if(/^\s*\|/.test(line) && i+1<L.length && /^\s*\|?[\s:|-]*-{2,}[\s:|-]*$/.test(L[i+1])){
      const cells=(r)=>r.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      const head=cells(line); i+=2; let rows=[];
      while(i<L.length && /^\s*\|/.test(L[i])){ rows.push(cells(L[i])); i++; }
      h+='<table><thead><tr>'+head.map(c=>'<th>'+inlineMd(c)+'</th>').join('')+'</tr></thead><tbody>'+
        rows.map(r=>'<tr>'+r.map(c=>'<td>'+inlineMd(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
      continue;
    }
    if(/^\s*>/.test(line)){ let b=[]; while(i<L.length&&/^\s*>/.test(L[i])){b.push(L[i].replace(/^\s*>\s?/,''));i++;} h+='<blockquote>'+renderMd(b.join('\n'))+'</blockquote>'; continue; }
    let lm=line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)/);
    if(lm){ const ordered=/\d/.test(lm[2]); const tag=ordered?'ol':'ul'; let items=[];
      while(i<L.length){ const im=L[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)/); if(!im) break; items.push(im[3]); i++; }
      h+='<'+tag+'>'+items.map(it=>'<li>'+inlineMd(it)+'</li>').join('')+'</'+tag+'>'; continue; }
    if(line.trim()===''){ i++; continue; }
    let b=[line]; i++; while(i<L.length && L[i].trim()!=='' && !isBreak(L[i])){ b.push(L[i]); i++; }
    h+='<p>'+inlineMd(b.join(' '))+'</p>';
  }
  return h;
}

function resolveLink(base, rel){
  rel = rel.split('#')[0];
  if(!rel) return null;
  const stack = base.split('/'); stack.pop();
  for(const seg of rel.split('/')){
    if(seg==='..') stack.pop(); else if(seg==='.'||seg==='') continue; else stack.push(seg);
  }
  let p = stack.join('/');
  // docs are keyed relative to docs/; strip any leading docs/
  p = p.replace(/^docs\//,'');
  return DOCS.find(d=>d.path===p) || DOCS.find(d=>d.path.endsWith('/'+p)) || null;
}

function openDoc(doc, push){
  current = doc;
  const da = daysAgo(doc.updated);
  const stale = da!=null && da>STALE_DAYS ? ' · <span class="stale">stale '+da+'d</span>' : '';
  document.getElementById('content').innerHTML =
    '<div id="crumb"><span class="p">'+esc(doc.path)+'</span> · '+esc(doc.type||'')+
    ' · '+esc(doc.status||'')+(doc.updated?' · updated '+esc(doc.updated):'')+stale+'</div>'+
    renderMd(doc.body);
  document.querySelectorAll('.doc').forEach(e=>e.classList.toggle('active', e.dataset.path===doc.path));
  document.getElementById('content').scrollTop=0;
  const el=document.querySelector('.doc[data-path="'+CSS.escape(doc.path)+'"]'); if(el) el.scrollIntoView({block:'nearest'});
}

document.getElementById('content').addEventListener('click', e=>{
  const a=e.target.closest('a[data-link]'); if(!a) return; e.preventDefault();
  const t=resolveLink(current?current.path:'', a.getAttribute('data-link'));
  if(t) openDoc(t); else alert('Not in navigator: '+a.getAttribute('data-link'));
});

function buildTree(list){
  const sb=document.getElementById('sidebar');
  if(!list.length){ sb.innerHTML='<p class="empty">No matches.</p>'; return; }
  const areas={};
  for(const d of list){ (areas[d.area]=areas[d.area]||{})[d.group]=(areas[d.area][d.group]||[]); areas[d.area][d.group].push(d); }
  let html='';
  for(const area of Object.keys(areas).sort()){
    const groups=areas[area]; let n=0; Object.values(groups).forEach(a=>n+=a.length);
    html+='<div class="area"><div class="area-h">'+esc(area)+' <span class="count">'+n+'</span></div>';
    for(const g of Object.keys(groups).sort()){
      html+='<div class="group"><div class="group-h">'+esc(g)+' <span class="count">'+groups[g].length+'</span></div>';
      for(const d of groups[g]){
        const da=daysAgo(d.updated); const stale=da!=null&&da>STALE_DAYS?'<span class="stale">●</span>':'';
        const st=d.status?'<span class="badge st-'+d.status.replace(/[^a-z-]/gi,'')+'">'+esc(d.status)+'</span>':'';
        html+='<div class="doc" data-path="'+esc(d.path)+'"><span class="t">'+esc(d.title)+'</span>'+stale+st+'</div>';
      }
      html+='</div>';
    }
    html+='</div>';
  }
  sb.innerHTML=html;
  sb.querySelectorAll('.doc').forEach(el=>el.onclick=()=>openDoc(DOCS.find(d=>d.path===el.dataset.path)));
  sb.querySelectorAll('.area-h,.group-h').forEach(h=>h.onclick=()=>{
    let el=h.nextElementSibling; // toggle siblings
    let p=h.parentElement; p.querySelectorAll(h.classList.contains('area-h')?'.group':'.doc').forEach(x=>x.classList.toggle('hidden'));
  });
}

function search(q){
  q=q.trim().toLowerCase();
  if(!q){ buildTree(DOCS); document.getElementById('stat').textContent=DOCS.length+' docs'; return; }
  const terms=q.split(/\s+/);
  const hits=DOCS.filter(d=>{ const hay=(d.title+' '+d.path+' '+d.body).toLowerCase(); return terms.every(t=>hay.includes(t)); });
  buildTree(hits);
  document.getElementById('stat').textContent=hits.length+' / '+DOCS.length+' docs';
}

document.getElementById('search').addEventListener('input', e=>search(e.target.value));
document.getElementById('stat').textContent=DOCS.length+' docs · generated '+GEN;
buildTree(DOCS);
</script>
</body>
</html>
"""


def main():
    import datetime
    docs = collect()
    data = json.dumps(docs, ensure_ascii=False)
    # Neutralize any closing tag (</script>, </style>, …) embedded in doc bodies
    # so it can't terminate the <script> block early. `<\/` is a valid JSON/JS escape.
    data = data.replace("</", "<\\/")
    html = TEMPLATE.replace("__DOCS_DATA__", data).replace(
        "__GEN_DATE__", datetime.date.today().isoformat())
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(html)
    size_mb = os.path.getsize(OUT) / 1048576
    print(f"Wrote {OUT} — {len(docs)} docs, {size_mb:.1f} MB")


if __name__ == "__main__":
    main()
