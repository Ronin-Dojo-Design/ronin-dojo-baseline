/**
 * parse.ts — the ONE pure parse core: raw file text -> doc model.
 *
 * No I/O, no template concerns — this is the seam the State-of-Dojo kernel pattern uses (a pure
 * parse core kept separate from rendering), applied here to the doc renderer. Everything downstream
 * (genre choice, template layout) consumes this model, never the raw text.
 */

import { detectGenre, type Genre } from "./genre"
import { renderMarkdown, firstHeading } from "./markdown"
import { extractMetadata, type DocMetadata } from "./metadata"
import { parseFrontmatter } from "./frontmatter"

export interface ParsedDoc {
  frontmatter: Record<string, string | string[]>
  bodyMarkdown: string
  bodyHtml: string
  metadata: DocMetadata
  genre: Genre
}

export function parseDoc(raw: string, filePath: string, genreOverride?: string): ParsedDoc {
  const { data: frontmatter, body: bodyMarkdown } = parseFrontmatter(raw)
  const metadata = extractMetadata(frontmatter, firstHeading(bodyMarkdown))
  const genre = detectGenre(frontmatter, filePath, genreOverride)
  const bodyHtml = renderMarkdown(bodyMarkdown)

  return { frontmatter, bodyMarkdown, bodyHtml, metadata, genre }
}
