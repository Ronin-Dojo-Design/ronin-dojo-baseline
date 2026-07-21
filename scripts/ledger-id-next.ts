#!/usr/bin/env bun
/**
 * ledger-id-next.ts
 *
 * FS-0030 mechanization (docs/protocols/failed-steps-log.md) — the ledger-ID allocator.
 * FS-0030's incident: new ledger IDs were numbered by tail-reading the visually-adjacent
 * table block, colliding twice in one session with IDs already used elsewhere in the docs
 * tree. The corrective rule ("grep the FULL ID space before assigning") was manual; this
 * script is the mechanization. Read-only — scans docs/, prints advice, never writes.
 *
 * Usage:
 *   bun scripts/ledger-id-next.ts --prefix=FI      # first free FI-NNN across the whole docs tree
 *   bun scripts/ledger-id-next.ts --prefix=WL-P2   # WL uses per-priority spaces (WL-P1/P2/P3)
 *   bun scripts/ledger-id-next.ts --check          # flag IDs *defined* in >1 place (dup detector)
 *   bun scripts/ledger-id-next.ts --json           # machine-readable output for either mode
 *
 * "Next free" = max(used)+1 over every occurrence (references count — an ID that is only
 * referenced is still taken), archives included. The duplicate check looks only at
 * DEFINITION sites — an `ID —` em-dash heading (the ledger convention) or a table row whose
 * first cell is the ID — and excludes append-only history that legitimately restates rows
 * (docs/_archive/, docs/sprints/, the frozen baseline systems pack). It also reports PHANTOM
 * references: IDs cited somewhere in docs/ but defined nowhere (e.g. the FS-0342/FS-0186
 * sprint citations with no failed-steps-log entry) — informational, not a failure.
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const DOCS = resolve(ROOT, "docs");
const ARGS = process.argv.slice(2);
const JSON_OUT = ARGS.includes("--json");
const CHECK = ARGS.includes("--check");
const PREFIX = (ARGS.find((a) => a.startsWith("--prefix=")) ?? "").split("=")[1]?.toUpperCase();

// The grep-assigned ledger ID spaces (llm-wiki-schema / loop-of-loops). ADR/LR numbers come
// from filenames, not doc greps, so they are out of scope here. SESSION numbers get their own
// filename+ref mode below (--prefix=SESSION, ADR 0049). RISK uses bare `#N` — too generic to
// grep safely — and stays manual.
const PREFIXES = [
  "G",
  "FS",
  "D",
  "FI",
  "MB",
  "TFF",
  "INC",
  "TD",
  "WL-P1",
  "WL-P2",
  "WL-P3",
  // Intake ledgers (SESSION_0589 created the files, 0591 wired the aggregator/guard/router; 0597
  // completes the wiring by teaching the id-minter these prefixes so PL/RLL/YLL/GPTLL/DBS ids are
  // minted via FS-0030 instead of by tail-reading the table).
  "PL",
  "RLL",
  "YLL",
  "GPTLL",
  "DBS",
] as const;

function walkMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMarkdown(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const FILES = walkMarkdown(DOCS).map((p) => ({
  path: p,
  rel: relative(ROOT, p),
  text: readFileSync(p, "utf-8"),
}));

/**
 * Every number in use for a prefix, across all occurrences (references included, archives
 * included). The trailing `(?!-\d)` excludes composite session-scoped IDs like `D-0407-1` or
 * `D-0515-01` (a per-session local drift note, `<PREFIX>-<SESSION_NNNN>-<local index>` — a
 * DIFFERENT ID scheme from the global ledger) — D-049 (SESSION_0582/0584): without this, the
 * "D" scan matched `D-0407` out of `D-0407-1` and inflated the reported max by hundreds.
 */
