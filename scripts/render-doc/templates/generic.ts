/**
 * generic.ts — fallback template for any doc that doesn't match a known genre. Never crashes;
 * renders the same shell with a neutral badge.
 */

import type { ParsedDoc } from "../core/parse"
import { renderShell } from "./layout"

export function renderGeneric(doc: ParsedDoc, sourcePath: string): string {
  return renderShell({
    title: doc.metadata.title ?? "Untitled document",
    genreLabel: "Document",
    metadata: doc.metadata,
    bodyHtml: doc.bodyHtml,
    sourcePath,
  })
}
