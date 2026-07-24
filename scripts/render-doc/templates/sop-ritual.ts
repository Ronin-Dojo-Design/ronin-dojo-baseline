/**
 * sop-ritual.ts — genre template covering SOPs, rituals, and workflows (procedural docs).
 */

import type { ParsedDoc } from "../core/parse"
import { renderShell } from "./layout"

export function renderSopRitual(doc: ParsedDoc, sourcePath: string): string {
  return renderShell({
    title: doc.metadata.title ?? "Untitled SOP",
    genreLabel: "SOP / Ritual",
    metadata: doc.metadata,
    bodyHtml: doc.bodyHtml,
    sourcePath,
  })
}
