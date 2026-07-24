/**
 * markdown.ts — markdown body -> HTML.
 *
 * Uses `marked` (already a root devDependency, bun.lock-verified) rather than hand-rolling a
 * renderer — headings/paragraphs/lists/code-fences/links/tables/blockquotes all work out of the
 * box via marked's GFM-on-by-default lexer.
 */

import { marked } from "marked"

marked.setOptions({ gfm: true, breaks: false })

export function renderMarkdown(bodyMarkdown: string): string {
  return marked.parse(bodyMarkdown, { async: false }) as string
}

/** First `# Heading` in the raw markdown body, if any — used as a title fallback. */
export function firstHeading(bodyMarkdown: string): string | undefined {
  const match = bodyMarkdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : undefined
}
