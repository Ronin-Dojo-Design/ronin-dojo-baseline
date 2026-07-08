/**
 * Bow-out deferral guard (SESSION_0514).
 *
 * Catches the "we discussed it and it evaporated" failure: a deferred work item that lives
 * only in a SESSION file / memory note / recipe but was never written to a LEDGER — so the
 * bow-in read-path (`ledger-backlog.ts` → the `/app/loop-board` sync) never surfaces it and
 * it becomes invisible work. This is exactly how TICKET-0502-A vanished for ~11 sessions
 * (found SESSION_0513).
 *
 * The read-path doctrine: every deferral must resolve to a ledger row the read-path CONSUMES.
 * This scans a SESSION file for deferral-shaped lines and flags any that don't reference a
 * real ledger id (WL/FS/D/FI/MB/TFF/INC/RISK/GL/TD) that actually exists in a ledger file.
 *
 *   bun scripts/deferral-guard.ts                        # newest docs/sprints/SESSION_NNNN.md
 *   bun scripts/deferral-guard.ts docs/sprints/SESSION_0502.md
 *
 * Exit 1 if any un-ledgered deferral is found (so the closing ritual gates on it), else 0.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { type FileLedgerCode, LEDGER_FILES } from "../apps/web/lib/loop-board/ledger-parse"

const ROOT = resolve(import.meta.dir, "..")

// --- resolve the SESSION file to scan (arg, else newest) ---
const arg = process.argv[2]
const SPRINTS = resolve(ROOT, "docs/sprints")
const newestSession = (): string => {
  const files = readdirSync(SPRINTS)
    .filter(f => /^SESSION_\d+\.md$/.test(f))
    .sort()
  if (files.length === 0) throw new Error("no SESSION_NNNN.md files found")
  return resolve(SPRINTS, files[files.length - 1])
}
const sessionPath = arg ? resolve(ROOT, arg) : newestSession()
if (!existsSync(sessionPath)) throw new Error(`session file not found: ${sessionPath}`)

// --- concatenate every ledger the read-path reads; a deferral "resolves" when it names an id
//     that appears verbatim here (so a made-up "TICKET-0502-A" no ledger row backs still fails) ---
const ledgerBlob = (Object.keys(LEDGER_FILES) as FileLedgerCode[])
  .map(code => {
    const p = resolve(ROOT, LEDGER_FILES[code])
    return existsSync(p) ? readFileSync(p, "utf8") : ""
  })
  .join("\n")

// Tracked ledger-id shapes (the unambiguous prefixes) + RISK's `#N`.
const LEDGER_ID_RE =
  /\b(?:WL-P\d+-\d+|FS-\d{2,4}|D-\d{2,4}|FI-\d{2,4}|MB-\d{2,4}|TFF-\d{2,4}|INC-[\w-]+|G-\d{2,4}|TD-\d{2,4})\b|RISK\s*#?\d+/g

// High-signal future-work language (deliberately NOT "out of scope" — that's usually a
// scope-guard boundary, not a deferred trackable item).
const DEFERRAL_RE =
  /\b(?:deferred?|defer to|follow[-\s]?up|fast[-\s]?follow|(?:next|later|separate|own|its own)\s+slice|TICKET-[\w-]+|punt(?:ed)?|revisit|left for later|for a later\b|not folded in)\b/i

// Skip pure scope-guard negatives ("Do NOT …") and anything under a `Scope guard` heading.
const SCOPE_GUARD_LINE_RE = /^\s*[-*]?\s*(?:Do NOT|Don'?t|Never)\b/i

const lines = readFileSync(sessionPath, "utf8").split("\n")
type Flag = { line: number; text: string; ids: string[] }
const flags: Flag[] = []
let inScopeGuard = false
let inFence = false
let backed = 0

lines.forEach((raw, i) => {
  const line = raw.trim()
  if (/^```/.test(line)) {
    inFence = !inFence
    return
  }
  if (inFence) return // don't lint embedded code / pasted prompts
  if (/^#+\s*Scope guard/i.test(line)) inScopeGuard = true
  else if (/^#+\s/.test(line)) inScopeGuard = false

  if (!DEFERRAL_RE.test(line)) return
  if (SCOPE_GUARD_LINE_RE.test(line) || inScopeGuard) return

  // Resolve ids from a ±1-line window: prose wraps, so a deferral's ledger id often sits on the
  // immediately adjacent line. Kept tight (NOT the whole paragraph) so an *unrelated* id elsewhere
  // can't falsely "back" a real miss — the guard must never under-report a deferral.
  const windowText = `${lines[i - 1] ?? ""} ${raw} ${lines[i + 1] ?? ""}`
  const ids = windowText.match(LEDGER_ID_RE) ?? []
  const resolved = ids.filter(id => ledgerBlob.includes(id))
  if (resolved.length > 0) backed++
  else flags.push({ line: i + 1, text: line, ids })
})

// --- report ---
const rel = sessionPath.replace(`${ROOT}/`, "")
if (flags.length === 0) {
  console.log(`✓ deferral-guard: ${rel} — every deferral is backed by a tracked ledger row (${backed} checked).`)
  process.exit(0)
}
console.log(`\n✗ deferral-guard: ${flags.length} un-ledgered deferral(s) in ${rel} (${backed} backed):\n`)
for (const f of flags) {
  const clipped = f.text.length > 160 ? `${f.text.slice(0, 160)}…` : f.text
  const why = f.ids.length > 0 ? `ids (${f.ids.join(", ")}) resolve to NO ledger row` : "no ledger id referenced"
  console.log(`  L${f.line}: ${clipped}\n        → ${why}. Add a WL/FS/D/… row, or dismiss if it's a scope note.\n`)
}
console.log(
  "  Fix: write each real deferral to a ledger (docs/knowledge/wiki/*, failed-steps-log, …) so\n" +
    "  ledger-backlog.ts + the loop-board sync surface it at the next bow-in (read-path doctrine).\n",
)
process.exit(1)
