// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, test } from "bun:test"
import {
  buildCookbookEntries,
  classifyRecipeStage,
  extractRecipePaths,
  frontmatterList,
  parseRecipeFrontmatter,
  parseRouterRows,
} from "./cookbook-parse"

describe("frontmatterList", () => {
  const doc = [
    "---",
    'title: "Recipe — Lane"',
    "slug: recipe-lane",
    "tags:",
    "  - governance",
    "  - orchestration",
    "  - recipe",
    "pairs_with:",
    "  - docs/protocols/fan-out-session-recipe.md",
    "  - docs/protocols/cody-preflight.md",
    "backlinks:",
    "  - docs/protocols/SOT_Cookbook.md",
    "---",
    "",
    "# body",
  ].join("\n")

  test("reads a block-style list field", () => {
    expect(frontmatterList(doc, "tags")).toEqual(["governance", "orchestration", "recipe"])
    expect(frontmatterList(doc, "pairs_with")).toEqual([
      "docs/protocols/fan-out-session-recipe.md",
      "docs/protocols/cody-preflight.md",
    ])
  })

  test("returns [] for a missing key or no frontmatter block", () => {
    expect(frontmatterList(doc, "nope")).toEqual([])
    expect(frontmatterList("# just a doc\n", "tags")).toEqual([])
  })

  test("a list at the end of the frontmatter block still terminates cleanly", () => {
    const trailing = ["---", "title: x", "slug: y", "tags:", "  - a", "  - b", "---"].join("\n")
    expect(frontmatterList(trailing, "tags")).toEqual(["a", "b"])
  })
})

describe("parseRecipeFrontmatter", () => {
  test("extracts title/slug/tags/pairs_with", () => {
    const content = [
      "---",
      'title: "Recipe — Merge Wave (the G0→G4 gate ladder)"',
      "slug: recipe-merge-wave",
      "tags:",
      "  - governance",
      "  - git",
      "  - merge",
      "pairs_with:",
      "  - docs/protocols/giddy-merge-strategy.md",
      "---",
    ].join("\n")
    expect(parseRecipeFrontmatter("docs/protocols/recipes/merge-wave.md", content)).toEqual({
      path: "docs/protocols/recipes/merge-wave.md",
      slug: "recipe-merge-wave",
      title: "Recipe — Merge Wave (the G0→G4 gate ladder)",
      tags: ["governance", "git", "merge"],
      pairsWith: ["docs/protocols/giddy-merge-strategy.md"],
    })
  })

  test("returns null when title or slug is missing", () => {
    expect(parseRecipeFrontmatter("x.md", "---\nslug: y\n---")).toBeNull()
    expect(parseRecipeFrontmatter("x.md", "# no frontmatter")).toBeNull()
  })
})

describe("classifyRecipeStage", () => {
  // Real slugs/tags/titles from docs/protocols/recipes/*.md (SESSION_0607) — regression-pins the
  // curated slug+tags keyword table against every card that existed at build time.
  const cases: Array<{ slug: string; tags: string[]; title: string; stage: string }> = [
    {
      slug: "recipe-am-coffee-merge-review",
      tags: ["governance", "orchestration", "recipe", "overnight"],
      title: "Recipe — AM Coffee Merge Review (morning sweep of an overnight fan-out)",
      stage: "review",
    },
    {
      slug: "recipe-pm-planning-lane",
      tags: ["governance", "orchestration", "recipe", "overnight"],
      title: "Recipe — PM Planning Lane (evening staging for an unattended overnight fan-out)",
      stage: "plan",
    },
    {
      slug: "recipe-desi-design-review",
      tags: ["governance", "design", "recipe"],
      title: "Recipe — Desi Design Review (cross-brand consistency + reuse pass)",
      stage: "review",
    },
    {
      slug: "recipe-epic-plan",
      tags: ["governance", "orchestration", "recipe", "planning"],
      title: "Recipe — Epic Plan (decompose a multi-slice epic into lanes)",
      stage: "plan",
    },
    {
      slug: "recipe-lane",
      tags: ["governance", "orchestration", "recipe"],
      title: "Recipe — Lane (single worktree build lane)",
      stage: "build",
    },
    {
      slug: "recipe-live-fanout-sweep",
      tags: ["governance", "orchestration", "recipe", "fanout"],
      title:
        "Recipe — Live Fanout Sweep (one attended session: dispatch → review → merge N disjoint lanes)",
      stage: "build",
    },
    {
      slug: "recipe-merge-wave",
      tags: ["governance", "git", "merge", "commit-gate", "recipe"],
      title: "Recipe — Merge Wave (the G0→G4 gate ladder)",
      stage: "ship",
    },
    {
      slug: "recipe-mobile-optimization-pass",
      tags: ["governance", "design", "mobile", "recipe"],
      title: "Recipe — Mobile Optimization Pass (responsive / touch / mobile-first)",
      stage: "review",
    },
    {
      slug: "recipe-new-brand-intake",
      tags: ["governance", "onboarding", "recipe"],
      title: "Recipe — New-Brand Intake (requirements → brief)",
      stage: "plan",
    },
    {
      slug: "recipe-new-brand-interview-business",
      tags: ["governance", "brand", "recipe", "onboarding"],
      title: "Recipe — New-Brand Business Interview (model/revenue/modules, Brandon-owned)",
      stage: "plan",
    },
    {
      slug: "recipe-new-brand-onboarding",
      tags: ["governance", "onboarding", "recipe", "deploy"],
      title: "Recipe — New-Brand Onboarding (scaffold + DB + deploy + email)",
      stage: "build",
    },
    {
      slug: "recipe-new-brand-setup",
      tags: ["governance", "orchestration"],
      title: "Recipe — New-Brand Setup (stand up a new brand/client app: the parent plan card)",
      stage: "plan",
    },
    {
      slug: "recipe-orchestrator",
      tags: ["governance", "orchestration", "recipe"],
      title: "Recipe — Orchestrator (dispatch + babysit N parallel lanes)",
      stage: "build",
    },
    {
      slug: "recipe-quality-suite",
      tags: ["governance", "quality", "recipe", "review"],
      title: "Recipe — Quality Suite (merged-trunk code-quality pass)",
      stage: "review",
    },
    {
      slug: "recipe-review-wave",
      tags: ["governance", "orchestration", "recipe", "review"],
      title: "Recipe — Review Wave (parallel Doug + Desi + Giddy on one commit)",
      stage: "review",
    },
    {
      slug: "recipe-ui-ux-pass",
      tags: ["governance", "design", "ux", "a11y"],
      title: "Recipe — UI/UX Pass (hierarchy / friction / accessibility)",
      stage: "review",
    },
  ]

  for (const c of cases) {
    test(`${c.slug} -> ${c.stage}`, () => {
      expect(classifyRecipeStage(c)).toBe(c.stage)
    })
  }

  test("an unrecognized slug/tags falls back to title/content, then defaults to build", () => {
    expect(
      classifyRecipeStage({ slug: "recipe-mystery", tags: [], title: "does a research pass" }),
    ).toBe("idea")
    expect(
      classifyRecipeStage({ slug: "recipe-mystery", tags: [], title: "totally unrelated" }),
    ).toBe("build")
  })
})

