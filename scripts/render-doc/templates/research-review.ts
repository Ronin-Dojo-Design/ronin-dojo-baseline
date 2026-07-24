/**
 * research-review.ts — genre template for `type: research-review` docs (decision briefs).
 */

import type { ParsedDoc } from "../core/parse"
import { renderShell } from "./layout"

export function renderResearchReview(doc: ParsedDoc, sourcePath: string): string {
  return renderShell({
    title: doc.metadata.title ?? "Untitled research review",
    genreLabel: "Research Review",
    metadata: doc.metadata,
    bodyHtml: doc.bodyHtml,
    sourcePath,
  })
}
