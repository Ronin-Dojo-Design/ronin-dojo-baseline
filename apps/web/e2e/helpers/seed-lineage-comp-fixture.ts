import { execFileSync } from "node:child_process"

export type LineageCompTierState = "NONE" | "PREMIUM" | "ELITE"

export interface LineageCompSeedStudent {
  userId: string
  nodeId: string
  memberId: string
  rankId: string
  rankAwardId: string
  instructorUserId: string
  rankName: string
  displayName: string
  compTier: LineageCompTierState
}

export interface LineageCompSeedFixture {
  runId: string
  treeId: string
  treeSlug: string
  disciplineId: string
  rankSystemId: string
  rankIds: string[]
  instructorUserIds: string[]
  studentUserIds: string[]
  nodeIds: string[]
  memberIds: string[]
  rankAwardIds: string[]
  relationshipIds: string[]
  groupIds: string[]
  students: LineageCompSeedStudent[]
  premiumUserIds: string[]
  eliteUserIds: string[]
  createdEntitlementIds: string[]
}

export interface LineageCompSeedState {
  studentCountByInstructorAndRank: Record<string, Record<string, number>>
  compGrantCountByUserId: Record<string, number>
}

function runLineageCompFixtureCommand<T>(command: string, fixture?: LineageCompSeedFixture): T {
  const args = ["e2e/helpers/seed-lineage-comp-fixture-db.ts", command]

  if (fixture) {
    args.push(Buffer.from(JSON.stringify(fixture), "utf-8").toString("base64"))
  }

  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export async function seedLineageCompFixture(): Promise<LineageCompSeedFixture> {
  return runLineageCompFixtureCommand<LineageCompSeedFixture>("seed")
}

export async function readLineageCompFixtureState(
  fixture: LineageCompSeedFixture,
): Promise<LineageCompSeedState> {
  return runLineageCompFixtureCommand<LineageCompSeedState>("state", fixture)
}

export async function cleanupLineageCompFixture(fixture: LineageCompSeedFixture) {
  runLineageCompFixtureCommand<void>("cleanup", fixture)
}
