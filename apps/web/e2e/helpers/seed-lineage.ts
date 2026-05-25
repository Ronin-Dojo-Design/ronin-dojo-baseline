import { execFileSync } from "node:child_process"

export interface LineageVisibilityFixture {
  treeId: string
  treeSlug: string
  treeName: string
  searchToken: string
  publicName: string
  hiddenNames: {
    unlisted: string
    restricted: string
    private: string
  }
  hiddenGroupLabels: {
    unlisted: string
    restricted: string
    private: string
  }
  userIds: string[]
  nodeIds: string[]
  memberIds: string[]
  groupIds: string[]
}

export async function seedLineageVisibilityFixture(): Promise<LineageVisibilityFixture> {
  const rawFixture = execFileSync("bun", ["e2e/helpers/seed-lineage-db.ts", "seed"], {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return JSON.parse(rawFixture) as LineageVisibilityFixture
}

export async function cleanupLineageVisibilityFixture(fixture: LineageVisibilityFixture) {
  const encodedFixture = Buffer.from(JSON.stringify(fixture), "utf-8").toString("base64")

  execFileSync("bun", ["e2e/helpers/seed-lineage-db.ts", "cleanup", encodedFixture], {
    cwd: process.cwd(),
    encoding: "utf-8",
  })
}