function usedNumbers(prefix: string): { numbers: Set<number>; padWidth: number } {
  const re = new RegExp(`\\b${prefix.replaceAll("-", "\\-")}-(\\d+)\\b(?!-\\d)`, "g");
  const numbers = new Set<number>();
  const padCounts = new Map<number, number>();
  for (const f of FILES) {
    for (const m of f.text.matchAll(re)) {
      const digits = m[1] as string;
      numbers.add(Number.parseInt(digits, 10));
      padCounts.set(digits.length, (padCounts.get(digits.length) ?? 0) + 1);
    }
  }
  const padWidth = [...padCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 3;
  return { numbers, padWidth };
}

/**
 * The one canonical ledger file each prefix's "real" IDs are defined in — used ONLY for the
 * D-049 self-check below (mint-scan max vs register-truth max), never for the mint itself.
 */
const LEDGER_FILE: Partial<Record<string, string>> = {
  G: "knowledge/wiki/goals-ledger.md",
  FS: "protocols/failed-steps-log.md",
  D: "knowledge/wiki/drift-register.md",
  FI: "product/black-belt-legacy/POST_LAUNCH_SOT.md",
  MB: "knowledge/wiki/manual-boundary-registry.md",
  TFF: "knowledge/wiki/test-fail-fix-ledger.md",
  INC: "knowledge/wiki/incidents.md",
  TD: "knowledge/wiki/teardown-ledger.md",
  "WL-P1": "knowledge/wiki/wiring-ledger.md",
  "WL-P2": "knowledge/wiki/wiring-ledger.md",
  "WL-P3": "knowledge/wiki/wiring-ledger.md",
  PL: "knowledge/wiki/planning-ledger.md",
  RLL: "knowledge/wiki/reddit-links-ledger.md",
  YLL: "knowledge/wiki/youtube-links-ledger.md",
  GPTLL: "knowledge/wiki/chatgpt-links-ledger.md",
  DBS: "knowledge/wiki/daily-bug-scan-ledger.md",
};

/** Max ID actually DEFINED (heading or table-row, per `definitionSites`' convention) in one file. */
function ledgerDefinedMax(prefix: string, rel: string): number {
  const abs = join(DOCS, rel);
  if (!existsSync(abs)) return 0;
  const text = readFileSync(abs, "utf-8");
  const escaped = prefix.replaceAll("-", "\\-");
  const headingRe = new RegExp(`^#{1,6}\\s+\`?\\*{0,2}${escaped}-(\\d+)\\*{0,2}\`?\\s+—`, "gm");
  const rowRe = new RegExp(`^\\|\\s*\`?\\*{0,2}${escaped}-(\\d+)\\*{0,2}\`?\\s*\\|`, "gm");
  const nums: number[] = [];
  for (const m of text.matchAll(headingRe)) nums.push(Number.parseInt(m[1] as string, 10));
  for (const m of text.matchAll(rowRe)) nums.push(Number.parseInt(m[1] as string, 10));
  return nums.length === 0 ? 0 : Math.max(...nums);
}

/**
 * Definition sites for a full ID: an `ID —` em-dash heading (ledger convention: `### FS-0030 — …`,
 * `#### MB-003 — …`) or a table row with the ID as its first cell (`| WL-P2-9 |`, `| FI-020 |`).
 * A heading that merely *mentions* the ID (`### FI-019 design implication`) is a reference.
 */
function definitionSites(prefix: string, n: number, text: string, rel: string): string[] {
  const sites: string[] = [];
  // `0*` mirrors the FS-0030 grep rule — `WL-P2-6` and `WL-P2-06` are the same ID.
  const escaped = `${prefix.replaceAll("-", "\\-")}-0*${n}(?!\\d)`;
  const headingRe = new RegExp(`^#{1,6}\\s+\`?\\*{0,2}${escaped}\\*{0,2}\`?\\s+—`);
  const rowRe = new RegExp(`^\\|\\s*\`?\\*{0,2}${escaped}\\*{0,2}\`?\\s*\\|`);
  text.split("\n").forEach((line, i) => {
    if (headingRe.test(line) || rowRe.test(line)) sites.push(`${rel}:${i + 1}`);
  });
  return sites;
}

/** Append-only history that legitimately restates ledger rows — excluded from the dup check. */
const HISTORY_PREFIXES = [
  "docs/_archive/",
  "docs/sprints/",
  "docs/ronin_dojo_baseline_systems_pack/",
];

if (CHECK) {
  const liveFiles = FILES.filter((f) => !HISTORY_PREFIXES.some((p) => f.rel.startsWith(p)));
  const dupes: { id: string; sites: string[] }[] = [];
  const phantoms: string[] = [];
  for (const prefix of PREFIXES) {
    const { numbers, padWidth } = usedNumbers(prefix);
    for (const n of numbers) {
      const id = `${prefix}-${String(n).padStart(padWidth, "0")}`;
      const sites = liveFiles.flatMap((f) => definitionSites(prefix, n, f.text, f.rel));
      if (sites.length > 1) dupes.push({ id, sites });
      // Phantom = referenced somewhere yet defined NOWHERE, history included.
      if (
        sites.length === 0 &&
        !FILES.some((f) => definitionSites(prefix, n, f.text, f.rel).length > 0)
      ) {
        phantoms.push(id);
      }
    }
  }
  dupes.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  phantoms.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (JSON_OUT) {
    console.log(JSON.stringify({ dupes, phantoms }, null, 2));
  } else {
    if (dupes.length === 0) {
      console.log("\n  No ledger ID is defined in more than one place (history excluded). Clean.");
    } else {
      console.log(
        `\n  ${dupes.length} ledger ID(s) defined in more than one place (FS-0030 class):\n`,
      );
      for (const d of dupes) {
        console.log(`  ${d.id}`);
        for (const s of d.sites) console.log(`    ${s}`);
      }
      console.log(
        "\n  Each ID must have ONE defining row/heading; every other mention is a reference.",
      );
    }
    if (phantoms.length > 0) {
      console.log(
        `\n  ${phantoms.length} phantom ID(s) — referenced in docs/ but defined nowhere (informational):`,
      );
      console.log(`  ${phantoms.join(", ")}`);
      console.log(
        "  These numbers stay retired (next-free skips past them); fix the citing doc only if it misleads.",
      );
    }
    console.log("");
  }
  process.exit(dupes.length === 0 ? 0 : 1);
}

if (!PREFIX) {
  console.error(
    `Usage: bun scripts/ledger-id-next.ts --prefix=<${PREFIXES.join("|")}|SESSION> | --check [--json]`,
  );
  process.exit(2);
}

/**
 * ADR 0049 session-number mint. SESSION numbers come from filenames + git refs, never doc greps:
 * parallel worktrees claim numbers invisibly in their own docs trees, but the shared ref
 * namespace is a registry every checkout sees pre-merge. "Claimed" = the union of
 *   (a) docs/sprints/SESSION_NNNN.md in THIS checkout (committed or not),
 *   (b) docs/sprints/ of every mounted worktree (git worktree list),
 *   (c) NNNN parsed from session-* branch names — the bow-in/reservation branch IS the claim.
 * Gap numbers are retired, never recycled.
 */
if (PREFIX === "SESSION") {
  const numbers = new Set<number>();
  const addFromSprints = (dir: string) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const m = name.match(/^SESSION_(\d{4})\.md$/);
      if (m) numbers.add(Number.parseInt(m[1] as string, 10));
    }
  };
  addFromSprints(join(ROOT, "docs", "sprints"));
  try {
    const worktrees = execSync("git worktree list --porcelain", { cwd: ROOT, encoding: "utf-8" })
      .split("\n")
      .filter((l) => l.startsWith("worktree "))
      .map((l) => l.slice("worktree ".length));
    for (const wt of worktrees) {
      if (resolve(wt) === ROOT) continue;
      addFromSprints(join(wt, "docs", "sprints"));
    }
    const branches = execSync("git branch --list --format='%(refname:short)'", {
      cwd: ROOT,
      encoding: "utf-8",
    })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const b of branches) {
      const m = b.match(/^session-(\d{4})(?:\D|$)/);
      if (m) numbers.add(Number.parseInt(m[1] as string, 10));
    }
  } catch {
    // Not a git checkout — the filename scan of (a) stands alone.
  }
  const max = numbers.size === 0 ? 0 : Math.max(...numbers);
  const nextNum = String(max + 1).padStart(4, "0");
  if (JSON_OUT) {
    console.log(
      JSON.stringify({ prefix: "SESSION", used: numbers.size, max, next: `SESSION_${nextNum}` }),
    );
  } else {
    console.log(
      `\n  SESSION: ${numbers.size} number(s) claimed across checkout + worktrees + session-* branches, highest SESSION_${String(max).padStart(4, "0")}.`,
    );
    console.log(
      `  Next free: SESSION_${nextNum} — claim it by creating branch session-${nextNum}-<lane-slug> (reservations too); gaps stay burned.\n`,
    );
  }
  process.exit(0);
}

