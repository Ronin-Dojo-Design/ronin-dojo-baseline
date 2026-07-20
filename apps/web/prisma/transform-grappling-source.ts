import * as fs from "node:fs"
import * as path from "node:path"
import * as vm from "node:vm"

/**
 * SESSION_0579 (G-022 Lane C) — one-shot transform: READ-ONLY monorepo curriculum source
 * (plain data-literal JS, no side effects) -> the two new prisma/data payload files this
 * lane's importer consumes.
 *
 * Sources (never written to):
 *   /Users/brianscott/dev/ronin-dojo-monorepo/src/brands/tuffbuffs/data/curriculum/bjj.js
 *   /Users/brianscott/dev/ronin-dojo-monorepo/src/brands/tuffbuffs/data/curriculum/judo.js
 *
 * Outputs (this repo, versioned):
 *   apps/web/prisma/data/bbl-bjj-curriculum.json   (full 98-technique / 5-populated-level trunk;
 *                                                    replaces the previous 80-technique subset)
 *   apps/web/prisma/data/bbl-judo-curriculum.json  (new; Kodokan Gokyo first-20-throws seed)
 *
 * How source loading works: the monorepo files are plain ESM object/array literals plus a
 * handful of pure helper functions (no I/O, no external imports besides one sibling
 * `ACCESS_LEVELS` constant). This script strips the `import`/`export` syntax and evaluates
 * the remaining source in an isolated `vm` sandbox that exposes NOTHING but a stubbed
 * `ACCESS_LEVELS` object -- no `require`, no `process`, no filesystem/network access from
 * inside the sandbox. Nothing is written back to the read-only monorepo.
 *
 * Usage:
 *   cd apps/web && bun run prisma/transform-grappling-source.ts
 */

const MONOREPO_ROOT = "/Users/brianscott/dev/ronin-dojo-monorepo"
const BJJ_SOURCE = path.join(MONOREPO_ROOT, "src/brands/tuffbuffs/data/curriculum/bjj.js")
const JUDO_SOURCE = path.join(MONOREPO_ROOT, "src/brands/tuffbuffs/data/curriculum/judo.js")

const OUT_DIR = path.join(__dirname, "data")
const BJJ_OUT = path.join(OUT_DIR, "bbl-bjj-curriculum.json")
const JUDO_OUT = path.join(OUT_DIR, "bbl-judo-curriculum.json")

const ACCESS_LEVELS_STUB = `
const ACCESS_LEVELS = {
  PUBLIC: "public",
  STUDENT: "student",
  MEMBER: "member",
  INSTRUCTOR: "instructor",
  ADMIN: "admin",
};
`

/**
 * Strips ESM import/export syntax from a monorepo curriculum data module and evaluates the
 * remainder in an isolated vm sandbox, returning the requested named bindings. The sandbox
 * exposes only `module`/`ACCESS_LEVELS` -- no Node builtins, no `require`.
 */
