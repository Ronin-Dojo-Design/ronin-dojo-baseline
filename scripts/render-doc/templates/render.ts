/**
 * render.ts — genre dispatcher: routes a parsed doc to its template. Unknown genre never crashes
 * (falls through to `generic`, matching `detectGenre`'s own fallback).
 */

import type { ParsedDoc } from "../core/parse"
import { renderGeneric } from "./generic"
import { renderResearchReview } from "./research-review"
import { renderSopRitual } from "./sop-ritual"

export function renderDoc(doc: ParsedDoc, sourcePath: string): string {
  switch (doc.genre) {
    case "research-review":
      return renderResearchReview(doc, sourcePath)
    case "sop-ritual":
      return renderSopRitual(doc, sourcePath)
    default:
      return renderGeneric(doc, sourcePath)
  }
}