if (!(PREFIXES as readonly string[]).includes(PREFIX)) {
  console.error(
    `Unknown prefix "${PREFIX}". Known: ${PREFIXES.join(", ")}, SESSION (RISK is manual — bare #N is too generic to grep).`,
  );
  process.exit(2);
}

const { numbers, padWidth } = usedNumbers(PREFIX);
const max = numbers.size === 0 ? 0 : Math.max(...numbers);
const next = `${PREFIX}-${String(max + 1).padStart(padWidth, "0")}`;

// D-049 self-check: mint-scan max vs the canonical ledger's DEFINED max. A gap > 50 means the
// reference-scan almost certainly picked up a phantom (meta-commentary text, an ID scheme this
// script doesn't know about, etc.) — warn and recommend register-truth instead of blind trust.
const ledgerRel = LEDGER_FILE[PREFIX];
let gapWarning: string | null = null;
let safeNext: string | null = null;
if (ledgerRel) {
  const registerMax = ledgerDefinedMax(PREFIX, ledgerRel);
  const gap = max - registerMax;
  if (gap > 50) {
    safeNext = `${PREFIX}-${String(registerMax + 1).padStart(padWidth, "0")}`;
    gapWarning = `mint-scan max ${PREFIX}-${max} is ${gap} ahead of ${ledgerRel}'s defined max ${PREFIX}-${registerMax} — likely a phantom match (composite session-scoped IDs, or prose mentioning a number), NOT a real backlog. Recommended next free (register-truth): ${safeNext}.`;
  }
}

if (JSON_OUT) {
  console.log(
    JSON.stringify({ prefix: PREFIX, used: numbers.size, max, next, gapWarning, safeNext }),
  );
} else {
  console.log(
    `\n  ${PREFIX}: ${numbers.size} number(s) in use, highest ${PREFIX}-${String(max).padStart(padWidth, "0")}.`,
  );
  console.log(`  Next free ID: ${next}`);
  console.log(
    `  (max+1 over every occurrence in docs/ incl. archives — gap numbers are retired, never reuse them.)`,
  );
  if (gapWarning) {
    console.log(`\n  ⚠ SELF-CHECK: ${gapWarning}\n`);
  } else {
    console.log("");
  }
}