function loadMonorepoModule<T extends Record<string, unknown>>(
  sourcePath: string,
  exportNames: string[],
): T {
  const raw = fs.readFileSync(sourcePath, "utf8")
  const body = raw
    .replace(/^import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?\s*$/m, "")
    .replace(/^export\s+const\s+/gm, "const ")
    .replace(/^export\s+function\s+/gm, "function ")
    .replace(/^export\s+default\s+\{[\s\S]*$/m, "")

  const script = `${ACCESS_LEVELS_STUB}\n${body}\nmodule.exports = { ${exportNames.join(", ")} };`
  const sandboxModule: { exports: Record<string, unknown> } = { exports: {} }
  const context = vm.createContext({ module: sandboxModule })
  vm.runInContext(script, context, { filename: sourcePath })
  return sandboxModule.exports as T
}

// ---------------------------------------------------------------------------
// BJJ -- re-export the full 98-technique / 5-populated-level trunk as-is (the shape
// already matches the existing bbl-bjj-curriculum.json this replaces).
// ---------------------------------------------------------------------------

type BjjLevelBlock = {
  level: {
    id: number
    name: string
    color: string
    belt: string
    stripes: number
    estimatedMonths: number
  }
  sections: Array<{
    id: string
    name: string
    category: string
    techniques: Array<{
      id: string
      name: string
      category: string
      description?: string
      accessLevel?: string
      isRequired?: boolean
      keyPoints?: string[]
      tags?: string[]
    }>
  }>
}

function transformBjj() {
  const { allBJJLevels } = loadMonorepoModule<{ allBJJLevels: BjjLevelBlock[] }>(BJJ_SOURCE, [
    "allBJJLevels",
  ])

  const techniqueCount = allBJJLevels.reduce(
    (total, level) =>
      total + level.sections.reduce((sectionTotal, s) => sectionTotal + s.techniques.length, 0),
    0,
  )

  console.log(
    `[transform-grappling-source] bjj: ${allBJJLevels.length} levels, ${techniqueCount} techniques`,
  )

  fs.writeFileSync(BJJ_OUT, `${JSON.stringify({ levels: allBJJLevels }, null, 2)}\n`)
}

// ---------------------------------------------------------------------------
// Judo -- Kodokan Gokyo no Waza, first 20 throws. Re-shaped to a levels/sections/
// techniques payload (mirroring the BJJ shape) with nativeName/aliases carried through
// for the SESSION_0579-ratified additive Technique columns.
// ---------------------------------------------------------------------------

type JudoLevelBlock = {
  level: {
    id: number
    name: string
    color: string
    belt: string
    gokyo_group: string
    estimatedMonths: number
    description: string
  }
  sections: Array<{
    id: string
    name: string
    category: string
    techniques: Array<{
      canonical_id: string
      slug: string
      sequence_number: number
      technique_name: string
      japanese_name: string
      english_name: string
      aliases?: string[]
      gokyo_group: string
      subclass: string
      safety_level?: string
      requires_partner?: boolean
      accessLevel?: string
      isRequired?: boolean
      primary_use_cases?: string[]
      avoid_when?: string[]
      keyPoints?: string[]
      tags?: string[]
    }>
  }>
}

function transformJudo() {
  const { allJudoLevels } = loadMonorepoModule<{ allJudoLevels: JudoLevelBlock[] }>(JUDO_SOURCE, [
    "allJudoLevels",
  ])

  const payload = {
    levels: allJudoLevels.map(levelBlock => ({
      level: {
        id: levelBlock.level.id,
        name: levelBlock.level.name,
        color: levelBlock.level.color,
        belt: levelBlock.level.belt,
        gokyoGroup: levelBlock.level.gokyo_group,
        estimatedMonths: levelBlock.level.estimatedMonths,
        description: levelBlock.level.description,
      },
      sections: levelBlock.sections.map(section => ({
        id: section.id,
        name: section.name,
        category: section.category,
        techniques: section.techniques.map(t => ({
          id: t.canonical_id,
          slug: t.slug,
          name: t.technique_name,
          nativeName: t.japanese_name,
          englishName: t.english_name,
          aliases: t.aliases ?? [],
          gokyoGroup: t.gokyo_group,
          subclass: t.subclass,
          description: [...(t.primary_use_cases ?? [])].join("; "),
          avoidWhen: t.avoid_when ?? [],
          accessLevel: t.accessLevel ?? "public",
          isRequired: t.isRequired ?? false,
          keyPoints: t.keyPoints ?? [],
          tags: t.tags ?? [],
        })),
      })),
    })),
  }

  const techniqueCount = payload.levels.reduce(
    (total, level) =>
      total + level.sections.reduce((sectionTotal, s) => sectionTotal + s.techniques.length, 0),
    0,
  )

  console.log(
    `[transform-grappling-source] judo: ${payload.levels.length} levels, ${techniqueCount} throws`,
  )

  fs.writeFileSync(JUDO_OUT, `${JSON.stringify(payload, null, 2)}\n`)
}

transformBjj()
transformJudo()