describe("extractRecipePaths", () => {
  test("resolves a same-dir recipes/ link", () => {
    expect(extractRecipePaths("[recipes/lane.md](recipes/lane.md)")).toEqual([
      "docs/protocols/recipes/lane.md",
    ])
  })

  test("ignores links to skills/protocols outside recipes/", () => {
    const run =
      "**Cody** + [`seq-lane-build`](../../.claude/skills/seq-lane-build/SKILL.md) or [`recipes/lane.md`](recipes/lane.md)"
    expect(extractRecipePaths(run)).toEqual(["docs/protocols/recipes/lane.md"])
  })

  test("collects multiple recipe links from one cell", () => {
    const run =
      "[`recipes/new-brand-setup.md`](recipes/new-brand-setup.md) → [intake](recipes/new-brand-intake.md)"
    expect(extractRecipePaths(run)).toEqual([
      "docs/protocols/recipes/new-brand-setup.md",
      "docs/protocols/recipes/new-brand-intake.md",
    ])
  })

  test("a row with no markdown links returns []", () => {
    expect(extractRecipePaths("`hostile-repo-review`")).toEqual([])
  })
})

describe("parseRouterRows", () => {
  const fixture = [
    "# SOT Cookbook",
    "",
    "## The router",
    "",
    "| When the task is… | Run | Why |",
    "| --- | --- | --- |",
    "| Build a feature against a clear plan | **Cody** + [`cody-preflight`](cody-preflight.md) | reuse-first |",
    "| A worktree build lane inside a fan-out | **Cody** + [`recipes/lane.md`](recipes/lane.md) | the invariant lane sequence |",
    "| Repo feels heavy / duplicated / drifting | `hostile-repo-review` | the repo-wide lean-out |",
    "",
    "## Next section",
    "",
    "| unrelated | table | here |",
  ].join("\n")

  const rows = parseRouterRows(fixture)

  test("parses only the router table, stopping before the next heading", () => {
    expect(rows).toHaveLength(3)
  })

  test("extracts when/run/why per row", () => {
    expect(rows[0]).toMatchObject({
      when: "Build a feature against a clear plan",
      why: "reuse-first",
    })
  })

  test("resolves recipe links out of the Run cell; non-link rows get []", () => {
    expect(rows[0].recipePaths).toEqual([]) // links to cody-preflight.md, not under recipes/
    expect(rows[1].recipePaths).toEqual(["docs/protocols/recipes/lane.md"])
    expect(rows[2].recipePaths).toEqual([])
  })
})

describe("buildCookbookEntries", () => {
  const cards = [
    {
      path: "docs/protocols/recipes/lane.md",
      slug: "recipe-lane",
      title: "Recipe — Lane (single worktree build lane)",
      tags: ["governance", "orchestration", "recipe"],
      pairsWith: [],
    },
    {
      path: "docs/protocols/recipes/merge-wave.md",
      slug: "recipe-merge-wave",
      title: "Recipe — Merge Wave (the G0→G4 gate ladder)",
      tags: ["governance", "git", "merge"],
      pairsWith: [],
    },
  ]
  const rows = [
    {
      when: "A worktree build lane inside a fan-out",
      run: "[`recipes/lane.md`](recipes/lane.md)",
      why: "the invariant lane sequence",
      recipePaths: ["docs/protocols/recipes/lane.md"],
    },
  ]

  const entries = buildCookbookEntries(cards, rows)

  test("every card becomes one entry, sorted by title", () => {
    expect(entries.map(e => e.slug)).toEqual(["recipe-lane", "recipe-merge-wave"])
  })

  test("a card linked from a router row is enriched with when/why", () => {
    const lane = entries.find(e => e.slug === "recipe-lane")
    expect(lane?.when).toBe("A worktree build lane inside a fan-out")
    expect(lane?.why).toBe("the invariant lane sequence")
    expect(lane?.stage).toBe("build")
  })

  test("a card with no linking row still renders, when/why unset", () => {
    const mergeWave = entries.find(e => e.slug === "recipe-merge-wave")
    expect(mergeWave?.when).toBeUndefined()
    expect(mergeWave?.why).toBeUndefined()
    expect(mergeWave?.stage).toBe("ship")
  })
})
