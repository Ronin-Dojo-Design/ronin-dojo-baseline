/**
 * layout.ts — the shared HTML shell every genre template renders into: RDD-token stylesheet,
 * the metadata header derived from frontmatter, then the genre's own body markup.
 */

import type { DocMetadata } from "../core/metadata"
import { rddTokenCss } from "../tokens"

export interface LayoutInput {
  title: string
  genreLabel: string
  metadata: DocMetadata
  bodyHtml: string
  sourcePath: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const METADATA_ROWS: Array<[keyof DocMetadata, string]> = [
  ["status", "Status"],
  ["created", "Created"],
  ["updated", "Updated"],
  ["author", "Author"],
  ["sessionOrSlug", "Session"],
]

/** Only fields that are actually set render a row — no "undefined" strings, ever. */
export function renderMetadataHeader(metadata: DocMetadata): string {
  const rows = METADATA_ROWS.filter(([key]) => metadata[key] !== undefined)
    .map(
      ([key, label]) =>
        `<div class="meta-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(metadata[key] as string)}</dd></div>`,
    )
    .join("")

  const decisionText = metadata.decision
  const decisionHtml = decisionText
    ? `<div class="meta-decision"><strong>Decision:</strong> ${escapeHtml(decisionText)}</div>`
    : ""

  return `<dl class="meta">${rows}</dl>${decisionHtml}`
}

export function renderShell(input: LayoutInput): string {
  const { title, genreLabel, metadata, bodyHtml, sourcePath } = input
  const titleText = title ?? "Untitled document"

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titleText)}</title>
<style>
${rddTokenCss()}
*{box-sizing:border-box}
body{margin:0;background:var(--mk-page);color:var(--mk-fg);font-family:var(--mk-font-body);line-height:1.6}
.wrap{max-width:840px;margin:0 auto;padding:48px 24px 96px}
.genre-badge{display:inline-block;font-family:var(--mk-font-head);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--mk-on-accent);background:var(--mk-accent);border-radius:var(--mk-r-pill);padding:4px 12px;margin-bottom:16px}
h1{font-family:var(--mk-font-head);font-size:32px;line-height:1.2;margin:0 0 16px;color:var(--mk-fg)}
h2{font-family:var(--mk-font-head);font-size:22px;margin:40px 0 12px;border-bottom:1px solid var(--mk-line);padding-bottom:8px}
h3{font-size:18px;margin:28px 0 8px}
h4,h5,h6{font-size:15px;margin:20px 0 6px}
p{margin:0 0 14px}
a{color:var(--mk-accent)}
code{font-family:var(--mk-font-mono);background:var(--mk-surface);border-radius:4px;padding:2px 5px;font-size:.9em}
pre{background:var(--mk-surface);border:1px solid var(--mk-line);border-radius:var(--mk-r-card);padding:16px;overflow-x:auto}
pre code{background:none;padding:0}
blockquote{margin:0 0 16px;padding:4px 16px;border-left:3px solid var(--mk-accent);background:var(--mk-surface);border-radius:0 var(--mk-r-inner) var(--mk-r-inner) 0;color:var(--mk-muted)}
table{width:100%;border-collapse:collapse;margin:0 0 20px;font-size:14px}
th,td{border:1px solid var(--mk-line);padding:8px 10px;text-align:left;vertical-align:top}
th{background:var(--mk-surface);font-family:var(--mk-font-head);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
ul,ol{margin:0 0 14px;padding-left:24px}
li{margin:4px 0}
hr{border:none;border-top:1px solid var(--mk-line);margin:32px 0}
.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px 24px;margin:0 0 12px;padding:16px;background:var(--mk-surface);border:1px solid var(--mk-line);border-radius:var(--mk-r-card)}
.meta-row{display:flex;flex-direction:column}
.meta-row dt{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--mk-muted);margin:0}
.meta-row dd{margin:2px 0 0;font-size:14px}
.meta-decision{margin:0 0 32px;padding:12px 16px;border:1px solid var(--mk-accent);border-radius:var(--mk-r-card);background:var(--mk-accent-tint,transparent);font-size:14px}
.source-path{font-size:12px;color:var(--mk-muted);margin:0 0 32px;font-family:var(--mk-font-mono)}
</style>
</head>
<body>
<div class="wrap">
<span class="genre-badge">${escapeHtml(genreLabel)}</span>
<h1>${escapeHtml(titleText)}</h1>
${renderMetadataHeader(metadata)}
<p class="source-path">Source: ${escapeHtml(sourcePath)}</p>
<hr>
${bodyHtml}
</div>
</body>
</html>
`
}
